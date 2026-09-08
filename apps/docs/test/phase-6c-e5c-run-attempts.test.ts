import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const record = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-e5c-run-attempts.md'),
  'utf8',
).replace(/\s+/g, ' ');
const captureRecord = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-e5b-capture-attempts.md'),
  'utf8',
).replace(/\s+/g, ' ');

describe('Phase 6C-E5C authoritative-run attempt record', () => {
  it('preserves the first run attempt without inventing its start time', () => {
    expect(record).toContain('| 1 | `2026-09-08T03:37:50Z` | failed | `WG_RC_OUTPUT_TEMP`');
    expect(record).toContain('was not independently captured before invocation');
    expect(record).toContain('immediate postcondition-verification time');
  });

  it('binds the attempt to the authorized source, tooling, and snapshot', () => {
    expect(record).toContain('`ce400e89930a047c6af1c6992c64cfe422a1eeee`');
    expect(record).toContain('`d7298882df605c2778b30fbbb0d1c51ac2a6446b`');
    expect(record).toContain('`c67751865ce3fe05e294fc173246abefb0f875fe5f5afd6dc6f5f09a239ed3f9`');
    expect(record).toContain('`WG_RC_ADVISORY_MEDIA_TYPE` warning');
  });

  it('records the preflight cause and exact absence of retained evidence', () => {
    expect(record).toContain('Node resolves the operating-system temporary root');
    expect(record).toContain('rejected the output at its first path-containment preflight');
    expect(record).toContain('The failure occurred before the uncached quality gate');
    expect(record).toContain('No integrated-evidence hash');
    expect(record).toContain(
      'absolute machine paths and raw command output are intentionally excluded',
    );
  });

  it('records cleanup and preserves the approved snapshot', () => {
    expect(record).toContain('the requested output directory did not exist');
    expect(record).toContain('no sibling partial directory existed');
    expect(record).toContain('only the main repository worktree existed');
    expect(record).toContain('approved snapshot still had its exact accepted SHA-256');
  });

  it('requires fresh authority and a still-valid snapshot for any later attempt', () => {
    expect(record).toContain('consumed its one-shot authority');
    expect(record).toContain('fresh explicit project-owner authorization');
    expect(record).toContain('before `2026-09-09T03:21:31Z`');
    expect(captureRecord).toContain('No E5C retry is authorized');
  });
});
