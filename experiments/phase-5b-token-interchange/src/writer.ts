import { createHash, randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, open, readFile, readdir, rename, rm, stat } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';

import type { DtcgExchange } from '../../../tooling/token-interchange/src/dtcg.js';
import { verifyDtcgExchange } from '../../../tooling/token-interchange/src/evidence.js';

const pointerName = 'current.json';
const releasesName = 'releases';
const releasePattern = /^[0-9a-f]{64}$/;
const uuidSource = '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
const pointerTempPattern = new RegExp(`^current\\.json\\.tmp-${uuidSource}$`, 'i');
const stagePattern = new RegExp(`^\\.stage-${uuidSource}-[a-z0-9]{6}$`, 'i');

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

export async function readDtcgExchangePointer(
  root: string,
): Promise<DtcgExchangePointer | undefined> {
  try {
    return parsePointer(await readFile(join(root, pointerName), 'utf8'));
  } catch (error) {
    if (errorCode(error) === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (errorCode(error) === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function readReleaseFiles(
  exchange: DtcgExchange,
  releaseDirectory: string,
): Promise<Readonly<Record<string, string>>> {
  return Object.fromEntries(
    await Promise.all(
      Object.keys(exchange.files).map(async (path) => {
        assertArtifactPath(path);
        return [path, await readFile(join(releaseDirectory, ...path.split('/')), 'utf8')] as const;
      }),
    ),
  );
}

async function verifyRelease(exchange: DtcgExchange, releaseDirectory: string): Promise<void> {
  const files = await readReleaseFiles(exchange, releaseDirectory);
  verifyDtcgExchange({ ...exchange, files });
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

export async function recoverDtcgExchangeRoot(root: string): Promise<DtcgExchangeRecovery> {
  const releases = join(root, releasesName);
  await mkdir(releases, { recursive: true });
  const pointer = await readDtcgExchangePointer(root);
  if (pointer && !(await pathExists(join(releases, pointer.release)))) {
    throw new Error(`DTCG exchange pointer references missing release "${pointer.release}".`);
  }

  const removedStages: string[] = [];
  const removedReleases: string[] = [];
  for (const entry of await readdir(releases, { withFileTypes: true })) {
    if (stagePattern.test(entry.name)) {
      await rm(join(releases, entry.name), { recursive: true, force: true });
      removedStages.push(entry.name);
    } else if (
      entry.isDirectory() &&
      releasePattern.test(entry.name) &&
      entry.name !== pointer?.release
    ) {
      await rm(join(releases, entry.name), { recursive: true, force: true });
      removedReleases.push(entry.name);
    }
  }

  const removedPointerTemps: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (pointerTempPattern.test(entry.name)) {
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

export async function writeDtcgExchange(
  exchange: DtcgExchange,
  root: string,
  options: WriteDtcgExchangeOptions = {},
): Promise<WriteDtcgExchangeResult> {
  verifyDtcgExchange(exchange);
  for (const path of Object.keys(exchange.files)) {
    assertArtifactPath(path);
  }

  await mkdir(root, { recursive: true });
  await recoverDtcgExchangeRoot(root);

  const current = await readDtcgExchangePointer(root);
  const release = releaseId(exchange);
  const pointer: DtcgExchangePointer = {
    format: 1,
    release,
    sourceRevision: exchange.manifest.sourceRevision,
  };
  const releases = join(root, releasesName);
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

  await writePointer(root, pointer);
  await recoverDtcgExchangeRoot(root);
  return { ...pointer, status: current ? 'replaced' : 'created' };
}
