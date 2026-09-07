import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const plan = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-integrated-candidate-plan.md'),
  'utf8',
).replace(/\s+/g, ' ');

describe('Phase 6C-E integrated candidate record plan', () => {
  it('keeps the exact frozen source, package, consumer, and browser boundaries', () => {
    expect(plan).toContain('`ce400e89930a047c6af1c6992c64cfe422a1eeee`');
    expect(plan).toContain('same six private tarballs');
    expect(plan).toContain('two-Vanilla, four-React, 36-browser-case');
    expect(plan).toContain('manifests remain `private: true`');
  });

  it('requires two complete runs and one independently verifiable bundle', () => {
    expect(plan).toContain('two complete clean candidate runs');
    expect(plan).toContain('canonical machine-readable integrated record');
    expect(plan).toContain('inventory and SHA-256 for every retained file');
    expect(plan).toContain('verification command that reads the finished bundle without mutating');
    expect(plan).toContain('does not retry automatically');
  });

  it('covers every accepted audit category without granting a fetch path', () => {
    for (const category of [
      'Package contents',
      'Dependencies',
      'Compatibility',
      'Quality gates',
      'Environment',
      'Provenance inputs',
      'Advisories',
      'History',
    ]) {
      expect(plan).toContain(`| ${category} |`);
    }
    expect(plan).toContain('runner reads an already approved local snapshot');
    expect(plan).toContain('it has no fetch mode and no registry fallback');
  });

  it('stages E1 through E5 and authorizes only E1', () => {
    for (const stage of ['6C-E1', '6C-E2', '6C-E3', '6C-E4', '6C-E5']) {
      expect(plan).toContain(`### ${stage}`);
    }
    expect(plan).toContain('authorizes 6C-E1 schema');
    expect(plan).toContain('No publication-adjacent action');
  });
});
