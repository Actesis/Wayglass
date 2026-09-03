import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';
import ts from 'typescript';

import * as elementApi from '../../elements/src/index.js';
import * as reactApi from '../src/index.js';

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

function fingerprint(names: readonly string[]): string {
  return createHash('sha256')
    .update([...names].sort().join('\n'))
    .digest('hex');
}

function sourceExportNames(packageName: 'elements' | 'react'): readonly string[] {
  const file = resolve(repositoryRoot, `packages/${packageName}/src/index.ts`);
  const program = ts.createProgram([file], {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ESNext,
  });
  const source = program.getSourceFile(file);
  if (!source) throw new Error(`Unable to read ${packageName} root source.`);
  const moduleSymbol = program.getTypeChecker().getSymbolAtLocation(source);
  if (!moduleSymbol) throw new Error(`Unable to resolve ${packageName} root exports.`);
  return program
    .getTypeChecker()
    .getExportsOfModule(moduleSymbol)
    .map(({ name }) => name)
    .sort();
}

describe('public package surface', () => {
  const elementExports = componentExports(readManifest('elements'));
  const reactExports = componentExports(readManifest('react'));

  it('freezes exact elements and React root symbols', () => {
    const elementSourceNames = sourceExportNames('elements');
    const reactSourceNames = sourceExportNames('react');

    expect({
      count: elementSourceNames.length,
      fingerprint: fingerprint(elementSourceNames),
      runtimeCount: Object.keys(elementApi).length,
      runtimeFingerprint: fingerprint(Object.keys(elementApi)),
    }).toEqual({
      count: 387,
      fingerprint: 'b5672f175c0e456a1030b0cb77cffe15e39f7e14dfd744d2dd476cb69275e809',
      runtimeCount: 302,
      runtimeFingerprint: 'd60b6e6d9e8806c0c2cd10aed77c982d7f5489add444ee63834adeb8c61e068a',
    });
    expect({
      count: reactSourceNames.length,
      fingerprint: fingerprint(reactSourceNames),
      runtimeCount: Object.keys(reactApi).length,
      runtimeFingerprint: fingerprint(Object.keys(reactApi)),
    }).toEqual({
      count: 144,
      fingerprint: 'e7379f3c2ed4a378c191f8ced6ee8095bc123517adf44f74fba29045690b21a5',
      runtimeCount: 64,
      runtimeFingerprint: '48b628073f3d38bf1392699cf6e777379476ab9f29e9b77c143c33cdcf8bd79e',
    });
  });

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
