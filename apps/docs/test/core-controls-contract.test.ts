import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

interface ElementContract {
  readonly properties: readonly string[];
  readonly slots: readonly string[];
  readonly parts: readonly string[];
  readonly cssProperties: readonly string[];
  readonly defaults: Readonly<Record<string, string>>;
}

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const document = readFileSync(resolve(repositoryRoot, 'docs/controls/core-controls.md'), 'utf8');

const elements = {
  'icon-button': {
    properties: ['appearance', 'disabled', 'label', 'pending', 'pendingLabel'],
    slots: ['default', 'pending'],
    parts: ['button', 'icon', 'pending'],
    cssProperties: [
      '--wg-icon-button-color-background',
      '--wg-icon-button-color-background-hover',
      '--wg-icon-button-color-border',
      '--wg-icon-button-color-text',
      '--wg-icon-button-radius',
      '--wg-icon-button-size',
    ],
    defaults: {
      appearance: "'quiet'",
      disabled: 'false',
      label: "''",
      pending: 'false',
      pendingLabel: "''",
    },
  },
  toggle: {
    properties: [
      'asserted',
      'assertedLabel',
      'availability',
      'disabled',
      'label',
      'notAssertedLabel',
      'requested',
      'requestState',
    ],
    slots: ['detail', 'feedback', 'label'],
    parts: ['button', 'confirmed-value', 'detail', 'feedback', 'label', 'request', 'signal'],
    cssProperties: [
      '--wg-toggle-color-asserted',
      '--wg-toggle-color-background',
      '--wg-toggle-color-border',
      '--wg-toggle-color-not-asserted',
      '--wg-toggle-color-text',
      '--wg-toggle-radius',
      '--wg-toggle-size-signal',
      '--wg-toggle-space',
    ],
    defaults: {
      asserted: 'false',
      assertedLabel: "''",
      availability: "'available'",
      disabled: 'false',
      label: "''",
      notAssertedLabel: "''",
      requested: "'none'",
      requestState: "'idle'",
    },
  },
  'segmented-control': {
    properties: ['orientation', 'value'],
    slots: ['default'],
    parts: ['group'],
    cssProperties: [
      '--wg-segmented-color-background',
      '--wg-segmented-color-border',
      '--wg-segmented-color-selected',
      '--wg-segmented-color-text',
      '--wg-segmented-radius',
      '--wg-segmented-size-minimum',
      '--wg-segmented-space',
    ],
    defaults: { orientation: "'horizontal'", value: "''" },
  },
  segment: {
    properties: ['disabled', 'value'],
    slots: ['default', 'detail'],
    parts: ['detail', 'label', 'segment'],
    cssProperties: [
      '--wg-segmented-color-border',
      '--wg-segmented-color-selected',
      '--wg-segmented-color-text',
      '--wg-segmented-radius',
      '--wg-segmented-size-minimum',
      '--wg-segmented-space',
    ],
    defaults: { disabled: 'false', value: "''" },
  },
  'navigation-rail': {
    properties: ['orientation'],
    slots: ['default'],
    parts: ['rail'],
    cssProperties: [
      '--wg-navigation-rail-color-background',
      '--wg-navigation-rail-color-border',
      '--wg-navigation-rail-color-current',
      '--wg-navigation-rail-color-text',
      '--wg-navigation-rail-link-size-minimum',
      '--wg-navigation-rail-radius',
      '--wg-navigation-rail-space',
    ],
    defaults: { orientation: "'vertical'" },
  },
} as const satisfies Readonly<Record<string, ElementContract>>;

function sourceReactiveProperties(source: string): string[] {
  const block = source.match(
    /static override properties = \{([\s\S]*?)\n {2}\};\n\n {2}static override styles/,
  );
  expect(block, 'missing reactive properties block').not.toBeNull();
  return [...(block?.[1] ?? '').matchAll(/^ {4}([a-z][A-Za-z0-9]*):/gm)]
    .map((match) => match[1]!)
    .sort();
}

function sourcePublicProperties(source: string): string[] {
  return [...source.matchAll(/^ {2}declare ([a-z][A-Za-z0-9]*):/gm)]
    .map((match) => match[1]!)
    .sort();
}

