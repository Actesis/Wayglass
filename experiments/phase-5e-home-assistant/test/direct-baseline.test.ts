import { describe, expect, it } from 'vitest';

import {
  acknowledgeDirectLightRequest,
  applyDirectEvent,
  applyDirectSnapshot,
  beginDirectLightRequest,
  createDirectApplicationState,
} from '../src/direct-baseline.js';
import { baselineSnapshot, providerState, stateChanged } from '../src/fixtures.js';
import {
  acknowledgeRequest,
  applySnapshot,
  applyStateChanged,
  beginRequest,
  createIntegrationState,
} from '../src/model.js';
import { syntheticBindings } from '../src/fixtures.js';

describe('direct application-owned comparison baseline', () => {
  it('can preserve the four valid values and request/effect separation with local code', () => {
    let state = applyDirectSnapshot(createDirectApplicationState(), baselineSnapshot);
    state = beginDirectLightRequest(state, {
      id: 'direct-one',
      requestedValue: 'on',
      requestedAt: '2026-08-30T18:10:00Z',
    });
    state = acknowledgeDirectLightRequest(state, 'direct-one', true);

    expect(state.porchLight.reportedValue).toBe('off');
    expect(state.lightRequest?.phase).toBe('acknowledged');

    const next = providerState('light.wayglass_porch', 'on', '2026-08-30T18:10:01Z');
    state = applyDirectEvent(
      state,
      stateChanged(baselineSnapshot[0]!, next, '2026-08-30T18:10:01Z'),
    );
    expect(state.porchLight.reportedValue).toBe('on');
    expect(state.lightRequest?.phase).toBe('confirmed');
  });

  it('requires repeated entity selection and trusts runtime input that the candidate rejects', () => {
    const malformed = {
      ...baselineSnapshot[0]!,
      last_changed: 'not-a-timestamp',
      last_updated: 'not-a-timestamp',
    };
    const direct = applyDirectSnapshot(createDirectApplicationState(), [malformed]);

    expect(direct.porchLight.lastUpdated).toBe('not-a-timestamp');
    expect(() => applySnapshot(createIntegrationState(syntheticBindings), [malformed])).toThrow(
      /P5E_HA_TIMESTAMP/,
    );
  });

  it('matches candidate behavior for a valid acknowledged and confirmed request', () => {
    let candidate = applySnapshot(createIntegrationState(syntheticBindings), baselineSnapshot);
    candidate = beginRequest(candidate, {
      key: 'porch-light',
      requestId: 'candidate-one',
      requestedValue: 'on',
      requestedAt: '2026-08-30T18:10:00Z',
    });
    candidate = acknowledgeRequest(candidate, {
      key: 'porch-light',
      requestId: 'candidate-one',
      acknowledgedAt: '2026-08-30T18:10:00.100Z',
      success: true,
    });
    candidate = applyStateChanged(
      candidate,
      stateChanged(
        baselineSnapshot[0]!,
        providerState('light.wayglass_porch', 'on', '2026-08-30T18:10:01Z'),
        '2026-08-30T18:10:01Z',
      ),
    );

    expect(candidate.entities['porch-light']).toMatchObject({
      reportedValue: 'on',
      request: { phase: 'confirmed' },
    });
  });

  it('matches candidate behavior when a selected entity is removed', () => {
    const removed = stateChanged(baselineSnapshot[1]!, null, '2026-08-30T18:11:00Z');
    const direct = applyDirectEvent(
      applyDirectSnapshot(createDirectApplicationState(), baselineSnapshot),
      removed,
    );
    const candidate = applyStateChanged(
      applySnapshot(createIntegrationState(syntheticBindings), baselineSnapshot),
      removed,
    );

    expect(direct.sideDoor).toMatchObject({
      reportedValue: null,
      knowledge: 'unknown',
    });
    expect(candidate.entities['side-door']).toMatchObject({
      reportedValue: null,
      knowledge: 'unknown',
    });
  });
});
