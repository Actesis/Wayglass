import { fail } from './error.ts';

type JsonRecord = Readonly<Record<string, unknown>>;

function assertJsonValue(value: unknown, path: string): void {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('WG_SITE_JSON_NUMBER', `${path} is not finite.`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertJsonValue(item, `${path}[${index}]`));
    return;
  }
  if (typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      fail('WG_SITE_JSON_OBJECT', `${path} is not a plain JSON object.`);
    }
    for (const [key, item] of Object.entries(value as JsonRecord)) {
      if (item === undefined) fail('WG_SITE_JSON_UNDEFINED', `${path}.${key} is undefined.`);
      assertJsonValue(item, `${path}.${key}`);
    }
    return;
  }
  fail('WG_SITE_JSON_VALUE', `${path} is not a JSON value.`);
}

function sorted(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sorted);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as JsonRecord)
        .sort()
        .map((key) => [key, sorted((value as JsonRecord)[key])]),
    );
  }
  return value;
}

export function compactCanonicalJson(value: unknown): string {
  assertJsonValue(value, '$');
  return JSON.stringify(sorted(value));
}

export function serializeCanonicalJson(value: unknown): string {
  assertJsonValue(value, '$');
  return `${JSON.stringify(sorted(value), null, 2)}\n`;
}
