import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { consumerScenarios } from '../src/consumer.ts';
import { candidateDirectories, frozenSource } from '../src/constants.ts';
import { serializeEvidence } from '../src/evidence.ts';
import { sha256 } from '../src/hash.ts';
import type {
  CandidateEvidence,
  CommandRequest,
  CommandRunner,
  ConsumerProjectContext,
} from '../src/types.ts';
import { probeVanillaConsumers, runVanillaBuildProbe } from '../src/vanilla-probe.ts';

const temporary: string[] = [];

function temp(prefix: string): string {
  const root = mkdtempSync(resolve(tmpdir(), prefix));
  temporary.push(root);
  return root;
}

function project(): string {
  const root = temp('wayglass-rc-vanilla-probe-');
  mkdirSync(resolve(root, 'src'));
  mkdirSync(resolve(root, 'node_modules/@wayglass/icons'), { recursive: true });
  writeFileSync(resolve(root, 'src/package-surface.ts'), 'export {};\n');
  writeFileSync(
    resolve(root, 'package.json'),
    JSON.stringify({ dependencies: { '@wayglass/icons': 'file:./vendor/icons.tgz' } }),
  );
  return root;
}

function evidenceFixture(): { readonly evidence: string; readonly store: string } {
  const root = temp('wayglass-rc-vanilla-evidence-');
  const packages = resolve(root, 'packages');
  const store = resolve(root, 'store');
  mkdirSync(packages);
  mkdirSync(store);
  const candidates = candidateDirectories.map((directory) => {
    const file = `wayglass-${directory}-0.1.0.tgz`;
    const bytes = Buffer.from(`tarball:${directory}`);
    writeFileSync(resolve(packages, file), bytes);
    return {
      directory,
      name: `@wayglass/${directory}`,
      version: '0.1.0' as const,
      file,
      bytes: bytes.byteLength,
      sha256: sha256(bytes),
      manifestSha256: 'a'.repeat(64),
      inventorySha256: 'b'.repeat(64),
      unpackedBytes: 1,
      files: [],
    };
  });
  const record: CandidateEvidence = {
    schemaVersion: 1,
    source: frozenSource,
    tooling: { commit: 'c'.repeat(40), tree: 'd'.repeat(40) },
    environment: {
      platform: 'test',
      architecture: 'test',
      node: 'v22.13.0',
      pnpm: '11.9.0',
      npm: '11.0.0',
    },
    reproducibility: { runs: 2, byteIdentical: true },
    packages: candidates,
  };
  const evidence = resolve(root, 'evidence.json');
  writeFileSync(evidence, serializeEvidence(record));
  return { evidence, store };
}

afterEach(() => {
  for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true });
});

const javascript = [
  'WG_VANILLA_PROBE_READY',
  'WG_VANILLA_IMPORT_REGISTERED',
  'wg-toggle-request',
  'critical',
  'stale',
  'pending',
].join(';');

const css = [
  '--wg-color-semantic-condition-positive',
  'data-wg-theme',
  'data-wg-density',
  '--wg-component-toggle-color',
].join(';');

function context(
  root: string,
  output = { javascript, css },
): {
  readonly context: ConsumerProjectContext;
  readonly requests: CommandRequest[];
} {
  const requests: CommandRequest[] = [];
  const runner: CommandRunner = async (request) => {
    requests.push(request);
    if (request.arguments[0] === 'remove') {
      const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
        dependencies: Record<string, string>;
      };
      delete manifest.dependencies['@wayglass/icons'];
      writeFileSync(resolve(root, 'package.json'), JSON.stringify(manifest));
      rmSync(resolve(root, 'node_modules/@wayglass/icons'), { recursive: true, force: true });
    }
    if (request.arguments.includes('vite')) {
      rmSync(resolve(root, 'dist'), { recursive: true, force: true });
      mkdirSync(resolve(root, 'dist/assets'), { recursive: true });
      writeFileSync(resolve(root, 'dist/index.html'), '<!doctype html>');
      writeFileSync(resolve(root, 'dist/assets/main.js'), output.javascript);
      writeFileSync(resolve(root, 'dist/assets/main.css'), output.css);
    }
    return { stdout: '', stderr: '' };
  };
  return {
    context: {
      root,
      scenario: consumerScenarios()[0]!,
      run: runner,
      environment: { PNPM_CONFIG_OFFLINE: 'true' },
    },
    requests,
  };
}

