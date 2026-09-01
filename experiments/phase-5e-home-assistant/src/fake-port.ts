import {
  acknowledgeRequest,
  applySnapshot,
  applyStateChanged,
  beginRequest,
  cancelRequest,
  createIntegrationState,
  failRequest,
  setConnection,
} from './model.js';
import {
  freezeCommand,
  validateAuthenticationMessage,
  validateEventMessage,
  validateResultMessage,
  type AuthenticationMessage,
  type ProviderCommand,
} from './protocol.js';
import type { HomeAssistantBinding, HomeAssistantIntegrationState } from './types.js';
import { HomeAssistantContractError, validateSnapshot } from './validation.js';

export type FakePortStatus = 'disconnected' | 'awaiting-auth' | 'authenticated' | 'blocked';

export type FakePortLogEvent =
  | 'authentication-invalid'
  | 'authentication-ok'
  | 'authentication-required'
  | 'bootstrap-failed'
  | 'command-acknowledged'
  | 'command-cancelled'
  | 'command-deduplicated'
  | 'command-failed'
  | 'command-sent'
  | 'connected'
  | 'disconnected'
  | 'event-applied'
  | 'event-ignored'
  | 'reconnect-attempt'
  | 'reconnect-exhausted'
  | 'reconnect-scheduled'
  | 'result-ignored'
  | 'snapshot-applied'
  | 'subscription-active';

export interface FakePortLogEntry {
  readonly at: string;
  readonly event: FakePortLogEvent;
  readonly status: FakePortStatus;
  readonly commandId: number | null;
  readonly requestId: string | null;
  readonly code: string | null;
}

interface PendingSnapshot {
  readonly kind: 'snapshot';
}

interface PendingSubscription {
  readonly kind: 'subscription';
}

interface PendingService {
  readonly kind: 'service';
  readonly key: string;
  readonly requestId: string;
}

type PendingCommand = PendingService | PendingSnapshot | PendingSubscription;
type WithoutId<T> = T extends unknown ? Omit<T, 'id'> : never;
type ProviderCommandInput = WithoutId<ProviderCommand>;

interface ServiceRecord {
  readonly command: ProviderCommand & { readonly type: 'call_service' };
  readonly key: string;
  readonly requestId: string;
}

const reconnectBackoffMs = Object.freeze([100, 200, 400]);
const maximumRememberedIds = 256;
const maximumLogEntries = 200;
const requestIdPattern = /^[a-z][a-z0-9-]{0,63}$/;

function freezeLog(entry: FakePortLogEntry): FakePortLogEntry {
  return Object.freeze({ ...entry });
}

export class DeterministicHomeAssistantPort {
  #clock: number;
  #status: FakePortStatus = 'disconnected';
  #integration: HomeAssistantIntegrationState;
  #nextCommandId = 1;
  #outgoing: ProviderCommand[] = [];
  #pending = new Map<number, PendingCommand>();
  #completedIds = new Set<number>();
  #completedOrder: number[] = [];
  #seenEvents = new Set<string>();
  #seenEventOrder: string[] = [];
  #services = new Map<string, ServiceRecord>();
  #serviceOrder: string[] = [];
  #subscriptionId: number | null = null;
  #snapshotApplied = false;
  #authenticationRequired = false;
  #reconnectAttempt = 0;
  #reconnectDueAt: number | null = null;
  #logs: FakePortLogEntry[] = [];

