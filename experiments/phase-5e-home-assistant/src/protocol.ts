import type { HomeAssistantStateChangedEvent, JsonValue } from './types.js';
import {
  HomeAssistantContractError,
  validateJsonValue,
  validateStateChangedEvent,
} from './validation.js';

export type AuthenticationMessage =
  | { readonly type: 'auth_required'; readonly ha_version: string }
  | { readonly type: 'auth_ok'; readonly ha_version: string }
  | { readonly type: 'auth_invalid'; readonly message: string };

export type ProviderCommand =
  | { readonly id: number; readonly type: 'get_states' }
  | {
      readonly id: number;
      readonly type: 'subscribe_events';
      readonly event_type: 'state_changed';
    }
  | {
      readonly id: number;
      readonly type: 'call_service';
      readonly domain: 'light';
      readonly service: 'turn_off' | 'turn_on';
      readonly target: { readonly entity_id: string };
    };

export type ProviderResultMessage =
  | {
      readonly id: number;
      readonly type: 'result';
      readonly success: true;
      readonly result: JsonValue;
    }
  | {
      readonly id: number;
      readonly type: 'result';
      readonly success: false;
      readonly error: { readonly code: string; readonly message: string };
    };

export interface ProviderEventMessage {
  readonly id: number;
  readonly type: 'event';
  readonly event: HomeAssistantStateChangedEvent;
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
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new HomeAssistantContractError(code, `expected keys ${wanted.join(', ')}`);
  }
}

function messageId(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 1) {
    throw new HomeAssistantContractError(
      'P5E_HA_MESSAGE_ID',
      'message id must be a positive integer',
    );
  }
  return value as number;
}

function boundedString(value: unknown, field: string, maximum: number): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > maximum) {
    throw new HomeAssistantContractError(
      'P5E_HA_MESSAGE_VALUE',
      `${field} must contain 1 to ${maximum} characters`,
    );
  }
  return value;
}

export function validateAuthenticationMessage(input: unknown): AuthenticationMessage {
  if (!plainRecord(input) || typeof input.type !== 'string') {
    throw new HomeAssistantContractError(
      'P5E_HA_AUTH_SHAPE',
      'authentication message must be a record',
    );
  }
  if (input.type === 'auth_required' || input.type === 'auth_ok') {
    exactKeys(input, ['ha_version', 'type'], 'P5E_HA_AUTH_KEYS');
    return Object.freeze({
      type: input.type,
      ha_version: boundedString(input.ha_version, 'ha_version', 64),
    });
  }
  if (input.type === 'auth_invalid') {
    exactKeys(input, ['message', 'type'], 'P5E_HA_AUTH_KEYS');
    return Object.freeze({
      type: 'auth_invalid',
      message: boundedString(input.message, 'message', 500),
    });
  }
  throw new HomeAssistantContractError('P5E_HA_AUTH_TYPE', 'authentication type is unsupported');
}

export function validateResultMessage(input: unknown): ProviderResultMessage {
  if (!plainRecord(input) || input.type !== 'result' || typeof input.success !== 'boolean') {
    throw new HomeAssistantContractError('P5E_HA_RESULT_SHAPE', 'result message is invalid');
  }
  const id = messageId(input.id);
  if (input.success) {
    exactKeys(input, ['id', 'result', 'success', 'type'], 'P5E_HA_RESULT_KEYS');
    return Object.freeze({
      id,
      type: 'result',
      success: true,
      result: validateJsonValue(input.result),
    });
  }
  exactKeys(input, ['error', 'id', 'success', 'type'], 'P5E_HA_RESULT_KEYS');
  if (!plainRecord(input.error)) {
    throw new HomeAssistantContractError('P5E_HA_RESULT_ERROR', 'result error must be a record');
  }
  exactKeys(input.error, ['code', 'message'], 'P5E_HA_RESULT_ERROR_KEYS');
  const code = boundedString(input.error.code, 'error.code', 64);
  if (!/^[a-z][a-z0-9_]{0,63}$/.test(code)) {
    throw new HomeAssistantContractError('P5E_HA_RESULT_ERROR_CODE', 'error code is invalid');
  }
  return Object.freeze({
    id,
    type: 'result',
    success: false,
    error: Object.freeze({
      code,
      message: boundedString(input.error.message, 'error.message', 500),
    }),
  });
}

export function validateEventMessage(input: unknown): ProviderEventMessage {
  if (!plainRecord(input)) {
    throw new HomeAssistantContractError('P5E_HA_WIRE_EVENT_SHAPE', 'event message is invalid');
  }
  exactKeys(input, ['event', 'id', 'type'], 'P5E_HA_WIRE_EVENT_KEYS');
  if (input.type !== 'event') {
    throw new HomeAssistantContractError('P5E_HA_WIRE_EVENT_TYPE', 'message must be an event');
  }
  return Object.freeze({
    id: messageId(input.id),
    type: 'event',
    event: validateStateChangedEvent(input.event),
  });
}

export function freezeCommand(command: ProviderCommand): ProviderCommand {
  if (command.type !== 'call_service') return Object.freeze({ ...command });
  return Object.freeze({ ...command, target: Object.freeze({ ...command.target }) });
}
