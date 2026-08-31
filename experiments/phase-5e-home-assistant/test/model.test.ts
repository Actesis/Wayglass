import { describe, expect, it } from 'vitest';

import {
  baselineSnapshot,
  providerState,
  stateChanged,
  syntheticBindings,
} from '../src/fixtures.js';
import {
  acknowledgeRequest,
  applySnapshot,
  applyStateChanged,
  beginRequest,
  bindingsOf,
  createIntegrationState,
  setConnection,
  timeoutRequest,
} from '../src/model.js';

describe('Home Assistant application-boundary model', () => {
  it('starts disconnected and unknown without inventing condition or values', () => {
    const state = createIntegrationState(syntheticBindings);

    expect(state.connection).toBe('disconnected');
    expect(bindingsOf(state)).toEqual(syntheticBindings);
    expect(Object.values(state.entities)).toHaveLength(4);
    expect(Object.values(state.entities).every(({ knowledge }) => knowledge === 'unknown')).toBe(
      true,
    );
    expect(Object.values(state.entities).every(({ reportedValue }) => reportedValue === null)).toBe(
      true,
    );
    expect(state.entities['porch-light']).not.toHaveProperty('condition');
    expect(Object.isFrozen(state.entities)).toBe(true);
  });

  it('applies the selected snapshot without interpreting domain values', () => {
    const state = applySnapshot(createIntegrationState(syntheticBindings), baselineSnapshot);

    expect(state.connection).toBe('connected');
    expect(state.entities['porch-light']).toMatchObject({
      reportedValue: 'off',
      knowledge: 'confirmed',
      activity: 'idle',
    });
    expect(state.entities['side-door']).toMatchObject({
      reportedValue: 'off',
      knowledge: 'confirmed',
    });
    expect(state.entities['hall-climate']?.reportedValue).toBe('cool');
    expect(state.entities['indoor-temperature']?.reportedValue).toBe('24');
  });

  it('maps unknown and unavailable to knowledge rather than Boolean false', () => {
    const snapshot = [
      providerState('light.wayglass_porch', 'unknown', '2026-08-30T18:01:00Z'),
      providerState('binary_sensor.wayglass_side_door', 'unavailable', '2026-08-30T18:01:01Z'),
    ];
    const state = applySnapshot(createIntegrationState(syntheticBindings), snapshot);

    expect(state.entities['porch-light']).toMatchObject({
      reportedValue: null,
      knowledge: 'unknown',
    });
    expect(state.entities['side-door']).toMatchObject({
      reportedValue: null,
      knowledge: 'unavailable',
    });
    expect(state.entities['hall-climate']?.knowledge).toBe('unknown');
  });

  it('ignores unselected, duplicate, and out-of-order updates', () => {
    const baseline = applySnapshot(createIntegrationState(syntheticBindings), baselineSnapshot);
    const unselected = applyStateChanged(
      baseline,
      stateChanged(
        null,
        providerState('sensor.wayglass_unselected', '1', '2026-08-30T18:02:00Z'),
        '2026-08-30T18:02:00Z',
      ),
    );
    const duplicate = applyStateChanged(
      baseline,
      stateChanged(
        baselineSnapshot[0]!,
        providerState('light.wayglass_porch', 'on', '2026-08-30T18:00:00Z'),
        '2026-08-30T18:03:00Z',
      ),
    );
    const older = applyStateChanged(
      baseline,
      stateChanged(
        baselineSnapshot[0]!,
        providerState('light.wayglass_porch', 'on', '2026-08-30T17:59:59Z'),
        '2026-08-30T18:03:00Z',
      ),
    );

    expect(unselected).toBe(baseline);
    expect(duplicate).toBe(baseline);
    expect(older).toBe(baseline);
  });

  it('applies a newer provider update and handles entity removal explicitly', () => {
    const baseline = applySnapshot(createIntegrationState(syntheticBindings), baselineSnapshot);
    const nextProvider = providerState('light.wayglass_porch', 'on', '2026-08-30T18:04:00Z');
    const updated = applyStateChanged(
      baseline,
      stateChanged(baselineSnapshot[0]!, nextProvider, '2026-08-30T18:04:00Z'),
    );
    const removed = applyStateChanged(
      updated,
      stateChanged(nextProvider, null, '2026-08-30T18:05:00Z'),
    );

    expect(updated.entities['porch-light']).toMatchObject({
      reportedValue: 'on',
      knowledge: 'confirmed',
    });
    expect(removed.entities['porch-light']).toMatchObject({
      reportedValue: null,
      knowledge: 'unknown',
      lastUpdated: '2026-08-30T18:05:00Z',
    });
  });

  it('does not let an older reconnect snapshot or removal replace newer retained truth', () => {
    const baseline = applySnapshot(createIntegrationState(syntheticBindings), baselineSnapshot);
    const newerProvider = providerState('light.wayglass_porch', 'on', '2026-08-30T18:06:00Z');
    const newer = applyStateChanged(
      baseline,
      stateChanged(baselineSnapshot[0]!, newerProvider, '2026-08-30T18:06:00Z'),
    );
    const olderSnapshot = applySnapshot(newer, baselineSnapshot);
    const olderRemoval = applyStateChanged(
      olderSnapshot,
      stateChanged(newerProvider, null, '2026-08-30T18:05:00Z'),
    );

    expect(olderSnapshot.entities['porch-light']?.reportedValue).toBe('on');
    expect(olderRemoval).toBe(olderSnapshot);
  });

  it('degrades confirmed knowledge on disconnect and does not fabricate recovery', () => {
    const connected = applySnapshot(createIntegrationState(syntheticBindings), baselineSnapshot);
    const disconnected = setConnection(connected, 'disconnected');
    const reconnected = setConnection(disconnected, 'connected');

    expect(disconnected.entities['porch-light']?.knowledge).toBe('stale');
    expect(disconnected.entities['porch-light']?.reportedValue).toBe('off');
    expect(reconnected.entities['porch-light']?.knowledge).toBe('stale');
    expect(setConnection(reconnected, 'connected')).toBe(reconnected);
  });
});

