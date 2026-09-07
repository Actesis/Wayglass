import { serializeCanonicalJson } from './canonical-json.ts';
import { frozenSource } from './constants.ts';
import { fail } from './error.ts';
import {
  exactObservationObject,
  normalizedObservationString,
  validateEvidenceNotices,
  type EvidenceNotice,
} from './observation.ts';

export type AdvisorySeverity = 'info' | 'low' | 'moderate' | 'high' | 'critical';

export interface AdvisoryFinding {
  readonly package: string;
  readonly version: string;
  readonly advisoryId: string;
  readonly severity: AdvisorySeverity;
  readonly affectedRange: string;
  readonly patchedVersions: string | null;
}

export interface AdvisorySnapshotEvidence {
  readonly schemaVersion: 1;
  readonly source: {
    readonly provider: 'npm-security-advisories';
    readonly captureMethod: 'approved-read-only-snapshot';
    readonly capturedAt: string;
    readonly validThrough: string;
    readonly sha256: string;
  };
  readonly scope: {
    readonly lockfileSha256: string;
    readonly dependencyAuditSha256: string;
    readonly productionOnly: true;
  };
  readonly findings: readonly AdvisoryFinding[];
  readonly notices: readonly EvidenceNotice[];
}

export interface AdvisoryValidationContext {
  readonly referenceTime: string;
  readonly dependencyAuditSha256: string;
  readonly productionDependencies: readonly {
    readonly name: string;
    readonly version: string;
  }[];
}

const digestPattern = /^[a-f0-9]{64}$/;
const packagePattern = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/;
const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const advisoryIdPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/;
const rangePattern = /^[0-9A-Za-z.*+<>=~^|&!() -]{1,200}$/;
const severities = new Set<AdvisorySeverity>(['info', 'low', 'moderate', 'high', 'critical']);
const maximumFreshnessMilliseconds = 7 * 24 * 60 * 60 * 1000;

function advisoryFailure(message: string): never {
  return fail('WG_RC_ADVISORY_SCHEMA', message);
}

function instant(value: unknown, label: string): { readonly text: string; readonly time: number } {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) {
    advisoryFailure(`${label} must be a whole-second UTC timestamp.`);
  }
  const time = Date.parse(value);
  if (!Number.isFinite(time) || new Date(time).toISOString() !== value.replace(/Z$/, '.000Z')) {
    advisoryFailure(`${label} is not a real canonical timestamp.`);
  }
  return { text: value, time };
}

function digest(value: unknown, label: string): string {
  if (typeof value !== 'string' || !digestPattern.test(value)) {
    advisoryFailure(`${label} must be a lowercase SHA-256.`);
  }
  return value;
}

