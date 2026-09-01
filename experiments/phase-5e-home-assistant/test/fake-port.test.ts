import { describe, expect, it } from 'vitest';

import { DeterministicHomeAssistantPort } from '../src/fake-port.js';
import {
  baselineSnapshot,
  providerState,
  stateChanged,
  syntheticBindings,
} from '../src/fixtures.js';

const startAt = '2026-08-30T18:10:00Z';

function authenticatedPort(): DeterministicHomeAssistantPort {
  const port = new DeterministicHomeAssistantPort(syntheticBindings, startAt);
  port.connect();
  port.receiveAuthentication({ type: 'auth_required', ha_version: '2026.8.0' });
  port.receiveAuthentication({ type: 'auth_ok', ha_version: '2026.8.0' });
  const [snapshot, subscription] = port.takeOutgoing();
  expect(snapshot).toEqual({ id: 1, type: 'get_states' });
  expect(subscription).toEqual({ id: 2, type: 'subscribe_events', event_type: 'state_changed' });
  port.receiveResult({ id: 1, type: 'result', success: true, result: baselineSnapshot });
  port.receiveResult({ id: 2, type: 'result', success: true, result: null });
  expect(port.ready).toBe(true);
  return port;
}

describe('deterministic Home Assistant fake port', () => {
  it('models authentication and bootstraps snapshot plus state subscription', () => {
    const port = authenticatedPort();

    expect(port.status).toBe('authenticated');
    expect(port.state.connection).toBe('connected');
    expect(port.state.entities['porch-light']?.reportedValue).toBe('off');
    expect(port.logEntries().map(({ event }) => event)).toEqual([
      'connected',
      'authentication-required',
      'authentication-ok',
      'snapshot-applied',
      'subscription-active',
    ]);
  });

  it('blocks after an unauthorized outcome until application-owned reset', () => {
    const port = new DeterministicHomeAssistantPort(syntheticBindings, startAt);
    port.connect();
    port.receiveAuthentication({ type: 'auth_required', ha_version: '2026.8.0' });
    port.receiveAuthentication({ type: 'auth_invalid', message: 'Secret-like synthetic detail' });

    expect(port.status).toBe('blocked');
    expect(port.reconnect.dueAt).toBeNull();
    expect(() => port.connect()).toThrow(/P5E_HA_PORT_BLOCKED/);
    port.disconnect();
    expect(port.status).toBe('blocked');
    port.resetAuthenticationBlock();
    port.connect();
    expect(port.status).toBe('awaiting-auth');
  });

  it('rejects an authentication outcome before the provider requires authentication', () => {
    const port = new DeterministicHomeAssistantPort(syntheticBindings, startAt);
    port.connect();

    expect(() => port.receiveAuthentication({ type: 'auth_ok', ha_version: '2026.8.0' })).toThrow(
      /P5E_HA_PORT_AUTH_ORDER/,
    );
  });

  it('separates command acknowledgement from later provider effect', () => {
    const port = authenticatedPort();
    const dispatched = port.dispatchLightRequest({
      key: 'porch-light',
      requestId: 'request-one',
      requestedValue: 'on',
    });

    expect(dispatched).toMatchObject({
      deduplicated: false,
      command: {
        id: 3,
        type: 'call_service',
        domain: 'light',
        service: 'turn_on',
        target: { entity_id: 'light.wayglass_porch' },
      },
    });
    expect(port.state.entities['porch-light']).toMatchObject({
      reportedValue: 'off',
      request: { phase: 'pending' },
    });

    port.advanceBy(10);
    port.receiveResult({ id: 3, type: 'result', success: true, result: null });
    expect(port.state.entities['porch-light']).toMatchObject({
      reportedValue: 'off',
      request: { phase: 'acknowledged' },
    });

    const next = providerState('light.wayglass_porch', 'on', '2026-08-30T18:10:01Z');
    port.receiveEvent({
      id: 2,
      type: 'event',
      event: stateChanged(baselineSnapshot[0]!, next, '2026-08-30T18:10:01Z'),
    });
    expect(port.state.entities['porch-light']).toMatchObject({
      reportedValue: 'on',
      request: { phase: 'confirmed' },
    });
  });

  it('deduplicates request identities and rejects conflicting reuse', () => {
    const port = authenticatedPort();
    const first = port.dispatchLightRequest({
      key: 'porch-light',
      requestId: 'request-same',
      requestedValue: 'on',
    });
    const duplicate = port.dispatchLightRequest({
      key: 'porch-light',
      requestId: 'request-same',
      requestedValue: 'on',
    });

    expect(duplicate).toEqual({ command: first.command, deduplicated: true });
    expect(port.takeOutgoing()).toHaveLength(1);
    expect(() =>
      port.dispatchLightRequest({
        key: 'porch-light',
        requestId: 'request-same',
        requestedValue: 'off',
      }),
    ).toThrow(/P5E_HA_PORT_REQUEST_CONFLICT/);
  });

  it('retains confirmed truth on provider failure and ignores duplicate results', () => {
    const port = authenticatedPort();
    port.dispatchLightRequest({
      key: 'porch-light',
      requestId: 'request-failed',
      requestedValue: 'on',
    });
    const failure = {
      id: 3,
      type: 'result',
      success: false,
      error: { code: 'unauthorized', message: 'Synthetic rejection detail' },
    } as const;
    port.receiveResult(failure);
    port.receiveResult(failure);

    expect(port.state.entities['porch-light']).toMatchObject({
      reportedValue: 'off',
      request: { phase: 'failed', errorCode: 'unauthorized' },
    });
    expect(port.logEntries().at(-1)).toMatchObject({
      event: 'result-ignored',
      code: 'duplicate-result',
    });
  });

  it('cancels local correlation without pretending the provider command was recalled', () => {
    const port = authenticatedPort();
    port.dispatchLightRequest({
      key: 'porch-light',
      requestId: 'request-cancelled',
      requestedValue: 'on',
    });
    expect(port.cancelLightRequest('request-cancelled')).toBe(true);
    port.receiveResult({ id: 3, type: 'result', success: true, result: null });

    const next = providerState('light.wayglass_porch', 'on', '2026-08-30T18:10:01Z');
    port.receiveEvent({
      id: 2,
      type: 'event',
      event: stateChanged(baselineSnapshot[0]!, next, '2026-08-30T18:10:01Z'),
    });

    expect(port.state.entities['porch-light']).toMatchObject({
      reportedValue: 'on',
      activity: 'idle',
      request: { phase: 'cancelled', errorCode: 'request-cancelled' },
    });
  });

  it('uses bounded reconnect backoff and never retries a mutating command', () => {
    const port = authenticatedPort();
    port.dispatchLightRequest({
      key: 'porch-light',
      requestId: 'request-interrupted',
      requestedValue: 'on',
    });
    port.takeOutgoing();
    port.disconnect();

    expect(port.state.entities['porch-light']).toMatchObject({
      reportedValue: 'off',
      knowledge: 'stale',
      request: { phase: 'failed', errorCode: 'connection-lost' },
    });
    expect(port.takeOutgoing()).toEqual([]);
    expect(port.reconnect.dueAt).toBe('2026-08-30T18:10:00.100Z');
    expect(port.advanceBy(99)).toBe(false);
    expect(port.advanceBy(1)).toBe(true);
    expect(port.status).toBe('awaiting-auth');

    port.disconnect();
    expect(port.reconnect.dueAt).toBe('2026-08-30T18:10:00.300Z');
    expect(port.advanceBy(200)).toBe(true);
    port.disconnect();
    expect(port.advanceBy(400)).toBe(true);
    port.disconnect();
    expect(port.reconnect).toMatchObject({ attempt: 3, dueAt: null, exhausted: true });
  });

  it('deduplicates events while preserving out-of-order protection in the model', () => {
    const port = authenticatedPort();
    const newer = providerState('light.wayglass_porch', 'on', '2026-08-30T18:20:00Z');
    const newerMessage = {
      id: 2,
      type: 'event',
      event: stateChanged(baselineSnapshot[0]!, newer, '2026-08-30T18:20:00Z'),
    } as const;
    const older = providerState('light.wayglass_porch', 'off', '2026-08-30T18:19:00Z');

    port.receiveEvent(newerMessage);
    port.receiveEvent(newerMessage);
    port.receiveEvent({
      id: 2,
      type: 'event',
      event: stateChanged(older, older, '2026-08-30T18:21:00Z'),
    });

    expect(port.state.entities['porch-light']?.reportedValue).toBe('on');
    expect(port.logEntries().filter(({ event }) => event === 'event-ignored')).toHaveLength(2);
  });

  it('keeps logs bounded and excludes provider values, entity identities, and messages', () => {
    const port = new DeterministicHomeAssistantPort(syntheticBindings, startAt);
    port.connect();
    port.receiveAuthentication({ type: 'auth_required', ha_version: '2026.8.0' });
    port.receiveAuthentication({
      type: 'auth_invalid',
      message: 'Sensitive synthetic provider detail that must not be retained',
    });
    const authenticationLog = JSON.stringify(port.logEntries());
    for (let id = 10; id < 310; id += 1) {
      port.receiveResult({ id, type: 'result', success: true, result: null });
    }
    const serialized = JSON.stringify(port.logEntries());

    expect(serialized).not.toContain('light.wayglass_porch');
    expect(serialized).not.toContain('Sensitive synthetic provider detail');
    expect(serialized).not.toContain('2026.8.0');
    expect(authenticationLog).toContain('unauthorized');
    expect(port.logEntries()).toHaveLength(200);
    expect(Object.isFrozen(port.logEntries())).toBe(true);
  });
});
