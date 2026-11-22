import { describe, expect, it } from 'vitest';

import {
  caretAdmits,
  type Manifest,
  parseVersion,
  publicManifest,
  validateWorkspaceManifest,
} from '../src/manifest.ts';
import { exportTargets, verifyTarball } from '../src/tarball.ts';
import { isReleaseUnit, releaseTag, releaseUnits } from '../src/units.ts';

const workspace = (overrides: Record<string, unknown> = {}): Manifest => ({
  name: '@wayglass/elements',
  version: '0.1.1',
  private: true,
  files: ['dist', 'README.md', 'LICENSE', 'NOTICE'],
  exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js' } },
  scripts: { build: 'tsc' },
  dependencies: { '@wayglass/core': '^0.1.0', lit: '3.3.3' },
  devDependencies: { typescript: '6.0.3' },
  ...overrides,
});

describe('release units', () => {
  it('stages the foundation family in dependency order', () => {
    expect(releaseUnits.foundation).toEqual(['tokens', 'core', 'themes', 'elements']);
    expect(releaseTag('foundation', '0.1.1')).toBe('foundation-v0.1.1');
    expect(isReleaseUnit('react')).toBe(true);
    expect(isReleaseUnit('testing')).toBe(false);
    expect(isReleaseUnit('toString')).toBe(false);
  });
});

describe('versions and ranges', () => {
  it('accepts only plain versions', () => {
    expect(parseVersion('0.1.1')).toEqual([0, 1, 1]);
    for (const invalid of ['0.1', 'v0.1.1', '0.1.1-rc.1', '01.1.1'])
      expect(() => parseVersion(invalid)).toThrow(/MAJOR.MINOR.PATCH/);
  });

  it('follows npm caret rules below and above 1.0.0', () => {
    expect(caretAdmits('^0.1.0', '0.1.1')).toBe(true);
    expect(caretAdmits('^0.1.0', '0.2.0')).toBe(false);
    expect(caretAdmits('^0.1.2', '0.1.1')).toBe(false);
    expect(caretAdmits('^0.0.3', '0.0.4')).toBe(false);
    expect(caretAdmits('^1.2.0', '1.9.0')).toBe(true);
    expect(caretAdmits('^1.2.0', '2.0.0')).toBe(false);
    expect(() => caretAdmits('~0.1.0', '0.1.1')).toThrow(/caret/);
  });
});

describe('workspace manifest validation', () => {
  const released = new Map([
    ['@wayglass/core', '0.1.1'],
    ['@wayglass/elements', '0.1.1'],
  ]);
  const expected = { name: '@wayglass/elements', version: '0.1.1' };

  it('accepts a private manifest whose Wayglass ranges admit the release', () => {
    expect(() => validateWorkspaceManifest(workspace(), expected, released)).not.toThrow();
  });

  it('rejects a version that does not match the release', () => {
    expect(() =>
      validateWorkspaceManifest(workspace({ version: '0.1.0' }), expected, released),
    ).toThrow(/requires 0.1.1/);
  });

  it('rejects a range that excludes a package released alongside it', () => {
    expect(() =>
      validateWorkspaceManifest(
        workspace({ dependencies: { '@wayglass/core': '^0.2.0' } }),
        expected,
        released,
      ),
    ).toThrow(/does not admit/);
  });

  it('rejects workspace protocols and public workspace manifests', () => {
    expect(() =>
      validateWorkspaceManifest(
        workspace({ peerDependencies: { '@wayglass/core': 'workspace:^' } }),
        expected,
        released,
      ),
    ).toThrow(/workspace protocol/);
    expect(() =>
      validateWorkspaceManifest(workspace({ private: false }), expected, released),
    ).toThrow(/private/);
  });
});

describe('public manifest', () => {
  it('publishes without development fields and keeps key order', () => {
    const manifest = publicManifest(workspace());
    expect(manifest.private).toBe(false);
    expect(manifest).not.toHaveProperty('scripts');
    expect(manifest).not.toHaveProperty('devDependencies');
    expect(Object.keys(manifest)).toEqual([
      'name',
      'version',
      'private',
      'files',
      'exports',
      'dependencies',
    ]);
    expect(Object.keys((manifest.exports as Record<string, object>)['.']!)).toEqual([
      'types',
      'import',
    ]);
  });
});

describe('tarball verification', () => {
  const expected = publicManifest(workspace());
  const entries = [
    'package/package.json',
    'package/README.md',
    'package/LICENSE',
    'package/NOTICE',
    'package/dist/index.js',
    'package/dist/index.d.ts',
  ];

  it('accepts the planned manifest and published files', () => {
    expect(exportTargets(expected.exports)).toEqual(['./dist/index.d.ts', './dist/index.js']);
    expect(() => verifyTarball(entries, expected, expected)).not.toThrow();
  });

  it('rejects a packed manifest that differs from the plan', () => {
    expect(() => verifyTarball(entries, workspace(), expected)).toThrow(/differs/);
  });

  it('rejects files outside the published set and unsafe paths', () => {
    expect(() => verifyTarball([...entries, 'package/src/index.ts'], expected, expected)).toThrow(
      /outside/,
    );
    expect(() => verifyTarball([...entries, 'package/../x'], expected, expected)).toThrow(
      /unexpected/,
    );
  });

  it('rejects missing notices and export targets', () => {
    expect(() =>
      verifyTarball(
        entries.filter((entry) => entry !== 'package/NOTICE'),
        expected,
        expected,
      ),
    ).toThrow(/NOTICE/);
    expect(() =>
      verifyTarball(
        entries.filter((entry) => entry !== 'package/dist/index.d.ts'),
        expected,
        expected,
      ),
    ).toThrow(/export target/);
  });
});
