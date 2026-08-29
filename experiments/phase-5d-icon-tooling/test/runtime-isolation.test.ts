import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { build, type Rollup } from 'vite';

import {
  isRuntimeIconName,
  renderRuntimeIcon,
  runtimeIconNames,
} from '../src/runtime-candidate.js';

const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));
const experimentRoot = join(repositoryRoot, 'experiments/phase-5d-icon-tooling');
const candidateEntry = join(experimentRoot, 'src/runtime-candidate.ts');
const noIconEntry = join(repositoryRoot, 'packages/core/src/index.ts');

function filesBelow(root: string): string[] {
  const ignored = new Set(['.turbo', 'coverage', 'dist', 'node_modules', 'storybook-static']);
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isFile()) return [path];
    return entry.isDirectory() && !ignored.has(entry.name) ? filesBelow(path) : [];
  });
}

async function bundle(entry: string) {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      lib: { entry, fileName: 'candidate', formats: ['es'] },
      minify: 'esbuild',
      target: 'es2022',
      write: false,
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((candidate) =>
    'output' in candidate ? candidate.output : [],
  );
  const chunks = outputs.filter((item): item is Rollup.OutputChunk => item.type === 'chunk');
  return {
    code: chunks.map(({ code }) => code).join('\n'),
    modules: Object.keys(Object.assign({}, ...chunks.map(({ modules }) => modules))),
  };
}

describe('Phase 5D generated runtime compatibility', () => {
  it('preserves current production names and geometry while keeping the directional fixture private', () => {
    expect(runtimeIconNames).toEqual(['arrow-inline-start', 'close', 'menu', 'more', 'refresh']);
    expect(isRuntimeIconName('refresh')).toBe(true);
    expect(isRuntimeIconName('porch-light')).toBe(false);

    expect(renderRuntimeIcon('close', 'ltr').primitives).toEqual([
      {
        attributes: { d: 'M 6 6 L 18 18 M 18 6 L 6 18', fill: 'none', stroke: 'currentColor' },
        element: 'path',
      },
    ]);
    expect(renderRuntimeIcon('menu', 'ltr').primitives[0]?.attributes.d).toBe(
      'M 4 7 L 20 7 M 4 12 L 20 12 M 4 17 L 20 17',
    );
    expect(renderRuntimeIcon('more', 'ltr').primitives).toHaveLength(3);
    expect(renderRuntimeIcon('refresh', 'ltr').primitives[0]?.attributes.d).toContain(
      'A 7 7 0 0 0 6.4 6.4',
    );
  });

  it('keeps decorative semantics and applies mirroring only to declared directional geometry', () => {
    const ltr = renderRuntimeIcon('arrow-inline-start', 'ltr');
    const rtl = renderRuntimeIcon('arrow-inline-start', 'rtl');
    const neutralRtl = renderRuntimeIcon('close', 'rtl');

    expect(ltr.attributes).toEqual({
      'aria-hidden': 'true',
      focusable: 'false',
      viewBox: '0 0 24 24',
    });
    expect(rtl.attributes.transform).toBe('scale(-1 1) translate(-24 0)');
    expect(neutralRtl.attributes).not.toHaveProperty('transform');
    expect(Object.isFrozen(rtl)).toBe(true);
    expect(Object.isFrozen(rtl.primitives)).toBe(true);
  });
});

describe('Phase 5D runtime and package isolation', () => {
  it('bundles the runtime candidate without generator, dependency, registration, or global leakage', async () => {
    const candidate = await bundle(candidateEntry);

    expect(candidate.modules.some((id) => id.endsWith('/generated/runtime-catalog.ts'))).toBe(true);
    expect(candidate.modules.every((id) => id.startsWith(experimentRoot))).toBe(true);
    expect(candidate.modules.some((id) => id.includes('/src/generator.'))).toBe(false);
    expect(candidate.modules.some((id) => id.includes('/src/model.'))).toBe(false);
    expect(candidate.code).not.toMatch(/customElements|fetch\(|XMLHttpRequest|globalThis|window\./);
  });

  it('keeps a clean no-icon consumer free of icon and proof modules', async () => {
    const consumer = await bundle(noIconEntry);

    expect(consumer.modules.some((id) => id.includes('/packages/core/'))).toBe(true);
    expect(consumer.modules.some((id) => id.includes('/packages/icons/'))).toBe(false);
    expect(consumer.modules.some((id) => id.includes('/phase-5d-icon-tooling/'))).toBe(false);
    expect(consumer.code).not.toContain('wg-icon');
  });

  it('keeps the proof outside every production manifest, export, and executable source graph', () => {
    const workspace = readFileSync(join(repositoryRoot, 'pnpm-workspace.yaml'), 'utf8');
    expect(workspace).not.toContain('phase-5d-icon-tooling');
    expect(filesBelow(experimentRoot).some((path) => path.endsWith('package.json'))).toBe(false);

    for (const manifest of filesBelow(join(repositoryRoot, 'packages')).filter((path) =>
      path.endsWith('package.json'),
    )) {
      expect(readFileSync(manifest, 'utf8'), relative(repositoryRoot, manifest)).not.toContain(
        'phase-5d-icon-tooling',
      );
    }

    for (const source of filesBelow(join(repositoryRoot, 'packages')).filter((path) =>
      ['.js', '.jsx', '.ts', '.tsx'].includes(extname(path)),
    )) {
      expect(readFileSync(source, 'utf8'), relative(repositoryRoot, source)).not.toMatch(
        /phase-5d-icon-tooling|generated\/runtime-catalog/,
      );
    }

    const iconManifest = JSON.parse(
      readFileSync(join(repositoryRoot, 'packages/icons/package.json'), 'utf8'),
    ) as { exports: Record<string, unknown> };
    expect(Object.keys(iconManifest.exports)).toEqual(['.']);
  });
});
