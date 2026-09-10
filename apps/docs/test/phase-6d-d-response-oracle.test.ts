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
    expect(record).toContain('479116c00faf73e7a76ef7e865f10edb5ea7fae2');
    expect(record).toContain('69399fc891ca47bbb911e61c5c1934ba48ca3cc0a3fd55e61c421bdc76b1bab7');
    expect(record).toContain('0866ecaf61f0e287f52c5b5afa7cc1ee7698a154dad7973f0bd8a7459937b803');
    expect(record).toContain('722 files; 36,946,868 bytes');
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
