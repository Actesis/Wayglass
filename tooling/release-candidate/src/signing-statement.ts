import { isDeepStrictEqual } from 'node:util';

import { fail } from './error.ts';
import type { prepareSigningInputs } from './signing-inputs.ts';

type Inputs = ReturnType<typeof prepareSigningInputs>;
const repository = 'https://github.com/Actesis/Wayglass';

/** Inputs must come from the verified handoff, not from a signer response. */
export function prepareUnsignedStatements(inputs: Inputs) {
  const { build, source } = inputs;
  const invocationId = `${repository}/actions/runs/${build.runId}/attempts/${build.runAttempt}`;
  return inputs.packages.map(({ file, subject }) => ({
    file,
    certificatePolicy: {
      issuer: 'https://token.actions.githubusercontent.com',
      identity: `${repository}/${build.workflow}@${build.ref}`,
      commit: build.commit,
      invocationId,
    },
    statement: {
      _type: 'https://in-toto.io/Statement/v1',
      subject: [{ name: subject.name, digest: { sha512: subject.digest.sha512 } }],
      predicateType: 'https://slsa.dev/provenance/v1',
      predicate: {
        buildDefinition: {
          buildType: 'https://slsa-framework.github.io/github-actions-buildtypes/workflow/v1',
          externalParameters: { workflow: { repository, path: build.workflow, ref: build.ref } },
          internalParameters: {
            github: {
              event_name: 'workflow_dispatch',
              repository_id: '1314007333',
              repository_owner_id: '27646205',
            },
          },
          resolvedDependencies: [
            { uri: `git+${repository}@${build.ref}`, digest: { gitCommit: build.commit } },
            { uri: `git+${repository}@${source.commit}`, digest: { gitCommit: source.commit } },
          ],
        },
        runDetails: {
          builder: { id: 'https://github.com/actions/runner/github-hosted' },
          metadata: { invocationId },
        },
      },
    },
  }));
}

/** Policy comparison only: supply claims from the same bundle after independent
 * cryptographic verification, including signature and transparency-log inclusion. */
export function assertSigningStatementPolicy(
  expected: ReturnType<typeof prepareUnsignedStatements>[number],
  verified: { readonly statement: unknown; readonly certificate: unknown },
): void {
  if (
    !isDeepStrictEqual(verified.statement, expected.statement) ||
    !isDeepStrictEqual(verified.certificate, expected.certificatePolicy)
  )
    fail(
      'WG_SIGNING_POLICY',
      'Verified payload or signing identity differs from the reviewed policy.',
    );
}
