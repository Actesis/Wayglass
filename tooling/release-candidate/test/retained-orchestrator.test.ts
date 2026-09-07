import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  serializeAdvisorySnapshot,
  type AdvisorySnapshotEvidence,
} from '../src/advisory-snapshot.ts';
import type { CandidateBuildResult } from '../src/assembler.ts';
import type { BrowserConsumerMatrixResult } from '../src/browser-probe.ts';
import {
  acceptedDocumentHashes,
  candidateDirectories,
  expectedDependencies,
  expectedPeerDependencies,
  expectedSideEffects,
  frozenSource,
  qualityGateIds,
} from '../src/constants.ts';
import { serializeDependencyAudit, type DependencyAuditEvidence } from '../src/dependency-audit.ts';
import { serializeEvidence } from '../src/evidence.ts';
import { ReleaseCandidateError } from '../src/error.ts';
import { hashFileInventory, sha256 } from '../src/hash.ts';
import { collectEnvironmentAudit, collectQualityGateEvidence } from '../src/observation-audit.ts';
import type { PackageAuditEvidence } from '../src/package-audit.ts';
import {
  runRetainedCandidate,
  verifyIntegratedBundle,
  type IntegratedRepositoryContext,
  type RetainedOrchestratorOperations,
} from '../src/retained-orchestrator.ts';
import type {
  CandidateEvidence,
  ConsumerBrowserProbeResult,
  IntegratedCandidateEvidence,
  ReactBuildProbeResult,
  VanillaBuildProbeResult,
} from '../src/types.ts';
import { consumerScenarios } from '../src/consumer.ts';

const tooling = { commit: 'a'.repeat(40), tree: 'b'.repeat(40) };
const observedAt = '2026-09-08T12:00:00Z';

function candidate(changed = false): CandidateEvidence {
  return {
    schemaVersion: 1,
    source: frozenSource,
    tooling,
    environment: {
      platform: 'darwin',
      architecture: 'arm64',
      node: 'v26.0.0',
      pnpm: '11.9.0',
      npm: '11.6.0',
    },
    reproducibility: { runs: 2, byteIdentical: true },
    packages: candidateDirectories.map((directory, index) => {
      const files = [
        { path: 'LICENSE', bytes: 10, sha256: acceptedDocumentHashes.license },
        { path: 'NOTICE', bytes: 10, sha256: acceptedDocumentHashes.notice },
        { path: 'README.md', bytes: 10, sha256: sha256(`readme:${directory}`) },
        { path: 'dist/index.js', bytes: 10, sha256: sha256(`dist:${directory}`) },
        { path: 'package.json', bytes: 10, sha256: sha256(`manifest:${directory}`) },
      ];
      const tarball = `${directory}:${changed && index === 0 ? 'changed' : 'accepted'}`;
      return {
        directory,
        name: `@wayglass/${directory}`,
        version: '0.1.0',
        file: `wayglass-${directory}-0.1.0.tgz`,
        bytes: Buffer.byteLength(tarball),
        sha256: sha256(tarball),
        manifestSha256: files.at(-1)!.sha256,
        inventorySha256: hashFileInventory(files),
        unpackedBytes: files.reduce((total, file) => total + file.bytes, 0),
        files,
      };
    }),
  };
}

function packageAudit(evidence: CandidateEvidence): PackageAuditEvidence {
  return {
    schemaVersion: 1,
    packages: evidence.packages.map((package_, index) => ({
      directory: package_.directory,
      name: package_.name,
      version: '0.1.0',
      private: true,
      manifestSha256: package_.manifestSha256,
      licenseSha256: acceptedDocumentHashes.license,
      noticeSha256: acceptedDocumentHashes.notice,
      fileCount: package_.files.length,
      unpackedBytes: package_.unpackedBytes,
      inventorySha256: package_.inventorySha256,
      exports: [],
      dependencies: expectedDependencies[candidateDirectories[index]!] ?? {},
      peerDependencies: expectedPeerDependencies[candidateDirectories[index]!] ?? {},
      sideEffects: expectedSideEffects[candidateDirectories[index]!],
      lifecycleScriptsAbsent: true,
      privateFilesAbsent: true,
      sourceMaps: [],
    })),
  };
}

