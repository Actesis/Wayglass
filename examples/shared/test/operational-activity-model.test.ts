import { describe, expect, it } from 'vitest';

import {
  createOperationalActivityState,
  operationalActivityFunctions,
  operationalActivityScenarios,
  receiveLiveUpdate,
  reduceOperationalActivity,
  selectDeliveryRecords,
  selectFunctionSummaries,
  selectIntakeEvents,
} from '../operational-activity-model.js';

describe('Operational Activity reference model', () => {
  it('creates one ordered, domain-neutral three-function workspace', () => {
    const state = createOperationalActivityState();

    expect(operationalActivityFunctions.map(({ value }) => value)).toEqual([
      'intake',
      'processing',
      'delivery',
    ]);
    expect(state.selectedFunction).toBe('intake');
    expect(state.announcement).toBeNull();
    expect(state.intake.events.map(({ key }) => key)).toHaveLength(
      new Set(state.intake.events.map(({ key }) => key)).size,
    );
    expect(state.delivery.records.map(({ key }) => key)).toHaveLength(
      new Set(state.delivery.records.map(({ key }) => key)).size,
    );
  });

  it('provides every accepted deterministic scenario without timers or random state', () => {
    expect(operationalActivityScenarios).toEqual([
      'steady',
      'initial-loading',
      'retained-refresh',
      'stale-partial',
      'unavailable',
      'filtered-empty',
      'failed-request',
      'recovered',
      'live-update',
    ]);

    for (const scenario of operationalActivityScenarios) {
      expect(createOperationalActivityState(scenario)).toEqual(
        createOperationalActivityState(scenario),
      );
    }
  });

  it('removes unconfirmed data during initial loading and retains it during refresh', () => {
    const loading = createOperationalActivityState('initial-loading');
    const refreshing = createOperationalActivityState('retained-refresh');

    expect(loading.intake.throughput).toBeNull();
    expect(loading.intake.events).toHaveLength(0);
    expect(loading.processing.metrics).toHaveLength(0);
    expect(loading.delivery.records).toHaveLength(0);
    expect(loading.processing.request.confirmedGateOpen).toBeNull();
    expect(Object.values(loading.presentation).every(({ retainedData }) => !retainedData)).toBe(
      true,
    );

    expect(refreshing.intake.events.length).toBeGreaterThan(0);
    expect(refreshing.processing.metrics.length).toBeGreaterThan(0);
    expect(refreshing.delivery.records.length).toBeGreaterThan(0);
    expect(Object.values(refreshing.presentation).every(({ busy }) => busy)).toBe(true);
    expect(Object.values(refreshing.presentation).every(({ retainedData }) => retainedData)).toBe(
      true,
    );
  });

  it('keeps draft filters separate until the application applies them', () => {
    const baseline = createOperationalActivityState();
    const edited = reduceOperationalActivity(baseline, {
      type: 'edit-delivery-filter',
      value: { query: 'Central destination', condition: 'caution' },
    });

    expect(selectDeliveryRecords(edited)).toHaveLength(4);
    expect(edited.delivery.filter.applied).toEqual({ query: '', condition: 'all' });

    const applied = reduceOperationalActivity(edited, { type: 'apply-delivery-filter' });
    expect(selectDeliveryRecords(applied).map(({ key }) => key)).toEqual(['delivery-1841']);
    expect(applied.announcement?.message).toBe('Delivery filters applied. 1 record shown.');
  });

  it('supports filtered-empty and reset without fabricating collection records', () => {
    const empty = createOperationalActivityState('filtered-empty');

    expect(selectIntakeEvents(empty)).toHaveLength(0);
    expect(selectDeliveryRecords(empty)).toHaveLength(0);
    expect(empty.intake.events.length).toBeGreaterThan(0);
    expect(empty.delivery.records.length).toBeGreaterThan(0);

    const reset = reduceOperationalActivity(empty, { type: 'reset-delivery-filter' });
    expect(selectDeliveryRecords(reset)).toHaveLength(empty.delivery.records.length);
    expect(reset.announcement?.message).toContain('filters cleared');
  });

  it('sorts retained delivery records without changing their identity or truth', () => {
    const baseline = createOperationalActivityState();
    const originalByKey = new Map(baseline.delivery.records.map((record) => [record.key, record]));
    const sorted = reduceOperationalActivity(baseline, {
      type: 'sort-delivery',
      value: 'updated-ascending',
    });
    const records = selectDeliveryRecords(sorted);

    expect(records.map(({ key }) => key)).toEqual([
      'delivery-1839',
      'delivery-1840',
      'delivery-1841',
      'delivery-1842',
    ]);
    for (const record of records) {
      expect(record).toBe(originalByKey.get(record.key));
    }
  });

  it('keeps requested Processing state separate from the confirmed gate', () => {
    const baseline = createOperationalActivityState();
    const pending = reduceOperationalActivity(baseline, { type: 'request-processing-pause' });

    expect(pending.processing.request.state).toBe('pending');
    expect(pending.processing.request.confirmedGateOpen).toBe(true);
    expect(pending.processing.request.message).toContain('remains open');

    const rejected = reduceOperationalActivity(pending, {
      type: 'resolve-processing-pause',
      outcome: 'rejected',
    });
    expect(rejected.processing.request.state).toBe('rejected');
    expect(rejected.processing.request.confirmedGateOpen).toBe(true);

    const accepted = reduceOperationalActivity(pending, {
      type: 'resolve-processing-pause',
      outcome: 'accepted',
    });
    expect(accepted.processing.request.state).toBe('accepted');
    expect(accepted.processing.request.confirmedGateOpen).toBe(false);
  });

  it('adds a live update once without creating an announcement', () => {
    const baseline = createOperationalActivityState();
    const updated = receiveLiveUpdate(baseline);
    const repeated = receiveLiveUpdate(updated);

    expect(updated.revision).toBe(1);
    expect(updated.intake.events[0]?.key).toBe('intake-event-105');
    expect(updated.delivery.records[0]?.key).toBe('delivery-1843');
    expect(updated.announcement).toBeNull();
    expect(repeated).toBe(updated);
  });

  it('preserves selection across scenario changes while resetting scenario-owned state', () => {
    const selected = reduceOperationalActivity(createOperationalActivityState(), {
      type: 'select-function',
      value: 'delivery',
    });
    const changed = reduceOperationalActivity(selected, {
      type: 'set-scenario',
      value: 'failed-request',
    });

    expect(changed.selectedFunction).toBe('delivery');
    expect(changed.scenario).toBe('failed-request');
    expect(changed.processing.request.state).toBe('rejected');
    expect(changed.announcement).toBeNull();
  });

  it('derives explicit hidden-state summaries and response paths', () => {
    const loading = createOperationalActivityState('initial-loading');
    const unavailable = createOperationalActivityState('unavailable');
    const failed = createOperationalActivityState('failed-request');
    const unavailableSummaries = selectFunctionSummaries(unavailable);
    const failedSummaries = selectFunctionSummaries(failed);

    expect(selectFunctionSummaries(loading)).toEqual([
      {
        value: 'intake',
        label: 'Intake',
        summary: 'Loading · No confirmed Intake values yet',
        consequential: false,
      },
      {
        value: 'processing',
        label: 'Processing',
        summary: 'Loading · Confirmed intake not yet available',
        consequential: false,
      },
      {
        value: 'delivery',
        label: 'Delivery',
        summary: 'Loading · No confirmed Delivery records yet',
        consequential: false,
      },
    ]);

    expect(unavailableSummaries.find(({ value }) => value === 'intake')).toMatchObject({
      consequential: true,
      responseLabel: 'Open Intake recovery',
    });
    expect(failedSummaries.find(({ value }) => value === 'processing')).toMatchObject({
      consequential: true,
      responseLabel: 'Open Processing response',
    });
    expect(failedSummaries.find(({ value }) => value === 'delivery')?.summary).toContain(
      'Critical',
    );
  });

  it('uses one replaceable deliberate announcement owner', () => {
    const filtered = reduceOperationalActivity(createOperationalActivityState(), {
      type: 'apply-intake-filter',
    });
    const sorted = reduceOperationalActivity(filtered, {
      type: 'sort-delivery',
      value: 'updated-ascending',
    });
    const cleared = reduceOperationalActivity(sorted, { type: 'clear-announcement' });

    expect(filtered.announcement?.message).toContain('Intake filters applied');
    expect(sorted.announcement?.message).toContain('sorted by oldest');
    expect(cleared.announcement).toBeNull();
  });
});
