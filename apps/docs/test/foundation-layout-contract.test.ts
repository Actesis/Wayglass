import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

interface ElementContract {
  readonly title: string;
  readonly document: 'foundation' | 'layout';
  readonly properties: readonly string[];
  readonly slots: readonly string[];
  readonly parts: readonly string[];
  readonly cssProperties: readonly string[];
  readonly defaults: Readonly<Record<string, string>>;
}

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const documents = {
  foundation: readFileSync(
    resolve(repositoryRoot, 'docs/foundations/foundation-contracts.md'),
    'utf8',
  ),
  layout: readFileSync(resolve(repositoryRoot, 'docs/layout/layout-contracts.md'), 'utf8'),
};

const elements = {
  divider: {
    title: 'Divider',
    document: 'foundation',
    properties: ['decorative', 'orientation', 'weight'],
    slots: [],
    parts: ['line'],
    cssProperties: ['--wg-divider-color', '--wg-divider-size'],
    defaults: { decorative: 'false', orientation: "'horizontal'", weight: "'standard'" },
  },
  surface: {
    title: 'Surface',
    document: 'foundation',
    properties: ['boundary', 'padding', 'tone'],
    slots: ['default'],
    parts: ['base'],
    cssProperties: [
      '--wg-surface-color-background',
      '--wg-surface-color-border',
      '--wg-surface-elevation',
      '--wg-surface-padding',
      '--wg-surface-radius',
    ],
    defaults: { boundary: "'subtle'", padding: "'comfortable'", tone: "'panel'" },
  },
  cluster: {
    title: 'Cluster',
    document: 'layout',
    properties: ['align', 'justify', 'space'],
    slots: ['default'],
    parts: ['base'],
    cssProperties: ['--wg-cluster-space'],
    defaults: { align: "'center'", justify: "'start'", space: "'related'" },
  },
  frame: {
    title: 'Frame',
    document: 'layout',
    properties: ['boundary', 'padding'],
    slots: ['default'],
    parts: ['base'],
    cssProperties: [
      '--wg-frame-border-size',
      '--wg-frame-color-background',
      '--wg-frame-color-border',
      '--wg-frame-padding',
      '--wg-frame-radius',
    ],
    defaults: { boundary: "'standard'", padding: "'comfortable'" },
  },
  grid: {
    title: 'Grid',
    document: 'layout',
    properties: ['align', 'minimum', 'space'],
    slots: ['default'],
    parts: ['base'],
    cssProperties: ['--wg-grid-item-minimum', '--wg-grid-space'],
    defaults: { align: "'stretch'", minimum: "'standard'", space: "'section'" },
  },
  'scroll-region': {
    title: 'Scroll region',
    document: 'layout',
    properties: ['axis', 'label'],
    slots: ['default'],
    parts: ['content'],
    cssProperties: [
      '--wg-scroll-region-color-border',
      '--wg-scroll-region-focus-ring-color',
      '--wg-scroll-region-max-block-size',
      '--wg-scroll-region-max-inline-size',
    ],
    defaults: { axis: "'block'", label: "''" },
  },
  split: {
    title: 'Split',
    document: 'layout',
    properties: ['align', 'minimum', 'ratio', 'space'],
    slots: ['primary', 'secondary'],
    parts: ['base', 'primary', 'secondary'],
    cssProperties: [
      '--wg-split-primary-ratio',
      '--wg-split-region-minimum',
      '--wg-split-secondary-ratio',
      '--wg-split-space',
    ],
    defaults: {
      align: "'stretch'",
      minimum: "'standard'",
      ratio: "'equal'",
      space: "'section'",
    },
  },
  stack: {
    title: 'Stack',
    document: 'layout',
    properties: ['align', 'space'],
    slots: ['default'],
    parts: ['base'],
    cssProperties: ['--wg-stack-space'],
    defaults: { align: "'stretch'", space: "'section'" },
  },
} as const satisfies Readonly<Record<string, ElementContract>>;