function dependencyAudit(): DependencyAuditEvidence {
  const node = (
    name: string,
    version: string,
    dependencies: readonly { readonly name: string; readonly version: string }[] = [],
  ) => ({
    name,
    version,
    packageJsonSha256: sha256(`manifest:${name}`),
    declaredLicense: 'BSD-3-Clause',
    licenseFiles: [{ path: 'LICENSE', bytes: 10, sha256: sha256(`license:${name}`) }],
    lifecycleScripts: [],
    dependencies,
    peerDependencies: {},
  });
  return {
    schemaVersion: 1,
    releaseUnits: candidateDirectories.map((directory) => ({
      name: `@wayglass/${directory}`,
      dependencies: expectedDependencies[directory] ?? {},
      peerDependencies: expectedPeerDependencies[directory] ?? {},
    })),
    productionRoots: [
      { name: '@lit/react', version: '1.0.8' },
      { name: 'lit', version: '3.3.3' },
    ],
    productionGraph: [
      node('@lit-labs/ssr-dom-shim', '1.6.0'),
      node('@lit/react', '1.0.8'),
      node('@lit/reactive-element', '2.1.2', [
        { name: '@lit-labs/ssr-dom-shim', version: '1.6.0' },
      ]),
      node('@types/trusted-types', '2.0.7'),
      node('lit-element', '4.2.2', [
        { name: '@lit-labs/ssr-dom-shim', version: '1.6.0' },
        { name: '@lit/reactive-element', version: '2.1.2' },
        { name: 'lit-html', version: '3.3.3' },
      ]),
      node('lit-html', '3.3.3', [{ name: '@types/trusted-types', version: '2.0.7' }]),
      node('lit', '3.3.3', [
        { name: '@lit/reactive-element', version: '2.1.2' },
        { name: 'lit-element', version: '4.2.2' },
        { name: 'lit-html', version: '3.3.3' },
      ]),
    ],
    allProductionNodesReachable: true,
  };
}

function vanillaResult(scenarioId: string): VanillaBuildProbeResult {
  return {
    scenarioId,
    declarations: true,
    productionBuild: true,
    css: true,
    runtimeFixture: true,
    unusedRuntimeCodeAbsent: true,
    removalRebuild: true,
  };
}

function reactResult(scenarioId: string): ReactBuildProbeResult {
  return {
    scenarioId,
    declarations: true,
    productionBuild: true,
    css: true,
    clientFallbackFixture: true,
    parityAndEventsFixture: true,
    guardedRegistrationFixture: true,
    unusedWrappersAbsent: true,
    bindingRemovalRebuild: true,
  };
}

function matrix(): BrowserConsumerMatrixResult {
  const scenarios = consumerScenarios();
  const browsers: ConsumerBrowserProbeResult[] = scenarios.flatMap((scenario) =>
    (['primary', 'removal'] as const).flatMap((stage) =>
      (['chromium', 'firefox', 'webkit'] as const).map((engine) => ({
        scenarioId: scenario.id,
        kind: scenario.kind,
        stage,
        engine,
        runtime: true,
        semantics: true,
        accessibility: true,
      })),
    ),
  );
  return {
    vanilla: scenarios.filter(({ kind }) => kind === 'vanilla').map(({ id }) => vanillaResult(id)),
    react: scenarios.filter(({ kind }) => kind === 'react').map(({ id }) => reactResult(id)),
    browsers,
  };
}

function writeCandidate(output: string, evidence: CandidateEvidence): string {
  mkdirSync(resolve(output, 'packages'), { recursive: true });
  for (const package_ of evidence.packages) {
    const changed = package_.sha256 === sha256(`${package_.directory}:changed`);
    writeFileSync(
      resolve(output, 'packages', package_.file),
      `${package_.directory}:${changed ? 'changed' : 'accepted'}`,
    );
  }
  const path = resolve(output, 'evidence.json');
  writeFileSync(path, serializeEvidence(evidence));
  return path;
}

function advisory(dependencyHash: string): AdvisorySnapshotEvidence {
  return {
    schemaVersion: 1,
    source: {
      provider: 'npm-security-advisories',
      captureMethod: 'approved-read-only-snapshot',
      capturedAt: '2026-09-07T12:00:00Z',
      validThrough: '2026-09-14T12:00:00Z',
      sha256: sha256('approved upstream snapshot'),
    },
    scope: {
      lockfileSha256: frozenSource.lockfileSha256,
      dependencyAuditSha256: dependencyHash,
      productionOnly: true,
    },
    findings: [],
    notices: [],
  };
}

interface Harness {
  readonly root: string;
  readonly repository: IntegratedRepositoryContext;
  readonly advisoryPath: string;
  readonly output: string;
  readonly operations: RetainedOrchestratorOperations;
  readonly counts: { builds: number; consumers: number };
}

