import type {
  HomeAssistantBinding,
  HomeAssistantState,
  HomeAssistantStateChangedEvent,
  JsonValue,
} from './types.js';

export const syntheticBindings = Object.freeze([
  { key: 'porch-light', entityId: 'light.wayglass_porch' },
  { key: 'side-door', entityId: 'binary_sensor.wayglass_side_door' },
  { key: 'hall-climate', entityId: 'climate.wayglass_hall' },
  { key: 'indoor-temperature', entityId: 'sensor.wayglass_indoor_temperature' },
] satisfies readonly HomeAssistantBinding[]);

export function providerState(
  entityId: string,
  state: string,
  lastUpdated: string,
  attributes: Readonly<Record<string, JsonValue>> = {},
  lastChanged = lastUpdated,
): HomeAssistantState {
  return {
    entity_id: entityId,
    state,
    attributes,
    last_changed: lastChanged,
    last_updated: lastUpdated,
  };
}

export const baselineSnapshot = Object.freeze([
  providerState('light.wayglass_porch', 'off', '2026-08-30T18:00:00Z', {
    friendly_name: 'Synthetic porch light',
    brightness: null,
  }),
  providerState('binary_sensor.wayglass_side_door', 'off', '2026-08-30T18:00:01Z', {
    friendly_name: 'Synthetic side door',
    device_class: 'door',
  }),
  providerState('climate.wayglass_hall', 'cool', '2026-08-30T18:00:02Z', {
    friendly_name: 'Synthetic hall climate',
    current_temperature: 24,
    temperature: 23,
  }),
  providerState('sensor.wayglass_indoor_temperature', '24', '2026-08-30T18:00:03Z', {
    friendly_name: 'Synthetic indoor temperature',
    unit_of_measurement: '°C',
  }),
]);

export function stateChanged(
  oldState: HomeAssistantState | null,
  newState: HomeAssistantState | null,
  timeFired: string,
): HomeAssistantStateChangedEvent {
  const entityId = newState?.entity_id ?? oldState?.entity_id;
  if (entityId === undefined) throw new Error('A state_changed fixture needs an entity.');
  return {
    event_type: 'state_changed',
    time_fired: timeFired,
    data: { entity_id: entityId, old_state: oldState, new_state: newState },
  };
}
