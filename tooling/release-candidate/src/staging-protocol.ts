import { createHash } from 'node:crypto';

import { candidateDirectories } from './constants.ts';
import { fail } from './error.ts';
import { sha256 } from './hash.ts';

// These are the exact retained Linux archives, not newly packed local candidates.
const reviewedArchives = Object.freeze([
  [7815, 'a04bc68be7e7503eaa0be77845dd933762b4b522d1bb2c9f97d6fdc13ad709c3'],
  [46510, '3aa088c67b9585eee8dffca83dd5a9985846f4e2f7892dc765e0f67db1b123e6'],
  [18140, '8b56c019e791a9a499dc2f4424e8a9b1651818e12b58f6fea9d54a63b47f7288'],
  [139017, 'eb4b48a8c9457562765c7e121a5a1c60d52b2013cc9c9b4418e9446756dbd278'],
  [11086, '1adab11ea9f60142e74b7067438c9f23e5922981910547342a9bc93f9ddcd862'],
  [26010, 'd3a88664ab7a48b9ce8f88f36e531beb27dc8c180c55b748ad5adfbb31243c31'],
] as const);

export interface StagingArchive {
  readonly file: string;
  readonly bytes: Uint8Array;
}

interface UploadIdentity {
  readonly name: string;
  readonly version: '0.1.0';
  readonly file: string;
  readonly size: number;
  readonly sha256: string;
  readonly shasum: string;
  readonly integrity: string;
}

export interface StageUploadIntent {
  readonly operation: 'stage-upload';
  readonly npmVersion: '11.21.2';
  readonly package: Readonly<UploadIdentity>;
  readonly arguments: readonly string[];
}

interface ConfirmedStage extends UploadIdentity {
  readonly stageId: string;
  readonly provenanceVerification: 'pending-independent-review';
}

// Resource bound for untrusted CLI output, not a package-content or public API limit.
export const maximumReceiptBytes = 2 * 1024 * 1024;

export function reviewedStageIdentity(archive: StagingArchive): Readonly<UploadIdentity> {
  const index = candidateDirectories.findIndex(
    (directory) => archive.file === `wayglass-${directory}-0.1.0.tgz`,
  );
  const expected = reviewedArchives[index];
  if (!expected) fail('WG_STAGE_ARCHIVES', 'Archive basename is outside the reviewed set.');
  const [size, digest] = expected;
  const bytes = Buffer.from(archive.bytes);
  if (bytes.byteLength !== size || sha256(bytes) !== digest)
    fail('WG_STAGE_ARCHIVES', 'Archive size or reviewed SHA-256 differs.');
  return Object.freeze({
    name: `@wayglass/${candidateDirectories[index]}`,
    version: '0.1.0',
    file: archive.file,
    size,
    sha256: digest,
    shasum: createHash('sha1').update(bytes).digest('hex'),
    integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
  });
}

function object(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    fail('WG_STAGE_RECEIPT', 'Expected a single keyed npm stage JSON receipt.');
  return value as Record<string, unknown>;
}

function parseReceipt(stdout: string, expected: UploadIdentity): string {
  if (Buffer.byteLength(stdout) > maximumReceiptBytes)
    fail('WG_STAGE_RECEIPT', 'Stage receipt exceeds the bounded output size.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    fail('WG_STAGE_RECEIPT', 'Stage receipt is not JSON. Do not retry the upload.');
  }
  const keyed = object(parsed);
  if (Object.keys(keyed).length !== 1 || !(expected.name in keyed))
    fail('WG_STAGE_RECEIPT', 'Stage receipt does not identify exactly the current package.');
  const receipt = object(keyed[expected.name]);
  if (
    receipt.id !== `${expected.name}@${expected.version}` ||
    receipt.name !== expected.name ||
    receipt.version !== expected.version ||
    receipt.filename !== expected.file ||
    receipt.size !== expected.size ||
    receipt.shasum !== expected.shasum ||
    receipt.integrity !== expected.integrity ||
    typeof receipt.stageId !== 'string' ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(receipt.stageId)
  )
    fail(
      'WG_STAGE_RECEIPT',
      'Stage ID or archive identity differs. Stop and inspect registry state.',
    );
  return receipt.stageId;
}

