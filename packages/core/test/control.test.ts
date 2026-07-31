import { describe, expect, it } from 'vitest';

import { isBooleanRequest, isControlAvailability, isRequestState } from '../src/index.js';

describe('control vocabulary', () => {
  it('recognizes request presentation states', () => {
    expect(isRequestState('idle')).toBe(true);
    expect(isRequestState('pending')).toBe(true);
    expect(isRequestState('rejected')).toBe(true);
    expect(isRequestState('failed')).toBe(false);
  });

  it('recognizes availability independently of disabled state', () => {
    expect(isControlAvailability('available')).toBe(true);
    expect(isControlAvailability('unavailable')).toBe(true);
    expect(isControlAvailability('disabled')).toBe(false);
  });

  it('recognizes explicit Boolean requests', () => {
    expect(isBooleanRequest('none')).toBe(true);
    expect(isBooleanRequest('asserted')).toBe(true);
    expect(isBooleanRequest('not-asserted')).toBe(true);
    expect(isBooleanRequest(true)).toBe(false);
  });
});
