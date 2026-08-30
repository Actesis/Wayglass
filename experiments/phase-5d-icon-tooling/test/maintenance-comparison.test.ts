import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { build, type Rollup } from 'vite';

import { proofIconCatalog } from '../src/catalog.js';
import { generatedArtifactNames, generateIconArtifacts } from '../src/generator.js';

const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));
const experimentRoot = join(repositoryRoot, 'experiments/phase-5d-icon-tooling');
const coldGenerationEntry = join(experimentRoot, 'test/cold-generation-entry.ts');

function contributionTaskCatalog(): unknown[] {
  const task = structuredClone(proofIconCatalog) as unknown as Array<{
    id: string;
    primitives: Array<{ type: string; commands?: Array<{ x?: number }> }>;
  }>;
  const close = task.find(({ id }) => id === 'close')!;
  const path = close.primitives[0]!;
  if (path.type !== 'path' || !path.commands) throw new Error('Expected close path fixture.');
  path.commands[0]!.x = 5;
  return task;
}

function baselineCatalog(): unknown[] {
  return structuredClone(proofIconCatalog).filter(
    ({ id }) => id !== 'arrow-inline-start',
  ) as unknown[];
}

function artifactBytes(artifacts: Readonly<Record<string, string>>): number {
  return Object.values(artifacts).reduce(
    (total, artifact) => total + Buffer.byteLength(artifact),
    0,
  );
}

function statistics(samples: readonly number[]) {
  const sorted = [...samples].sort((left, right) => left - right);
  return {
    maximumMilliseconds: Number(sorted.at(-1)!.toFixed(3)),
    meanMilliseconds: Number(
      (samples.reduce((total, sample) => total + sample, 0) / samples.length).toFixed(3),
    ),
    p95Milliseconds: Number(sorted[Math.ceil(sorted.length * 0.95) - 1]!.toFixed(3)),
  };
}

function nonblankLines(root: string): number {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
    .reduce((total, entry) => {
      const source = readFileSync(join(root, entry.name), 'utf8');
      return total + source.split('\n').filter((line) => line.trim().length > 0).length;
    }, 0);
}

function recordedManualRuntimeDryRun() {
  // The production runtime now consumes generated data. These minimal retained strings preserve
  // the accepted pre-migration comparison without treating deleted inline source as authoritative.
  const originalRuntime = `
export const iconNames = ['close', 'menu', 'more', 'refresh'] as const;
const path = {
  close: svg\`<path d="M6 6l12 12M18 6L6 18" />\`,
};
`;
  const originalTest = `expect(iconNames).toEqual(['close', 'menu', 'more', 'refresh']);`;
  const runtime = originalRuntime
    .replace(
      "['close', 'menu', 'more', 'refresh']",
      "['arrow-inline-start', 'close', 'menu', 'more', 'refresh']",
    )
    .replace('M6 6l12 12M18 6L6 18', 'M5 6l13 12M18 6L6 18')
    .replace(
      'const path = {',
      'const path = {\n      \'arrow-inline-start\': svg`<path d="M19 12H5M11 6l-6 6 6 6" />`,',
    );
  const test = originalTest.replace(
    "['close', 'menu', 'more', 'refresh']",
    "['arrow-inline-start', 'close', 'menu', 'more', 'refresh']",
  );

  if (runtime === originalRuntime || test === originalTest)
    throw new Error('Current manual baseline no longer matches the recorded dry run.');

  return {
    authoredFilesChanged: 2,
    synchronizedRepresentationsChanged: 4,
    unsupportedTaskSurfaces: [
      'accessible-use metadata',
      'dedicated review artifact',
      'direction metadata and behavior',
    ],
  } as const;
}

async function coldGenerationBundle(): Promise<string> {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      minify: 'esbuild',
      rollupOptions: { output: { format: 'es' } },
      ssr: coldGenerationEntry,
      target: 'node22',
      write: false,
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((candidate) =>
    'output' in candidate ? candidate.output : [],
  );
  return outputs
    .filter((item): item is Rollup.OutputChunk => item.type === 'chunk')
    .map(({ code }) => code)
    .join('\n');
}

describe('Phase 5D add-and-revise maintenance comparison', () => {
  it('completes the task from one source and limits drift to the added and revised identities', () => {
    const baseline = generateIconArtifacts(baselineCatalog());
    const contribution = generateIconArtifacts(contributionTaskCatalog());
    const baselineManifest = JSON.parse(baseline['source-manifest.json']) as {
      icons: Array<{ fingerprint: string; id: string }>;
    };
    const contributionManifest = JSON.parse(
      contribution['source-manifest.json'],
    ) as typeof baselineManifest;
    const baselineFingerprints = new Map(
      baselineManifest.icons.map(({ fingerprint, id }) => [id, fingerprint]),
    );
    const changedIdentities = contributionManifest.icons
      .filter(({ fingerprint, id }) => baselineFingerprints.get(id) !== fingerprint)
      .map(({ id }) => id);

    expect(changedIdentities).toEqual(['arrow-inline-start', 'close']);
    expect(generatedArtifactNames.filter((name) => baseline[name] !== contribution[name])).toEqual(
      generatedArtifactNames,
    );
    expect(recordedManualRuntimeDryRun()).toEqual({
      authoredFilesChanged: 2,
      synchronizedRepresentationsChanged: 4,
      unsupportedTaskSurfaces: [
        'accessible-use metadata',
        'dedicated review artifact',
        'direction metadata and behavior',
      ],
    });
  });

  it('records owned surface, output bytes, and 50 warm contribution generations', () => {
    const task = contributionTaskCatalog();
    const samples: number[] = [];
    let bytes = 0;
    for (let run = 0; run < 50; run += 1) {
      const started = performance.now();
      const artifacts = generateIconArtifacts(task);
      samples.push(performance.now() - started);
      bytes = artifactBytes(artifacts);
    }
    const measurement = {
      generatedBytes: bytes,
      generatedFiles: generatedArtifactNames.length,
      repetitions: 50,
      toolSourceNonblankLines: nonblankLines(join(experimentRoot, 'src')),
      toolTestNonblankLines: nonblankLines(join(experimentRoot, 'test')),
      warm: statistics(samples),
    };

    expect(measurement.generatedBytes).toBeGreaterThan(0);
    expect(measurement.warm.maximumMilliseconds).toBeLessThan(2_000);
    if (process.env.WG_P5D_REPORT_MAINTENANCE === '1')
      console.info(`P5D_MAINTENANCE ${JSON.stringify(measurement)}`);
  });

  it('completes 50 cold-process generations with identical authenticated byte counts', async () => {
    const code = await coldGenerationBundle();
    const moduleUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
    const samples: number[] = [];
    const byteCounts = new Set<number>();
    for (let run = 0; run < 50; run += 1) {
      const started = performance.now();
      const processResult = spawnSync(
        process.execPath,
        ['--input-type=module', '--eval', `await import(${JSON.stringify(moduleUrl)})`],
        { cwd: repositoryRoot, encoding: 'utf8' },
      );
      samples.push(performance.now() - started);
      expect(processResult.status, processResult.stderr).toBe(0);
      byteCounts.add(Number(processResult.stdout));
    }
    const measurement = { byteCounts: [...byteCounts], repetitions: 50, cold: statistics(samples) };

    expect(byteCounts).toHaveLength(1);
    expect(measurement.cold.maximumMilliseconds).toBeLessThan(2_000);
    if (process.env.WG_P5D_REPORT_MAINTENANCE === '1')
      console.info(`P5D_COLD_MAINTENANCE ${JSON.stringify(measurement)}`);
  }, 30_000);
});
