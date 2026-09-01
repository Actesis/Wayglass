import type {
  HomeAssistantState,
  HomeAssistantStateChangedEvent,
  JsonValue,
  ProviderKnowledge,
} from './types.js';

export interface DirectRecord {
  readonly reportedValue: string | null;
  readonly attributes: Readonly<Record<string, JsonValue>>;
  readonly knowledge: ProviderKnowledge;
  readonly lastUpdated: string | null;
}

export interface DirectLightRequest {
  readonly id: string;
  readonly requestedValue: 'off' | 'on';
  readonly requestedAt: string;
  readonly phase: 'acknowledged' | 'confirmed' | 'failed' | 'pending';
}

export interface DirectApplicationState {
  readonly porchLight: DirectRecord;
  readonly sideDoor: DirectRecord;
  readonly hallClimate: DirectRecord;
  readonly indoorTemperature: DirectRecord;
  readonly lightRequest: DirectLightRequest | null;
}

const emptyAttributes = Object.freeze({});

function emptyRecord(): DirectRecord {
  return Object.freeze({
    reportedValue: null,
    attributes: emptyAttributes,
    knowledge: 'unknown',
    lastUpdated: null,
  });
}

function project(current: DirectRecord, provider: HomeAssistantState): DirectRecord {
  if (
    current.lastUpdated !== null &&
    Date.parse(provider.last_updated) <= Date.parse(current.lastUpdated)
  ) {
    return current;
  }
  const missing = provider.state === 'unknown' || provider.state === 'unavailable';
  return Object.freeze({
    reportedValue: missing ? null : provider.state,
    attributes: provider.attributes,
    knowledge:
      provider.state === 'unknown'
        ? 'unknown'
        : provider.state === 'unavailable'
          ? 'unavailable'
          : 'confirmed',
    lastUpdated: provider.last_updated,
  });
}

function replace(
  state: DirectApplicationState,
  key: Exclude<keyof DirectApplicationState, 'lightRequest'>,
  provider: HomeAssistantState | null,
  removedAt: string,
): DirectApplicationState {
  const current = state[key];
  if (provider === null) {
    if (current.lastUpdated !== null && Date.parse(removedAt) <= Date.parse(current.lastUpdated)) {
      return state;
    }
    return Object.freeze({
      ...state,
      [key]: Object.freeze({
        ...current,
        reportedValue: null,
        knowledge: 'unknown',
        lastUpdated: removedAt,
      }),
    });
  }
  const next = project(current, provider);
  if (next === current) return state;
  let lightRequest = state.lightRequest;
  if (
    key === 'porchLight' &&
    lightRequest !== null &&
    (lightRequest.phase === 'pending' || lightRequest.phase === 'acknowledged') &&
    Date.parse(provider.last_updated) >= Date.parse(lightRequest.requestedAt) &&
    provider.state === lightRequest.requestedValue
  ) {
    lightRequest = Object.freeze({ ...lightRequest, phase: 'confirmed' });
  }
  return Object.freeze({ ...state, [key]: next, lightRequest });
}

export function createDirectApplicationState(): DirectApplicationState {
  return Object.freeze({
    porchLight: emptyRecord(),
    sideDoor: emptyRecord(),
    hallClimate: emptyRecord(),
    indoorTemperature: emptyRecord(),
    lightRequest: null,
  });
}

export function applyDirectSnapshot(
  state: DirectApplicationState,
  snapshot: readonly HomeAssistantState[],
): DirectApplicationState {
  let next = state;
  const porchLight = snapshot.find(({ entity_id }) => entity_id === 'light.wayglass_porch');
  const sideDoor = snapshot.find(
    ({ entity_id }) => entity_id === 'binary_sensor.wayglass_side_door',
  );
  const hallClimate = snapshot.find(({ entity_id }) => entity_id === 'climate.wayglass_hall');
  const indoorTemperature = snapshot.find(
    ({ entity_id }) => entity_id === 'sensor.wayglass_indoor_temperature',
  );
  if (porchLight !== undefined)
    next = replace(next, 'porchLight', porchLight, porchLight.last_updated);
  if (sideDoor !== undefined) next = replace(next, 'sideDoor', sideDoor, sideDoor.last_updated);
  if (hallClimate !== undefined)
    next = replace(next, 'hallClimate', hallClimate, hallClimate.last_updated);
  if (indoorTemperature !== undefined)
    next = replace(next, 'indoorTemperature', indoorTemperature, indoorTemperature.last_updated);
  return next;
}

export function applyDirectEvent(
  state: DirectApplicationState,
  event: HomeAssistantStateChangedEvent,
): DirectApplicationState {
  const key =
    event.data.entity_id === 'light.wayglass_porch'
      ? 'porchLight'
      : event.data.entity_id === 'binary_sensor.wayglass_side_door'
        ? 'sideDoor'
        : event.data.entity_id === 'climate.wayglass_hall'
          ? 'hallClimate'
          : event.data.entity_id === 'sensor.wayglass_indoor_temperature'
            ? 'indoorTemperature'
            : null;
  return key === null ? state : replace(state, key, event.data.new_state, event.time_fired);
}

export function beginDirectLightRequest(
  state: DirectApplicationState,
  request: Omit<DirectLightRequest, 'phase'>,
): DirectApplicationState {
  if (state.lightRequest?.phase === 'pending' || state.lightRequest?.phase === 'acknowledged') {
    throw new Error('DIRECT_REQUEST_ACTIVE');
  }
  return Object.freeze({
    ...state,
    lightRequest: Object.freeze({ ...request, phase: 'pending' }),
  });
}

export function acknowledgeDirectLightRequest(
  state: DirectApplicationState,
  requestId: string,
  success: boolean,
): DirectApplicationState {
  if (state.lightRequest?.id !== requestId || state.lightRequest.phase !== 'pending') return state;
  return Object.freeze({
    ...state,
    lightRequest: Object.freeze({
      ...state.lightRequest,
      phase: success ? 'acknowledged' : 'failed',
    }),
  });
}
