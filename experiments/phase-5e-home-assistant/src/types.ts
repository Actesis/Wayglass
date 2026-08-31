export type JsonPrimitive = boolean | number | string | null;
export type JsonArray = readonly JsonValue[];
export type JsonObject = {
  readonly [key: string]: JsonValue;
};
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

export interface HomeAssistantBinding {
  readonly key: string;
  readonly entityId: string;
}

export interface HomeAssistantState {
  readonly entity_id: string;
  readonly state: string;
  readonly attributes: Readonly<Record<string, JsonValue>>;
  readonly last_changed: string;
  readonly last_updated: string;
}

export interface HomeAssistantStateChangedEvent {
  readonly event_type: 'state_changed';
  readonly time_fired: string;
  readonly data: {
    readonly entity_id: string;
    readonly old_state: HomeAssistantState | null;
    readonly new_state: HomeAssistantState | null;
  };
}

export type ProviderConnection = 'connected' | 'disconnected';
export type ProviderKnowledge = 'confirmed' | 'stale' | 'unknown' | 'unavailable';
export type ProviderActivity = 'idle' | 'pending';
export type ProviderRequestPhase =
  'pending' | 'acknowledged' | 'confirmed' | 'failed' | 'timed-out';

export interface ProviderRequest {
  readonly id: string;
  readonly requestedValue: string;
  readonly phase: ProviderRequestPhase;
  readonly requestedAt: string;
  readonly acknowledgedAt: string | null;
  readonly completedAt: string | null;
  readonly errorCode: string | null;
}

export interface ProviderEntityRecord {
  readonly key: string;
  readonly entityId: string;
  readonly reportedValue: string | null;
  readonly attributes: Readonly<Record<string, JsonValue>>;
  readonly knowledge: ProviderKnowledge;
  readonly activity: ProviderActivity;
  readonly lastChanged: string | null;
  readonly lastUpdated: string | null;
  readonly request: ProviderRequest | null;
}

export interface HomeAssistantIntegrationState {
  readonly connection: ProviderConnection;
  readonly entities: Readonly<Record<string, ProviderEntityRecord>>;
}
