import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');
const adr = read('docs/architecture/adr/0036-private-release-candidate-tooling.md');
const contract = read('docs/governance/phase-6c-release-candidate-proof-contract.md');
const roadmap = read('docs/phase-6.md');

describe('Phase 6C release-candidate proof proposal', () => {
  it('binds the proof to the accepted frozen source', () => {
    expect(contract).toContain('`ce400e89930a047c6af1c6992c64cfe422a1eeee`');
    expect(contract).toContain('`da2550b5aa2636d0896ae61e08c340f405fe1412`');
    expect(contract).toContain(
      '`bdb6b4e916bd5fa2330fc3dd3f272814c6940ec04dab78b437b7007be386a525`',
    );
    expect(adr).toContain('separate authenticated inputs');
    expect(contract).toContain('may not correct or reinterpret it');
  });

  it('defines deterministic private manifest projection', () => {
    for (const boundary of [
      'retain `private: true`',
      'remove `scripts`, `devDependencies`',
      '`workspace:`',
      '`file:`',
      '`link:`',
      'two-space JSON with a final newline',
    ]) {
      expect(contract).toContain(boundary);
    }
    expect(adr).toContain('no dependency is added');
    expect(contract).toMatch(/not preapproved npm\s+bytes/);
  });

  it('keeps builds and consumers isolated from the workspace and registry', () => {
    expect(contract).toContain('`pnpm install --offline --frozen-lockfile --ignore-scripts`');
    expect(contract).toContain('detached Git worktree');
    expect(contract).toContain('outside every workspace and Git worktree');
    expect(contract).toContain('no npm registry request');
    expect(contract).toContain('rejects npm tokens');
    expect(adr).toMatch(/A missing local dependency-store entry is a\s+preflight failure/);
  });

  it('covers all packages, independent consumers, and deterministic evidence', () => {
    for (const name of ['core', 'tokens', 'themes', 'elements', 'icons', 'react']) {
      expect(contract).toContain(`@wayglass/${name}`);
    }
    expect(contract).toContain('The Vanilla probe');
    expect(contract).toContain('The React probe');
    expect(contract).toContain('Chromium, Firefox, and WebKit');
    expect(contract).toContain('Two complete builds with fresh temporary roots');
    expect(contract).toContain('SHA-256 tarball hashes');
  });

  it('sequences reviewable implementation and preserves later approval gates', () => {
    for (const stage of ['6C-A', '6C-B', '6C-C', '6C-D', '6C-E']) {
      expect(contract).toContain(`**${stage}`);
    }
    expect(contract).toContain('authorizes Phase 6C-B private tooling only');
    expect(contract).toContain('does not publish');
    expect(roadmap).toMatch(/Phase 6B is complete and Phase 6C-A\s+is proposed/);
  });
});
