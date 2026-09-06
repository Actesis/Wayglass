import { describe, expect, it } from 'vitest';

import { consumerScenarios } from '../src/consumer.ts';
import { reactConsumerTemplate, reactDirectMain } from '../src/react-consumer.ts';
import type { ConsumerScenario } from '../src/types.ts';

describe('release-candidate React consumer fixture', () => {
  it('authors the exact four compiler and React version scenarios', () => {
    const scenarios = consumerScenarios().filter(({ kind }) => kind === 'react');
    expect(scenarios.map(({ id }) => id)).toEqual([
      'react-19.0.0-ts-5.9.3',
      'react-19.2.8-ts-5.9.3',
      'react-19.0.0-ts-6.0.3',
      'react-19.2.8-ts-6.0.3',
    ]);
    for (const scenario of scenarios) {
      expect(reactConsumerTemplate(scenario).files.map(({ path }) => path)).toEqual([
        'index.html',
        'src/main.tsx',
        'src/package-surface.ts',
        'src/style.css',
        'tsconfig.json',
      ]);
    }
  });

  it('checks root/subpath declarations and retains only one runtime wrapper', () => {
    const template = reactConsumerTemplate(consumerScenarios()[2]!);
    const surface = template.files.find(({ path }) => path === 'src/package-surface.ts')!.contents;
    const main = template.files.find(({ path }) => path === 'src/main.tsx')!.contents;
    for (const specifier of [
      '@wayglass/core',
      '@wayglass/tokens',
      '@wayglass/themes',
      '@wayglass/elements',
      '@wayglass/elements/boolean-value',
      '@wayglass/react',
      '@wayglass/react/toggle',
    ]) {
      expect(surface).toContain(`'${specifier}'`);
    }
    expect(main).toContain("from '@wayglass/react/toggle'");
    expect(main).not.toContain("from '@wayglass/react'");
  });

  it('authors client fallback, guarded registration, parity, and event adaptation', () => {
    const main = reactConsumerTemplate(consumerScenarios()[2]!).files.find(
      ({ path }) => path === 'src/main.tsx',
    )!.contents;
    expect(main).toContain('root.replaceChildren()');
    expect(main).toContain('WG_REACT_UNUSED_ELEMENT_REGISTERED');
    expect(main).toContain('defineWgBooleanValue()');
    expect(main).toContain('WG_REACT_DIRECT_PARITY_FAILED');
    expect(main).toContain('onWgToggleRequest={onRequest}');
    expect(main).toContain('WG_REACT_CLIENT_FALLBACK_READY');
    expect(reactDirectMain).toContain('WG_REACT_BINDING_REMOVED');
    expect(reactDirectMain).not.toContain('@wayglass/react');
  });

  it('rejects Vanilla and invented React scenarios', () => {
    expect(() => reactConsumerTemplate(consumerScenarios()[0]!)).toThrowError(
      /WG_RC_REACT_SCENARIO/,
    );
    expect(() =>
      reactConsumerTemplate({
        ...consumerScenarios()[2]!,
        id: 'react-invented',
      } as ConsumerScenario),
    ).toThrowError(/WG_RC_CONSUMER_SCENARIO/);
  });
});
