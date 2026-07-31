export const requestStates = ['idle', 'pending', 'rejected'] as const;
export const controlAvailabilities = ['available', 'unavailable'] as const;
export const booleanRequests = ['none', 'asserted', 'not-asserted'] as const;

export type RequestState = (typeof requestStates)[number];
export type ControlAvailability = (typeof controlAvailabilities)[number];
export type BooleanRequest = (typeof booleanRequests)[number];

export function isRequestState(value: unknown): value is RequestState {
  return typeof value === 'string' && requestStates.some((state) => state === value);
}

export function isControlAvailability(value: unknown): value is ControlAvailability {
  return (
    typeof value === 'string' &&
    controlAvailabilities.some((availability) => availability === value)
  );
}

export function isBooleanRequest(value: unknown): value is BooleanRequest {
  return typeof value === 'string' && booleanRequests.some((request) => request === value);
}
