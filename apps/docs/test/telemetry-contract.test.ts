import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');

const contract = read('docs/data/telemetry-strip.md');
const telemetry = read('packages/elements/src/telemetry-strip.ts');
const telemetryReact = read('packages/react/src/telemetry-strip.tsx');

function sourceReactiveProperties(source: string): string[] {
  const block = source.match(/static override properties = \{([\s\S]*?)\n {2}\};/);
  if (!block) return [];
  return [...block[1]!.matchAll(/^ {4}([a-z][A-Za-z0-9]*):/gm)].map((match) => match[1]!).sort();
}

function sourceSlots(source: string): string[] {
  return [
    ...new Set([...source.matchAll(/<slot\s+name="([^"]+)"/g)].map((match) => match[1]!)),
  ].sort();
}

function renderedParts(source: string): string[] {
  return [
    ...new Set([...source.matchAll(/part="([^"]+)"/g)].flatMap((match) => match[1]!.split(/\s+/))),
  ].sort();
}

describe('telemetry-strip field-level contract', () => {
  it('freezes fields, property-only inputs, and defaults', () => {
    expect(sourceReactiveProperties(telemetry)).toEqual([
      'activity',
      'condition',
      'knowledge',
      'label',
      'samples',
      'scaleMaximum',
      'scaleMinimum',
      'windowEnd',
      'windowStart',
    ]);
    for (const property of [
      'samples',
      'windowStart',
      'windowEnd',
      'scaleMinimum',
      'scaleMaximum',
    ]) {
      expect(telemetry).toContain(`${property}: { attribute: false }`);
    }
    for (const value of [
      "this.label = '';",
      'this.samples = [];',
      'this.windowStart = 0;',
      'this.windowEnd = 1;',
      'this.scaleMinimum = 0;',
      'this.scaleMaximum = 1;',
      "this.condition = 'neutral';",
      "this.knowledge = 'confirmed';",
      "this.activity = 'idle';",
    ]) {
      expect(telemetry).toContain(value);
    }
  });

  it('freezes structured samples and bounded validation', () => {
    expect(telemetry).toContain('readonly observedAt: number;');
    expect(telemetry).toContain('readonly value: number | null;');
    expect(telemetry).toContain('readonly knowledge?: Knowledge;');
    expect(telemetry).toContain('this.samples.length > 240');
    expect(telemetry).toContain('this.windowEnd <= this.windowStart');
    expect(telemetry).toContain('this.scaleMaximum <= this.scaleMinimum');
    expect(telemetry).toContain('sample.observedAt < previousTime');
    expect(telemetry).toContain('sample.value < this.scaleMinimum');
    expect(telemetry).toContain('sample.value > this.scaleMaximum');
    expect(telemetry).toContain('knowledgeStates.includes(sample.knowledge)');
  });

  it('retains connected runs, isolated observations, and explicit gaps', () => {
    expect(telemetry).toContain('<path');
    expect(telemetry).toContain('data-segments=${String(commands.length)}');
    expect(telemetry).toContain('data-isolated');
    expect(telemetry).toContain('data-gap');
    expect(telemetry).toContain('data-boundary');
    expect(contract).toMatch(/A one-observation run is retained as a\s+bounded point\./);
    expect(contract).toContain('Every supplied sample is retained up to the 240-sample');
  });

  it('freezes slots, complete public anatomy, and styling hooks', () => {
    expect(sourceSlots(telemetry)).toEqual([
      'current',
      'detail',
      'heading',
      'summary',
      'window-end',
      'window-start',
    ]);
    expect(renderedParts(telemetry)).toEqual([
      'base',
      'current',
      'detail',
      'graphic',
      'header',
      'heading',
      'state',
      'summary',
      'window',
      'window-end',
      'window-start',
    ]);
    const properties = [
      ...new Set(telemetry.match(/--wg-telemetry-strip-[a-z0-9-]+/g) ?? []),
    ].sort();
    expect(properties).toEqual([
      '--wg-telemetry-strip-color-background',
      '--wg-telemetry-strip-color-border',
      '--wg-telemetry-strip-color-context',
      '--wg-telemetry-strip-color-current',
      '--wg-telemetry-strip-color-graphic-background',
      '--wg-telemetry-strip-color-heading',
      '--wg-telemetry-strip-color-series',
      '--wg-telemetry-strip-color-state',
      '--wg-telemetry-strip-radius',
      '--wg-telemetry-strip-size-graphic-block',
      '--wg-telemetry-strip-space',
      '--wg-telemetry-strip-space-related',
      '--wg-telemetry-strip-width-series',
    ]);
    for (const property of properties) expect(contract).toContain(`\`${property}\``);
  });

  it('keeps calculated geometry non-semantic and authored content authoritative', () => {
    expect(telemetry).toContain('aria-hidden="true"');
    expect(telemetry).toContain('focusable="false"');
    expect(telemetry).not.toContain('aria-live');
    expect(telemetry).not.toContain('role="status"');
    expect(telemetry).not.toContain('role="alert"');
    expect(telemetry).not.toContain('new CustomEvent');
    expect(telemetry).not.toContain('ResizeObserver');
    expect(telemetry).not.toContain('fetch(');
    expect(contract).toContain('required visible light-DOM readable equivalent');
  });

  it('freezes neutral invalid-input diagnostics', () => {
    expect(telemetry).toContain('const paths = diagnostic ? [] : this.#renderGeometry();');
    expect(telemetry).toContain('console.warn(`[wg-telemetry-strip] ${diagnostic}`);');
    expect(telemetry).toContain('diagnostic !== this.#lastDiagnostic');
    expect(contract).toContain('Invalid structured input produces no telemetry path');
  });

  it('freezes explicit registration and thin React adaptation', () => {
    expect(telemetry).toContain(
      'defineElement(wgTelemetryStripTagName, WgTelemetryStrip, registry);',
    );
    expect(telemetryReact).toContain('registerElement(defineWgTelemetryStrip);');
    expect(telemetryReact).not.toContain('events:');
    expect(telemetryReact).not.toContain('samples:');
  });

  it('records implemented architecture, current evidence, and continuing boundaries', () => {
    expect(contract).not.toContain('proposed component-local type');
    expect(contract).not.toContain('proposed rendering basis');
    expect(contract).not.toContain('Production rendering will mark');
    expect(contract).toContain('## Validation coverage');
    expect(contract).toContain('## Continuing boundaries');
    expect(contract).not.toContain('## Deferred capabilities');
    expect(contract).toMatch(/Representative\s+manual assistive-technology review remains/);
  });
});
