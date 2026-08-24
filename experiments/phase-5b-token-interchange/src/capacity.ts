import { performance } from 'node:perf_hooks';
import { resourceUsage } from 'node:process';

import { createDtcgExchange } from '../../../tooling/token-interchange/src/dtcg.js';
import type { TokenIdentity } from '../../../tooling/token-interchange/src/identity.js';
import type {
  NormalizedMode,
  NormalizedOverride,
  NormalizedToken,
  NormalizedTokenGraph,
} from '../../../tooling/token-interchange/src/normalize.js';
import { createWayglassTokenGraph } from '../../../tooling/token-interchange/src/source.js';
import { currentWebPolicy } from '../../../tooling/token-interchange/src/web-policy.js';
import {
  createWebThemeCss,
  createWebTokenCss,
} from '../../../tooling/token-interchange/src/web.js';

export interface CapacityStatistics {
  readonly maximumMilliseconds: number;
  readonly meanMilliseconds: number;
  readonly minimumMilliseconds: number;
  readonly p50Milliseconds: number;
  readonly p95Milliseconds: number;
}

export interface CapacityCaseResult {
  readonly coldMilliseconds: number;
  readonly corpus: {
    readonly factor: number;
    readonly modeOverrides: number;
    readonly modes: number;
    readonly tokens: number;
  };
  readonly memory: {
    readonly baselineMaxRssKibibytes: number;
    readonly observedMaxRssDeltaKibibytes: number;
    readonly observedMaxRssKibibytes: number;
  };
  readonly name: string;
  readonly output: {
    readonly dtcgBytes: number;
    readonly dtcgFiles: number;
    readonly omittedOverrides: number;
    readonly omittedTokens: number;
    readonly webBytes: number;
    readonly webFiles: number;
  };
  readonly warm: CapacityStatistics & { readonly repetitions: number };
}

export interface CapacityMeasurement {
  readonly environment: {
    readonly architecture: string;
    readonly node: string;
    readonly platform: string;
    readonly sourceRevision: string;
  };
  readonly results: readonly CapacityCaseResult[];
}

interface PipelineOutput {
  readonly graph: NormalizedTokenGraph;
  readonly dtcg: ReturnType<typeof createDtcgExchange>;
  readonly web: readonly string[];
}

function prefixedIdentity(identity: TokenIdentity, prefix: string | undefined): TokenIdentity {
  if (!prefix) {
    return identity;
  }
  return {
    source: `${prefix}.${identity.source}`,
    sourcePath: [prefix, ...identity.sourcePath],
    exchangePath: [prefix, ...identity.exchangePath],
  };
}

function replicateToken(token: NormalizedToken, prefix: string | undefined): NormalizedToken {
  if (!prefix) {
    return token;
  }
  const replicated = {
    ...token,
    ...prefixedIdentity(token, prefix),
  };
  if (!token.alias) {
    return replicated;
  }

  const alias = prefixedIdentity(token.alias, prefix);
  return { ...replicated, value: `{${alias.source}}`, alias };
}

function replicateOverride(
  override: NormalizedOverride,
  prefix: string | undefined,
): NormalizedOverride {
  return {
    target: prefixedIdentity(override.target, prefix),
    source: prefixedIdentity(override.source, prefix),
  };
}

function replicaPrefix(index: number): string | undefined {
  return index === 0 ? undefined : `capacity-${String(index + 1).padStart(2, '0')}`;
}

export function scaleNormalizedTokenGraph(
  graph: NormalizedTokenGraph,
  factor: number,
): NormalizedTokenGraph {
  if (!Number.isSafeInteger(factor) || factor < 1) {
    throw new Error('Capacity corpus factor must be a positive safe integer.');
  }

  const prefixes = Array.from({ length: factor }, (_, index) => replicaPrefix(index));
  const tokens = prefixes.flatMap((prefix) =>
    graph.tokens.map((token) => replicateToken(token, prefix)),
  );
  const modes: readonly NormalizedMode[] = graph.modes.map((mode) => ({
    ...mode,
    overrides: prefixes.flatMap((prefix) =>
      mode.overrides.map((override) => replicateOverride(override, prefix)),
    ),
  }));

  return { ...graph, tokens, modes };
}

