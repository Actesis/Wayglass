import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

interface FeedbackContract {
  readonly properties: readonly string[];
  readonly slots: readonly string[];
  readonly parts: readonly string[];
  readonly defaults: Readonly<Record<string, string>>;
}

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const document = readFileSync(
  resolve(repositoryRoot, 'docs/feedback/persistent-feedback-and-loading.md'),
  'utf8',
);
const shell = readFileSync(
  resolve(repositoryRoot, 'packages/elements/src/form-control-shell.ts'),
  'utf8',
);

const contracts = {
  alert: {
    properties: ['announcement', 'condition', 'label'],
    slots: ['actions', 'default', 'heading'],
    parts: ['actions', 'base', 'content', 'heading', 'marker', 'message'],
    defaults: { announcement: "'off'", condition: "'neutral'", label: "''" },
  },
  badge: {
    properties: ['condition'],
    slots: ['default'],
    parts: ['base', 'content', 'marker'],
    defaults: { condition: "'neutral'" },
  },
  'empty-state': {
    properties: ['label'],
    slots: ['actions', 'default', 'heading', 'media'],
    parts: ['actions', 'base', 'content', 'heading', 'marker', 'media'],
    defaults: { label: "''" },
  },
  'offline-state': {
    properties: ['label'],
    slots: ['actions', 'default', 'heading', 'last-known'],
    parts: ['actions', 'base', 'content', 'heading', 'last-known', 'marker'],
    defaults: { label: "''" },
  },
  progress: {
    properties: [],
    slots: ['default'],
    parts: ['container'],
    defaults: {},
  },
  skeleton: {
    properties: ['lines', 'motion', 'shape'],
    slots: [],
    parts: ['base', 'line', 'shape'],
    defaults: { lines: '1', motion: "'static'", shape: "'text'" },
  },
  'stale-data-marker': {
    properties: [],
    slots: ['default'],
    parts: ['base', 'content', 'marker'],
    defaults: {},
  },
} as const satisfies Readonly<Record<string, FeedbackContract>>;

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

function sourceParts(source: string): string[] {
  return [
    ...new Set([...source.matchAll(/part="([^"]+)"/g)].flatMap((match) => match[1]!.split(/\s+/))),
  ].sort();
}

describe('persistent-feedback field-level contracts', () => {
  it.each(Object.entries(contracts))(
    '%s freezes fields, slots, parts, and React pairing',
    (name, expected) => {
      const source = readFileSync(
        resolve(repositoryRoot, `packages/elements/src/${name}.ts`),
        'utf8',
      );
      const react = readFileSync(resolve(repositoryRoot, `packages/react/src/${name}.tsx`), 'utf8');
      const className = name
        .split('-')
        .map((part) => part[0]!.toUpperCase() + part.slice(1))
        .join('');
      const renderedSource = name === 'progress' ? `${source}\n${shell}` : source;

      expect(sourceReactiveProperties(source)).toEqual([...expected.properties].sort());
      expect(sourceSlots(renderedSource)).toEqual([...expected.slots].sort());
      expect(sourceParts(renderedSource)).toEqual([...expected.parts].sort());
      for (const [property, value] of Object.entries(expected.defaults)) {
        expect(source).toContain(`this.${property} = ${value};`);
      }
      expect(source).not.toContain('new CustomEvent');
      expect(source).toContain(`defineElement(wg${className}TagName, Wg${className}, registry);`);
      expect(react).toContain(`from '@wayglass/elements/${name}'`);
      expect(react).toContain(`registerElement(defineWg${className});`);
      expect(react).not.toContain('events:');

      for (const part of expected.parts) expect(document).toContain(`\`${part}\``);
    },
  );

  it('freezes shared feedback styling hooks', () => {
    const styles = readFileSync(
      resolve(repositoryRoot, 'packages/elements/src/feedback-styles.ts'),
      'utf8',
    );
    const expected = [
      '--wg-feedback-color-background',
      '--wg-feedback-color-border',
      '--wg-feedback-color-detail',
      '--wg-feedback-color-text',
      '--wg-feedback-radius',
      '--wg-feedback-size-marker',
      '--wg-feedback-space',
      '--wg-feedback-space-related',
    ];
    const actual = [...new Set(styles.match(/--wg-feedback-[a-z0-9-]+/g) ?? [])].sort();
    expect(actual).toEqual(expected.sort());
    for (const property of expected) expect(document).toContain(`\`${property}\``);
  });

  it('freezes condition, announcement, and skeleton normalization', () => {
    const values = readFileSync(
      resolve(repositoryRoot, 'packages/elements/src/feedback-values.ts'),
      'utf8',
    );
    expect(values).toContain("'neutral',\n  'positive',\n  'caution',\n  'critical'");
    expect(values).toContain("['off', 'polite', 'assertive']");

    const skeleton = readFileSync(
      resolve(repositoryRoot, 'packages/elements/src/skeleton.ts'),
      'utf8',
    );
    expect(skeleton).toContain("['text', 'block', 'circle']");
    expect(skeleton).toContain("['static', 'pulse']");
    expect(skeleton).toContain('Math.min(8, Math.max(1, parsed))');
    expect(skeleton).toContain("this.setAttribute('aria-hidden', 'true')");
  });

  it('freezes native progress ownership and scoped diagnostics', () => {
    const progress = readFileSync(
      resolve(repositoryRoot, 'packages/elements/src/progress.ts'),
      'utf8',
    );
    expect(progress).toContain('extends WgFormControlShell');
    expect(progress).toContain('element instanceof HTMLProgressElement');
    expect(progress).toContain("progress.hasAttribute('aria-label')");
    expect(progress).toContain("progress.hasAttribute('aria-labelledby')");
    expect(document).toContain('without an explicit accessible name');
    expect(document).toContain('persistent-feedback elements do');
    expect(document).toContain('inspect required visible content');
  });

  it('records implemented styling, validation, and continuing boundaries', () => {
    expect(document).toContain('## Styling hooks');
    expect(document).toContain('## Validation coverage');
    expect(document).toContain('## Continuing boundaries');
    expect(document).toContain('expose no element-specific CSS custom properties in v1');
    expect(document).not.toContain('## Token direction');
    expect(document).not.toContain('Token names and values remain open');
    expect(document).not.toContain('## Validation requirements');
    expect(document).not.toContain('## Deferred decisions');
    expect(document).not.toContain('interactive descendants outside documented action slots');
  });
});
