import { randomUUID } from 'node:crypto';
import { lstat, mkdir, open, readFile, rename, rm } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';

import {
  generatedArtifactPaths,
  type GeneratedArtifactPath,
  type GeneratedIconArtifacts,
} from './generation.ts';
import { asGeneratedIconArtifacts, verifyGeneratedArtifactIntegrity } from './integrity.ts';

const lockName = '.wayglass-icon-tooling.lock';
const ownerPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const outputManifestPath = generatedArtifactPaths[2];
const replacementOrder = [
  generatedArtifactPaths[0],
  generatedArtifactPaths[1],
  generatedArtifactPaths[3],
  outputManifestPath,
] as const;

type ProcessState = 'absent' | 'live' | 'unverifiable';

interface LockArtifact {
  readonly path: GeneratedArtifactPath;
  readonly hadPrevious: boolean;
}

interface IconWriterLock {
  readonly format: 1;
  readonly owner: string;
  readonly pid: number;
  readonly state: 'acquired' | 'prepared';
  readonly artifacts?: readonly LockArtifact[];
}

interface PreparedArtifact extends LockArtifact {
  readonly content: string;
  readonly destination: string;
  readonly previous?: string;
  readonly stage: string;
  readonly backup: string;
}

export interface IconWriterOptions {
  readonly simulateFailureAfterStagedFiles?: number;
  readonly simulateFailureAfterReplacements?: number;
  readonly simulateInterruptionAfterReplacements?: number;
}

export interface IconWriterResult {
  readonly created: readonly GeneratedArtifactPath[];
  readonly unchanged: readonly GeneratedArtifactPath[];
  readonly updated: readonly GeneratedArtifactPath[];
}

export interface IconRecoveryOptions {
  readonly processState?: (pid: number) => ProcessState | Promise<ProcessState>;
}

export interface IconRecoveryResult {
  readonly pid: number;
  readonly restored: readonly GeneratedArtifactPath[];
  readonly status: 'removed';
}

class SimulatedInterruption extends Error {}

function errorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : undefined;
}

async function pathStatus(path: string) {
  try {
    return await lstat(path);
  } catch (error) {
    if (errorCode(error) === 'ENOENT') return undefined;
    throw error;
  }
}

async function assertRepositoryRoot(root: string): Promise<string> {
  const resolved = resolve(root);
  const status = await pathStatus(resolved);
  if (!status || status.isSymbolicLink() || !status.isDirectory()) {
    throw new Error('Icon repository root must be an existing directory and not a symbolic link.');
  }
  return resolved;
}

function artifactDestination(root: string, path: GeneratedArtifactPath): string {
  const destination = resolve(root, ...path.split('/'));
  const inside = relative(root, destination);
  if (!inside || inside.startsWith(`..${sep}`) || inside === '..') {
    throw new Error(`Icon artifact path "${path}" escapes the repository root.`);
  }
  return destination;
}

async function ensureSafeParent(root: string, destination: string): Promise<void> {
  const segments = relative(root, dirname(destination)).split(sep).filter(Boolean);
  let current = root;
  for (const segment of segments) {
    current = join(current, segment);
    const status = await pathStatus(current);
    if (!status) {
      await mkdir(current);
      continue;
    }
    if (status.isSymbolicLink() || !status.isDirectory()) {
      throw new Error(`Icon artifact parent "${current}" is not a safe directory.`);
    }
  }
}

async function hasSafeExistingParent(root: string, destination: string): Promise<boolean> {
  const segments = relative(root, dirname(destination)).split(sep).filter(Boolean);
  let current = root;
  for (const segment of segments) {
    current = join(current, segment);
    const status = await pathStatus(current);
    if (!status) return false;
    if (status.isSymbolicLink() || !status.isDirectory()) {
      throw new Error(`Icon artifact parent "${current}" is not a safe directory.`);
    }
  }
  return true;
}

async function readRegularFile(path: string, description: string): Promise<string | undefined> {
  const status = await pathStatus(path);
  if (!status) return undefined;
  if (status.isSymbolicLink() || !status.isFile()) {
    throw new Error(`${description} must be a regular file and not a symbolic link.`);
  }
  return readFile(path, 'utf8');
}

