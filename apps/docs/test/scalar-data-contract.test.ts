import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');

const contract = read('docs/data/metrics-and-key-values.md');
const keyValue = read('packages/elements/src/key-value.ts');
const metricGroup = read('packages/elements/src/metric-group.ts');
const trendIndicator = read('packages/elements/src/trend-indicator.ts');
const metric = read('packages/elements/src/metric.ts');
const keyValueReact = read('packages/react/src/key-value.tsx');
const metricGroupReact = read('packages/react/src/metric-group.tsx');
const trendIndicatorReact = read('packages/react/src/trend-indicator.tsx');

function sourceReactiveProperties(source: string): string[] {
  const block = source.match(/static override properties = \{([\s\S]*?)\n {2}\};/);
  if (!block) return [];
  return [...block[1]!.matchAll(/^ {4}([a-z][A-Za-z0-9]*):/gm)].map((match) => match[1]!).sort();
}

function sourceSlots(source: string): string[] {
  return [
    ...new Set(
      [...source.matchAll(/<slot(?:\s+name="([^"]+)")?/g)].map((match) => match[1] ?? 'default'),
    ),
  ].sort();
}

function renderedParts(source: string): string[] {
  return [
    ...new Set([...source.matchAll(/part="([^"]+)"/g)].flatMap((match) => match[1]!.split(/\s+/))),
  ].sort();
}

function publicProperties(source: string, prefix: string): string[] {
  return [...new Set(source.match(new RegExp(`--wg-${prefix}-[a-z0-9-]+`, 'g')) ?? [])].sort();
}

describe('scalar-data field-level contracts', () => {
  it('freezes metric-group fields, defaults, slots, parts, and styling hooks', () => {
    expect(sourceReactiveProperties(metricGroup)).toEqual(['busy', 'label']);
    expect(sourceSlots(metricGroup)).toEqual(['actions', 'default', 'description', 'heading']);
    expect(renderedParts(metricGroup)).toEqual([
      'actions',
      'base',
      'content',
      'description',
      'header',
      'heading',
    ]);
    expect(metricGroup).toContain("this.label = '';");
    expect(metricGroup).toContain('this.busy = false;');
    expect(publicProperties(metricGroup, 'metric-group')).toEqual([
      '--wg-metric-group-color-background',
      '--wg-metric-group-color-border',
      '--wg-metric-group-color-description',
      '--wg-metric-group-color-heading',
      '--wg-metric-group-radius',
      '--wg-metric-group-size-item-minimum',
      '--wg-metric-group-space',
      '--wg-metric-group-space-item',
    ]);
  });

  it('keeps group actions after scalar content in semantic and narrow visual order', () => {
    expect(metricGroup).toMatch(
      /<div part="content"><slot><\/slot><\/div>[\s\S]*?<div part="actions"/,
    );
    expect(metricGroup).toContain(
      "[part='actions'] {\n        grid-column: 1;\n        grid-row: 3;",
    );
    expect(contract).toContain(
      'authored actions after scalar content in DOM and narrow visual order',
    );
  });

  it('freezes trend fields, directions, defaults, slots, parts, and styling hooks', () => {
    expect(sourceReactiveProperties(trendIndicator)).toEqual([
      'activity',
      'condition',
      'direction',
      'knowledge',
      'label',
      'loading',
    ]);
    expect(trendIndicator).toContain("['rising', 'falling', 'steady', 'mixed', 'none']");
    for (const value of [
      "this.label = '';",
      "this.direction = 'none';",
      "this.condition = 'neutral';",
      "this.knowledge = 'confirmed';",
      "this.activity = 'idle';",
      'this.loading = false;',
    ]) {
      expect(trendIndicator).toContain(value);
    }
    expect(sourceSlots(trendIndicator)).toEqual(['detail', 'label']);
    expect(renderedParts(trendIndicator)).toEqual([
      'activity',
      'base',
      'detail',
      'direction',
      'knowledge',
      'label',
      'signal',
      'state',
    ]);
    expect(publicProperties(trendIndicator, 'trend-indicator')).toEqual([
      '--wg-trend-indicator-color-signal',
      '--wg-trend-indicator-color-state',
      '--wg-trend-indicator-color-text',
      '--wg-trend-indicator-size-signal',
      '--wg-trend-indicator-space',
      '--wg-trend-indicator-width-signal',
    ]);
  });

  it('freezes key-value fields, defaults, slots, parts, and styling hooks', () => {
    expect(sourceReactiveProperties(keyValue)).toEqual([
      'activity',
      'condition',
      'knowledge',
      'label',
      'loading',
      'value',
    ]);
    for (const value of [
      "this.label = '';",
      "this.value = '';",
      "this.condition = 'neutral';",
      "this.knowledge = 'confirmed';",
      "this.activity = 'idle';",
      'this.loading = false;',
    ]) {
      expect(keyValue).toContain(value);
    }
    expect(sourceSlots(keyValue)).toEqual(['description', 'label', 'metadata', 'value']);
    expect(renderedParts(keyValue)).toEqual([
      'activity',
      'base',
      'description',
      'knowledge',
      'label',
      'metadata',
      'state',
      'value',
    ]);
    expect(publicProperties(keyValue, 'key-value')).toEqual([
      '--wg-key-value-color-label',
      '--wg-key-value-color-state',
      '--wg-key-value-color-value',
      '--wg-key-value-size-label-minimum',
      '--wg-key-value-space',
    ]);
  });

  it('keeps scalar state axes independent and components display-only', () => {
    for (const source of [keyValue, trendIndicator]) {
      expect(source).toContain("this.condition = 'neutral';");
      expect(source).toContain("this.knowledge = 'confirmed';");
      expect(source).toContain("this.activity = 'idle';");
      expect(source).not.toContain('new CustomEvent');
      expect(source).not.toContain('aria-live');
    }
    expect(metricGroup).not.toContain('new CustomEvent');
    expect(metricGroup).not.toContain('aria-live');
  });

  it('freezes the compatible metric trend extension without adding trend policy', () => {
    expect(sourceSlots(metric)).toContain('trend');
    expect(renderedParts(metric)).toContain('trend');
    expect(sourceReactiveProperties(metric)).not.toContain('trend');
    expect(metric).not.toMatch(/(?:previousValue|delta|interval|threshold|direction):/);
    expect(contract).toContain('one named slot:');
    expect(contract).toContain('`trend`: optional single `wg-trend-indicator`');
  });

  it('freezes explicit registration and thin React adaptation', () => {
    expect(keyValue).toContain('defineElement(wgKeyValueTagName, WgKeyValue, registry);');
    expect(metricGroup).toContain('defineElement(wgMetricGroupTagName, WgMetricGroup, registry);');
    expect(trendIndicator).toContain(
      'defineElement(wgTrendIndicatorTagName, WgTrendIndicator, registry);',
    );
    for (const [wrapper, registration] of [
      [keyValueReact, 'registerElement(defineWgKeyValue);'],
      [metricGroupReact, 'registerElement(defineWgMetricGroup);'],
      [trendIndicatorReact, 'registerElement(defineWgTrendIndicator);'],
    ]) {
      expect(wrapper).toContain(registration);
      expect(wrapper).not.toContain('events:');
    }
  });

  it('records current evidence and continuing release boundaries', () => {
    expect(contract.match(/### Validation coverage/g)).toHaveLength(3);
    expect(contract.match(/### Continuing boundaries/g)).toHaveLength(3);
    expect(contract).not.toContain('### Testing requirements');
    expect(contract).not.toContain('### Open questions');
    expect(contract).toContain('Representative assistive-technology review remains');
  });
});
