import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
const surfaces = {
  shared: ['model.ts', 'selection.ts', 'inspection.ts', 'native-adapter.css'],
  native: ['svg-adapter.ts', 'svg-geometry.ts', 'native-adapter.ts', 'native-geometry.ts'],
  uplot: ['uplot-adapter.ts', 'uplot-model.ts'],
  d3: ['svg-adapter.ts', 'svg-geometry.ts', 'd3-adapter.ts', 'd3-geometry.ts'],
} as const;

function source(path: string): string {
  return readFileSync(new URL(path, `file://${sourceRoot}/`), 'utf8');
}

function nonblankLines(paths: readonly string[]): number {
  return paths.reduce(
    (total, path) =>
      total +
      source(path)
        .split('\n')
        .filter((line) => line.trim().length > 0).length,
    0,
  );
}

describe('Phase 5C comparative maintenance surface', () => {
  it('retains the reviewed owned-source inventory', () => {
    const measurements = Object.fromEntries(
      Object.entries(surfaces).map(([name, paths]) => [name, nonblankLines(paths)]),
    );
    console.info(`P5C_MAINTENANCE_MEASUREMENTS ${JSON.stringify(measurements)}`);
    expect(measurements).toEqual({
      shared: 783,
      native: 358,
      uplot: 342,
      d3: 349,
    });
  });

  it('makes candidate-specific browser lifecycle ownership explicit', () => {
    const nativeAndD3 = [...new Set([...surfaces.native, ...surfaces.d3])].map(source).join('\n');
    const uplot = surfaces.uplot.map(source).join('\n');

    expect(nativeAndD3).not.toContain('ResizeObserver');
    expect(nativeAndD3).not.toContain('requestAnimationFrame');
    expect(nativeAndD3.match(/addEventListener\(/g)).toHaveLength(1);
    expect(nativeAndD3.match(/removeEventListener\(/g)).toHaveLength(1);
    expect(uplot).toContain('ResizeObserver');
    expect(uplot).toContain('requestAnimationFrame');
    expect(uplot).toContain('cancelAnimationFrame');
    expect(uplot.match(/addEventListener\(/g)).toHaveLength(1);
    expect(uplot.match(/removeEventListener\(/g)).toHaveLength(1);
  });
});
