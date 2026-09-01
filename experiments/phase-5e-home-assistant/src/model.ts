import type {
  HomeAssistantBinding,
  HomeAssistantIntegrationState,
  HomeAssistantState,
  HomeAssistantStateChangedEvent,
  ProviderEntityRecord,
  ProviderKnowledge,
  ProviderRequest,
} from './types.js';
import {
  HomeAssistantContractError,
  validateBindings,
  validateSnapshot,
  validateStateChangedEvent,
} from './validation.js';

const emptyAttributes = Object.freeze({});

function validTimestamp(value: string, field: string): string {
  if (!Number.isFinite(Date.parse(value))) {
    throw new HomeAssistantContractError('P5E_HA_TIMESTAMP', `${field} must be an ISO timestamp`);
  }
  return value;
}

function freezeRequest(request: ProviderRequest | null): ProviderRequest | null {
  return request === null ? null : Object.freeze({ ...request });
}

function freezeEntity(entity: ProviderEntityRecord): ProviderEntityRecord {
  return Object.freeze({ ...entity, request: freezeRequest(entity.request) });
}

function freezeState(
  connection: HomeAssistantIntegrationState['connection'],
  entities: Record<string, ProviderEntityRecord>,
): HomeAssistantIntegrationState {
  return Object.freeze({
    connection,
    entities: Object.freeze(
      Object.fromEntries(
        Object.entries(entities).map(([key, entity]) => [key, freezeEntity(entity)]),
      ),
    ),
  });
}

function knowledge(state: HomeAssistantState): ProviderKnowledge {
  if (state.state === 'unknown') return 'unknown';
  if (state.state === 'unavailable') return 'unavailable';
  return 'confirmed';
}

function reportedValue(state: HomeAssistantState): string | null {
  return state.state === 'unknown' || state.state === 'unavailable' ? null : state.state;
}

function findByEntityId(
  state: HomeAssistantIntegrationState,
  providerEntityId: string,
): ProviderEntityRecord | undefined {
  return Object.values(state.entities).find(({ entityId }) => entityId === providerEntityId);
}

function replaceEntity(
  state: HomeAssistantIntegrationState,
  entity: ProviderEntityRecord,
): HomeAssistantIntegrationState {
  return freezeState(state.connection, { ...state.entities, [entity.key]: entity });
}

function activeRequest(request: ProviderRequest | null | undefined): request is ProviderRequest {
  return request?.phase === 'pending' || request?.phase === 'acknowledged';
}

function completeRequest(
  state: HomeAssistantIntegrationState,
  input: {
    readonly key: string;
    readonly requestId: string;
    readonly completedAt: string;
    readonly phase: 'cancelled' | 'failed';
    readonly errorCode: string;
  },
): HomeAssistantIntegrationState {
  const entity = state.entities[input.key];
  const request = entity?.request;
  if (entity === undefined || !activeRequest(request) || request.id !== input.requestId)
    return state;
  const completedAt = validTimestamp(input.completedAt, 'completedAt');
  if (Date.parse(completedAt) < Date.parse(request.requestedAt)) {
    throw new HomeAssistantContractError('P5E_HA_REQUEST_ORDER', 'completion precedes request');
  }
  return replaceEntity(state, {
    ...entity,
    activity: 'idle',
    request: {
      ...request,
      phase: input.phase,
      completedAt,
      errorCode: input.errorCode,
    },
  });
}

function recordFromProvider(
  current: ProviderEntityRecord,
  provider: HomeAssistantState,
): ProviderEntityRecord {
  let request = current.request;
  if (
    activeRequest(request) &&
    Date.parse(provider.last_updated) >= Date.parse(request.requestedAt) &&
    reportedValue(provider) === request.requestedValue
  ) {
    request = {
      ...request,
      phase: 'confirmed',
      completedAt: provider.last_updated,
      errorCode: null,
    };
  }
  return {
    ...current,
    reportedValue: reportedValue(provider),
    attributes: provider.attributes,
    knowledge: knowledge(provider),
    activity: activeRequest(request) ? 'pending' : 'idle',
    lastChanged: provider.last_changed,
    lastUpdated: provider.last_updated,
    request,
  };
}

