import { describe, expect, it } from 'vitest';

import {
  defaultKnownState,
  isActivity,
  isCondition,
  isKnowledge,
  isKnownState,
} from '../src/index.js';

describe('known-state model', () => {
  it('keeps condition, knowledge, and activity orthogonal', () => {
    expect(
      isKnownState({
        condition: 'critical',
        knowledge: 'stale',
        activity: 'pending',
      }),
    ).toBe(true);
  });

  it('rejects unknown axis values', () => {
    expect(isCondition('offline')).toBe(false);
    expect(isKnowledge('certain')).toBe(false);
    expect(isActivity('loading')).toBe(false);
  });

  it('provides an honest unknown default', () => {
    expect(defaultKnownState).toEqual({
      condition: 'neutral',
      knowledge: 'unknown',
      activity: 'idle',
    });
  });
});
