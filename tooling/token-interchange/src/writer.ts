import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, mkdtemp, open, readFile, readdir, rename, rm } from 'node:fs/promises';
import { dirname, join, parse, posix, resolve } from 'node:path';

import type { DtcgExchange } from './dtcg.ts';
import { verifyDtcgExchange } from './evidence.ts';

const pointerName = 'current.json';
const releasesName = 'releases';
const lockName = '.wayglass-token-tooling.lock';
const releasePattern = /^[0-9a-f]{64}$/;
const uuidSource = '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
const pointerTempPattern = new RegExp(`^current\\.json\\.tmp-${uuidSource}$`, 'i');
const stagePattern = new RegExp(`^\\.stage-${uuidSource}-[a-z0-9]{6}$`, 'i');
const lockOwnerPattern = new RegExp(`^${uuidSource}$`, 'i');

interface DtcgExchangeLock {
  readonly format: 1;
  readonly owner: string;
  readonly pid: number;
}

export type ProcessState = 'absent' | 'live' | 'unverifiable';

export interface RecoverDtcgExchangeLockOptions {
  readonly processState?: (pid: number) => ProcessState | Promise<ProcessState>;
}

export interface DtcgExchangeLockRecovery {
  readonly status: 'absent' | 'removed';
  readonly pid?: number;
}

export interface DtcgExchangePointer {
  readonly format: 1;
  readonly release: string;
  readonly sourceRevision: string;
}

export interface WriteDtcgExchangeOptions {
  readonly replace?: boolean;
  readonly simulateFailureAfterFiles?: number;
  readonly simulateInterruptionAfter?: 'stage' | 'release';
}

export interface WriteDtcgExchangeResult extends DtcgExchangePointer {
  readonly status: 'created' | 'replaced' | 'unchanged';
}

export interface DtcgExchangeRecovery {
  readonly retainedRelease?: string;
  readonly removedPointerTemps: readonly string[];
  readonly removedReleases: readonly string[];
  readonly removedStages: readonly string[];
}

function errorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : undefined;
}

