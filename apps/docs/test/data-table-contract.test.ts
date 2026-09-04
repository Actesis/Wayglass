import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');

const contract = read('docs/data/data-table.md');
const dataTable = read('packages/elements/src/data-table.ts');
const dataTableStyles = read('packages/elements/src/data-table.css');
const dataTableReact = read('packages/react/src/data-table.tsx');

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

function publicProperties(source: string): string[] {
  return [...new Set(source.match(/--wg-data-table-[a-z0-9-]+/g) ?? [])].sort();
}

const stylingHooks = [
  '--wg-data-table-color-background',
  '--wg-data-table-color-border',
  '--wg-data-table-color-caption',
  '--wg-data-table-color-context',
  '--wg-data-table-color-header',
  '--wg-data-table-color-row-separator',
  '--wg-data-table-color-table-background',
  '--wg-data-table-color-text',
  '--wg-data-table-radius',
  '--wg-data-table-space',
  '--wg-data-table-space-cell-block',
  '--wg-data-table-space-cell-inline',
  '--wg-data-table-space-group',
] as const;

describe('data-table field-level contract', () => {
  it('freezes the empty field surface, slots, parts, and styling hooks', () => {
    expect(sourceReactiveProperties(dataTable)).toEqual([]);
    expect(dataTable).not.toContain('static override properties');
    expect(sourceSlots(dataTable)).toEqual(['context', 'default', 'feedback']);
    expect(renderedParts(dataTable)).toEqual(['base', 'context', 'feedback']);
    expect(publicProperties(dataTable)).toEqual(stylingHooks);
    expect(publicProperties(dataTableStyles)).toEqual([
      '--wg-data-table-color-caption',
      '--wg-data-table-color-context',
      '--wg-data-table-color-header',
      '--wg-data-table-color-row-separator',
      '--wg-data-table-color-table-background',
      '--wg-data-table-color-text',
      '--wg-data-table-space-cell-block',
      '--wg-data-table-space-cell-inline',
    ]);
  });

  it('requires the explicit scroll-region and native-table anatomy without repairing it', () => {
    expect(dataTable).toContain('default content must be exactly one direct wg-scroll-region');
    expect(dataTable).toContain("scrollRegion.getAttribute('axis') !== 'inline'");
    expect(dataTable).toContain('the direct wg-scroll-region must use axis="inline"');
    expect(dataTable).toContain(
      'the direct wg-scroll-region must contain exactly one direct table',
    );
    expect(dataTable).not.toContain('.remove()');
    expect(dataTable).not.toContain('replaceChildren');
    expect(dataTable).not.toContain('document.createElement');
  });

  it('preserves unsupported anatomy and emits only a deduplicated diagnostic', () => {
    expect(dataTable).toContain('diagnostic !== this.#lastDiagnostic');
    expect(dataTable).toContain('unsupported named slots are preserved');
    expect(dataTable).toContain('queueMicrotask');
    expect(dataTable).toContain('if (!this.isConnected) return;');
  });

  it('keeps the native table and scroll region as separate semantic owners', () => {
    for (const behavior of [
      'role="table"',
      'role="grid"',
      'aria-live',
      'tabindex',
      'ResizeObserver',
      'MutationObserver',
      'data-overflowing',
      'new CustomEvent',
      '@click',
      '@keydown',
    ]) {
      expect(dataTable).not.toContain(behavior);
    }
    expect(dataTable).not.toContain('defineWgScrollRegion');
  });

  it('keeps context, the authored table boundary, and feedback in source order', () => {
    expect(dataTable).toMatch(/part="context"[\s\S]*?<slot @slotchange[\s\S]*?part="feedback"/);
    expect(dataTable).not.toContain('column-reverse');
    expect(dataTable).not.toContain('row-reverse');
    expect(dataTable).not.toContain('.append(');
    expect(dataTable).not.toContain('.prepend(');
  });

  it('keeps the companion stylesheet scoped and semantically neutral', () => {
    expect(dataTableStyles).toContain("wg-data-table > wg-scroll-region[axis='inline'] > table");
    expect(dataTableStyles).toContain('> :is(thead, tbody, tfoot)');
    expect(dataTableStyles).toContain('> :is(th, td)');
    expect(dataTableStyles).not.toMatch(/display\s*:/);
    expect(dataTableStyles).not.toContain('position: sticky');
    expect(dataTableStyles).not.toContain('position: absolute');
  });

  it('keeps sorting, interaction, state, and mutation application-owned', () => {
    for (const behavior of [
      'aria-sort',
      '.sort(',
      'rows',
      'columns',
      'selection',
      'pagination',
      'virtualization',
      'sticky-header',
    ]) {
      expect(dataTable).not.toContain(behavior);
    }
    expect(contract).toContain('Sorting remains application-owned.');
    expect(contract).toContain('State is authored rather than inferred');
  });

  it('freezes explicit registration and thin React adaptation', () => {
    expect(dataTable).toContain('defineElement(wgDataTableTagName, WgDataTable, registry);');
    expect(dataTableReact).toContain('registerElement(defineWgDataTable);');
    expect(dataTableReact).not.toContain('defineWgScrollRegion');
    expect(dataTableReact).not.toContain('events:');
  });

  it('records current validation and continuing ownership boundaries', () => {
    expect(contract).toContain('## Validation coverage');
    expect(contract).toContain('## Continuing boundaries');
    expect(contract).not.toContain('## Deferred and excluded behavior');
    expect(contract).toContain('Phase 3G fixtures verify one');
    expect(contract).toContain('representative VoiceOver/Safari and NVDA/Firefox review');
  });
});
