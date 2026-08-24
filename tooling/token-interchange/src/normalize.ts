import type {
  TokenDefinition,
  TokenPrimitive,
  TokenType,
} from '../../../packages/tokens/src/definitions.ts';

import { compareIdentity, createIdentityIndex, type TokenIdentity } from './identity.ts';

export type TokenLayer = 'reference' | 'semantic' | 'component';
export type TokenConcern = 'motion' | 'typography' | 'visual';
export type ModeAxis = 'theme' | 'density';

export interface NormalizedToken extends TokenIdentity {
  readonly layer: TokenLayer;
  readonly concern: TokenConcern;
  readonly type: TokenType;
  readonly value: TokenPrimitive;
  readonly description: string;
  readonly alias?: TokenIdentity;
}

export interface NormalizedOverride {
  readonly target: TokenIdentity;
  readonly source: TokenIdentity;
}

export interface NormalizedMode {
  readonly axis: ModeAxis;
  readonly name: string;
  readonly overrides: readonly NormalizedOverride[];
}

export interface NormalizedTokenGraph {
  readonly interchangeBaseline: 'DTCG 2025.10';
  readonly tokens: readonly NormalizedToken[];
  readonly modes: readonly NormalizedMode[];
}

export interface TokenGraphSources {
  readonly tokens: Readonly<Record<string, TokenDefinition>>;
  readonly themes: Readonly<Record<string, Readonly<Record<string, string>>>>;
  readonly densities: Readonly<Record<string, Readonly<Record<string, string>>>>;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function layerFor(identity: TokenIdentity): TokenLayer {
  if (identity.sourcePath[0] === 'component') {
    return 'component';
  }

  return identity.sourcePath.includes('semantic') ? 'semantic' : 'reference';
}

function concernFor(type: TokenType): TokenConcern {
  if (type === 'cubicBezier' || type === 'duration') {
    return 'motion';
  }

  if (type === 'fontFamily' || type === 'fontSize' || type === 'fontWeight') {
    return 'typography';
  }

  return 'visual';
}

function aliasName(value: TokenPrimitive): string | undefined {
  return typeof value === 'string' ? /^\{([^}]+)\}$/.exec(value)?.[1] : undefined;
}

function assertAcyclicAliases(tokens: readonly NormalizedToken[]): void {
  const bySource = new Map(tokens.map((token) => [token.source, token]));
  const complete = new Set<string>();
  const active = new Set<string>();

  function visit(token: NormalizedToken, path: readonly string[]): void {
    if (complete.has(token.source)) {
      return;
    }

    if (active.has(token.source)) {
      throw new Error(`Token alias cycle detected: ${[...path, token.source].join(' -> ')}.`);
    }

    active.add(token.source);
    if (token.alias) {
      const referencedToken = bySource.get(token.alias.source);
      if (!referencedToken) {
        throw new Error(
          `Token "${token.source}" references missing token "${token.alias.source}".`,
        );
      }

      visit(referencedToken, [...path, token.source]);
    }
    active.delete(token.source);
    complete.add(token.source);
  }

  for (const token of tokens) {
    visit(token, []);
  }
}

function normalizeMode(
  axis: ModeAxis,
  name: string,
  overrides: Readonly<Record<string, string>>,
  identities: ReadonlyMap<string, TokenIdentity>,
): NormalizedMode {
  const normalizedOverrides = Object.entries(overrides)
    .map(([targetName, sourceName]) => {
      const target = identities.get(targetName);
      if (!target) {
        throw new Error(`${axis} mode "${name}" targets missing token "${targetName}".`);
      }

      const source = identities.get(sourceName);
      if (!source) {
        throw new Error(`${axis} mode "${name}" references missing token "${sourceName}".`);
      }

      if (targetName === sourceName) {
        throw new Error(`${axis} mode "${name}" contains a self-alias for "${targetName}".`);
      }

      return { target, source };
    })
    .sort((left, right) => compareIdentity(left.target, right.target));

  return { axis, name, overrides: normalizedOverrides };
}

function normalizeModes(
  axis: ModeAxis,
  modes: Readonly<Record<string, Readonly<Record<string, string>>>>,
  identities: ReadonlyMap<string, TokenIdentity>,
): readonly NormalizedMode[] {
  return Object.entries(modes)
    .sort(([left], [right]) => compareText(left, right))
    .map(([name, overrides]) => normalizeMode(axis, name, overrides, identities));
}

export function createNormalizedTokenGraph(sources: TokenGraphSources): NormalizedTokenGraph {
  const identities = createIdentityIndex(Object.keys(sources.tokens));
  const normalizedTokens = Object.entries(sources.tokens)
    .map(([name, definition]) => {
      const identity = identities.get(name);
      if (!identity) {
        throw new Error(`Token identity "${name}" was not normalized.`);
      }

      if (!definition.description.trim()) {
        throw new Error(`Token "${name}" must include a description.`);
      }

      const referencedName = aliasName(definition.value);
      const alias = referencedName ? identities.get(referencedName) : undefined;
      if (referencedName && !alias) {
        throw new Error(`Token "${name}" references missing token "${referencedName}".`);
      }

      if (referencedName) {
        const referencedDefinition = sources.tokens[referencedName];
        if (referencedDefinition && referencedDefinition.type !== definition.type) {
          throw new Error(
            `Token "${name}" of type "${definition.type}" references token "${referencedName}" of type "${referencedDefinition.type}".`,
          );
        }
      }

      return {
        ...identity,
        layer: layerFor(identity),
        concern: concernFor(definition.type),
        type: definition.type,
        value: definition.value,
        description: definition.description,
        ...(alias ? { alias } : {}),
      };
    })
    .sort(compareIdentity);

  assertAcyclicAliases(normalizedTokens);

  return {
    interchangeBaseline: 'DTCG 2025.10',
    tokens: normalizedTokens,
    modes: [
      ...normalizeModes('theme', sources.themes, identities),
      ...normalizeModes('density', sources.densities, identities),
    ],
  };
}
