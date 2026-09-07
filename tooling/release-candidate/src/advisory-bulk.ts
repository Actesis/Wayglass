import { serializeCanonicalJson } from './canonical-json.ts';
import { validateDependencyAudit } from './dependency-audit.ts';
import { fail } from './error.ts';
import type { AdvisoryFinding, AdvisorySeverity } from './advisory-snapshot.ts';

export const bulkAdvisoryEndpoint = 'https://registry.npmjs.org/-/npm/v1/security/advisories/bulk';

export interface BulkAdvisoryRequest {
  readonly endpoint: typeof bulkAdvisoryEndpoint;
  readonly body: string;
  readonly dependencies: readonly { readonly name: string; readonly version: string }[];
}

type UnknownRecord = Readonly<Record<string, unknown>>;

const decoder = new TextDecoder('utf-8', { fatal: true });
const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/;
const severities = new Set<AdvisorySeverity>(['info', 'low', 'moderate', 'high', 'critical']);

function bulkFailure(message: string): never {
  return fail('WG_RC_ADVISORY_BULK', message);
}

function record(value: unknown, label: string): UnknownRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return bulkFailure(`${label} must be an object.`);
  }
  return value as UnknownRecord;
}

export function createBulkAdvisoryRequest(value: unknown): BulkAdvisoryRequest {
  const audit = validateDependencyAudit(value);
  if (audit.productionGraph.length !== 7) {
    bulkFailure('Advisory request requires the exact seven-node production graph.');
  }
  const dependencies = audit.productionGraph.map(({ name, version }) => ({ name, version }));
  const payload: Record<string, readonly string[]> = {};
  for (const { name, version } of dependencies) {
    if (payload[name] !== undefined) {
      bulkFailure('Advisory request cannot contain multiple versions of one package.');
    }
    payload[name] = Object.freeze([version]);
  }
  return Object.freeze({
    endpoint: bulkAdvisoryEndpoint,
    body: serializeCanonicalJson(payload),
    dependencies: Object.freeze(dependencies),
  });
}

function advisoryIdentifier(value: unknown, label: string): string {
  const identifier =
    typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? String(value) : value;
  if (typeof identifier !== 'string' || !identifierPattern.test(identifier)) {
    bulkFailure(`${label} has an invalid advisory identifier.`);
  }
  return identifier;
}

function optionalPatchedRange(value: unknown, present: boolean, label: string): string | null {
  if (!present || value === null) return null;
  if (typeof value !== 'string' || value.length === 0) {
    bulkFailure(`${label} has an invalid patched version range.`);
  }
  return value;
}

export function normalizeBulkAdvisoryResponse(
  bytes: Uint8Array,
  request: BulkAdvisoryRequest,
): readonly AdvisoryFinding[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(decoder.decode(bytes)) as unknown;
  } catch {
    return bulkFailure('Bulk advisory response must be valid UTF-8 JSON.');
  }
  const response = record(parsed, 'bulk advisory response');
  const requested = new Map(request.dependencies.map(({ name, version }) => [name, version]));
  const findings: AdvisoryFinding[] = [];
  for (const name of Object.keys(response)) {
    const version = requested.get(name);
    if (version === undefined) {
      bulkFailure('Bulk advisory response contains a package outside the submitted graph.');
    }
    const advisories = response[name];
    if (!Array.isArray(advisories)) {
      bulkFailure(`Bulk advisory response for ${name} must be an array.`);
    }
    for (const [index, value] of advisories.entries()) {
      const advisory = record(value, `${name} advisory ${String(index)}`);
      if (advisory.name !== undefined && advisory.name !== name) {
        bulkFailure(`${name} advisory ${String(index)} has a mismatched package name.`);
      }
      if (
        typeof advisory.severity !== 'string' ||
        !severities.has(advisory.severity as AdvisorySeverity)
      ) {
        bulkFailure(`${name} advisory ${String(index)} has an invalid severity.`);
      }
      if (
        typeof advisory.vulnerable_versions !== 'string' ||
        advisory.vulnerable_versions.length === 0
      ) {
        bulkFailure(`${name} advisory ${String(index)} has an invalid vulnerable range.`);
      }
      findings.push(
        Object.freeze({
          package: name,
          version,
          advisoryId: advisoryIdentifier(advisory.id, `${name} advisory ${String(index)}`),
          severity: advisory.severity as AdvisorySeverity,
          affectedRange: advisory.vulnerable_versions,
          patchedVersions: optionalPatchedRange(
            advisory.patched_versions,
            Object.hasOwn(advisory, 'patched_versions'),
            `${name} advisory ${String(index)}`,
          ),
        }),
      );
    }
  }
  findings.sort((left, right) =>
    `${left.package}@${left.version}:${left.advisoryId}`.localeCompare(
      `${right.package}@${right.version}:${right.advisoryId}`,
    ),
  );
  const identities = findings.map(
    ({ package: package_, version, advisoryId }) => `${package_}@${version}:${advisoryId}`,
  );
  if (new Set(identities).size !== identities.length) {
    bulkFailure('Bulk advisory response contains a duplicate advisory.');
  }
  return Object.freeze(findings);
}