function componentSection(expected: ElementContract): string {
  const document = documents[expected.document];
  const match = document.match(new RegExp(`## ${expected.title}\\n([\\s\\S]*?)(?=\\n## |$)`));
  expect(match, `missing ${expected.title} contract`).not.toBeNull();
  return match?.[1] ?? '';
}

function subsection(document: string, heading: string): string {
  const match = document.match(new RegExp(`#### ${heading}\\n([\\s\\S]*?)(?=\\n#### |\\n### |$)`));
  expect(match, `missing ${heading} subsection`).not.toBeNull();
  return match?.[1] ?? '';
}

function codeBullets(document: string): string[] {
  return [...document.matchAll(/^- (?:`([^`]+)`|(default|primary|secondary))(?:[:;.].*)?$/gm)]
    .map((match) => match[1] ?? match[2]!)
    .sort();
}

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

function sourceCssProperties(source: string, name: string): string[] {
  const pattern = new RegExp(`--wg-${name}-[a-z0-9-]+`, 'g');
  return [...new Set(source.match(pattern) ?? [])].sort();
}

describe('foundation and layout field-level contracts', () => {
  it.each(Object.entries(elements))(
    '%s aligns implementation, docs, and React',
    (name, expected) => {
      const source = readFileSync(
        resolve(repositoryRoot, `packages/elements/src/${name}.ts`),
        'utf8',
      );
      const react = readFileSync(resolve(repositoryRoot, `packages/react/src/${name}.tsx`), 'utf8');
      const component = componentSection(expected);

      expect(sourceReactiveProperties(source)).toEqual([...expected.properties].sort());
      expect(sourcePublicProperties(source)).toEqual([...expected.properties].sort());
      expect(sourceSlots(source)).toEqual([...expected.slots].sort());
      expect(sourceParts(source)).toEqual([...expected.parts].sort());
      expect(sourceCssProperties(source, name)).toEqual([...expected.cssProperties].sort());

      const documentedProperties = codeBullets(
        subsection(component, 'Attributes and properties'),
      ).map((value) => value.split(':')[0]!);
      expect(documentedProperties).toEqual([...expected.properties].sort());
      expect(codeBullets(subsection(component, 'Slots'))).toEqual([...expected.slots].sort());
      expect(codeBullets(subsection(component, 'CSS parts'))).toEqual([...expected.parts].sort());
      expect(codeBullets(subsection(component, 'CSS custom properties'))).toEqual(
        [...expected.cssProperties].sort(),
      );
      expect(subsection(component, 'Events and methods')).toContain('None');

      for (const [property, value] of Object.entries(expected.defaults)) {
        expect(source).toContain(`this.${property} = ${value};`);
        if (value !== "''") {
          expect(subsection(component, 'Attributes and properties')).toContain(
            `default \`${value.replaceAll("'", '')}\``,
          );
        }
      }

      expect(react).toContain(`from '@wayglass/elements/${name}'`);
      expect(react).toContain('createComponent({');
      expect(react).toContain('export type Wg');
    },
  );

  it('retains the scroll-region native event and conditional semantics boundary', () => {
    const scrollContract = componentSection(elements['scroll-region']);
    expect(scrollContract).toContain('native `scroll` event');
    expect(scrollContract).toContain('joins the tab order only while overflow exists');
    expect(scrollContract).toContain('does not expose an unnamed region role');

    const source = readFileSync(
      resolve(repositoryRoot, 'packages/elements/src/scroll-region.ts'),
      'utf8',
    );
    expect(source).toContain("this.setAttribute('role', 'region')");
    expect(source).toContain('this.tabIndex = 0');
    expect(source).toContain("this.removeAttribute('role')");
    expect(source).not.toContain('new CustomEvent');
  });

  it('records implementation and validation as complete rather than future work', () => {
    for (const document of Object.values(documents)) {
      expect(document).toContain('## Implemented token roles');
      expect(document).toContain('## Validation coverage');
      expect(document).not.toContain('Token additions required by implementation');
      expect(document).not.toContain('The implementation gate must cover');
    }
  });
});
