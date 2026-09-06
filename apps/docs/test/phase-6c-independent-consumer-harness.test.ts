import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');
const record = read('docs/governance/phase-6c-independent-consumer-harness.md');
const normalizedRecord = record.replace(/\s+/g, ' ');
const assembler = read('docs/governance/phase-6c-isolated-assembler-implementation.md').replace(
  /\s+/g,
  ' ',
);

describe('Phase 6C-D1 independent-consumer harness record', () => {
  it('defines the exact compiler and React cross-product', () => {
    for (const fact of [
      'TypeScript',
      '`5.9.3`',
      '`6.0.3`',
      '`19.0.0`',
      '`19.2.8`',
      'Vite remains exact at `8.1.5`',
      'The cross-product is intentional',
    ]) {
      expect(normalizedRecord).toContain(fact);
    }
  });

  it('keeps fixture and generated project ownership separate', () => {
    expect(normalizedRecord).toContain('Consumer templates are data');
    expect(normalizedRecord).toContain('reserved roots including `package.json`');
    expect(normalizedRecord).toContain('All selected Wayglass packages are direct');
    expect(normalizedRecord).toContain('private, ESM, script-free');
  });

  it('records offline isolation, exact evidence input, and cleanup', () => {
    expect(normalizedRecord).toContain('verifies one Phase 6C candidate evidence file');
    expect(normalizedRecord).toContain('offline frozen-lockfile install');
    expect(normalizedRecord).toContain('after success, install failure, or probe failure');
    expect(normalizedRecord).toContain('never contacts a registry to rescue it');
  });

  it('clarifies ephemeral D execution without moving E authority', () => {
    expect(normalizedRecord).toContain('Phase 6C-D may invoke the accepted assembler');
    expect(normalizedRecord).toContain('Phase 6C-E remains the first stage that retains');
    expect(assembler).toContain('Phase 6C-D may create and delete an ephemeral two-pass candidate');
    expect(assembler).toContain('Accepted and merged on September 5, 2026');
  });

  it('keeps D2 and release authority behind acceptance', () => {
    expect(normalizedRecord).toContain('**Status:** Accepted by the project owner');
    expect(normalizedRecord).toContain(
      'authorizes Phase 6C-D2 Vanilla consumer implementation only',
    );
    expect(normalizedRecord).toContain('does not accept a Vanilla or React result');
    expect(normalizedRecord).toContain('48 release-candidate assertions');
    expect(normalizedRecord).toContain('all 232 documentation/governance assertions pass');
    expect(normalizedRecord).toContain('all 14 scheduled builds');
    expect(normalizedRecord).toContain('all 20 scheduled typecheck tasks');
    expect(normalizedRecord).toContain('all 20 scheduled package and application test tasks');
    expect(normalizedRecord).toContain('Accepted and merged on September 5, 2026');
  });
});
