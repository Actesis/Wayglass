import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const record = read('docs/governance/phase-6d-f-browser-verifier-implementation.md').replace(
  /\s+/g,
  ' ',
);

describe('Phase 6D-F read-only browser verifier implementation', () => {
  it('publishes the implementation record through the documentation surface', () => {
    expect(read('apps/docs/governance/phase-6d-f-browser-verifier-implementation.md')).toContain(
      '../../../docs/governance/phase-6d-f-browser-verifier-implementation.md',
    );
    expect(read('apps/docs/.vitepress/config.ts')).toContain(
      '/governance/phase-6d-f-browser-verifier-implementation',
    );
  });

  it('records the exact Chromium, CSP, isolation, and accessibility matrix', () => {
    expect(record).toContain('direct, headless Chromium verifier');
    expect(record).toContain('UUID-to-Version-URL binding');
    expect(record).toContain('deliberately injected external image');
    expect(record).toContain('zero automated Axe violations');
    expect(record).toContain('both the documentation and Storybook missing routes');
    expect(record).toContain('complete browser context creates no cookie');
  });

  it('freezes sanitized evidence and preserves the execution authorization boundary', () => {
    expect(record).toContain('new mode-`0600` JSON file');
    expect(record).toContain('no screenshot, trace, video, DOM or accessibility dump');
    expect(record).toContain('Browser or artifact failure leaves no final evidence file');
    expect(record).toContain('must not authenticate, create, upload, deploy, roll back');
    expect(record).toContain('all-at-once execution authorization');
  });
});
