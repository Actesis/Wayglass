import { X509Certificate, type KeyObject } from 'node:crypto';
import { createRequire } from 'node:module';
import { isAbsolute, resolve } from 'node:path';

import { fail } from './error.ts';
import { fulcioCertificateVerificationOptions } from './signing-bundle-verifier.ts';

type Expected = Parameters<typeof fulcioCertificateVerificationOptions>[0];
type CertificatePolicy = {
  subjectAlternativeName: string;
  extensions: { issuer: string };
  oids: { oid: { id: number[] }; value: Buffer }[];
};

/** The caller must independently authenticate the npm installation and TUF trust root.
 * This offline adapter never trusts a CA chain returned by the issuance endpoint. */
export function loadPinnedCertificateVerifier(npmRoot: string, trustedRoot: unknown) {
  if (!isAbsolute(npmRoot))
    fail('WG_FULCIO_CERTIFICATE', 'An absolute, independently verified npm root is required.');
  const require = createRequire(resolve(npmRoot, 'package.json'));
  const load = (name: string, version: string): unknown => {
    const path = resolve(npmRoot, 'node_modules', name);
    if (require(resolve(path, 'package.json')).version !== version)
      fail('WG_FULCIO_CERTIFICATE', 'Expected the reviewed Sigstore certificate tooling.');
    return require(path);
  };
  const { X509Certificate: SigstoreCertificate } = load('@sigstore/core', '3.2.1') as {
    X509Certificate: { parse(bytes: Buffer): unknown };
  };
  const { Verifier, toTrustMaterial } = load('@sigstore/verify', '3.1.1') as {
    Verifier: new (
      trust: unknown,
      options: { ctlogThreshold: number },
    ) => {
      verifySigningKey(
        entity: { key: { $case: 'certificate'; certificate: unknown } },
        timestamps: Date[],
      ): { identity: unknown };
      verifyPolicy(policy: CertificatePolicy, identity: unknown): void;
    };
    toTrustMaterial(root: unknown, keys: Record<string, never>): unknown;
  };
  const trust = toTrustMaterial(trustedRoot, {});
  return (
    expected: Expected,
    certificate: Uint8Array,
    ephemeralPublicKey: KeyObject,
    now: Date = new Date(),
  ): void => {
    try {
      if (
        !Number.isFinite(now.getTime()) ||
        certificate.byteLength === 0 ||
        certificate.byteLength > 64 * 1024 ||
        ephemeralPublicKey.type !== 'public'
      )
        throw new Error();
      const bytes = Buffer.from(certificate);
      const leaf = new X509Certificate(bytes);
      // Reject trailing bytes and PEM so Node and Sigstore inspect the same DER leaf.
      if (!leaf.raw.equals(bytes) || !leaf.publicKey.equals(ephemeralPublicKey)) throw new Error();
      const options = fulcioCertificateVerificationOptions(expected);
      const verifier = new Verifier(trust, { ctlogThreshold: options.ctlogThreshold });
      // Use the pinned verifier's certificate path and SCT checks, not bundle verification.
      // The clock must be local at issuance; an explicit Date also permits historical fixtures.
      const signer = verifier.verifySigningKey(
        { key: { $case: 'certificate', certificate: SigstoreCertificate.parse(bytes) } },
        [now],
      );
      verifier.verifyPolicy(
        {
          subjectAlternativeName: options.certificateIdentityURI,
          extensions: { issuer: options.certificateIssuer },
          oids: Object.entries(options.certificateOIDs).map(([name, value]) => ({
            oid: { id: name.split('.').map(Number) },
            value,
          })),
        },
        signer.identity,
      );
    } catch {
      fail('WG_FULCIO_CERTIFICATE', 'Certificate key, chain, transparency or policy check failed.');
    }
  };
}
