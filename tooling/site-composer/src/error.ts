export class SiteComposerError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(`${code}: ${message}`);
    this.code = code;
    this.name = 'SiteComposerError';
  }
}

export function fail(code: string, message: string): never {
  throw new SiteComposerError(code, message);
}
