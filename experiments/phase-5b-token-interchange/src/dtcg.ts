import { convertDtcgValue, type DtcgConversionSuccess } from './dtcg-values.js';
import type {
  ModeAxis,
  NormalizedMode,
  NormalizedToken,
  NormalizedTokenGraph,
} from './normalize.js';

const wayglassExtension = 'com.wayglass';

type JsonObject = Record<string, unknown>;

export interface DtcgResolverPolicy {
  readonly defaultTheme: string;
  readonly defaultDensity: string;
}

export interface DtcgOmission {
  readonly source: string;
  readonly reason: string;
}

export interface DtcgExchange {
  readonly files: Readonly<Record<string, string>>;
  readonly manifest: {
    readonly status: 'partial-dtcg-2025.10-candidate';
    readonly sourceAuthority: 'Wayglass TypeScript definitions';
    readonly includedTokens: number;
    readonly omittedTokens: readonly DtcgOmission[];
    readonly omittedOverrides: readonly DtcgOmission[];
  };
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function insertToken(document: JsonObject, path: readonly string[], token: JsonObject): void {
  let group = document;
  for (const [index, segment] of path.entries()) {
    const isToken = index === path.length - 1;
    const existing = group[segment];

    if (isToken) {
      if (existing !== undefined) {
        throw new Error(`DTCG output path "${path.join('.')}" is duplicated.`);
      }
      group[segment] = token;
      return;
    }

    if (existing === undefined) {
      const child: JsonObject = {};
      group[segment] = child;
      group = child;
      continue;
    }

    if (typeof existing !== 'object' || existing === null || Array.isArray(existing)) {
      throw new Error(`DTCG output path "${path.slice(0, index + 1).join('.')}" is not a group.`);
    }
    group = existing as JsonObject;
  }
}

function tokenExtension(token: NormalizedToken): JsonObject {
  return {
    sourceIdentity: token.source,
    sourceType: token.type,
    layer: token.layer,
    concern: token.concern,
  };
}

function evaluateTokens(graph: NormalizedTokenGraph): {
  readonly included: ReadonlyMap<string, DtcgConversionSuccess>;
  readonly omitted: readonly DtcgOmission[];
} {
  const tokens = new Map(graph.tokens.map((token) => [token.source, token]));
  const included = new Map<string, DtcgConversionSuccess>();
  const omitted = new Map<string, string>();
  const active = new Set<string>();

  function evaluate(token: NormalizedToken): boolean {
    if (included.has(token.source)) {
      return true;
    }
    if (omitted.has(token.source)) {
      return false;
    }
    if (active.has(token.source)) {
      throw new Error(`Unexpected normalized alias cycle at "${token.source}".`);
    }

    active.add(token.source);
    if (token.alias) {
      const target = tokens.get(token.alias.source);
      if (!target || !evaluate(target)) {
        omitted.set(token.source, `${token.source}: alias target ${token.alias.source} is omitted`);
        active.delete(token.source);
        return false;
      }
    }

    const conversion = convertDtcgValue(token);
    if (!conversion.ok) {
      omitted.set(token.source, conversion.reason);
      active.delete(token.source);
      return false;
    }

    included.set(token.source, conversion);
    active.delete(token.source);
    return true;
  }

  for (const token of graph.tokens) {
    evaluate(token);
  }

  return {
    included,
    omitted: [...omitted.entries()]
      .sort(([left], [right]) => compareText(left, right))
      .map(([source, reason]) => ({ source, reason })),
  };
}

function baseDocument(
  graph: NormalizedTokenGraph,
  included: ReadonlyMap<string, DtcgConversionSuccess>,
): JsonObject {
  const document: JsonObject = {};
  for (const token of graph.tokens) {
    const conversion = included.get(token.source);
    if (!conversion) {
      continue;
    }

    insertToken(document, token.exchangePath, {
      $type: conversion.type,
      $value: conversion.value,
      $description: token.description,
      $extensions: { [wayglassExtension]: tokenExtension(token) },
    });
  }
  return document;
}

function modePath(mode: NormalizedMode): string {
  if (!/^[a-z0-9-]+$/i.test(mode.name)) {
    throw new Error(`${mode.axis} mode "${mode.name}" is not safe for an exchange filename.`);
  }
  return `modes/${mode.axis}/${mode.name}.json`;
}

function modeDocument(
  mode: NormalizedMode,
  tokens: ReadonlyMap<string, NormalizedToken>,
  included: ReadonlyMap<string, DtcgConversionSuccess>,
  omittedOverrides: DtcgOmission[],
): JsonObject {
  const document: JsonObject = {};
  for (const override of mode.overrides) {
    const target = tokens.get(override.target.source);
    const targetConversion = included.get(override.target.source);
    const sourceConversion = included.get(override.source.source);
    if (!target || !targetConversion || !sourceConversion) {
      omittedOverrides.push({
        source: `${mode.axis}.${mode.name}.${override.target.source}`,
        reason: `mode override depends on omitted target or source token`,
      });
      continue;
    }

    insertToken(document, target.exchangePath, {
      $type: targetConversion.type,
      $value: `{${override.source.exchangePath.join('.')}}`,
      $extensions: {
        [wayglassExtension]: {
          sourceIdentity: target.source,
          modeAxis: mode.axis,
          modeName: mode.name,
        },
      },
    });
  }
  return document;
}

function modesForAxis(graph: NormalizedTokenGraph, axis: ModeAxis): readonly NormalizedMode[] {
  return graph.modes.filter((mode) => mode.axis === axis);
}

function modifier(
  modes: readonly NormalizedMode[],
  defaultMode: string,
  description: string,
): JsonObject {
  if (!modes.some((mode) => mode.name === defaultMode)) {
    throw new Error(`DTCG resolver default "${defaultMode}" is not a normalized mode.`);
  }

  return {
    description,
    contexts: Object.fromEntries(modes.map((mode) => [mode.name, [{ $ref: modePath(mode) }]])),
    default: defaultMode,
  };
}

function resolverDocument(graph: NormalizedTokenGraph, policy: DtcgResolverPolicy): JsonObject {
  const themes = modesForAxis(graph, 'theme');
  const densities = modesForAxis(graph, 'density');
  return {
    $schema: 'https://www.designtokens.org/schemas/2025.10/resolver.json',
    name: 'Wayglass official token contexts',
    version: '2025.10',
    description:
      'Private Phase 5B candidate. Wayglass TypeScript definitions remain authoritative.',
    sets: {
      foundation: {
        description: 'Losslessly representable Wayglass foundation tokens.',
        sources: [{ $ref: 'tokens.json' }],
      },
    },
    modifiers: {
      theme: modifier(themes, policy.defaultTheme, 'Official Wayglass color theme.'),
      density: modifier(densities, policy.defaultDensity, 'Official Wayglass density.'),
    },
    resolutionOrder: [
      { $ref: '#/sets/foundation' },
      { $ref: '#/modifiers/theme' },
      { $ref: '#/modifiers/density' },
    ],
  };
}

function stringify(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function createDtcgExchange(
  graph: NormalizedTokenGraph,
  policy: DtcgResolverPolicy,
): DtcgExchange {
  const { included, omitted } = evaluateTokens(graph);
  const tokens = new Map(graph.tokens.map((token) => [token.source, token]));
  const omittedOverrides: DtcgOmission[] = [];
  const documents = new Map<string, JsonObject>();
  documents.set('tokens.json', baseDocument(graph, included));
  for (const mode of graph.modes) {
    documents.set(modePath(mode), modeDocument(mode, tokens, included, omittedOverrides));
  }
  documents.set('resolver.json', resolverDocument(graph, policy));

  const manifest = {
    status: 'partial-dtcg-2025.10-candidate' as const,
    sourceAuthority: 'Wayglass TypeScript definitions' as const,
    includedTokens: included.size,
    omittedTokens: omitted,
    omittedOverrides: omittedOverrides.sort((left, right) =>
      compareText(left.source, right.source),
    ),
  };
  documents.set('wayglass-manifest.json', manifest);

  return {
    files: Object.fromEntries(
      [...documents.entries()]
        .sort(([left], [right]) => compareText(left, right))
        .map(([path, document]) => [path, stringify(document)]),
    ),
    manifest,
  };
}
