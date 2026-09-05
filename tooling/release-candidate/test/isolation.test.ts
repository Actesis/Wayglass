import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import * as candidate from '../src/index.ts';
import { repositoryRoot } from './fixtures.ts';

describe('Phase 6C-B private-tool isolation', () => {
  it('imports without invoking an effect adapter', () => {
    expect(candidate.candidateDirectories).toHaveLength(6);
    expect(candidate.sha256('wayglass')).toMatch(/^[a-f0-9]{64}$/);
  });

  it('keeps subprocess, filesystem writes, network, and process exit out of the pure core', () => {
    for (const file of [
      'constants.ts',
      'error.ts',
      'hash.ts',
      'index.ts',
      'inspection.ts',
      'manifest.ts',
      'reproducibility.ts',
      'types.ts',
    ]) {
      const source = readFileSync(
        resolve(repositoryRoot, `tooling/release-candidate/src/${file}`),
        'utf8',
      );
      expect(source, file).not.toMatch(
        /node:(?:child_process|fs|http|https|net)|process\.exit|fetch\s*\(/,
      );
    }
  });
});