export function createIntegrationState(input: unknown): HomeAssistantIntegrationState {
  const bindings = validateBindings(input);
  return freezeState(
    'disconnected',
    Object.fromEntries(
      bindings.map(({ key, entityId }) => [
        key,
        {
          key,
          entityId,
          reportedValue: null,
          attributes: emptyAttributes,
          knowledge: 'unknown',
          activity: 'idle',
          lastChanged: null,
          lastUpdated: null,
          request: null,
        },
      ]),
    ),
  );
}

export function applySnapshot(
  state: HomeAssistantIntegrationState,
  input: unknown,
): HomeAssistantIntegrationState {
  const snapshot = validateSnapshot(input);
  const byEntityId = new Map(snapshot.map((provider) => [provider.entity_id, provider]));
  const entities = Object.fromEntries(
    Object.entries(state.entities).map(([key, current]) => {
      const provider = byEntityId.get(current.entityId);
      return [
        key,
        provider === undefined
          ? { ...current, knowledge: 'unknown' as const }
          : current.lastUpdated !== null &&
              Date.parse(provider.last_updated) < Date.parse(current.lastUpdated)
            ? current
            : recordFromProvider(current, provider),
      ];
    }),
  );
  return freezeState('connected', entities);
}

export function applyStateChanged(
  state: HomeAssistantIntegrationState,
  input: unknown,
): HomeAssistantIntegrationState {
  const event: HomeAssistantStateChangedEvent = validateStateChangedEvent(input);
  const current = findByEntityId(state, event.data.entity_id);
  if (current === undefined) return state;
  if (event.data.new_state === null) {
    if (
      current.lastUpdated !== null &&
      Date.parse(event.time_fired) <= Date.parse(current.lastUpdated)
    )
      return state;
    if (current.knowledge === 'unknown' && current.reportedValue === null) return state;
    return replaceEntity(state, {
      ...current,
      reportedValue: null,
      knowledge: 'unknown',
      lastUpdated: event.time_fired,
    });
  }
  if (
    current.lastUpdated !== null &&
    Date.parse(event.data.new_state.last_updated) <= Date.parse(current.lastUpdated)
  ) {
    return state;
  }
  return replaceEntity(state, recordFromProvider(current, event.data.new_state));
}

export function setConnection(
  state: HomeAssistantIntegrationState,
  connection: HomeAssistantIntegrationState['connection'],
): HomeAssistantIntegrationState {
  if (state.connection === connection) return state;
  if (connection === 'connected') return freezeState(connection, { ...state.entities });
  return freezeState(
    connection,
    Object.fromEntries(
      Object.entries(state.entities).map(([key, entity]) => [
        key,
        entity.knowledge === 'confirmed' ? { ...entity, knowledge: 'stale' as const } : entity,
      ]),
    ),
  );
}

export function beginRequest(
  state: HomeAssistantIntegrationState,
  input: {
    readonly key: string;
    readonly requestId: string;
    readonly requestedValue: string;
    readonly requestedAt: string;
  },
): HomeAssistantIntegrationState {
  const entity = state.entities[input.key];
  if (entity === undefined) {
    throw new HomeAssistantContractError('P5E_HA_REQUEST_ENTITY', input.key);
  }
  if (activeRequest(entity.request)) {
    throw new HomeAssistantContractError('P5E_HA_REQUEST_ACTIVE', input.key);
  }
  if (input.requestId.length === 0 || input.requestedValue.length === 0) {
    throw new HomeAssistantContractError(
      'P5E_HA_REQUEST_VALUE',
      'request identity and value are required',
    );
  }
  const request: ProviderRequest = {
    id: input.requestId,
    requestedValue: input.requestedValue,
    phase: 'pending',
    requestedAt: validTimestamp(input.requestedAt, 'requestedAt'),
    acknowledgedAt: null,
    completedAt: null,
    errorCode: null,
  };
  return replaceEntity(state, { ...entity, activity: 'pending', request });
}

