import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const record = read('docs/governance/phase-6d-d-browser-proof.md').replace(/\s+/g, ' ');

describe('Phase 6D-D composed browser proof record', () => {
  it('publishes the implementation record through the documentation surface', () => {
    expect(read('apps/docs/governance/phase-6d-d-browser-proof.md')).toContain(
      '../../../docs/governance/phase-6d-d-browser-proof.md',
    );
    expect(read('apps/docs/.vitepress/config.ts')).toContain(
      '/governance/phase-6d-d-browser-proof',
    );
  });

  it('records exact clean artifact and Chromium evidence', () => {
    expect(record).toContain('98a7f4099ddfc88762c432c07b06099d46961447');
    expect(record).toContain('da4c4c5efe7f8f6b44570533a0769e14f587aa529c1ca17a84aa787ea876215f');
    expect(record).toContain('d7050d8ef093130811f99a03df462b2d30a850a1e63dedbbd41dc0351fdf286e');
    expect(record).toContain('725 files; 37,179,347 bytes');
    expect(record).toContain('15 test files and 133 tests');
    expect(record).toContain('320 × 640');
    expect(record).toContain('security-policy violation');
  });

  it('distinguishes visual corroboration and preserves the next authority boundary', () => {
    expect(record).toContain('merged in PR #272');
    expect(record).toContain('corroborating visual evidence');
    expect(record).toContain('does not replace the automated assertions');
    expect(record).toContain('wrangler@4.128.0');
    expect(record).toContain('Acceptance does not authorize Cloudflare or GitHub connection');
    expect(record).toContain('preview upload');
    expect(record).toContain('npm publication');
  });
});
