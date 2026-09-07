import { describe, expect, it } from 'vitest';

import {
  serializeAdvisorySnapshot,
  validateAdvisorySnapshot,
  type AdvisorySnapshotEvidence,
} from '../src/advisory-snapshot.ts';
import { candidateDirectories, qualityGateIds } from '../src/constants.ts';
import { sha256 } from '../src/hash.ts';
import {
  collectEnvironmentAudit,
  collectProvenanceEvidence,
  collectQualityGateEvidence,
  serializeEnvironmentAudit,
  serializeProvenanceEvidence,
  serializeQualityGateEvidence,
  validateEnvironmentAudit,
  validateProvenanceEvidence,
  validateQualityGateEvidence,
} from '../src/observation-audit.ts';
import { validateAttemptHistory, validateEvidenceNotices } from '../src/observation.ts';

const dependencyAuditSha256 = sha256('dependency audit');

function environmentAudit() {
  return collectEnvironmentAudit({
    platform: 'darwin',
    operatingSystemVersion: '26.0',
    architecture: 'arm64',
    node: 'v26.0.0',
    pnpm: '11.9.0',
    npm: '11.6.0',
    playwright: '1.62.0',
    browsers: {
      chromium: '140.0.7339.16',
      firefox: '141.0',
      webkit: '26.0',
    },
    observedAt: '2026-09-08T12:00:00Z',
  });
}

function qualityEvidence() {
  return collectQualityGateEvidence(
    qualityGateIds.map((id) => ({ id, passed: true as const })),
    { startedAt: '2026-09-08T12:00:00Z', completedAt: '2026-09-08T12:10:00Z' },
  );
}

function provenanceEvidence() {
  return collectProvenanceEvidence({
    toolingCommit: 'a'.repeat(40),
    toolingTree: 'b'.repeat(40),
    advisoryInputSha256: sha256('approved advisory input'),
  });
}

function advisorySnapshot(): AdvisorySnapshotEvidence {
  return {
    schemaVersion: 1,
    source: {
      provider: 'npm-security-advisories',
      captureMethod: 'approved-read-only-snapshot',
      capturedAt: '2026-09-07T12:00:00Z',
      validThrough: '2026-09-14T12:00:00Z',
      sha256: sha256('upstream snapshot bytes'),
    },
    scope: {
      lockfileSha256: 'bdb6b4e916bd5fa2330fc3dd3f272814c6940ec04dab78b437b7007be386a525',
      dependencyAuditSha256,
      productionOnly: true,
    },
    findings: [
      {
        package: '@lit/reactive-element',
        version: '2.1.2',
        advisoryId: 'GHSA-example-0001',
        severity: 'moderate',
        affectedRange: '<2.1.3',
        patchedVersions: '>=2.1.3',
      },
      {
        package: 'lit',
        version: '3.3.3',
        advisoryId: 'GHSA-example-0002',
        severity: 'low',
        affectedRange: '<=3.3.3',
        patchedVersions: null,
      },
    ],
    notices: [],
  };
}

const advisoryContext = {
  referenceTime: '2026-09-08T12:00:00Z',
  dependencyAuditSha256,
  productionDependencies: [
    { name: '@lit/reactive-element', version: '2.1.2' },
    { name: 'lit', version: '3.3.3' },
  ],
};

describe('environment observation evidence', () => {
  it('records only the accepted runner, version matrix, controls, and notices', () => {
    const evidence = environmentAudit();
    expect(evidence.runner.pnpm).toBe('11.9.0');
    expect(evidence.matrix.typescript).toEqual(['5.9.3', '6.0.3']);
    expect(evidence.matrix.browsers.map(({ engine }) => engine)).toEqual([
      'chromium',
      'firefox',
      'webkit',
    ]);
    expect(validateEnvironmentAudit(JSON.parse(serializeEnvironmentAudit(evidence)))).toEqual(
      evidence,
    );
  });

  it('rejects arbitrary environment keys, unsupported Node, version drift, and reordered browsers', () => {
    expect(() => validateEnvironmentAudit({ ...environmentAudit(), PATH: '/private/bin' })).toThrow(
      /WG_RC_OBSERVATION_SCHEMA/,
    );
    expect(() =>
      validateEnvironmentAudit({
        ...environmentAudit(),
        runner: { ...environmentAudit().runner, node: 'v21.0.0' },
      }),
    ).toThrow(/WG_RC_UNSUPPORTED_NODE/);
    expect(() =>
      validateEnvironmentAudit({
        ...environmentAudit(),
        matrix: { ...environmentAudit().matrix, playwright: '1.63.0' },
      }),
    ).toThrow(/WG_RC_OBSERVATION_AUDIT/);
    expect(() =>
      validateEnvironmentAudit({ ...environmentAudit(), observedAt: '2026-02-30T12:00:00Z' }),
    ).toThrow(/WG_RC_OBSERVATION_AUDIT/);
    expect(() =>
      validateEnvironmentAudit({
        ...environmentAudit(),
        matrix: {
          ...environmentAudit().matrix,
          browsers: [...environmentAudit().matrix.browsers].reverse(),
        },
      }),
    ).toThrow(/WG_RC_OBSERVATION_AUDIT/);
  });
});

