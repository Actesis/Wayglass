export type DispatchHoldOutcome = 'succeeded' | 'failed' | 'denied';

export interface DispatchHoldResult {
  requestId: string;
  outcome: DispatchHoldOutcome;
  completedAt: string;
}

export interface DispatchHoldPort {
  requestDispatchHold(input: {
    requestId: string;
    loadId: string;
    confirmedReleaseState: 'scheduled';
  }): Promise<DispatchHoldResult>;
}

export type NorthlineClock = () => string;
export type NorthlineScheduler = <T>(work: () => T) => Promise<T>;

export function createDeterministicDispatchAdapter(options: {
  clock: NorthlineClock;
  scheduler: NorthlineScheduler;
  outcome: DispatchHoldOutcome;
}): DispatchHoldPort {
  return {
    requestDispatchHold: ({ requestId }) =>
      options.scheduler(() => ({
        requestId,
        outcome: options.outcome,
        completedAt: options.clock(),
      })),
  };
}

export interface ControlledScheduler {
  schedule: NorthlineScheduler;
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
      if (!next) throw new Error('No scheduled Northline work is pending.');
      next();
    },
  };
}
