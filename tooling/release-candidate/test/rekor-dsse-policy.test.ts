import { X509Certificate } from 'node:crypto';
import { getCACertificates } from 'node:tls';
import { expect, it, vi } from 'vitest';

import { prepareRekorDsseRequest, verifyRekorDsseBundle } from '../src/rekor-dsse-policy.ts';

const [pem, otherPem] = getCACertificates('bundled');
const leaf = new X509Certificate(pem!).raw;
const envelope = {
  payloadType: 'application/vnd.in-toto+json',
  payload: Buffer.from('synthetic payload').toString('base64'),
  signatures: [{ keyid: '', sig: 'AQ==' }],
};
const loggedBody = (certificate: string) =>
  Buffer.from(
    JSON.stringify({
      kind: 'dsse',
      apiVersion: '0.0.1',
      spec: { signatures: [{ verifier: Buffer.from(certificate).toString('base64') }] },
    }),
  ).toString('base64');

const bundleBytes = (
  options: { certificate?: string; submitted?: typeof envelope; checkpoint?: string } = {},
) =>
  Buffer.from(
    JSON.stringify({
      mediaType: 'application/vnd.dev.sigstore.bundle.v0.3+json',
      dsseEnvelope: options.submitted ?? envelope,
      verificationMaterial: {
        certificate: { rawBytes: leaf.toString('base64') },
        tlogEntries: [
          {
            kindVersion: { kind: 'dsse', version: '0.0.1' },
            canonicalizedBody: loggedBody(options.certificate ?? pem!),
            inclusionProof: { checkpoint: { envelope: options.checkpoint ?? 'synthetic' } },
          },
        ],
      },
    }),
  );

it('formats a v1 DSSE proposal containing exactly the envelope and PEM verifier', () => {
  expect(prepareRekorDsseRequest(envelope, leaf)).toEqual({
    kind: 'dsse',
    apiVersion: '0.0.1',
    spec: {
      proposedContent: {
        envelope: JSON.stringify(envelope),
        verifiers: [Buffer.from(new X509Certificate(leaf).toString()).toString('base64')],
      },
    },
  });
});

it('requires the exact envelope, logged leaf, checkpoint and cryptographic verification', async () => {
  const verify = vi.fn<Parameters<typeof verifyRekorDsseBundle>[4]>().mockResolvedValue();
  const expected = {} as Parameters<typeof verifyRekorDsseBundle>[0];
  const exact = bundleBytes();
  await verifyRekorDsseBundle(expected, envelope, leaf, exact, verify);
  expect(verify).toHaveBeenCalledWith(expected, exact);
  for (const bytes of [
    bundleBytes({ certificate: otherPem! }),
    bundleBytes({ checkpoint: '' }),
    bundleBytes({ submitted: { ...envelope, signatures: [{ keyid: '', sig: 'Ag==' }] } }),
  ]) {
    await expect(verifyRekorDsseBundle(expected, envelope, leaf, bytes, verify)).rejects.toThrow(
      /WG_REKOR_DSSE/,
    );
  }
  expect(verify).toHaveBeenCalledTimes(1);
  verify.mockRejectedValueOnce(new Error('bad inclusion proof'));
  await expect(verifyRekorDsseBundle(expected, envelope, leaf, exact, verify)).rejects.toThrow(
    /WG_REKOR_DSSE/,
  );
});
