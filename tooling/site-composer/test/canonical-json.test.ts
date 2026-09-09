import { describe, expect, it } from 'vitest';

import { compactCanonicalJson, serializeCanonicalJson } from '../src/canonical-json.ts';
import { SiteComposerError } from '../src/error.ts';

describe('canonical JSON', () => {
  it('sorts object keys recursively while preserving array order', () => {
    const value = { z: 1, a: { y: true, b: 2 }, list: [{ z: 3, a: 4 }, 1] };
    expect(compactCanonicalJson(value)).toBe(
      '{"a":{"b":2,"y":true},"list":[{"a":4,"z":3},1],"z":1}',
    );
    expect(serializeCanonicalJson(value)).toMatch(/^\{\n {2}"a":/);
    expect(serializeCanonicalJson(value).endsWith('\n')).toBe(true);
  });

  it.each([
    ['undefined', { bad: undefined }, 'WG_SITE_JSON_UNDEFINED'],
    ['non-finite', { bad: Number.NaN }, 'WG_SITE_JSON_NUMBER'],
    ['date', { bad: new Date(0) }, 'WG_SITE_JSON_OBJECT'],
    ['bigint', { bad: 1n }, 'WG_SITE_JSON_VALUE'],
  ])('rejects unsupported %s values', (_label, value, code) => {
    expect(() => compactCanonicalJson(value)).toThrowError(
      expect.objectContaining<Partial<SiteComposerError>>({ code }),
    );
  });
});
