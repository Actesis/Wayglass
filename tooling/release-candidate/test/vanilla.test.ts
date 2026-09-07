import { describe, expect, it } from 'vitest';

import { consumerScenarios } from '../src/consumer.ts';
import { vanillaConsumerTemplate } from '../src/vanilla.ts';
import type { ConsumerScenario } from '../src/types.ts';

describe('release-candidate Vanilla consumer fixture', () => {
  it('authors the same guarded fixture for both accepted compiler lines', () => {
    const scenarios = consumerScenarios().filter(({ kind }) => kind === 'vanilla');
    expect(scenarios).toHaveLength(2);
    for (const scenario of scenarios) {
      const template = vanillaConsumerTemplate(scenario);
      expect(template.scenario).toBe(scenario);
      expect(template.files.map(({ path }) => path)).toEqual([
        'index.html',
        'src/main.ts',
        'src/package-surface.ts',
        'src/style.css',
        'src/vite-env.d.ts',
        'tsconfig.json',
      ]);
      expect(template.files.find(({ path }) => path === 'index.html')!.contents).toContain(
        '<header role="banner"><h1>Wayglass Vanilla release probe</h1></header>',
      );
    }
  });

  it('covers root and accepted subpath declarations without runtime root imports', () => {
    const template = vanillaConsumerTemplate(consumerScenarios()[0]!);
    const surface = template.files.find(({ path }) => path === 'src/package-surface.ts')!.contents;
    const main = template.files.find(({ path }) => path === 'src/main.ts')!.contents;
    for (const specifier of [
      '@wayglass/core',
      '@wayglass/tokens',
      '@wayglass/themes',
      '@wayglass/elements',
      '@wayglass/elements/boolean-value',
      '@wayglass/icons',
      '@wayglass/icons/icon',
    ]) {
      expect(surface).toContain(`'${specifier}'`);
    }
    expect(main).toContain("from '@wayglass/elements/toggle'");
    expect(main).toContain("from '@wayglass/elements/boolean-value'");
    expect(main).not.toContain("from '@wayglass/elements'");
    expect(surface).toContain("const token: TokenName = 'color.semantic.text.primary'");
    expect(surface).toContain('tokens[token]');
    expect(surface).not.toContain('tokens[0]');
  });

  it('authors explicit registration, interaction, semantic-axis, and CSS assertions', () => {
    const template = vanillaConsumerTemplate(consumerScenarios()[0]!);
    const main = template.files.find(({ path }) => path === 'src/main.ts')!.contents;
    const style = template.files.find(({ path }) => path === 'src/style.css')!.contents;
    const environment = template.files.find(({ path }) => path === 'src/vite-env.d.ts')!.contents;
    expect(main.indexOf('customElements.get')).toBeLessThan(main.indexOf('defineWgBooleanValue()'));
    expect(main).toContain("addEventListener('wg-toggle-request'");
    expect(main).toContain("condition: 'critical', knowledge: 'stale', activity: 'pending'");
    expect(main).toContain("booleanState !== 'asserted'");
    expect(main).toContain('WG_VANILLA_PROBE_READY');
    for (const css of [
      '@wayglass/tokens/tokens.css',
      '@wayglass/themes/themes.css',
      '@wayglass/elements/foundations.css',
    ]) {
      expect(style).toContain(css);
    }
    expect(environment).toContain('/// <reference types="vite/client" />');
  });

  it('rejects React and invented Vanilla scenarios', () => {
    expect(() => vanillaConsumerTemplate(consumerScenarios()[2]!)).toThrowError(
      /WG_RC_VANILLA_SCENARIO/,
    );
    expect(() =>
      vanillaConsumerTemplate({
        id: 'vanilla-ts-invented',
        kind: 'vanilla',
        typescript: '5.9.3',
      } as ConsumerScenario),
    ).toThrowError(/WG_RC_CONSUMER_SCENARIO/);
  });
});
