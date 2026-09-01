import { mkdirSync, writeFileSync } from 'node:fs';
import { arch, cpus, platform, release, totalmem } from 'node:os';
import { dirname, resolve } from 'node:path';
import { argv, version } from 'node:process';
import { performance } from 'node:perf_hooks';

import {
  assertCapacityResult,
  createCapacityFixture,
  runCapacityFixture,
} from '../src/capacity.ts';

const warmupRuns = 5;
const measuredRuns = 50;
const timeThresholdMs = 100;
const heapThresholdBytes = 32 * 1024 * 1024;

function argument(name: string): string {
  const index = argv.indexOf(name);
  const value = index === -1 ? undefined : argv[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`P5E_HA_MEASURE_ARGUMENT: ${name} is required`);
  }
  return value;
}

function quantile(sorted: readonly number[], percentile: number): number {
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * percentile) - 1)]!;
}

const output = resolve(argument('--output'));
const revision = argument('--revision');
const pnpmVersion = argument('--pnpm');
const collector = (globalThis as typeof globalThis & { gc?: () => void }).gc;
if (collector === undefined) {
  throw new Error('P5E_HA_MEASURE_GC: run with --expose-gc');
}

const fixture = createCapacityFixture();
for (let index = 0; index < warmupRuns; index += 1) {
  assertCapacityResult(runCapacityFixture(fixture));
}

collector();
const heapBeforeBytes = process.memoryUsage().heapUsed;
const durationsMs: number[] = [];
for (let index = 0; index < measuredRuns; index += 1) {
  const started = performance.now();
  assertCapacityResult(runCapacityFixture(fixture));
  durationsMs.push(performance.now() - started);
}
collector();
const heapAfterBytes = process.memoryUsage().heapUsed;
const retainedHeapGrowthBytes = heapAfterBytes - heapBeforeBytes;
const sorted = [...durationsMs].sort((left, right) => left - right);
const meanMs = durationsMs.reduce((sum, value) => sum + value, 0) / durationsMs.length;
const varianceMs2 =
  durationsMs.reduce((sum, value) => sum + (value - meanMs) ** 2, 0) / durationsMs.length;
const medianMs = quantile(sorted, 0.5);

const record = {
  schemaVersion: 1,
  evidenceId: 'P5E-E07',
  subjectRevision: revision,
  recordedAt: new Date().toISOString(),
  environment: {
    platform: platform(),
    release: release(),
    architecture: arch(),
    node: version,
    pnpm: pnpmVersion,
    cpu: cpus()[0]?.model ?? 'unknown',
    logicalCores: cpus().length,
    totalMemoryBytes: totalmem(),
  },
  fixture: {
    bindings: fixture.bindings.length,
    snapshotStates: fixture.snapshot.length,
    messages: fixture.events.length,
    warmupRuns,
    measuredRuns,
  },
  timingMs: {
    durations: durationsMs,
    minimum: sorted[0],
    median: medianMs,
    mean: meanMs,
    p95: quantile(sorted, 0.95),
    maximum: sorted.at(-1),
    variance: varianceMs2,
  },
  memory: {
    heapBeforeBytes,
    heapAfterBytes,
    retainedHeapGrowthBytes,
  },
  thresholds: {
    medianBelowMs: timeThresholdMs,
    retainedHeapGrowthBelowBytes: heapThresholdBytes,
  },
  pass: medianMs < timeThresholdMs && retainedHeapGrowthBytes < heapThresholdBytes,
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify(record)}\n`);
if (!record.pass) process.exitCode = 1;
