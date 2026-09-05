import { describe, expect, it } from 'vitest';

import { candidateDirectories } from '../src/constants.ts';
import { ReleaseCandidateError } from '../src/error.ts';
import {
  projectCandidateInventory,
  projectPackageManifest,
  serializeProjectedManifest,
} from '../src/manifest.ts';
import type { CandidateDirectory } from '../src/types.ts';
import { sourceCandidates, sourceManifest } from './fixtures.ts';

function invalid(
  directory: CandidateDirectory,
  mutate: (manifest: Record<string, unknown>) => void,
): Record<string, unknown> {
  const manifest = sourceManifest(directory);
  mutate(manifest);
  return manifest;
}

describe('release-candidate manifest projection', () => {
  it('projects all six accepted manifests in dependency order without mutating input', () => {
    const candidates = sourceCandidates().reverse();
    const before = structuredClone(candidates);
    const projected = projectCandidateInventory(candidates);
    expect(candidates).toEqual(before);
    expect(projected.map(({ name }) => name)).toEqual(
      candidateDirectories.map((directory) => `@wayglass/${directory}`),
    );
    for (const manifest of projected) {
      expect(manifest).toMatchObject({ version: '0.1.0', private: true, license: 'Apache-2.0' });
      expect(manifest).not.toHaveProperty('scripts');
      expect(manifest).not.toHaveProperty('devDependencies');
      expect(Object.isFrozen(manifest)).toBe(true);
    }
  });

  it('uses canonical field order, formatting, and a final newline', () => {
    const source = sourceManifest('core');
    source.unreviewed = 'dropped';
    source.publishConfig = {
      registry: 'https://registry.npmjs.org/',
      access: 'public',
    };
    const serialized = serializeProjectedManifest(projectPackageManifest('core', source));
    expect(serialized.endsWith('\n')).toBe(true);
    expect(serialized).not.toContain('unreviewed');
    expect(serialized).toBe(serializeProjectedManifest(projectPackageManifest('core', source)));
    expect(Object.keys(JSON.parse(serialized))).toEqual([
      'name',
      'version',
      'private',
      'description',
      'license',
      'author',
      'homepage',
      'repository',
      'bugs',
      'keywords',
      'publishConfig',
      'type',
      'sideEffects',
      'engines',
      'files',
      'exports',
    ]);
    expect(serialized).toContain('\n  "name": "@wayglass/core",\n');
  });

  it.each([
    [
      'WG_RC_PACKAGE_NAME',
      'core',
      (manifest: Record<string, unknown>): void => {
        manifest.name = '@other/core';
      },
    ],
    [
      'WG_RC_VERSION',
      'core',
      (manifest: Record<string, unknown>): void => {
        manifest.version = '0.1.1';
      },
    ],
    [
      'WG_RC_PRIVACY',
      'core',
      (manifest: Record<string, unknown>): void => {
        manifest.private = false;
      },
    ],
    [
      'WG_RC_LICENSE',
      'core',
      (manifest: Record<string, unknown>): void => {
        manifest.license = 'MIT';
      },
    ],
    [
      'WG_RC_FILES_ALLOWLIST',
      'core',
      (manifest: Record<string, unknown>): void => {
        manifest.files = ['dist', 'README.md'];
      },
    ],
    [
      'WG_RC_SIDE_EFFECTS',
      'themes',
      (manifest: Record<string, unknown>): void => {
        manifest.sideEffects = false;
      },
    ],
    [
      'WG_RC_ENGINES',
      'core',
      (manifest: Record<string, unknown>): void => {
        manifest.engines = { node: '>=24' };
      },
    ],
    [
      'WG_RC_PUBLISH_CONFIG',
      'core',
      (manifest: Record<string, unknown>): void => {
        manifest.publishConfig = { access: 'restricted' };
      },
    ],
    [
      'WG_RC_LIFECYCLE_SCRIPT',
      'core',
      (manifest: Record<string, unknown>): void => {
        (manifest.scripts as Record<string, string>).prepack = 'node surprise.js';
      },
    ],
    [
      'WG_RC_DEPENDENCY_PROTOCOL',
      'themes',
      (manifest: Record<string, unknown>): void => {
        (manifest.dependencies as Record<string, string>)['@wayglass/tokens'] = 'workspace:*';
      },
    ],
    [
      'WG_RC_DEPENDENCIES',
      'elements',
      (manifest: Record<string, unknown>): void => {
        (manifest.dependencies as Record<string, string>).lit = '3.3.2';
      },
    ],
    [
      'WG_RC_WAYGLASS_RANGE',
      'react',
      (manifest: Record<string, unknown>): void => {
        (manifest.peerDependencies as Record<string, string>)['@wayglass/elements'] = '^0.2.0';
      },
    ],
  ] as const)('rejects %s drift', (code, directory, mutate) => {
    expect(() => projectPackageManifest(directory, invalid(directory, mutate))).toThrowError(
      expect.objectContaining<Partial<ReleaseCandidateError>>({ code }),
    );
  });

  it('rejects incomplete and duplicate inventories', () => {
    expect(() => projectCandidateInventory(sourceCandidates().slice(1))).toThrow(
      /WG_RC_PACKAGE_INVENTORY/,
    );
    expect(() =>
      projectCandidateInventory([...sourceCandidates(), sourceCandidates()[0]!]),
    ).toThrow(/WG_RC_PACKAGE_DUPLICATE/);
  });
});
