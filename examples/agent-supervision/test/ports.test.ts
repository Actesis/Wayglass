import { describe, expect, it } from 'vitest';
import {
  createControlledScheduler,
  createDeterministicMergeApprovalAdapter,
} from '../src/ports.js';

describe('Harbor Lab deterministic merge approval adapter', () => {
  it('resolves only when its controlled scheduler advances', async () => {
    const scheduler = createControlledScheduler();
    const adapter = createDeterministicMergeApprovalAdapter({
      clock: () => '2026-08-13T14:28:00-07:00',
      scheduler: scheduler.schedule,
      outcome: 'merge-failed',
    });
    const request = adapter.requestMergeApproval({
      requestId: 'approval-1',
      taskId: 'HL-317',
      repository: 'harbor-lab/dependency-sentinel',
      targetBranch: 'main',
      proposedRevision: 'deps/harbor-client-4.8.2',
      expiresAt: '2026-08-13T14:33:00-07:00',
    });
    expect(scheduler.pendingCount()).toBe(1);
    scheduler.resolveNext();
    await expect(request).resolves.toEqual({
      requestId: 'approval-1',
      outcome: 'merge-failed',
      completedAt: '2026-08-13T14:28:00-07:00',
    });
  });
});