function writeValidAdvisory(value: Harness): void {
  const dependencies = dependencyAudit();
  const advisoryValue = advisory(sha256(serializeDependencyAudit(dependencies)));
  writeFileSync(
    value.advisoryPath,
    serializeAdvisorySnapshot(advisoryValue, {
      referenceTime: observedAt,
      dependencyAuditSha256: advisoryValue.scope.dependencyAuditSha256,
      productionDependencies: dependencies.productionGraph.map(({ name, version }) => ({
        name,
        version,
      })),
    }),
  );
}

async function runHarness(value: Harness) {
  return runRetainedCandidate(
    value.repository.root,
    frozenSource.commit,
    value.output,
    value.advisoryPath,
    async () => ({ stdout: '', stderr: '' }),
    {},
    value.operations,
  );
}

function expectNoPartialBundle(value: Harness): void {
  expect(existsSync(value.output)).toBe(false);
  expect(readdirSync(value.root).some((name) => name.startsWith('.retained.partial-'))).toBe(false);
}

function harness(secondChanged = false): Harness {
  const root = mkdtempSync(resolve(tmpdir(), 'wayglass-rc-orchestrator-test-'));
  const repositoryRoot = resolve(root, 'repository');
  const storePath = resolve(repositoryRoot, '.pnpm-store');
  mkdirSync(storePath, { recursive: true });
  const repository = { root: repositoryRoot, storePath, ...tooling };
  const first = candidate();
  const dependencies = dependencyAudit();
  const advisoryPath = resolve(root, 'advisory.json');
  const output = resolve(root, 'retained');
  const counts = { builds: 0, consumers: 0 };
  const environment = collectEnvironmentAudit({
    platform: 'darwin',
    operatingSystemVersion: '26.0',
    architecture: 'arm64',
    node: 'v26.0.0',
    pnpm: '11.9.0',
    npm: '11.6.0',
    playwright: '1.62.0',
    browsers: { chromium: '140.0.1.1', firefox: '141.0', webkit: '26.0' },
    observedAt,
  });
  const quality = collectQualityGateEvidence(
    qualityGateIds.map((id) => ({ id, passed: true as const })),
    { startedAt: '2026-09-08T11:00:00Z', completedAt: '2026-09-08T11:10:00Z' },
  );
  const operations: RetainedOrchestratorOperations = {
    prepare: async () => repository,
    quality: async () => quality,
    buildFirst: async (_cwd, _source, path) => {
      counts.builds += 1;
      return {
        evidencePath: writeCandidate(path, first),
        packageAudit: packageAudit(first),
        dependencyAudit: dependencies,
      } satisfies CandidateBuildResult;
    },
    buildSecond: async (_cwd, _source, path) => {
      counts.builds += 1;
      return writeCandidate(path, candidate(secondChanged));
    },
    consumers: async () => {
      counts.consumers += 1;
      return matrix();
    },
    environment: async () => environment,
    now: () => new Date(observedAt),
  };
  return { root, repository, advisoryPath, output, operations, counts };
}

