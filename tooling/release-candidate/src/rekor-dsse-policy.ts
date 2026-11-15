import { X509Certificate } from 'node:crypto';

import { fail } from './error.ts';
import type { prepareCertificateGatedEnvelopes } from './certificate-gated-dsse.ts';
import type { loadPinnedBundleVerifier } from './signing-bundle-verifier.ts';

type Envelope = Awaited<ReturnType<typeof prepareCertificateGatedEnvelopes>>[number]['envelope'];
type Verify = ReturnType<typeof loadPinnedBundleVerifier>;

export const rekorDsseEndpoint = 'https://rekor.sigstore.dev/api/v1/log/entries';
const apiVersion = '0.0.1';
const kind = 'dsse';

/** Builds the request body only. Rekor receives the whole envelope to validate the entry. */
export function prepareRekorDsseRequest(envelope: Envelope, leaf: Uint8Array) {
  const pem = new X509Certificate(leaf).toString();
  return {
    apiVersion,
    kind,
    spec: {
      proposedContent: {
        envelope: JSON.stringify(envelope),
        verifiers: [Buffer.from(pem).toString('base64')],
      },
    },
  };
}

/** Verify an assembled v0.3 bundle against the exact submitted envelope and leaf.
 * The caller must use the pinned bundle verifier and stop on every rejection. */
export async function verifyRekorDsseBundle(
  expected: Parameters<Verify>[0],
  envelope: Envelope,
  leaf: Uint8Array,
  bytes: Uint8Array,
  verify: Verify,
) {
  try {
    if (bytes.byteLength === 0 || bytes.byteLength > 2 * 1024 * 1024) throw new Error();
    const bundle = JSON.parse(Buffer.from(bytes).toString('utf8'));
    const actual = bundle.dsseEnvelope;
    const material = bundle.verificationMaterial;
    const entry = material?.tlogEntries?.[0];
    if (
      bundle.mediaType !== 'application/vnd.dev.sigstore.bundle.v0.3+json' ||
      actual?.payloadType !== envelope.payloadType ||
      actual?.payload !== envelope.payload ||
      actual?.signatures?.length !== 1 ||
      envelope.signatures.length !== 1 ||
      actual.signatures[0]?.sig !== envelope.signatures[0]?.sig ||
      (actual.signatures[0]?.keyid ?? '') !== (envelope.signatures[0]?.keyid ?? '') ||
      material?.certificate?.rawBytes !== Buffer.from(leaf).toString('base64') ||
      material?.tlogEntries?.length !== 1 ||
      entry?.kindVersion?.kind !== kind ||
      entry?.kindVersion?.version !== apiVersion ||
      !entry?.inclusionProof?.checkpoint?.envelope
    )
      throw new Error();
    const body = JSON.parse(Buffer.from(entry.canonicalizedBody, 'base64').toString('utf8'));
    const logged = body.spec?.signatures;
    if (
      body.kind !== kind ||
      body.apiVersion !== apiVersion ||
      !Array.isArray(logged) ||
      logged.length !== 1 ||
      new X509Certificate(Buffer.from(logged[0]?.verifier, 'base64')).raw.compare(leaf) !== 0
    )
      throw new Error();
    // The pinned verifier then authenticates the body, payload digest, signature and proof.
    await verify(expected, bytes);
  } catch {
    fail(
      'WG_REKOR_DSSE',
      'The bundle did not verify against the exact submitted envelope and leaf.',
    );
  }
}
