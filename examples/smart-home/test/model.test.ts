import { describe, expect, it } from 'vitest';

import {
  cedarScenarios,
  createCedarHouseState,
  reduceCedarHouse,
  selectPorchLight,
  selectUnsettledReasons,
} from '../src/model.js';

describe('Cedar House application state', () => {
  it('creates every scenario deterministically with independent state axes', () => {
    for (const scenario of cedarScenarios) {
      expect(createCedarHouseState(scenario)).toEqual(createCedarHouseState(scenario));
    }

    const state = createCedarHouseState();
    expect(state.maintenance.filterDue).toBe(true);
    expect(state.maintenance.airHandlerAvailable).toBe(true);
    expect(state.access.points[0]).toMatchObject({ asserted: true, condition: 'neutral' });
    expect(createCedarHouseState('initial-loading').presentation.comfort).toMatchObject({
      dataState: 'loading',
      retainedData: false,
    });
    expect(createCedarHouseState('retained-refresh').presentation.comfort).toMatchObject({
      dataState: 'refreshing',
      retainedData: true,
    });
  });

  it('keeps requested porch-light value separate from confirmed truth', () => {
    const pending = reduceCedarHouse(createCedarHouseState(), {
      type: 'request-porch-light',
      requestedOn: true,
      requestId: 'porch-1',
      requestedAt: '2026-08-12T18:35:00-07:00',
    });
    expect(selectPorchLight(pending)).toMatchObject({ confirmedOn: false, requestedOn: true });

    const failed = reduceCedarHouse(pending, {
      type: 'resolve-porch-light',
      requestId: 'porch-1',
      outcome: 'failed',
      completedAt: '2026-08-12T18:35:01-07:00',
    });
    expect(selectPorchLight(failed)).toMatchObject({ confirmedOn: false, requestedOn: null });
    expect(failed.announcement?.message).toContain('remains off');
  });

  it('retains per-target truth after partial secure-house completion', () => {
    const baseline = createCedarHouseState('secure-partial');
    const pending = reduceCedarHouse(baseline, {
      type: 'request-secure-house',
      requestId: 'secure-1',
      requestedAt: '2026-08-12T18:35:00-07:00',
    });
    const partial = reduceCedarHouse(pending, {
      type: 'resolve-secure-house',
      requestId: 'secure-1',
      outcome: 'partial',
      completedAt: '2026-08-12T18:35:02-07:00',
    });

    expect(partial.access.points.find(({ id }) => id === 'front-door-lock')?.asserted).toBe(true);
    expect(partial.access.points.find(({ id }) => id === 'garage-door')?.asserted).toBe(false);
    expect(selectUnsettledReasons(partial)).toContain('Garage door is open');
  });

  it('ignores a stale response with the wrong request identity', () => {
    const pending = reduceCedarHouse(createCedarHouseState(), {
      type: 'request-porch-light',
      requestedOn: true,
      requestId: 'porch-current',
      requestedAt: '2026-08-12T18:35:00-07:00',
    });
    const stale = reduceCedarHouse(pending, {
      type: 'resolve-porch-light',
      requestId: 'porch-old',
      outcome: 'succeeded',
      completedAt: '2026-08-12T18:35:01-07:00',
    });

    expect(stale).toBe(pending);
  });

  it('applies a meaningful update once without announcing ordinary data', () => {
    const baseline = createCedarHouseState();
    const updated = reduceCedarHouse(baseline, { type: 'receive-meaningful-update' });
    const repeated = reduceCedarHouse(updated, { type: 'receive-meaningful-update' });

    expect(updated.energy.currentWatts).toBe(1425);
    expect(updated.announcement).toBeNull();
    expect(repeated).toBe(updated);
  });
});
