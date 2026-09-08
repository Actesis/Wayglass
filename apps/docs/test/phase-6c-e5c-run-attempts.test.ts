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

  it('records attempt 2 with its actual command-start time and pass code', () => {
    expect(record).toContain('| 2 | `2026-09-08T03:46:21Z` | passed | `WG_RC_INTEGRATED_PASS`');
    expect(record).toContain('actual whole-second UTC command-start time');
    expect(record).toContain('`1b8bf4bfb664a882f8a008c3c297f5d8506a09bb`');
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

  it('records the exact retained bundle and independent verification', () => {
    expect(record).toContain('`ad579157e79acccdc0cb5927994c45fe563656f1b6c93d64b091d130fdaec73b`');
    expect(record).toContain('`520755286939ef89b04ef45fcabdb86f5fbc5c402d2ad236a4585eafc2e1e20b`');
    expect(record).toContain('12 files totaling 339,947 bytes');
    expect(record).toContain('independent verifier completed at `2026-09-08T03:56:06Z`');
  });

  it('records all six exact tarball hashes', () => {
    expect(record).toContain('`cbe647b8cd0fa897e4e3a6b40d12faf9be24f183c16c067409bab8a9d247edfb`');
    expect(record).toContain('`c4b014498265816e3fc7d098ee3dfba2a5ade54ec63d24456edef9846cc6ba5d`');
    expect(record).toContain('`2cd030d29ff41f639c21be3c1b66d306937b7665de4b1b1d6af5fc8720ef18af`');
    expect(record).toContain('`ea5581609b2b868f5482c7b40b998606bd4bcb7b758b4923b2d67bbbebcfe320`');
    expect(record).toContain('`25080039b5afc2caa484e64af352ae2d7a8fe10bd320a41b47b8c20c578d8f71`');
    expect(record).toContain('`39696e55a5c75839684e9e42c22ca37b0a72f052bf6a48ff0d06f932bd08a971`');
  });

  it('records exact run and matrix counts', () => {
    expect(record).toContain('Both complete runs were byte-identical');
    expect(record).toContain('four Vanilla scenario results');
    expect(record).toContain('eight React scenario results');
    expect(record).toContain('72 browser results');
    expect(record).toContain('all nine recorded result groups');
  });

  it('preserves every retained warning and limitation', () => {
    expect(record).toContain('`WG_RC_ADVISORY_MEDIA_TYPE`');
    expect(record).toContain('`WG_RC_LIT_DEVELOPMENT_WARNING`');
    expect(record).toContain('`WG_RC_NODE_DEPRECATION_WARNING`');
    expect(record).toContain('`WG_RC_STORYBOOK_CHUNK_WARNING`');
    expect(record).toContain('`WG_RC_QUALITY_WARNING_PRESENT`');
    expect(record).toContain('`WG_RC_AUTOMATED_BROWSER_ONLY`');
    expect(record).toContain('`WG_RC_WINDOWS_UNOBSERVED`');
  });

  it('preserves the E5D owner-disposition boundary', () => {
    expect(record).toContain('consumed its one-shot authority');
    expect(record).toContain('does not accept the candidate');
    expect(record).toContain('accept candidate, narrow or refreeze, or no candidate');
    expect(captureRecord).toContain('| Valid through | `2026-09-09T03:21:31Z`');
  });
});
