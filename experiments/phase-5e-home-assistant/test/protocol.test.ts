import { describe, expect, it } from 'vitest';

import { providerState, stateChanged } from '../src/fixtures.js';
import {
  validateAuthenticationMessage,
  validateEventMessage,
  validateResultMessage,
} from '../src/protocol.js';

describe('Home Assistant projected wire envelopes', () => {
  it('accepts and freezes the three bounded authentication outcomes', () => {
    const required = validateAuthenticationMessage({
      type: 'auth_required',
      ha_version: '2026.8.0',
    });
    const ok = validateAuthenticationMessage({ type: 'auth_ok', ha_version: '2026.8.0' });
    const invalid = validateAuthenticationMessage({
      type: 'auth_invalid',
      message: 'Synthetic rejection',
    });

    expect([required.type, ok.type, invalid.type]).toEqual([
      'auth_required',
      'auth_ok',
      'auth_invalid',
    ]);
    expect(Object.isFrozen(required)).toBe(true);
    expect(() =>
      validateAuthenticationMessage({ type: 'auth_ok', ha_version: '2026.8.0', extra: true }),
    ).toThrow(/P5E_HA_AUTH_KEYS/);
  });

  it('validates correlated success and failure results without retaining arbitrary fields', () => {
    const success = validateResultMessage({ id: 3, type: 'result', success: true, result: null });
    const failure = validateResultMessage({
      id: 4,
      type: 'result',
      success: false,
      error: { code: 'unauthorized', message: 'Synthetic rejection' },
    });

    expect(success).toEqual({ id: 3, type: 'result', success: true, result: null });
    expect(failure).toMatchObject({ id: 4, success: false, error: { code: 'unauthorized' } });
    expect(() =>
      validateResultMessage({ id: 0, type: 'result', success: true, result: null }),
    ).toThrow(/P5E_HA_MESSAGE_ID/);
    expect(() =>
      validateResultMessage({
        id: 4,
        type: 'result',
        success: false,
        error: { code: 'Bad code', message: 'Synthetic rejection' },
      }),
    ).toThrow(/P5E_HA_RESULT_ERROR_CODE/);
  });

  it('validates the event correlation envelope around the projected state event', () => {
    const next = providerState('light.wayglass_porch', 'on', '2026-08-30T18:20:00Z');
    const message = validateEventMessage({
      id: 2,
      type: 'event',
      event: stateChanged(null, next, '2026-08-30T18:20:00Z'),
    });

    expect(message.id).toBe(2);
    expect(message.event.data.new_state?.state).toBe('on');
    expect(Object.isFrozen(message.event)).toBe(true);
    expect(() => validateEventMessage({ ...message, origin: 'LOCAL' })).toThrow(
      /P5E_HA_WIRE_EVENT_KEYS/,
    );
  });
});
