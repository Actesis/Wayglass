import { createRequire } from 'node:module';
import { isAbsolute, resolve } from 'node:path';

import { fail } from './error.ts';
import { assertSigningStatementPolicy } from './signing-statement.ts';
import type { prepareUnsignedStatements } from './signing-statement.ts';

type Expected = ReturnType<typeof prepareUnsignedStatements>[number];

function fulcioUtf8String(value: string): Buffer {
  const bytes = Buffer.from(value, 'utf8');
  let length = [bytes.length];
  if (bytes.length >= 128) {
    const octets: number[] = [];
    for (let remaining = bytes.length; remaining > 0; remaining = Math.floor(remaining / 256)) {
      octets.unshift(remaining % 256);
    }
    length = [0x80 | octets.length, ...octets];
  }
  // Sigstore compares the raw extension value, including its ASN.1 UTF8String tag and length.
  return Buffer.concat([Buffer.from([0x0c, ...length]), bytes]);
}

/** The caller must integrity-check and isolate the npm installation before loading code from it. */
export function loadPinnedBundleVerifier(npmRoot: string) {
  if (!isAbsolute(npmRoot))
    fail('WG_SIGNING_VERIFIER', 'An absolute, independently verified npm root is required.');
  const require = createRequire(resolve(npmRoot, 'package.json'));
  const packagePath = resolve(npmRoot, 'node_modules/sigstore');
  if (require(resolve(packagePath, 'package.json')).version !== '4.1.1')
    fail('WG_SIGNING_VERIFIER', 'Expected the reviewed Sigstore version.');
  const { verify } = require(packagePath) as {
    verify(
      bundle: unknown,
      options: ReturnType<typeof signingVerificationOptions>,
    ): Promise<unknown>;
  };
  return (expected: Expected, bytes: Uint8Array) => verifySigningBundle(expected, bytes, verify);
}

export function fulcioCertificateVerificationOptions({
  issuer,
  identity,
  commit,
  invocationId,
}: Expected['certificatePolicy']) {
  const escaped = identity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return {
    certificateIssuer: issuer,
    certificateIdentityURI: `^${escaped}$`,
    certificateOIDs: {
      '1.3.6.1.4.1.57264.1.13': fulcioUtf8String(commit),
      '1.3.6.1.4.1.57264.1.19': fulcioUtf8String(commit),
      '1.3.6.1.4.1.57264.1.21': fulcioUtf8String(invocationId),
    },
    ctlogThreshold: 1,
  };
}

export function signingVerificationOptions(expected: Expected) {
  return {
    ...fulcioCertificateVerificationOptions(expected.certificatePolicy),
    tlogThreshold: 1,
    retry: 0,
    timeout: 10_000,
  };
}

/** Verification-only port; production callers must use the pinned verifier above. */
export async function verifySigningBundle(
  expected: Expected,
  bytes: Uint8Array,
  verify: (
    bundle: unknown,
    options: ReturnType<typeof signingVerificationOptions>,
  ) => Promise<unknown>,
): Promise<void> {
  try {
    if (bytes.byteLength === 0 || bytes.byteLength > 2 * 1024 * 1024) throw new Error();
    const bundle = JSON.parse(Buffer.from(bytes).toString('utf8'));
    const envelope = bundle.dsseEnvelope;
    const entries = bundle.verificationMaterial?.tlogEntries;
    if (
      envelope?.payloadType !== 'application/vnd.in-toto+json' ||
      typeof envelope.payload !== 'string' ||
      !Array.isArray(envelope.signatures) ||
      envelope.signatures.length !== 1 ||
      !Array.isArray(entries) ||
      entries.length !== 1 ||
      !entries[0]?.inclusionProof
    )
      throw new Error();
    const payload = Buffer.from(envelope.payload, 'base64');
    if (payload.toString('base64') !== envelope.payload) throw new Error();
    const statement: unknown = JSON.parse(payload.toString('utf8'));
    // Only compare the payload after verification of this exact DSSE envelope and certificate.
    await verify(bundle, signingVerificationOptions(expected));
    assertSigningStatementPolicy(expected, { statement, certificate: expected.certificatePolicy });
  } catch {
    fail(
      'WG_SIGNING_VERIFIER',
      'Bundle signature, transparency proof, or signing policy was not verified.',
    );
  }
}
