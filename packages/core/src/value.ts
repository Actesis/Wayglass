export const booleanValueStates = ['asserted', 'not-asserted'] as const;

export type BooleanValueState = (typeof booleanValueStates)[number];

export function toBooleanValueState(value: boolean): BooleanValueState {
  return value ? 'asserted' : 'not-asserted';
}

export function isBooleanValueState(value: unknown): value is BooleanValueState {
  return typeof value === 'string' && booleanValueStates.some((state) => state === value);
}
