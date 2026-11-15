import { describe, expect, it } from 'vitest';

import {
  assertRunnerContext,
  claimResults,
  expectedProbeCertificate,
  requestUrl,
} from '../src/oidc-claim-probe.ts';
import { fulcioCertificateVerificationOptions } from '../src/signing-bundle-verifier.ts';

const commit = 'a'.repeat(40);
const env = { GITHUB_SHA: commit, GITHUB_RUN_ID: '99', GITHUB_RUN_ATTEMPT: '1' };
const workflow = 'Actesis/Wayglass/.github/workflows/initial-release-signing.yml@refs/heads/main';
const claims = {
  iss: 'https://token.actions.githubusercontent.com',
  aud: 'sigstore',
  repository: 'Actesis/Wayglass',
  repository_id: '1314007333',
  repository_owner_id: '27646205',
  ref: 'refs/heads/main',
  event_name: 'workflow_dispatch',
  runner_environment: 'github-hosted',
  environment: 'npm-release',
  workflow_ref: workflow,
  job_workflow_ref: workflow,
  sha: commit,
  workflow_sha: commit,
  run_id: '99',
  run_attempt: '1',
};
const token = (value: unknown) =>
  `header.${Buffer.from(JSON.stringify(value)).toString('base64url')}.signature`;

describe('OIDC claim probe', () => {
  it('requires the GitHub.com server in runner context, not in the token', () => {
    const context = {
      GITHUB_ACTIONS: 'true',
      GITHUB_SERVER_URL: 'https://github.com',
      GITHUB_REPOSITORY: 'Actesis/Wayglass',
      GITHUB_REF: 'refs/heads/main',
      GITHUB_WORKFLOW_REF: workflow,
      GITHUB_EVENT_NAME: 'workflow_dispatch',
      RUNNER_ENVIRONMENT: 'github-hosted',
    };
    expect(() => assertRunnerContext(context)).not.toThrow();
    for (const server of [undefined, 'https://example.com'])
      expect(() => assertRunnerContext({ ...context, GITHUB_SERVER_URL: server })).toThrow(
        'Unexpected execution context.',
      );
    expect(claimResults(token(claims), env).every(({ matches }) => matches)).toBe(true);
    const invocation = { ...context, ...env, GITHUB_WORKFLOW_SHA: commit, GITHUB_RUN_ATTEMPT: '2' };
    const expected = expectedProbeCertificate(invocation);
    expect(expected).toEqual({
      issuer: claims.iss,
      identity: `https://github.com/${workflow}`,
      commit,
      invocationId: 'https://github.com/Actesis/Wayglass/actions/runs/99/attempts/2',
    });
    const options = fulcioCertificateVerificationOptions(expected);
    expect(options.ctlogThreshold).toBe(1);
    expect(options.certificateOIDs['1.3.6.1.4.1.57264.1.21'].subarray(2).toString()).toBe(
      expected.invocationId,
    );
    expect(() => expectedProbeCertificate({ ...invocation, GITHUB_RUN_ATTEMPT: '0' })).toThrow();
    expect(() =>
      expectedProbeCertificate({ ...invocation, GITHUB_WORKFLOW_SHA: 'b'.repeat(40) }),
    ).toThrow('Unexpected workflow commit.');
  });

  it('reports only names and matches for the fixed claim set', () => {
    expect(claimResults(token({ ...claims, extra: 'not printed' }), env)).toEqual(
      Object.keys(claims).map((name) => ({ name, matches: true })),
    );
  });

  it.each([
    ['run_attempt', '2'],
    ['workflow_sha', 'b'.repeat(40)],
    ['job_workflow_ref', undefined],
    ['aud', ['sigstore', 'other']],
  ])('rejects an absent or different %s', (name, value) => {
    const results = claimResults(token({ ...claims, [name]: value }), env);
    expect(results.filter(({ matches }) => !matches)).toEqual([{ name, matches: false }]);
  });

  it('rejects malformed input and missing expected context', () => {
    expect(() => claimResults('not a token', env)).toThrow();
    expect(() => claimResults(token([]), env)).toThrow();
    expect(() => claimResults(token(claims), { ...env, GITHUB_RUN_ID: '' })).toThrow();
  });

  it('sets a single Sigstore audience on the GitHub HTTPS endpoint', () => {
    const url = requestUrl(
      'https://pipelines.actions.githubusercontent.com/token?audience=old&x=1',
    );
    expect(url.searchParams.getAll('audience')).toEqual(['sigstore']);
    expect(url.searchParams.get('x')).toBe('1');
  });

  it.each([
    'http://pipelines.actions.githubusercontent.com/token',
    'https://fakeactions.githubusercontent.com/token',
    'https://pipelines.actions.githubusercontent.com.example.com/token',
    'https://user@pipelines.actions.githubusercontent.com/token',
  ])('rejects a credential destination outside the approved HTTPS endpoint: %s', (url) => {
    expect(() => requestUrl(url)).toThrow();
  });
});
