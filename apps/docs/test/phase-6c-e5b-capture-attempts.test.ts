import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const record = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-e5b-capture-attempts.md'),
  'utf8',
).replace(/\s+/g, ' ');

describe('Phase 6C-E5B advisory-capture attempt record', () => {
  it('preserves all failed attempts without inventing execution evidence', () => {
    expect(record).toContain('| 1 | `2026-09-07T22:52:57Z` | failed | `WG_RC_OUTPUT_TEMP`');
    expect(record).toContain('| 2 | `2026-09-07T22:52:57Z` | failed | `WG_RC_COMMAND_START`');
    expect(record).toContain('| 3 | `2026-09-07T23:01:24Z` | failed | `WG_RC_DEPENDENCY_AUDIT`');
    expect(record).toContain('| 4 | `2026-09-08T00:38:35Z` | failed | `WG_RC_ADVISORY_TRANSPORT`');
    expect(record).toContain('Inventing them would create false evidence');
    expect(record).toContain('Attempt 2 used the corrected temporary-root location from attempt 1');
  });

  it('records that neither attempt crossed the network boundary', () => {
    expect(record).toContain('Attempt 3 completed candidate assembly');
    expect(record).toContain('None of the three attempts contacted npm');
    expect(record).toContain('attempt 4 made one npm bulk-advisory request');
    expect(record).toContain('No snapshot exists');
  });

  it('documents the exact launcher cause and bounded correction', () => {
    expect(record).toContain('shebang-bearing `pnpm.cjs` store file has mode `0644`');
    expect(record).toContain('invoke it through the current absolute Node executable');
    expect(record).toContain('Arguments remain an explicit argv array');
    expect(record).toContain('does not select a global or alternate pnpm');
  });

  it('preserves manifest-only license evidence for disposition', () => {
    expect(record).toContain('package manifest declares `BSD-3-Clause`');
    expect(record).toContain('retains `licenseFiles: []` as explicit evidence');
    expect(record).toContain('does not invent legal text');
    expect(record).toContain('missing or empty manifest declaration still fails closed');
    expect(record).toContain(
      'hard-offline audited assembly against implementation commit `6246992`',
    );
    expect(record).toContain('retained the exact seven-node graph');
    expect(record).toContain('created no snapshot');
  });

  it('records attempt 4 and bounds provider decoding', () => {
    expect(record).toContain('endpoint returned status 200');
    expect(record).toContain('does not claim that its body was gzip or valid JSON');
    expect(record).toContain('hashes the exact raw response before any decoding');
    expect(record).toContain('bounds decompressed output to one MiB');
    expect(record).toContain('explicit dependency-security warnings');
  });

  it('requires new authority for attempt 5', () => {
    expect(record).toContain('does not retry E5B');
    expect(record).toContain('Attempt 5 requires a fresh explicit project-owner instruction');
    expect(record).toContain('does not authorize another capture attempt');
  });
});
