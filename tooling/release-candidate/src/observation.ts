import { fail } from './error.ts';
import type { CandidateAttemptEvidence } from './types.ts';

export type EvidenceNoticeKind = 'limitation' | 'warning';
export type EvidenceClaim =
  | 'artifact-integrity'
  | 'browser-support'
  | 'dependency-security'
  | 'environment-support'
  | 'legal-review'
  | 'publication-readiness'
  | 'quality-gates';

export interface EvidenceNotice {
  readonly kind: EvidenceNoticeKind;
  readonly code: string;
  readonly claim: EvidenceClaim;
  readonly summary: string;
}

type UnknownRecord = Readonly<Record<string, unknown>>;

const codePattern = /^WG_RC_[A-Z0-9_]+$/;
const claims = new Set<EvidenceClaim>([
  'artifact-integrity',
  'browser-support',
  'dependency-security',
  'environment-support',
  'legal-review',
  'publication-readiness',
  'quality-gates',
]);
const unsafeTextPatterns = [
  /(?:^|\s)(?:\/[A-Za-z0-9._-]+\/|[A-Za-z]:[\\/]|\\\\|file:\/\/)/i,
  /\b(?:NODE_AUTH_TOKEN|NPM_TOKEN|NPM_AUTH_TOKEN|GITHUB_TOKEN|GH_TOKEN|CLOUDFLARE_API_TOKEN)\b/i,
  /\b(?:authorization|password|secret|token)\s*[:=]/i,
  /\busername\s*[:=]/i,
];

function observationFailure(message: string): never {
  return fail('WG_RC_OBSERVATION_SCHEMA', message);
}

export function exactObservationObject(
  value: unknown,
  keys: readonly string[],
  label: string,
): UnknownRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return observationFailure(`${label} must be an object.`);
  }
  const result = value as UnknownRecord;
  if (JSON.stringify(Object.keys(result).sort()) !== JSON.stringify([...keys].sort())) {
    return observationFailure(`${label} has missing or unknown fields.`);
  }
  return result;
}

export function normalizedObservationString(value: unknown, label: string): string {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > 500 ||
    value !== value.trim() ||
    [...value].some((character) => {
      const code = character.codePointAt(0)!;
      return code <= 31 || code === 127;
    }) ||
    unsafeTextPatterns.some((pattern) => pattern.test(value))
  ) {
    return observationFailure(`${label} is not safe normalized evidence text.`);
  }
  return value;
}

export function evidenceCode(value: unknown, label: string): string {
  const code = normalizedObservationString(value, label);
  if (!codePattern.test(code)) observationFailure(`${label} must be a normalized WG_RC code.`);
  return code;
}

export function validateEvidenceNotices(value: unknown, label: string): readonly EvidenceNotice[] {
  if (!Array.isArray(value)) observationFailure(`${label} must be an array.`);
  const identities: string[] = [];
  for (const [index, noticeValue] of value.entries()) {
    const notice = exactObservationObject(
      noticeValue,
      ['kind', 'code', 'claim', 'summary'],
      `${label}[${String(index)}]`,
    );
    if (notice.kind !== 'limitation' && notice.kind !== 'warning') {
      observationFailure(`${label}[${String(index)}].kind is invalid.`);
    }
    const code = evidenceCode(notice.code, `${label}[${String(index)}].code`);
    if (typeof notice.claim !== 'string' || !claims.has(notice.claim as EvidenceClaim)) {
      observationFailure(`${label}[${String(index)}].claim is invalid.`);
    }
    normalizedObservationString(notice.summary, `${label}[${String(index)}].summary`);
    identities.push(`${notice.kind}:${code}:${notice.claim}`);
  }
  if (
    new Set(identities).size !== identities.length ||
    JSON.stringify(identities) !== JSON.stringify([...identities].sort())
  ) {
    observationFailure(`${label} must be unique and sorted.`);
  }
  return value as readonly EvidenceNotice[];
}

export function validateAttemptHistory(value: unknown): readonly CandidateAttemptEvidence[] {
  if (!Array.isArray(value) || value.length === 0) {
    return fail('WG_RC_INTEGRATED_HISTORY', 'Attempt history cannot be empty.');
  }
  for (const [index, attemptValue] of value.entries()) {
    const attempt = exactObservationObject(
      attemptValue,
      ['sequence', 'outcome', 'code', 'summary'],
      `history[${String(index)}]`,
    );
    if (attempt.sequence !== index + 1) {
      fail('WG_RC_INTEGRATED_HISTORY', 'Attempt history sequence must be contiguous and ordered.');
    }
    if (attempt.outcome !== 'failed' && attempt.outcome !== 'passed') {
      observationFailure(`history[${String(index)}].outcome is invalid.`);
    }
    evidenceCode(attempt.code, `history[${String(index)}].code`);
    normalizedObservationString(attempt.summary, `history[${String(index)}].summary`);
  }
  if ((value.at(-1) as UnknownRecord).outcome !== 'passed') {
    fail('WG_RC_INTEGRATED_HISTORY', 'Attempt history must end with the successful candidate run.');
  }
  return value as readonly CandidateAttemptEvidence[];
}