export function acknowledgeRequest(
  state: HomeAssistantIntegrationState,
  input: {
    readonly key: string;
    readonly requestId: string;
    readonly acknowledgedAt: string;
    readonly success: boolean;
    readonly errorCode?: string;
  },
): HomeAssistantIntegrationState {
  const entity = state.entities[input.key];
  const request = entity?.request;
  if (
    entity === undefined ||
    request === null ||
    request === undefined ||
    request.id !== input.requestId
  )
    return state;
  if (
    request.phase === 'confirmed' ||
    request.phase === 'failed' ||
    request.phase === 'timed-out'
  ) {
    return state;
  }
  const acknowledgedAt = validTimestamp(input.acknowledgedAt, 'acknowledgedAt');
  if (Date.parse(acknowledgedAt) < Date.parse(request.requestedAt)) {
    throw new HomeAssistantContractError(
      'P5E_HA_REQUEST_ORDER',
      'acknowledgement precedes request',
    );
  }
  const nextRequest: ProviderRequest = input.success
    ? { ...request, phase: 'acknowledged', acknowledgedAt }
    : {
        ...request,
        phase: 'failed',
        acknowledgedAt,
        completedAt: acknowledgedAt,
        errorCode: input.errorCode?.trim() || 'provider-rejected',
      };
  return replaceEntity(state, {
    ...entity,
    activity: input.success ? 'pending' : 'idle',
    request: nextRequest,
  });
}

export function timeoutRequest(
  state: HomeAssistantIntegrationState,
  input: { readonly key: string; readonly requestId: string; readonly timedOutAt: string },
): HomeAssistantIntegrationState {
  const entity = state.entities[input.key];
  const request = entity?.request;
  if (entity === undefined || !activeRequest(request) || request.id !== input.requestId)
    return state;
  const timedOutAt = validTimestamp(input.timedOutAt, 'timedOutAt');
  if (Date.parse(timedOutAt) < Date.parse(request.requestedAt)) {
    throw new HomeAssistantContractError('P5E_HA_REQUEST_ORDER', 'timeout precedes request');
  }
  return replaceEntity(state, {
    ...entity,
    activity: 'idle',
    request: {
      ...request,
      phase: 'timed-out',
      completedAt: timedOutAt,
      errorCode: 'confirmation-timeout',
    },
  });
}

export function cancelRequest(
  state: HomeAssistantIntegrationState,
  input: { readonly key: string; readonly requestId: string; readonly cancelledAt: string },
): HomeAssistantIntegrationState {
  return completeRequest(state, {
    key: input.key,
    requestId: input.requestId,
    completedAt: input.cancelledAt,
    phase: 'cancelled',
    errorCode: 'request-cancelled',
  });
}

export function failRequest(
  state: HomeAssistantIntegrationState,
  input: {
    readonly key: string;
    readonly requestId: string;
    readonly failedAt: string;
    readonly errorCode: string;
  },
): HomeAssistantIntegrationState {
  const errorCode = input.errorCode.trim();
  if (!/^[a-z][a-z0-9-]{0,63}$/.test(errorCode)) {
    throw new HomeAssistantContractError('P5E_HA_REQUEST_ERROR', 'error code is invalid');
  }
  return completeRequest(state, {
    key: input.key,
    requestId: input.requestId,
    completedAt: input.failedAt,
    phase: 'failed',
    errorCode,
  });
}

export function bindingsOf(state: HomeAssistantIntegrationState): readonly HomeAssistantBinding[] {
  return Object.freeze(
    Object.values(state.entities).map(({ key, entityId }) => Object.freeze({ key, entityId })),
  );
}
