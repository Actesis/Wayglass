import { performance } from 'node:perf_hooks';
import { resourceUsage } from 'node:process';

import { generateIconArtifacts } from './generator.js';
import type { IconRecord } from './model.js';

export interface CapacityStatistics {
  readonly maximumMilliseconds: number;
  readonly meanMilliseconds: number;
  readonly minimumMilliseconds: number;
  readonly p50Milliseconds: number;
  readonly p95Milliseconds: number;
}

export interface IconCapacityMeasurement {
  readonly environment: {
    readonly architecture: string;
    readonly node: string;
    readonly platform: string;
  };
  readonly glyphs: number;
  readonly memory: {
    readonly baselineMaxRssKibibytes: number;
    readonly observedMaxRssDeltaKibibytes: number;
    readonly observedMaxRssKibibytes: number;
  };
  readonly outputBytes: number;
  readonly repetitions: number;
  readonly statistics: CapacityStatistics;
}

const provenance = { author: 'Wayglass', license: 'Apache-2.0' } as const;

function compareNumber(left: number, right: number): number {
  return left - right;
}

function percentile(values: readonly number[], percentage: number): number {
  const ordered = [...values].sort(compareNumber);
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

export function createSyntheticIconCatalog(glyphs = 500): readonly IconRecord[] {
  if (!Number.isSafeInteger(glyphs) || glyphs < 1 || glyphs > 500) {
    throw new Error('Synthetic icon count must be a safe integer from 1 through 500.');
  }

  return Array.from({ length: glyphs }, (_, index): IconRecord => ({
    schemaVersion: 1,
    id: `capacity-${String(index + 1).padStart(3, '0')}`,
    category: 'control',
    direction: index % 10 === 0 ? 'mirrors-in-rtl' : 'neutral',
    accessibleUse: 'reinforcement-only',
    provenance,
    primitives: [
      {
        type: 'path',
        commands: [
          { command: 'move-to', x: 5, y: 12 },
          { command: 'line-to', x: 19, y: 12 },
        ],
        fill: 'none',
        stroke: 'currentColor',
      },
    ],
  }));
}

export function measureIconToolingCapacity(
  glyphs = 500,
  repetitions = 50,
): IconCapacityMeasurement {
  if (!Number.isSafeInteger(repetitions) || repetitions < 1) {
    throw new Error('Capacity repetitions must be a positive safe integer.');
  }

  const catalog = createSyntheticIconCatalog(glyphs);
  const baselineMaxRssKibibytes = resourceUsage().maxRSS;
  const durations: number[] = [];
  let expectedFingerprint: string | undefined;
  let outputBytes = 0;

  for (let iteration = 0; iteration < repetitions; iteration += 1) {
    const started = performance.now();
    const artifacts = generateIconArtifacts(catalog);
    durations.push(performance.now() - started);
    const manifest = JSON.parse(artifacts['output-manifest.json']) as {
      sourceFingerprint: string;
    };
    expectedFingerprint ??= manifest.sourceFingerprint;
    if (manifest.sourceFingerprint !== expectedFingerprint) {
      throw new Error('Capacity repetitions produced inconsistent source fingerprints.');
    }
    outputBytes = Object.values(artifacts).reduce(
      (total, artifact) => total + Buffer.byteLength(artifact),
      0,
    );
  }

  const observedMaxRssKibibytes = resourceUsage().maxRSS;
  return {
    environment: {
      architecture: process.arch,
      node: process.version,
      platform: process.platform,
    },
    glyphs,
    memory: {
      baselineMaxRssKibibytes,
      observedMaxRssDeltaKibibytes: Math.max(0, observedMaxRssKibibytes - baselineMaxRssKibibytes),
      observedMaxRssKibibytes,
    },
    outputBytes,
    repetitions,
    statistics: statistics(durations),
  };
}
