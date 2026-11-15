import { generateKeyPairSync, sign, X509Certificate } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { isAbsolute, join, resolve } from 'node:path';

import { loadPinnedCertificateVerifier } from './fulcio-certificate-verifier.ts';
import { claimResults, expectedProbeCertificate, requestProbeToken } from './oidc-claim-probe.ts';

export function assertCertificateDispatch(env: NodeJS.ProcessEnv) {
  const expected = expectedProbeCertificate(env);
  if (env.CERTIFICATE_PROBE_COMMIT !== expected.commit || env.GITHUB_RUN_ATTEMPT !== '1')
    throw new Error('Expected the explicitly selected commit and first GitHub run attempt.');
  return expected;
}

export async function issueProbeLeaf(
  token: string,
  transport: typeof fetch = fetch,
  keys = generateKeyPairSync('ec', { namedCurve: 'P-256' }),
) {
  const payload: unknown = JSON.parse(Buffer.from(token.split('.')[1]!, 'base64url').toString());
  if (
    typeof payload !== 'object' ||
    !payload ||
    !('sub' in payload) ||
    typeof payload.sub !== 'string' ||
    !payload.sub ||
    payload.sub.length > 4096
  )
    throw new Error('Expected a GitHub subject for proof of possession.');
  const { publicKey, privateKey } = keys;
  // This request signs only Fulcio's identity challenge.
  const proof = sign('sha256', Buffer.from(payload.sub), privateKey);
  const response = await transport('https://fulcio.sigstore.dev/api/v2/signingCert', {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      credentials: { oidcIdentityToken: token },
      publicKeyRequest: {
        publicKey: {
          algorithm: 'ECDSA',
          content: publicKey.export({ type: 'spki', format: 'pem' }),
        },
        proofOfPossession: proof.toString('base64'),
      },
    }),
  });
  if (!response.ok) throw new Error('Certificate issuance did not return success.');
  const body: unknown = await response.json();
  if (typeof body !== 'object' || !body || !('signedCertificateEmbeddedSct' in body))
    throw new Error('Expected an embedded SCT certificate response.');
  const embedded = body.signedCertificateEmbeddedSct as {
    chain?: { certificates?: unknown };
  } | null;
  const chain = embedded?.chain?.certificates;
  const leaf: unknown = Array.isArray(chain) ? chain[0] : undefined;
  if (typeof leaf !== 'string' || leaf.length > 65536)
    throw new Error('Expected a bounded PEM leaf.');
  return { certificate: new X509Certificate(leaf).raw, publicKey };
}

export async function loadProbeCertificateVerifier(npmRoot: string) {
  if (!isAbsolute(npmRoot)) throw new Error('Expected the verified npm distribution.');
  const require = createRequire(resolve(npmRoot, 'package.json'));
  if (require(resolve(npmRoot, 'package.json')).version !== '11.19.0')
    throw new Error('Unexpected bundled npm version.');
  const tufPath = resolve(npmRoot, 'node_modules/@sigstore/tuf');
  if (require(resolve(tufPath, 'package.json')).version !== '4.0.2')
    throw new Error('Unexpected TUF version.');
  const { getTrustedRoot } = require(tufPath) as {
    getTrustedRoot(options: {
      cachePath: string;
      retry: number;
      timeout: number;
    }): Promise<unknown>;
  };
  const cachePath = await mkdtemp(join(tmpdir(), 'wayglass-fulcio-tuf-'));
  try {
    const trustedRoot = await getTrustedRoot({ cachePath, retry: 0, timeout: 10_000 });
    return loadPinnedCertificateVerifier(npmRoot, trustedRoot);
  } finally {
    await rm(cachePath, { recursive: true, force: true });
  }
}

async function main(env: NodeJS.ProcessEnv) {
  const expected = assertCertificateDispatch(env);
  const verify = await loadProbeCertificateVerifier(process.argv[2] ?? '');
  const token = await requestProbeToken(env);
  if (claimResults(token, env).some(({ matches }) => !matches))
    throw new Error('GitHub claim verification failed.');
  console.log('OIDC claim policy: PASS');
  console.log('Fulcio request: STARTED');
  const { certificate, publicKey } = await issueProbeLeaf(token);
  verify(expected, certificate, publicKey);
  console.log('Fulcio key, chain, SCT and certificate policy: PASS');
}

if (import.meta.main) {
  try {
    await main(process.env);
  } catch {
    console.error('Certificate-only probe: FAIL. Do not rerun without separate approval.');
    process.exitCode = 1;
  }
}
