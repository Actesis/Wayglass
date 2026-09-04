import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { generatedIconCatalog } from '../../../packages/icons/src/generated/catalog.js';
import {
  densityNames,
  densityTokenOverrides,
  themeNames,
  themeSelectionNames,
  themeTokenOverrides,
} from '../../../packages/themes/src/definitions.js';
import { tokens, tokenTypes } from '../../../packages/tokens/src/definitions.js';
import { iconDirections, iconSizes } from '../../../packages/icons/src/runtime.js';

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalValue((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

function fingerprint(value: unknown): { readonly bytes: number; readonly sha256: string } {
  const content = JSON.stringify(canonicalValue(value));
  return {
    bytes: Buffer.byteLength(content),
    sha256: createHash('sha256').update(content).digest('hex'),
  };
}

describe('Phase 6B exact design-asset freeze', () => {
  it('freezes every token name, value, type, and description', () => {
    expect(Object.keys(tokens)).toHaveLength(528);
    expect(fingerprint({ tokenTypes, tokens })).toEqual({
      bytes: 76_615,
      sha256: 'dcca8f326e7da8c3edf3596d100846c784f84f759dc4b8eef167e4329c132260',
    });
  });

  it('freezes every theme and density name and override', () => {
    expect(themeNames).toEqual(['wayglass-dark', 'wayglass-light']);
    expect(themeSelectionNames).toEqual(['system', 'wayglass-dark', 'wayglass-light']);
    expect(densityNames).toEqual(['compact', 'comfortable']);
    expect(Object.values(themeTokenOverrides).flatMap(Object.entries)).toHaveLength(73);
    expect(Object.values(densityTokenOverrides).flatMap(Object.entries)).toHaveLength(124);
    expect(
      fingerprint({
        themeNames,
        densityNames,
        themeSelectionNames,
        themeTokenOverrides,
        densityTokenOverrides,
      }),
    ).toEqual({
      bytes: 11_365,
      sha256: 'fd13ec329824a320e4191bc62c79b707297409cb5603f23eb5a4cfccbb0f366f',
    });
  });

  it('freezes every generated icon name, direction, primitive, and public option', () => {
    expect(generatedIconCatalog.map(({ name }) => name)).toEqual([
      'close',
      'menu',
      'more',
      'refresh',
    ]);
    expect(generatedIconCatalog.flatMap(({ primitives }) => primitives)).toHaveLength(6);
    expect(iconSizes).toEqual(['compact', 'standard', 'prominent']);
    expect(iconDirections).toEqual(['auto', 'ltr', 'rtl']);
    expect(fingerprint({ generatedIconCatalog, iconSizes, iconDirections })).toEqual({
      bytes: 1_725,
      sha256: 'fa7559c60ed65fe581cba35305d30dcd44df01725784564eb3733208a3fa9243',
    });
  });

  it('keeps public theme vocabulary free of implementation-history names', () => {
    expect(JSON.stringify({ themeNames, themeSelectionNames })).not.toMatch(/phase1/i);
  });
});
