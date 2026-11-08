import { fail } from './error.ts';
import { retainedPublicationArchive } from './publication-preflight.ts';
import { sha256 } from './hash.ts';

export interface StagingApproval {
  readonly schemaVersion: 1;
  readonly purpose: 'initial-six-package-stage-upload';
  readonly owner: 'Actesis';
  readonly approvalId: string;
  readonly approvedAt: string;
  readonly expiresAt: string;
  readonly releaseCommit: string;
  readonly runId: string;
  readonly runAttempt: number;
  readonly archiveSha256: string;
  readonly advisorySha256: string;
  readonly distTag: 'next';
  readonly stageUploadsAuthorized: true;
  readonly generatedPlaceholdersAuthorized: true;
  readonly transparencyLogAuthorized: true;
  readonly directPublicationAuthorized: false;
  readonly humanPromotionAuthorized: false;
}

export interface StagingObservation {
  readonly observedAt: string;
  readonly repository: string;
  readonly ref: string;
  readonly workflow: string;
  readonly environment: string;
  readonly event: string;
  readonly repositoryPublic: boolean;
  readonly commit: string;
  readonly runId: string;
  readonly runAttempt: number;
  readonly hostedRunner: boolean;
  readonly protectedMain: boolean;
  readonly qualityPassed: boolean;
  readonly ownerEnvironmentApproved: boolean;
  readonly accountAndRecoveryReady: boolean;
  readonly advisorySha256: string;
  readonly advisoryValidThrough: string;
  readonly advisoryDispositionAccepted: boolean;
  readonly packageName: string;
  readonly packageCreationAllowed: boolean;
  readonly publishedVersions: readonly string[];
  readonly stagedVersions: readonly string[];
}

const approvalKeys = [
  'schemaVersion',
  'purpose',
  'owner',
  'approvalId',
  'approvedAt',
  'expiresAt',
  'releaseCommit',
  'runId',
  'runAttempt',
  'archiveSha256',
  'advisorySha256',
  'distTag',
  'stageUploadsAuthorized',
  'generatedPlaceholdersAuthorized',
  'transparencyLogAuthorized',
  'directPublicationAuthorized',
  'humanPromotionAuthorized',
].sort();

function timestamp(value: unknown): number {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
  )
    return NaN;
  const parsed = Date.parse(value);
  const normalized = value.includes('.') ? value : value.replace('Z', '.000Z');
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === normalized ? parsed : NaN;
}

export function validateStagingApproval(input: unknown, now: Date): Readonly<StagingApproval> {
  if (input === null || typeof input !== 'object' || Array.isArray(input))
    fail('WG_STAGE_APPROVAL', 'A separate exact execution-approval record is required.');
  const record = { ...input } as Record<string, unknown>;
  const start = timestamp(record.approvedAt);
  const end = timestamp(record.expiresAt);
  if (
    JSON.stringify(Object.keys(record).sort()) !== JSON.stringify(approvalKeys) ||
    record.schemaVersion !== 1 ||
    record.purpose !== 'initial-six-package-stage-upload' ||
    record.owner !== 'Actesis' ||
    typeof record.runAttempt !== 'number' ||
    !Number.isSafeInteger(record.runAttempt) ||
    record.runAttempt < 1 ||
    typeof record.approvalId !== 'string' ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(record.approvalId) ||
    typeof record.releaseCommit !== 'string' ||
    !/^[a-f0-9]{40}$/.test(record.releaseCommit) ||
    typeof record.runId !== 'string' ||
    !/^[1-9]\d*$/.test(record.runId) ||
    record.archiveSha256 !== retainedPublicationArchive.sha256 ||
    typeof record.advisorySha256 !== 'string' ||
    !/^[a-f0-9]{64}$/.test(record.advisorySha256) ||
    record.distTag !== 'next' ||
    record.stageUploadsAuthorized !== true ||
    record.generatedPlaceholdersAuthorized !== true ||
    record.transparencyLogAuthorized !== true ||
    record.directPublicationAuthorized !== false ||
    record.humanPromotionAuthorized !== false ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    !Number.isFinite(now.getTime()) ||
    start > now.getTime() ||
    now.getTime() >= end ||
    end - start > 24 * 60 * 60 * 1000
  )
    fail(
      'WG_STAGE_APPROVAL',
      'Execution approval is invalid, expired, or outside the exact initial scope.',
    );
  // Reconstruct only primitive fields; caller mutation cannot change the admitted scope.
  return Object.freeze({ ...record }) as unknown as Readonly<StagingApproval>;
}

export function stagingApprovalSha256(approval: StagingApproval): string {
  return sha256(
    JSON.stringify(
      Object.fromEntries(approvalKeys.map((key) => [key, approval[key as keyof StagingApproval]])),
    ),
  );
}

export function validateStagingObservation(
  observation: StagingObservation,
  approval: StagingApproval,
  packageName: string,
  now: Date,
): void {
  validateStagingApproval(approval, now);
  const observed = timestamp(observation.observedAt);
  const advisoryExpiry = timestamp(observation.advisoryValidThrough);
  if (
    observation.repository !== 'Actesis/Wayglass' ||
    observation.ref !== 'refs/heads/main' ||
    observation.workflow !== '.github/workflows/npm-initial-release.yml' ||
    observation.environment !== 'npm-release' ||
    observation.event !== 'workflow_dispatch' ||
    observation.repositoryPublic !== true ||
    observation.commit !== approval.releaseCommit ||
    observation.runId !== approval.runId ||
    observation.runAttempt !== approval.runAttempt ||
    observation.hostedRunner !== true ||
    observation.protectedMain !== true ||
    observation.qualityPassed !== true ||
    observation.ownerEnvironmentApproved !== true ||
    observation.accountAndRecoveryReady !== true ||
    observation.advisorySha256 !== approval.advisorySha256 ||
    observation.advisoryDispositionAccepted !== true ||
    !Number.isFinite(advisoryExpiry) ||
    now.getTime() >= advisoryExpiry ||
    Date.parse(approval.expiresAt) > advisoryExpiry ||
    !Number.isFinite(observed) ||
    observed > now.getTime() ||
    now.getTime() - observed > 60_000 ||
    observation.packageName !== packageName ||
    observation.packageCreationAllowed !== true ||
    !Array.isArray(observation.publishedVersions) ||
    observation.publishedVersions.length !== 0 ||
    !Array.isArray(observation.stagedVersions) ||
    observation.stagedVersions.length !== 0
  )
    fail(
      'WG_STAGE_GATES',
      'Fresh authenticated execution gates are missing, mismatched, or blocked.',
    );
}
