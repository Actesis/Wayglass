import { createPublicKey, sign, type KeyObject } from 'node:crypto';

import { fail } from './error.ts';
import { prepareSigningInputs } from './signing-inputs.ts';
import { prepareUnsignedStatements } from './signing-statement.ts';
import type { loadPinnedCertificateVerifier } from './fulcio-certificate-verifier.ts';

const payloadType = 'application/vnd.in-toto+json';

/** Offline only. The caller must authenticate the handoff and use the pinned Fulcio
 * verifier with independent trust material. This function cannot issue or submit anything. */
export async function prepareCertificateGatedEnvelopes(
  input: Parameters<typeof prepareSigningInputs>[0],
  leaf: Uint8Array,
  privateKey: KeyObject,
  verifyCertificate: ReturnType<typeof loadPinnedCertificateVerifier>,
) {
  const expected = prepareUnsignedStatements(prepareSigningInputs(input));
  if (
    privateKey.type !== 'private' ||
    privateKey.asymmetricKeyType !== 'ec' ||
    privateKey.asymmetricKeyDetails?.namedCurve !== 'prime256v1'
  )
    fail('WG_SIGNING_KEY', 'Expected an ephemeral P-256 private key.');
  const policy = expected[0]?.certificatePolicy;
  if (!policy) fail('WG_SIGNING_INPUTS', 'No signing subjects were prepared.');
  // All statements derive the same certificate policy from one authenticated invocation.
  // Node accepts private KeyObjects here; the current declaration omits that overload.
  const publicKey = createPublicKey(privateKey as unknown as Parameters<typeof createPublicKey>[0]);
  await verifyCertificate(policy, Buffer.from(leaf), publicKey);
  return expected.map(({ file, statement }) => {
    const payload = Buffer.from(JSON.stringify(statement));
    // DSSE pre-authentication encoding binds the byte lengths, media type and exact payload.
    const prefix = Buffer.from(
      `DSSEv1 ${Buffer.byteLength(payloadType)} ${payloadType} ${payload.length} `,
    );
    const signature = sign('sha256', Buffer.concat([prefix, payload]), privateKey);
    return {
      file,
      envelope: {
        payloadType,
        payload: payload.toString('base64'),
        signatures: [{ keyid: '', sig: signature.toString('base64') }],
      },
    };
  });
}
