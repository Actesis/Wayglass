import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const retainedFiles = [
  'svg-adapter.ts',
  'svg-geometry.ts',
  'native-adapter.ts',
  'native-geometry.ts',
] as const;

const source = retainedFiles
  .map((file) => readFileSync(fileURLToPath(new URL(`../src/${file}`, import.meta.url)), 'utf8'))
  .join('\n');

describe('Phase 5C retained native maintenance surface', () => {
  it('avoids observer, animation-frame, timer, and registration ownership', () => {
    expect(source).not.toContain('ResizeObserver');
    expect(source).not.toContain('requestAnimationFrame');
    expect(source).not.toContain('cancelAnimationFrame');
    expect(source).not.toContain('setTimeout');
    expect(source).not.toContain('setInterval');
    expect(source).not.toContain('customElements.define');
    expect(source.match(/addEventListener\(/g)).toHaveLength(1);
    expect(source.match(/removeEventListener\(/g)).toHaveLength(1);
  });
});
