import { describe, expect, it } from 'vitest';

import {
  booleanValueStates,
  isBooleanValueState,
  isSectionPurpose,
  sectionPurposes,
  toBooleanValueState,
} from '../src/index.js';

describe('shared semantic roles', () => {
  it('defines section purpose independently from function ownership', () => {
    expect(sectionPurposes).toEqual(['information', 'monitor', 'control']);
    expect(isSectionPurpose('monitor')).toBe(true);
    expect(isSectionPurpose('status')).toBe(false);
  });

  it('maps Boolean values without assigning health meaning', () => {
    expect(booleanValueStates).toEqual(['asserted', 'not-asserted']);
    expect(toBooleanValueState(true)).toBe('asserted');
    expect(toBooleanValueState(false)).toBe('not-asserted');
    expect(isBooleanValueState('asserted')).toBe(true);
    expect(isBooleanValueState('positive')).toBe(false);
  });
});
