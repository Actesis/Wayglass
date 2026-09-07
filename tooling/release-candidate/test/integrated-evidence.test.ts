import { describe, expect, it } from 'vitest';

import { candidateDirectories, frozenSource } from '../src/constants.ts';
import { consumerScenarios } from '../src/consumer.ts';
import { hashFileInventory, sha256 } from '../src/hash.ts';
import {
  deterministicRunSha256,
  integratedBundleInventorySha256,
  serializeIntegratedEvidence,
  validateIntegratedEvidence,
} from '../src/integrated-evidence.ts';
import type {
  CandidateEvidence,
  ConsumerBrowserProbeResult,
  IntegratedCandidateEvidence,
  IntegratedCandidateRun,
  IntegratedEvidenceSection,
  ReactBuildProbeResult,
  RetainedEvidenceFile,
  VanillaBuildProbeResult,
} from '../src/types.ts';

const tooling = Object.freeze({ commit: 'c'.repeat(40), tree: 'd'.repeat(40) });

function candidate(environmentNode = 'v22.13.0'): CandidateEvidence {
  return {
    schemaVersion: 1,
    source: frozenSource,
    tooling,
    environment: {
      platform: 'test',
      architecture: 'test',
      node: environmentNode,
      pnpm: '11.9.0',
      npm: '11.0.0',
    },
    reproducibility: { runs: 2, byteIdentical: true },
    packages: candidateDirectories.map((directory, index) => {
      const files = [
        {
          path: 'package.json',
          bytes: index + 1,
          sha256: sha256(`manifest:${directory}`),
        },
      ];
      return {
        directory,
        name: `@wayglass/${directory}`,
        version: '0.1.0',
        file: `wayglass-${directory}-0.1.0.tgz`,
        bytes: index + 10,
        sha256: sha256(`tarball:${directory}`),
        manifestSha256: sha256(`manifest:${directory}`),
        inventorySha256: hashFileInventory(files),
        unpackedBytes: index + 1,
        files,
      };
    }),
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

function browserResults(): ConsumerBrowserProbeResult[] {
  return consumerScenarios().flatMap((scenario) =>
    (['primary', 'removal'] as const).flatMap((stage) =>
      (['chromium', 'firefox', 'webkit'] as const).map((engine) => ({
        scenarioId: scenario.id,
        kind: scenario.kind,
        stage,
        engine,
        runtime: true as const,
        semantics: true as const,
        accessibility: true as const,
      })),
    ),
  );
}

function run(
  id: IntegratedCandidateRun['id'],
  environmentNode = 'v22.13.0',
): IntegratedCandidateRun {
  const scenarios = consumerScenarios();
  return {
    id,
    candidate: candidate(environmentNode),
    vanilla: scenarios
      .filter(({ kind }) => kind === 'vanilla')
      .map(({ id: scenarioId }) => vanillaResult(scenarioId)),
    react: scenarios
      .filter(({ kind }) => kind === 'react')
      .map(({ id: scenarioId }) => reactResult(scenarioId)),
    browsers: browserResults(),
  };
}

function fixture(): IntegratedCandidateEvidence {
  const first = run('run-1');
  const second = run('run-2', 'v26.0.0');
  const sectionPaths = {
    packageAudit: 'audits/packages.json',
    dependencyAudit: 'audits/dependencies.json',
    environment: 'observations/environment.json',
    qualityGates: 'observations/quality-gates.json',
    provenance: 'observations/provenance.json',
    advisories: 'observations/advisories.json',
  } as const;
  const sections = Object.fromEntries(
    Object.entries(sectionPaths).map(([name, path]) => {
      const contents = `section:${name}`;
      return [
        name,
        {
          schemaVersion: 1,
          path,
          bytes: contents.length,
          sha256: sha256(contents),
        } satisfies IntegratedEvidenceSection,
      ];
    }),
  ) as unknown as IntegratedCandidateEvidence['sections'];
  const files: RetainedEvidenceFile[] = [
    ...first.candidate.packages.map((package_) => ({
      path: `packages/${package_.file}`,
      bytes: package_.bytes,
      sha256: package_.sha256,
    })),
    ...Object.values(sections).map(({ path, bytes, sha256: checksum }) => ({
      path,
      bytes,
      sha256: checksum,
    })),
  ].sort((left, right) => left.path.localeCompare(right.path));
  return {
    schemaVersion: 2,
    source: frozenSource,
    tooling,
    reproducibility: {
      runs: 2,
      byteIdentical: true,
      deterministicSha256: deterministicRunSha256(first),
    },
    runs: [first, second],
    sections,
    bundle: {
      files,
      totalBytes: files.reduce((total, file) => total + file.bytes, 0),
      inventorySha256: integratedBundleInventorySha256(files),
    },
    history: [
      {
        sequence: 1,
        outcome: 'failed',
        code: 'WG_RC_INTEGRATED_FIXTURE',
        summary: 'A retained normalized fixture failure.',
      },
      {
        sequence: 2,
        outcome: 'passed',
        code: 'WG_RC_INTEGRATED_PASS',
        summary: 'Both authoritative runs and the complete matrix passed.',
      },
    ],
  };
}

describe('integrated candidate evidence schema', () => {
  it('accepts two exact runs while excluding observed environment versions from equality', () => {
    const evidence = fixture();
    expect(evidence.runs[0].candidate.environment.node).not.toBe(
      evidence.runs[1].candidate.environment.node,
    );
    expect(validateIntegratedEvidence(evidence)).toBe(evidence);
    expect(deterministicRunSha256(evidence.runs[0])).toBe(deterministicRunSha256(evidence.runs[1]));
  });

  it('serializes canonically regardless of object insertion order', () => {
    const evidence = fixture();
    const reordered = {
      history: evidence.history,
      bundle: evidence.bundle,
      runs: evidence.runs,
      sections: evidence.sections,
      reproducibility: evidence.reproducibility,
      tooling: evidence.tooling,
      source: evidence.source,
      schemaVersion: evidence.schemaVersion,
    };
    expect(serializeIntegratedEvidence(reordered)).toBe(serializeIntegratedEvidence(evidence));
    expect(serializeIntegratedEvidence(evidence)).toMatch(/\n$/);
  });

  it('rejects unknown fields and nondeterministic data placed inside a run', () => {
    expect(() => validateIntegratedEvidence({ ...fixture(), unexpected: true })).toThrowError(
      /WG_RC_INTEGRATED_SCHEMA/,
    );
    const evidence = fixture();
    const first = { ...evidence.runs[0], startedAt: '2026-09-07T00:00:00Z' };
    expect(() =>
      validateIntegratedEvidence({ ...evidence, runs: [first, evidence.runs[1]] }),
    ).toThrowError(/WG_RC_INTEGRATED_SCHEMA/);
  });

  it('rejects a partial, duplicated, or out-of-order consumer matrix', () => {
    const evidence = fixture();
    expect(() =>
      validateIntegratedEvidence({
        ...evidence,
        runs: [
          { ...evidence.runs[0], browsers: evidence.runs[0].browsers.slice(1) },
          evidence.runs[1],
        ],
      }),
    ).toThrowError(/WG_RC_INTEGRATED_MATRIX/);
    const browsers = [...evidence.runs[0].browsers];
    browsers[1] = browsers[0]!;
    expect(() =>
      validateIntegratedEvidence({
        ...evidence,
        runs: [{ ...evidence.runs[0], browsers }, evidence.runs[1]],
      }),
    ).toThrowError(/WG_RC_INTEGRATED_MATRIX/);
  });

  it('rejects drift between the two deterministic run surfaces', () => {
    const evidence = fixture();
    const changedPackages = evidence.runs[1].candidate.packages.map((package_, index) =>
      index === 0 ? { ...package_, sha256: 'f'.repeat(64) } : package_,
    );
    const second = {
      ...evidence.runs[1],
      candidate: { ...evidence.runs[1].candidate, packages: changedPackages },
    };
    expect(() =>
      validateIntegratedEvidence({ ...evidence, runs: [evidence.runs[0], second] }),
    ).toThrowError(/WG_RC_INTEGRATED_REPRODUCIBILITY/);
  });

  it('rejects unsafe, duplicate, missing, and mismatched bundle entries', () => {
    const evidence = fixture();
    const unsafe = [
      { ...evidence.bundle.files[0]!, path: '../candidate.tgz' },
      ...evidence.bundle.files.slice(1),
    ];
    expect(() =>
      validateIntegratedEvidence({ ...evidence, bundle: { ...evidence.bundle, files: unsafe } }),
    ).toThrowError(/WG_RC_INTEGRATED_SCHEMA/);
    const missing = evidence.bundle.files.slice(1);
    expect(() =>
      validateIntegratedEvidence({
        ...evidence,
        bundle: {
          files: missing,
          totalBytes: missing.reduce((total, file) => total + file.bytes, 0),
          inventorySha256: integratedBundleInventorySha256(missing),
        },
      }),
    ).toThrowError(/WG_RC_INTEGRATED_BUNDLE/);
  });

  it('binds every future audit and observation section to one exact retained payload', () => {
    const evidence = fixture();
    expect(() =>
      validateIntegratedEvidence({
        ...evidence,
        sections: {
          ...evidence.sections,
          advisories: { ...evidence.sections.advisories, sha256: 'a'.repeat(64) },
        },
      }),
    ).toThrowError(/WG_RC_INTEGRATED_BUNDLE/);
    expect(() =>
      validateIntegratedEvidence({
        ...evidence,
        sections: { ...evidence.sections, inventedAudit: evidence.sections.packageAudit },
      }),
    ).toThrowError(/WG_RC_INTEGRATED_SCHEMA/);
  });

  it('rejects package inventory drift and incomplete attempt history', () => {
    const evidence = fixture();
    const packages = evidence.runs[0].candidate.packages.map((package_, index) =>
      index === 0 ? { ...package_, inventorySha256: 'e'.repeat(64) } : package_,
    );
    expect(() =>
      validateIntegratedEvidence({
        ...evidence,
        runs: [
          { ...evidence.runs[0], candidate: { ...evidence.runs[0].candidate, packages } },
          evidence.runs[1],
        ],
      }),
    ).toThrowError(/WG_RC_INTEGRATED_SCHEMA/);
    expect(() => validateIntegratedEvidence({ ...evidence, history: [] })).toThrowError(
      /WG_RC_INTEGRATED_HISTORY/,
    );
    expect(() =>
      validateIntegratedEvidence({ ...evidence, history: [evidence.history[0]] }),
    ).toThrowError(/WG_RC_INTEGRATED_HISTORY/);
  });
});
