import { describe, expect, it } from 'vitest';
import { createControlledScheduler, createDeterministicDispatchAdapter } from '../src/ports.js';

describe('Northline deterministic dispatch adapter', () => {
  it('resolves only when its controlled scheduler advances', async () => {
    const scheduler = createControlledScheduler();
    const adapter = createDeterministicDispatchAdapter({
      clock: () => '2026-08-12T16:45:00-07:00',
      scheduler: scheduler.schedule,
      outcome: 'failed',
    });
    const request = adapter.requestDispatchHold({
      requestId: 'hold-1',
      loadId: 'NL-2048',
      confirmedReleaseState: 'scheduled',
    });
    expect(scheduler.pendingCount()).toBe(1);
    scheduler.resolveNext();
    await expect(request).resolves.toEqual({
      requestId: 'hold-1',
      outcome: 'failed',
      completedAt: '2026-08-12T16:45:00-07:00',
    });
  });
});
