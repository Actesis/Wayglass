import { createHash, type KeyObject } from 'node:crypto';

import { prepareCertificateGatedEnvelopes } from './certificate-gated-dsse.ts';
import { submitAndVerifyRekorDsse } from './rekor-dsse-transport.ts';

type Prepare = Parameters<typeof prepareCertificateGatedEnvelopes>;
type Submit = Parameters<typeof submitAndVerifyRekorDsse>;

type Progress = {
  file: string;
  status: 'attempting' | 'verified' | 'unverified-stop';
};

/** Unwired: the caller must independently verify the current-run handoff and obtain explicit
 * authorization before using this adapter. It never returns a partial set of bundles. */
export async function signAndVerifyReleaseBatch({
  input,
  leaf,
  privateKey,
  verifyCertificate,
  verifyBundle,
  report,
  transport,
}: {
  input: Prepare[0];
  leaf: Uint8Array;
  privateKey: KeyObject;
  verifyCertificate: Prepare[3];
  verifyBundle: Submit[3];
  report: (progress: Progress) => void;
  transport?: typeof fetch;
}) {
  const certificate = Buffer.from(leaf);
  const envelopes = await prepareCertificateGatedEnvelopes(
    input,
    certificate,
    privateKey,
    verifyCertificate,
  );
  const bundles: { file: string; bundle: Buffer; sha256: string }[] = [];
  for (const { file, expected, envelope } of envelopes) {
    report({ file, status: 'attempting' });
    try {
      const { bytes } = await submitAndVerifyRekorDsse(
        expected,
        envelope,
        certificate,
        verifyBundle,
        transport,
      );
      bundles.push({
        file,
        bundle: bytes,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      });
    } catch (error) {
      report({ file, status: 'unverified-stop' });
      throw error;
    }
    report({ file, status: 'verified' });
  }
  return bundles;
}
