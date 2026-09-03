import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import * as componentApi from '../src/icon.js';
import * as rootApi from '../src/index.js';

interface PackageManifest {
  readonly name: string;
  readonly private: boolean;
  readonly files: readonly string[];
  readonly sideEffects: boolean;
  readonly exports: Record<string, { readonly types: string; readonly import: string }>;
  readonly dependencies: Record<string, string>;
}

const testDirectory = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(testDirectory, '..');
const repositoryRoot = resolve(packageRoot, '../..');
const manifest = JSON.parse(
  readFileSync(resolve(packageRoot, 'package.json'), 'utf8'),
) as PackageManifest;

describe('@wayglass/icons package boundary', () => {
  it('keeps both entries on the exact accepted v1 runtime surface', () => {
    const expected = [
      'WgIcon',
      'defineWgIcon',
      'iconDirections',
      'iconNames',
      'iconSizes',
      'isIconDirection',
      'isIconName',
      'isIconSize',
      'wgIconTagName',
    ].sort();

    expect(Object.keys(componentApi).sort()).toEqual(expected);
    expect(Object.keys(rootApi).sort()).toEqual(expected);
    expect(rootApi.WgIcon).toBe(componentApi.WgIcon);
    expect(rootApi.defineWgIcon).toBe(componentApi.defineWgIcon);
  });

  it('provides root and component-specific entries for the same private optional runtime', () => {
    expect(manifest.name).toBe('@wayglass/icons');
    expect(manifest.private).toBe(true);
    expect(manifest.files).toEqual(['dist']);
    expect(manifest.sideEffects).toBe(false);
    expect(manifest.exports).toEqual({
      '.': { types: './dist/index.d.ts', import: './dist/index.js' },
      './icon': { types: './dist/icon.d.ts', import: './dist/icon.js' },
    });
    expect(readFileSync(resolve(packageRoot, 'src/index.ts'), 'utf8').trim()).toBe(
      "export * from './icon.js';",
    );
  });

  it('imports only Lit, generated inert data, and package-local runtime code', () => {
    expect(manifest.dependencies).toEqual({ lit: '3.3.3' });
    const source = ['index.ts', 'icon.ts', 'runtime.ts', 'generated/catalog.ts']
      .map((path) => readFileSync(resolve(packageRoot, 'src', path), 'utf8'))
      .join('\n');

    expect(source).toContain("from './generated/catalog.js'");
    expect(source).not.toMatch(
      /tooling\/icon-pipeline|node:fs|node:crypto|customElements\.define\(/,
    );
    expect(
      readFileSync(resolve(repositoryRoot, 'packages/elements/src/index.ts'), 'utf8'),
    ).not.toContain('@wayglass/icons');
  });
});
