import { describe, expect, it } from 'vitest';

import { compactCanonicalJson } from '../src/canonical-json.ts';
import { SiteComposerError } from '../src/error.ts';
import { sha256 } from '../src/hash.ts';
import { inspectSurfaceInventory, mergeSurfaceInventories } from '../src/inventory.ts';
import {
  createSiteManifest,
  parseCanonicalSiteManifest,
  serializeSiteManifest,
  validateSiteManifest,
} from '../src/manifest.ts';
import {
  cloneManifest,
  documentationEntries,
  manifestInput,
  storybookEntries,
} from './fixtures.ts';

function validFiles() {
  return mergeSurfaceInventories([
    inspectSurfaceInventory('documentation', documentationEntries()),
    inspectSurfaceInventory('storybook', storybookEntries()),
  ]);
}

function validManifest() {
  return createSiteManifest(manifestInput(validFiles()));
}

function records(value: Record<string, unknown>, key: string): Record<string, unknown>[] {
  return value[key] as Record<string, unknown>[];
}

describe('site manifest creation', () => {
  it('creates the exact closed surface inventory and bundle projection hash', () => {
    const manifest = validManifest();
    expect(manifest.artifact).toBe('wayglass-site-bundle');
    expect(manifest.schemaVersion).toBe(1);
    expect(
      manifest.surfaces.map(({ id, classification, fileCount }) => ({
        id,
        classification,
        fileCount,
      })),
    ).toEqual([
      { id: 'documentation', classification: 'normative', fileCount: 3 },
      { id: 'storybook', classification: 'inspection', fileCount: 3 },
    ]);
    const projection: Record<string, unknown> = { ...manifest };
    delete projection.bundleSha256;
    expect(manifest.bundleSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(manifest.bundleSha256).toBe(sha256(compactCanonicalJson(projection)));
    expect(validateSiteManifest(manifest)).toEqual(manifest);
  });

  it('serializes canonical JSON with one final newline and round trips it', () => {
    const manifest = validManifest();
    const serialized = serializeSiteManifest(manifest);
    expect(serialized.endsWith('\n')).toBe(true);
    expect(serialized.endsWith('\n\n')).toBe(false);
    expect(serialized.indexOf('"artifact"')).toBeLessThan(serialized.indexOf('"bundleSha256"'));
    expect(parseCanonicalSiteManifest(serialized)).toEqual(manifest);
  });

  it('rejects noncanonical JSON even when its values are valid', () => {
    const manifest = validManifest();
    expect(() => parseCanonicalSiteManifest(JSON.stringify(manifest))).toThrow(
      'WG_SITE_MANIFEST_CANONICAL',
    );
    expect(() => parseCanonicalSiteManifest('{')).toThrow('WG_SITE_MANIFEST_JSON');
  });
});

describe('closed site manifest validation', () => {
  it.each([
    [
      'unknown root field',
      (value: Record<string, unknown>) => {
        value.unknown = true;
      },
    ],
    [
      'missing root field',
      (value: Record<string, unknown>) => {
        delete value.source;
      },
    ],
    [
      'unknown source field',
      (value: Record<string, unknown>) => {
        (value.source as Record<string, unknown>).unknown = true;
      },
    ],
    [
      'wrong artifact',
      (value: Record<string, unknown>) => {
        value.artifact = 'other';
      },
    ],
    [
      'wrong schema',
      (value: Record<string, unknown>) => {
        value.schemaVersion = 2;
      },
    ],
    [
      'uppercase digest',
      (value: Record<string, unknown>) => {
        value.bundleSha256 = 'A'.repeat(64);
      },
    ],
    [
      'unsafe count',
      (value: Record<string, unknown>) => {
        records(value, 'files')[0]!.bytes = Number.MAX_SAFE_INTEGER + 1;
      },
    ],
    [
      'zero file bytes',
      (value: Record<string, unknown>) => {
        records(value, 'files')[0]!.bytes = 0;
      },
    ],
  ] as const)('rejects %s', (_label, mutate) => {
    const value = cloneManifest(validManifest());
    mutate(value);
    expect(() => validateSiteManifest(value)).toThrowError(SiteComposerError);
  });

  it.each([
    [
      'reordered surfaces',
      (value: Record<string, unknown>) => {
        records(value, 'surfaces').reverse();
      },
    ],
    [
      'wrong classification',
      (value: Record<string, unknown>) => {
        records(value, 'surfaces')[0]!.classification = 'inspection';
      },
    ],
    [
      'wrong package',
      (value: Record<string, unknown>) => {
        records(value, 'surfaces')[0]!.package = '@wayglass/other';
      },
    ],
    [
      'inexact version',
      (value: Record<string, unknown>) => {
        records(value, 'surfaces')[0]!.version = '^0.1.0';
      },
    ],
    [
      'wrong required entries',
      (value: Record<string, unknown>) => {
        records(value, 'surfaces')[0]!.requiredEntries = ['index.html'];
      },
    ],
    [
      'wrong total',
      (value: Record<string, unknown>) => {
        records(value, 'surfaces')[0]!.bytes = 1;
      },
    ],
    [
      'wrong content hash',
      (value: Record<string, unknown>) => {
        records(value, 'surfaces')[0]!.contentSha256 = '9'.repeat(64);
      },
    ],
    [
      'wrong bundle hash',
      (value: Record<string, unknown>) => {
        value.bundleSha256 = '9'.repeat(64);
      },
    ],
  ] as const)('rejects %s', (_label, mutate) => {
    const value = cloneManifest(validManifest());
    mutate(value);
    expect(() => validateSiteManifest(value)).toThrowError(SiteComposerError);
  });

  it.each([
    [
      'reordered files',
      (value: Record<string, unknown>) => {
        records(value, 'files').reverse();
      },
    ],
    [
      'added file',
      (value: Record<string, unknown>) => {
        records(value, 'files').push({ ...records(value, 'files')[0], path: 'extra.html' });
      },
    ],
    [
      'removed required file',
      (value: Record<string, unknown>) => {
        value.files = records(value, 'files').filter((file) => file.path !== 'index.html');
      },
    ],
    [
      'changed digest',
      (value: Record<string, unknown>) => {
        records(value, 'files')[0]!.sha256 = '8'.repeat(64);
      },
    ],
    [
      'cross-surface attribution',
      (value: Record<string, unknown>) => {
        records(value, 'files')[0]!.surface = 'storybook';
      },
    ],
    [
      'unknown file field',
      (value: Record<string, unknown>) => {
        records(value, 'files')[0]!.unknown = true;
      },
    ],
  ] as const)('rejects a %s', (_label, mutate) => {
    const value = cloneManifest(validManifest());
    mutate(value);
    expect(() => validateSiteManifest(value)).toThrowError(SiteComposerError);
  });

  it('rejects malformed source, tooling, and environment identities', () => {
    for (const mutate of [
      (value: Record<string, unknown>) => {
        (value.source as Record<string, unknown>).commit = 'abc';
      },
      (value: Record<string, unknown>) => {
        (value.tooling as Record<string, unknown>).tree = 'F'.repeat(40);
      },
      (value: Record<string, unknown>) => {
        (value.environment as Record<string, unknown>).node = '24 18';
      },
    ]) {
      const value = cloneManifest(validManifest());
      mutate(value);
      expect(() => validateSiteManifest(value)).toThrowError(SiteComposerError);
    }
  });
});

describe('manifest creation input defense', () => {
  it('rejects unsorted, unprefixed, empty, malformed, and missing-entry files', () => {
    const files = [...validFiles()];
    expect(() => createSiteManifest(manifestInput([...files].reverse()))).toThrow(
      'WG_SITE_FILE_ORDER',
    );
    expect(() =>
      createSiteManifest(
        manifestInput(
          files.map((file) =>
            file.surface === 'storybook'
              ? { ...file, path: file.path.replace('storybook/', '') }
              : file,
          ),
        ),
      ),
    ).toThrow('WG_SITE_FILE_ATTRIBUTION');
    expect(() => createSiteManifest(manifestInput([]))).toThrow('WG_SITE_MANIFEST_FILES');
    expect(() =>
      createSiteManifest(
        manifestInput(
          files.map((file, index) => (index === 0 ? { ...file, sha256: 'bad' } : file)),
        ),
      ),
    ).toThrow('WG_SITE_MANIFEST_DIGEST');
    expect(() =>
      createSiteManifest(
        manifestInput(files.filter((file) => file.path !== 'storybook/iframe.html')),
      ),
    ).toThrow('WG_SITE_REQUIRED_ENTRY');
  });
});
