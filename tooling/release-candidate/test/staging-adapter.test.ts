import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { candidateDirectories } from '../src/constants.ts';
import { sha256 } from '../src/hash.ts';
import { retainedPublicationArchive } from '../src/publication-preflight.ts';
import { runGuardedStagingAdapter } from '../src/staging-adapter.ts';
import type { StagingAdapterPorts } from '../src/staging-adapter.ts';
import {
  stagingApprovalSha256,
  validateStagingApproval,
  validateStagingObservation,
} from '../src/staging-approval.ts';
import type { StagingObservation } from '../src/staging-approval.ts';
import { repositoryRoot } from './fixtures.ts';

// Fictional authority/observations only; these cannot authorize a workflow or registry operation.
const time = '2026-11-08T14:30:00.000Z';
const approved = {
  schemaVersion: 1,
  purpose: 'initial-six-package-stage-upload',
  owner: 'Actesis',
  approvalId: '12345678-1234-1234-1234-000000000001',
  approvedAt: time,
  expiresAt: '2026-11-08T15:00:00.000Z',
  releaseCommit: 'a'.repeat(40),
  runId: '90000000001',
  runAttempt: 1,
  archiveSha256: retainedPublicationArchive.sha256,
  advisorySha256: 'b'.repeat(64),
  distTag: 'next',
  stageUploadsAuthorized: true,
  generatedPlaceholdersAuthorized: true,
  transparencyLogAuthorized: true,
  directPublicationAuthorized: false,
  humanPromotionAuthorized: false,
} as const;
const archives = candidateDirectories.map((directory) => {
  const file = `wayglass-${directory}-0.1.0.tgz`;
  return {
    file,
    bytes: execFileSync('unzip', [
      '-p',
      resolve(repositoryRoot, retainedPublicationArchive.path),
      `assembly/packages/${file}`,
    ]),
  };
});
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});
function observation(name = '@wayglass/core'): StagingObservation {
  return {
    observedAt: time,
    repository: 'Actesis/Wayglass',
    ref: 'refs/heads/main',
    workflow: '.github/workflows/npm-initial-release.yml',
    environment: 'npm-release',
    event: 'workflow_dispatch',
    repositoryPublic: true,
    commit: approved.releaseCommit,
    runId: approved.runId,
    runAttempt: 1,
    hostedRunner: true,
    protectedMain: true,
    qualityPassed: true,
    ownerEnvironmentApproved: true,
    accountAndRecoveryReady: true,
    advisorySha256: approved.advisorySha256,
    advisoryValidThrough: '2026-11-08T16:04:23Z',
    advisoryDispositionAccepted: true,
    packageName: name,
    packageCreationAllowed: true,
    publishedVersions: [],
    stagedVersions: [],
  };
}
function fixture() {
  const root = realpathSync(mkdtempSync(resolve(tmpdir(), 'wayglass-stage-adapter-test-')));
  roots.push(root);
  const output = resolve(root, 'execution');
  const journal = resolve(output, 'stage-journal.jsonl');
  const uploaded: string[] = [];
  const retained: string[] = [];
  const ports: StagingAdapterPorts = {
    observe: async (name) => observation(name),
    checkpoint: async (path, digest) => {
      const bytes = readFileSync(path);
      expect(sha256(bytes)).toBe(digest);
      retained.push(bytes.toString('utf8'));
    },
    upload: async (intent, ownedRoot) => {
      // Last synced checkpoint must already describe the exact operation before any transport call.
      const before = JSON.parse(retained.at(-1)!.trim().split('\n').at(-1)!);
      expect(before.event).toBe('upload-intent');
      expect(before.package).toEqual(intent.package);
      expect(sha256(readFileSync(resolve(ownedRoot, 'packages', intent.package.file)))).toBe(
        intent.package.sha256,
      );
      uploaded.push(intent.package.name);
      return JSON.stringify({
        [intent.package.name]: {
          ...intent.package,
          id: `${intent.package.name}@0.1.0`,
          filename: intent.package.file,
          stageId: `12345678-1234-1234-1234-${String(uploaded.length).padStart(12, '0')}`,
        },
      });
    },
  };
  const input = {
    repositoryRoot,
    output,
    archives,
    approval: approved,
    environment: {},
    ports,
    now: () => new Date(time),
  };
  return { root, output, journal, uploaded, retained, ports, input };
}
function events(path: string) {
  return readFileSync(path, 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
}

describe('initial execution approval scope', () => {
  it('accepts only a separate exact, bounded, immutable record, never planning JSON', () => {
    const result = validateStagingApproval(approved, new Date(time));
    expect(Object.isFrozen(result)).toBe(true);
    expect(stagingApprovalSha256(result)).toBe(stagingApprovalSha256({ ...result }));
    const separatelyBoundAttempt = validateStagingApproval(
      { ...approved, runAttempt: 2 },
      new Date(time),
    );
    expect(separatelyBoundAttempt.runAttempt).toBe(2);
    expect(() =>
      validateStagingObservation(
        observation(),
        separatelyBoundAttempt,
        '@wayglass/core',
        new Date(time),
      ),
    ).toThrow(/WG_STAGE_GATES/);
    const planning = JSON.parse(
      readFileSync(
        resolve(repositoryRoot, 'docs/governance/initial-npm-release-proposal.json'),
        'utf8',
      ),
    );
    expect(() => validateStagingApproval(planning, new Date(time))).toThrow(/WG_STAGE_APPROVAL/);
    for (const change of [
      { owner: 'someone-else' },
      { extraCommand: 'publish' },
      { runAttempt: 0 },
      { runId: '0' },
      { releaseCommit: 'main' },
      { archiveSha256: 'c'.repeat(64) },
      { distTag: 'latest' },
      { stageUploadsAuthorized: false },
      { generatedPlaceholdersAuthorized: false },
      { transparencyLogAuthorized: false },
      { directPublicationAuthorized: true },
      { humanPromotionAuthorized: true },
      { approvedAt: '2026-11-08T15:00:00Z' },
      { expiresAt: time },
      { expiresAt: '2026-11-10T15:00:00Z' },
      { approvedAt: '2026-02-30T00:00:00Z' },
    ])
      expect(() => validateStagingApproval({ ...approved, ...change }, new Date(time))).toThrow(
        /WG_STAGE_APPROVAL/,
      );
  });
  it('requires fresh exact live observations, explicit accepted disposition, and absent package state', () => {
    const approval = validateStagingApproval(approved, new Date(time));
    for (const change of [
      { repository: 'another/repo' },
      { ref: 'refs/heads/test' },
      { workflow: 'other.yml' },
      { environment: 'unprotected' },
      { event: 'push' },
      { repositoryPublic: false },
      { commit: 'c'.repeat(40) },
      { runId: '90000000002' },
      { runAttempt: 2 },
      { hostedRunner: false },
      { protectedMain: false },
      { qualityPassed: false },
      { ownerEnvironmentApproved: false },
      { accountAndRecoveryReady: false },
      { advisorySha256: 'c'.repeat(64) },
      { advisoryDispositionAccepted: false },
      { advisoryValidThrough: time },
      { observedAt: '2026-11-08T14:28:59Z' },
      { observedAt: '2026-11-08T14:30:01Z' },
      { packageName: '@wayglass/react' },
      { packageCreationAllowed: false },
      { publishedVersions: ['0.0.0-stage'] },
      { stagedVersions: ['0.1.0'] },
    ])
      expect(() =>
        validateStagingObservation(
          { ...observation(), ...change },
          approval,
          '@wayglass/core',
          new Date(time),
        ),
      ).toThrow(/WG_STAGE_GATES/);
  });
});

describe('guarded adapter core with simulated ports', () => {
  it('checkpoints intents before uploads and receipts before proceeding, ending without promotion', async () => {
    const f = fixture();
    expect(await runGuardedStagingAdapter(f.input)).toBe(f.journal);
    expect(f.uploaded).toEqual(candidateDirectories.map((name) => `@wayglass/${name}`));
    const records = events(f.journal);
    expect(records.map(({ sequence }) => sequence)).toEqual(records.map((_, index) => index));
    expect(records.map(({ event }) => event)).toEqual([
      'prepared',
      ...candidateDirectories.flatMap(() => ['upload-intent', 'receipt-accepted']),
      'uploads-reported',
    ]);
    expect(f.retained).toHaveLength(13);
    expect(records.at(-1).snapshot).toMatchObject({
      readyToPromote: false,
      provenanceVerified: false,
    });
    expect(records.at(-1).tokenRevocationStatus).toBe('owner-action-required');
  });
  it('rejects exposed credentials or invalid approval before filesystem effects or ports', async () => {
    for (const change of [{ environment: { NPM_TOKEN: 'secret-marker' } }, { approval: {} }]) {
      const f = fixture();
      await expect(runGuardedStagingAdapter({ ...f.input, ...change })).rejects.toThrow();
      expect(existsSync(f.output)).toBe(false);
      expect(f.uploaded).toEqual([]);
      expect(f.retained).toEqual([]);
    }
  });
  it('will not overwrite or resume an earlier output directory', async () => {
    const f = fixture();
    mkdirSync(f.output);
    writeFileSync(f.journal, 'earlier owner evidence');
    await expect(runGuardedStagingAdapter(f.input)).rejects.toThrow(/WG_RC_OUTPUT_EXISTS/);
    expect(readFileSync(f.journal, 'utf8')).toBe('earlier owner evidence');
    expect(f.uploaded).toEqual([]);
  });
  it('retains earlier receipt IDs on transport failure and never leaks raw errors or retries', async () => {
    const f = fixture();
    const upload = f.ports.upload;
    const ports = {
      ...f.ports,
      upload: async (...args: Parameters<typeof upload>) => {
        if (f.uploaded.length === 1) throw new Error('npm_secret-marker');
        return upload(...args);
      },
    };
    await expect(runGuardedStagingAdapter({ ...f.input, ports })).rejects.toThrow(
      /WG_STAGE_ADAPTER_STOPPED/,
    );
    expect(f.uploaded).toEqual(['@wayglass/core']);
    const text = readFileSync(f.journal, 'utf8');
    expect(text).not.toContain('secret-marker');
    expect(events(f.journal).at(-1)).toMatchObject({
      event: 'stopped',
      uploadInvoked: true,
      snapshot: { uncertainPackage: '@wayglass/tokens' },
    });
    expect(events(f.journal).at(-1).snapshot.confirmed).toHaveLength(1);
  });
  it('halts before transport on gate, expiry, corrupt byte, or symlink replacement', async () => {
    for (const kind of ['gate', 'expiry', 'bytes', 'symlink']) {
      const f = fixture();
      let now = new Date(time);
      const ports = {
        ...f.ports,
        observe: async (name: string) => {
          const path = resolve(f.output, 'packages', archives[0]!.file);
          if (kind === 'bytes') writeFileSync(path, 'bad bytes');
          if (kind === 'symlink') {
            rmSync(path);
            symlinkSync('/absent-owner-file', path);
          }
          if (kind === 'expiry') now = new Date(approved.expiresAt);
          return { ...observation(name), qualityPassed: kind !== 'gate' };
        },
      };
      await expect(runGuardedStagingAdapter({ ...f.input, ports, now: () => now })).rejects.toThrow(
        /WG_STAGE_ADAPTER_STOPPED/,
      );
      expect(f.uploaded).toEqual([]);
      expect(events(f.journal).at(-1).uploadInvoked).toBe(false);
    }
  });
  it('rechecks freshness and bytes after checkpoint latency or mutation', async () => {
    for (const kind of ['latency', 'bytes']) {
      const f = fixture();
      let now = new Date(time);
      const ports = {
        ...f.ports,
        checkpoint: async () => {
          if (kind === 'latency') now = new Date('2026-11-08T14:31:01Z');
          else writeFileSync(resolve(f.output, 'packages', archives[0]!.file), 'modified');
        },
      };
      await expect(runGuardedStagingAdapter({ ...f.input, ports, now: () => now })).rejects.toThrow(
        /WG_STAGE_ADAPTER_STOPPED/,
      );
      expect(f.uploaded).toEqual([]);
    }
  });
  it('does not call upload if durable intent retention fails', async () => {
    const f = fixture();
    const ports = {
      ...f.ports,
      checkpoint: async () => {
        throw new Error('secret-marker');
      },
    };
    await expect(runGuardedStagingAdapter({ ...f.input, ports })).rejects.toThrow(
      /WG_STAGE_ADAPTER_STOPPED/,
    );
    expect(f.uploaded).toEqual([]);
    expect(readFileSync(f.journal, 'utf8')).not.toContain('secret-marker');
  });
  it('does not advance when retaining an accepted receipt fails', async () => {
    const f = fixture();
    let checkpoints = 0;
    const ports = {
      ...f.ports,
      checkpoint: async (path: string, digest: string) => {
        checkpoints++;
        if (checkpoints === 2) throw new Error('retention unavailable');
        await f.ports.checkpoint(path, digest);
      },
    };
    await expect(runGuardedStagingAdapter({ ...f.input, ports })).rejects.toThrow(
      /WG_STAGE_ADAPTER_STOPPED/,
    );
    expect(f.uploaded).toEqual(['@wayglass/core']);
    expect(events(f.journal).at(-1).snapshot.confirmed).toHaveLength(1);
    expect(events(f.journal).at(-1).event).toBe('stopped');
  });
  it('rejects journal replacement without following a symlink or overwriting owner evidence', async () => {
    const f = fixture();
    const ownerFile = resolve(f.root, 'owner-evidence');
    writeFileSync(ownerFile, 'preserve');
    const ports = {
      ...f.ports,
      checkpoint: async (path: string, digest: string) => {
        await f.ports.checkpoint(path, digest);
        rmSync(path);
        symlinkSync(ownerFile, path);
      },
    };
    await expect(runGuardedStagingAdapter({ ...f.input, ports })).rejects.toThrow(
      /WG_STAGE_ADAPTER_STOPPED/,
    );
    expect(f.uploaded).toEqual([]);
    expect(readFileSync(ownerFile, 'utf8')).toBe('preserve');
  });
  it('stops on malformed receipt and retains the uncertain intent instead of deleting evidence', async () => {
    const f = fixture();
    const ports = { ...f.ports, upload: async () => '{"token":"secret-marker"}' };
    await expect(runGuardedStagingAdapter({ ...f.input, ports })).rejects.toThrow(
      /WG_STAGE_ADAPTER_STOPPED/,
    );
    expect(existsSync(f.journal)).toBe(true);
    expect(events(f.journal).at(-1).snapshot.uncertainPackage).toBe('@wayglass/core');
    expect(readFileSync(f.journal, 'utf8')).not.toContain('secret-marker');
  });
});
