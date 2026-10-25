import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const record = read('docs/governance/phase-6d-e-wrangler-rehearsal.md').replace(/\s+/g, ' ');

describe('Phase 6D-E Wrangler rehearsal record', () => {
  it('publishes the implementation record through the documentation surface', () => {
    expect(read('apps/docs/governance/phase-6d-e-wrangler-rehearsal.md')).toContain(
      '../../../docs/governance/phase-6d-e-wrangler-rehearsal.md',
    );
    expect(read('apps/docs/.vitepress/config.ts')).toContain(
      '/governance/phase-6d-e-wrangler-rehearsal',
    );
  });

  it('records exact configuration, clean-artifact, and local-runtime evidence', () => {
    expect(record).toContain('wrangler@4.128.0');
    expect(record).toContain('2026-09-07');
    expect(record).toContain('aadb0bf82f64a5a4e2ef322aed636ce3d7e7ea74');
    expect(record).toContain('36587495199bff85019af53f6a3ec72c65d5efcc29df211edc82feb76e28a122');
    expect(record).toContain('3996ac5e29cba52de7146f311a5b156be43873ea9f3b73d7e45e8603eed1c032');
    expect(record).toContain('728 files; 37,400,072 bytes');
    expect(record).toContain('30 matching GET and HEAD responses');
    expect(record).toContain('2 test files and 6 tests');
  });

  it('preserves emulator caveats and the separate preview authority boundary', () => {
    expect(record).toContain('merged in PR #273');
    expect(record).toContain('two narrow differences');
    expect(record).toContain('Canonical `307` responses include custom `_headers`');
    expect(record).toContain('omits `Allow`');
    expect(record).toContain('does not itself authorize a Version upload');
    expect(record).toContain('fresh, explicit project-owner authorization');
    expect(record).toContain('npm publication');
  });
});
