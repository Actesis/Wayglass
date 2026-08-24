import { describe, expect, it } from 'vitest';

import { createIdentityIndex } from '../src/identity.js';

describe('token interchange identity mapping', () => {
  it('maps dotted identities to reversible nested exchange paths', () => {
    const identities = createIdentityIndex([
      'component.panel.space',
      'component.panel.space.section',
      'color.semantic.condition.positive',
    ]);

    expect(identities.get('color.semantic.condition.positive')?.exchangePath).toEqual([
      'color',
      'semantic',
      'condition',
      'positive',
    ]);
    expect(identities.get('component.panel.space')?.exchangePath).toEqual([
      'component',
      'panel',
      'space',
      '$root',
    ]);
    expect(identities.get('component.panel.space.section')?.exchangePath).toEqual([
      'component',
      'panel',
      'space',
      'section',
    ]);
  });

  it('sorts identities without locale-sensitive comparison', () => {
    expect([...createIdentityIndex(['z.token', 'a.token']).keys()]).toEqual(['a.token', 'z.token']);
  });

  it.each([
    ['token', /at least two path segments/],
    ['color..invalid', /empty path segment/],
    ['color.$invalid', /invalid segment/],
    ['color.{invalid}', /invalid segment/],
  ])('rejects invalid identity %s', (identity, expected) => {
    expect(() => createIdentityIndex([identity])).toThrow(expected);
  });

  it('rejects duplicate source identities before output mapping', () => {
    expect(() => createIdentityIndex(['color.valid', 'color.valid'])).toThrow(/duplicated/);
  });
});
