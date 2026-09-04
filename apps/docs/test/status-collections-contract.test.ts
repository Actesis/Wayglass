import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');

const contract = read('docs/data/status-list.md');
const statusList = read('packages/elements/src/status-list.ts');
const statusEntry = read('packages/elements/src/status-entry.ts');
const statusListReact = read('packages/react/src/status-list.tsx');
const statusEntryReact = read('packages/react/src/status-entry.tsx');
const tokenDefinitions = read('packages/tokens/src/definitions.ts');

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

describe('status-collection field-level contracts', () => {
  it('freezes status-list fields, defaults, slots, parts, and styling hooks', () => {
    expect(sourceReactiveProperties(statusList)).toEqual(['busy', 'label']);
    expect(statusList).toContain("this.label = '';");
    expect(statusList).toContain('this.busy = false;');
    expect(sourceSlots(statusList)).toEqual([
      'actions',
      'default',
      'description',
      'heading',
      'status',
    ]);
    expect(renderedParts(statusList)).toEqual([
      'actions',
      'base',
      'description',
      'header',
      'heading',
      'list',
      'status',
    ]);
    expect(publicProperties(statusList, 'status-list')).toEqual([
      '--wg-status-list-color-background',
      '--wg-status-list-color-border',
      '--wg-status-list-color-context',
      '--wg-status-list-color-heading',
      '--wg-status-list-radius',
      '--wg-status-list-space',
      '--wg-status-list-space-entry',
    ]);
  });

  it('freezes status-entry fields, defaults, slots, parts, and styling hooks', () => {
    expect(sourceReactiveProperties(statusEntry)).toEqual([
      'activity',
      'condition',
      'knowledge',
      'label',
    ]);
    for (const value of [
      "this.label = '';",
      "this.condition = 'neutral';",
      "this.knowledge = 'confirmed';",
      "this.activity = 'idle';",
    ]) {
      expect(statusEntry).toContain(value);
    }
    expect(sourceSlots(statusEntry)).toEqual([
      'actions',
      'description',
      'heading',
      'metadata',
      'time',
      'value',
    ]);
    expect(renderedParts(statusEntry)).toEqual([
      'actions',
      'activity',
      'base',
      'condition',
      'content',
      'description',
      'heading',
      'knowledge',
      'metadata',
      'signal',
      'state',
      'time',
      'value',
    ]);
    expect(publicProperties(statusEntry, 'status-entry')).toEqual([
      '--wg-status-entry-color-background',
      '--wg-status-entry-color-border',
      '--wg-status-entry-color-condition',
      '--wg-status-entry-color-detail',
      '--wg-status-entry-color-heading',
      '--wg-status-entry-color-signal-border',
      '--wg-status-entry-color-state',
      '--wg-status-entry-radius',
      '--wg-status-entry-radius-signal',
      '--wg-status-entry-size-signal',
      '--wg-status-entry-space',
      '--wg-status-entry-space-related',
    ]);
  });

  it('keeps list and list-item semantics separate from headings, feedback, and actions', () => {
    expect(statusList).toContain('part="list"\n          role="list"');
    expect(statusList).toContain("aria-busy=${this.busy ? 'true' : nothing}");
    expect(statusEntry).toContain("this.setAttribute('role', 'listitem');");
    expect(statusList).not.toContain('role="listitem"');
    expect(statusEntry).not.toContain('role="list"');
    expect(statusList).not.toContain('aria-live');
    expect(statusEntry).not.toContain('aria-live');
  });

  it('preserves authored children and limits diagnostics to supported list anatomy', () => {
    expect(statusList).toContain("child.localName !== 'wg-status-entry'");
    expect(statusList).toContain('preserving unsupported: ${names}');
    expect(statusList).toContain('diagnostic !== this.#lastDiagnostic');
    expect(statusList).not.toContain('.remove()');
    expect(statusList).not.toContain('replaceChildren');
    expect(contract).toContain('production rendering must not remove');
  });

  it('keeps condition, knowledge, and activity independently visible', () => {
    expect(statusEntry).toContain('${conditionLabels[this.condition]}');
    expect(statusEntry).toContain('${knowledgeLabels[this.knowledge]}');
    expect(statusEntry).toContain('${activityLabels[this.activity]}');
    expect(statusEntry).toContain('part="signal" aria-hidden="true"');
    expect(statusEntry).toContain(":host([knowledge='unknown']) [part='signal']");
    expect(statusEntry).toContain(":host([knowledge='conflicting']) [part='signal']");
    expect(statusEntry).toContain(":host([activity='pending']) [part='signal']");
    expect(statusEntry).not.toContain('new CustomEvent');
  });

  it('keeps action placement and activation consumer-owned', () => {
    expect(statusEntry).toMatch(/<div part="content">[\s\S]*?<\/div>\s*<div part="actions"/);
    expect(statusEntry).toContain(
      "[part='actions'] {\n        grid-column: 2;\n        grid-row: auto;",
    );
    expect(statusEntry).not.toContain('@click');
    expect(statusList).not.toContain('@click');
    expect(contract).toContain('whole surface clickable');
  });

  it('records the contrast-safe state-text ownership of the condition hook', () => {
    expect(tokenDefinitions).toContain(
      "description: 'Status-entry condition signal before the selected condition override.'",
    );
    expect(tokenDefinitions).not.toContain(
      "description: 'Status-entry condition signal and text before the selected condition override.'",
    );
    expect(contract).toContain('State words retain the contrast-safe entry text treatment');
  });

  it('freezes explicit registration and thin React adaptation', () => {
    expect(statusList).toContain('defineElement(wgStatusListTagName, WgStatusList, registry);');
    expect(statusEntry).toContain('defineElement(wgStatusEntryTagName, WgStatusEntry, registry);');
    expect(statusListReact).toContain('registerElement(defineWgStatusList);');
    expect(statusEntryReact).toContain('registerElement(defineWgStatusEntry);');
    expect(statusListReact).not.toContain('events:');
    expect(statusEntryReact).not.toContain('events:');
  });

  it('records current evidence and continuing boundaries', () => {
    expect(contract).toContain('## Validation coverage');
    expect(contract).toContain('## Continuing boundaries');
    expect(contract).not.toContain('## Validation requirements');
    expect(contract).toContain('Representative assistive-technology procedures');
    expect(contract).toContain('Package-owned pagination and virtualization remain out of scope.');
  });
});