describe('Home Assistant request and confirmation separation', () => {
  function baseline() {
    return applySnapshot(createIntegrationState(syntheticBindings), baselineSnapshot);
  }

  it('keeps the last confirmed value while a request is pending and acknowledged', () => {
    const pending = beginRequest(baseline(), {
      key: 'porch-light',
      requestId: 'request-1',
      requestedValue: 'on',
      requestedAt: '2026-08-30T18:10:00Z',
    });
    const acknowledged = acknowledgeRequest(pending, {
      key: 'porch-light',
      requestId: 'request-1',
      success: true,
      acknowledgedAt: '2026-08-30T18:10:01Z',
    });

    expect(pending.entities['porch-light']).toMatchObject({
      reportedValue: 'off',
      activity: 'pending',
      request: { phase: 'pending', requestedValue: 'on' },
    });
    expect(acknowledged.entities['porch-light']).toMatchObject({
      reportedValue: 'off',
      activity: 'pending',
      request: { phase: 'acknowledged' },
    });
  });

  it('confirms only from a later matching provider state update', () => {
    const pending = beginRequest(baseline(), {
      key: 'porch-light',
      requestId: 'request-2',
      requestedValue: 'on',
      requestedAt: '2026-08-30T18:10:00Z',
    });
    const mismatch = applyStateChanged(
      pending,
      stateChanged(
        baselineSnapshot[0]!,
        providerState('light.wayglass_porch', 'off', '2026-08-30T18:10:02Z'),
        '2026-08-30T18:10:02Z',
      ),
    );
    const confirmed = applyStateChanged(
      mismatch,
      stateChanged(
        providerState('light.wayglass_porch', 'off', '2026-08-30T18:10:02Z'),
        providerState('light.wayglass_porch', 'on', '2026-08-30T18:10:03Z'),
        '2026-08-30T18:10:03Z',
      ),
    );

    expect(mismatch.entities['porch-light']?.request?.phase).toBe('pending');
    expect(confirmed.entities['porch-light']).toMatchObject({
      reportedValue: 'on',
      activity: 'idle',
      request: { phase: 'confirmed', completedAt: '2026-08-30T18:10:03Z' },
    });
  });

  it('retains confirmed truth after provider rejection or confirmation timeout', () => {
    const pending = beginRequest(baseline(), {
      key: 'porch-light',
      requestId: 'request-3',
      requestedValue: 'on',
      requestedAt: '2026-08-30T18:10:00Z',
    });
    const failed = acknowledgeRequest(pending, {
      key: 'porch-light',
      requestId: 'request-3',
      success: false,
      errorCode: 'unauthorized',
      acknowledgedAt: '2026-08-30T18:10:01Z',
    });
    const timedOut = timeoutRequest(
      beginRequest(baseline(), {
        key: 'porch-light',
        requestId: 'request-4',
        requestedValue: 'on',
        requestedAt: '2026-08-30T18:11:00Z',
      }),
      { key: 'porch-light', requestId: 'request-4', timedOutAt: '2026-08-30T18:11:10Z' },
    );

    expect(failed.entities['porch-light']).toMatchObject({
      reportedValue: 'off',
      activity: 'idle',
      request: { phase: 'failed', errorCode: 'unauthorized' },
    });
    expect(timedOut.entities['porch-light']).toMatchObject({
      reportedValue: 'off',
      activity: 'idle',
      request: { phase: 'timed-out', errorCode: 'confirmation-timeout' },
    });
  });

  it('ignores stale response identities and prevents overlapping requests', () => {
    const pending = beginRequest(baseline(), {
      key: 'porch-light',
      requestId: 'request-current',
      requestedValue: 'on',
      requestedAt: '2026-08-30T18:10:00Z',
    });
    expect(
      acknowledgeRequest(pending, {
        key: 'porch-light',
        requestId: 'request-old',
        success: true,
        acknowledgedAt: '2026-08-30T18:10:01Z',
      }),
    ).toBe(pending);
    expect(() =>
      beginRequest(pending, {
        key: 'porch-light',
        requestId: 'request-overlap',
        requestedValue: 'off',
        requestedAt: '2026-08-30T18:10:02Z',
      }),
    ).toThrow(/P5E_HA_REQUEST_ACTIVE/);
  });

  it('rejects acknowledgement and timeout timestamps before the request', () => {
    const pending = beginRequest(baseline(), {
      key: 'porch-light',
      requestId: 'request-ordered',
      requestedValue: 'on',
      requestedAt: '2026-08-30T18:10:00Z',
    });

    expect(() =>
      acknowledgeRequest(pending, {
        key: 'porch-light',
        requestId: 'request-ordered',
        success: true,
        acknowledgedAt: '2026-08-30T18:09:59Z',
      }),
    ).toThrow(/P5E_HA_REQUEST_ORDER/);
    expect(() =>
      timeoutRequest(pending, {
        key: 'porch-light',
        requestId: 'request-ordered',
        timedOutAt: '2026-08-30T18:09:59Z',
      }),
    ).toThrow(/P5E_HA_REQUEST_ORDER/);
  });
});
