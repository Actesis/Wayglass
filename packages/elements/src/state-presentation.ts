import type { Activity, Condition, Knowledge } from '@wayglass/core';

export const conditionLabels = {
  neutral: 'Neutral',
  informational: 'Informational',
  positive: 'Positive',
  caution: 'Caution',
  critical: 'Critical',
} as const satisfies Readonly<Record<Condition, string>>;

export const knowledgeLabels = {
  confirmed: 'Confirmed',
  inferred: 'Inferred',
  stale: 'Data stale',
  unknown: 'Unknown',
  conflicting: 'Conflicting',
  unavailable: 'Unavailable',
} as const satisfies Readonly<Record<Knowledge, string>>;

export const activityLabels = {
  idle: 'Idle',
  pending: 'Pending',
} as const satisfies Readonly<Record<Activity, string>>;

export function knownStateSegments(
  condition: Condition,
  knowledge: Knowledge,
  activity: Activity,
): readonly string[] {
  const segments: string[] = [];

  if (condition !== 'neutral') {
    segments.push(conditionLabels[condition]);
  }

  if (knowledge !== 'confirmed') {
    segments.push(knowledgeLabels[knowledge]);
  }

  if (activity !== 'idle') {
    segments.push(activityLabels[activity]);
  }

  return segments;
}
