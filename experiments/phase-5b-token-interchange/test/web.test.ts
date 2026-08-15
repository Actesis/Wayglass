import { describe, expect, it } from 'vitest';

import { createThemeCss } from '../../../packages/themes/src/css.js';
import { createCss } from '../../../packages/tokens/src/compiler.js';
import { tokens } from '../../../packages/tokens/src/definitions.js';
import { createWayglassTokenGraph } from '../src/source.js';
import { currentWebPolicy } from '../src/web-policy.js';
import {
  createWebThemeCss,
  createWebTokenCss,
  tokenNameToWebCustomProperty,
  type WebTransformPolicy,
} from '../src/web.js';

function policy(overrides: Partial<WebTransformPolicy> = {}): WebTransformPolicy {
  return { ...currentWebPolicy, ...overrides };
}

describe('normalized graph web transform', () => {
  it('reproduces the current base token CSS byte for byte', () => {
    const graph = createWayglassTokenGraph();

    expect(createWebTokenCss(graph)).toBe(createCss(tokens));
  });

  it('reproduces the current theme and density CSS byte for byte', () => {
    const graph = createWayglassTokenGraph();

    expect(createWebThemeCss(graph, currentWebPolicy)).toBe(createThemeCss());
  });

  it('keeps CSS custom-property identity stable', () => {
    expect(tokenNameToWebCustomProperty('color.semantic.condition.critical')).toBe(
      '--wg-color-semantic-condition-critical',
    );
  });

  it('is deterministic and does not mutate the normalized graph', () => {
    const graph = createWayglassTokenGraph();
    const before = structuredClone(graph);

    const first = [createWebTokenCss(graph), createWebThemeCss(graph, currentWebPolicy)];
    const second = [createWebTokenCss(graph), createWebThemeCss(graph, currentWebPolicy)];

    expect(second).toEqual(first);
    expect(graph).toEqual(before);
  });

  it('requires exact theme and density order coverage', () => {
    const graph = createWayglassTokenGraph();

    expect(() =>
      createWebThemeCss(
        graph,
        policy({ themeOrder: ['wayglass-dark', 'wayglass-dark', 'wayglass-light'] }),
      ),
    ).toThrow(/duplicate mode/);
    expect(() => createWebThemeCss(graph, policy({ themeOrder: ['wayglass-dark'] }))).toThrow(
      /omits modes/,
    );
    expect(() =>
      createWebThemeCss(graph, policy({ densityOrder: ['compact', 'comfortable', 'spacious'] })),
    ).toThrow(/unknown mode/);
  });

  it('requires a normalized default theme and explicit color schemes', () => {
    const graph = createWayglassTokenGraph();

    expect(() => createWebThemeCss(graph, policy({ defaultTheme: 'wayglass-missing' }))).toThrow(
      /not a normalized theme/,
    );
    expect(() =>
      createWebThemeCss(graph, policy({ colorSchemes: { 'wayglass-dark': 'dark' } })),
    ).toThrow(/missing an explicit color scheme/);
  });

  it('rejects missing, non-color, and empty forced-color policy targets', () => {
    const graph = createWayglassTokenGraph();

    expect(() =>
      createWebThemeCss(
        graph,
        policy({ forcedColors: { 'color.semantic.missing': 'CanvasText' } }),
      ),
    ).toThrow(/targets missing token/);
    expect(() =>
      createWebThemeCss(graph, policy({ forcedColors: { 'space.reference.1': 'CanvasText' } })),
    ).toThrow(/is not a color token/);
    expect(() =>
      createWebThemeCss(graph, policy({ forcedColors: { 'color.semantic.text.primary': ' ' } })),
    ).toThrow(/has an empty value/);
  });
});
