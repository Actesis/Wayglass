import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { consumerBrowserEngines } from './browser-probe.ts';
import { candidateToolVersions } from './constants.ts';
import { offlineEnvironment } from './environment.ts';
import { fail } from './error.ts';
import { readEvidence } from './evidence.ts';
import { sha256 } from './hash.ts';
import { verifyPublicationArtifacts } from './publication-artifacts.ts';
import {
  verifyConsumerProofCoverage,
  type PublicationConsumerProof,
} from './publication-consumers.ts';
import type { CommandRunner } from './types.ts';

// Read-only artifact verification, not approval or authentication of the asserted execution host.
// A reviewer must independently bind a hosted artifact to the GitHub run, SHA, and artifact digest.
export async function verifyPublicationConsumerProof(
  cwd: string,
  path: string,
  runner: CommandRunner,
  inputEnvironment: NodeJS.ProcessEnv,
): Promise<{ readonly proofSha256: string; readonly candidateEvidenceSha256: string }> {
  const environment = offlineEnvironment(inputEnvironment);
  const proof = readEvidence(path) as unknown as PublicationConsumerProof;
  if (
    proof.schemaVersion !== 1 ||
    proof.artifactKind !== 'publication-consumer-review' ||
    proof.publicationAuthorized !== false ||
    proof.distTag !== null ||
    proof.candidateEvidence?.path !== 'candidate/publication-evidence.json' ||
    !/^[a-f0-9]{64}$/.test(proof.candidateEvidence.sha256) ||
    !/^[a-f0-9]{40}$/.test(proof.tooling?.commit ?? '') ||
    !/^[a-f0-9]{40}$/.test(proof.tooling?.tree ?? '') ||
    proof.environment?.pnpm !== candidateToolVersions.pnpm ||
    consumerBrowserEngines.some(
      (engine) =>
        typeof proof.environment.browsers?.[engine] !== 'string' ||
        !proof.environment.browsers[engine],
    ) ||
    proof.limitations?.hostedRunAuthenticated !== false ||
    proof.limitations.humanAssistiveTechnology !== false ||
    proof.limitations.windowsNvdaObserved !== false
  ) {
    fail(
      'WG_RC_PUBLICATION_PROOF',
      'Expected complete, explicitly unauthorized consumer review evidence.',
    );
  }
  const root = dirname(path);
  const candidatePath = resolve(root, proof.candidateEvidence.path);
  const candidateEvidenceSha256 = sha256(readFileSync(candidatePath));
  if (candidateEvidenceSha256 !== proof.candidateEvidence.sha256) {
    fail('WG_RC_PUBLICATION_PROOF', 'Candidate evidence changed after the consumer proof.');
  }
  const candidate = await verifyPublicationArtifacts(cwd, candidatePath, runner, environment);
  if (
    JSON.stringify(proof.source) !== JSON.stringify(candidate.source) ||
    JSON.stringify(proof.assemblyTooling) !== JSON.stringify(candidate.tooling)
  ) {
    fail(
      'WG_RC_PUBLICATION_PROOF',
      'Consumer source or assembly identity differs from its archives.',
    );
  }
  verifyConsumerProofCoverage(root, proof.matrix, proof.graphs);
  return Object.freeze({ proofSha256: sha256(readFileSync(path)), candidateEvidenceSha256 });
}
