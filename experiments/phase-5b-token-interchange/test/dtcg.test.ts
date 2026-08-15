import { describe, expect, it } from 'vitest';

import { createDtcgExchange } from '../src/dtcg.js';
import { createWayglassTokenGraph } from '../src/source.js';

const resolverPolicy = {
  defaultTheme: 'wayglass-dark',
  defaultDensity: 'compact',
  sourceRevision: '0123456789abcdef0123456789abcdef01234567',
} as const;

function exchange() {
  return createDtcgExchange(createWayglassTokenGraph(), resolverPolicy);
}

type JsonRecord = Record<string, unknown>;

function file(path: string): JsonRecord {
  const content = exchange().files[path];
  if (!content) {
    throw new Error(`Missing exchange file ${path}.`);
  }
  return JSON.parse(content) as JsonRecord;
}

function at(value: unknown, path: readonly string[]): unknown {
  return path.reduce<unknown>((current, segment) => {
    if (typeof current !== 'object' || current === null || Array.isArray(current)) {
      throw new Error(`Expected an object at ${path.join('.')}.`);
    }

    const next = (current as JsonRecord)[segment];
    if (next === undefined) {
      throw new Error(`Missing JSON path ${path.join('.')}.`);
    }
    return next;
  }, value);
}

describe('DTCG 2025.10 candidate transform', () => {
  it('creates deterministic base, mode, resolver, and manifest files without mutating the graph', () => {
    const graph = createWayglassTokenGraph();
    const before = structuredClone(graph);

    const first = createDtcgExchange(graph, resolverPolicy);
    const second = createDtcgExchange(graph, resolverPolicy);

    expect(second).toEqual(first);
    expect(graph).toEqual(before);
    expect(Object.keys(first.files)).toEqual([
      'modes/density/comfortable.json',
      'modes/density/compact.json',
      'modes/theme/wayglass-dark.json',
      'modes/theme/wayglass-light.json',
      'resolver.json',
      'tokens.json',
      'wayglass-manifest.json',
    ]);
  });

  it('accounts explicitly for the four tokens DTCG dimensions cannot represent', () => {
    const result = exchange();

    expect(result.manifest.includedTokens).toBe(524);
    expect(result.manifest.omittedTokens.map(({ source }) => source)).toEqual([
      'component.metric.size.value-minimum',
      'component.split.ratio.emphasized',
      'component.split.ratio.equal',
      'size.metric.value-minimum',
    ]);
    expect(result.manifest.omittedTokens.map(({ reason }) => reason).join('\n')).toMatch(/4ch/);
    expect(result.manifest.omittedTokens.map(({ reason }) => reason).join('\n')).toMatch(/1fr/);
    expect(result.manifest.omittedOverrides).toEqual([]);
  });

  it('nests identities and uses $root when a token also owns children', () => {
    const tokens = file('tokens.json');

    expect(at(tokens, ['component', 'panel', 'space', '$root'])).toMatchObject({
      $type: 'dimension',
      $value: '{space.reference.4}',
    });
    expect(at(tokens, ['component', 'panel', 'space', 'section'])).toMatchObject({
      $type: 'dimension',
      $value: '{space.semantic.section.compact}',
    });
  });

  it('converts every current supported primitive into structured DTCG values', () => {
    const tokens = file('tokens.json');

    expect(at(tokens, ['color', 'reference', 'blue', '500', '$value'])).toEqual({
      colorSpace: 'srgb',
      components: [79 / 255, 140 / 255, 1],
      hex: '#4f8cff',
    });
    expect(at(tokens, ['color', 'semantic', 'modal', 'backdrop', '$value'])).toEqual({
      colorSpace: 'srgb',
      components: [9 / 255, 13 / 255, 20 / 255],
      alpha: 0.72,
      hex: '#090d14',
    });
    expect(at(tokens, ['space', 'reference', '4', '$value'])).toEqual({
      value: 1,
      unit: 'rem',
    });
    expect(at(tokens, ['typography', 'size', 'body'])).toMatchObject({
      $type: 'dimension',
      $value: { value: 1, unit: 'rem' },
    });
    expect(at(tokens, ['motion', 'duration', 'fast', '$value'])).toEqual({
      value: 120,
      unit: 'ms',
    });
    expect(at(tokens, ['motion', 'easing', 'standard', '$value'])).toEqual([0.2, 0, 0, 1]);
    expect(at(tokens, ['typography', 'family', 'numeric', '$value'])).toEqual([
      'ui-monospace',
      'SFMono-Regular',
      'Roboto Mono',
      'monospace',
    ]);
    expect(at(tokens, ['typography', 'weight', 'medium', '$value'])).toBe(550);
    expect(at(tokens, ['typography', 'line-height', 'body', '$value'])).toBe(1.5);
    expect(at(tokens, ['elevation', 'panel', '$value'])).toEqual({
      color: {
        colorSpace: 'srgb',
        components: [0, 0, 0],
        alpha: 0.2,
        hex: '#000000',
      },
      offsetX: { value: 0, unit: 'rem' },
      offsetY: { value: 0.5, unit: 'rem' },
      blur: { value: 1.5, unit: 'rem' },
      spread: { value: 0, unit: 'rem' },
    });
  });

  it('preserves Wayglass semantic metadata as a namespaced optional extension', () => {
    const tokens = file('tokens.json');

    expect(
      at(tokens, ['color', 'semantic', 'condition', 'positive', '$extensions', 'com.wayglass']),
    ).toEqual({
      sourceIdentity: 'color.semantic.condition.positive',
      sourceType: 'color',
      layer: 'semantic',
      concern: 'visual',
    });
  });

  it('creates mode overlays as aliases without copying resolved values', () => {
    const dark = file('modes/theme/wayglass-dark.json');
    const compact = file('modes/density/compact.json');

    expect(at(dark, ['color', 'semantic', 'condition', 'positive', '$value'])).toBe(
      '{color.reference.green.500}',
    );
    expect(at(compact, ['component', 'panel', 'space', '$root', '$value'])).toBe(
      '{space.reference.3}',
    );
  });

  it('creates a 2025.10 resolver with orthogonal theme and density modifiers', () => {
    const resolver = file('resolver.json');

    expect(resolver).toMatchObject({
      $schema: 'https://www.designtokens.org/schemas/2025.10/resolver.json',
      version: '2025.10',
      sets: { foundation: { sources: [{ $ref: 'tokens.json' }] } },
      modifiers: {
        theme: { default: 'wayglass-dark' },
        density: { default: 'compact' },
      },
      resolutionOrder: [
        { $ref: '#/sets/foundation' },
        { $ref: '#/modifiers/theme' },
        { $ref: '#/modifiers/density' },
      ],
    });
    expect(Object.keys(at(resolver, ['modifiers', 'theme', 'contexts']) as JsonRecord)).toEqual([
      'wayglass-dark',
      'wayglass-light',
    ]);
    expect(Object.keys(at(resolver, ['modifiers', 'density', 'contexts']) as JsonRecord)).toEqual([
      'comfortable',
      'compact',
    ]);
  });

  it('rejects resolver defaults that are not normalized modes', () => {
    const graph = createWayglassTokenGraph();

    expect(() =>
      createDtcgExchange(graph, { ...resolverPolicy, defaultTheme: 'wayglass-missing' }),
    ).toThrow(/is not a normalized mode/);
    expect(() =>
      createDtcgExchange(graph, { ...resolverPolicy, defaultDensity: 'spacious' }),
    ).toThrow(/is not a normalized mode/);
  });
});
