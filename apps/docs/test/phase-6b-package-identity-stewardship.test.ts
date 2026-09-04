import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');

const packages = {
  core: {
    description: 'Framework-neutral state models for operational interfaces.',
    homepage: 'https://wayglass.hoagsoftworks.com/',
    keywords: ['wayglass', 'operational-ui', 'state-model', 'typescript'],
  },
  tokens: {
    description: 'Semantic design tokens and generated web artifacts for Wayglass.',
    homepage: 'https://wayglass.hoagsoftworks.com/foundations/tokens',
    keywords: ['wayglass', 'design-tokens', 'css-custom-properties', 'operational-ui'],
  },
  themes: {
    description: 'Wayglass themes and density modes for operational interfaces.',
    homepage: 'https://wayglass.hoagsoftworks.com/foundations/tokens',
    keywords: ['wayglass', 'themes', 'design-tokens', 'operational-ui'],
  },
  elements: {
    description: 'Domain-neutral Wayglass Custom Elements for operational interfaces.',
    homepage: 'https://wayglass.hoagsoftworks.com/components/',
    keywords: ['wayglass', 'web-components', 'custom-elements', 'operational-ui'],
  },
  icons: {
    description: 'Generated, direction-aware icons for Wayglass interfaces.',
    homepage: 'https://wayglass.hoagsoftworks.com/',
    keywords: ['wayglass', 'icons', 'web-components', 'operational-ui'],
  },
  react: {
    description: 'Typed React bindings for Wayglass Custom Elements.',
    homepage: 'https://wayglass.hoagsoftworks.com/frameworks/react',
    keywords: ['wayglass', 'react', 'web-components', 'operational-ui'],
  },
} as const;

describe('Phase 6B package identity and stewardship', () => {
  it('sets complete bounded identity metadata while preserving release gates', () => {
    for (const [directory, expected] of Object.entries(packages)) {
      const manifest = JSON.parse(read(`packages/${directory}/package.json`));

      expect(manifest).toMatchObject({
        name: `@wayglass/${directory}`,
        private: true,
        description: expected.description,
        license: 'Apache-2.0',
        author: 'Wayglass contributors',
        homepage: expected.homepage,
        repository: {
          type: 'git',
          url: 'git+https://github.com/Actesis/Wayglass.git',
          directory: `packages/${directory}`,
        },
        bugs: { url: 'https://github.com/Actesis/Wayglass/issues' },
        keywords: expected.keywords,
        publishConfig: {
          access: 'public',
          registry: 'https://registry.npmjs.org/',
        },
        files: ['dist', 'README.md', 'LICENSE', 'NOTICE'],
      });
      expect(manifest.funding).toBeUndefined();
      expect(manifest.files).not.toContain('src');
    }
  });

  it('gives every package usage and stewardship guidance', () => {
    for (const directory of Object.keys(packages)) {
      const packageReadme = read(`packages/${directory}/README.md`);
      expect(packageReadme).toContain(`# \`@wayglass/${directory}\``);
      expect(packageReadme).toMatch(/private release candidates/);
      expect(packageReadme).toContain('https://wayglass.hoagsoftworks.com/maintenance/support');
      expect(packageReadme).toContain('https://wayglass.hoagsoftworks.com/maintenance/security');
      expect(packageReadme).toContain('https://wayglass.hoagsoftworks.com/maintenance/migration');
      expect(packageReadme).toContain('Apache-2.0 © Wayglass contributors.');
    }
  });

  it('packs byte-identical Apache license and notice baselines', () => {
    const license = read('LICENSE');
    const notice = read('NOTICE');

    for (const directory of Object.keys(packages)) {
      expect(read(`packages/${directory}/LICENSE`)).toBe(license);
      expect(read(`packages/${directory}/NOTICE`)).toBe(notice);
    }
  });

  it('establishes shared changelog, migration, deprecation, security, support, and release notes', () => {
    expect(read('CHANGELOG.md')).toMatch(/## Unreleased/);
    expect(read('MIGRATION.md')).toMatch(/no prior public release/i);
    expect(read('DEPRECATIONS.md')).toMatch(/no deprecated public API/i);
    expect(read('SECURITY.md')).toMatch(/Report a vulnerability/);
    expect(read('SECURITY.md')).toMatch(/prerequisite/);
    expect(read('SUPPORT.md')).toMatch(/release-specific support matrix is authoritative/i);
    expect(read('docs/governance/release-note-template.md')).toMatch(
      /Tarball names, SHA-256 hashes/,
    );
  });

  it('retains debuggable maps without selecting authored source or embedded source content', () => {
    const compilerOptions = JSON.parse(read('tsconfig.base.json')).compilerOptions;
    expect(compilerOptions).toMatchObject({
      declaration: true,
      declarationMap: true,
      sourceMap: true,
    });
    expect(compilerOptions.inlineSourceMap).not.toBe(true);
    expect(compilerOptions.inlineSources).not.toBe(true);
  });
});
