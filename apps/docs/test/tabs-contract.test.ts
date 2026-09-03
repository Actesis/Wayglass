import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const contract = readFileSync(resolve(repositoryRoot, 'docs/components/tabs.md'), 'utf8');

const elements = {
  tabs: {
    properties: ['activation', 'orientation', 'value'],
    slots: ['default'],
    parts: [],
    cssProperties: [],
  },
  'tab-list': {
    properties: [],
    slots: ['default'],
    parts: ['list'],
    cssProperties: ['--wg-tab-list-gap'],
  },
  tab: {
    properties: ['disabled', 'value'],
    slots: ['default', 'summary'],
    parts: ['label', 'selection', 'summary', 'tab'],
    cssProperties: [
      '--wg-tab-color-background',
      '--wg-tab-color-background-selected',
      '--wg-tab-color-border',
      '--wg-tab-color-selection',
      '--wg-tab-color-text',
      '--wg-tab-color-text-selected',
      '--wg-tab-radius',
      '--wg-tab-size-minimum',
      '--wg-tab-size-selection',
      '--wg-tab-space-block',
      '--wg-tab-space-inline',
    ],
  },
  'tab-panel': {
    properties: ['value'],
    slots: ['default'],
    parts: ['panel'],
    cssProperties: [
      '--wg-tab-panel-color-background',
      '--wg-tab-panel-color-border',
      '--wg-tab-panel-radius',
      '--wg-tab-panel-space',
    ],
  },
} as const;

function source(name: keyof typeof elements): string {
  return readFileSync(resolve(repositoryRoot, `packages/elements/src/${name}.ts`), 'utf8');
}

function componentSection(name: keyof typeof elements): string {
  const escapedName = name.replace('-', '\\-');
  const match = contract.match(
    new RegExp(
      '### `wg-' + escapedName + '`\\n([\\s\\S]*?)(?=\\n### `wg-|\\n### CSS Custom Properties)',
    ),
  );
  expect(match, `missing wg-${name} contract`).not.toBeNull();
  return match?.[1] ?? '';
}

function subsection(document: string, heading: string): string {
  const match = document.match(new RegExp(`#### ${heading}\\n([\\s\\S]*?)(?=\\n#### |$)`));
  expect(match, `missing ${heading} subsection`).not.toBeNull();
  return match?.[1] ?? '';
}

