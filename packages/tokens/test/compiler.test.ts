import { describe, expect, it } from 'vitest';

import {
  createCss,
  createJson,
  tokenNameToCssCustomProperty,
  validateTokens,
} from '../src/compiler.js';
import { tokens } from '../src/definitions.js';

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255,
  );
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function referenceColor(name: keyof typeof tokens): string {
  const value = tokens[name].value;

  if (typeof value !== 'string' || !value.startsWith('#')) {
    throw new Error(`Token "${name}" is not a reference color.`);
  }

  return value;
}

describe('token compiler', () => {
  it('converts token paths to public CSS custom-property names', () => {
    expect(tokenNameToCssCustomProperty('color.semantic.condition.critical')).toBe(
      '--wg-color-semantic-condition-critical',
    );
  });

  it('produces deterministic, prefixed CSS custom properties', () => {
    const firstBuild = createCss(tokens);
    const secondBuild = createCss(tokens);

    expect(firstBuild).toBe(secondBuild);
    expect(firstBuild).toContain('--wg-color-semantic-condition-critical');
    expect(firstBuild).toContain('--wg-color-semantic-value-asserted');
    expect(firstBuild).toContain('--wg-color-semantic-selection-indicator');
    expect(firstBuild).toContain('--wg-component-button-size-minimum');
    expect(firstBuild).toContain('--wg-component-tab-size-minimum');
    expect(firstBuild).toContain('--wg-component-tab-panel-color-background');
    expect(firstBuild).toContain('--wg-component-value-tile-space-section');
    expect(firstBuild).toContain('--wg-component-focus-ring-color');
    expect(firstBuild).toContain('--wg-component-surface-color-panel');
    expect(firstBuild).toContain('--wg-component-divider-size-strong');
    expect(firstBuild).toContain('--wg-component-icon-size-standard');
    expect(firstBuild).toContain('var(--wg-color-reference-red-500)');
  });

  it('produces DTCG-shaped JSON metadata', () => {
    const output = JSON.parse(createJson(tokens)) as Record<
      string,
      { $description: string; $type: string; $value: string | number | readonly number[] }
    >;

    expect(output['color.semantic.surface.canvas']).toEqual({
      $description: 'Primary application canvas in the default dark theme.',
      $type: 'color',
      $value: '{color.reference.ink.950}',
    });
  });

  it('rejects missing token references', () => {
    expect(() =>
      validateTokens({
        'color.semantic.invalid': {
          value: '{color.reference.missing}',
          type: 'color',
          description: 'Invalid test token.',
        },
      }),
    ).toThrow(/missing token/);
  });

  it('contains the locked Phase 1 token layers without provisional metadata', () => {
    const names = Object.keys(tokens);
    const descriptions = Object.values(tokens).map(({ description }) => description);

    expect(names.some((name) => name.startsWith('color.reference.'))).toBe(true);
    expect(names.some((name) => name.startsWith('color.semantic.'))).toBe(true);
    expect(names.some((name) => name.startsWith('component.'))).toBe(true);
    expect(names).toEqual(
      expect.arrayContaining([
        'color.semantic.condition.positive',
        'color.semantic.knowledge.stale',
        'color.semantic.activity.pending',
        'color.semantic.value.asserted',
        'color.semantic.section.information',
        'border.semantic.function',
        'component.rail.color',
        'component.status-indicator.color.condition',
        'component.boolean-value.size.rail',
      ]),
    );
    expect(descriptions.some((description) => /provisional/i.test(description))).toBe(false);
  });

  it('contains the locked Phase 2A selection and tabs token layers', () => {
    const names = Object.keys(tokens);

    expect(names).toEqual(
      expect.arrayContaining([
        'color.semantic.selection.indicator',
        'color.semantic.selection.surface',
        'color.semantic.selection.text',
        'component.tab-list.space',
        'component.tab.color.background',
        'component.tab.color.background-selected',
        'component.tab.color.selection',
        'component.tab.size.minimum',
        'component.tab.size.selection',
        'component.tab-panel.color.background',
        'component.tab-panel.space',
      ]),
    );
  });

  it('contains the locked Phase 2C foundation token roles', () => {
    const names = Object.keys(tokens);

    expect(names).toEqual(
      expect.arrayContaining([
        'size.icon.compact',
        'size.icon.standard',
        'size.icon.prominent',
        'component.focus-ring.color',
        'component.focus-ring.width',
        'component.focus-ring.offset',
        'component.surface.color.panel',
        'component.surface.color.inset',
        'component.surface.color.raised',
        'component.surface.color.border',
        'component.surface.color.border-strong',
        'component.surface.space.compact',
        'component.surface.space.comfortable',
        'component.divider.color',
        'component.divider.size.standard',
        'component.divider.size.strong',
      ]),
    );
  });

  it('provides accessible contrast for the default dark-theme foundations', () => {
    const paper = referenceColor('color.reference.paper.50');
    const canvas = referenceColor('color.reference.ink.950');
    const panel = referenceColor('color.reference.ink.800');
    const supportingText = referenceColor('color.reference.ink.300');
    const strongBoundary = referenceColor('color.reference.ink.500');
    const action = referenceColor('color.reference.blue.500');

    expect(contrastRatio(paper, canvas)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(supportingText, panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(canvas, action)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(strongBoundary, panel)).toBeGreaterThanOrEqual(3);
  });
});
