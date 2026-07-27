export const conditions = ['neutral', 'informational', 'positive', 'caution', 'critical'] as const;

export const knowledgeStates = [
  'confirmed',
  'inferred',
  'stale',
  'unknown',
  'conflicting',
  'unavailable',
] as const;

export const activities = ['idle', 'pending'] as const;

export type Condition = (typeof conditions)[number];
export type Knowledge = (typeof knowledgeStates)[number];
export type Activity = (typeof activities)[number];

export interface KnownState {
  readonly condition: Condition;
  readonly knowledge: Knowledge;
  readonly activity: Activity;
}

export const defaultKnownState: KnownState = Object.freeze({
  condition: 'neutral',
  knowledge: 'unknown',
  activity: 'idle',
});

export function isCondition(value: unknown): value is Condition {
  return typeof value === 'string' && conditions.some((condition) => condition === value);
}

export function isKnowledge(value: unknown): value is Knowledge {
  return typeof value === 'string' && knowledgeStates.some((knowledge) => knowledge === value);
}

export function isActivity(value: unknown): value is Activity {
  return typeof value === 'string' && activities.some((activity) => activity === value);
}

export function isKnownState(value: unknown): value is KnownState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    isCondition(candidate.condition) &&
    isKnowledge(candidate.knowledge) &&
    isActivity(candidate.activity)
  );
}
