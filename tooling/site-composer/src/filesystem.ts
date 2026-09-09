import {
  chmodSync,
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
} from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';

import { fail } from './error.ts';
import { sha256 } from './hash.ts';
import type { InventoryEntry } from './types.ts';

function portable(path: string): string {
  return path.split(sep).join('/');
}

function isWithin(parent: string, child: string): boolean {
  const path = relative(parent, child);
  return path !== '' && !path.startsWith('..') && !isAbsolute(path);
}

function readRegularFile(path: string): {
  readonly bytes: Uint8Array;
  readonly links: number;
  readonly mode: number;
} {
  let descriptor: number | undefined;
  try {
    descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    const before = fstatSync(descriptor);
    if (!before.isFile()) fail('WG_SITE_ENTRY_TYPE', 'Input contains a non-regular file.');
    const bytes = readFileSync(descriptor);
    const after = fstatSync(descriptor);
    if (
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== after.size ||
      before.mtimeMs !== after.mtimeMs
    ) {
      fail('WG_SITE_INPUT_CHANGED', 'An input file changed while it was read.');
    }
    return { bytes, links: after.nlink, mode: after.mode & 0o777 };
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ELOOP') {
      fail('WG_SITE_ENTRY_TYPE', 'Input contains a symbolic link.');
    }
    throw error;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function scan(root: string, directory: string, entries: InventoryEntry[]): void {
  for (const name of readdirSync(directory).sort()) {
    const absolute = resolve(directory, name);
    const path = portable(relative(root, absolute));
    const status = lstatSync(absolute);
    if (status.isSymbolicLink()) {
      entries.push({ path, kind: 'symlink' });
      continue;
    }
    const resolved = realpathSync(absolute);
    if (!isWithin(root, resolved))
      fail('WG_SITE_PATH_ESCAPE', 'Input path escapes its surface root.');
    if (status.isDirectory()) {
      entries.push({ path, kind: 'directory', mode: status.mode & 0o777 });
      scan(root, absolute, entries);
      continue;
    }
    if (status.isFile()) {
      const file = readRegularFile(absolute);
      entries.push({ path, kind: 'file', ...file });
      continue;
    }
    const kind = status.isSocket()
      ? 'socket'
      : status.isFIFO()
        ? 'fifo'
        : status.isCharacterDevice() || status.isBlockDevice()
          ? 'device'
          : 'other';
    entries.push({ path, kind });
  }
}

export function assertRealDirectoryPath(root: string, path: string): string {
  const repository = realpathSync(root);
  const relativePath = relative(repository, resolve(path));
  if (relativePath === '' || relativePath.startsWith('..') || isAbsolute(relativePath)) {
    fail('WG_SITE_SOURCE_PATH', 'Surface source must be a repository descendant.');
  }
  let cursor = repository;
  for (const segment of relativePath.split(sep)) {
    cursor = resolve(cursor, segment);
    const status = lstatSync(cursor);
    if (status.isSymbolicLink() || !status.isDirectory()) {
      fail('WG_SITE_SOURCE_PATH', 'Surface source and its ancestors must be real directories.');
    }
  }
  return cursor;
}

export function scanDirectory(path: string): readonly InventoryEntry[] {
  const status = lstatSync(path);
  if (!status.isDirectory() || status.isSymbolicLink()) {
    fail('WG_SITE_SOURCE_PATH', 'Inventory root must be a real directory.');
  }
  const root = realpathSync(path);
  const entries: InventoryEntry[] = [];
  scan(root, root, entries);
  return entries;
}

export function assertFilesystemInventoriesEqual(
  before: readonly InventoryEntry[],
  after: readonly InventoryEntry[],
): void {
  if (before.length !== after.length) {
    fail('WG_SITE_INPUT_CHANGED', 'Input entry count changed during composition.');
  }
  for (let index = 0; index < before.length; index += 1) {
    const left = before[index];
    const right = after[index];
    if (
      left === undefined ||
      right === undefined ||
      left.path !== right.path ||
      left.kind !== right.kind ||
      left.links !== right.links ||
      (left.bytes === undefined) !== (right.bytes === undefined) ||
      (left.bytes !== undefined &&
        right.bytes !== undefined &&
        (left.bytes.byteLength !== right.bytes.byteLength ||
          sha256(left.bytes) !== sha256(right.bytes)))
    ) {
      fail('WG_SITE_INPUT_CHANGED', `Input inventory changed at sorted index ${index}.`);
    }
  }
}

export function normalizeMode(path: string, kind: 'directory' | 'file'): void {
  chmodSync(path, kind === 'directory' ? 0o755 : 0o644);
}
