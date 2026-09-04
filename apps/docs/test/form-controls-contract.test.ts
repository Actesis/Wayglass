import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const document = readFileSync(resolve(repositoryRoot, 'docs/forms/form-controls.md'), 'utf8');
const shell = readFileSync(
  resolve(repositoryRoot, 'packages/elements/src/form-control-shell.ts'),
  'utf8',
);
const styles = readFileSync(
  resolve(repositoryRoot, 'packages/elements/src/form-control-styles.ts'),
  'utf8',
);

const controls = {
  'text-field': { style: 'fieldShellStyles', anatomy: 'text-like input or textarea' },
  'number-field': { style: 'fieldShellStyles', anatomy: 'input[type="number"]' },
  select: { style: 'fieldShellStyles', anatomy: 'native select' },
  checkbox: { style: 'choiceShellStyles', anatomy: "choiceControlErrors(this, 'checkbox')" },
  radio: { style: 'choiceShellStyles', anatomy: "choiceControlErrors(this, 'radio')" },
  slider: { style: 'sliderShellStyles', anatomy: 'input[type="range"]' },
} as const;

const styleProperties = {
  fieldShellStyles: [
    '--wg-form-control-color-background',
    '--wg-form-control-color-background-readonly',
    '--wg-form-control-color-border',
    '--wg-form-control-color-border-invalid',
    '--wg-form-control-color-placeholder',
    '--wg-form-control-color-text',
    '--wg-form-control-radius',
    '--wg-form-control-size-minimum',
    '--wg-form-control-space-block',
    '--wg-form-control-space-inline',
  ],
  choiceShellStyles: [
    '--wg-form-choice-accent',
    '--wg-form-choice-gap',
    '--wg-form-choice-size',
    '--wg-form-choice-target',
  ],
  sliderShellStyles: ['--wg-form-slider-accent', '--wg-form-slider-size-minimum'],
} as const;

describe('form-control field-level contracts', () => {
  it.each(Object.entries(controls))(
    '%s freezes inert shell and React pairing',
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

      expect(source).toContain(`extends WgFormControlShell`);
      expect(source).toContain(`static override styles = ${expected.style};`);
      expect(source).toContain(expected.anatomy);
      expect(source).not.toContain('static override properties');
      expect(source).not.toContain('new CustomEvent');
      expect(source).toContain(`defineElement(wg${className}TagName, Wg${className}, registry);`);

      expect(react).toContain(`from '@wayglass/elements/${name}'`);
      expect(react).toContain(`registerElement(defineWg${className});`);
      expect(react).toContain('createComponent({');
      expect(react).not.toContain('events:');
    },
  );

  it('freezes the common slot, part, diagnostics, and non-repair behavior', () => {
    expect(shell).toContain('part="container"');
    expect(shell).toContain('<slot @slotchange=${this.#validateAnatomy}>');
    expect(shell).toContain('console.warn(`[${this.localName}] Invalid authoring:');
    expect(shell).toContain(
      'Expected exactly one direct ${description}; found ${controls.length}.',
    );
    expect(shell).toContain('The direct native label must be explicitly associated');
    expect(shell).not.toContain('appendChild');
    expect(shell).not.toContain('setAttribute');
    expect(shell).not.toContain('addEventListener');
    expect(document).toContain('a default slot');
    expect(document).toContain('internal `container` CSS part');
    expect(document).toContain('do not attempt a complete\naccessibility');
  });

  it.each(Object.entries(styleProperties))(
    '%s freezes exact public styling hooks',
    (name, expected) => {
      const start = styles.indexOf(`export const ${name} = css`);
      const end = styles.indexOf('`;', start);
      expect(start, `missing ${name}`).toBeGreaterThanOrEqual(0);
      expect(end, `unterminated ${name}`).toBeGreaterThan(start);
      const block = styles.slice(start, end);
      const prefix =
        name === 'fieldShellStyles'
          ? 'form-control'
          : name === 'choiceShellStyles'
            ? 'form-choice'
            : 'form-slider';
      const actual = [
        ...new Set(block.match(new RegExp(`--wg-${prefix}-[a-z0-9-]+`, 'g')) ?? []),
      ].sort();
      expect(actual).toEqual([...expected].sort());
      for (const property of expected) expect(document).toContain(`\`${property}\``);
    },
  );

  it('freezes accepted direct native anatomy', () => {
    const textField = readFileSync(
      resolve(repositoryRoot, 'packages/elements/src/text-field.ts'),
      'utf8',
    );
    for (const type of ['text', 'search', 'email', 'tel', 'url', 'password']) {
      expect(textField).toContain(`'${type}'`);
      expect(document).toContain(`\`${type}\``);
    }
    expect(textField).toContain('element instanceof HTMLTextAreaElement');
    expect(document).toContain('one direct native `<input>` with a text-like type or one direct');
    expect(document).toContain('exactly one direct native `<input type="number">`');
    expect(document).toContain('exactly one direct native `<select>`');
    expect(document).toContain('exactly one direct native `<input type="checkbox">`');
    expect(document).toContain('exactly one direct native `<input type="radio">`');
    expect(document).toContain('exactly one direct native `<input type="range">`');
  });

  it('records the implemented v1 contract and current evidence', () => {
    expect(document).toContain('<span slot="requirement">Required</span>');
    expect(document).not.toContain('<wg-field-label requirement=');
    expect(document).toContain('## Validation coverage');
    expect(document).toContain('## Continuing boundaries');
    expect(document).not.toContain('## Validation requirements');
    expect(document).not.toContain('## Deferred work');
    expect(document).not.toContain('nested or interactive anatomy that creates duplicate controls');
    expect(document).toContain('Open pre-public-release evidence remains VoiceOver/Safari');
  });
});
