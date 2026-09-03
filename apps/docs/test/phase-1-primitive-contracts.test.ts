import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

interface PrimitiveContract {
  readonly attributes: Readonly<Record<string, string>>;
  readonly properties: readonly string[];
  readonly slots: readonly string[];
  readonly parts: readonly string[];
  readonly cssProperties: readonly string[];
  readonly defaults: Readonly<Record<string, string>>;
}

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');

const contracts = {
  button: {
    attributes: { appearance: 'appearance', disabled: 'disabled', pending: 'pending' },
    properties: ['appearance', 'disabled', 'pending'],
    slots: ['default', 'leading', 'pending-label', 'trailing'],
    parts: ['button', 'core', 'label', 'leading', 'pending', 'trailing'],
    cssProperties: [
      '--wg-button-color-background',
      '--wg-button-color-background-hover',
      '--wg-button-color-border',
      '--wg-button-color-text',
      '--wg-button-radius',
      '--wg-button-size-minimum',
      '--wg-button-space-block',
      '--wg-button-space-inline',
    ],
    defaults: { appearance: "'secondary'", disabled: 'false', pending: 'false' },
  },
  'boolean-value': {
    attributes: {
      label: 'label',
      asserted: 'asserted',
      'asserted-label': 'assertedLabel',
      'not-asserted-label': 'notAssertedLabel',
      knowledge: 'knowledge',
      presentation: 'presentation',
      loading: 'loading',
    },
    properties: [
      'asserted',
      'assertedLabel',
      'knowledge',
      'label',
      'loading',
      'notAssertedLabel',
      'presentation',
    ],
    slots: ['detail', 'label'],
    parts: ['base', 'detail', 'knowledge', 'label', 'signal', 'value'],
    cssProperties: [
      '--wg-boolean-value-color-asserted',
      '--wg-boolean-value-color-not-asserted',
      '--wg-boolean-value-color-text',
      '--wg-boolean-value-radius',
      '--wg-boolean-value-size-field',
      '--wg-boolean-value-size-rail',
      '--wg-boolean-value-space',
    ],
    defaults: {
      asserted: 'false',
      assertedLabel: "''",
      knowledge: "'confirmed'",
      label: "''",
      loading: 'false',
      notAssertedLabel: "''",
      presentation: "'rail'",
    },
  },
  canvas: {
    attributes: { width: 'width' },
    properties: ['width'],
    slots: ['default', 'footer', 'header'],
    parts: ['base', 'content'],
    cssProperties: [
      '--wg-canvas-color-background',
      '--wg-canvas-size-content',
      '--wg-canvas-space-block',
      '--wg-canvas-space-inline',
    ],
    defaults: { width: "'contained'" },
  },
  elbow: {
    attributes: { placement: 'placement', weight: 'weight' },
    properties: ['placement', 'weight'],
    slots: ['default'],
    parts: ['base', 'join', 'label'],
    cssProperties: [
      '--wg-elbow-color-background',
      '--wg-elbow-color-text',
      '--wg-elbow-radius',
      '--wg-elbow-size-band',
      '--wg-elbow-space-inline',
    ],
    defaults: { placement: "'start'", weight: "'standard'" },
  },
  metric: {
    attributes: {
      label: 'label',
      value: 'value',
      unit: 'unit',
      condition: 'condition',
      knowledge: 'knowledge',
      activity: 'activity',
      size: 'size',
      loading: 'loading',
    },
    properties: ['activity', 'condition', 'knowledge', 'label', 'loading', 'size', 'unit', 'value'],
    slots: ['description', 'label', 'metadata', 'trend'],
    parts: [
      'activity',
      'base',
      'description',
      'knowledge',
      'label',
      'metadata',
      'trend',
      'unit',
      'value',
    ],
    cssProperties: [
      '--wg-metric-color-label',
      '--wg-metric-color-value',
      '--wg-metric-font-size-compact',
      '--wg-metric-font-size-prominent',
      '--wg-metric-size-value-minimum',
      '--wg-metric-space',
    ],
    defaults: {
      activity: "'idle'",
      condition: "'neutral'",
      knowledge: "'confirmed'",
      label: "''",
      loading: 'false',
      size: "'compact'",
      unit: "''",
      value: "''",
    },
  },
  panel: {
    attributes: {
      purpose: 'purpose',
      emphasis: 'emphasis',
      busy: 'busy',
      disabled: 'disabled',
      label: 'label',
    },
    properties: ['busy', 'disabled', 'emphasis', 'label', 'purpose'],
    slots: ['actions', 'default', 'description', 'heading', 'progress'],
    parts: ['actions', 'base', 'content', 'description', 'header', 'heading', 'progress'],
    cssProperties: [
      '--wg-panel-color-background',
      '--wg-panel-color-border',
      '--wg-panel-color-text',
      '--wg-panel-radius',
      '--wg-panel-space',
      '--wg-panel-space-section',
    ],
    defaults: {
      busy: 'false',
      disabled: 'false',
      emphasis: "'standard'",
      label: "''",
      purpose: "'information'",
    },
  },
  rail: {
    attributes: { orientation: 'orientation', weight: 'weight' },
    properties: ['orientation', 'weight'],
    slots: [],
    parts: ['band'],
    cssProperties: [
      '--wg-rail-color',
      '--wg-rail-radius',
      '--wg-rail-size-standard',
      '--wg-rail-size-strong',
    ],
    defaults: { orientation: "'block'", weight: "'standard'" },
  },
  'status-indicator': {
    attributes: {
      label: 'label',
      condition: 'condition',
      knowledge: 'knowledge',
      activity: 'activity',
      size: 'size',
    },
    properties: ['activity', 'condition', 'knowledge', 'label', 'size'],
    slots: ['detail', 'label'],
    parts: ['activity', 'base', 'detail', 'knowledge', 'label', 'signal'],
    cssProperties: [
      '--wg-status-indicator-color-border',
      '--wg-status-indicator-color-condition',
      '--wg-status-indicator-radius',
      '--wg-status-indicator-size-compact',
      '--wg-status-indicator-size-prominent',
      '--wg-status-indicator-space',
    ],
    defaults: {
      activity: "'idle'",
      condition: "'neutral'",
      knowledge: "'confirmed'",
      label: "''",
      size: "'compact'",
    },
  },
  'theme-provider': {
    attributes: { theme: 'theme', density: 'density' },
    properties: ['density', 'resolvedTheme', 'theme'],
    slots: ['default'],
    parts: [],
    cssProperties: [],
    defaults: { density: "'compact'", theme: "'system'" },
  },
  'value-tile': {
    attributes: { label: 'label', emphasis: 'emphasis', busy: 'busy' },
    properties: ['busy', 'emphasis', 'label'],
    slots: ['actions', 'default', 'heading', 'metadata', 'progress', 'status', 'value'],
    parts: [
      'actions',
      'base',
      'content',
      'header',
      'heading',
      'metadata',
      'progress',
      'status',
      'value',
    ],
    cssProperties: [
      '--wg-value-tile-color-background',
      '--wg-value-tile-color-border',
      '--wg-value-tile-radius',
      '--wg-value-tile-space',
      '--wg-value-tile-space-section',
    ],
    defaults: { busy: 'false', emphasis: "'standard'", label: "''" },
  },
} as const satisfies Readonly<Record<string, PrimitiveContract>>;

