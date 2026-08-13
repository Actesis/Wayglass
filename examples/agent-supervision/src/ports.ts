export type MergeApprovalOutcome = 'merged' | 'denied' | 'timed-out' | 'merge-failed';

export interface MergeApprovalResult {
  requestId: string;
  outcome: MergeApprovalOutcome;
  completedAt: string;
}

export interface MergeApprovalPort {
  requestMergeApproval(input: {
    requestId: string;
    taskId: 'HL-317';
    repository: string;
    targetBranch: string;
    proposedRevision: string;
    expiresAt: string;
  }): Promise<MergeApprovalResult>;
}

export type HarborClock = () => string;
export type HarborScheduler = <T>(work: () => T) => Promise<T>;

export function createDeterministicMergeApprovalAdapter(options: {
  clock: HarborClock;
  scheduler: HarborScheduler;
  outcome: MergeApprovalOutcome;
}): MergeApprovalPort {
  return {
    requestMergeApproval: ({ requestId }) =>
      options.scheduler(() => ({
        requestId,
        outcome: options.outcome,
        completedAt: options.clock(),
      })),
  };
}

export interface ControlledScheduler {
  schedule: HarborScheduler;
  pendingCount(): number;
  resolveNext(): void;
}

export function createControlledScheduler(): ControlledScheduler {
  const queue: Array<() => void> = [];
  return {
    schedule: <T>(work: () => T) => new Promise<T>((resolve) => queue.push(() => resolve(work()))),
    pendingCount: () => queue.length,
    resolveNext: () => {
      const next = queue.shift();
      if (!next) throw new Error('No scheduled Harbor Lab work is pending.');
      next();
    },
  };
}
