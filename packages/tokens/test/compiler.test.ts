import { describe, expect, it } from 'vitest';

import { createCss, createJson, validateTokens } from '../src/compiler.js';
import { tokens } from '../src/definitions.js';

describe('token compiler', () => {
  it('produces deterministic, prefixed CSS custom properties', () => {
    const firstBuild = createCss(tokens);
    const secondBuild = createCss(tokens);

    expect(firstBuild).toBe(secondBuild);
    expect(firstBuild).toContain('--wg-color-semantic-state-critical');
    expect(firstBuild).toContain('var(--wg-color-reference-red-500)');
  });

  it('produces DTCG-shaped JSON metadata', () => {
    const output = JSON.parse(createJson(tokens)) as Record<
      string,
      { $description: string; $type: string; $value: string | number | readonly number[] }
    >;

    expect(output['color.semantic.surface.canvas']).toEqual({
      $description: 'Primary application canvas.',
      $type: 'color',
      $value: '{color.reference.ink.950}',
    });
  });

  it('rejects missing token references', () => {
    expect(() =>
      validateTokens({
        'color.semantic.invalid': {
          value: '{color.reference.missing}',
          type: 'color',
          description: 'Invalid test token.',
        },
      }),
    ).toThrow(/missing token/);
  });
});
