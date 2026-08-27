import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { build } from 'vite';

const experimentRoot = fileURLToPath(new URL('..', import.meta.url));
const entries = {
  native: fileURLToPath(new URL('../src/native-adapter.ts', import.meta.url)),
  uplot: fileURLToPath(new URL('../src/uplot-adapter.ts', import.meta.url)),
  d3: fileURLToPath(new URL('../src/d3-adapter.ts', import.meta.url)),
} as const;

function summarize(samples: readonly number[]) {
  const rounded = samples.map((sample) => Number(sample.toFixed(3)));
  const sorted = [...rounded].sort((left, right) => left - right);
  return {
    median: sorted[Math.floor(sorted.length / 2)]!,
    p95: sorted[Math.ceil(sorted.length * 0.95) - 1]!,
    maximum: sorted.at(-1)!,
  };
}

async function measureEntry(name: string, entry: string) {
  const result = await build({
    configFile: false,
    root: experimentRoot,
    logLevel: 'silent',
    build: {
      write: false,
      minify: 'esbuild',
      target: 'es2022',
      cssCodeSplit: false,
      lib: { entry, formats: ['es'], fileName: 'adapter' },
    },
  });
  const builds = Array.isArray(result) ? result : [result];
  const chunks = builds
    .flatMap((candidate) => ('output' in candidate ? candidate.output : []))
    .filter((item) => item.type === 'chunk');
  const code = chunks.map((chunk) => chunk.code).join('\n');
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  for (let warmup = 0; warmup < 5; warmup += 1) {
    await import(`${moduleUrl}#${name}-warmup-${warmup}`);
  }
  const parseAndEvaluationSamples: number[] = [];
  for (let run = 0; run < 30; run += 1) {
    const started = performance.now();
    await import(`${moduleUrl}#${name}-measurement-${run}`);
    parseAndEvaluationSamples.push(performance.now() - started);
  }

  return {
    rawBytes: chunks.reduce((total, { code }) => total + Buffer.byteLength(code), 0),
    gzipBytes: chunks.reduce((total, { code }) => total + gzipSync(code).byteLength, 0),
    parseAndEvaluationMilliseconds: summarize(parseAndEvaluationSamples),
  };
}

describe('Phase 5C isolated production JavaScript budgets', () => {
  it('keeps every self-contained adapter entry below the candidate budget', async () => {
    const measurements = Object.fromEntries(
      await Promise.all(
        Object.entries(entries).map(async ([name, entry]) => [
          name,
          await measureEntry(name, entry),
        ]),
      ),
    );
    console.info(`P5C_BUNDLE_MEASUREMENTS ${JSON.stringify(measurements)}`);
    expect(measurements.native!.gzipBytes).toBeLessThan(40 * 1_024);
    expect(measurements.uplot!.gzipBytes).toBeLessThan(40 * 1_024);
    expect(measurements.d3!.gzipBytes).toBeLessThan(40 * 1_024);
    expect(measurements.native!.parseAndEvaluationMilliseconds.maximum).toBeLessThan(50);
    expect(measurements.uplot!.parseAndEvaluationMilliseconds.maximum).toBeLessThan(50);
    expect(measurements.d3!.parseAndEvaluationMilliseconds.maximum).toBeLessThan(50);
  });
});
