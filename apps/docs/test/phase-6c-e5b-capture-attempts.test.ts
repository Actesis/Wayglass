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
  it('preserves the append-only attempt ledger without inventing execution evidence', () => {
    expect(record).toContain('| 1 | `2026-09-07T22:52:57Z` | failed | `WG_RC_OUTPUT_TEMP`');
    expect(record).toContain('| 2 | `2026-09-07T22:52:57Z` | failed | `WG_RC_COMMAND_START`');
    expect(record).toContain('| 3 | `2026-09-07T23:01:24Z` | failed | `WG_RC_DEPENDENCY_AUDIT`');
    expect(record).toContain('| 4 | `2026-09-08T00:38:35Z` | failed | `WG_RC_ADVISORY_TRANSPORT`');
    expect(record).toContain(
      '| 5 | `2026-09-08T03:18:41Z` | passed | `WG_RC_ADVISORY_CAPTURE_PASS`',
    );
    expect(record).toContain('Inventing them would create false evidence');
    expect(record).toContain('Attempt 2 used the corrected temporary-root location from attempt 1');
  });

  it('records the network boundary crossed by each authorized attempt', () => {
    expect(record).toContain('Attempt 3 completed candidate assembly');
    expect(record).toContain('None of the first three attempts contacted npm');
    expect(record).toContain('attempt 4 made one npm bulk-advisory request');
    expect(record).toContain('Attempt 5 made one separately authorized request');
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

  it('records and independently validates the exact retained snapshot', () => {
    expect(record).toContain('`c67751865ce3fe05e294fc173246abefb0f875fe5f5afd6dc6f5f09a239ed3f9`');
    expect(record).toContain('`44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a`');
    expect(record).toContain('confirmed zero findings and the single warning');
    expect(record).toContain('confirmed an exact 24-hour validity interval');
  });

  it('requires explicit snapshot approval and separate E5C authority', () => {
    expect(record).toContain('explicitly approve or reject the exact attempt-5 snapshot');
    expect(record).toContain('Approval completes E5B for this snapshot only');
    expect(record).toContain('It does not authorize E5C');
    expect(record).toContain('requires a separate explicit instruction');
  });
});
