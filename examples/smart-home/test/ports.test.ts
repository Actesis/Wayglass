import { describe, expect, it } from 'vitest';

import { createControlledScheduler, createDeterministicHouseholdAdapter } from '../src/ports.js';

describe('Cedar House deterministic adapter', () => {
  it('does not resolve controlled work until the test scheduler advances it', async () => {
    const scheduler = createControlledScheduler();
    const adapter = createDeterministicHouseholdAdapter({
      clock: () => '2026-08-12T18:40:00-07:00',
      scheduler: scheduler.schedule,
      porchLightOutcome: 'failed',
      secureHouseOutcome: 'partial',
    });

    const request = adapter.requestPorchLight({ requestId: 'porch-1', requestedOn: true });
    expect(scheduler.pendingCount()).toBe(1);
    scheduler.resolveNext();

    await expect(request).resolves.toEqual({
      requestId: 'porch-1',
      outcome: 'failed',
      completedAt: '2026-08-12T18:40:00-07:00',
    });
  });

  it('keeps the secure-house result domain-specific', async () => {
    const adapter = createDeterministicHouseholdAdapter({
      clock: () => '2026-08-12T18:40:00-07:00',
      scheduler: async (work) => work(),
      porchLightOutcome: 'succeeded',
      secureHouseOutcome: 'denied',
    });

    await expect(
      adapter.requestSecureHouse({
        requestId: 'secure-1',
        targetIds: ['front-door-lock', 'garage-door'],
      }),
    ).resolves.toMatchObject({ requestId: 'secure-1', outcome: 'denied' });
  });
});
