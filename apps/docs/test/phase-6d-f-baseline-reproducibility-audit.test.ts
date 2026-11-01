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

  it('freezes the corrected source, absolute-parent proof, and admission identity', () => {
    expect(audit).toContain('8d154458b7de3818db9338f47c1775102fe9e361');
    expect(audit).toContain('74090e9b3c2394c15780a4605735a442fb8495bb');
    expect(audit).toContain('Independent absolute-parent proof');
    expect(audit).toContain('Recursive comparison reported no differing file');
    expect(audit).toContain('1701653b00fe6b701fa62053fdd97ce170891b1d09d8ae45c54b06d0b1d61fb7');
    expect(audit).toContain('d02ef91db33635b83031f1cefbce35651a7590e4187a233cc6bb7eb423d8bebd');
    expect(audit).toContain('750 files; 39,480,622 bytes');
  });

  it('preserves history, limits supersession, and records the untouched provider boundary', () => {
    expect(audit).toContain('36587495199bff85019af53f6a3ec72c65d5efcc29df211edc82feb76e28a122');
    expect(audit).toContain('3996ac5e29cba52de7146f311a5b156be43873ea9f3b73d7e45e8603eed1c032');
    expect(audit).toContain('former PR #281 disposition is expressly superseded');
    expect(audit).toContain('made no Cloudflare request and changed no external state');
    expect(audit).toContain('one fresh run');
  });
});
