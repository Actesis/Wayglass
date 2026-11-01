import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const audit = read('docs/governance/phase-6d-f-baseline-reproducibility-audit.md').replace(
  /\s+/g,
  ' ',
);

describe('Phase 6D-F baseline reproducibility audit', () => {
  it('publishes the audit through the documentation surface', () => {
    expect(read('apps/docs/governance/phase-6d-f-baseline-reproducibility-audit.md')).toContain(
      '../../../docs/governance/phase-6d-f-baseline-reproducibility-audit.md',
    );
    expect(read('apps/docs/.vitepress/config.ts')).toContain(
      '/governance/phase-6d-f-baseline-reproducibility-audit',
    );
  });

  it('freezes the source, three-build proof, and corrected admission identity', () => {
    expect(audit).toContain('aadb0bf82f64a5a4e2ef322aed636ce3d7e7ea74');
    expect(audit).toContain('26951463fb82a8e98174e437ef780eca6fd83246');
    expect(audit).toContain('three separate output directories');
    expect(audit).toContain('all 14 workspace tasks bypassed the cache');
    expect(audit).toContain('zero tasks were reported as cached');
    expect(audit).toContain('6edb7d6e4ebca328cfdc720b3af33ea41df9543724cdd1bbdf3b653a35a809fd');
    expect(audit).toContain('72cef95a99cfc43617f228d3619ac3391041e719038c695a5b99c4b6cf112f22');
    expect(audit).toContain('728 files; 37,400,072 bytes');
  });

  it('preserves history, limits supersession, and records the untouched provider boundary', () => {
    expect(audit).toContain('36587495199bff85019af53f6a3ec72c65d5efcc29df211edc82feb76e28a122');
    expect(audit).toContain('3996ac5e29cba52de7146f311a5b156be43873ea9f3b73d7e45e8603eed1c032');
    expect(audit).toContain('only as the normative Phase 6D-F baseline admission identity');
    expect(audit).toContain('made no Cloudflare request and changed no external state');
    expect(audit).toContain('one new rehearsal from a fresh run root');
  });
});
