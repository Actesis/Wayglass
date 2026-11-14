import { createHash } from 'node:crypto';

import { candidateDirectories, frozenSource } from './constants.ts';
import { assertNoReleaseCredentials } from './environment.ts';
import { fail } from './error.ts';
import { sha256 } from './hash.ts';
import { reviewedStageIdentity } from './staging-protocol.ts';
import type { StagingArchive } from './staging-protocol.ts';
import type { PublicationEvidence } from './types.ts';

/** Prepare unsigned subjects from an independently authenticated same-run build artifact.
 * Environment checks bind the handoff; they do not authenticate a runner or approve signing. */
export function prepareSigningInputs(input: {
  readonly environment: NodeJS.ProcessEnv;
  readonly buildRun: { readonly id: string; readonly attempt: string };
  readonly evidence: PublicationEvidence;
  readonly archives: readonly StagingArchive[];
}) {
  const { environment: env, evidence, archives, buildRun } = input;
  assertNoReleaseCredentials(env);
  const commit = env.GITHUB_SHA ?? '';
  const ref = 'refs/heads/main';
  const workflow = '.github/workflows/initial-release-signing.yml';
  if (
    env.GITHUB_ACTIONS !== 'true' ||
    env.RUNNER_ENVIRONMENT !== 'github-hosted' ||
    env.GITHUB_REPOSITORY !== 'Actesis/Wayglass' ||
    env.GITHUB_SERVER_URL !== 'https://github.com' ||
    env.GITHUB_EVENT_NAME !== 'workflow_dispatch' ||
    env.GITHUB_REF !== ref ||
    env.GITHUB_WORKFLOW_REF !== `Actesis/Wayglass/${workflow}@${ref}` ||
    !/^[a-f0-9]{40}$/.test(commit) ||
    env.GITHUB_WORKFLOW_SHA !== commit ||
    !/^[1-9][0-9]*$/.test(buildRun.id) ||
    !/^[1-9][0-9]*$/.test(buildRun.attempt) ||
    env.GITHUB_RUN_ID !== buildRun.id ||
    env.GITHUB_RUN_ATTEMPT !== buildRun.attempt ||
    evidence.tooling.commit !== commit ||
    !/^[a-f0-9]{40}$/.test(evidence.tooling.tree) ||
    evidence.schemaVersion !== 1 ||
    evidence.artifactKind !== 'publication-review' ||
    evidence.publicationAuthorized !== false ||
    evidence.distTag !== null ||
    evidence.source.commit !== frozenSource.commit ||
    evidence.source.tree !== frozenSource.tree ||
    evidence.source.lockfileSha256 !== frozenSource.lockfileSha256 ||
    evidence.environment.platform !== 'linux' ||
    evidence.environment.architecture !== 'x64' ||
    evidence.environment.node !== 'v26.8.1' ||
    evidence.environment.pnpm !== '11.9.0' ||
    evidence.environment.npm !== '11.19.0' ||
    evidence.reproducibility.runs !== 2 ||
    evidence.reproducibility.byteIdentical !== true ||
    archives.length !== candidateDirectories.length ||
    evidence.packages.length !== candidateDirectories.length
  )
    fail(
      'WG_SIGNING_INPUTS',
      'Expected the exact frozen build and matching hosted workflow invocation.',
    );

  const packages = candidateDirectories.map((directory, index) => {
    const archive = archives[index];
    const packed = evidence.packages[index];
    const file = `wayglass-${directory}-0.1.0.tgz`;
    if (!archive || !packed || archive.file !== file)
      fail('WG_SIGNING_INPUTS', 'Signing input package set or order differs.');
    const bytes = Buffer.from(archive.bytes);
    const identity = reviewedStageIdentity({ file, bytes });
    if (
      packed.directory !== directory ||
      packed.file !== file ||
      packed.name !== identity.name ||
      packed.version !== identity.version ||
      packed.bytes !== identity.size ||
      packed.sha256 !== identity.sha256
    )
      fail('WG_SIGNING_INPUTS', 'Assembly metadata does not match the exact retained archive.');
    return {
      file,
      bytes: identity.size,
      sha256: identity.sha256,
      subject: {
        name: `pkg:npm/%40wayglass/${directory}@0.1.0`,
        digest: { sha512: createHash('sha512').update(bytes).digest('hex') },
      },
    };
  });
  return {
    schemaVersion: 1,
    signingAuthorized: false,
    publicationAuthorized: false,
    source: frozenSource,
    build: {
      commit,
      tree: evidence.tooling.tree,
      ref,
      workflow,
      runId: buildRun.id,
      runAttempt: buildRun.attempt,
    },
    assemblyEvidenceJsonSha256: sha256(JSON.stringify(evidence)),
    packages,
  } as const;
}
