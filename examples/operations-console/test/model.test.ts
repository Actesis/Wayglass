import { describe, expect, it } from 'vitest';

import {
  createNorthlineState,
  northlineScenarios,
  reduceNorthline,
  selectDispatchLoads,
  selectLoad,
} from '../src/model.js';

describe('Northline application state', () => {
  it('creates every accepted scenario deterministically with independent state axes', () => {
    for (const scenario of northlineScenarios) {
      expect(createNorthlineState(scenario)).toEqual(createNorthlineState(scenario));
    }
    expect(selectLoad(createNorthlineState(), 'NL-2048')).toMatchObject({
      condition: 'caution',
      activity: 'idle',
      confirmedReleaseState: 'scheduled',
      trailerTemperature: { knowledge: 'stale' },
    });
  });

  it('keeps a requested hold separate from confirmed release truth', () => {
    const pending = reduceNorthline(createNorthlineState(), {
      type: 'request-dispatch-hold',
      requestId: 'hold-1',
      loadId: 'NL-2048',
      requestedAt: '2026-08-12T16:44:00-07:00',
    });
    expect(selectLoad(pending, 'NL-2048')).toMatchObject({
      confirmedReleaseState: 'scheduled',
      requestedReleaseState: 'held',
      activity: 'pending',
    });

    const failed = reduceNorthline(pending, {
      type: 'resolve-dispatch-hold',
      requestId: 'hold-1',
      outcome: 'failed',
      completedAt: '2026-08-12T16:44:01-07:00',
    });
    expect(selectLoad(failed, 'NL-2048')).toMatchObject({
      confirmedReleaseState: 'scheduled',
      requestedReleaseState: null,
      activity: 'idle',
    });
    expect(failed.announcement?.message).toContain('remains scheduled');
  });

  it('confirms a hold only after the matching successful response', () => {
    const pending = reduceNorthline(createNorthlineState(), {
      type: 'request-dispatch-hold',
      requestId: 'hold-current',
      loadId: 'NL-2048',
      requestedAt: 'now',
    });
    expect(
      reduceNorthline(pending, {
        type: 'resolve-dispatch-hold',
        requestId: 'hold-old',
        outcome: 'succeeded',
        completedAt: 'later',
      }),
    ).toBe(pending);
    const held = reduceNorthline(pending, {
      type: 'resolve-dispatch-hold',
      requestId: 'hold-current',
      outcome: 'succeeded',
      completedAt: 'later',
    });
    expect(selectLoad(held, 'NL-2048')?.confirmedReleaseState).toBe('held');
  });

  it('filters and authors sorting without mutating the source records', () => {
    const state = reduceNorthline(createNorthlineState(), {
      type: 'set-dispatch-filter',
      value: 'needs-attention',
    });
    expect(selectDispatchLoads(state).map(({ id }) => id)).toEqual(['NL-2048']);
    expect(state.dispatch.loads).toHaveLength(3);
  });

  it('creates the accepted maximum load and retention bounds deterministically', () => {
    const state = createNorthlineState('steady', 'maximum');
    expect(state.dispatch.loads).toHaveLength(80);
    expect(state.retention).toEqual({ eventLimit: 250, retainedEventCount: 250 });
    expect(state).toEqual(createNorthlineState('steady', 'maximum'));
  });
});