function section(document: string, heading: string): string {
  const match = document.match(new RegExp(`### ${heading}\\n([\\s\\S]*?)(?=\\n### |\\n## )`));
  expect(match, `missing ${heading} section`).not.toBeNull();
  return match?.[1] ?? '';
}

function codeBullets(document: string, heading: string): string[] {
  return [...section(document, heading).matchAll(/^- (?:`([^`]+)`|(default))(?:[:;.].*)?$/gm)]
    .map((match) => match[1] ?? match[2]!)
    .sort();
}

function sourceSlots(source: string): string[] {
  return [...source.matchAll(/<slot(?:\s+name="([^"]+)")?/g)]
    .map((match) => match[1] ?? 'default')
    .filter((value, index, values) => values.indexOf(value) === index)
    .sort();
}

function sourceParts(source: string): string[] {
  const values = [
    ...[...source.matchAll(/part="([^"]+)"/g)].flatMap((match) => match[1]!.split(/\s+/)),
    ...[...source.matchAll(/\[part='([^']+)'\]/g)].map((match) => match[1]!),
  ];
  return [...new Set(values)].sort();
}

function sourceCssProperties(source: string, moduleName: string): string[] {
  const pattern = new RegExp(`--wg-${moduleName}-[a-z0-9-]+`, 'g');
  return [...new Set(source.match(pattern) ?? [])].sort();
}

function sourceReactiveProperties(source: string): string[] {
  const propertiesBlock = source.match(
    /static override properties = \{([\s\S]*?)\n {2}\};\n\n {2}static override styles/,
  );
  expect(propertiesBlock, 'missing reactive properties block').not.toBeNull();
  return [...(propertiesBlock?.[1] ?? '').matchAll(/^ {4}([a-z][A-Za-z0-9]*): \{$/gm)]
    .map((match) => match[1]!)
    .sort();
}

function sourcePublicProperties(source: string): string[] {
  return [...source.matchAll(/^ {2}(?:declare|get) ([a-z][A-Za-z0-9]*)(?::|\()/gm)]
    .map((match) => match[1]!)
    .sort();
}

describe('Phase 1 primitive field contracts', () => {
  it.each(Object.entries(contracts))(
    '%s aligns implementation, docs, and React',
    (name, contract) => {
      const source = readFileSync(
        resolve(repositoryRoot, `packages/elements/src/${name}.ts`),
        'utf8',
      );
      const react = readFileSync(resolve(repositoryRoot, `packages/react/src/${name}.tsx`), 'utf8');
      const document = readFileSync(resolve(repositoryRoot, `docs/components/${name}.md`), 'utf8');

      const documentedAttributes = codeBullets(document, 'Attributes').map(
        (value) => value.split(':')[0]!,
      );
      const documentedProperties = codeBullets(document, 'Properties').map((value) =>
        value.split(':')[0]!.replace(/^readonly /, ''),
      );

      expect(documentedAttributes).toEqual(Object.keys(contract.attributes).sort());
      expect(documentedProperties).toEqual([...contract.properties].sort());
      expect(codeBullets(document, 'Slots')).toEqual([...contract.slots].sort());
      expect(codeBullets(document, 'CSS Parts')).toEqual([...contract.parts].sort());
      expect(codeBullets(document, 'CSS Custom Properties')).toEqual(
        [...contract.cssProperties].sort(),
      );

      expect(sourceSlots(source)).toEqual([...contract.slots].sort());
      expect(sourceParts(source)).toEqual([...contract.parts].sort());
      expect(sourceCssProperties(source, name)).toEqual([...contract.cssProperties].sort());
      expect(sourceReactiveProperties(source)).toEqual(Object.values(contract.attributes).sort());
      expect(sourcePublicProperties(source)).toEqual([...contract.properties].sort());

      for (const [attribute, property] of Object.entries(contract.attributes)) {
        expect(source).toMatch(new RegExp(`\\n    ${property}: \\{`));
        if (attribute !== property) expect(source).toContain(`attribute: '${attribute}'`);
      }
      for (const property of contract.properties) {
        expect(source).toMatch(new RegExp(`(?:declare ${property}:|get ${property}\\(\\):)`));
      }
      for (const [property, value] of Object.entries(contract.defaults)) {
        expect(source).toMatch(
          new RegExp(
            `(?:this\\.|#)${property}[^=]*= ${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
          ),
        );
        if (value !== "''") {
          expect(section(document, 'Attributes')).toContain(
            `default \`${value.replaceAll("'", '')}\``,
          );
        }
      }

      expect(react).toContain(`from '@wayglass/elements/${name}'`);
      expect(react).toContain('createComponent({');
      expect(react).toContain('export type Wg');
    },
  );

  it('freezes the Phase 1 method and event exceptions', () => {
    const button = readFileSync(resolve(repositoryRoot, 'packages/elements/src/button.ts'), 'utf8');
    const buttonDocument = readFileSync(
      resolve(repositoryRoot, 'docs/components/button.md'),
      'utf8',
    );
    expect(button).toContain('override focus(options?: FocusOptions): void');
    expect(button).toContain('override click(): void');
    expect(codeBullets(buttonDocument, 'Methods')).toEqual([
      'click(): void',
      'focus(options?: FocusOptions): void',
    ]);
    expect(section(buttonDocument, 'Events')).toContain('Native `click`');

    const provider = readFileSync(
      resolve(repositoryRoot, 'packages/elements/src/theme-provider.ts'),
      'utf8',
    );
    const providerDocument = readFileSync(
      resolve(repositoryRoot, 'docs/components/theme-provider.md'),
      'utf8',
    );
    expect(provider).toContain("new CustomEvent<WgThemeChangeDetail>('wg-theme-change'");
    expect(provider).toContain('bubbles: true');
    expect(provider).toContain('composed: true');
    expect(section(providerDocument, 'Events')).toContain('`wg-theme-change`');
    expect(section(providerDocument, 'Events')).toContain("source: 'attribute' | 'system'");
  });
});
