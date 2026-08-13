import { describe, expect, it } from 'vitest';

import {
  createNorthlineState,
  northlineScenarios,
  reduceNorthline,
  selectDispatchSummary,
  selectFunctionExceptions,
  selectLoadTimeline,
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
    expect(held.dispatch.holdRequest).toMatchObject({
      state: 'succeeded',
      message: 'NL-2048 is confirmed on dispatch hold.',
    });
  });

  it('provides a deterministic confirmed-hold scenario without implying temperature certainty', () => {
    const state = createNorthlineState('hold-confirmed');
    expect(selectLoad(state, 'NL-2048')).toMatchObject({
      confirmedReleaseState: 'held',
      condition: 'caution',
      trailerTemperature: { knowledge: 'stale' },
    });
    expect(state.dispatch.holdRequest.state).toBe('succeeded');
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

  it('derives overview, focused, and tabular dispatch facts from the same load records', () => {
    const state = createNorthlineState('stale-trailer');
    expect(selectDispatchSummary(state)).toEqual({
      scheduled: 2,
      held: 1,
      needsAttention: 1,
      unknownTemperature: 0,
      earliestCutoffAt: '2026-08-12T17:00:00-07:00',
    });
    expect(selectFunctionExceptions(state, 'dispatch')).toHaveLength(1);
    expect(selectDispatchLoads(state)[0]?.id).toBe('NL-2050');
    const identifierOrder = reduceNorthline(state, {
      type: 'set-dispatch-sort',
      value: 'load-id',
    });
    expect(selectDispatchLoads(identifierOrder)[0]?.id).toBe('NL-2048');
    expect(selectLoadTimeline(state, 'NL-2048')[0]).toMatchObject({
      id: 'NL-2048-temperature-current',
      knowledge: 'stale',
      occurredAt: '2026-08-12T16:42:00-07:00',
    });
  });

  it('preserves authored query state and acknowledged investigation through a new record', () => {
    let state = createNorthlineState('stale-trailer');
    state = reduceNorthline(state, { type: 'set-dispatch-filter', value: 'needs-attention' });
    state = reduceNorthline(state, { type: 'set-dispatch-sort', value: 'load-id' });
    state = reduceNorthline(state, {
      type: 'acknowledge-investigation',
      exceptionId: 'exception-nl-2048-temperature',
    });
    state = reduceNorthline(state, { type: 'receive-meaningful-update' });

    expect(state.dispatch).toMatchObject({ filter: 'needs-attention', sort: 'load-id' });
    expect(selectLoad(state, 'NL-2048')?.investigationAcknowledged).toBe(true);
    expect(state.exceptions.find(({ id }) => id === 'exception-nl-2048-temperature')).toMatchObject(
      {
        acknowledged: true,
      },
    );
    expect(state.exceptions[0]?.id).toBe('exception-nl-2051-door');
    expect(state.announcement).toBeNull();
  });
});
