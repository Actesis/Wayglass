import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');
const packageNames = ['core', 'tokens', 'themes', 'elements', 'icons', 'react'] as const;
interface CandidateManifest {
  readonly name: string;
  readonly version: string;
  readonly private: boolean;
  readonly engines: { readonly node: string };
  readonly dependencies?: Record<string, string>;
  readonly peerDependencies?: Record<string, string>;
  readonly devDependencies: Record<string, string>;
  readonly sideEffects: boolean | readonly string[];
  readonly scripts: Record<string, string>;
}
const manifests = Object.fromEntries(
  packageNames.map((name) => [name, JSON.parse(read(`packages/${name}/package.json`))]),
) as Record<(typeof packageNames)[number], CandidateManifest>;

describe('Phase 6B version and compatibility contract', () => {
  it('selects private 0.1.0 candidates and exact Node engines', () => {
    for (const name of packageNames) {
      expect(manifests[name]).toMatchObject({
        name: `@wayglass/${name}`,
        version: '0.1.0',
        private: true,
        engines: { node: '>=22.13.0 <27' },
      });
    }
  });

  it('uses patch-line Wayglass relationships and React 19 only', () => {
    expect(manifests.themes.dependencies).toEqual({ '@wayglass/tokens': '^0.1.0' });
    expect(manifests.elements.dependencies).toMatchObject({
      '@wayglass/core': '^0.1.0',
      '@wayglass/themes': '^0.1.0',
    });
    expect(manifests.react.peerDependencies).toEqual({
      '@wayglass/elements': '^0.1.0',
      react: '>=19.0.0 <20',
    });
    expect(manifests.react.devDependencies['@wayglass/elements']).toBe('workspace:*');
  });

  it('declares only the accepted CSS effects', () => {
    expect(manifests.core.sideEffects).toBe(false);
    expect(manifests.tokens.sideEffects).toBe(false);
    expect(manifests.icons.sideEffects).toBe(false);
    expect(manifests.react.sideEffects).toBe(false);
    expect(manifests.themes.sideEffects).toEqual(['**/*.css']);
    expect(manifests.elements.sideEffects).toEqual(['**/*.css']);
  });

  it('keeps source scripts repository-only and lifecycle-free', () => {
    const lifecycleNames = [
      'preinstall',
      'install',
      'postinstall',
      'prepare',
      'prepack',
      'postpack',
      'publish',
      'prepublish',
      'prepublishOnly',
      'postpublish',
    ];
    for (const name of packageNames) {
      expect(Object.keys(manifests[name].scripts).sort()).toEqual([
        'build',
        'test',
        'test:coverage',
        'typecheck',
      ]);
      for (const lifecycle of lifecycleNames) {
        expect(manifests[name].scripts).not.toHaveProperty(lifecycle);
      }
    }
    expect(read('docs/governance/phase-6b-version-compatibility-contract.md')).toContain(
      'must remove all `scripts` and `devDependencies`',
    );
  });

  it('documents the TypeScript range and package-specific compatibility', () => {
    const contract = read('docs/governance/phase-6b-version-compatibility-contract.md');
    expect(contract).toContain('TypeScript `>=5.9.0 <6.1.0`');
    expect(contract).toContain('TypeScript 5.9.3');
    for (const name of packageNames) {
      const packageReadme = read(`packages/${name}/README.md`);
      expect(packageReadme).toContain('Node `>=22.13.0 <27`');
      expect(packageReadme).toContain('TypeScript `>=5.9.0 <6.1.0`');
      expect(packageReadme).toContain('support is release-specific');
    }
    expect(read('packages/react/README.md')).toContain('React `>=19.0.0 <20`');
  });

  it('keeps the lockfile and TypeScript 5.9 menu correction coherent', () => {
    const lockfile = read('pnpm-lock.yaml');
    expect(lockfile).toContain('specifier: ^0.1.0\n        version: link:../core');
    expect(lockfile).toContain('specifier: ^0.1.0\n        version: link:../themes');
    expect(lockfile).toContain('specifier: ^0.1.0\n        version: link:../tokens');
    expect(read('packages/elements/src/menu.ts')).toContain(
      '#supportsPopover(popup: HTMLElement): boolean',
    );
  });
});
