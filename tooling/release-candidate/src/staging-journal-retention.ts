import { closeSync, constants, fstatSync, openSync, readSync } from 'node:fs';

import { fail } from './error.ts';
import { sha256 } from './hash.ts';
import { stagingApprovalSha256 } from './staging-approval.ts';
import type { StagingApproval } from './staging-approval.ts';

export interface StagingJournalStore {
  /** Atomically create only if absent. Conflicts and uncertain writes must reject. */
  create(key: string, bytes: Uint8Array): Promise<void>;
  /** Independently retrieve at most maxBytes; reject anything larger. */
  read(key: string, maxBytes: number): Promise<Uint8Array>;
}

// Bound the tiny six-package journal; no unbounded file or remote response reads.
const maxBytes = 128 * 1024;

function reject(): never {
  return fail(
    'WG_STAGE_RETENTION',
    'Journal checkpoint failed. Preserve evidence; do not resume or retry.',
  );
}

function snapshot(path: string): Buffer {
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    if (!fstatSync(fd).isFile()) return reject();
    const bytes = Buffer.alloc(maxBytes + 1);
    let size = 0;
    while (size < bytes.length) {
      const count = readSync(fd, bytes, size, bytes.length - size, null);
      if (count === 0) break;
      size += count;
    }
    if (size === 0 || size > maxBytes) return reject();
    return bytes.subarray(0, size);
  } finally {
    closeSync(fd);
  }
}

/** Builds an unwired checkpoint port for one approved execution. Backend durability,
 * atomic create semantics and no-delete policy must be verified before live use. */
export function createStagingJournalCheckpoint(
  approval: Readonly<StagingApproval>,
  store: StagingJournalStore,
) {
  const { approvalId, releaseCommit, runId, runAttempt } = approval;
  const digest = stagingApprovalSha256(approval);
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(approvalId))
    return reject();
  const prefix = `wayglass-initial-staging/v1/${approvalId}`;
  let previous: Buffer | undefined;
  let sequence = 0;
  let stopped = false;
  let active = false;

  return async (journalPath: string, expectedSha256: string): Promise<void> => {
    if (stopped || active) return reject();
    active = true;
    try {
      const bytes = snapshot(journalPath);
      if (sha256(bytes) !== expectedSha256 || bytes.at(-1) !== 10) return reject();
      const rows = bytes
        .toString('utf8')
        .slice(0, -1)
        .split('\n')
        .map((line, index) => {
          const row: unknown = JSON.parse(line);
          if (!row || typeof row !== 'object' || !('sequence' in row) || row.sequence !== index)
            return reject();
          return row as Record<string, unknown>;
        });
      const first = rows[0];
      const last = rows.at(-1);
      if (
        !first ||
        !last ||
        rows.length !== sequence + 2 ||
        first.event !== 'prepared' ||
        first.approvalSha256 !== digest ||
        first.approvalId !== approvalId ||
        first.releaseCommit !== releaseCommit ||
        first.runId !== runId ||
        first.runAttempt !== runAttempt ||
        first.readyToPromote !== false ||
        (previous && !bytes.subarray(0, previous.length).equals(previous))
      )
        return reject();
      const event = last.event;
      if (
        event !== 'upload-intent' &&
        event !== 'receipt-accepted' &&
        event !== 'uploads-reported' &&
        event !== 'stopped'
      )
        return reject();
      // The first snapshot is itself the atomic claim, independent of run and attempt.
      const key = sequence === 0 ? `${prefix}/claim.jsonl` : `${prefix}/${sequence + 1}.jsonl`;
      await store.create(key, Buffer.from(bytes));
      const retained = await store.read(key, maxBytes);
      if (retained.byteLength !== bytes.length || !bytes.equals(retained)) return reject();
      if (!snapshot(journalPath).equals(bytes)) return reject();
      previous = bytes;
      sequence++;
      stopped = event === 'stopped' || event === 'uploads-reported';
    } catch {
      stopped = true;
      return reject();
    } finally {
      active = false;
    }
  };
}
