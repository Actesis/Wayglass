type JsonRecord = Readonly<Record<string, unknown>>;

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
  return JSON.stringify(sorted(value));
}

export function serializeCanonicalJson(value: unknown): string {
  return `${JSON.stringify(sorted(value), null, 2)}\n`;
}
