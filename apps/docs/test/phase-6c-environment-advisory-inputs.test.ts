import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const record = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-environment-advisory-inputs.md'),
  'utf8',
).replace(/\s+/g, ' ');

describe('Phase 6C-E3 environment and advisory input record', () => {
  it('uses allowlisted, exact environment and quality evidence', () => {
    expect(record).toContain('exact allowlist rather than a copy of `process.env`');
    expect(record).toContain('pinned pnpm `11.9.0`');
    expect(record).toContain('repository-root `pnpm check` command');
    expect(record).toContain('caches bypassed');
    expect(record).toContain('does not broaden the separately accepted environment-support claim');
  });

  it('normalizes provenance, notices, and append-only runner history', () => {
    expect(record).toContain('Machine paths are replaced by three exact symbolic input identities');
    expect(record).toContain('No field claims published npm provenance');
    expect(record).toContain('reject control characters');
    expect(record).toContain('in-process append-only attempt ledger');
    expect(record).toContain('never retry automatically');
  });

  it('requires a fresh, graph-bound approved snapshot without a fetch fallback', () => {
    expect(record).toContain('Freshness is evaluated against an explicit reference time');
    expect(record).toContain('window cannot exceed seven days');
    expect(record).toContain('refer to an exact node supplied from the validated production graph');
    expect(record).toContain('validator has no fetch or registry fallback');
    expect(record).toContain('E5 remains the only stage');
  });

  it('keeps E3 pure and authorizes only E4 after owner acceptance', () => {
    expect(record).toContain('perform no filesystem access, subprocess, network request');
    expect(record).toContain('101 focused tests across 19 files');
    expect(record).toContain('Acceptance completes Phase 6C-E3 and authorizes Phase 6C-E4');
    expect(record).toContain('does not approve advisory retrieval');
  });
});
