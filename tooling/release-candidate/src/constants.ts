import type { CandidateDirectory } from './types.ts';

export const candidateDirectories = Object.freeze([
  'core',
  'tokens',
  'themes',
  'elements',
  'icons',
  'react',
] as const satisfies readonly CandidateDirectory[]);

export const candidatePackageNames = Object.freeze(
  candidateDirectories.map((directory) => `@wayglass/${directory}` as const),
);

export const packedRootFiles = Object.freeze(['README.md', 'LICENSE', 'NOTICE', 'package.json']);
export const packageFilesAllowlist = Object.freeze(['dist', 'README.md', 'LICENSE', 'NOTICE']);

export const expectedSideEffects = Object.freeze({
  core: false,
  tokens: false,
  themes: Object.freeze(['**/*.css']),
  elements: Object.freeze(['**/*.css']),
  icons: false,
  react: false,
} satisfies Readonly<Record<CandidateDirectory, boolean | readonly string[]>>);

export const expectedDependencies = Object.freeze({
  core: undefined,
  tokens: undefined,
  themes: Object.freeze({ '@wayglass/tokens': '^0.1.0' }),
  elements: Object.freeze({
    '@wayglass/core': '^0.1.0',
    '@wayglass/themes': '^0.1.0',
    lit: '3.3.3',
  }),
  icons: Object.freeze({ lit: '3.3.3' }),
  react: Object.freeze({ '@lit/react': '1.0.8' }),
} satisfies Readonly<Record<CandidateDirectory, Readonly<Record<string, string>> | undefined>>);

export const expectedPeerDependencies = Object.freeze({
  core: undefined,
  tokens: undefined,
  themes: undefined,
  elements: undefined,
  icons: undefined,
  react: Object.freeze({
    '@wayglass/elements': '^0.1.0',
    react: '>=19.0.0 <20',
  }),
} satisfies Readonly<Record<CandidateDirectory, Readonly<Record<string, string>> | undefined>>);
