export class ReleaseCandidateError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(`${code}: ${message}`);
    this.code = code;
    this.name = 'ReleaseCandidateError';
  }
}

export function fail(code: string, message: string): never {
  throw new ReleaseCandidateError(code, message);
}
