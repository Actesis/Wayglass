import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const record = read('docs/governance/phase-6d-d-response-oracle-implementation.md').replace(
  /\s+/g,
  ' ',
);

describe('Phase 6D-D independent response oracle record', () => {
  it('publishes the implementation record through the documentation surface', () => {
    expect(read('apps/docs/governance/phase-6d-d-response-oracle-implementation.md')).toContain(
      '../../../docs/governance/phase-6d-d-response-oracle-implementation.md',
    );
    expect(read('apps/docs/.vitepress/config.ts')).toContain(
      '/governance/phase-6d-d-response-oracle-implementation',
    );
  });

  it('records exact clean artifact and response-check evidence', () => {
    expect(record).toContain('3978b3cbf814bb829ad966f6bfe6cd7429fcc6b6');
    expect(record).toContain('7a519cc645c696f3537e71795b7c2a6d5fad602132ec8e225ed23e90a00f0eb9');
    expect(record).toContain('7d34230cc0a44d1b5bf94e1db6de15ae65e98efbc2fa14b6a04e0cc01b31eb46');
    expect(record).toContain('725 files; 37,179,347 bytes');
    expect(record).toContain('14 test files and 131 tests');
  });

  it('preserves the browser, Wrangler, deployment, and publication boundaries', () => {
    expect(record).toContain('hydration shell');
    expect(record).toContain('local server and Chromium proof');
    expect(record).toContain('not a claim of exact Cloudflare runtime parity');
    expect(record).toContain('does not authorize Wrangler installation or configuration');
    expect(record).toContain('preview upload');
    expect(record).toContain('npm publication');
  });
});
