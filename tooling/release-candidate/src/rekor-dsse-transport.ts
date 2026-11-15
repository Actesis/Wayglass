import { fail } from './error.ts';
import {
  prepareRekorDsseRequest,
  rekorDsseEndpoint,
  verifyRekorDsseBundle,
} from './rekor-dsse-policy.ts';

type Envelope = Parameters<typeof prepareRekorDsseRequest>[0];
type VerifyArgs = Parameters<typeof verifyRekorDsseBundle>;
const receiptLimit = 1024 * 1024;

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
  return value as Record<string, unknown>;
}

function integer(value: unknown, min = 0): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min) throw new Error();
  return value;
}

function hash(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/i.test(value)) throw new Error();
  return Buffer.from(value, 'hex').toString('base64');
}

function base64(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value ||
    Buffer.from(value, 'base64').toString('base64') !== value
  )
    throw new Error();
  return value;
}

/** Normalize exactly one v1 receipt; returned bytes are untrusted until bundle verification. */
export function normalizeRekorDsseReceipt(
  receipt: Uint8Array,
  envelope: Envelope,
  leaf: Uint8Array,
) {
  try {
    if (receipt.byteLength === 0 || receipt.byteLength > receiptLimit) throw new Error();
    const entries = Object.entries(record(JSON.parse(Buffer.from(receipt).toString('utf8'))));
    if (entries.length !== 1) throw new Error();
    const [entryId, raw] = entries[0]!;
    if (!/^(?:[a-f0-9]{64}|[a-f0-9]{80})$/.test(entryId)) throw new Error();
    const entry = record(raw);
    const verification = record(entry.verification);
    const proof = record(verification.inclusionProof);
    // The receipt's global index is distinct from the inclusion proof's shard-local index.
    const proofIndex = integer(proof.logIndex);
    const treeSize = integer(proof.treeSize, 1);
    if (
      proofIndex >= treeSize ||
      !Array.isArray(proof.hashes) ||
      proof.hashes.length > 64 ||
      typeof proof.checkpoint !== 'string' ||
      !proof.checkpoint ||
      proof.checkpoint.length > 16384
    )
      throw new Error();
    const bytes = Buffer.from(
      JSON.stringify({
        mediaType: 'application/vnd.dev.sigstore.bundle.v0.3+json',
        dsseEnvelope: envelope,
        verificationMaterial: {
          certificate: { rawBytes: Buffer.from(leaf).toString('base64') },
          tlogEntries: [
            {
              logIndex: String(integer(entry.logIndex)),
              integratedTime: String(integer(entry.integratedTime, 1)),
              logId: { keyId: hash(entry.logID) },
              kindVersion: { kind: 'dsse', version: '0.0.1' },
              canonicalizedBody: base64(entry.body),
              inclusionPromise: { signedEntryTimestamp: base64(verification.signedEntryTimestamp) },
              inclusionProof: {
                logIndex: String(proofIndex),
                treeSize: String(treeSize),
                rootHash: hash(proof.rootHash),
                hashes: proof.hashes.map(hash),
                checkpoint: { envelope: proof.checkpoint },
              },
            },
          ],
        },
      }),
    );
    // The response's map key is a reconciliation hint, not a signed bundle field.
    return { bytes, receiptEntryId: entryId };
  } catch {
    fail('WG_REKOR_RECEIPT', 'Expected one bounded Rekor v1 receipt with a timestamp and proof.');
  }
}

async function readReceipt(response: Response) {
  if (!response.body) throw new Error();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return Buffer.concat(chunks, bytes);
      bytes += value.byteLength;
      if (bytes > receiptLimit) {
        // Stop consuming the receipt; do not wait for cancellation to complete.
        void reader.cancel().catch(() => {});
        throw new Error();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
}

/** Unwired. Call only from an explicitly authorized signing job with verified inputs.
 * A failure after POST starts is ambiguous; the caller must stop and must not retry. */
export async function submitAndVerifyRekorDsse(
  expected: VerifyArgs[0],
  envelope: Envelope,
  leaf: Uint8Array,
  verify: VerifyArgs[4],
  transport: typeof fetch = fetch,
) {
  const body = JSON.stringify(prepareRekorDsseRequest(envelope, leaf));
  try {
    const response = await transport(rekorDsseEndpoint, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body,
    });
    if (response.status !== 201) throw new Error();
    const result = normalizeRekorDsseReceipt(await readReceipt(response), envelope, leaf);
    await verifyRekorDsseBundle(expected, envelope, leaf, result.bytes, verify);
    return result;
  } catch {
    fail(
      'WG_REKOR_SUBMISSION',
      'Rekor submission was not verified. Stop and reconcile; do not retry.',
    );
  }
}