async function writeExclusively(path: string, content: string): Promise<void> {
  const handle = await open(path, 'wx');
  try {
    await handle.writeFile(content, 'utf8');
    await handle.sync();
  } finally {
    await handle.close();
  }
}

function lockJson(lock: IconWriterLock): string {
  return `${JSON.stringify(lock, undefined, 2)}\n`;
}

function parseLock(content: string): IconWriterLock {
  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch {
    throw new Error('Icon writer lock is not valid JSON and is unverifiable.');
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Icon writer lock has an invalid structure and is unverifiable.');
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort().join('\0');
  const acquiredKeys = ['format', 'owner', 'pid', 'state'].sort().join('\0');
  const preparedKeys = ['artifacts', 'format', 'owner', 'pid', 'state'].sort().join('\0');
  if (
    record.format !== 1 ||
    typeof record.owner !== 'string' ||
    !ownerPattern.test(record.owner) ||
    typeof record.pid !== 'number' ||
    !Number.isInteger(record.pid) ||
    record.pid <= 0 ||
    (record.state !== 'acquired' && record.state !== 'prepared') ||
    (record.state === 'acquired' && keys !== acquiredKeys) ||
    (record.state === 'prepared' && keys !== preparedKeys)
  ) {
    throw new Error('Icon writer lock has an invalid structure and is unverifiable.');
  }
  if (record.state === 'acquired') {
    return { format: 1, owner: record.owner, pid: record.pid, state: 'acquired' };
  }
  if (
    !Array.isArray(record.artifacts) ||
    record.artifacts.length !== generatedArtifactPaths.length
  ) {
    throw new Error('Icon writer lock has an invalid artifact journal and is unverifiable.');
  }
  const artifacts = record.artifacts.map((entry, index): LockArtifact => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new Error('Icon writer lock has an invalid artifact journal and is unverifiable.');
    }
    const artifact = entry as Record<string, unknown>;
    const expectedPath = replacementOrder[index];
    if (
      !expectedPath ||
      Object.keys(artifact).sort().join('\0') !== ['hadPrevious', 'path'].sort().join('\0') ||
      artifact.path !== expectedPath ||
      typeof artifact.hadPrevious !== 'boolean'
    ) {
      throw new Error('Icon writer lock has an invalid artifact journal and is unverifiable.');
    }
    return { path: expectedPath, hadPrevious: artifact.hadPrevious };
  });
  return {
    format: 1,
    owner: record.owner,
    pid: record.pid,
    state: 'prepared',
    artifacts,
  };
}

async function readLock(root: string): Promise<IconWriterLock | undefined> {
  const path = join(root, lockName);
  const content = await readRegularFile(path, 'Icon writer lock');
  return content === undefined ? undefined : parseLock(content);
}

async function acquireLock(root: string): Promise<IconWriterLock> {
  const lock: IconWriterLock = {
    format: 1,
    owner: randomUUID(),
    pid: process.pid,
    state: 'acquired',
  };
  try {
    await writeExclusively(join(root, lockName), lockJson(lock));
  } catch (error) {
    if (errorCode(error) !== 'EEXIST') throw error;
    const existing = await readLock(root);
    throw new Error(
      existing
        ? `Icon writer lock is held by process ${existing.pid}; recover it only after confirming that process is absent.`
        : 'Icon writer lock appeared concurrently; retry the operation.',
      { cause: error },
    );
  }
  return lock;
}

