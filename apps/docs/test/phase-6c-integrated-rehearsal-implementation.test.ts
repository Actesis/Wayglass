import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const record = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-integrated-rehearsal-implementation.md'),
  'utf8',
).replace(/\s+/g, ' ');

describe('Phase 6C-D5 integrated rehearsal implementation record', () => {
  it('binds the exact source, candidates, consumers, and browser cases', () => {
    expect(record).toContain('ce400e89930a047c6af1c6992c64cfe422a1eeee');
    expect(record).toContain('six byte-identical private candidate tarballs');
    expect(record).toContain('two Vanilla and four React');
    expect(record).toContain('exactly 36 browser cases');
    expect(record).toContain('cannot substitute a pre-existing candidate directory');
  });

  it('preflights exact third-party material without widening the boundary', () => {
    for (const version of ['`5.9.3`', '`6.0.3`', '`8.1.5`', '`19.0.0`', '`19.2.8`']) {
      expect(record).toContain(version);
    }
    expect(record).toContain('third-party-only manifests');
    expect(record).toContain('`--offline`, `--ignore-scripts`');
    expect(record).toContain('does not fall back to another version');
  });

  it('records the exact honest blocked preflight', () => {
    expect(record).toContain('missing `postcss@8.5.28`');
    expect(record).toContain('zero downloaded packages');
    expect(record).toContain('`ERR_PNPM_NO_OFFLINE_TARBALL`');
    expect(record).toContain('No candidate assembly, consumer build, browser launch');
    expect(record).toContain('No registry access is authorized');
  });

  it('keeps D5 open and retains the material-acquisition gate', () => {
    expect(record).toContain('73 assertions across 16 files');
    expect(record).toContain('including 250 documentation assertions');
    expect(record).toContain('does not complete Phase 6C-D5');
    expect(record).toContain('separately explicit project-owner decision');
    expect(record).toContain('does not authorize acquiring offline material');
  });
});