export function validateAdvisorySnapshot(
  value: unknown,
  context: AdvisoryValidationContext,
): AdvisorySnapshotEvidence {
  const evidence = exactObservationObject(
    value,
    ['schemaVersion', 'source', 'scope', 'findings', 'notices'],
    'advisory snapshot',
  );
  if (evidence.schemaVersion !== 1) advisoryFailure('Advisory schema version must be 1.');

  const source = exactObservationObject(
    evidence.source,
    ['provider', 'captureMethod', 'capturedAt', 'validThrough', 'sha256'],
    'advisory source',
  );
  if (
    source.provider !== 'npm-security-advisories' ||
    source.captureMethod !== 'approved-read-only-snapshot'
  ) {
    advisoryFailure('Advisory source identity or capture method is not accepted.');
  }
  const capturedAt = instant(source.capturedAt, 'advisory capturedAt');
  const validThrough = instant(source.validThrough, 'advisory validThrough');
  const reference = instant(context.referenceTime, 'advisory referenceTime');
  if (
    capturedAt.time > reference.time ||
    reference.time > validThrough.time ||
    validThrough.time <= capturedAt.time ||
    validThrough.time - capturedAt.time > maximumFreshnessMilliseconds
  ) {
    advisoryFailure(
      'Advisory snapshot is stale, future-dated, or valid for longer than seven days.',
    );
  }
  digest(source.sha256, 'advisory source hash');

  const scope = exactObservationObject(
    evidence.scope,
    ['lockfileSha256', 'dependencyAuditSha256', 'productionOnly'],
    'advisory scope',
  );
  if (
    scope.lockfileSha256 !== frozenSource.lockfileSha256 ||
    scope.dependencyAuditSha256 !==
      digest(context.dependencyAuditSha256, 'expected dependency audit hash') ||
    scope.productionOnly !== true
  ) {
    advisoryFailure('Advisory scope differs from the exact production candidate.');
  }
  digest(scope.dependencyAuditSha256, 'advisory dependency audit hash');

  const productionNodeIds = context.productionDependencies.map(({ name, version }) => {
    if (!packagePattern.test(name) || !versionPattern.test(version)) {
      advisoryFailure('Expected production dependency identity is invalid.');
    }
    return `${name}@${version}`;
  });
  if (
    new Set(productionNodeIds).size !== productionNodeIds.length ||
    JSON.stringify(productionNodeIds) !== JSON.stringify([...productionNodeIds].sort())
  ) {
    advisoryFailure('Expected production dependency identities must be unique and sorted.');
  }
  const productionNodes = new Set(productionNodeIds);

  if (!Array.isArray(evidence.findings)) advisoryFailure('Advisory findings must be an array.');
  const identities: string[] = [];
  for (const [index, findingValue] of evidence.findings.entries()) {
    const finding = exactObservationObject(
      findingValue,
      ['package', 'version', 'advisoryId', 'severity', 'affectedRange', 'patchedVersions'],
      `advisory findings[${String(index)}]`,
    );
    if (typeof finding.package !== 'string' || !packagePattern.test(finding.package)) {
      advisoryFailure(`advisory findings[${String(index)}].package is invalid.`);
    }
    if (typeof finding.version !== 'string' || !versionPattern.test(finding.version)) {
      advisoryFailure(`advisory findings[${String(index)}].version is not exact.`);
    }
    if (!productionNodes.has(`${finding.package}@${finding.version}`)) {
      advisoryFailure(`advisory findings[${String(index)}] is outside the production graph.`);
    }
    if (typeof finding.advisoryId !== 'string' || !advisoryIdPattern.test(finding.advisoryId)) {
      advisoryFailure(`advisory findings[${String(index)}].advisoryId is invalid.`);
    }
    if (
      typeof finding.severity !== 'string' ||
      !severities.has(finding.severity as AdvisorySeverity)
    ) {
      advisoryFailure(`advisory findings[${String(index)}].severity is invalid.`);
    }
    if (typeof finding.affectedRange !== 'string' || !rangePattern.test(finding.affectedRange)) {
      advisoryFailure(`advisory findings[${String(index)}].affectedRange is invalid.`);
    }
    if (
      finding.patchedVersions !== null &&
      (typeof finding.patchedVersions !== 'string' || !rangePattern.test(finding.patchedVersions))
    ) {
      advisoryFailure(`advisory findings[${String(index)}].patchedVersions is invalid.`);
    }
    identities.push(`${finding.package}@${finding.version}:${finding.advisoryId}`);
  }
  if (
    new Set(identities).size !== identities.length ||
    JSON.stringify(identities) !== JSON.stringify([...identities].sort())
  ) {
    advisoryFailure('Advisory findings must be unique and sorted.');
  }

  const notices = validateEvidenceNotices(evidence.notices, 'advisory notices');
  for (const notice of notices) {
    if (notice.claim !== 'dependency-security') {
      advisoryFailure('Advisory notices may affect only the dependency-security claim.');
    }
    normalizedObservationString(notice.summary, 'advisory notice summary');
  }
  return value as AdvisorySnapshotEvidence;
}

export function serializeAdvisorySnapshot(
  value: unknown,
  context: AdvisoryValidationContext,
): string {
  return serializeCanonicalJson(validateAdvisorySnapshot(value, context));
}
