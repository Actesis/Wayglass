import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const plan = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-authoritative-execution-plan.md'),
  'utf8',
).replace(/\s+/g, ' ');

describe('Phase 6C-E5 authoritative execution and disposition plan', () => {
  it('closes the dependency-audit and advisory ordering gap', () => {
    expect(plan).toContain('binds a snapshot to the SHA-256 of the canonical dependency audit');
    expect(plan).toContain('first reproduce the exact audit material offline');
    expect(plan).toContain('rejects the snapshot if any audit byte changed');
  });

  it('separates implementation, capture, execution, and disposition authority', () => {
    expect(plan).toContain('6C-E5A — capture-tool implementation');
    expect(plan).toContain('6C-E5B — dated advisory capture');
    expect(plan).toContain('6C-E5C — one authoritative retained run');
    expect(plan).toContain('6C-E5D — project-owner disposition');
    expect(plan).toContain('Authority does not flow implicitly');
  });

  it('uses one exact credential-free bulk query without fallback', () => {
    expect(plan).toContain('sorted seven-node public production graph');
    expect(plan).toContain('at most one request');
    expect(plan).toContain('does not invoke the CLI fallback');
    expect(plan).toContain('sends no authorization header, cookie, npm token');
    expect(plan).toContain('Redirects are rejected');
  });

  it('requires exact evidence, an append-only ledger, and owner disposition', () => {
    expect(plan).toContain('independent verifier');
    expect(plan).toContain('There is no automatic retry in either ledger');
    expect(plan).toContain('Any advisory finding requires explicit owner disposition');
    expect(plan).toContain('accept the exact bundle and complete Phase 6C');
  });

  it('authorizes only offline E5A implementation after acceptance', () => {
    expect(plan).toContain('authorizes Phase 6C-E5A capture-tool implementation and tests only');
    expect(plan).toContain('does not authorize a live advisory request');
    expect(plan).toContain('separate SpaceTraders client');
  });
});
