import { describe, expect, it } from 'vitest';

import { baselineSnapshot, providerState, syntheticBindings } from '../src/fixtures.js';
import {
  HomeAssistantContractError,
  validateBindings,
  validateProviderState,
  validateSnapshot,
  validateStateChangedEvent,
} from '../src/validation.js';

function expectCode(action: () => unknown, code: string): void {
  expect(action).toThrowError(
    expect.objectContaining<Partial<HomeAssistantContractError>>({ code }),
  );
}

describe('Home Assistant fixture contract', () => {
  it('accepts immutable bindings and the exact four-entity snapshot', () => {
    const bindings = validateBindings(structuredClone(syntheticBindings));
    const snapshot = validateSnapshot(structuredClone(baselineSnapshot));

    expect(bindings).toEqual(syntheticBindings);
    expect(snapshot).toEqual(baselineSnapshot);
    expect(Object.isFrozen(bindings)).toBe(true);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot[0]?.attributes)).toBe(true);
  });

  it('rejects unknown state fields and malformed entity identities', () => {
    const extra = { ...baselineSnapshot[0], context: {} };
    expectCode(() => validateProviderState(extra), 'P5E_HA_STATE_KEYS');
    expectCode(
      () => validateProviderState({ ...baselineSnapshot[0], entity_id: 'Porch light' }),
      'P5E_HA_ENTITY_ID',
    );
  });

  it('rejects invalid or reversed timestamps', () => {
    expectCode(
      () => validateProviderState({ ...baselineSnapshot[0], last_updated: 'not-a-date' }),
      'P5E_HA_TIMESTAMP',
    );
    expectCode(
      () => validateProviderState({ ...baselineSnapshot[0], last_updated: 'August 30, 2026' }),
      'P5E_HA_TIMESTAMP',
    );
    expectCode(
      () =>
        validateProviderState({
          ...baselineSnapshot[0],
          last_changed: '2026-08-30T18:01:00Z',
          last_updated: '2026-08-30T18:00:00Z',
        }),
      'P5E_HA_STATE_ORDER',
    );
  });

  it('rejects non-JSON and unbounded attributes', () => {
    expectCode(
      () => validateProviderState({ ...baselineSnapshot[0], attributes: { value: undefined } }),
      'P5E_HA_ATTRIBUTE_VALUE',
    );
    expectCode(
      () =>
        validateProviderState({
          ...baselineSnapshot[0],
          attributes: { values: Array.from({ length: 129 }, (_, index) => index) },
        }),
      'P5E_HA_ATTRIBUTE_SIZE',
    );
  });

  it('rejects duplicate bindings and snapshot entities', () => {
    expectCode(
      () => validateBindings([...syntheticBindings, syntheticBindings[0]]),
      'P5E_HA_BINDING_DUPLICATE',
    );
    expectCode(
      () => validateSnapshot([...baselineSnapshot, baselineSnapshot[0]]),
      'P5E_HA_SNAPSHOT_DUPLICATE',
    );
  });

  it('validates a closed state_changed event envelope', () => {
    const oldState = providerState('light.wayglass_porch', 'off', '2026-08-30T18:00:00Z');
    const newState = providerState('light.wayglass_porch', 'on', '2026-08-30T18:01:00Z');
    const event = validateStateChangedEvent({
      event_type: 'state_changed',
      time_fired: '2026-08-30T18:01:00Z',
      data: { entity_id: 'light.wayglass_porch', old_state: oldState, new_state: newState },
    });

    expect(event.data.new_state?.state).toBe('on');
    expect(Object.isFrozen(event.data)).toBe(true);
    expectCode(() => validateStateChangedEvent({ ...event, origin: 'LOCAL' }), 'P5E_HA_EVENT_KEYS');
    expectCode(
      () =>
        validateStateChangedEvent({
          ...event,
          data: { ...event.data, entity_id: 'light.other' },
        }),
      'P5E_HA_EVENT_ENTITY',
    );
  });
});
