import type { Condition } from '@wayglass/core';

export const feedbackConditions = [
  'neutral',
  'positive',
  'caution',
  'critical',
] as const satisfies readonly Condition[];
export type FeedbackCondition = (typeof feedbackConditions)[number];

export const alertAnnouncements = ['off', 'polite', 'assertive'] as const;
export type AlertAnnouncement = (typeof alertAnnouncements)[number];

export function isFeedbackCondition(value: unknown): value is FeedbackCondition {
  return typeof value === 'string' && feedbackConditions.some((condition) => condition === value);
}

export function isAlertAnnouncement(value: unknown): value is AlertAnnouncement {
  return (
    typeof value === 'string' && alertAnnouncements.some((announcement) => announcement === value)
  );
}
