import { lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { candidateDirectories, frozenSource } from './constants.ts';
import { consumerScenarios } from './consumer.ts';
import { offlineEnvironment } from './environment.ts';
import { fail } from './error.ts';
import { readPackageFiles } from './filesystem.ts';
import { sha256 } from './hash.ts';
import { validateNewOutputPath } from './path-safety.ts';
import { verifyPublicationArtifacts } from './publication-artifacts.ts';
import { verifyPublicationConsumerProof } from './publication-proof.ts';
import { assertCleanTooling, identifyRepository } from './repository.ts';
import type { CommandRunner } from './types.ts';

export const retainedPublicationArchive = Object.freeze({
  path: 'docs/governance/evidence/initial-npm-public-0.1.0.zip',
  bytes: 772966,
  sha256: '4e4420000766bd883b87f3e38c0cfef637988475922dd8d0d18c8e4fe1e98dc9',
});

interface InitialReleaseReview {
  readonly schemaVersion: number;
  readonly status: string;
  readonly publicationAuthorized: boolean;
  readonly registryActionsAuthorized: boolean;
  readonly artifactAcceptance: string;
  readonly releaseCommit: string | null;
  readonly finalApprover: string | null;
  readonly distTag: string;
  readonly distTagStatus: string;
  readonly registry: string;
  readonly access: string;
  readonly source: typeof frozenSource;
  readonly hostedReview: {
    readonly runId: string;
    readonly attempt: number;
    readonly toolingCommit: string;
    readonly archiveSha256: string;
    readonly candidateEvidenceSha256: string;
    readonly consumerProofSha256: string;
  };
  readonly packages: readonly {
    readonly name: string;
    readonly version: string;
    readonly bytes: number;
    readonly sha256: string;
  }[];
  readonly bootstrap: {
    readonly executionAuthorized: boolean;
    readonly placeholderCreationAuthorized: boolean;
    readonly credentialCreationAuthorized: boolean;
    readonly workflowImplemented: boolean;
  };
  readonly durableRetention: { readonly path: string; readonly sha256: string };
  readonly advisory: {
    readonly snapshotSha256: string;
    readonly validThrough: string;
    readonly newCaptureAuthorized: boolean;
  };
}

function sameNames(actual: readonly string[], expected: readonly string[]): boolean {
  return JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
}

export function publicationArchivePaths(): readonly string[] {
  const candidates = candidateDirectories.map(
    (directory) => `packages/wayglass-${directory}-0.1.0.tgz`,
  );
  return [
    ...candidates.map((path) => `assembly/${path}`),
    'assembly/publication-evidence.json',
    ...candidates.map((path) => `proof/candidate/${path}`),
    'proof/candidate/publication-evidence.json',
    'proof/consumer-proof.json',
    'hosted-run.json',
    'material-locks/complete.json',
    ...consumerScenarios().flatMap(({ id }) => [
      `material-locks/${id}/package.json`,
      `material-locks/${id}/pnpm-lock.yaml`,
      ...['primary', 'removal'].flatMap((stage) =>
        ['package.json', 'pnpm-workspace.yaml', 'pnpm-lock.yaml', 'installed-lock.yaml'].map(
          (name) => `proof/graphs/${id}/${stage}/${name}`,
        ),
      ),
    ]),
  ];
}

export function validatePublicationArchivePaths(paths: readonly string[]): void {
  if (!sameNames(paths, publicationArchivePaths())) {
    fail(
      'WG_RC_PREFLIGHT_ARCHIVE_PATHS',
      'Review ZIP must contain exactly the 77 retained review files, without duplicates or escapes.',
    );
  }
}

function readReview(repository: string): InitialReleaseReview {
  const review = JSON.parse(
    readFileSync(resolve(repository, 'docs/governance/initial-npm-release-proposal.json'), 'utf8'),
  ) as InitialReleaseReview;
  if (
    review.schemaVersion !== 1 ||
    review.status !== 'draft-for-owner-review' ||
    review.publicationAuthorized !== false ||
    review.registryActionsAuthorized !== false ||
    review.artifactAcceptance !== 'pending' ||
    review.releaseCommit !== null ||
    review.finalApprover !== null ||
    review.distTag !== 'next' ||
    review.distTagStatus !== 'proposed-confirm-at-final-approval' ||
    review.registry !== 'https://registry.npmjs.org/' ||
    review.access !== 'public' ||
    JSON.stringify(review.source) !== JSON.stringify(frozenSource) ||
    review.bootstrap?.executionAuthorized !== false ||
    review.bootstrap.placeholderCreationAuthorized !== false ||
    review.bootstrap.credentialCreationAuthorized !== false ||
    review.bootstrap.workflowImplemented !== false ||
    review.durableRetention?.path !== retainedPublicationArchive.path ||
    review.durableRetention.sha256 !== retainedPublicationArchive.sha256 ||
    review.hostedReview?.archiveSha256 !== retainedPublicationArchive.sha256 ||
    review.hostedReview.runId !== '42412111878' ||
    review.hostedReview.attempt !== 1 ||
    review.hostedReview.toolingCommit !== '7e48e4800405ff0d9f6103ba4021e62b2f89a28b' ||
    JSON.stringify(review.packages?.map(({ name, version }) => [name, version])) !==
      JSON.stringify(candidateDirectories.map((directory) => [`@wayglass/${directory}`, '0.1.0']))
  ) {
    fail(
      'WG_RC_PREFLIGHT_REVIEW',
      'Preflight accepts only the execution-disabled initial review record, never publication authority.',
    );
  }
  return review;
}

function observeAdvisory(repository: string, review: InitialReleaseReview, now: Date) {
  const bytes = readFileSync(
    resolve(repository, 'docs/governance/evidence/initial-npm-advisory-2026-11-07.json'),
  );
  const snapshot = JSON.parse(bytes.toString('utf8'));
  if (
    review.advisory?.newCaptureAuthorized !== false ||
    review.advisory.snapshotSha256 !==
      '85541ecda62c2eec096bef4d60b13dceddab71c8f70fe8264a9361922c47df6f' ||
    sha256(bytes) !== review.advisory.snapshotSha256 ||
    snapshot.source?.validThrough !== review.advisory.validThrough ||
    snapshot.scope?.lockfileSha256 !== frozenSource.lockfileSha256 ||
    snapshot.scope.productionOnly !== true ||
    !Number.isFinite(now.getTime()) ||
    !Number.isFinite(Date.parse(snapshot.source.validThrough))
  ) {
    fail(
      'WG_RC_PREFLIGHT_ADVISORY',
      'Advisory identity or observation time is invalid. No capture or expiry extension is allowed.',
    );
  }
  return {
    snapshotSha256: sha256(bytes),
    validThrough: snapshot.source.validThrough as string,
    status: now.getTime() < Date.parse(snapshot.source.validThrough) ? 'current' : 'expired',
    findingCount: snapshot.findings.length as number,
    notices: snapshot.notices,
    newCaptureAuthorized: false as const,
    recheckBeforeRegistryExecution: true as const,
  };
}

export async function initialPublicationPreflight(
  cwd: string,
  outputPath: string,
  runner: CommandRunner,
  inputEnvironment: NodeJS.ProcessEnv,
  now: Date = new Date(),
): Promise<string> {
  // No registry, npm command, package build, credential path, or executable publication mode exists.
  const environment = offlineEnvironment(inputEnvironment);
  const repository = await identifyRepository(cwd, runner);
  await assertCleanTooling(repository, runner);
  const output = validateNewOutputPath(outputPath, repository.root);
  const review = readReview(repository.root);
  const archive = resolve(repository.root, retainedPublicationArchive.path);
  if (!lstatSync(archive).isFile() || lstatSync(archive).isSymbolicLink()) {
    fail('WG_RC_PREFLIGHT_ARCHIVE', 'Retained review ZIP must be a regular file.');
  }
  const bytes = readFileSync(archive);
  if (
    bytes.byteLength !== retainedPublicationArchive.bytes ||
    sha256(bytes) !== retainedPublicationArchive.sha256
  ) {
    fail(
      'WG_RC_PREFLIGHT_ARCHIVE',
      'Retained review ZIP bytes differ from the exact hosted archive.',
    );
  }
  const advisory = observeAdvisory(repository.root, review, now);
  const temporary = mkdtempSync(resolve(tmpdir(), 'wayglass-publication-preflight-'));
  let outputCreated = false;
  try {
    const zip = resolve(temporary, 'review.zip');
    const extracted = resolve(temporary, 'review');
    writeFileSync(zip, bytes, { flag: 'wx' });
    const listing = await runner({
      command: 'unzip',
      arguments: ['-Z1', zip],
      cwd: temporary,
      environment,
    });
    validatePublicationArchivePaths(listing.stdout.trimEnd().split('\n'));
    mkdirSync(extracted);
    await runner({
      command: 'unzip',
      arguments: ['-q', zip, '-d', extracted],
      cwd: temporary,
      environment,
    });
    const files = readPackageFiles(extracted);
    validatePublicationArchivePaths(files.map(({ path }) => path));
    if (files.some(({ kind }) => kind !== 'file'))
      fail('WG_RC_PREFLIGHT_ARCHIVE', 'Review extraction contains a non-regular file.');
    const assemblyPath = resolve(extracted, 'assembly/publication-evidence.json');
    const assembly = await verifyPublicationArtifacts(
      repository.root,
      assemblyPath,
      runner,
      environment,
    );
    const result = await verifyPublicationConsumerProof(
      repository.root,
      resolve(extracted, 'proof/consumer-proof.json'),
      runner,
      environment,
    );
    const receipt = JSON.parse(readFileSync(resolve(extracted, 'hosted-run.json'), 'utf8'));
    const expectedReceipt = {
      schemaVersion: 1,
      repository: 'Actesis/Wayglass',
      ref: 'refs/heads/main',
      event: 'workflow_dispatch',
      runId: review.hostedReview.runId,
      runAttempt: String(review.hostedReview.attempt),
      toolingCommit: review.hostedReview.toolingCommit,
      sourceCommit: frozenSource.commit,
      workflow: 'Public archive and consumer rehearsal (no publication)',
      proofPath: 'proof/consumer-proof.json',
      proofSha256: result.proofSha256,
      publicationAuthorized: false,
      distTag: null,
    };
    if (
      Object.entries(expectedReceipt).some(([key, value]) => receipt[key] !== value) ||
      assembly.tooling.commit !== review.hostedReview.toolingCommit ||
      sha256(readFileSync(assemblyPath)) !== review.hostedReview.candidateEvidenceSha256 ||
      result.candidateEvidenceSha256 !== review.hostedReview.candidateEvidenceSha256 ||
      result.proofSha256 !== review.hostedReview.consumerProofSha256 ||
      !readFileSync(assemblyPath).equals(
        readFileSync(resolve(extracted, 'proof/candidate/publication-evidence.json')),
      )
    ) {
      fail(
        'WG_RC_PREFLIGHT_IDENTITY',
        'Retained receipt, assembly, or consumer identities differ from the reviewed hosted result.',
      );
    }
    const buildTree = (
      await runner({
        command: 'git',
        arguments: ['rev-parse', `${assembly.tooling.commit}^{tree}`],
        cwd: repository.root,
        environment,
      })
    ).stdout.trim();
    if (buildTree !== assembly.tooling.tree)
      fail('WG_RC_PREFLIGHT_IDENTITY', 'Historical tooling tree mismatch.');
    for (const [index, candidate] of assembly.packages.entries()) {
      const expected = review.packages[index]!;
      if (
        candidate.name !== expected.name ||
        candidate.version !== expected.version ||
        candidate.bytes !== expected.bytes ||
        candidate.sha256 !== expected.sha256 ||
        !readFileSync(resolve(extracted, 'assembly/packages', candidate.file)).equals(
          readFileSync(resolve(extracted, 'proof/candidate/packages', candidate.file)),
        )
      ) {
        fail(
          'WG_RC_PREFLIGHT_IDENTITY',
          `${candidate.name} is not the exact reviewed and tested archive.`,
        );
      }
    }
    const blockers = [
      'Exact owner artifact acceptance pending.',
      'Final release commit/tag targets not selected.',
      'Initial dist-tag requires final confirmation.',
      'Registry-writing publisher/provenance implementation not reviewed.',
      'Protected main and required checks must be verified for the final execution commit.',
      'Fresh npm ownership/2FA and stage/registry collision checks required.',
      'Credential creation, placeholders, staging, and human promotion remain separately unauthorized.',
      ...(advisory.status === 'expired'
        ? ['Advisory expired; separate capture authorization and review required.']
        : []),
    ];
    mkdirSync(output);
    outputCreated = true;
    const report = resolve(output, 'publication-preflight.json');
    writeFileSync(
      report,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          mode: 'verification-only',
          structuralValidationPassed: true,
          publicationAuthorized: false,
          registryActionsAuthorized: false,
          readyToStage: false,
          checkedAt: now.toISOString(),
          tooling: { commit: repository.commit, tree: repository.tree },
          source: frozenSource,
          retainedArchive: retainedPublicationArchive,
          hostedReview: review.hostedReview,
          advisory,
          proposedDistTag: review.distTag,
          packages: review.packages,
          blockers,
          historicalHostedRunReauthenticated: false,
          provenanceGenerated: false,
        },
        null,
        2,
      )}\n`,
      { flag: 'wx' },
    );
    return report;
  } catch (error) {
    if (outputCreated) rmSync(output, { recursive: true, force: true });
    throw error;
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}
