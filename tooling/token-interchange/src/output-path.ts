import { lstat, readdir, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

import { repositoryRoot } from './repository.ts';

function errorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : undefined;
}

async function exists(path: string): Promise<boolean> {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (errorCode(error) === 'ENOENT') return false;
    throw error;
  }
}

async function canonicalTarget(path: string): Promise<string> {
  const missing: string[] = [];
  let existing = resolve(path);
  while (!(await exists(existing))) {
    const parent = dirname(existing);
    if (parent === existing) {
      throw new Error(`Exchange output path "${path}" has no resolvable ancestor.`);
    }
    missing.unshift(basename(existing));
    existing = parent;
  }
  return join(await realpath(existing), ...missing);
}

function isWithin(root: string, target: string): boolean {
  const path = relative(root, target);
  return path !== '' && path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path);
}

async function assertToolOwnedOrEmpty(path: string): Promise<void> {
  if (!(await exists(path))) return;
  const status = await lstat(path);
  if (!status.isDirectory()) {
    throw new Error('Private exchange output must be a directory.');
  }
  const entries = await readdir(path);
  if (entries.length > 0 && !entries.includes('current.json') && !entries.includes('releases')) {
    throw new Error(
      'Private exchange output is nonempty and has no recognized Wayglass exchange state.',
    );
  }
}

export async function resolveExchangeOutputPath(
  requestedPath: string,
  launchDirectory = process.cwd(),
): Promise<string> {
  if (!requestedPath.trim()) {
    throw new Error('Private exchange output path must not be empty.');
  }

  const target = await canonicalTarget(resolve(launchDirectory, requestedPath));
  const canonicalRepositoryRoot = await canonicalTarget(repositoryRoot);
  if (target === canonicalRepositoryRoot) {
    throw new Error(
      'Private exchange output must be inside the repository or an operating-system temporary directory.',
    );
  }
  const roots = await Promise.all(
    [canonicalRepositoryRoot, tmpdir(), ...(process.platform === 'win32' ? [] : ['/tmp'])]
      .filter((path, index, values) => values.indexOf(path) === index)
      .map(async (path) => canonicalTarget(path)),
  );
  if (!roots.some((root) => isWithin(root, target))) {
    throw new Error(
      'Private exchange output must be inside the repository or an operating-system temporary directory.',
    );
  }
  await assertToolOwnedOrEmpty(target);
  return target;
}
