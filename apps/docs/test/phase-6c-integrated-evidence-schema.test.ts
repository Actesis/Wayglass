import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const record = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-integrated-evidence-schema.md'),
  'utf8',
).replace(/\s+/g, ' ');

describe('Phase 6C-E1 integrated evidence schema record', () => {
  it('defines a strict versioned envelope around two complete runs', () => {
    expect(record).toContain('schema version `2`');
    expect(record).toContain('version `1` assembly evidence');
    expect(record).toContain('ordered `run-1` and `run-2`');
    expect(record).toContain('Unknown or missing fields fail');
    expect(record).toContain('36 browser results');
  });

  it('separates deterministic equality from observed execution data', () => {
    expect(record).toContain(
      'run label and observed assembly environment are deliberately outside',
    );
    expect(record).toContain('Object keys are sorted recursively');
    expect(record).toContain('array order remains contractual');
    expect(record).toContain('externally computed SHA-256');
  });

  it('hash-binds every later exact evidence section without changing the envelope', () => {
    for (const path of [
      '`audits/packages.json`',
      '`audits/dependencies.json`',
      '`observations/environment.json`',
      '`observations/quality-gates.json`',
      '`observations/provenance.json`',
      '`observations/advisories.json`',
    ]) {
      expect(record).toContain(path);
    }
    expect(record).toContain('without adding fields to or weakening the version `2` envelope');
  });

  it('retains attempt failures and authorizes only E2 after acceptance', () => {
    expect(record).toContain('must end with a successful attempt');
    expect(record).toContain('Earlier failures remain ordered before the pass');
    expect(record).toContain('82 assertions across 17 files');
    expect(record).toContain('authorizes Phase 6C-E2 package and dependency audit');
    expect(record).toContain('does not accept a candidate or evidence bundle');
  });
});
