export class CloudflareDeliveryError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(`${code}: ${message}`);
    this.name = 'CloudflareDeliveryError';
    this.code = code;
  }
}

export function fail(code: string, message: string): never {
  throw new CloudflareDeliveryError(code, message);
}
