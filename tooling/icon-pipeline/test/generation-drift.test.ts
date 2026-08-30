import { describe, expect, it } from 'vitest';

import { iconCatalog, productionIconNames } from '../src/catalog.js';
import { detectGeneratedArtifactDrift } from '../src/drift.js';
import { generateIconArtifacts, generatedArtifactPaths } from '../src/generation.js';
import { directionalFixture } from './fixtures.js';

describe('pure icon artifact generation', () => {
  const context = { iconPackageVersion: '0.0.0' } as const;

  it('is deterministic across repeated and reordered input', () => {
    const first = generateIconArtifacts(iconCatalog, context);
    expect(generateIconArtifacts(iconCatalog, context)).toEqual(first);
    expect(generateIconArtifacts([...iconCatalog].reverse(), context)).toEqual(first);
    expect(Object.keys(first)).toEqual(generatedArtifactPaths);
  });

  it('keeps runtime data inert and manifests authenticated without recursion', () => {
    const artifacts = generateIconArtifacts(iconCatalog, context);
    const runtime = artifacts['packages/icons/src/generated/catalog.ts'];
    const source = JSON.parse(
      artifacts['tooling/icon-pipeline/generated/source-manifest.json'],
    ) as { icons: unknown[] };
    const output = JSON.parse(
      artifacts['tooling/icon-pipeline/generated/output-manifest.json'],
    ) as { artifacts: Array<{ path: string }>; generator: string };

    expect(runtime).toContain('generatedIconCatalog');
    expect(runtime).not.toMatch(/accessibleUse|provenance|label|tooling\/icon-pipeline|import /);
    expect(source.icons).toHaveLength(4);
    expect(source.icons[0]).toEqual(
      expect.objectContaining({
        accessibleUse: 'reinforcement-only',
        category: 'control',
        provenance: { author: 'Wayglass', license: 'Apache-2.0' },
      }),
    );
    expect(output.generator).toBe('wayglass-icon-pipeline');
    expect(output.artifacts.map(({ path }: { path: string }) => path)).not.toContain(
      'tooling/icon-pipeline/generated/output-manifest.json',
    );
  });

  it('creates a static token-backed review with all required contexts', () => {
    const html = generateIconArtifacts([...iconCatalog, directionalFixture], context)[
      'tooling/icon-pipeline/generated/review-index.html'
    ];
    expect(html).not.toMatch(/<script\b/i);
    expect(html).toContain('../../../packages/tokens/dist/tokens.css');
    expect(html).toContain('../../../packages/themes/dist/themes.css');
    expect(html).toContain('data-theme="light"');
    expect(html).toContain('data-theme="dark"');
    expect(html).toContain('data-wg-theme="wayglass-light"');
    expect(html).toContain('data-wg-theme="wayglass-dark"');
    expect(html).toContain('data-size="compact"');
    expect(html).toContain('data-size="standard"');
    expect(html).toContain('data-size="prominent"');
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('data-direction="mirrors-in-rtl"');
    expect(html).toContain('Named reference');
    expect(html).toContain('Owning controls');
    expect(html).toContain('Icon-absent task');
    expect(html).toContain('Missing preview');
    expect(productionIconNames).not.toContain('arrow-inline-start' as never);
  });

  it('reports changed, missing, then sorted unexpected paths', () => {
    const expected = generateIconArtifacts(iconCatalog, context);
    const actual = {
      ...expected,
      [generatedArtifactPaths[0]]: 'changed',
      'z-unexpected': 'z',
      'a-unexpected': 'a',
    } as Record<string, string>;
    delete actual[generatedArtifactPaths[1]];
    expect(detectGeneratedArtifactDrift(actual, expected)).toEqual([
      { artifact: generatedArtifactPaths[0], kind: 'changed' },
      { artifact: generatedArtifactPaths[1], kind: 'missing' },
      { artifact: 'a-unexpected', kind: 'unexpected' },
      { artifact: 'z-unexpected', kind: 'unexpected' },
    ]);
  });
});
