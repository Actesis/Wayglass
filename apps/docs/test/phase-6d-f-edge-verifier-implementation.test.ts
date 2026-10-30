import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const record = read('docs/governance/phase-6d-f-edge-verifier-implementation.md').replace(
  /\s+/g,
  ' ',
);

describe('Phase 6D-F read-only edge verifier implementation', () => {
  it('publishes the implementation record through the documentation surface', () => {
    expect(read('apps/docs/governance/phase-6d-f-edge-verifier-implementation.md')).toContain(
      '../../../docs/governance/phase-6d-f-edge-verifier-implementation.md',
    );
    expect(read('apps/docs/.vitepress/config.ts')).toContain(
      '/governance/phase-6d-f-edge-verifier-implementation',
    );
  });

  it('records exact immutable, read-only, and fail-closed behavior', () => {
    expect(record).toContain('dependency-free, read-only verifier');
    expect(record).toContain('one exact immutable Cloudflare Version URL');
    expect(record).toContain("binds the URL's eight-character hexadecimal version prefix");
    expect(record).toContain('Status, response bytes, canonical `Location`');
    expect(record).toContain('both `noindex` and `nofollow` tokens');
    expect(record).toContain('stops the run before evidence publication');
  });

  it('freezes sanitized evidence and preserves external authorization boundaries', () => {
    expect(record).toContain('mode `0600`');
    expect(record).toContain('no local artifact or evidence path');
    expect(record).toContain('Failed runs leave no final evidence file');
    expect(record).toContain('does not replace the accepted hydrated Chromium');
    expect(record).toContain('remain blocked on the exact authorization');
  });
});