describe('retained two-run orchestrator', () => {
  it('retains one exact verified bundle after two complete runs without retrying', async () => {
    const value = harness();
    try {
      writeValidAdvisory(value);
      const result = await runHarness(value);
      expect(value.counts).toEqual({ builds: 2, consumers: 2 });
      expect(result).toEqual(verifyIntegratedBundle(value.output));
      expect(readdirSync(value.output).sort()).toEqual([
        'audits',
        'integrated-evidence.json',
        'observations',
        'packages',
      ]);
    } finally {
      rmSync(value.root, { recursive: true, force: true });
    }
  });

  it('fails closed on deterministic byte drift and removes the output', async () => {
    const value = harness(true);
    try {
      writeValidAdvisory(value);
      await expect(runHarness(value)).rejects.toThrow(/WG_RC_INTEGRATED_REPRODUCIBILITY/);
      expectNoPartialBundle(value);
      expect(value.counts).toEqual({ builds: 2, consumers: 2 });
    } finally {
      rmSync(value.root, { recursive: true, force: true });
    }
  });

  it('independently rejects changed retained bytes and unexpected files', async () => {
    const value = harness();
    try {
      writeValidAdvisory(value);
      await runHarness(value);
      const record = JSON.parse(
        readFileSync(resolve(value.output, 'integrated-evidence.json'), 'utf8'),
      ) as IntegratedCandidateEvidence;
      const packagePath = resolve(value.output, record.bundle.files[0]!.path);
      writeFileSync(packagePath, 'changed');
      expect(() => verifyIntegratedBundle(value.output)).toThrow(/WG_RC_INTEGRATED_BUNDLE/);
      writeFileSync(resolve(value.output, 'unexpected.txt'), 'unexpected');
      expect(() => verifyIntegratedBundle(value.output)).toThrow(/WG_RC_INTEGRATED_BUNDLE/);
    } finally {
      rmSync(value.root, { recursive: true, force: true });
    }
  });

  it.each([
    'prepare',
    'quality',
    'buildFirst',
    'firstConsumers',
    'buildSecond',
    'secondConsumers',
    'environment',
  ] as const)(
    'fails once at the %s boundary without retrying or retaining partial output',
    async (stage) => {
      const value = harness();
      writeValidAdvisory(value);
      const base = value.operations;
      let consumerCalls = 0;
      const injected = async (): Promise<never> => {
        throw new ReleaseCandidateError('WG_RC_INJECTED', `Injected ${stage} failure.`);
      };
      const operations: RetainedOrchestratorOperations = {
        ...base,
        ...(stage === 'prepare' ? { prepare: injected } : {}),
        ...(stage === 'quality' ? { quality: injected } : {}),
        ...(stage === 'buildFirst' ? { buildFirst: injected } : {}),
        ...(stage === 'buildSecond' ? { buildSecond: injected } : {}),
        ...(stage === 'environment' ? { environment: injected } : {}),
        consumers: async (request) => {
          consumerCalls += 1;
          if (
            (stage === 'firstConsumers' && consumerCalls === 1) ||
            (stage === 'secondConsumers' && consumerCalls === 2)
          ) {
            return injected();
          }
          return base.consumers(request);
        },
      };
      try {
        await expect(
          runRetainedCandidate(
            value.repository.root,
            frozenSource.commit,
            value.output,
            value.advisoryPath,
            async () => ({ stdout: '', stderr: '' }),
            {},
            operations,
          ),
        ).rejects.toThrow(/WG_RC_INJECTED/);
        expectNoPartialBundle(value);
        expect(value.counts.builds).toBeLessThanOrEqual(2);
        expect(value.counts.consumers).toBeLessThanOrEqual(2);
        expect(consumerCalls).toBeLessThanOrEqual(2);
      } finally {
        rmSync(value.root, { recursive: true, force: true });
      }
    },
  );

  it('fails closed on an incomplete first consumer matrix before starting run two', async () => {
    const value = harness();
    writeValidAdvisory(value);
    const operations: RetainedOrchestratorOperations = {
      ...value.operations,
      consumers: async () => {
        value.counts.consumers += 1;
        const complete = matrix();
        return { ...complete, browsers: complete.browsers.slice(1) };
      },
    };
    try {
      await expect(
        runRetainedCandidate(
          value.repository.root,
          frozenSource.commit,
          value.output,
          value.advisoryPath,
          async () => ({ stdout: '', stderr: '' }),
          {},
          operations,
        ),
      ).rejects.toThrow(/WG_RC_INTEGRATED_MATRIX/);
      expect(value.counts).toEqual({ builds: 1, consumers: 1 });
      expectNoPartialBundle(value);
    } finally {
      rmSync(value.root, { recursive: true, force: true });
    }
  });

  it('removes a completed bundle when independent package-audit cross-binding fails', async () => {
    const value = harness();
    writeValidAdvisory(value);
    const baseBuild = value.operations.buildFirst;
    const operations: RetainedOrchestratorOperations = {
      ...value.operations,
      buildFirst: async (...arguments_) => {
        const result = await baseBuild(...arguments_);
        const packages = result.packageAudit.packages.map((package_, index) =>
          index === 0 ? { ...package_, manifestSha256: sha256('wrong manifest') } : package_,
        );
        return { ...result, packageAudit: { ...result.packageAudit, packages } };
      },
    };
    try {
      await expect(
        runRetainedCandidate(
          value.repository.root,
          frozenSource.commit,
          value.output,
          value.advisoryPath,
          async () => ({ stdout: '', stderr: '' }),
          {},
          operations,
        ),
      ).rejects.toThrow(/WG_RC_INTEGRATED_CROSS_BINDING/);
      expect(value.counts).toEqual({ builds: 2, consumers: 2 });
      expectNoPartialBundle(value);
    } finally {
      rmSync(value.root, { recursive: true, force: true });
    }
  });
});
