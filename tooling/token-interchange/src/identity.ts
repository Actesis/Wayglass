export interface TokenIdentity {
  readonly source: string;
  readonly sourcePath: readonly string[];
  readonly exchangePath: readonly string[];
}

const forbiddenSegmentCharacter = /[{}.]/;

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function compareIdentity(left: TokenIdentity, right: TokenIdentity): number {
  return compareText(left.source, right.source);
}

function parseSourcePath(source: string): readonly string[] {
  if (!source.includes('.')) {
    throw new Error(`Token identity "${source}" must contain at least two path segments.`);
  }

  const segments = source.split('.');
  for (const segment of segments) {
    if (!segment) {
      throw new Error(`Token identity "${source}" contains an empty path segment.`);
    }

    if (segment.startsWith('$') || forbiddenSegmentCharacter.test(segment)) {
      throw new Error(`Token identity "${source}" contains the invalid segment "${segment}".`);
    }
  }

  return segments;
}

function exchangeKey(path: readonly string[]): string {
  return path.join('\u0000');
}

export function createIdentityIndex(
  sources: readonly string[],
): ReadonlyMap<string, TokenIdentity> {
  const sourcePaths = new Map<string, readonly string[]>();

  for (const source of sources) {
    if (sourcePaths.has(source)) {
      throw new Error(`Token identity "${source}" is duplicated.`);
    }

    sourcePaths.set(source, parseSourcePath(source));
  }

  const orderedSources = [...sourcePaths.keys()].sort(compareText);
  const sourceSet = new Set(orderedSources);
  const exchangePaths = new Map<string, string>();
  const identities = new Map<string, TokenIdentity>();

  for (const source of orderedSources) {
    const sourcePath = sourcePaths.get(source);
    if (!sourcePath) {
      throw new Error(`Token identity "${source}" was not indexed.`);
    }

    const ownsChildren = orderedSources.some(
      (candidate) => candidate !== source && candidate.startsWith(`${source}.`),
    );
    const exchangePath = ownsChildren ? [...sourcePath, '$root'] : [...sourcePath];
    const key = exchangeKey(exchangePath);
    const existing = exchangePaths.get(key);

    if (existing) {
      throw new Error(
        `Token identities "${existing}" and "${source}" map to the same exchange path.`,
      );
    }

    const roundTripSource = exchangePath
      .filter((segment, index) => segment !== '$root' || index !== exchangePath.length - 1)
      .join('.');
    if (!sourceSet.has(roundTripSource) || roundTripSource !== source) {
      throw new Error(`Token identity "${source}" does not have a reversible exchange path.`);
    }

    exchangePaths.set(key, source);
    identities.set(source, { source, sourcePath, exchangePath });
  }

  return identities;
}
