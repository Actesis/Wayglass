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
  it('preserves both failed attempts without inventing execution evidence', () => {
    expect(record).toContain('| 1 | `2026-09-07T22:52:57Z` | failed | `WG_RC_OUTPUT_TEMP`');
    expect(record).toContain('| 2 | `2026-09-07T22:52:57Z` | failed | `WG_RC_COMMAND_START`');
    expect(record).toContain('Inventing them would create false evidence');
    expect(record).toContain('Attempt 2 used the corrected temporary-root location from attempt 1');
  });

  it('records that neither attempt crossed the network boundary', () => {
    expect(record).toContain('Both failures occurred before candidate assembly');
    expect(record).toContain('Neither attempt contacted npm');
    expect(record).toContain('no snapshot exists');
  });

  it('documents the exact launcher cause and bounded correction', () => {
    expect(record).toContain('shebang-bearing `pnpm.cjs` store file has mode `0644`');
    expect(record).toContain('invoke it through the current absolute Node executable');
    expect(record).toContain('Arguments remain an explicit argv array');
    expect(record).toContain('does not select a global or alternate pnpm');
  });

  it('requires new authority for attempt 3', () => {
    expect(record).toContain('does not retry E5B');
    expect(record).toContain('Attempt 3 requires a fresh explicit project-owner instruction');
    expect(record).toContain('does not authorize another capture attempt');
  });
});