function codeBullets(document: string): string[] {
  return [...document.matchAll(/^- (?:`([^`]+)`|(default))(?:[:;.].*)?$/gm)]
    .map((match) => match[1] ?? match[2]!)
    .sort();
}

function sourceReactiveProperties(document: string): string[] {
  const block = document.match(
    /static override properties = \{([\s\S]*?)\n {2}\};\n\n {2}static override styles/,
  );
  if (!block) return [];
  return [...block[1]!.matchAll(/^ {4}([a-z][A-Za-z0-9]*): \{$/gm)]
    .map((match) => match[1]!)
    .sort();
}

function sourcePublicProperties(document: string): string[] {
  return [...document.matchAll(/^ {2}(?:declare|get) ([a-z][A-Za-z0-9]*)(?::|\()/gm)]
    .map((match) => match[1]!)
    .sort();
}

function sourceSlots(document: string): string[] {
  return [
    ...new Set(
      [...document.matchAll(/<slot(?:\s+name="([^"]+)")?/g)].map((match) => match[1] ?? 'default'),
    ),
  ].sort();
}

function sourceParts(document: string): string[] {
  const values = [
    ...[...document.matchAll(/part="([^"]+)"/g)].flatMap((match) => match[1]!.split(/\s+/)),
    ...[...document.matchAll(/\[part='([^']+)'\]/g)].map((match) => match[1]!),
  ];
  return [...new Set(values)].sort();
}

function sourceCssProperties(document: string, name: keyof typeof elements): string[] {
  const pattern = new RegExp(`--wg-${name}-[a-z0-9-]+`, 'g');
  return [...new Set(document.match(pattern) ?? [])].sort();
}

describe('tabs field-level contract', () => {
  it.each(Object.entries(elements))(
    '%s aligns source fields with the accepted contract',
    (name, expected) => {
      const moduleName = name as keyof typeof elements;
      const elementSource = source(moduleName);
      expect(sourceReactiveProperties(elementSource)).toEqual([...expected.properties].sort());
      expect(sourcePublicProperties(elementSource)).toEqual([...expected.properties].sort());
      expect(sourceSlots(elementSource)).toEqual([...expected.slots].sort());
      expect(sourceParts(elementSource)).toEqual([...expected.parts].sort());
      expect(sourceCssProperties(elementSource, moduleName)).toEqual(
        [...expected.cssProperties].sort(),
      );
    },
  );

  it('documents coordinator fields, event, method, and defaults exactly', () => {
    const tabsContract = componentSection('tabs');
    expect(
      codeBullets(subsection(tabsContract, 'Attributes and properties')).map(
        (value) => value.split(':')[0]!,
      ),
    ).toEqual(['activation', 'orientation', 'value']);
    expect(codeBullets(subsection(tabsContract, 'Slots'))).toEqual(['default']);
    expect(codeBullets(subsection(tabsContract, 'Methods'))).toEqual([
      'focusSelected(options?: FocusOptions): void',
    ]);
    expect(tabsContract).toContain('default `automatic`');
    expect(tabsContract).toContain('default `horizontal`');
    expect(tabsContract).toContain('`wg-tab-change`: bubbles and is composed');
    expect(tabsContract).toContain("readonly trigger: 'keyboard' | 'pointer'");

    const tabsSource = source('tabs');
    expect(tabsSource).toContain("#activation: TabActivation = 'automatic'");
    expect(tabsSource).toContain("#orientation: TabOrientation = 'horizontal'");
    expect(tabsSource).toContain('focusSelected(options?: FocusOptions): void');
    expect(tabsSource).toContain("new CustomEvent<WgTabChangeDetail>('wg-tab-change'");
    expect(tabsSource).toContain('bubbles: true');
    expect(tabsSource).toContain('composed: true');
  });

  it('documents tab-list, tab, and panel anatomy and managed semantics', () => {
    const listContract = componentSection('tab-list');
    expect(codeBullets(subsection(listContract, 'Slots'))).toEqual(['default']);
    expect(codeBullets(subsection(listContract, 'CSS Parts'))).toEqual(['list']);
    expect(subsection(listContract, 'Attributes')).toContain('`aria-label` or `aria-labelledby`');

    const tabContract = componentSection('tab');
    expect(
      codeBullets(subsection(tabContract, 'Attributes and properties')).map(
        (value) => value.split(':')[0]!,
      ),
    ).toEqual(['disabled', 'value']);
    expect(codeBullets(subsection(tabContract, 'Slots'))).toEqual(['default', 'summary']);
    expect(codeBullets(subsection(tabContract, 'CSS Parts'))).toEqual([
      'label',
      'selection',
      'summary',
      'tab',
    ]);
    expect(tabContract).toContain('`disabled: boolean`: default `false`');
    expect(tabContract).toContain(
      '`role`, `aria-selected`, `aria-disabled`, `aria-controls`, and `tabindex`',
    );

    const panelContract = componentSection('tab-panel');
    expect(
      codeBullets(subsection(panelContract, 'Attributes and properties')).map(
        (value) => value.split(':')[0]!,
      ),
    ).toEqual(['value']);
    expect(codeBullets(subsection(panelContract, 'Slots'))).toEqual(['default']);
    expect(codeBullets(subsection(panelContract, 'CSS Parts'))).toEqual(['panel']);
    expect(panelContract).toContain('`role`, `aria-labelledby`, `tabindex`, and `hidden`');
  });

  it('freezes all public CSS properties and the scrolling decision', () => {
    const documentedCssProperties = codeBullets(
      contract.match(/### CSS Custom Properties\n([\s\S]*?)(?=\n## )/)?.[1] ?? '',
    );
    const expected = Object.values(elements)
      .flatMap(({ cssProperties }) => cssProperties)
      .sort();
    expect(documentedCssProperties).toEqual(expected);
    expect(contract).toContain('scroll within the named tab list when needed');
    expect(contract).toContain('They do\n  not wrap');
    expect(contract).not.toContain('Proposed CSS Custom Properties');
  });

  it('keeps registration explicit and React selection events typed', () => {
    const tabsSource = source('tabs');
    for (const definition of ['defineWgTab', 'defineWgTabList', 'defineWgTabPanel']) {
      expect(tabsSource).toContain(`${definition}(registry);`);
    }

    for (const name of Object.keys(elements) as Array<keyof typeof elements>) {
      const react = readFileSync(resolve(repositoryRoot, `packages/react/src/${name}.tsx`), 'utf8');
      expect(react).toContain(`from '@wayglass/elements/${name}'`);
      expect(react).toContain('createComponent({');
      expect(react).toContain('export type Wg');
    }

    const reactTabs = readFileSync(resolve(repositoryRoot, 'packages/react/src/tabs.tsx'), 'utf8');
    expect(reactTabs).toContain("onWgTabChange: 'wg-tab-change'");
    expect(reactTabs).toContain('export type WgTabChangeEvent');
  });
});