describe('quality-gate and provenance evidence', () => {
  it('requires the exact successful uncached and offline repository gate', () => {
    const evidence = qualityEvidence();
    expect(evidence.results.map(({ id }) => id)).toEqual(qualityGateIds);
    expect(validateQualityGateEvidence(JSON.parse(serializeQualityGateEvidence(evidence)))).toEqual(
      evidence,
    );
    expect(() =>
      validateQualityGateEvidence({ ...evidence, results: evidence.results.slice(1) }),
    ).toThrow(/WG_RC_OBSERVATION_AUDIT/);
    expect(() =>
      validateQualityGateEvidence({
        ...evidence,
        controls: { ...evidence.controls, uncached: false },
      }),
    ).toThrow(/WG_RC_OBSERVATION_AUDIT/);
    expect(() =>
      validateQualityGateEvidence({
        ...evidence,
        startedAt: evidence.completedAt,
        completedAt: evidence.startedAt,
      }),
    ).toThrow(/WG_RC_OBSERVATION_AUDIT/);
  });

  it('binds frozen source, clean tooling, package order, symbolic inputs, and advisory hash', () => {
    const evidence = provenanceEvidence();
    expect(evidence.packageOrder).toEqual(
      candidateDirectories.map((directory) => `@wayglass/${directory}`),
    );
    expect(validateProvenanceEvidence(JSON.parse(serializeProvenanceEvidence(evidence)))).toEqual(
      evidence,
    );
    expect(() =>
      validateProvenanceEvidence({
        ...evidence,
        inputs: { ...evidence.inputs, output: '/Users/operator/candidate' },
      }),
    ).toThrow(/WG_RC_OBSERVATION_AUDIT/);
    expect(() => validateProvenanceEvidence({ ...evidence, cleanWorktree: false })).toThrow(
      /WG_RC_OBSERVATION_AUDIT/,
    );
  });

  it('uses canonical serialization across all observation sections', () => {
    for (const [evidence, serialize] of [
      [environmentAudit(), serializeEnvironmentAudit],
      [qualityEvidence(), serializeQualityGateEvidence],
      [provenanceEvidence(), serializeProvenanceEvidence],
    ] as const) {
      expect(serialize(Object.fromEntries(Object.entries(evidence).reverse()))).toBe(
        serialize(evidence),
      );
    }
  });
});

