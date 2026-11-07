import { cpSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { packageManagerInvocation } from './assembler.ts';
import {
  consumerBrowserEngines,
  observeConsumerBrowserVersions,
  runBrowserConsumerMatrix,
  type BrowserConsumerMatrixResult,
} from './browser-probe.ts';
import { validateConsumerStore } from './consumer-harness.ts';
import { consumerScenarios } from './consumer.ts';
import { candidateToolVersions } from './constants.ts';
import { offlineEnvironment } from './environment.ts';
import { fail } from './error.ts';
import { sha256 } from './hash.ts';
import { validateNewOutputPath } from './path-safety.ts';
import { commandText } from './process.ts';
import { verifyPublicationArtifacts } from './publication-artifacts.ts';
import { assertCleanTooling, identifyRepository } from './repository.ts';
import type {
  CommandRunner,
  ConsumerBuildStage,
  ConsumerProjectContext,
  RetainedEvidenceFile,
} from './types.ts';

const graphFiles = Object.freeze([
  ['package.json', 'package.json'],
  ['pnpm-workspace.yaml', 'pnpm-workspace.yaml'],
  ['pnpm-lock.yaml', 'pnpm-lock.yaml'],
  ['node_modules/.pnpm/lock.yaml', 'installed-lock.yaml'],
] as const);

export interface ConsumerGraphSnapshot {
  readonly scenarioId: string;
  readonly stage: ConsumerBuildStage;
  readonly files: readonly RetainedEvidenceFile[];
}

export function retainConsumerGraph(
  output: string,
  context: ConsumerProjectContext,
  stage: ConsumerBuildStage,
): ConsumerGraphSnapshot {
  if (
    !consumerScenarios().some(
      (scenario) => JSON.stringify(scenario) === JSON.stringify(context.scenario),
    ) ||
    !['primary', 'removal'].includes(stage)
  ) {
    fail('WG_RC_PUBLICATION_GRAPH', 'Only accepted consumer scenarios and stages may be retained.');
  }
  const directory = `graphs/${context.scenario.id}/${stage}`;
  mkdirSync(resolve(output, directory), { recursive: true });
  const files = graphFiles.map(([source, name]) => {
    const input = resolve(context.root, source);
    if (!lstatSync(input).isFile() || lstatSync(input).isSymbolicLink()) {
      fail('WG_RC_PUBLICATION_GRAPH', `${source} must be a regular consumer file.`);
    }
    const bytes = readFileSync(input);
    const path = `${directory}/${name}`;
    writeFileSync(resolve(output, path), bytes, { flag: 'wx' });
    return Object.freeze({ path, bytes: bytes.byteLength, sha256: sha256(bytes) });
  });
  return Object.freeze({ scenarioId: context.scenario.id, stage, files: Object.freeze(files) });
}

function sameCoverage(actual: readonly string[], expected: readonly string[]): boolean {
  return JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
}

export function verifyConsumerProofCoverage(
  output: string,
  matrix: BrowserConsumerMatrixResult,
  graphs: readonly ConsumerGraphSnapshot[],
): void {
  const scenarios = consumerScenarios();
  const stages = ['primary', 'removal'] as const;
  const expectedGraphs = scenarios.flatMap(({ id }) => stages.map((stage) => `${id}/${stage}`));
  if (
    !sameCoverage(
      graphs.map(({ scenarioId, stage }) => `${scenarioId}/${stage}`),
      expectedGraphs,
    ) ||
    !sameCoverage(
      matrix.browsers.map((result) => `${result.scenarioId}/${result.stage}/${result.engine}`),
      expectedGraphs.flatMap((key) => consumerBrowserEngines.map((engine) => `${key}/${engine}`)),
    )
  ) {
    fail(
      'WG_RC_PUBLICATION_COVERAGE',
      'Proof requires exactly six consumers, twelve graphs, and 36 browser cases.',
    );
  }
  for (const kind of ['vanilla', 'react'] as const) {
    const expected = scenarios.filter((scenario) => scenario.kind === kind).map(({ id }) => id);
    const fields =
      kind === 'vanilla'
        ? [
            'declarations',
            'productionBuild',
            'css',
            'runtimeFixture',
            'unusedRuntimeCodeAbsent',
            'removalRebuild',
          ]
        : [
            'declarations',
            'productionBuild',
            'css',
            'clientFallbackFixture',
            'parityAndEventsFixture',
            'guardedRegistrationFixture',
            'unusedWrappersAbsent',
            'bindingRemovalRebuild',
          ];
    if (
      !sameCoverage(
        matrix[kind].map(({ scenarioId }) => scenarioId),
        expected,
      ) ||
      matrix[kind].some(
        (result) =>
          !sameCoverage(Object.keys(result), ['scenarioId', ...fields]) ||
          Object.entries(result).some(([key, value]) => key !== 'scenarioId' && value !== true),
      )
    ) {
      fail('WG_RC_PUBLICATION_COVERAGE', `${kind} consumer build evidence is incomplete.`);
    }
  }
  for (const result of matrix.browsers) {
    if (
      scenarios.find(({ id }) => id === result.scenarioId)?.kind !== result.kind ||
      result.runtime !== true ||
      result.semantics !== true ||
      result.accessibility !== true
    ) {
      fail('WG_RC_PUBLICATION_COVERAGE', 'Browser result did not pass every required assertion.');
    }
  }
  for (const graph of graphs) {
    const expectedPaths = graphFiles.map(
      ([, name]) => `graphs/${graph.scenarioId}/${graph.stage}/${name}`,
    );
    if (
      !sameCoverage(
        graph.files.map(({ path }) => path),
        expectedPaths,
      )
    ) {
      fail(
        'WG_RC_PUBLICATION_GRAPH',
        'Each stage requires its exact resolved and installed graph files.',
      );
    }
    for (const file of graph.files) {
      const path = resolve(output, file.path);
      if (!lstatSync(path).isFile() || lstatSync(path).isSymbolicLink()) {
        fail('WG_RC_PUBLICATION_GRAPH', 'Retained graph files must remain regular files.');
      }
      const bytes = readFileSync(path);
      if (bytes.byteLength !== file.bytes || sha256(bytes) !== file.sha256) {
        fail('WG_RC_PUBLICATION_GRAPH', 'Retained dependency graph hash mismatch.');
      }
    }
  }
}

export async function provePublicationConsumers(
  cwd: string,
  evidencePath: string,
  storePath: string,
  outputPath: string,
  runner: CommandRunner,
  inputEnvironment: NodeJS.ProcessEnv,
): Promise<string> {
  const environment = offlineEnvironment(inputEnvironment);
  const repository = await identifyRepository(cwd, runner);
  await assertCleanTooling(repository, runner);
  const candidate = await verifyPublicationArtifacts(cwd, evidencePath, runner, environment);
  const store = validateConsumerStore(storePath);
  const output = validateNewOutputPath(outputPath, repository.root);
  const pnpm = await commandText(runner, {
    ...packageManagerInvocation(environment, ['--version']),
    cwd: repository.root,
    environment,
  });
  if (pnpm !== candidateToolVersions.pnpm) {
    fail(
      'WG_RC_PACKAGE_MANAGER_EXECUTABLE',
      `Consumer proof requires pnpm ${candidateToolVersions.pnpm}.`,
    );
  }
  const browsers = await observeConsumerBrowserVersions();
  mkdirSync(output);
  try {
    const retainedCandidate = resolve(output, 'candidate');
    mkdirSync(resolve(retainedCandidate, 'packages'), { recursive: true });
    const retainedEvidence = resolve(retainedCandidate, 'publication-evidence.json');
    cpSync(evidencePath, retainedEvidence, { errorOnExist: true });
    for (const entry of candidate.packages) {
      cpSync(
        resolve(evidencePath, '..', 'packages', entry.file),
        resolve(retainedCandidate, 'packages', entry.file),
        { errorOnExist: true },
      );
    }
    await verifyPublicationArtifacts(cwd, retainedEvidence, runner, environment);
    const graphs: ConsumerGraphSnapshot[] = [];
    const matrix = await runBrowserConsumerMatrix({
      publicationReview: true,
      evidencePath: retainedEvidence,
      storePath: store,
      runner,
      environment,
      observe: async (context, stage) => {
        graphs.push(retainConsumerGraph(output, context, stage));
      },
    });
    verifyConsumerProofCoverage(output, matrix, graphs);
    await verifyPublicationArtifacts(cwd, retainedEvidence, runner, environment);
    const path = resolve(output, 'consumer-proof.json');
    writeFileSync(
      path,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          artifactKind: 'publication-consumer-review',
          publicationAuthorized: false,
          distTag: null,
          source: candidate.source,
          assemblyTooling: candidate.tooling,
          tooling: { commit: repository.commit, tree: repository.tree },
          candidateEvidence: {
            path: 'candidate/publication-evidence.json',
            sha256: sha256(readFileSync(retainedEvidence)),
          },
          environment: {
            platform: process.platform,
            architecture: process.arch,
            node: process.version,
            pnpm,
            browsers,
          },
          limitations: {
            hostedRunAuthenticated: false,
            humanAssistiveTechnology: false,
            windowsNvdaObserved: false,
          },
          matrix,
          graphs,
        },
        null,
        2,
      )}\n`,
      { flag: 'wx' },
    );
    return path;
  } catch (error) {
    // This directory was newly created by this command; caller-owned input archives are untouched.
    rmSync(output, { recursive: true, force: true });
    throw error;
  }
}
