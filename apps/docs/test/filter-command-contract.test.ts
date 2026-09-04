import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');

const contract = read('docs/data/filter-and-command-patterns.md');
const filterBar = read('packages/elements/src/filter-bar.ts');
const commandBar = read('packages/elements/src/command-bar.ts');
const filterBarReact = read('packages/react/src/filter-bar.tsx');
const commandBarReact = read('packages/react/src/command-bar.tsx');

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

describe('filter-and-command field-level contracts', () => {
  it('freezes filter-bar fields, defaults, slots, parts, and styling hooks', () => {
    expect(sourceReactiveProperties(filterBar)).toEqual(['label']);
    expect(filterBar).toContain("this.label = '';");
    expect(sourceSlots(filterBar)).toEqual([
      'default',
      'description',
      'heading',
      'status',
      'summary',
    ]);
    expect(renderedParts(filterBar)).toEqual([
      'base',
      'content',
      'description',
      'header',
      'heading',
      'status',
      'summary',
    ]);
    expect(publicProperties(filterBar, 'filter-bar')).toEqual([
      '--wg-filter-bar-color-background',
      '--wg-filter-bar-color-border',
      '--wg-filter-bar-color-context',
      '--wg-filter-bar-color-heading',
      '--wg-filter-bar-radius',
      '--wg-filter-bar-space',
      '--wg-filter-bar-space-group',
    ]);
  });

  it('freezes command-bar fields, defaults, slots, parts, and styling hooks', () => {
    expect(sourceReactiveProperties(commandBar)).toEqual(['label']);
    expect(commandBar).toContain("this.label = '';");
    expect(sourceSlots(commandBar)).toEqual([
      'default',
      'description',
      'heading',
      'overflow',
      'secondary',
      'status',
    ]);
    expect(renderedParts(commandBar)).toEqual([
      'base',
      'description',
      'header',
      'heading',
      'overflow',
      'primary',
      'secondary',
      'status',
    ]);
    expect(publicProperties(commandBar, 'command-bar')).toEqual([
      '--wg-command-bar-color-background',
      '--wg-command-bar-color-border',
      '--wg-command-bar-color-context',
      '--wg-command-bar-color-heading',
      '--wg-command-bar-radius',
      '--wg-command-bar-space',
      '--wg-command-bar-space-group',
    ]);
  });

  it('keeps both bars named, quiet, non-focusable region boundaries', () => {
    for (const source of [filterBar, commandBar]) {
      expect(source).toContain('<section part="base" aria-label=');
      expect(source).not.toContain('aria-live');
      expect(source).not.toContain('tabindex');
    }
    expect(commandBar).not.toContain('role="toolbar"');
    expect(filterBar).not.toContain('role="search"');
  });

  it('keeps native form ownership entirely in the authored light DOM', () => {
    expect(filterBar).toContain("defaultChildren[0]?.localName !== 'form'");
    expect(filterBar).toContain('default content must be exactly one direct form');
    for (const behavior of [
      'formAssociated',
      'attachInternals',
      'requestSubmit',
      'preventDefault',
      'FormData',
      '@submit',
      '@reset',
      '@input',
      '@change',
      'new CustomEvent',
    ]) {
      expect(filterBar).not.toContain(behavior);
    }
  });

  it('keeps commands authored, immediate, and free of aggregate coordination', () => {
    expect(commandBar).toContain("child.getAttribute('slot') === 'overflow'");
    expect(commandBar).toContain("child.localName !== 'wg-menu'");
    expect(commandBar).toContain('overflow must contain at most one direct wg-menu');
    for (const behavior of [
      '@click',
      '@keydown',
      'addEventListener',
      'new CustomEvent',
      'role="toolbar"',
      'aria-orientation',
      'aria-activedescendant',
      '.focus()',
    ]) {
      expect(commandBar).not.toContain(behavior);
    }
  });

  it('preserves unsupported anatomy and emits only deduplicated diagnostics', () => {
    for (const source of [filterBar, commandBar]) {
      expect(source).toContain('diagnostic !== this.#lastDiagnostic');
      expect(source).toContain('unsupported named slots are preserved');
      expect(source).not.toContain('.remove()');
      expect(source).not.toContain('replaceChildren');
    }
  });

  it('keeps the documented flattened order without responsive DOM migration', () => {
    expect(filterBar).toMatch(/part="content"[\s\S]*?part="summary"[\s\S]*?part="status"/);
    expect(commandBar).toMatch(
      /part="primary"[\s\S]*?part="secondary"[\s\S]*?part="overflow"[\s\S]*?part="status"/,
    );
    for (const source of [filterBar, commandBar]) {
      expect(source).not.toContain('column-reverse');
      expect(source).not.toContain('row-reverse');
      expect(source).not.toContain('.append(');
      expect(source).not.toContain('.prepend(');
    }
  });

  it('freezes explicit registration and thin React adaptation', () => {
    expect(filterBar).toContain('defineElement(wgFilterBarTagName, WgFilterBar, registry);');
    expect(commandBar).toContain('defineElement(wgCommandBarTagName, WgCommandBar, registry);');
    expect(filterBarReact).toContain('registerElement(defineWgFilterBar);');
    expect(commandBarReact).toContain('registerElement(defineWgCommandBar);');
    expect(filterBarReact).not.toContain('events:');
    expect(commandBarReact).not.toContain('events:');
  });

  it('records current validation and continuing ownership boundaries', () => {
    expect(contract).toContain('## Validation coverage');
    expect(contract).toContain('## Continuing boundaries');
    expect(contract).not.toContain('## Deferred and excluded behavior');
    expect(contract).toContain('Implementations, stories, and automated validation are complete');
    expect(contract).toContain('Representative VoiceOver/Safari and NVDA/Firefox review');
  });
});