  constructor(bindings: unknown, startAt: string) {
    this.#clock = Date.parse(startAt);
    if (!Number.isFinite(this.#clock)) {
      throw new HomeAssistantContractError('P5E_HA_PORT_CLOCK', 'startAt must be a timestamp');
    }
    this.#integration = createIntegrationState(bindings);
  }

  get status(): FakePortStatus {
    return this.#status;
  }

  get state(): HomeAssistantIntegrationState {
    return this.#integration;
  }

  get ready(): boolean {
    return (
      this.#status === 'authenticated' && this.#snapshotApplied && this.#subscriptionId !== null
    );
  }

  get reconnect(): Readonly<{
    attempt: number;
    dueAt: string | null;
    exhausted: boolean;
  }> {
    return Object.freeze({
      attempt: this.#reconnectAttempt,
      dueAt: this.#reconnectDueAt === null ? null : new Date(this.#reconnectDueAt).toISOString(),
      exhausted:
        this.#status === 'disconnected' &&
        this.#reconnectDueAt === null &&
        this.#reconnectAttempt >= reconnectBackoffMs.length,
    });
  }

  connect(): void {
    if (this.#status === 'blocked') {
      throw new HomeAssistantContractError(
        'P5E_HA_PORT_BLOCKED',
        'authentication must be reset before reconnecting',
      );
    }
    if (this.#status !== 'disconnected') return;
    this.#reconnectDueAt = null;
    this.#status = 'awaiting-auth';
    this.#authenticationRequired = false;
    this.#log('connected');
  }

  resetAuthenticationBlock(): void {
    if (this.#status !== 'blocked') return;
    this.#status = 'disconnected';
    this.#reconnectAttempt = 0;
    this.#reconnectDueAt = null;
  }

  receiveAuthentication(input: unknown): AuthenticationMessage {
    const message = validateAuthenticationMessage(input);
    if (this.#status !== 'awaiting-auth') {
      throw new HomeAssistantContractError(
        'P5E_HA_PORT_AUTH_PHASE',
        'authentication message arrived outside authentication',
      );
    }
    if (message.type === 'auth_required') {
      this.#authenticationRequired = true;
      this.#log('authentication-required');
      return message;
    }
    if (!this.#authenticationRequired) {
      throw new HomeAssistantContractError(
        'P5E_HA_PORT_AUTH_ORDER',
        'authentication outcome precedes auth_required',
      );
    }
    if (message.type === 'auth_invalid') {
      this.#status = 'blocked';
      this.#integration = setConnection(this.#integration, 'disconnected');
      this.#clearSession();
      this.#reconnectDueAt = null;
      this.#log('authentication-invalid', null, null, 'unauthorized');
      return message;
    }

    this.#status = 'authenticated';
    this.#integration = setConnection(this.#integration, 'connected');
    this.#reconnectAttempt = 0;
    this.#reconnectDueAt = null;
    this.#log('authentication-ok');
    this.#enqueue({ type: 'get_states' }, { kind: 'snapshot' });
    this.#enqueue(
      { type: 'subscribe_events', event_type: 'state_changed' },
      { kind: 'subscription' },
    );
    return message;
  }

  takeOutgoing(): readonly ProviderCommand[] {
    const outgoing = Object.freeze([...this.#outgoing]);
    this.#outgoing = [];
    return outgoing;
  }

  dispatchLightRequest(input: {
    readonly key: string;
    readonly requestId: string;
    readonly requestedValue: 'off' | 'on';
  }): Readonly<{ command: ProviderCommand; deduplicated: boolean }> {
    if (!this.ready) {
      throw new HomeAssistantContractError('P5E_HA_PORT_NOT_READY', 'port is not ready');
    }
    if (!requestIdPattern.test(input.requestId)) {
      throw new HomeAssistantContractError('P5E_HA_PORT_REQUEST_ID', 'request id is invalid');
    }
    const existing = this.#services.get(input.requestId);
    if (existing !== undefined) {
      if (
        existing.key !== input.key ||
        existing.command.service !== `turn_${input.requestedValue}`
      ) {
        throw new HomeAssistantContractError(
          'P5E_HA_PORT_REQUEST_CONFLICT',
          'request id was reused with different intent',
        );
      }
      this.#log(
        'command-deduplicated',
        existing.command.id,
        existing.requestId,
        'duplicate-request',
      );
      return Object.freeze({ command: existing.command, deduplicated: true });
    }
    const entity = this.#integration.entities[input.key];
    if (entity === undefined || !entity.entityId.startsWith('light.')) {
      throw new HomeAssistantContractError(
        'P5E_HA_PORT_LIGHT_BINDING',
        'request must target the selected light binding',
      );
    }
    this.#integration = beginRequest(this.#integration, {
      key: input.key,
      requestId: input.requestId,
      requestedValue: input.requestedValue,
      requestedAt: this.#now(),
    });
    const command = this.#enqueue(
      {
        type: 'call_service',
        domain: 'light',
        service: input.requestedValue === 'on' ? 'turn_on' : 'turn_off',
        target: { entity_id: entity.entityId },
      },
      { kind: 'service', key: input.key, requestId: input.requestId },
    ) as ProviderCommand & { readonly type: 'call_service' };
    this.#rememberService(input.requestId, {
      command,
      key: input.key,
      requestId: input.requestId,
    });
    this.#log('command-sent', command.id, input.requestId);
    return Object.freeze({ command, deduplicated: false });
  }

  cancelLightRequest(requestId: string): boolean {
    const service = this.#services.get(requestId);
    if (service === undefined) return false;
    const pending = this.#pending.get(service.command.id);
    if (pending?.kind !== 'service') return false;
    this.#pending.delete(service.command.id);
    this.#rememberCompleted(service.command.id);
    this.#integration = cancelRequest(this.#integration, {
      key: service.key,
      requestId,
      cancelledAt: this.#now(),
    });
    this.#log('command-cancelled', service.command.id, requestId, 'request-cancelled');
    return true;
  }

  receiveResult(input: unknown): void {
    const message = validateResultMessage(input);
    if (this.#completedIds.has(message.id)) {
      this.#log('result-ignored', message.id, null, 'duplicate-result');
      return;
    }
    const pending = this.#pending.get(message.id);
    if (pending === undefined) {
      this.#log('result-ignored', message.id, null, 'unknown-result');
      return;
    }

    if (!message.success) {
      if (pending.kind === 'service') {
        this.#integration = acknowledgeRequest(this.#integration, {
          key: pending.key,
          requestId: pending.requestId,
          acknowledgedAt: this.#now(),
          success: false,
          errorCode: message.error.code,
        });
        this.#log('command-failed', message.id, pending.requestId, message.error.code);
      } else {
        this.#log('bootstrap-failed', message.id, null, message.error.code);
      }
      this.#finish(message.id);
      return;
    }

    if (pending.kind === 'snapshot') {
      this.#integration = applySnapshot(this.#integration, validateSnapshot(message.result));
      this.#snapshotApplied = true;
      this.#log('snapshot-applied', message.id);
    } else if (pending.kind === 'subscription') {
      if (message.result !== null) {
        throw new HomeAssistantContractError(
          'P5E_HA_PORT_SUBSCRIPTION_RESULT',
          'subscription result must be null',
        );
      }
      this.#subscriptionId = message.id;
      this.#log('subscription-active', message.id);
    } else {
      this.#integration = acknowledgeRequest(this.#integration, {
        key: pending.key,
        requestId: pending.requestId,
        acknowledgedAt: this.#now(),
        success: true,
      });
      this.#log('command-acknowledged', message.id, pending.requestId);
    }
    this.#finish(message.id);
  }

  receiveEvent(input: unknown): void {
    const message = validateEventMessage(input);
    if (message.id !== this.#subscriptionId) {
      this.#log('event-ignored', message.id, null, 'inactive-subscription');
      return;
    }
    const event = message.event;
    const fingerprint = [
      message.id,
      event.time_fired,
      event.data.entity_id,
      event.data.new_state?.last_updated ?? 'removed',
      event.data.new_state?.state ?? 'removed',
    ].join('|');
    if (this.#seenEvents.has(fingerprint)) {
      this.#log('event-ignored', message.id, null, 'duplicate-event');
      return;
    }
    this.#rememberEvent(fingerprint);
    const previous = this.#integration;
    this.#integration = applyStateChanged(previous, event);
    this.#log(this.#integration === previous ? 'event-ignored' : 'event-applied', message.id);
  }

  disconnect(code = 'connection-lost'): void {
    if (!/^[a-z][a-z0-9-]{0,63}$/.test(code)) {
      throw new HomeAssistantContractError('P5E_HA_PORT_DISCONNECT_CODE', 'code is invalid');
    }
    if (this.#status === 'blocked') return;
    if (this.#status === 'disconnected') return;
    for (const [commandId, pending] of this.#pending) {
      if (pending.kind === 'service') {
        this.#integration = failRequest(this.#integration, {
          key: pending.key,
          requestId: pending.requestId,
          failedAt: this.#now(),
          errorCode: code,
        });
        this.#rememberCompleted(commandId);
      }
    }
    this.#status = 'disconnected';
    this.#integration = setConnection(this.#integration, 'disconnected');
    this.#clearSession();
    this.#log('disconnected', null, null, code);
    this.#scheduleReconnect();
  }

  advanceBy(milliseconds: number): boolean {
    if (!Number.isSafeInteger(milliseconds) || milliseconds < 0) {
      throw new HomeAssistantContractError(
        'P5E_HA_PORT_ADVANCE',
        'advance must be a non-negative integer',
      );
    }
    this.#clock += milliseconds;
    if (
      this.#status !== 'disconnected' ||
      this.#reconnectDueAt === null ||
      this.#clock < this.#reconnectDueAt
    ) {
      return false;
    }
    this.#reconnectDueAt = null;
    this.#reconnectAttempt += 1;
    this.#status = 'awaiting-auth';
    this.#authenticationRequired = false;
    this.#log('reconnect-attempt', null, null, `attempt-${this.#reconnectAttempt}`);
    return true;
  }

  logEntries(): readonly FakePortLogEntry[] {
    return Object.freeze(this.#logs.map((entry) => freezeLog(entry)));
  }

  bindings(): readonly HomeAssistantBinding[] {
    return Object.freeze(
      Object.values(this.#integration.entities).map(({ key, entityId }) =>
        Object.freeze({ key, entityId }),
      ),
    );
  }

  #enqueue(command: ProviderCommandInput, pending: PendingCommand): ProviderCommand {
    const complete = freezeCommand({ ...command, id: this.#nextCommandId } as ProviderCommand);
    this.#nextCommandId += 1;
    this.#pending.set(complete.id, pending);
    this.#outgoing.push(complete);
    return complete;
  }

  #finish(commandId: number): void {
    this.#pending.delete(commandId);
    this.#rememberCompleted(commandId);
  }

  #rememberCompleted(commandId: number): void {
    if (this.#completedIds.has(commandId)) return;
    this.#completedIds.add(commandId);
    this.#completedOrder.push(commandId);
    if (this.#completedOrder.length > maximumRememberedIds) {
      this.#completedIds.delete(this.#completedOrder.shift()!);
    }
  }

  #rememberEvent(fingerprint: string): void {
    this.#seenEvents.add(fingerprint);
    this.#seenEventOrder.push(fingerprint);
    if (this.#seenEventOrder.length > maximumRememberedIds) {
      this.#seenEvents.delete(this.#seenEventOrder.shift()!);
    }
  }

  #rememberService(requestId: string, service: ServiceRecord): void {
    this.#services.set(requestId, service);
    this.#serviceOrder.push(requestId);
    if (this.#serviceOrder.length > maximumRememberedIds) {
      this.#services.delete(this.#serviceOrder.shift()!);
    }
  }

  #clearSession(): void {
    this.#pending.clear();
    this.#outgoing = [];
    this.#subscriptionId = null;
    this.#snapshotApplied = false;
    this.#authenticationRequired = false;
  }

  #scheduleReconnect(): void {
    const delay = reconnectBackoffMs[this.#reconnectAttempt];
    if (delay === undefined) {
      this.#reconnectDueAt = null;
      this.#log('reconnect-exhausted', null, null, 'attempt-limit');
      return;
    }
    this.#reconnectDueAt = this.#clock + delay;
    this.#log('reconnect-scheduled', null, null, `delay-${delay}`);
  }

  #now(): string {
    return new Date(this.#clock).toISOString();
  }

  #log(
    event: FakePortLogEvent,
    commandId: number | null = null,
    requestId: string | null = null,
    code: string | null = null,
  ): void {
    this.#logs.push(
      freezeLog({ at: this.#now(), event, status: this.#status, commandId, requestId, code }),
    );
    if (this.#logs.length > maximumLogEntries) this.#logs.shift();
  }
}
