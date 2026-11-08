import {
  constants,
  closeSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  writeFileSync,
  writeSync,
} from 'node:fs';
import { resolve } from 'node:path';

import { assertNoReleaseCredentials } from './environment.ts';
import { fail } from './error.ts';
import { sha256 } from './hash.ts';
import { validateNewOutputPath } from './path-safety.ts';
import {
  stagingApprovalSha256,
  validateStagingApproval,
  validateStagingObservation,
} from './staging-approval.ts';
import type { StagingApproval, StagingObservation } from './staging-approval.ts';
import { createInitialStagingProtocol } from './staging-protocol.ts';
import type { StageUploadIntent, StagingArchive } from './staging-protocol.ts';

export interface StagingAdapterPorts {
  /** Must authenticate live sources, not copy booleans from approval/planning JSON. */
  readonly observe: (
    packageName: string,
    approval: Readonly<StagingApproval>,
  ) => Promise<StagingObservation>;
  /** Must retain the exact safe journal outside an ephemeral runner before resolving. */
  readonly checkpoint: (journalPath: string, journalSha256: string) => Promise<void>;
  /** Future restricted transport; receives no arbitrary shell command or raw approval input. */
  readonly upload: (intent: StageUploadIntent, ownedRoot: string) => Promise<string>;
}

/**
 * Adapter core, deliberately not wired to a live transport, CLI, or workflow. Approval validation
 * checks scope, not human identity: the future trusted ports must independently authenticate gates.
 */
export async function runGuardedStagingAdapter(input: {
  readonly repositoryRoot: string;
  readonly output: string;
  readonly archives: readonly StagingArchive[];
  readonly approval: unknown;
  readonly environment: NodeJS.ProcessEnv;
  readonly ports: StagingAdapterPorts;
  readonly now?: () => Date;
}): Promise<string> {
  assertNoReleaseCredentials(input.environment);
  const clock = input.now ?? (() => new Date());
  const approval = validateStagingApproval(input.approval, clock());
  const archives = input.archives.map(({ file, bytes }) => ({ file, bytes: Buffer.from(bytes) }));
  const protocol = createInitialStagingProtocol(archives);
  const output = validateNewOutputPath(input.output, input.repositoryRoot);
  // Only a new owned directory is used. Never resume/rewrite an earlier operation journal.
  mkdirSync(output, { mode: 0o700 });
  const journalPath = resolve(output, 'stage-journal.jsonl');
  let journal: number | undefined;
  let sequence = 0;
  let pending = false;
  let uploadInvoked = false;
  function verifyJournal() {
    const named = lstatSync(journalPath);
    const opened = fstatSync(journal!);
    if (
      named.isSymbolicLink() ||
      !named.isFile() ||
      named.dev !== opened.dev ||
      named.ino !== opened.ino
    )
      fail('WG_STAGE_JOURNAL', 'Owned journal was replaced.');
  }
  function append(event: string, details: Record<string, unknown>) {
    verifyJournal();
    const line = Buffer.from(`${JSON.stringify({ sequence: sequence++, event, ...details })}\n`);
    let written = 0;
    while (written < line.length) {
      const count = writeSync(journal!, line, written, line.length - written);
      if (count === 0) fail('WG_STAGE_JOURNAL', 'Journal write made no progress.');
      written += count;
    }
    fsyncSync(journal!);
  }
  async function checkpoint() {
    verifyJournal();
    await input.ports.checkpoint(journalPath, sha256(readFileSync(journalPath)));
    verifyJournal();
  }
  function verifyOwnedArchive(intent: StageUploadIntent) {
    for (const path of [output, resolve(output, 'packages')]) {
      if (lstatSync(path).isSymbolicLink() || !lstatSync(path).isDirectory())
        fail('WG_STAGE_PATH', 'An owned staging directory was replaced.');
    }
    const path = resolve(output, 'packages', intent.package.file);
    if (lstatSync(path).isSymbolicLink() || !lstatSync(path).isFile())
      fail('WG_STAGE_PATH', 'Staging archive must remain a regular owned file.');
    const bytes = readFileSync(path);
    if (bytes.length !== intent.package.size || sha256(bytes) !== intent.package.sha256)
      fail('WG_STAGE_BYTES', 'Owned archive bytes changed before upload.');
  }
  try {
    journal = openSync(
      journalPath,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
      0o600,
    );
    append('prepared', {
      approvalSha256: stagingApprovalSha256(approval),
      approvalId: approval.approvalId,
      releaseCommit: approval.releaseCommit,
      runId: approval.runId,
      runAttempt: approval.runAttempt,
      readyToPromote: false,
    });
    const packages = resolve(output, 'packages');
    mkdirSync(packages, { mode: 0o700 });
    for (const archive of archives)
      writeFileSync(resolve(packages, archive.file), archive.bytes, { flag: 'wx', mode: 0o600 });
    while (true) {
      const intent = protocol.beginNext();
      if (intent === null) break;
      pending = true;
      uploadInvoked = false;
      const observation = await input.ports.observe(intent.package.name, approval);
      validateStagingObservation(observation, approval, intent.package.name, clock());
      // Recheck fixed owned paths and exact bytes after gate collection, immediately before upload.
      verifyOwnedArchive(intent);
      append('upload-intent', {
        package: intent.package,
        observedAt: observation.observedAt,
        advisorySha256: observation.advisorySha256,
        advisoryValidThrough: observation.advisoryValidThrough,
      });
      await checkpoint();
      // Retention may take time: do not upload if gates expired or bytes changed while waiting.
      validateStagingObservation(observation, approval, intent.package.name, clock());
      verifyOwnedArchive(intent);
      uploadInvoked = true;
      const stdout = await input.ports.upload(intent, output);
      protocol.completeUpload(stdout);
      pending = false;
      append('receipt-accepted', { stage: protocol.snapshot().confirmed.at(-1) });
      await checkpoint();
    }
    append('uploads-reported', {
      snapshot: protocol.snapshot(),
      tokenRevocationStatus: 'owner-action-required',
    });
    await checkpoint();
    return journalPath;
  } catch {
    // Unknown transport errors must not leak raw command output, credentials, or approval input.
    if (pending && protocol.snapshot().status !== 'stopped') protocol.failUpload();
    if (journal !== undefined) {
      try {
        append('stopped', {
          snapshot: protocol.snapshot(),
          uploadInvoked,
          tokenRevocationStatus: 'owner-action-required',
        });
        await checkpoint();
      } catch {
        // A failed/torn append cannot erase the earlier synced intent. Never retry automatically.
      }
    }
    return fail(
      'WG_STAGE_ADAPTER_STOPPED',
      'Staging stopped. Preserve the journal; inspect state and revoke any execution token. No retry is authorized.',
    );
  } finally {
    if (journal !== undefined) closeSync(journal);
  }
}
