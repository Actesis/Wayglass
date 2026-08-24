import { randomUUID } from 'node:crypto';
import { lstat, mkdir, open, readFile, rename, rm } from 'node:fs/promises';
import { basename, dirname, parse, resolve } from 'node:path';

export interface WebArtifactWrite {
  readonly path: string;
  readonly content: string;
}

export interface WriteWebArtifactsOptions {
  readonly simulateFailureAfterStagedFiles?: number;
  readonly simulateFailureAfterReplacements?: number;
}

export interface WriteWebArtifactsResult {
  readonly created: readonly string[];
  readonly unchanged: readonly string[];
  readonly updated: readonly string[];
}

interface PreparedArtifact {
  readonly path: string;
  readonly content: string;
  readonly previous?: string;
  readonly temporaryPath: string;
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

async function readPrevious(path: string): Promise<string | undefined> {
  const status = await pathStatus(path);
  if (!status) {
    return undefined;
  }
  if (status.isSymbolicLink() || !status.isFile()) {
    throw new Error(`Web artifact "${path}" must be a regular file and not a symbolic link.`);
  }
  return readFile(path, 'utf8');
}

async function assertParentDirectory(path: string): Promise<void> {
  const parent = dirname(path);
  await mkdir(parent, { recursive: true });
  const status = await lstat(parent);
  if (status.isSymbolicLink() || !status.isDirectory()) {
    throw new Error(`Web artifact parent "${parent}" must be a directory and not a symbolic link.`);
  }
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

function resolvedArtifacts(artifacts: readonly WebArtifactWrite[]): readonly WebArtifactWrite[] {
  if (artifacts.length === 0) {
    throw new Error('Web artifact generation requires at least one output.');
  }

  const seen = new Set<string>();
  return artifacts.map((artifact) => {
    const path = resolve(artifact.path);
    if (path === parse(path).root || !basename(path)) {
      throw new Error(`Web artifact path "${artifact.path}" is unsafe.`);
    }
    if (seen.has(path)) {
      throw new Error(`Web artifact path "${path}" is duplicated.`);
    }
    seen.add(path);
    return { path, content: artifact.content };
  });
}

async function prepareArtifacts(
  artifacts: readonly WebArtifactWrite[],
): Promise<readonly PreparedArtifact[]> {
  const prepared: PreparedArtifact[] = [];
  for (const artifact of resolvedArtifacts(artifacts)) {
    await assertParentDirectory(artifact.path);
    const previous = await readPrevious(artifact.path);
    prepared.push({
      ...artifact,
      ...(previous === undefined ? {} : { previous }),
      temporaryPath: `${artifact.path}.wayglass-tmp-${randomUUID()}`,
    });
  }
  return prepared;
}

async function rollback(replaced: readonly PreparedArtifact[]): Promise<void> {
  for (const artifact of [...replaced].reverse()) {
    if (artifact.previous === undefined) {
      await rm(artifact.path, { force: true });
      continue;
    }
    const rollbackPath = `${artifact.path}.wayglass-rollback-${randomUUID()}`;
    try {
      await writeExclusively(rollbackPath, artifact.previous);
      await rename(rollbackPath, artifact.path);
    } finally {
      await rm(rollbackPath, { force: true });
    }
  }
}

export async function writeWebArtifacts(
  artifacts: readonly WebArtifactWrite[],
  options: WriteWebArtifactsOptions = {},
): Promise<WriteWebArtifactsResult> {
  const prepared = await prepareArtifacts(artifacts);
  const changed = prepared.filter((artifact) => artifact.previous !== artifact.content);
  const replaced: PreparedArtifact[] = [];
  try {
    for (const [index, artifact] of changed.entries()) {
      await writeExclusively(artifact.temporaryPath, artifact.content);
      if (options.simulateFailureAfterStagedFiles === index + 1) {
        throw new Error(`Simulated web artifact failure after staging ${index + 1} files.`);
      }
    }
    for (const artifact of changed) {
      if ((await readFile(artifact.temporaryPath, 'utf8')) !== artifact.content) {
        throw new Error(`Staged web artifact "${artifact.path}" failed content verification.`);
      }
    }

    for (const [index, artifact] of changed.entries()) {
      await rename(artifact.temporaryPath, artifact.path);
      replaced.push(artifact);
      if (options.simulateFailureAfterReplacements === index + 1) {
        throw new Error(`Simulated web artifact failure after replacing ${index + 1} files.`);
      }
    }
  } catch (error) {
    await rollback(replaced);
    throw error;
  } finally {
    await Promise.all(prepared.map((artifact) => rm(artifact.temporaryPath, { force: true })));
  }

  return {
    created: changed.filter((artifact) => artifact.previous === undefined).map(({ path }) => path),
    unchanged: prepared
      .filter((artifact) => artifact.previous === artifact.content)
      .map(({ path }) => path),
    updated: changed.filter((artifact) => artifact.previous !== undefined).map(({ path }) => path),
  };
}