async function replaceOwnedLock(root: string, current: IconWriterLock, next: IconWriterLock) {
  const found = await readLock(root);
  if (!found || found.owner !== current.owner || found.pid !== current.pid) {
    throw new Error('Icon writer lock ownership changed before journal update.');
  }
  const handle = await open(join(root, lockName), 'r+');
  try {
    await handle.truncate(0);
    await handle.write(lockJson(next), 0, 'utf8');
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function releaseLock(root: string, lock: IconWriterLock): Promise<void> {
  const current = await readLock(root);
  if (!current || current.owner !== lock.owner || current.pid !== lock.pid) {
    throw new Error('Icon writer lock ownership changed before release.');
  }
  await rm(join(root, lockName));
}

function siblingPath(destination: string, kind: 'backup' | 'stage', owner: string): string {
  return `${destination}.wayglass-icon-${kind}-${owner}`;
}

async function prepareArtifacts(
  root: string,
  artifacts: GeneratedIconArtifacts,
  owner: string,
): Promise<readonly PreparedArtifact[]> {
  const prepared: PreparedArtifact[] = [];
  for (const path of replacementOrder) {
    const destination = artifactDestination(root, path);
    await ensureSafeParent(root, destination);
    const previous = await readRegularFile(destination, `Icon artifact "${path}"`);
    prepared.push({
      path,
      content: artifacts[path],
      destination,
      ...(previous === undefined ? {} : { previous }),
      hadPrevious: previous !== undefined,
      stage: siblingPath(destination, 'stage', owner),
      backup: siblingPath(destination, 'backup', owner),
    });
  }
  return prepared;
}

async function removeOwnedRegular(path: string): Promise<void> {
  const status = await pathStatus(path);
  if (!status) return;
  if (status.isSymbolicLink() || !status.isFile()) {
    throw new Error(`Tool-owned path "${path}" is not a regular file.`);
  }
  await rm(path);
}

async function cleanupPrepared(prepared: readonly PreparedArtifact[]): Promise<void> {
  for (const artifact of prepared) {
    await removeOwnedRegular(artifact.stage);
    await removeOwnedRegular(artifact.backup);
  }
}

async function rollbackPrepared(
  prepared: readonly PreparedArtifact[],
  replaced: ReadonlySet<GeneratedArtifactPath>,
): Promise<void> {
  for (const artifact of [...prepared].reverse()) {
    const backup = await pathStatus(artifact.backup);
    if (backup) {
      if (backup.isSymbolicLink() || !backup.isFile()) {
        throw new Error(`Icon backup for "${artifact.path}" is not a regular file.`);
      }
      await removeOwnedRegular(artifact.destination);
      await rename(artifact.backup, artifact.destination);
    } else if (replaced.has(artifact.path) && !artifact.hadPrevious) {
      await removeOwnedRegular(artifact.destination);
    }
  }
  await cleanupPrepared(prepared);
}

export async function readCommittedIconArtifacts(
  repositoryRoot: string,
): Promise<Readonly<Record<string, string>>> {
  const root = await assertRepositoryRoot(repositoryRoot);
  const entries: Array<readonly [string, string]> = [];
  for (const path of generatedArtifactPaths) {
    const destination = artifactDestination(root, path);
    if (!(await hasSafeExistingParent(root, destination))) continue;
    const content = await readRegularFile(destination, `Icon artifact "${path}"`);
    if (content !== undefined) entries.push([path, content]);
  }
  return Object.freeze(Object.fromEntries(entries));
}

export async function verifyCommittedIconArtifacts(repositoryRoot: string) {
  const files = await readCommittedIconArtifacts(repositoryRoot);
  return verifyGeneratedArtifactIntegrity(asGeneratedIconArtifacts(files));
}

export async function writeIconArtifacts(
  repositoryRoot: string,
  artifacts: GeneratedIconArtifacts,
  options: IconWriterOptions = {},
): Promise<IconWriterResult> {
  verifyGeneratedArtifactIntegrity(artifacts);
  const root = await assertRepositoryRoot(repositoryRoot);
  const acquired = await acquireLock(root);
  let lock = acquired;
  let prepared: readonly PreparedArtifact[] = [];
  const replaced = new Set<GeneratedArtifactPath>();
  try {
    prepared = await prepareArtifacts(root, artifacts, acquired.owner);
    lock = {
      ...acquired,
      state: 'prepared',
      artifacts: prepared.map(({ path, hadPrevious }) => ({ path, hadPrevious })),
    };
    await replaceOwnedLock(root, acquired, lock);
    const changed = prepared.filter(({ content, previous }) => content !== previous);

    for (const [index, artifact] of changed.entries()) {
      await writeExclusively(artifact.stage, artifact.content);
      if (options.simulateFailureAfterStagedFiles === index + 1) {
        throw new Error(`Simulated icon writer failure after staging ${index + 1} files.`);
      }
    }
    for (const artifact of changed) {
      if (
        (await readRegularFile(artifact.stage, `Icon stage for "${artifact.path}"`)) !==
        artifact.content
      ) {
        throw new Error(`Staged icon artifact "${artifact.path}" failed content verification.`);
      }
    }
    for (const [index, artifact] of changed.entries()) {
      if (artifact.previous !== undefined) await rename(artifact.destination, artifact.backup);
      await rename(artifact.stage, artifact.destination);
      replaced.add(artifact.path);
      if (options.simulateInterruptionAfterReplacements === index + 1) {
        throw new SimulatedInterruption(
          `Simulated icon writer interruption after replacing ${index + 1} files.`,
        );
      }
      if (options.simulateFailureAfterReplacements === index + 1) {
        throw new Error(`Simulated icon writer failure after replacing ${index + 1} files.`);
      }
    }
    await verifyCommittedIconArtifacts(root);
    await cleanupPrepared(prepared);
    await releaseLock(root, lock);
    return Object.freeze({
      created: changed.filter(({ previous }) => previous === undefined).map(({ path }) => path),
      unchanged: prepared
        .filter(({ content, previous }) => content === previous)
        .map(({ path }) => path),
      updated: changed.filter(({ previous }) => previous !== undefined).map(({ path }) => path),
    });
  } catch (error) {
    if (error instanceof SimulatedInterruption) throw error;
    try {
      await rollbackPrepared(prepared, replaced);
      await releaseLock(root, lock);
    } catch (rollbackError) {
      throw new AggregateError(
        [error, rollbackError],
        'Icon writer failed and could not completely restore the previous artifact set.',
        { cause: rollbackError },
      );
    }
    throw error;
  }
}

async function defaultProcessState(pid: number): Promise<ProcessState> {
  try {
    process.kill(pid, 0);
    return 'live';
  } catch (error) {
    if (errorCode(error) === 'ESRCH') return 'absent';
    return 'unverifiable';
  }
}

export async function recoverStaleIconWriterLock(
  repositoryRoot: string,
  options: IconRecoveryOptions = {},
): Promise<IconRecoveryResult> {
  const root = await assertRepositoryRoot(repositoryRoot);
  const lock = await readLock(root);
  if (!lock) throw new Error('Icon writer lock is absent; no stale recovery is required.');
  const state = await (options.processState ?? defaultProcessState)(lock.pid);
  if (state === 'live') throw new Error(`Icon writer lock belongs to live process ${lock.pid}.`);
  if (state === 'unverifiable') {
    throw new Error(`Icon writer lock process ${lock.pid} cannot be verified as absent.`);
  }

  const restored: GeneratedArtifactPath[] = [];
  if (lock.state === 'prepared') {
    for (const artifact of [...lock.artifacts!].reverse()) {
      const destination = artifactDestination(root, artifact.path);
      if (!(await hasSafeExistingParent(root, destination))) {
        throw new Error(`Icon recovery parent for "${artifact.path}" is missing.`);
      }
      const backup = siblingPath(destination, 'backup', lock.owner);
      const stage = siblingPath(destination, 'stage', lock.owner);
      const backupStatus = await pathStatus(backup);
      if (backupStatus) {
        if (backupStatus.isSymbolicLink() || !backupStatus.isFile()) {
          throw new Error(`Icon recovery backup for "${artifact.path}" is not a regular file.`);
        }
        await removeOwnedRegular(destination);
        await rename(backup, destination);
        restored.push(artifact.path);
      } else if (!artifact.hadPrevious) {
        await removeOwnedRegular(destination);
        restored.push(artifact.path);
      }
      await removeOwnedRegular(stage);
    }
  }

  await verifyCommittedIconArtifacts(root);
  const current = await readLock(root);
  if (!current || current.owner !== lock.owner || current.pid !== lock.pid) {
    throw new Error('Icon writer lock changed during stale-lock recovery.');
  }
  await rm(join(root, lockName));
  return Object.freeze({ pid: lock.pid, restored: Object.freeze(restored), status: 'removed' });
}
