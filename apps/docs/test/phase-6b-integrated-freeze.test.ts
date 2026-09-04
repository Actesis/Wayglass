import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');
const freeze = read('docs/governance/phase-6b-integrated-freeze.md');
const audit = read('docs/governance/phase-6b-completion-audit.md');
const packageNames = ['core', 'tokens', 'themes', 'elements', 'icons', 'react'] as const;

describe('Phase 6B integrated v1 freeze proposal', () => {
  it('identifies one exact source, tree, and lockfile', () => {
    expect(freeze).toContain('`ce400e89930a047c6af1c6992c64cfe422a1eeee`');
    expect(freeze).toContain('`da2550b5aa2636d0896ae61e08c340f405fe1412`');
    expect(freeze).toContain('`bdb6b4e916bd5fa2330fc3dd3f272814c6940ec04dab78b437b7007be386a525`');
    expect(freeze).toContain(
      'adds governance documentation and executable documentation guards only',
    );
  });

  it('retains exactly six private 0.1.0 candidates and their release units', () => {
    for (const name of packageNames) {
      const manifest = JSON.parse(read(`packages/${name}/package.json`));
      expect(manifest).toMatchObject({
        name: `@wayglass/${name}`,
        version: '0.1.0',
        private: true,
      });
    }
    expect(freeze).toContain(
      '`@wayglass/core`, `@wayglass/tokens`, `@wayglass/themes`, `@wayglass/elements`',
    );
    expect(freeze).toContain('`@wayglass/icons`, `@wayglass/react`');
    expect(freeze).toContain('remain outside the npm release set');
  });

  it('records the exact repository and browser matrix without broadening evidence', () => {
    for (const result of [
      'all 14 scheduled builds passed',
      'all 20 scheduled typecheck tasks passed',
      'all 20 scheduled test tasks passed',
      'all 208 documentation and governance assertions passed',
      'all 58 private icon-pipeline tests',
      'all 93 private token-tooling tests',
      'all 24 unit tests',
      '**1,515**',
      '**1,467**',
      '**48**',
    ]) {
      expect(freeze).toContain(result);
    }
    expect(freeze).toMatch(/does not become human\s+screen-reader evidence/);
    expect(freeze).toMatch(/No failed\s+browser case was retried into a pass/);
  });

  it('keeps source dry-runs separate from Phase 6C packed candidates', () => {
    expect(freeze).toMatch(/\| `@wayglass\/core`\s+\|\s+24\s+\|/);
    expect(freeze).toMatch(/\| `@wayglass\/elements`\s+\|\s+305\s+\|/);
    expect(freeze).toMatch(/\| `@wayglass\/react`\s+\|\s+272\s+\|/);
    expect(freeze).toContain('not approved tarball hashes');
    expect(freeze).toContain('deterministic manifest projection');
    expect(freeze).toContain('no known vulnerability');
    expect(freeze).toContain('MIT and BSD-3-Clause');
  });

  it('records adverse evidence and finds no high-severity blocker', () => {
    expect(freeze).toContain('## Adverse run and observation log');
    expect(freeze).toContain('could not resolve registry metadata');
    expect(freeze).toContain('chunks-over-500-kB warning');
    expect(freeze).toContain('Vite pre-scan warning');
    expect(freeze).toContain('No unresolved severity-one or severity-two blocker was found');
  });

  it('records acceptance, closes Phase 6B, and limits the authorization', () => {
    expect(freeze).toContain('**Status:** Accepted by the project owner');
    expect(audit).toContain('Integrated freeze — complete');
    expect(audit).toMatch(/12\. Run the complete stabilization and freeze matrix\s*\| Complete/);
    expect(audit).toContain('Phase 6B is complete');
    expect(freeze).toContain('authorizes Phase 6C validation work only');
    expect(freeze).toContain('Publication, tagging, repository-visibility');
  });
});
