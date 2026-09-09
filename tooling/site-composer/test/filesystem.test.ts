import { execFileSync } from 'node:child_process';
import { linkSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  assertFilesystemInventoriesEqual,
  assertRealDirectoryPath,
  scanDirectory,
} from '../src/filesystem.ts';
import { inspectSurfaceInventory } from '../src/inventory.ts';

const temporary: string[] = [];

function temp(): string {
  const path = mkdtempSync(resolve(tmpdir(), 'wayglass-site-filesystem-'));
  temporary.push(path);
  return path;
}

afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

describe('filesystem inventory adapter', () => {
  it('reads regular bytes and directory entries without following links', () => {
    const root = temp();
    mkdirSync(resolve(root, 'assets'));
    writeFileSync(resolve(root, 'index.html'), 'index\n');
    writeFileSync(resolve(root, '404.html'), 'missing\n');
    writeFileSync(resolve(root, 'assets/app.js'), 'app\n');
    const entries = scanDirectory(root);
    expect(entries.map(({ path, kind }) => ({ path, kind }))).toEqual([
      { path: '404.html', kind: 'file' },
      { path: 'assets', kind: 'directory' },
      { path: 'assets/app.js', kind: 'file' },
      { path: 'index.html', kind: 'file' },
    ]);
    expect(() => inspectSurfaceInventory('documentation', entries)).not.toThrow();
  });

  it('rejects symlink files, symlink directories, and hard-linked aliases', () => {
    const root = temp();
    writeFileSync(resolve(root, 'index.html'), 'index\n');
    writeFileSync(resolve(root, '404.html'), 'missing\n');
    symlinkSync(resolve(root, 'index.html'), resolve(root, 'linked-file'));
    expect(() => inspectSurfaceInventory('documentation', scanDirectory(root))).toThrow(
      'WG_SITE_ENTRY_TYPE',
    );

    rmSync(resolve(root, 'linked-file'));
    mkdirSync(resolve(root, 'real-directory'));
    symlinkSync(resolve(root, 'real-directory'), resolve(root, 'linked-directory'), 'dir');
    expect(() => inspectSurfaceInventory('documentation', scanDirectory(root))).toThrow(
      'WG_SITE_ENTRY_TYPE',
    );

    rmSync(resolve(root, 'linked-directory'));
    linkSync(resolve(root, 'index.html'), resolve(root, 'hard-link'));
    expect(() => inspectSurfaceInventory('documentation', scanDirectory(root))).toThrow(
      'WG_SITE_HARDLINK',
    );
  });

  it.runIf(process.platform !== 'win32')('rejects a supported special-file fixture', () => {
    const root = temp();
    writeFileSync(resolve(root, 'index.html'), 'index\n');
    writeFileSync(resolve(root, '404.html'), 'missing\n');
    execFileSync('mkfifo', [resolve(root, 'pipe')]);
    expect(() => inspectSurfaceInventory('documentation', scanDirectory(root))).toThrow(
      'WG_SITE_ENTRY_TYPE',
    );
  });

  it('rejects producer roots with a symbolic-link ancestor', () => {
    const root = temp();
    const actual = resolve(root, 'actual');
    mkdirSync(actual);
    symlinkSync(actual, resolve(root, 'linked'), 'dir');
    expect(() => assertRealDirectoryPath(root, resolve(root, 'linked'))).toThrow(
      'WG_SITE_SOURCE_PATH',
    );
  });

  it('detects added, removed, moved, truncated, changed, and type-changed entries', () => {
    const baseline = [
      { path: 'assets', kind: 'directory' as const },
      {
        path: 'index.html',
        kind: 'file' as const,
        links: 1,
        bytes: new TextEncoder().encode('index'),
      },
    ];
    const mutations = [
      [...baseline, { path: 'new', kind: 'directory' as const }],
      baseline.slice(1),
      baseline.map((entry) =>
        entry.path === 'index.html' ? { ...entry, path: 'moved.html' } : entry,
      ),
      baseline.map((entry) =>
        entry.path === 'index.html' ? { ...entry, bytes: new TextEncoder().encode('i') } : entry,
      ),
      baseline.map((entry) =>
        entry.path === 'index.html'
          ? { ...entry, bytes: new TextEncoder().encode('other') }
          : entry,
      ),
      baseline.map((entry) =>
        entry.path === 'assets'
          ? { path: 'assets', kind: 'file' as const, links: 1, bytes: new Uint8Array([1]) }
          : entry,
      ),
    ];
    for (const mutation of mutations) {
      expect(() => assertFilesystemInventoriesEqual(baseline, mutation)).toThrow(
        'WG_SITE_INPUT_CHANGED',
      );
    }
  });
});
