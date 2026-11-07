import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import * as browserProbe from '../src/browser-probe.ts';
import type { BrowserConsumerMatrixResult } from '../src/browser-probe.ts';
import { consumerScenarios } from '../src/consumer.ts';
import { candidateDirectories, frozenSource } from '../src/constants.ts';
import { sha256 } from '../src/hash.ts';
import * as publicationArtifacts from '../src/publication-artifacts.ts';
import { verifyPublicationConsumerProof } from '../src/publication-proof.ts';
import {
  provePublicationConsumers,
  retainConsumerGraph,
  verifyConsumerProofCoverage,
} from '../src/publication-consumers.ts';
import type {
  CommandRunner,
  ConsumerProjectContext,
  ConsumerScenario,
  PublicationEvidence,
} from '../src/types.ts';
import { repositoryRoot } from './fixtures.ts';

const temporary: string[] = [];
function temp() {
  const root = mkdtempSync(resolve(tmpdir(), 'wayglass-public-consumer-test-'));
  temporary.push(root);
  return root;
}
afterEach(() => {
  vi.restoreAllMocks();
  for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true });
});

function context(scenario: ConsumerScenario): ConsumerProjectContext {
  const root = temp();
  mkdirSync(resolve(root, 'node_modules/.pnpm'), { recursive: true });
  for (const file of [
    'package.json',
    'pnpm-workspace.yaml',
    'pnpm-lock.yaml',
    'node_modules/.pnpm/lock.yaml',
  ]) {
    writeFileSync(resolve(root, file), `${scenario.id}:${file}\n`);
  }
  return { root, scenario, environment: {}, run: async () => ({ stdout: '', stderr: '' }) };
}

function matrix(): BrowserConsumerMatrixResult {
  const scenarios = consumerScenarios();
  return {
    vanilla: scenarios
      .filter(({ kind }) => kind === 'vanilla')
      .map(({ id }) => ({
        scenarioId: id,
        declarations: true,
        productionBuild: true,
        css: true,
        runtimeFixture: true,
        unusedRuntimeCodeAbsent: true,
        removalRebuild: true,
      })),
    react: scenarios
      .filter(({ kind }) => kind === 'react')
      .map(({ id }) => ({
        scenarioId: id,
        declarations: true,
        productionBuild: true,
        css: true,
        clientFallbackFixture: true,
        parityAndEventsFixture: true,
        guardedRegistrationFixture: true,
        unusedWrappersAbsent: true,
        bindingRemovalRebuild: true,
      })),
    browsers: scenarios.flatMap(({ id, kind }) =>
      (['primary', 'removal'] as const).flatMap((stage) =>
        browserProbe.consumerBrowserEngines.map((engine) => ({
          scenarioId: id,
          kind,
          stage,
          engine,
          runtime: true,
          semantics: true,
          accessibility: true,
        })),
      ),
    ),
  };
}