function runPipeline(factor: number, sourceRevision: string): PipelineOutput {
  const graph = scaleNormalizedTokenGraph(createWayglassTokenGraph(), factor);
  return {
    graph,
    dtcg: createDtcgExchange(graph, {
      defaultTheme: 'wayglass-dark',
      defaultDensity: 'compact',
      sourceRevision,
    }),
    web: [createWebTokenCss(graph), createWebThemeCss(graph, currentWebPolicy)],
  };
}

function byteLength(values: readonly string[]): number {
  return values.reduce((total, value) => total + Buffer.byteLength(value, 'utf8'), 0);
}

function percentile(values: readonly number[], percentage: number): number {
  const ordered = [...values].sort((left, right) => left - right);
  const index = Math.min(ordered.length - 1, Math.ceil(ordered.length * percentage) - 1);
  return ordered[index]!;
}

function statistics(values: readonly number[]): CapacityStatistics {
  return {
    maximumMilliseconds: Math.max(...values),
    meanMilliseconds: values.reduce((total, value) => total + value, 0) / values.length,
    minimumMilliseconds: Math.min(...values),
    p50Milliseconds: percentile(values, 0.5),
    p95Milliseconds: percentile(values, 0.95),
  };
}

function measureCase(
  name: string,
  factor: number,
  repetitions: number,
  sourceRevision: string,
): CapacityCaseResult {
  const baselineMaxRssKibibytes = resourceUsage().maxRSS;
  const coldStart = performance.now();
  const cold = runPipeline(factor, sourceRevision);
  const coldMilliseconds = performance.now() - coldStart;
  const durations: number[] = [];

  for (let iteration = 0; iteration < repetitions; iteration += 1) {
    const start = performance.now();
    const output = runPipeline(factor, sourceRevision);
    durations.push(performance.now() - start);
    if (
      output.graph.tokens.length !== cold.graph.tokens.length ||
      byteLength(Object.values(output.dtcg.files)) !== byteLength(Object.values(cold.dtcg.files))
    ) {
      throw new Error(`${name} capacity repetitions produced inconsistent output measurements.`);
    }
  }

  const observedMaxRssKibibytes = resourceUsage().maxRSS;
  return {
    name,
    coldMilliseconds,
    corpus: {
      factor,
      tokens: cold.graph.tokens.length,
      modes: cold.graph.modes.length,
      modeOverrides: cold.graph.modes.reduce((total, mode) => total + mode.overrides.length, 0),
    },
    output: {
      webFiles: cold.web.length,
      webBytes: byteLength(cold.web),
      dtcgFiles: Object.keys(cold.dtcg.files).length,
      dtcgBytes: byteLength(Object.values(cold.dtcg.files)),
      omittedTokens: cold.dtcg.manifest.omittedTokens.length,
      omittedOverrides: cold.dtcg.manifest.omittedOverrides.length,
    },
    memory: {
      baselineMaxRssKibibytes,
      observedMaxRssKibibytes,
      observedMaxRssDeltaKibibytes: Math.max(0, observedMaxRssKibibytes - baselineMaxRssKibibytes),
    },
    warm: { repetitions, ...statistics(durations) },
  };
}

export function measureTokenExchangeCapacity(
  sourceRevision: string,
  repetitions = 30,
): CapacityMeasurement {
  if (!/^[0-9a-f]{7,64}$/i.test(sourceRevision)) {
    throw new Error('Capacity measurement source revision must be a hexadecimal commit.');
  }
  if (!Number.isSafeInteger(repetitions) || repetitions < 1) {
    throw new Error('Capacity measurement repetitions must be a positive safe integer.');
  }

  return {
    environment: {
      node: process.version,
      platform: process.platform,
      architecture: process.arch,
      sourceRevision,
    },
    results: [
      measureCase('current', 1, repetitions, sourceRevision),
      measureCase('synthetic-10x', 10, repetitions, sourceRevision),
    ],
  };
}
