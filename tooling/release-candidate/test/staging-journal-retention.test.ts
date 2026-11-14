import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { sha256 } from '../src/hash.ts';
import { stagingApprovalSha256 } from '../src/staging-approval.ts';
import type { StagingApproval } from '../src/staging-approval.ts';
import { createStagingJournalCheckpoint } from '../src/staging-journal-retention.ts';
import type { StagingJournalStore } from '../src/staging-journal-retention.ts';

const approval: StagingApproval = {
  schemaVersion: 1,
  purpose: 'initial-six-package-stage-upload',
  owner: 'Actesis',
  approvalId: '12345678-1234-1234-1234-000000000001',
  releaseCommit: 'a'.repeat(40),
  runId: '99',
  runAttempt: 1,
  archiveSha256: 'b'.repeat(64),
  advisorySha256: 'c'.repeat(64),
  approvedAt: '2026-11-14T14:00:00Z',
  expiresAt: '2026-11-14T15:00:00Z',
  distTag: 'next',
  stageUploadsAuthorized: true,
  generatedPlaceholdersAuthorized: true,
  transparencyLogAuthorized: true,
  directPublicationAuthorized: false,
  humanPromotionAuthorized: false,
};

function initial(record = approval) {
  return [
    JSON.stringify({
      sequence: 0,
      event: 'prepared',
      approvalId: record.approvalId,
      approvalSha256: stagingApprovalSha256(record),
      releaseCommit: record.releaseCommit,
      runId: record.runId,
      runAttempt: record.runAttempt,
      readyToPromote: false,
    }),
    JSON.stringify({ sequence: 1, event: 'upload-intent' }),
    '',
  ].join('\n');
}

async function fixture(
  run: (context: {
    path: string;
    store: StagingJournalStore;
    objects: Map<string, Buffer>;
    write: (bytes: string) => string;
  }) => Promise<void>,
) {
  const root = mkdtempSync(resolve(tmpdir(), 'wayglass-journal-test-'));
  const path = resolve(root, 'stage-journal.jsonl');
  const objects = new Map<string, Buffer>();
  const store: StagingJournalStore = {
    async create(key, bytes) {
      if (objects.has(key)) throw new Error('conflict');
      objects.set(key, Buffer.from(bytes));
    },
    async read(key) {
      return Buffer.from(objects.get(key)!);
    },
  };
  try {
    await run({
      path,
      objects,
      store,
      write(bytes) {
        writeFileSync(path, bytes);
        return sha256(bytes);
      },
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe('create-only staging journal retention', () => {
  it('retains exact successive snapshots and closes at a terminal event', async () => {
    await fixture(async ({ path, store, objects, write }) => {
      const checkpoint = createStagingJournalCheckpoint(approval, store);
      const intent = initial();
      await checkpoint(path, write(intent));
      const stopped = intent + '{"sequence":2,"event":"stopped"}\n';
      await checkpoint(path, write(stopped));
      expect([...objects.values()].map(String)).toEqual([intent, stopped]);
      await expect(checkpoint(path, sha256(stopped))).rejects.toThrow(/WG_STAGE_RETENTION/);
    });
  });

  it('rejects reused approval IDs even across run attempts and new checkpoint instances', async () => {
    await fixture(async ({ path, store, objects, write }) => {
      await createStagingJournalCheckpoint(approval, store)(path, write(initial()));
      const replay = { ...approval, runAttempt: 2 };
      await expect(
        createStagingJournalCheckpoint(replay, store)(path, write(initial(replay))),
      ).rejects.toThrow(/WG_STAGE_RETENTION/);
      expect(objects.size).toBe(1);
    });
  });

  it('rejects mismatched digests, malformed framing and mutated prefixes', async () => {
    await fixture(async ({ path, store, objects, write }) => {
      const intent = initial();
      for (const bytes of [intent.trimEnd(), intent.replace('"sequence":1', '"sequence":3')]) {
        await expect(
          createStagingJournalCheckpoint(approval, store)(path, write(bytes)),
        ).rejects.toThrow(/WG_STAGE_RETENTION/);
      }
      await expect(
        createStagingJournalCheckpoint(approval, store)(path, write(intent).replace(/./g, '0')),
      ).rejects.toThrow(/WG_STAGE_RETENTION/);
      expect(objects.size).toBe(0);
      const checkpoint = createStagingJournalCheckpoint(approval, store);
      await checkpoint(path, write(intent));
      const rewritten =
        intent.replace('upload-intent', 'receipt-accepted') + '{"sequence":2,"event":"stopped"}\n';
      await expect(checkpoint(path, write(rewritten))).rejects.toThrow(/WG_STAGE_RETENTION/);
      expect(objects.size).toBe(1);
    });
  });

  it('stops after uncertain creation, corrupt readback, or local mutation during retention', async () => {
    for (const failure of ['create', 'readback', 'local']) {
      await fixture(async ({ path, store, objects, write }) => {
        const checkpoint = createStagingJournalCheckpoint(approval, {
          async create(key, bytes) {
            await store.create(key, bytes);
            if (failure === 'create') throw new Error('fictional secret');
          },
          async read(key, limit) {
            if (failure === 'local') write('changed');
            return failure === 'readback' ? Buffer.from('changed') : store.read(key, limit);
          },
        });
        const digest = write(initial());
        await expect(checkpoint(path, digest)).rejects.toThrow(
          'WG_STAGE_RETENTION: Journal checkpoint failed. Preserve evidence; do not resume or retry.',
        );
        await expect(checkpoint(path, digest)).rejects.toThrow(/WG_STAGE_RETENTION/);
        expect(objects.size).toBe(1);
      });
    }
  });
});