async function pathStatus(path: string) {
  try {
    return await lstat(path);
  } catch (error) {
    if (errorCode(error) === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

async function assertDirectory(path: string, label: string): Promise<void> {
  const status = await pathStatus(path);
  if (!status) {
    throw new Error(`${label} is missing.`);
  }
  if (status.isSymbolicLink() || !status.isDirectory()) {
    throw new Error(`${label} must be a directory and must not be a symbolic link.`);
  }
}

async function createDirectory(path: string, label: string): Promise<void> {
  await mkdir(path, { recursive: true });
  await assertDirectory(path, label);
}

function assertOutputRoot(root: string): string {
  if (!root.trim()) {
    throw new Error('DTCG exchange output root must not be empty.');
  }
  const resolved = resolve(root);
  if (resolved === parse(resolved).root) {
    throw new Error('DTCG exchange output root must not be a filesystem root.');
  }
  return resolved;
}

function releaseId(exchange: DtcgExchange): string {
  const manifest = exchange.files['wayglass-manifest.json'];
  if (manifest === undefined) {
    throw new Error('DTCG exchange manifest "wayglass-manifest.json" is missing.');
  }
  return createHash('sha256').update(manifest, 'utf8').digest('hex');
}

function assertArtifactPath(path: string): void {
  const segments = path.split('/');
  if (
    posix.isAbsolute(path) ||
    path.includes('\\') ||
    segments.some((segment) => !segment || segment === '.' || segment === '..')
  ) {
    throw new Error(`DTCG exchange artifact path "${path}" is unsafe.`);
  }
}

function parsePointer(content: string): DtcgExchangePointer {
  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch {
    throw new Error('DTCG exchange pointer is not valid JSON.');
  }

  if (
    typeof value !== 'object' ||
    value === null ||
    !('format' in value) ||
    value.format !== 1 ||
    !('release' in value) ||
    typeof value.release !== 'string' ||
    !releasePattern.test(value.release) ||
    !('sourceRevision' in value) ||
    typeof value.sourceRevision !== 'string' ||
    !/^[0-9a-f]{7,64}$/i.test(value.sourceRevision)
  ) {
    throw new Error('DTCG exchange pointer has an invalid structure.');
  }

  return {
    format: 1,
    release: value.release,
    sourceRevision: value.sourceRevision,
  };
}

function parseLock(content: string): DtcgExchangeLock {
  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch {
    throw new Error('DTCG exchange writer lock is not valid JSON and is unverifiable.');
  }

  if (
    typeof value !== 'object' ||
    value === null ||
    !('format' in value) ||
    value.format !== 1 ||
    !('owner' in value) ||
    typeof value.owner !== 'string' ||
    !lockOwnerPattern.test(value.owner) ||
    !('pid' in value) ||
    typeof value.pid !== 'number' ||
    !Number.isSafeInteger(value.pid) ||
    value.pid <= 0
  ) {
    throw new Error('DTCG exchange writer lock has an invalid structure and is unverifiable.');
  }

  return { format: 1, owner: value.owner, pid: value.pid };
}

async function readLock(root: string): Promise<DtcgExchangeLock | undefined> {
  const path = join(root, lockName);
  const status = await pathStatus(path);
  if (!status) {
    return undefined;
  }
  if (status.isSymbolicLink() || !status.isFile()) {
    throw new Error('DTCG exchange writer lock must be a regular file and is unverifiable.');
  }
  return parseLock(await readFile(path, 'utf8'));
}

export async function readDtcgExchangePointer(
  root: string,
): Promise<DtcgExchangePointer | undefined> {
  const path = join(root, pointerName);
  const status = await pathStatus(path);
  if (!status) {
    return undefined;
  }
  if (status.isSymbolicLink() || !status.isFile()) {
    throw new Error(
      'DTCG exchange pointer must be a regular file and must not be a symbolic link.',
    );
  }
  try {
    return parsePointer(await readFile(path, 'utf8'));
  } catch (error) {
    if (errorCode(error) === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

async function pathExists(path: string): Promise<boolean> {
  return (await pathStatus(path)) !== undefined;
}

async function readContainedFile(root: string, relativePath: string): Promise<string> {
  assertArtifactPath(relativePath);
  const segments = relativePath.split('/');
  let current = root;
  for (const [index, segment] of segments.entries()) {
    current = join(current, segment);
    const status = await pathStatus(current);
    if (!status) {
      throw new Error(`DTCG exchange artifact "${relativePath}" is missing.`);
    }
    if (status.isSymbolicLink()) {
      throw new Error(
        `DTCG exchange artifact "${relativePath}" must not traverse a symbolic link.`,
      );
    }
    const isFile = index === segments.length - 1;
    if ((isFile && !status.isFile()) || (!isFile && !status.isDirectory())) {
      throw new Error(`DTCG exchange artifact "${relativePath}" has an invalid filesystem type.`);
    }
  }
  return readFile(current, 'utf8');
}

async function readReleaseFiles(
  exchange: DtcgExchange,
  releaseDirectory: string,
): Promise<Readonly<Record<string, string>>> {
  return Object.fromEntries(
    await Promise.all(
      Object.keys(exchange.files).map(async (path) => {
        return [path, await readContainedFile(releaseDirectory, path)] as const;
      }),
    ),
  );
}

async function verifyRelease(exchange: DtcgExchange, releaseDirectory: string): Promise<void> {
  await assertDirectory(releaseDirectory, 'DTCG exchange release');
  const files = await readReleaseFiles(exchange, releaseDirectory);
  verifyDtcgExchange({ ...exchange, files });
}

async function listReleaseFiles(directory: string, prefix = ''): Promise<readonly string[]> {
  const paths: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) {
      throw new Error(`DTCG exchange release contains symbolic link "${relative}".`);
    }
    if (entry.isDirectory()) {
      paths.push(...(await listReleaseFiles(join(directory, entry.name), relative)));
    } else if (entry.isFile()) {
      paths.push(relative);
    } else {
      throw new Error(`DTCG exchange release contains unsupported entry "${relative}".`);
    }
  }
  return paths.sort();
}

async function verifyAcceptedRelease(root: string, pointer: DtcgExchangePointer): Promise<void> {
  const releaseDirectory = join(root, releasesName, pointer.release);
  await assertDirectory(releaseDirectory, `Accepted DTCG exchange release "${pointer.release}"`);
  const manifestContent = await readContainedFile(releaseDirectory, 'wayglass-manifest.json');
  if (createHash('sha256').update(manifestContent, 'utf8').digest('hex') !== pointer.release) {
    throw new Error(`Accepted DTCG exchange release "${pointer.release}" has an invalid identity.`);
  }

  let manifest: DtcgExchange['manifest'];
  try {
    manifest = JSON.parse(manifestContent) as DtcgExchange['manifest'];
  } catch {
    throw new Error(
      `Accepted DTCG exchange release "${pointer.release}" has invalid manifest JSON.`,
    );
  }
  if (
    typeof manifest !== 'object' ||
    manifest === null ||
    typeof manifest.sourceRevision !== 'string' ||
    typeof manifest.artifacts !== 'object' ||
    manifest.artifacts === null
  ) {
    throw new Error(`Accepted DTCG exchange release "${pointer.release}" has an invalid manifest.`);
  }
  if (manifest.sourceRevision !== pointer.sourceRevision) {
    throw new Error(
      `Accepted DTCG exchange release "${pointer.release}" does not match its pointer revision.`,
    );
  }

  const expectedPaths = [...Object.keys(manifest.artifacts), 'wayglass-manifest.json'].sort();
  const actualPaths = await listReleaseFiles(releaseDirectory);
  if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) {
    throw new Error(`Accepted DTCG exchange release "${pointer.release}" has invalid inventory.`);
  }
  const exchange = {
    manifest,
    files: Object.fromEntries(
      await Promise.all(
        expectedPaths.map(async (path) => {
          return [path, await readContainedFile(releaseDirectory, path)] as const;
        }),
      ),
    ),
  };
  verifyDtcgExchange(exchange);
}

async function isVerifiedOrphanRelease(root: string, release: string): Promise<boolean> {
  try {
    const manifestContent = await readContainedFile(
      join(root, releasesName, release),
      'wayglass-manifest.json',
    );
    const manifest = JSON.parse(manifestContent) as { readonly sourceRevision?: unknown };
    if (typeof manifest.sourceRevision !== 'string') {
      return false;
    }
    await verifyAcceptedRelease(root, {
      format: 1,
      release,
      sourceRevision: manifest.sourceRevision,
    });
    return true;
  } catch {
    return false;
  }
}

async function writeFileExclusively(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const handle = await open(path, 'wx');
  try {
    await handle.writeFile(content, 'utf8');
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function writeStage(
  exchange: DtcgExchange,
  stage: string,
  failAfterFiles?: number,
): Promise<void> {
  const entries = Object.entries(exchange.files);
  for (const [index, [path, content]] of entries.entries()) {
    assertArtifactPath(path);
    await writeFileExclusively(join(stage, ...path.split('/')), content);
    if (failAfterFiles !== undefined && index + 1 === failAfterFiles) {
      throw new Error(`Simulated DTCG exchange write failure after ${failAfterFiles} files.`);
    }
  }
  await verifyRelease(exchange, stage);
}

async function writePointer(root: string, pointer: DtcgExchangePointer): Promise<void> {
  const temporaryName = `${pointerName}.tmp-${randomUUID()}`;
  const temporaryPath = join(root, temporaryName);
  try {
    await writeFileExclusively(temporaryPath, `${JSON.stringify(pointer, null, 2)}\n`);
    await rename(temporaryPath, join(root, pointerName));
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
}

async function recoverDtcgExchangeRootUnlocked(root: string): Promise<DtcgExchangeRecovery> {
  const releases = join(root, releasesName);
  await createDirectory(releases, 'DTCG exchange releases root');
  const pointer = await readDtcgExchangePointer(root);
  if (pointer && !(await pathExists(join(releases, pointer.release)))) {
    throw new Error(`DTCG exchange pointer references missing release "${pointer.release}".`);
  }
  if (pointer) {
    await verifyAcceptedRelease(root, pointer);
  }

  const removedStages: string[] = [];
  const removedReleases: string[] = [];
  for (const entry of await readdir(releases, { withFileTypes: true })) {
    if (stagePattern.test(entry.name)) {
      if (entry.isSymbolicLink()) {
        throw new Error(
          `DTCG exchange recovery stage "${entry.name}" must not be a symbolic link.`,
        );
      }
      await rm(join(releases, entry.name), { recursive: true, force: true });
      removedStages.push(entry.name);
    } else if (
      entry.isDirectory() &&
      releasePattern.test(entry.name) &&
      entry.name !== pointer?.release
    ) {
      if (await isVerifiedOrphanRelease(root, entry.name)) {
        await rm(join(releases, entry.name), { recursive: true, force: true });
        removedReleases.push(entry.name);
      }
    } else if (entry.isSymbolicLink() && releasePattern.test(entry.name)) {
      throw new Error(
        `DTCG exchange recovery release "${entry.name}" must not be a symbolic link.`,
      );
    }
  }

  const removedPointerTemps: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (pointerTempPattern.test(entry.name)) {
      if (entry.isSymbolicLink()) {
        throw new Error(
          `DTCG exchange pointer temporary "${entry.name}" must not be a symbolic link.`,
        );
      }
      await rm(join(root, entry.name), { recursive: true, force: true });
      removedPointerTemps.push(entry.name);
    }
  }

  return {
    ...(pointer ? { retainedRelease: pointer.release } : {}),
    removedPointerTemps: removedPointerTemps.sort(),
    removedReleases: removedReleases.sort(),
    removedStages: removedStages.sort(),
  };
}

function defaultProcessState(pid: number): ProcessState {
  try {
    process.kill(pid, 0);
    return 'live';
  } catch (error) {
    return errorCode(error) === 'ESRCH' ? 'absent' : 'unverifiable';
  }
}

async function acquireLock(root: string): Promise<DtcgExchangeLock> {
  const lock: DtcgExchangeLock = { format: 1, owner: randomUUID(), pid: process.pid };
  const path = join(root, lockName);
  let handle;
  try {
    handle = await open(path, 'wx');
  } catch (error) {
    if (errorCode(error) !== 'EEXIST') {
      throw error;
    }
    const existing = await readLock(root);
    throw new Error(
      existing
        ? `DTCG exchange writer lock is held by process ${existing.pid}; recover it only after confirming that process is absent.`
        : 'DTCG exchange writer lock appeared concurrently; retry the operation.',
      { cause: error },
    );
  }

  try {
    await handle.writeFile(`${JSON.stringify(lock, null, 2)}\n`, 'utf8');
    await handle.sync();
  } finally {
    await handle.close();
  }
  return lock;
}

async function releaseLock(root: string, lock: DtcgExchangeLock): Promise<void> {
  const current = await readLock(root);
  if (!current || current.owner !== lock.owner || current.pid !== lock.pid) {
    throw new Error('DTCG exchange writer lock ownership changed before release.');
  }
  await rm(join(root, lockName));
}

async function withLock<T>(root: string, operation: () => Promise<T>): Promise<T> {
  const lock = await acquireLock(root);
  try {
    return await operation();
  } finally {
    await releaseLock(root, lock);
  }
}

export async function recoverStaleDtcgExchangeLock(
  root: string,
  options: RecoverDtcgExchangeLockOptions = {},
): Promise<DtcgExchangeLockRecovery> {
  const resolvedRoot = assertOutputRoot(root);
  await createDirectory(resolvedRoot, 'DTCG exchange output root');
  const lock = await readLock(resolvedRoot);
  if (!lock) {
    return { status: 'absent' };
  }

  const state = await (options.processState ?? defaultProcessState)(lock.pid);
  if (state === 'live') {
    throw new Error(`DTCG exchange writer lock belongs to live process ${lock.pid}.`);
  }
  if (state !== 'absent') {
    throw new Error(`DTCG exchange writer lock process ${lock.pid} cannot be verified as absent.`);
  }

  const quarantine = join(resolvedRoot, `${lockName}.stale-${randomUUID()}`);
  await rename(join(resolvedRoot, lockName), quarantine);
  try {
    const quarantined = parseLock(await readFile(quarantine, 'utf8'));
    if (quarantined.owner !== lock.owner || quarantined.pid !== lock.pid) {
      throw new Error('DTCG exchange writer lock changed during stale-lock recovery.');
    }
  } finally {
    await rm(quarantine, { force: true });
  }
  return { status: 'removed', pid: lock.pid };
}

export async function recoverDtcgExchangeRoot(root: string): Promise<DtcgExchangeRecovery> {
  const resolvedRoot = assertOutputRoot(root);
  await createDirectory(resolvedRoot, 'DTCG exchange output root');
  return withLock(resolvedRoot, () => recoverDtcgExchangeRootUnlocked(resolvedRoot));
}

export async function writeDtcgExchange(
  exchange: DtcgExchange,
  root: string,
  options: WriteDtcgExchangeOptions = {},
): Promise<WriteDtcgExchangeResult> {
  verifyDtcgExchange(exchange);
  for (const path of Object.keys(exchange.files)) {
    assertArtifactPath(path);
  }

  const resolvedRoot = assertOutputRoot(root);
  await createDirectory(resolvedRoot, 'DTCG exchange output root');
  return withLock(resolvedRoot, async () => {
    await recoverDtcgExchangeRootUnlocked(resolvedRoot);

    const current = await readDtcgExchangePointer(resolvedRoot);
    const release = releaseId(exchange);
    const pointer: DtcgExchangePointer = {
      format: 1,
      release,
      sourceRevision: exchange.manifest.sourceRevision,
    };
    const releases = join(resolvedRoot, releasesName);
    const releaseDirectory = join(releases, release);

    if (current?.release === release) {
      await verifyRelease(exchange, releaseDirectory);
      return { ...pointer, status: 'unchanged' };
    }
    if (current && !options.replace) {
      throw new Error(
        `DTCG exchange root already accepts release "${current.release}"; set replace to update it.`,
      );
    }

    const stage = await mkdtemp(join(releases, `.stage-${randomUUID()}-`));
    let preserveStage = false;
    try {
      await writeStage(exchange, stage, options.simulateFailureAfterFiles);
      if (options.simulateInterruptionAfter === 'stage') {
        preserveStage = true;
        throw new Error('Simulated DTCG exchange process interruption after staging.');
      }
      await rename(stage, releaseDirectory);
    } catch (error) {
      if (!preserveStage) {
        await rm(stage, { recursive: true, force: true });
      }
      throw error;
    }

    if (options.simulateInterruptionAfter === 'release') {
      throw new Error('Simulated DTCG exchange process interruption after release commit.');
    }

    await writePointer(resolvedRoot, pointer);
    await recoverDtcgExchangeRootUnlocked(resolvedRoot);
    return { ...pointer, status: current ? 'replaced' : 'created' };
  });
}
