import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const record = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-browser-consumer-implementation.md'),
  'utf8',
).replace(/\s+/g, ' ');

describe('Phase 6C-D4 cross-browser consumer implementation record', () => {
  it('records the exact engine, consumer, and build-stage matrix', () => {
    for (const engine of ['Chromium', 'Firefox', 'WebKit']) expect(record).toContain(engine);
    expect(record).toContain('two Vanilla compiler scenarios therefore define 12 browser cases');
    expect(record).toContain('four React/compiler scenarios define 24 browser cases');
    expect(record).toContain('exactly 36 cases');
    expect(record).toContain('primary build');
    expect(record).toContain('removal build');
  });

  it('keeps delivery isolated and loopback-only', () => {
    expect(record).toContain('bound only to `127.0.0.1`');
    expect(record).toContain('serves only regular files below that exact `dist` root');
    expect(record).toContain('rejects path escape and symlinks');
    expect(record).toContain('fresh browser and context');
  });

  it('defines semantics, trusted interaction, state axes, and automated accessibility', () => {
    expect(record).toContain('condition `critical`, knowledge `stale`, activity `pending`');
    expect(record).toContain('Boolean value `asserted`');
    expect(record).toContain('browser-trusted pointer activation');
    expect(record).toContain('typed React event callback');
    expect(record).toContain('runs Axe');
    expect(record).toContain('do not create a new human screen-reader');
  });

  it('retains the offline limitation and D5 acceptance gate', () => {
    expect(record).toContain('**Status:** Proposed for project-owner acceptance');
    expect(record).toContain('passes 67 assertions across 14 files');
    expect(record).toContain('including 246 documentation assertions');
    expect(record).toContain('offline store still lacks the accepted TypeScript `5.9.3`');
    expect(record).toContain('authorizes Phase 6C-D5 integrated ephemeral rehearsal only');
    expect(record).toContain('does not accept a Vanilla, React, browser, candidate');
  });
});
