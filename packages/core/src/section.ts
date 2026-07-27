export const sectionPurposes = ['information', 'monitor', 'control'] as const;

export type SectionPurpose = (typeof sectionPurposes)[number];

export function isSectionPurpose(value: unknown): value is SectionPurpose {
  return typeof value === 'string' && sectionPurposes.some((purpose) => purpose === value);
}
