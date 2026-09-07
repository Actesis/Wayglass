import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { consumerScenarios } from '../src/consumer.ts';
import { candidateDirectories, frozenSource } from '../src/constants.ts';
import { serializeEvidence } from '../src/evidence.ts';
import { sha256 } from '../src/hash.ts';
import { reactRemovalPackages } from '../src/react-consumer.ts';
import { probeReactConsumers, runReactBuildProbe } from '../src/react-probe.ts';
import type {
  CandidateEvidence,
  CommandRequest,
  CommandRunner,
  ConsumerProjectContext,
} from '../src/types.ts';

const temporary: string[] = [];
const reactJavascript = [
  'WG_REACT_CLIENT_FALLBACK_READY',
  'WG_REACT_RETAINED_WRAPPER_NOT_REGISTERED',
  'WG_REACT_UNUSED_ELEMENT_REGISTERED',
  'WG_REACT_DIRECT_PARITY_FAILED',
  'WG_REACT_EVENT_ADAPTATION_FAILED',
  'wg-toggle-request',
].join(';');
const directJavascript = 'WG_REACT_BINDING_REMOVED';
const css = [
  '--wg-color-semantic-condition-positive',
  'data-wg-theme',
  'data-wg-density',
  '--wg-component-toggle-color',
].join(';');

function temp(prefix: string): string {
  const root = mkdtempSync(resolve(tmpdir(), prefix));
  temporary.push(root);
  return root;
}

function project(): string {
  const root = temp('wayglass-rc-react-probe-');
  mkdirSync(resolve(root, 'src'));
  writeFileSync(resolve(root, 'src/main.tsx'), "import 'react-dom/client';\n");
  writeFileSync(resolve(root, 'src/package-surface.ts'), 'export {};\n');
  writeFileSync(
    resolve(root, 'package.json'),
    JSON.stringify({
      dependencies: {
        '@wayglass/react': 'file:./vendor/react.tgz',
        react: '19.0.0',
        'react-dom': '19.0.0',
      },
      devDependencies: { '@types/react': '19.0.0', '@types/react-dom': '19.0.0' },
    }),
  );
  return root;
}

function evidenceFixture(): { readonly evidence: string; readonly store: string } {
  const root = temp('wayglass-rc-react-evidence-');
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

function context(
  root: string,
  reactOutput = reactJavascript,
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
        devDependencies: Record<string, string>;
      };
      for (const name of reactRemovalPackages) {
        delete manifest.dependencies[name];
        delete manifest.devDependencies[name];
      }
      writeFileSync(resolve(root, 'package.json'), JSON.stringify(manifest));
    }
    if (request.arguments.includes('vite')) {
      rmSync(resolve(root, 'dist'), { recursive: true, force: true });
      mkdirSync(resolve(root, 'dist/assets'), { recursive: true });
      writeFileSync(resolve(root, 'dist/index.html'), '<!doctype html>');
      const direct = !readFileSync(resolve(root, 'src/main.tsx'), 'utf8').includes(
        'react-dom/client',
      );
      writeFileSync(resolve(root, 'dist/assets/main.js'), direct ? directJavascript : reactOutput);
      writeFileSync(resolve(root, 'dist/assets/main.css'), css);
    }
    return { stdout: '', stderr: '' };
  };
  return {
    context: {
      root,
      scenario: consumerScenarios()[2]!,
      run: runner,
      environment: { PNPM_CONFIG_OFFLINE: 'true' },
    },
    requests,
  };
}

describe('release-candidate React build probe', () => {
  it('builds, inspects, removes all React packages, and rebuilds direct elements', async () => {
    const fixture = context(project());
    const runtimeStages: string[] = [];
    await expect(
      runReactBuildProbe(fixture.context, async (runtimeContext, stage) => {
        expect(runtimeContext).toBe(fixture.context);
        runtimeStages.push(stage);
      }),
    ).resolves.toMatchObject({
      scenarioId: 'react-19.0.0-ts-5.9.3',
      guardedRegistrationFixture: true,
      bindingRemovalRebuild: true,
    });
    expect(fixture.requests.map(({ arguments: arguments_ }) => arguments_)).toEqual([
      ['exec', 'tsc', '--noEmit', '--project', 'tsconfig.json'],
      ['exec', 'vite', 'build'],
      ['remove', ...reactRemovalPackages],
      ['exec', 'tsc', '--noEmit', '--project', 'tsconfig.json'],
      ['exec', 'vite', 'build'],
    ]);
    expect(runtimeStages).toEqual(['primary', 'removal']);
  });

  it('rejects missing fixture proof and unused wrappers', async () => {
    await expect(
      runReactBuildProbe(context(project(), 'WG_REACT_CLIENT_FALLBACK_READY').context),
    ).rejects.toThrow(/WG_RC_REACT_RUNTIME_FIXTURE/);
    await expect(
      runReactBuildProbe(context(project(), `${reactJavascript};wg-media-viewer`).context),
    ).rejects.toThrow(/WG_RC_REACT_TREE_SHAKING/);
  });

  it('rejects a non-React project before executing commands', async () => {
    const fixture = context(project());
    await expect(
      runReactBuildProbe({ ...fixture.context, scenario: consumerScenarios()[0]! }),
    ).rejects.toThrow(/WG_RC_REACT_SCENARIO/);
    expect(fixture.requests).toEqual([]);
  });

  it('runs all four version combinations through fresh verified projects', async () => {
    const fixture = evidenceFixture();
    const projectRoots = new Set<string>();
    const runner: CommandRunner = async (request) => {
      projectRoots.add(request.cwd);
      if (request.arguments[0] === 'remove') {
        const manifest = JSON.parse(readFileSync(resolve(request.cwd, 'package.json'), 'utf8')) as {
          dependencies: Record<string, string>;
          devDependencies: Record<string, string>;
        };
        for (const name of reactRemovalPackages) {
          delete manifest.dependencies[name];
          delete manifest.devDependencies[name];
        }
        writeFileSync(resolve(request.cwd, 'package.json'), JSON.stringify(manifest));
      }
      if (request.arguments.includes('vite')) {
        rmSync(resolve(request.cwd, 'dist'), { recursive: true, force: true });
        mkdirSync(resolve(request.cwd, 'dist/assets'), { recursive: true });
        writeFileSync(resolve(request.cwd, 'dist/index.html'), '<!doctype html>');
        const direct = !readFileSync(resolve(request.cwd, 'src/main.tsx'), 'utf8').includes(
          'react-dom/client',
        );
        writeFileSync(
          resolve(request.cwd, 'dist/assets/main.js'),
          direct ? directJavascript : reactJavascript,
        );
        writeFileSync(resolve(request.cwd, 'dist/assets/main.css'), css);
      }
      return { stdout: '', stderr: '' };
    };
    const results = await probeReactConsumers({
      evidencePath: fixture.evidence,
      storePath: fixture.store,
      runner,
      environment: { PATH: process.env.PATH },
    });
    expect(results.map(({ scenarioId }) => scenarioId)).toEqual(
      consumerScenarios()
        .filter(({ kind }) => kind === 'react')
        .map(({ id }) => id),
    );
    expect(projectRoots.size).toBe(4);
    expect([...projectRoots].every((root) => !existsSync(root))).toBe(true);
  });
});