describe('release-candidate Vanilla build probe', () => {
  it('typechecks, builds, verifies, removes the compile-only package, and rebuilds', async () => {
    const root = project();
    const fixture = context(root);
    const runtimeStages: string[] = [];
    await expect(
      runVanillaBuildProbe(fixture.context, async (runtimeContext, stage) => {
        expect(runtimeContext).toBe(fixture.context);
        expect(existsSync(resolve(runtimeContext.root, 'dist/index.html'))).toBe(true);
        runtimeStages.push(stage);
      }),
    ).resolves.toEqual({
      scenarioId: 'vanilla-ts-5.9.3',
      declarations: true,
      productionBuild: true,
      css: true,
      runtimeFixture: true,
      unusedRuntimeCodeAbsent: true,
      removalRebuild: true,
    });
    expect(fixture.requests.map(({ arguments: arguments_ }) => arguments_)).toEqual([
      ['exec', 'tsc', '--noEmit', '--project', 'tsconfig.json'],
      ['exec', 'vite', 'build'],
      ['remove', '@wayglass/icons'],
      ['exec', 'tsc', '--noEmit', '--project', 'tsconfig.json'],
      ['exec', 'vite', 'build'],
    ]);
    expect(runtimeStages).toEqual(['primary', 'removal']);
  });

  it('rejects missing CSS proof and bundled unused packages', async () => {
    await expect(
      runVanillaBuildProbe(context(project(), { javascript, css: 'data-wg-theme' }).context),
    ).rejects.toThrow(/WG_RC_VANILLA_CSS/);
    await expect(
      runVanillaBuildProbe(
        context(project(), { javascript: `${javascript};wg-icon`, css }).context,
      ),
    ).rejects.toThrow(/WG_RC_VANILLA_TREE_SHAKING/);
  });

  it('rejects a non-Vanilla project before executing commands', async () => {
    const root = project();
    const fixture = context(root);
    await expect(
      runVanillaBuildProbe({ ...fixture.context, scenario: consumerScenarios()[2]! }),
    ).rejects.toThrow(/WG_RC_VANILLA_SCENARIO/);
    expect(fixture.requests).toEqual([]);
  });

  it('runs both compiler scenarios through fresh verified consumer projects', async () => {
    const fixture = evidenceFixture();
    const projectRoots = new Set<string>();
    const runner: CommandRunner = async (request) => {
      projectRoots.add(request.cwd);
      if (request.arguments[0] === 'remove') {
        const manifest = JSON.parse(readFileSync(resolve(request.cwd, 'package.json'), 'utf8')) as {
          dependencies: Record<string, string>;
        };
        delete manifest.dependencies['@wayglass/icons'];
        writeFileSync(resolve(request.cwd, 'package.json'), JSON.stringify(manifest));
      }
      if (request.arguments.includes('vite')) {
        rmSync(resolve(request.cwd, 'dist'), { recursive: true, force: true });
        mkdirSync(resolve(request.cwd, 'dist/assets'), { recursive: true });
        writeFileSync(resolve(request.cwd, 'dist/index.html'), '<!doctype html>');
        writeFileSync(resolve(request.cwd, 'dist/assets/main.js'), javascript);
        writeFileSync(resolve(request.cwd, 'dist/assets/main.css'), css);
      }
      return { stdout: '', stderr: '' };
    };
    const results = await probeVanillaConsumers({
      evidencePath: fixture.evidence,
      storePath: fixture.store,
      runner,
      environment: { PATH: process.env.PATH },
    });
    expect(results.map(({ scenarioId }) => scenarioId)).toEqual([
      'vanilla-ts-5.9.3',
      'vanilla-ts-6.0.3',
    ]);
    const consumerRoots = [...projectRoots].filter((root) => root.includes('wayglass-rc-vanilla-'));
    expect(new Set(consumerRoots).size).toBe(2);
    expect(consumerRoots.every((root) => !existsSync(root))).toBe(true);
  });
});
