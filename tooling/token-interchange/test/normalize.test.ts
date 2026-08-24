import { describe, expect, it } from 'vitest';

import {
  densityTokenOverrides,
  themeTokenOverrides,
} from '../../../packages/themes/src/definitions.js';
import { tokens } from '../../../packages/tokens/src/definitions.js';
import { createNormalizedTokenGraph, type TokenGraphSources } from '../src/normalize.js';
import { createWayglassTokenGraph } from '../src/source.js';

function fixtureSources(overrides: Partial<TokenGraphSources> = {}): TokenGraphSources {
  return {
    tokens: {
      'color.reference.valid': {
        type: 'color',
        value: '#ffffff',
        description: 'Fixture reference.',
      },
      'color.semantic.valid': {
        type: 'color',
        value: '{color.reference.valid}',
        description: 'Fixture semantic alias.',
      },
    },
    themes: {},
    densities: {},
    ...overrides,
  };
}

describe('normalized Wayglass token graph', () => {
  it('accounts for every current token and official mode override exactly once', () => {
    const graph = createWayglassTokenGraph();
    const expectedModeCount =
      Object.keys(themeTokenOverrides).length + Object.keys(densityTokenOverrides).length;
    const expectedOverrideCount = [themeTokenOverrides, densityTokenOverrides].reduce(
      (total, modes) =>
        total +
        Object.values(modes).reduce(
          (modeTotal, overrides) => modeTotal + Object.keys(overrides).length,
          0,
        ),
      0,
    );

    expect(graph.interchangeBaseline).toBe('DTCG 2025.10');
    expect(graph.tokens).toHaveLength(Object.keys(tokens).length);
    expect(graph.modes).toHaveLength(expectedModeCount);
    expect(graph.modes.flatMap(({ overrides }) => overrides)).toHaveLength(expectedOverrideCount);
    expect(new Set(graph.tokens.map(({ source }) => source)).size).toBe(graph.tokens.length);
  });

  it('keeps state semantics separate even when values share references', () => {
    const graph = createWayglassTokenGraph();
    const semanticStateTokens = [
      'color.semantic.condition.informational',
      'color.semantic.knowledge.inferred',
      'color.semantic.activity.pending',
      'color.semantic.value.asserted',
    ].map((name) => graph.tokens.find(({ source }) => source === name));

    expect(semanticStateTokens.every((token) => token?.layer === 'semantic')).toBe(true);
    expect(semanticStateTokens.map((token) => token?.source)).toEqual([
      'color.semantic.condition.informational',
      'color.semantic.knowledge.inferred',
      'color.semantic.activity.pending',
      'color.semantic.value.asserted',
    ]);
    expect(new Set(semanticStateTokens.map((token) => token?.source)).size).toBe(4);
  });

  it('preserves component, motion, and typography distinctions explicitly', () => {
    const graph = createWayglassTokenGraph();

    expect(
      graph.tokens.find(({ source }) => source === 'component.button.space.block'),
    ).toMatchObject({ layer: 'component', concern: 'visual' });
    expect(graph.tokens.find(({ source }) => source === 'motion.duration.fast')).toMatchObject({
      layer: 'reference',
      concern: 'motion',
      type: 'duration',
    });
    expect(graph.tokens.find(({ source }) => source === 'typography.family.body')).toMatchObject({
      layer: 'reference',
      concern: 'typography',
      type: 'fontFamily',
    });
  });

  it('preserves aliases as typed graph edges', () => {
    const graph = createNormalizedTokenGraph(fixtureSources());

    expect(
      graph.tokens.find(({ source }) => source === 'color.semantic.valid')?.alias,
    ).toMatchObject({
      source: 'color.reference.valid',
      exchangePath: ['color', 'reference', 'valid'],
    });
  });

  it('orders tokens, modes, and overrides deterministically', () => {
    const first = createWayglassTokenGraph();
    const second = createNormalizedTokenGraph({
      tokens: Object.fromEntries(Object.entries(tokens).reverse()),
      themes: Object.fromEntries(
        Object.entries(themeTokenOverrides)
          .reverse()
          .map(([name, overrides]) => [
            name,
            Object.fromEntries(Object.entries(overrides).reverse()),
          ]),
      ),
      densities: Object.fromEntries(
        Object.entries(densityTokenOverrides)
          .reverse()
          .map(([name, overrides]) => [
            name,
            Object.fromEntries(Object.entries(overrides).reverse()),
          ]),
      ),
    });

    expect(second).toEqual(first);
  });

  it('rejects missing override targets and sources before transformation', () => {
    expect(() =>
      createNormalizedTokenGraph(
        fixtureSources({
          themes: { invalid: { 'color.semantic.missing': 'color.reference.valid' } },
        }),
      ),
    ).toThrow(/targets missing token/);

    expect(() =>
      createNormalizedTokenGraph(
        fixtureSources({
          themes: { invalid: { 'color.semantic.valid': 'color.reference.missing' } },
        }),
      ),
    ).toThrow(/references missing token/);
  });

  it('rejects empty descriptions and mode self-aliases', () => {
    expect(() =>
      createNormalizedTokenGraph(
        fixtureSources({
          tokens: {
            'color.reference.invalid': { type: 'color', value: '#ffffff', description: ' ' },
          },
        }),
      ),
    ).toThrow(/must include a description/);

    expect(() =>
      createNormalizedTokenGraph(
        fixtureSources({ themes: { invalid: { 'color.semantic.valid': 'color.semantic.valid' } } }),
      ),
    ).toThrow(/self-alias/);
  });

  it('rejects missing, mismatched, and cyclic token aliases', () => {
    expect(() =>
      createNormalizedTokenGraph(
        fixtureSources({
          tokens: {
            'color.semantic.invalid': {
              type: 'color',
              value: '{color.reference.missing}',
              description: 'Missing alias fixture.',
            },
          },
        }),
      ),
    ).toThrow(/references missing token/);

    expect(() =>
      createNormalizedTokenGraph(
        fixtureSources({
          tokens: {
            'color.reference.valid': {
              type: 'color',
              value: '#ffffff',
              description: 'Fixture reference.',
            },
            'size.semantic.invalid': {
              type: 'dimension',
              value: '{color.reference.valid}',
              description: 'Mismatched alias fixture.',
            },
          },
        }),
      ),
    ).toThrow(/of type "dimension" references token .* of type "color"/);

    expect(() =>
      createNormalizedTokenGraph(
        fixtureSources({
          tokens: {
            'color.semantic.first': {
              type: 'color',
              value: '{color.semantic.second}',
              description: 'First cyclic alias fixture.',
            },
            'color.semantic.second': {
              type: 'color',
              value: '{color.semantic.first}',
              description: 'Second cyclic alias fixture.',
            },
          },
        }),
      ),
    ).toThrow(/alias cycle detected/);
  });
});
