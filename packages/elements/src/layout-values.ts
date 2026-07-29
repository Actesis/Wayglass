export const layoutSpaces = ['none', 'related', 'section', 'function'] as const;
export type LayoutSpace = (typeof layoutSpaces)[number];

export const layoutAlignments = ['start', 'center', 'end', 'stretch'] as const;
export type LayoutAlignment = (typeof layoutAlignments)[number];

export const layoutMinimums = ['compact', 'standard', 'wide'] as const;
export type LayoutMinimum = (typeof layoutMinimums)[number];

export function isLayoutSpace(value: unknown): value is LayoutSpace {
  return typeof value === 'string' && layoutSpaces.some((space) => space === value);
}

export function isLayoutAlignment(value: unknown): value is LayoutAlignment {
  return typeof value === 'string' && layoutAlignments.some((alignment) => alignment === value);
}

export function isLayoutMinimum(value: unknown): value is LayoutMinimum {
  return typeof value === 'string' && layoutMinimums.some((minimum) => minimum === value);
}
