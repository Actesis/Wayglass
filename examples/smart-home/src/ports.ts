export type PorchLightOutcome = 'succeeded' | 'failed';
export type SecureHouseOutcome = 'succeeded' | 'partial' | 'failed' | 'denied';

export interface HouseholdControlResult<TOutcome extends string> {
  requestId: string;
  outcome: TOutcome;
  completedAt: string;
}

export interface HouseholdControlPort {
  requestPorchLight(input: {
    requestId: string;
    requestedOn: boolean;
  }): Promise<HouseholdControlResult<PorchLightOutcome>>;
  requestSecureHouse(input: {
    requestId: string;
    targetIds: readonly string[];
  }): Promise<HouseholdControlResult<SecureHouseOutcome>>;
}

export type CedarClock = () => string;
export type CedarScheduler = <T>(work: () => T) => Promise<T>;

export function createDeterministicHouseholdAdapter(options: {
  clock: CedarClock;
  scheduler: CedarScheduler;
  porchLightOutcome: PorchLightOutcome;
  secureHouseOutcome: SecureHouseOutcome;
}): HouseholdControlPort {
  return {
    requestPorchLight: ({ requestId }) =>
      options.scheduler(() => ({
        requestId,
        outcome: options.porchLightOutcome,
        completedAt: options.clock(),
      })),
    requestSecureHouse: ({ requestId }) =>
      options.scheduler(() => ({
        requestId,
        outcome: options.secureHouseOutcome,
        completedAt: options.clock(),
      })),
  };
}

export interface ControlledScheduler {
  schedule: CedarScheduler;
  pendingCount(): number;
  resolveNext(): void;
}

export function createControlledScheduler(): ControlledScheduler {
  const queue: Array<() => void> = [];
  return {
    schedule: <T>(work: () => T) =>
      new Promise<T>((resolve) => {
        queue.push(() => resolve(work()));
      }),
    pendingCount: () => queue.length,
    resolveNext: () => {
      const next = queue.shift();
      if (!next) throw new Error('No scheduled Cedar House work is pending.');
      next();
    },
  };
}