describe('retained public consumer proof', () => {
  it('retains and rehashes all twelve exact resolved and installed graph snapshots', () => {
    const output = temp();
    const graphs = consumerScenarios().flatMap((scenario) => {
      const project = context(scenario);
      return (['primary', 'removal'] as const).map((stage) =>
        retainConsumerGraph(output, project, stage),
      );
    });
    expect(graphs.flatMap(({ files }) => files)).toHaveLength(48);
    expect(() => verifyConsumerProofCoverage(output, matrix(), graphs)).not.toThrow();
    expect(() =>
      verifyConsumerProofCoverage(
        output,
        { ...matrix(), browsers: matrix().browsers.slice(1) },
        graphs,
      ),
    ).toThrow(/WG_RC_PUBLICATION_COVERAGE/);
    expect(() => verifyConsumerProofCoverage(output, matrix(), graphs.slice(1))).toThrow(
      /WG_RC_PUBLICATION_COVERAGE/,
    );
    const broken = matrix();
    Reflect.deleteProperty(broken.vanilla[0]!, 'declarations');
    expect(() => verifyConsumerProofCoverage(output, broken, graphs)).toThrow(
      /WG_RC_PUBLICATION_COVERAGE/,
    );
    writeFileSync(resolve(output, graphs[0]!.files[0]!.path), 'changed');
    expect(() => verifyConsumerProofCoverage(output, matrix(), graphs)).toThrow(
      /WG_RC_PUBLICATION_GRAPH/,
    );
  });
  it('rejects unknown scenarios, repeated retention, and symlink graph inputs', () => {
    const output = temp();
    const project = context(consumerScenarios()[0]!);
    expect(() =>
      retainConsumerGraph(
        output,
        { ...project, scenario: { ...project.scenario, id: '../escape' } },
        'primary',
      ),
    ).toThrow(/WG_RC_PUBLICATION_GRAPH/);
    retainConsumerGraph(output, project, 'primary');
    expect(() => retainConsumerGraph(output, project, 'primary')).toThrow();
    rmSync(resolve(project.root, 'pnpm-lock.yaml'));
    symlinkSync(resolve(project.root, 'package.json'), resolve(project.root, 'pnpm-lock.yaml'));
    expect(() => retainConsumerGraph(output, project, 'removal')).toThrow(
      /WG_RC_PUBLICATION_GRAPH/,
    );
  });
  it('retains a complete success bundle and removes only its own output after a matrix failure', async () => {
    const input = temp();
    mkdirSync(resolve(input, 'packages'));
    const evidencePath = resolve(input, 'publication-evidence.json');
    const candidate: PublicationEvidence = {
      schemaVersion: 1,
      artifactKind: 'publication-review',
      publicationAuthorized: false,
      distTag: null,
      reproducibility: { runs: 2, byteIdentical: true },
      environment: {
        platform: 'test',
        architecture: 'test',
        node: 'v26.8.1',
        pnpm: '11.9.0',
        npm: '11.19.0',
      },
      source: frozenSource,
      tooling: { commit: 'c'.repeat(40), tree: 'd'.repeat(40) },
      packages: candidateDirectories.map((directory) => ({
        directory,
        file: `wayglass-${directory}.tgz`,
        name: `@wayglass/${directory}`,
        version: '0.1.0',
        bytes: directory.length,
        sha256: sha256(directory),
        manifestSha256: 'a'.repeat(64),
        inventorySha256: 'b'.repeat(64),
        unpackedBytes: 1,
        files: [],
      })),
    };
    writeFileSync(evidencePath, JSON.stringify(candidate));
    for (const entry of candidate.packages)
      writeFileSync(resolve(input, 'packages', entry.file), entry.directory);
    vi.spyOn(publicationArtifacts, 'verifyPublicationArtifacts').mockResolvedValue(candidate);
    vi.spyOn(browserProbe, 'observeConsumerBrowserVersions').mockResolvedValue({
      chromium: 'test',
      firefox: 'test',
      webkit: 'test',
    });
    const run = vi
      .spyOn(browserProbe, 'runBrowserConsumerMatrix')
      .mockImplementation(async (request) => {
        expect(request.publicationReview).toBe(true);
        expect(request.execute).toBeUndefined();
        for (const scenario of consumerScenarios())
          for (const stage of ['primary', 'removal'] as const) {
            await request.observe!(context(scenario), stage);
          }
        return matrix();
      });
    const runner: CommandRunner = async (request) => ({
      stdout: request.arguments.includes('--show-toplevel')
        ? repositoryRoot
        : request.arguments.includes('HEAD')
          ? 'a'.repeat(40)
          : request.arguments.includes('HEAD^{tree}')
            ? 'b'.repeat(40)
            : request.arguments.includes('--version')
              ? '11.9.0'
              : '',
      stderr: '',
    });
    const parent = temp();
    const output = resolve(parent, 'success');
    const proofPath = await provePublicationConsumers(
      repositoryRoot,
      evidencePath,
      input,
      output,
      runner,
      { npm_execpath: process.execPath },
    );
    const proof = JSON.parse(readFileSync(proofPath, 'utf8'));
    expect(proof).toMatchObject({
      publicationAuthorized: false,
      distTag: null,
      candidateEvidence: { sha256: sha256(readFileSync(evidencePath)) },
    });
    expect(proof.graphs).toHaveLength(12);
    const originalProof = readFileSync(proofPath);
    await expect(
      verifyPublicationConsumerProof(repositoryRoot, proofPath, runner, {}),
    ).resolves.toEqual({
      proofSha256: sha256(originalProof),
      candidateEvidenceSha256: sha256(readFileSync(evidencePath)),
    });
    for (const change of [
      { publicationAuthorized: true },
      { distTag: 'latest' },
      { candidateEvidence: { ...proof.candidateEvidence, path: '../escape.json' } },
      { candidateEvidence: { ...proof.candidateEvidence, sha256: '0'.repeat(64) } },
      { source: { ...proof.source, commit: '0'.repeat(40) } },
      { assemblyTooling: { ...proof.assemblyTooling, commit: '0'.repeat(40) } },
      { limitations: { ...proof.limitations, hostedRunAuthenticated: true } },
      { environment: { ...proof.environment, pnpm: '11.25.0' } },
    ]) {
      writeFileSync(proofPath, JSON.stringify({ ...proof, ...change }));
      await expect(
        verifyPublicationConsumerProof(repositoryRoot, proofPath, runner, {}),
      ).rejects.toThrow(/WG_RC_PUBLICATION_PROOF/);
    }
    writeFileSync(proofPath, originalProof);
    await expect(
      provePublicationConsumers(repositoryRoot, evidencePath, input, output, runner, {
        npm_execpath: process.execPath,
      }),
    ).rejects.toThrow(/WG_RC_OUTPUT_EXISTS/);
    expect(existsSync(proofPath)).toBe(true);
    const wrongVersion: CommandRunner = async (request) =>
      request.arguments.includes('--version') ? { stdout: '11.25.0', stderr: '' } : runner(request);
    const rejectedVersion = resolve(parent, 'wrong-version');
    await expect(
      provePublicationConsumers(
        repositoryRoot,
        evidencePath,
        input,
        rejectedVersion,
        wrongVersion,
        { npm_execpath: process.execPath },
      ),
    ).rejects.toThrow(/WG_RC_PACKAGE_MANAGER_EXECUTABLE/);
    expect(existsSync(rejectedVersion)).toBe(false);
    run.mockRejectedValueOnce(new Error('browser failed'));
    const failed = resolve(parent, 'failed');
    await expect(
      provePublicationConsumers(repositoryRoot, evidencePath, input, failed, runner, {
        npm_execpath: process.execPath,
      }),
    ).rejects.toThrow('browser failed');
    expect(existsSync(failed)).toBe(false);
    expect(existsSync(proofPath)).toBe(true);
    expect(existsSync(evidencePath)).toBe(true);
  });
  it('rejects release credentials before any effect', async () => {
    await expect(
      verifyPublicationConsumerProof(
        '/absent',
        '/absent',
        async () => {
          throw new Error('must not run');
        },
        { NPM_TOKEN: 'test' },
      ),
    ).rejects.toThrow(/WG_RC_CREDENTIAL_EXPOSURE/);
    await expect(
      provePublicationConsumers(
        '/absent',
        '/absent',
        '/absent',
        '/absent',
        async () => {
          throw new Error('must not run');
        },
        { NPM_TOKEN: 'test' },
      ),
    ).rejects.toThrow(/WG_RC_CREDENTIAL_EXPOSURE/);
  });
});