/**
 * Transport-free protocol only. This object cannot spawn a command, contact npm, accept credentials,
 * grant execution authority, or promote stages. A future reviewed adapter must independently enforce
 * live approval, advisory, collision, credential, provenance, and protected-main gates.
 */
export function createInitialStagingProtocol(archives: readonly StagingArchive[]) {
  if (archives.length !== candidateDirectories.length)
    fail('WG_STAGE_ARCHIVES', 'The initial protocol requires exactly six reviewed archives.');
  const identities = archives.map((archive, index): Readonly<UploadIdentity> => {
    const directory = candidateDirectories[index]!;
    const file = `wayglass-${directory}-0.1.0.tgz`;
    if (archive.file !== file) fail('WG_STAGE_ARCHIVES', 'Archive order or basename differs.');
    return reviewedStageIdentity(archive);
  });
  const confirmed: ConfirmedStage[] = [];
  let pending: Readonly<UploadIdentity> | null = null;
  let stopped = false;
  let uncertainPackage: string | null = null;

  function stop() {
    stopped = true;
    uncertainPackage = pending?.name ?? null;
    pending = null;
  }

  return Object.freeze({
    beginNext(): StageUploadIntent | null {
      if (stopped || pending !== null)
        fail(
          'WG_STAGE_SEQUENCE',
          'Stopped or unresolved upload; no next upload or retry is allowed.',
        );
      const next = identities[confirmed.length];
      if (next === undefined) return null;
      pending = next;
      return Object.freeze({
        operation: 'stage-upload',
        npmVersion: '11.21.2',
        package: next,
        arguments: Object.freeze([
          'stage',
          'publish',
          `./packages/${next.file}`,
          '--registry=https://registry.npmjs.org/',
          '--access=public',
          '--tag=next',
          '--ignore-scripts',
          '--workspaces=false',
          '--provenance',
          '--json',
          '--fetch-retries=0',
          '--audit=false',
          '--fund=false',
          '--update-notifier=false',
        ]),
      });
    },
    completeUpload(stdout: string): void {
      if (stopped || pending === null)
        fail('WG_STAGE_SEQUENCE', 'No pending upload can accept a receipt.');
      try {
        const stageId = parseReceipt(stdout, pending);
        if (confirmed.some((stage) => stage.stageId === stageId))
          fail('WG_STAGE_RECEIPT', 'Stage ID is already bound to another package.');
        confirmed.push(
          Object.freeze({
            ...pending,
            stageId,
            provenanceVerification: 'pending-independent-review',
          }),
        );
        pending = null;
      } catch (error) {
        stop();
        throw error;
      }
    },
    failUpload(): void {
      if (stopped || pending === null)
        fail('WG_STAGE_SEQUENCE', 'No pending upload can be marked uncertain.');
      // Never retain raw stderr/token material. A failed response does not prove no server mutation.
      stop();
    },
    snapshot() {
      return Object.freeze({
        mode: 'transport-free-protocol' as const,
        status: stopped
          ? 'stopped'
          : pending !== null
            ? 'upload-unresolved'
            : confirmed.length === identities.length
              ? 'uploads-reported-human-review-required'
              : 'prepared',
        publicationAuthorized: false as const,
        registryActionsAuthorized: false as const,
        readyToPromote: false as const,
        confirmed: Object.freeze([...confirmed]),
        pendingPackage: pending?.name ?? null,
        uncertainPackage,
        placeholderState: 'unobserved' as const,
        registryReadbackVerified: false as const,
        tokenRevocationRequiredAfterExecution: true as const,
        provenanceVerified: false as const,
        automaticRetryAllowed: false as const,
      });
    },
  });
}
