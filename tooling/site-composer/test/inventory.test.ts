import { describe, expect, it } from 'vitest';

import { SiteComposerError } from '../src/error.ts';
import {
  assertInventoriesEqual,
  inspectSurfaceInventory,
  mergeSurfaceInventories,
} from '../src/inventory.ts';
import { bytes, documentationEntries, storybookEntries } from './fixtures.ts';

describe('surface inventory inspection', () => {
  it('inspects the two closed surfaces and projects destination paths', () => {
    const documentation = inspectSurfaceInventory('documentation', documentationEntries());
    const storybook = inspectSurfaceInventory('storybook', storybookEntries());
    const files = mergeSurfaceInventories([documentation, storybook]);

    expect(files.map((file) => file.path)).toEqual([
      '404.html',
      'assets/app-A1.js',
      'index.html',
      'storybook/assets/manager-B2.js',
      'storybook/iframe.html',
      'storybook/index.html',
    ]);
    expect(files.every((file) => file.bytes > 0 && /^[0-9a-f]{64}$/.test(file.sha256))).toBe(true);
  });

  it.each(['symlink', 'socket', 'device', 'fifo', 'other'] as const)(
    'rejects %s entries',
    (kind) => {
      expect(() =>
        inspectSurfaceInventory('documentation', [
          ...documentationEntries(),
          { path: 'unsafe', kind },
        ]),
      ).toThrowError(
        expect.objectContaining<Partial<SiteComposerError>>({ code: 'WG_SITE_ENTRY_TYPE' }),
      );
    },
  );

  it('rejects hard links, empty files, missing bytes, and file metadata on directories', () => {
    const base = documentationEntries().slice(0, 0);
    expect(() =>
      inspectSurfaceInventory('documentation', [
        ...base,
        { path: 'index.html', kind: 'file', links: 2, bytes: bytes('x') },
      ]),
    ).toThrow('WG_SITE_HARDLINK');
    expect(() =>
      inspectSurfaceInventory('documentation', [
        ...base,
        { path: 'index.html', kind: 'file', links: 1, bytes: bytes('') },
      ]),
    ).toThrow('WG_SITE_EMPTY_FILE');
    expect(() =>
      inspectSurfaceInventory('documentation', [
        ...base,
        { path: 'index.html', kind: 'file', links: 1 },
      ]),
    ).toThrow('WG_SITE_ENTRY_SHAPE');
    expect(() =>
      inspectSurfaceInventory('documentation', [
        ...base,
        { path: 'assets', kind: 'directory', links: 1 },
      ]),
    ).toThrow('WG_SITE_ENTRY_SHAPE');
  });

  it.each([
    [
      [
        { path: 'index.html', kind: 'file', links: 1, bytes: bytes('a') },
        { path: 'index.html', kind: 'file', links: 1, bytes: bytes('b') },
      ],
    ],
    [
      [
        { path: 'Index.html', kind: 'file', links: 1, bytes: bytes('a') },
        { path: 'index.html', kind: 'file', links: 1, bytes: bytes('b') },
      ],
    ],
    [
      [
        { path: 'asset', kind: 'file', links: 1, bytes: bytes('a') },
        { path: 'asset/file.js', kind: 'file', links: 1, bytes: bytes('b') },
      ],
    ],
  ] as const)('rejects duplicate, case-fold, and file-ancestor collisions', (entries) => {
    expect(() => inspectSurfaceInventory('documentation', entries)).toThrowError(SiteComposerError);
  });

  it('requires every declared entry point', () => {
    expect(() =>
      inspectSurfaceInventory(
        'storybook',
        storybookEntries().filter((entry) => entry.path !== 'iframe.html'),
      ),
    ).toThrow('WG_SITE_REQUIRED_ENTRY');
  });

  it('requires the exact ordered surface set', () => {
    const documentation = inspectSurfaceInventory('documentation', documentationEntries());
    const storybook = inspectSurfaceInventory('storybook', storybookEntries());
    expect(() => mergeSurfaceInventories([storybook, documentation])).toThrow(
      'WG_SITE_SURFACE_ORDER',
    );
    expect(() => mergeSurfaceInventories([documentation])).toThrow('WG_SITE_SURFACE_SET');
  });

  it('detects any input inventory change', () => {
    const before = mergeSurfaceInventories([
      inspectSurfaceInventory('documentation', documentationEntries()),
      inspectSurfaceInventory('storybook', storybookEntries()),
    ]);
    expect(() =>
      assertInventoriesEqual(
        before,
        before.map((file) => ({ ...file })),
      ),
    ).not.toThrow();
    expect(() =>
      assertInventoriesEqual(
        before,
        before.map((file, index) => (index === 0 ? { ...file, bytes: file.bytes + 1 } : file)),
      ),
    ).toThrow('WG_SITE_INPUT_CHANGED');
    expect(() => assertInventoriesEqual(before, before.slice(1))).toThrow('WG_SITE_INPUT_CHANGED');
  });
});