function sourceSlots(source: string): string[] {
  return [
    ...new Set(
      [...source.matchAll(/<slot(?:\s+name="([^"]+)")?/g)].map((match) => match[1] ?? 'default'),
    ),
  ].sort();
}

function sourceParts(source: string): string[] {
  const values = [
    ...[...source.matchAll(/part="([^"]+)"/g)].flatMap((match) => match[1]!.split(/\s+/)),
    ...[...source.matchAll(/\[part='([^']+)'\]/g)].map((match) => match[1]!),
  ];
  return [...new Set(values)].sort();
}

function sourceCssProperties(source: string, prefix: string): string[] {
  const pattern = new RegExp(`--wg-${prefix}-[a-z0-9-]+`, 'g');
  return [...new Set(source.match(pattern) ?? [])].sort();
}

describe('core-control field-level contracts', () => {
  it.each(Object.entries(elements))(
    '%s freezes implementation fields and React pairing',
    (name, expected) => {
      const source = readFileSync(
        resolve(repositoryRoot, `packages/elements/src/${name}.ts`),
        'utf8',
      );
      const react = readFileSync(resolve(repositoryRoot, `packages/react/src/${name}.tsx`), 'utf8');
      const cssPrefix = name.startsWith('segment') ? 'segmented' : name;

      expect(sourceReactiveProperties(source)).toEqual([...expected.properties].sort());
      expect(sourcePublicProperties(source)).toEqual([...expected.properties].sort());
      expect(sourceSlots(source)).toEqual([...expected.slots].sort());
      expect(sourceParts(source)).toEqual([...expected.parts].sort());
      expect(sourceCssProperties(source, cssPrefix)).toEqual([...expected.cssProperties].sort());

      for (const [property, value] of Object.entries(expected.defaults)) {
        expect(source).toContain(`this.${property} = ${value};`);
      }

      expect(react).toContain(`from '@wayglass/elements/${name}'`);
      expect(react).toContain('createComponent({');
      expect(react).toContain('export type Wg');
    },
  );

  it('documents every field, slot, part, and CSS property', () => {
    const requiredTerms = Object.values(elements).flatMap((expected) => [
      ...expected.properties.map((property) => {
        const attribute = property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `\`${attribute}:`;
      }),
      ...expected.slots.map((slot) => (slot === 'default' ? 'default' : `\`${slot}\``)),
      ...expected.parts.map((part) => `\`${part}\``),
      ...expected.cssProperties.map((property) => `\`${property}\``),
    ]);
    for (const term of requiredTerms) expect(document).toContain(term);

    expect(document).toContain('`pending-label: string`; default `Working on {label}`');
    expect(document).toContain('`request-state: idle | pending | rejected`; default `idle`');
    expect(document).toContain('`availability: available | unavailable`; default `available`');
    expect(document).toContain('`orientation: horizontal | vertical`; default `horizontal`');
    expect(document).toContain('`orientation: vertical | horizontal`; default `vertical`');
  });

  it('freezes native methods, typed request events, and explicit compound registration', () => {
    const iconButton = readFileSync(
      resolve(repositoryRoot, 'packages/elements/src/icon-button.ts'),
      'utf8',
    );
    expect(iconButton).toContain('override focus(options?: FocusOptions): void');
    expect(iconButton).toContain('override click(): void');
    expect(iconButton).toContain('`Working on ${this.label}`');

    const toggle = readFileSync(resolve(repositoryRoot, 'packages/elements/src/toggle.ts'), 'utf8');
    expect(toggle).toContain('override focus(options?: FocusOptions): void');
    expect(toggle).toContain('override click(): void');
    expect(toggle).toContain("new CustomEvent<WgToggleRequestDetail>('wg-toggle-request'");
    expect(toggle).toContain('bubbles: true');
    expect(toggle).toContain('composed: true');

    const segmented = readFileSync(
      resolve(repositoryRoot, 'packages/elements/src/segmented-control.ts'),
      'utf8',
    );
    expect(segmented).toContain('focusSelected(options?: FocusOptions): void');
    expect(segmented).toContain("new CustomEvent<WgSegmentChangeDetail>('wg-segment-change'");
    expect(segmented).toContain('defineWgSegment(registry);');

    const reactToggle = readFileSync(
      resolve(repositoryRoot, 'packages/react/src/toggle.tsx'),
      'utf8',
    );
    expect(reactToggle).toContain("onWgToggleRequest: 'wg-toggle-request'");
    const reactSegmented = readFileSync(
      resolve(repositoryRoot, 'packages/react/src/segmented-control.tsx'),
      'utf8',
    );
    expect(reactSegmented).toContain("onWgSegmentChange: 'wg-segment-change'");
  });

  it('records completed implementation without an unsupported diagnostic claim', () => {
    expect(document).toContain('## Validation coverage');
    expect(document).toContain('## Continuing boundaries');
    expect(document).toContain('Runtime presentation normalizes to confirmed truth');
    expect(document).not.toContain('receive development diagnostics');
    expect(document).toContain('they do not wrap');
    expect(document).not.toContain('implementation milestone will establish');
    expect(document).not.toContain('Implementation must cover');
    expect(document).not.toContain('## Deferred decisions');
  });
});
