import { execFileSync } from 'node:child_process';

import { describe, expect, it } from 'vitest';

import { measureTokenExchangeCapacity } from '../src/capacity.js';

describe('Phase 5B retained capacity measurement', () => {
  it('prints the precommitted current and 10× measurement as JSON', () => {
    const sourceRevision = process.env['WAYGLASS_SOURCE_REVISION'];
    expect(sourceRevision, 'Set WAYGLASS_SOURCE_REVISION to the measured commit.').toMatch(
      /^[0-9a-f]{7,64}$/i,
    );
    const headRevision = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    }).trim();
    const trackedChanges = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    }).trim();
    expect(sourceRevision, 'WAYGLASS_SOURCE_REVISION must equal the checked-out commit.').toBe(
      headRevision,
    );
    expect(trackedChanges, 'Commit tracked changes before measuring.').toBe('');

    const measurement = measureTokenExchangeCapacity(sourceRevision!, 30);
    process.stdout.write(`WAYGLASS_PHASE5B_CAPACITY=${JSON.stringify(measurement)}\n`);
    expect(measurement.results).toHaveLength(2);
  });
});
