import { describe, expect, it } from 'vitest';

import { retainedPublicationArchive } from '../src/publication-preflight.ts';
import { stagingApprovalSha256 } from '../src/staging-approval.ts';
import type { StagingApproval } from '../src/staging-approval.ts';
import { verifyStagingGitHubGates } from '../src/staging-github-gates.ts';

const commit = 'a'.repeat(40);
const repo = {
  id: 1314007333,
  full_name: 'Actesis/Wayglass',
  private: false,
  owner: { id: 27646205, login: 'Actesis' },
};
const environment = { id: 26577432631, name: 'npm-release' };
const path = '.github/workflows/npm-initial-release.yml';
const runId = '99';
const now = () => new Date('2026-11-14T14:00:00Z');
const approval: StagingApproval = {
  schemaVersion: 1,
  purpose: 'initial-six-package-stage-upload',
  owner: 'Actesis',
  approvalId: '12345678-1234-1234-1234-000000000001',
  approvedAt: '2026-11-14T13:00:00Z',
  expiresAt: '2026-11-14T15:00:00Z',
  releaseCommit: commit,
  runId,
  runAttempt: 2,
  archiveSha256: retainedPublicationArchive.sha256,
  advisorySha256: 'b'.repeat(64),
  distTag: 'next',
  stageUploadsAuthorized: true,
  generatedPlaceholdersAuthorized: true,
  transparencyLogAuthorized: true,
  directPublicationAuthorized: false,
  humanPromotionAuthorized: false,
};
const context = {
  GITHUB_ACTIONS: 'true',
  RUNNER_ENVIRONMENT: 'github-hosted',
  GITHUB_SERVER_URL: 'https://github.com',
  GITHUB_REPOSITORY: repo.full_name,
  GITHUB_REPOSITORY_ID: String(repo.id),
  GITHUB_EVENT_NAME: 'workflow_dispatch',
  GITHUB_REF: 'refs/heads/main',
  GITHUB_SHA: commit,
  GITHUB_WORKFLOW_SHA: commit,
  GITHUB_WORKFLOW_REF: `${repo.full_name}/${path}@refs/heads/main`,
  GITHUB_RUN_ID: runId,
  GITHUB_RUN_ATTEMPT: '2',
};

function fixture() {
  const review = {
    user: repo.owner,
    state: 'approved',
    environments: [environment],
    comment: `wayglass-staging-approval-sha256:${stagingApprovalSha256(approval)}`,
  };
  const responses = {
    '': repo,
    '/branches/main/protection': {
      required_status_checks: {
        strict: true,
        checks: [{ app_id: 15368, context: 'Wayglass quality' }],
      },
      enforce_admins: { enabled: true },
      allow_force_pushes: { enabled: false },
      allow_deletions: { enabled: false },
      required_pull_request_reviews: {},
    },
    '/branches/main': { name: 'main', protected: true, commit: { sha: commit } },
    '/actions/runs/99': {
      id: 99,
      path,
      run_attempt: 2,
      event: 'workflow_dispatch',
      head_branch: 'main',
      head_sha: commit,
      status: 'in_progress',
      head_repository: repo,
    },
    '/actions/runs/99/approvals': [review],
    '/environments/npm-release': {
      ...environment,
      can_admins_bypass: false,
      deployment_branch_policy: { custom_branch_policies: true, protected_branches: false },
      protection_rules: [
        { type: 'required_reviewers', reviewers: [{ type: 'User', reviewer: repo.owner }] },
      ],
    },
    '/environments/npm-release/deployment-branch-policies': {
      total_count: 1,
      branch_policies: [{ name: 'main', type: 'branch' }],
    },
    [`/actions/workflows/quality.yml/runs?branch=main&event=push&head_sha=${commit}&per_page=2`]: {
      total_count: 1,
      workflow_runs: [
        {
          path: '.github/workflows/quality.yml',
          event: 'push',
          head_branch: 'main',
          head_sha: commit,
          head_repository: repo,
          status: 'completed',
          conclusion: 'success',
          check_suite_id: 12,
        },
      ],
    },
    [`/commits/${commit}/check-runs?check_name=Wayglass%20quality&filter=latest&per_page=2`]: {
      total_count: 1,
      check_runs: [
        {
          name: 'Wayglass quality',
          head_sha: commit,
          app: { id: 15368 },
          status: 'completed',
          conclusion: 'success',
          check_suite: { id: 12 },
        },
      ],
    },
  };
  const overrides = new Map<string, unknown>();
  const calls: string[] = [];
  const request: typeof fetch = async (url, options) => {
    const address = new URL(String(url));
    expect(address.origin).toBe('https://api.github.com');
    expect(options?.method).toBe('GET');
    expect(options?.redirect).toBe('error');
    expect(new Headers(options?.headers).get('authorization')).toBe('Bearer github_Fictional');
    const endpoint = address.pathname.slice(`/repos/${repo.full_name}`.length) + address.search;
    calls.push(endpoint);
    const value = overrides.has(endpoint) ? overrides.get(endpoint) : responses[endpoint];
    return value instanceof Response ? value : Response.json(value);
  };
  return {
    responses,
    overrides,
    calls,
    review,
    input: { approval, environment: context, readToken: 'github_Fictional', request, now },
  };
}

