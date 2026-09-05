import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { CandidateDirectory, CandidateSource, PackageFile } from '../src/types.ts';

const testDirectory = dirname(fileURLToPath(import.meta.url));
export const repositoryRoot = resolve(testDirectory, '../../..');
const encoder = new TextEncoder();

export function sourceManifest(directory: CandidateDirectory): Record<string, unknown> {
  return JSON.parse(
    readFileSync(resolve(repositoryRoot, `packages/${directory}/package.json`), 'utf8'),
  );
}

export function sourceCandidates(): CandidateSource[] {
  return (['core', 'tokens', 'themes', 'elements', 'icons', 'react'] as const).map((directory) => ({
    directory,
    manifest: sourceManifest(directory),
  }));
}

export function bytes(value: string): Uint8Array {
  return encoder.encode(value);
}

export function coreFiles(packageJson = '{}\n'): PackageFile[] {
  return [
    { path: 'README.md', bytes: bytes('Core readme\n') },
    { path: 'LICENSE', bytes: bytes('Apache-2.0\n') },
    { path: 'NOTICE', bytes: bytes('Wayglass\n') },
    { path: 'package.json', bytes: bytes(packageJson) },
    { path: 'dist/index.js', bytes: bytes('export {};\n') },
    { path: 'dist/index.d.ts', bytes: bytes('export {};\n') },
    {
      path: 'dist/index.js.map',
      bytes: bytes(JSON.stringify({ version: 3, sources: ['../src/index.ts'], mappings: '' })),
    },
  ];
}
