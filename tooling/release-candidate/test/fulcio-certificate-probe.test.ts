import { createPublicKey, verify } from 'node:crypto';
import { expect, it, vi } from 'vitest';

import { assertCertificateDispatch, issueProbeLeaf } from '../src/fulcio-certificate-probe.ts';

const commit = 'a'.repeat(40);
const env = {
  GITHUB_ACTIONS: 'true',
  GITHUB_SERVER_URL: 'https://github.com',
  GITHUB_REPOSITORY: 'Actesis/Wayglass',
  GITHUB_REF: 'refs/heads/main',
  GITHUB_WORKFLOW_REF:
    'Actesis/Wayglass/.github/workflows/initial-release-signing.yml@refs/heads/main',
  GITHUB_EVENT_NAME: 'workflow_dispatch',
  RUNNER_ENVIRONMENT: 'github-hosted',
  GITHUB_SHA: commit,
  GITHUB_WORKFLOW_SHA: commit,
  GITHUB_RUN_ID: '42',
  GITHUB_RUN_ATTEMPT: '1',
  CERTIFICATE_PROBE_COMMIT: commit,
};

it('requires the exact approved revision and refuses a GitHub rerun', () => {
  expect(assertCertificateDispatch(env).commit).toBe(commit);
  expect(() => assertCertificateDispatch({ ...env, CERTIFICATE_PROBE_COMMIT: '' })).toThrow();
  expect(() => assertCertificateDispatch({ ...env, GITHUB_RUN_ATTEMPT: '2' })).toThrow();
});

it('makes one no-redirect request with proof over only the subject and does not retry', async () => {
  const sub = 'synthetic-subject';
  const token = `header.${Buffer.from(JSON.stringify({ sub })).toString('base64url')}.signature`;
  const transport = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 }));
  await expect(issueProbeLeaf(token, transport)).rejects.toThrow('did not return success');
  expect(transport).toHaveBeenCalledTimes(1);
  const [url, init] = transport.mock.calls[0]!;
  expect(url).toBe('https://fulcio.sigstore.dev/api/v2/signingCert');
  expect(init).toMatchObject({ method: 'POST', redirect: 'error' });
  const body = JSON.parse(String(init?.body));
  expect(body.credentials.oidcIdentityToken).toBe(token);
  expect(
    verify(
      'sha256',
      Buffer.from(sub),
      createPublicKey(body.publicKeyRequest.publicKey.content),
      Buffer.from(body.publicKeyRequest.proofOfPossession, 'base64'),
    ),
  ).toBe(true);
});

it('rejects issuance responses without an embedded SCT leaf', async () => {
  const token = `header.${Buffer.from('{"sub":"synthetic"}').toString('base64url')}.signature`;
  const transport = vi
    .fn<typeof fetch>()
    .mockResolvedValue(
      Response.json({ signedCertificateDetachedSct: { chain: { certificates: ['not used'] } } }),
    );
  await expect(issueProbeLeaf(token, transport)).rejects.toThrow('embedded SCT');
  expect(transport).toHaveBeenCalledTimes(1);
});