describe('read-only staging GitHub gate', () => {
  it('binds native approval, exact attempt, protected head and required quality suite', async () => {
    const f = fixture();
    const verified = await verifyStagingGitHubGates(f.input);
    expect(verified).toMatchObject({
      commit,
      runAttempt: 2,
      ownerEnvironmentApproved: true,
      qualityPassed: true,
    });
    expect(verified).not.toHaveProperty('packageCreationAllowed');
    expect(f.calls.at(-1)).toBe('/branches/main');
  });

  it('rejects mismatched runner context before any HTTP request', async () => {
    const f = fixture();
    await expect(
      verifyStagingGitHubGates({
        ...f.input,
        environment: {
          ...context,
          GITHUB_RUN_ATTEMPT: '1',
        },
      }),
    ).rejects.toThrow(/WG_STAGE_GITHUB/);
    expect(f.calls).toEqual([]);
  });

  it('refuses stale approval, wrong reviewer, ambiguous history, and a moved branch', async () => {
    const f = fixture();
    for (const [route, value] of [
      ['/actions/runs/99/approvals', [{ ...f.review, comment: '' }]],
      ['/actions/runs/99/approvals', [{ ...f.review, user: { ...repo.owner, id: 1 } }]],
      ['/actions/runs/99/approvals', [f.review, f.review]],
      ['/branches/main', { ...f.responses['/branches/main'], commit: { sha: 'c'.repeat(40) } }],
      [
        '/environments/npm-release',
        { ...f.responses['/environments/npm-release'], can_admins_bypass: true },
      ],
    ] as const) {
      f.overrides.set(route, value);
      await expect(verifyStagingGitHubGates(f.input)).rejects.toThrow(/WG_STAGE_GITHUB/);
      f.overrides.clear();
    }
  });

  it('rejects wrong check sources, non-success, permission failures and incomplete responses', async () => {
    const f = fixture();
    const route = `/commits/${commit}/check-runs?check_name=Wayglass%20quality&filter=latest&per_page=2`;
    const listed = f.responses[route]!;
    if (!('check_runs' in listed)) throw new Error('Missing check-run fixture.');
    for (const change of [
      { app: { id: 13 } },
      { conclusion: 'failure' },
      { check_suite: { id: 13 } },
    ]) {
      f.overrides.set(route, { ...listed, check_runs: [{ ...listed.check_runs[0], ...change }] });
      await expect(verifyStagingGitHubGates(f.input)).rejects.toThrow(/WG_STAGE_GITHUB/);
    }
    f.overrides.clear();
    for (const response of [
      new Response('fictional secret', { status: 403 }),
      Response.json(repo, { headers: { link: '<https://example.invalid>; rel="next"' } }),
      new Response('x'.repeat(2 * 1024 * 1024 + 1)),
    ]) {
      f.overrides.set('', response);
      await expect(verifyStagingGitHubGates(f.input)).rejects.toThrow(
        'WG_STAGE_GITHUB: GitHub release evidence is missing, ambiguous, or mismatched.',
      );
    }
  });
});
