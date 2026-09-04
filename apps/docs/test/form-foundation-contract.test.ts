import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

interface InertElementContract {
  readonly slots: readonly string[];
  readonly parts: readonly string[];
  readonly cssProperties: readonly string[];
}

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const document = readFileSync(resolve(repositoryRoot, 'docs/forms/form-foundation.md'), 'utf8');

const contracts = {
  'field-label': {
    slots: ['default', 'detail', 'requirement'],
    parts: ['detail', 'label', 'requirement', 'text'],
    cssProperties: [
      '--wg-field-label-color',
      '--wg-field-label-detail-color',
      '--wg-field-label-requirement-color',
      '--wg-field-label-space',
    ],
  },
  'field-message': {
    slots: ['default'],
    parts: ['message', 'signal', 'text'],
    cssProperties: [
      '--wg-field-message-color',
      '--wg-field-message-signal-color',
      '--wg-field-message-signal-size',
      '--wg-field-message-space',
    ],
  },
  'form-group': {
    slots: ['default'],
    parts: ['group'],
    cssProperties: ['--wg-form-group-space'],
  },
} as const satisfies Readonly<Record<string, InertElementContract>>;

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

describe('form-foundation field-level contracts', () => {
  it.each(Object.entries(contracts))(
    '%s freezes inert fields and React pairing',
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

      expect(sourceSlots(source)).toEqual([...expected.slots].sort());
      expect(sourceParts(source)).toEqual([...expected.parts].sort());
      const cssPrefix = name === 'form-group' ? 'form-group' : name;
      expect(
        [...new Set(source.match(new RegExp(`--wg-${cssPrefix}-[a-z0-9-]+`, 'g')) ?? [])].sort(),
      ).toEqual([...expected.cssProperties].sort());
      for (const slot of expected.slots) {
        expect(document).toContain(slot === 'default' ? 'default:' : `\`${slot}\``);
      }
      for (const part of expected.parts) expect(document).toContain(`\`${part}\``);
      for (const property of expected.cssProperties) {
        expect(source).toContain(`${property}:`);
        expect(document).toContain(`\`${property}\``);
      }

      expect(source).not.toContain('new CustomEvent');
      expect(source).not.toContain('static formAssociated');
      expect(source).not.toContain('addEventListener(');
      expect(source).toContain(`defineElement(wg${className}TagName, Wg${className}, registry);`);
      expect(react).toContain(`from '@wayglass/elements/${name}'`);
      expect(react).toContain(`registerElement(defineWg${className});`);
      expect(react).toContain('createComponent({');
      expect(react).not.toContain('events:');
    },
  );

  it('freezes the closed field-message kind and normalization behavior', () => {
    const source = readFileSync(
      resolve(repositoryRoot, 'packages/elements/src/field-message.ts'),
      'utf8',
    );
    expect(source).toContain("export const fieldMessageKinds = ['help', 'error'] as const");
    expect(source).toContain('kind: { type: String, reflect: true }');
    expect(source).toContain("this.kind = 'help';");
    expect(source).toContain("this.setAttribute('kind', 'help')");
    expect(
      [...source.matchAll(/^ {2}declare ([a-z][A-Za-z0-9]*):/gm)].map((match) => match[1]),
    ).toEqual(['kind']);
    expect(document).toContain("`kind: 'help' | 'error'`; default `help`");
    expect(document).toContain('Missing or unsupported `kind` values');
    expect(document).toContain('normalize to\n`help`');
  });

  it('keeps field label and form group property-free', () => {
    for (const name of ['field-label', 'form-group']) {
      const source = readFileSync(
        resolve(repositoryRoot, `packages/elements/src/${name}.ts`),
        'utf8',
      );
      expect(source).not.toContain('static override properties');
      expect(source).not.toMatch(/^ {2}declare [a-z]/m);
    }
  });

  it('freezes native ownership and the native form-action stylesheet', () => {
    const forms = readFileSync(resolve(repositoryRoot, 'packages/elements/src/forms.css'), 'utf8');
    expect(forms).toContain('.wg-form-action {');
    expect(forms).toContain('.wg-form-action--quiet {');
    expect(document).toContain("@import '@wayglass/elements/forms.css'");
    expect(document).toContain('`wg-form-action--quiet` is the only v1 modifier');

    for (const term of [
      'do not add form-control,',
      'Native `<label>`',
      'Native `<fieldset>`',
      'authored native HTML owns truth and interaction',
      'does not validate or rewrite consumer form structure',
    ]) {
      expect(document.toLocaleLowerCase()).toContain(term.toLocaleLowerCase());
    }
  });

  it('records completed validation and continuing v1 boundaries', () => {
    expect(document).toContain('## Validation coverage');
    expect(document).toContain('## Continuing boundaries');
    expect(document).not.toContain('## Implementation acceptance');
    expect(document).not.toContain('## Deferred decisions');
    expect(document).not.toContain('Phase 2D-E will define');
    expect(document).not.toContain('Phase 2E will define');
    expect(document).not.toContain('are development diagnostics');
  });
});
