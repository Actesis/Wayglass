import { describe, expect, it } from 'vitest';

import { ReleaseCandidateError } from '../src/error.ts';
import { inspectPackageFiles } from '../src/inspection.ts';
import { projectPackageManifest, serializeProjectedManifest } from '../src/manifest.ts';
import type { PackageFile } from '../src/types.ts';
import { bytes, coreFiles, sourceManifest } from './fixtures.ts';

const manifest = projectPackageManifest('core', sourceManifest('core'));
const validFiles = (): PackageFile[] => coreFiles(serializeProjectedManifest(manifest));

function replaced(path: string, replacement: Partial<PackageFile>): PackageFile[] {
  return validFiles().map((file) => (file.path === path ? { ...file, ...replacement } : file));
}

describe('release-candidate package inspection', () => {
  it('sorts, measures, and hashes a valid allowlisted package deterministically', () => {
    const first = inspectPackageFiles(validFiles().reverse(), manifest);
    const second = inspectPackageFiles(validFiles(), manifest);
    expect(first).toEqual(second);
    expect(first.files.map(({ path }) => path)).toEqual(
      [...first.files.map(({ path }) => path)].sort(),
    );
    expect(first.totalBytes).toBeGreaterThan(0);
    expect(first.inventorySha256).toMatch(/^[a-f0-9]{64}$/);
    expect(Object.isFrozen(first.files)).toBe(true);
  });

  it.each([
    ['WG_RC_FILE_PATH', { path: '../secret' }],
    ['WG_RC_FILE_ALLOWLIST', { path: '.npmrc' }],
    ['WG_RC_PRIVATE_FILE', { path: 'dist/tests/private.js' }],
    ['WG_RC_AUTHORED_SOURCE', { path: 'dist/source.ts' }],
    ['WG_RC_FILE_KIND', { kind: 'symlink' as const }],
  ])('rejects unsafe files with %s', (code, replacement) => {
    const files = replaced('dist/index.js', replacement);
    expect(() => inspectPackageFiles(files, manifest)).toThrowError(
      expect.objectContaining<Partial<ReleaseCandidateError>>({ code }),
    );
  });

  it('rejects duplicate, missing, and missing-export files', () => {
    expect(() => inspectPackageFiles([...validFiles(), validFiles()[0]!], manifest)).toThrow(
      /WG_RC_FILE_DUPLICATE/,
    );
    expect(() =>
      inspectPackageFiles(
        validFiles().filter(({ path }) => path !== 'NOTICE'),
        manifest,
      ),
    ).toThrow(/WG_RC_FILE_REQUIRED/);
    expect(() =>
      inspectPackageFiles(
        validFiles().filter(({ path }) => path !== 'dist/index.js'),
        manifest,
      ),
    ).toThrow(/WG_RC_EXPORT_MISSING/);
    expect(() => inspectPackageFiles(coreFiles('{"name":"wrong"}\n'), manifest)).toThrow(
      /WG_RC_PACKED_MANIFEST/,
    );
    expect(() =>
      inspectPackageFiles(
        [...validFiles(), { path: 'dist/INDEX.js', bytes: bytes('export {};\n') }],
        manifest,
      ),
    ).toThrow(/WG_RC_FILE_COLLISION/);
  });

  it.each([
    [
      'WG_RC_SOURCE_MAP_CONTENT',
      JSON.stringify({
        version: 3,
        sources: ['../src/index.ts'],
        sourcesContent: ['secret'],
        mappings: '',
      }),
    ],
    [
      'WG_RC_SOURCE_MAP_ABSOLUTE',
      JSON.stringify({ version: 3, sources: ['/Users/person/project/index.ts'], mappings: '' }),
    ],
    [
      'WG_RC_SOURCE_MAP_ABSOLUTE',
      JSON.stringify({ version: 3, sources: ['https://private.example/source.ts'], mappings: '' }),
    ],
    ['WG_RC_SOURCE_MAP_JSON', '{'],
  ])('rejects unsafe source maps with %s', (code, sourceMap) => {
    expect(() =>
      inspectPackageFiles(replaced('dist/index.js.map', { bytes: bytes(sourceMap) }), manifest),
    ).toThrowError(expect.objectContaining<Partial<ReleaseCandidateError>>({ code }));
  });
});
