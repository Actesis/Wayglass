import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

interface PackageExport {
  import: string;
  types: string;
}

interface PackageManifest {
  exports: Record<string, PackageExport | string>;
}

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');

function readManifest(packageName: 'elements' | 'react'): PackageManifest {
  return JSON.parse(
    readFileSync(resolve(repositoryRoot, `packages/${packageName}/package.json`), 'utf8'),
  ) as PackageManifest;
}

function componentExports(manifest: PackageManifest): Array<[string, PackageExport]> {
  return Object.entries(manifest.exports)
    .filter(
      (entry): entry is [string, PackageExport] => entry[0] !== '.' && typeof entry[1] !== 'string',
    )
    .sort(([left], [right]) => left.localeCompare(right));
}

function elementClassName(moduleName: string): string {
  return `Wg${moduleName
    .split('-')
    .map((part) => `${part[0]?.toUpperCase()}${part.slice(1)}`)
    .join('')}`;
}

describe('public package surface', () => {
  const elementExports = componentExports(readManifest('elements'));
  const reactExports = componentExports(readManifest('react'));

  it('keeps every public Custom Element paired with a typed React entry point', () => {
    expect(reactExports.map(([subpath]) => subpath)).toEqual(
      elementExports.map(([subpath]) => subpath),
    );
  });

  it.each([
    ['elements', elementExports, '.ts'],
    ['react', reactExports, '.tsx'],
  ] as const)(
    'keeps %s manifest entries aligned with source modules and root exports',
    (packageName, exports, extension) => {
      const sourceDirectory = resolve(repositoryRoot, `packages/${packageName}/src`);
      const rootIndex = readFileSync(resolve(sourceDirectory, 'index.ts'), 'utf8');

      for (const [subpath, target] of exports) {
        const moduleName = subpath.slice(2);
        expect(target).toEqual({
          types: `./dist/${moduleName}.d.ts`,
          import: `./dist/${moduleName}.js`,
        });
        expect(() =>
          readFileSync(resolve(sourceDirectory, `${moduleName}${extension}`), 'utf8'),
        ).not.toThrow();
        expect(rootIndex).toContain(elementClassName(moduleName));
      }
    },
  );
});