describe('normalized notices and attempt history', () => {
  it('accepts sorted claim-scoped notices and rejects sensitive or machine-specific text', () => {
    expect(
      validateEvidenceNotices(
        [
          {
            kind: 'limitation',
            code: 'WG_RC_ADVISORY_LIMITATION',
            claim: 'dependency-security',
            summary: 'The approved snapshot does not cover private advisories.',
          },
          {
            kind: 'warning',
            code: 'WG_RC_BROWSER_WARNING',
            claim: 'browser-support',
            summary: 'The run covers automated browser engines only.',
          },
        ],
        'notices',
      ),
    ).toHaveLength(2);
    expect(() =>
      validateEvidenceNotices(
        [
          {
            kind: 'warning',
            code: 'WG_RC_SECRET',
            claim: 'quality-gates',
            summary: 'NPM_TOKEN=not-retained',
          },
        ],
        'notices',
      ),
    ).toThrow(/WG_RC_OBSERVATION_SCHEMA/);
    expect(() =>
      validateEvidenceNotices(
        [
          {
            kind: 'warning',
            code: 'WG_RC_PATH',
            claim: 'quality-gates',
            summary: 'The command failed in /tmp/private-run/output.',
          },
        ],
        'notices',
      ),
    ).toThrow(/WG_RC_OBSERVATION_SCHEMA/);
    expect(() =>
      validateEvidenceNotices(
        [
          {
            kind: 'warning',
            code: 'WG_RC_USERNAME',
            claim: 'quality-gates',
            summary: 'username=local-operator',
          },
        ],
        'notices',
      ),
    ).toThrow(/WG_RC_OBSERVATION_SCHEMA/);
  });

  it('preserves contiguous failures before one final successful attempt', () => {
    const history = [
      { sequence: 1, outcome: 'failed', code: 'WG_RC_FIRST', summary: 'The first attempt failed.' },
      { sequence: 2, outcome: 'passed', code: 'WG_RC_PASS', summary: 'The final attempt passed.' },
    ] as const;
    expect(validateAttemptHistory(history)).toBe(history);
    expect(() => validateAttemptHistory(history.slice(1))).toThrow(/WG_RC_INTEGRATED_HISTORY/);
    expect(() => validateAttemptHistory(history.slice(0, 1))).toThrow(/WG_RC_INTEGRATED_HISTORY/);
  });
});

describe('approved advisory snapshot input', () => {
  it('accepts one fresh, hashed, production-scoped snapshot with sorted findings', () => {
    const evidence = advisorySnapshot();
    expect(validateAdvisorySnapshot(evidence, advisoryContext)).toBe(evidence);
    expect(
      validateAdvisorySnapshot(
        JSON.parse(serializeAdvisorySnapshot(evidence, advisoryContext)),
        advisoryContext,
      ),
    ).toEqual(evidence);
  });

  it('rejects stale, future-dated, overlong, and wrong-scope snapshots', () => {
    const evidence = advisorySnapshot();
    expect(() =>
      validateAdvisorySnapshot(evidence, {
        ...advisoryContext,
        referenceTime: '2026-09-15T12:00:00Z',
      }),
    ).toThrow(/WG_RC_ADVISORY_SCHEMA/);
    expect(() =>
      validateAdvisorySnapshot(evidence, {
        ...advisoryContext,
        referenceTime: '2026-09-06T12:00:00Z',
      }),
    ).toThrow(/WG_RC_ADVISORY_SCHEMA/);
    expect(() =>
      validateAdvisorySnapshot(
        {
          ...evidence,
          source: { ...evidence.source, validThrough: '2026-09-15T12:00:00Z' },
        },
        advisoryContext,
      ),
    ).toThrow(/WG_RC_ADVISORY_SCHEMA/);
    expect(() =>
      validateAdvisorySnapshot(
        {
          ...evidence,
          scope: { ...evidence.scope, dependencyAuditSha256: sha256('different') },
        },
        advisoryContext,
      ),
    ).toThrow(/WG_RC_ADVISORY_SCHEMA/);
  });

  it('rejects malformed, duplicate, reordered, and unknown advisory findings', () => {
    const evidence = advisorySnapshot();
    expect(() =>
      validateAdvisorySnapshot(
        { ...evidence, findings: [...evidence.findings].reverse() },
        advisoryContext,
      ),
    ).toThrow(/WG_RC_ADVISORY_SCHEMA/);
    expect(() =>
      validateAdvisorySnapshot(
        { ...evidence, findings: [...evidence.findings, evidence.findings[0]!] },
        advisoryContext,
      ),
    ).toThrow(/WG_RC_ADVISORY_SCHEMA/);
    expect(() =>
      validateAdvisorySnapshot(
        { ...evidence, findings: [{ ...evidence.findings[0]!, invented: true }] },
        advisoryContext,
      ),
    ).toThrow(/WG_RC_OBSERVATION_SCHEMA/);
    expect(() =>
      validateAdvisorySnapshot(
        {
          ...evidence,
          findings: [{ ...evidence.findings[0]!, package: 'not-in-production-graph' }],
        },
        advisoryContext,
      ),
    ).toThrow(/WG_RC_ADVISORY_SCHEMA/);
    expect(() =>
      validateAdvisorySnapshot(
        {
          ...evidence,
          source: { ...evidence.source, capturedAt: '2026-02-30T12:00:00Z' },
        },
        advisoryContext,
      ),
    ).toThrow(/WG_RC_ADVISORY_SCHEMA/);
  });
});
