import type {
  HomeAssistantBinding,
  HomeAssistantState,
  HomeAssistantStateChangedEvent,
  JsonValue,
} from './types.js';

const entityIdPattern = /^[a-z0-9_]+\.[a-z0-9_]+$/;
const bindingKeyPattern = /^[a-z][a-z0-9-]*$/;
const isoTimestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const stateKeys = ['attributes', 'entity_id', 'last_changed', 'last_updated', 'state'] as const;
const eventKeys = ['data', 'event_type', 'time_fired'] as const;
const eventDataKeys = ['entity_id', 'new_state', 'old_state'] as const;

export class HomeAssistantContractError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = 'HomeAssistantContractError';
  }
}

function plainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value) as unknown;
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(
  record: Record<string, unknown>,
  expected: readonly string[],
  code: string,
): void {
  const actual = Object.keys(record).sort();
  const sortedExpected = [...expected].sort();
  if (
    actual.length !== sortedExpected.length ||
    actual.some((key, index) => key !== sortedExpected[index])
  ) {
    throw new HomeAssistantContractError(code, `expected keys ${sortedExpected.join(', ')}`);
  }
}

function timestamp(value: unknown, field: string): string {
  if (
    typeof value !== 'string' ||
    !isoTimestampPattern.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) {
    throw new HomeAssistantContractError('P5E_HA_TIMESTAMP', `${field} must be an ISO timestamp`);
  }
  return value;
}

function entityId(value: unknown): string {
  if (typeof value !== 'string' || !entityIdPattern.test(value)) {
    throw new HomeAssistantContractError('P5E_HA_ENTITY_ID', 'entity_id is invalid');
  }
  return value;
}

function jsonValue(value: unknown, depth = 0): JsonValue {
  if (depth > 8) {
    throw new HomeAssistantContractError('P5E_HA_ATTRIBUTE_DEPTH', 'attribute nesting exceeds 8');
  }
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new HomeAssistantContractError(
        'P5E_HA_ATTRIBUTE_NUMBER',
        'attribute number is not finite',
      );
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length > 128) {
      throw new HomeAssistantContractError(
        'P5E_HA_ATTRIBUTE_SIZE',
        'attribute array exceeds 128 items',
      );
    }
    return Object.freeze(value.map((item) => jsonValue(item, depth + 1)));
  }
  if (!plainRecord(value)) {
    throw new HomeAssistantContractError('P5E_HA_ATTRIBUTE_VALUE', 'attribute is not JSON data');
  }
  const entries = Object.entries(value);
  if (entries.length > 128) {
    throw new HomeAssistantContractError(
      'P5E_HA_ATTRIBUTE_SIZE',
      'attribute object exceeds 128 keys',
    );
  }
  return Object.freeze(
    Object.fromEntries(entries.map(([key, item]) => [key, jsonValue(item, depth + 1)])),
  );
}

export function validateBindings(input: unknown): readonly HomeAssistantBinding[] {
  if (!Array.isArray(input) || input.length === 0 || input.length > 500) {
    throw new HomeAssistantContractError(
      'P5E_HA_BINDINGS',
      'bindings must contain 1 to 500 records',
    );
  }
  const keys = new Set<string>();
  const entities = new Set<string>();
  return Object.freeze(
    input.map((candidate) => {
      if (!plainRecord(candidate)) {
        throw new HomeAssistantContractError('P5E_HA_BINDING_SHAPE', 'binding must be a record');
      }
      exactKeys(candidate, ['entityId', 'key'], 'P5E_HA_BINDING_KEYS');
      if (typeof candidate.key !== 'string' || !bindingKeyPattern.test(candidate.key)) {
        throw new HomeAssistantContractError('P5E_HA_BINDING_KEY', 'binding key is invalid');
      }
      const providerEntityId = entityId(candidate.entityId);
      if (keys.has(candidate.key) || entities.has(providerEntityId)) {
        throw new HomeAssistantContractError(
          'P5E_HA_BINDING_DUPLICATE',
          'binding identity is duplicated',
        );
      }
      keys.add(candidate.key);
      entities.add(providerEntityId);
      return Object.freeze({ key: candidate.key, entityId: providerEntityId });
    }),
  );
}

export function validateProviderState(input: unknown): HomeAssistantState {
  if (!plainRecord(input)) {
    throw new HomeAssistantContractError('P5E_HA_STATE_SHAPE', 'state must be a record');
  }
  exactKeys(input, stateKeys, 'P5E_HA_STATE_KEYS');
  if (typeof input.state !== 'string' || input.state.length === 0 || input.state.length > 255) {
    throw new HomeAssistantContractError('P5E_HA_STATE_VALUE', 'state must be a nonempty string');
  }
  if (!plainRecord(input.attributes)) {
    throw new HomeAssistantContractError('P5E_HA_ATTRIBUTES', 'attributes must be a record');
  }
  const lastChanged = timestamp(input.last_changed, 'last_changed');
  const lastUpdated = timestamp(input.last_updated, 'last_updated');
  if (Date.parse(lastUpdated) < Date.parse(lastChanged)) {
    throw new HomeAssistantContractError(
      'P5E_HA_STATE_ORDER',
      'last_updated precedes last_changed',
    );
  }
  return Object.freeze({
    entity_id: entityId(input.entity_id),
    state: input.state,
    attributes: jsonValue(input.attributes) as Readonly<Record<string, JsonValue>>,
    last_changed: lastChanged,
    last_updated: lastUpdated,
  });
}

export function validateSnapshot(input: unknown): readonly HomeAssistantState[] {
  if (!Array.isArray(input) || input.length > 500) {
    throw new HomeAssistantContractError(
      'P5E_HA_SNAPSHOT',
      'snapshot must contain at most 500 states',
    );
  }
  const seen = new Set<string>();
  return Object.freeze(
    input.map((candidate) => {
      const state = validateProviderState(candidate);
      if (seen.has(state.entity_id)) {
        throw new HomeAssistantContractError('P5E_HA_SNAPSHOT_DUPLICATE', state.entity_id);
      }
      seen.add(state.entity_id);
      return state;
    }),
  );
}

export function validateStateChangedEvent(input: unknown): HomeAssistantStateChangedEvent {
  if (!plainRecord(input)) {
    throw new HomeAssistantContractError('P5E_HA_EVENT_SHAPE', 'event must be a record');
  }
  exactKeys(input, eventKeys, 'P5E_HA_EVENT_KEYS');
  if (input.event_type !== 'state_changed' || !plainRecord(input.data)) {
    throw new HomeAssistantContractError('P5E_HA_EVENT_TYPE', 'event must be state_changed');
  }
  exactKeys(input.data, eventDataKeys, 'P5E_HA_EVENT_DATA_KEYS');
  const eventEntityId = entityId(input.data.entity_id);
  const oldState =
    input.data.old_state === null ? null : validateProviderState(input.data.old_state);
  const newState =
    input.data.new_state === null ? null : validateProviderState(input.data.new_state);
  if (oldState !== null && oldState.entity_id !== eventEntityId) {
    throw new HomeAssistantContractError('P5E_HA_EVENT_ENTITY', 'old_state entity does not match');
  }
  if (newState !== null && newState.entity_id !== eventEntityId) {
    throw new HomeAssistantContractError('P5E_HA_EVENT_ENTITY', 'new_state entity does not match');
  }
  return Object.freeze({
    event_type: 'state_changed',
    time_fired: timestamp(input.time_fired, 'time_fired'),
    data: Object.freeze({ entity_id: eventEntityId, old_state: oldState, new_state: newState }),
  });
}
