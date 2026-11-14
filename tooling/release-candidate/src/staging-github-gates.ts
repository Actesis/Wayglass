import { fail } from './error.ts';
import { stagingApprovalSha256, validateStagingApproval } from './staging-approval.ts';

const repository = 'Actesis/Wayglass';
const repoId = 1314007333;
const ownerId = 27646205;
const environmentId = 26577432631;
const workflow = '.github/workflows/npm-initial-release.yml';
const qualityName = 'Wayglass quality';
const actionsAppId = 15368;
// Bounds for this small read-only evidence set. Do not follow redirects with a credential.
const maxResponseBytes = 2 * 1024 * 1024;

function reject(): never {
  return fail('WG_STAGE_GITHUB', 'GitHub release evidence is missing, ambiguous, or mismatched.');
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return reject();
  return value as Record<string, unknown>;
}

function list(value: unknown): unknown[] {
  if (!Array.isArray(value)) return reject();
  return value;
}

function only(value: unknown): Record<string, unknown> {
  const items = list(value);
  if (items.length !== 1) return reject();
  return object(items[0]);
}

/** Unwired read-only verifier. The caller must supply genuine runner context and a separate
 * narrowly scoped GitHub reader, never the npm upload credential. */
export async function verifyStagingGitHubGates(input: {
  approval: unknown;
  environment: NodeJS.ProcessEnv;
  readToken: string;
  request?: typeof fetch;
  now?: () => Date;
}) {
  try {
    const clock = input.now ?? (() => new Date());
    const started = clock();
    const approval = validateStagingApproval(input.approval, started);
    const env = input.environment;
    if (
      env.GITHUB_ACTIONS !== 'true' ||
      env.RUNNER_ENVIRONMENT !== 'github-hosted' ||
      env.GITHUB_SERVER_URL !== 'https://github.com' ||
      env.GITHUB_REPOSITORY !== repository ||
      env.GITHUB_REPOSITORY_ID !== String(repoId) ||
      env.GITHUB_EVENT_NAME !== 'workflow_dispatch' ||
      env.GITHUB_REF !== 'refs/heads/main' ||
      env.GITHUB_SHA !== approval.releaseCommit ||
      env.GITHUB_WORKFLOW_REF !== `${repository}/${workflow}@refs/heads/main` ||
      env.GITHUB_WORKFLOW_SHA !== approval.releaseCommit ||
      env.GITHUB_RUN_ID !== approval.runId ||
      env.GITHUB_RUN_ATTEMPT !== String(approval.runAttempt) ||
      !/^[A-Za-z0-9_]+$/.test(input.readToken) ||
      input.readToken.startsWith('npm_')
    )
      return reject();
    const signal = AbortSignal.timeout(15_000);
    const request = input.request ?? fetch;
    async function read(path: string): Promise<unknown> {
      const response = await request(`https://api.github.com/repos/${repository}${path}`, {
        method: 'GET',
        redirect: 'error',
        signal,
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${input.readToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      if (response.status !== 200 || !response.body || response.headers.has('link')) {
        await response.body?.cancel();
        return reject();
      }
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > maxResponseBytes) {
            await reader.cancel();
            return reject();
          }
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }
      return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
    }
    const commit = approval.releaseCommit;
    const runPath = `/actions/runs/${approval.runId}`;
    const [
      repoValue,
      protectionValue,
      runValue,
      reviewsValue,
      environmentValue,
      policiesValue,
      qualityValue,
      checksValue,
    ] = await Promise.all([
      read(''),
      read('/branches/main/protection'),
      read(runPath),
      read(`${runPath}/approvals`),
      read('/environments/npm-release'),
      read('/environments/npm-release/deployment-branch-policies'),
      read(
        `/actions/workflows/quality.yml/runs?branch=main&event=push&head_sha=${commit}&per_page=2`,
      ),
      read(`/commits/${commit}/check-runs?check_name=Wayglass%20quality&filter=latest&per_page=2`),
    ]);
    const repo = object(repoValue);
    const protection = object(protectionValue);
    const required = object(protection.required_status_checks);
    const source = only(required.checks);
    const run = object(runValue);
    const owner = object(repo.owner);
    const environment = object(environmentValue);
    const branchPolicy = object(environment.deployment_branch_policy);
    const policies = object(policiesValue);
    const policy = only(policies.branch_policies);
    const rules = list(environment.protection_rules).map(object);
    const reviewerRule = only(rules.filter((rule) => rule.type === 'required_reviewers'));
    const reviewer = only(reviewerRule.reviewers);
    const review = only(
      list(reviewsValue)
        .map(object)
        .filter((entry) =>
          list(entry.environments).some((item) => object(item).id === environmentId),
        ),
    );
    const reviewedEnvironment = only(review.environments);
    const quality = object(qualityValue);
    const qualityRun = only(quality.workflow_runs);
    const checks = object(checksValue);
    const check = only(checks.check_runs);
    object(protection.required_pull_request_reviews);
    // Run-history entries lack an attempt field. A unique exact comment binds the owner decision
    // to the approval record, which contains both run ID and attempt; never fall back to prose.
    if (
      repo.id !== repoId ||
      repo.full_name !== repository ||
      repo.private !== false ||
      owner.id !== ownerId ||
      owner.login !== approval.owner ||
      required.strict !== true ||
      source.app_id !== actionsAppId ||
      source.context !== qualityName ||
      object(protection.enforce_admins).enabled !== true ||
      object(protection.allow_force_pushes).enabled !== false ||
      object(protection.allow_deletions).enabled !== false ||
      String(run.id) !== approval.runId ||
      run.run_attempt !== approval.runAttempt ||
      run.path !== workflow ||
      run.event !== 'workflow_dispatch' ||
      run.head_branch !== 'main' ||
      run.head_sha !== commit ||
      run.status !== 'in_progress' ||
      object(run.head_repository).id !== repoId ||
      environment.id !== environmentId ||
      environment.name !== 'npm-release' ||
      environment.can_admins_bypass !== false ||
      branchPolicy.custom_branch_policies !== true ||
      branchPolicy.protected_branches !== false ||
      policies.total_count !== 1 ||
      policy.type !== 'branch' ||
      policy.name !== 'main' ||
      reviewer.type !== 'User' ||
      object(reviewer.reviewer).id !== ownerId ||
      reviewedEnvironment.id !== environmentId ||
      reviewedEnvironment.name !== 'npm-release' ||
      review.state !== 'approved' ||
      object(review.user).id !== ownerId ||
      object(review.user).login !== approval.owner ||
      review.comment !== `wayglass-staging-approval-sha256:${stagingApprovalSha256(approval)}` ||
      quality.total_count !== 1 ||
      qualityRun.path !== '.github/workflows/quality.yml' ||
      qualityRun.event !== 'push' ||
      qualityRun.head_branch !== 'main' ||
      qualityRun.head_sha !== commit ||
      object(qualityRun.head_repository).id !== repoId ||
      qualityRun.status !== 'completed' ||
      qualityRun.conclusion !== 'success' ||
      checks.total_count !== 1 ||
      check.name !== qualityName ||
      check.head_sha !== commit ||
      object(check.app).id !== actionsAppId ||
      check.status !== 'completed' ||
      check.conclusion !== 'success' ||
      object(check.check_suite).id !== qualityRun.check_suite_id ||
      typeof qualityRun.check_suite_id !== 'number'
    )
      return reject();
    const branch = object(await read('/branches/main'));
    if (branch.name !== 'main' || branch.protected !== true || object(branch.commit).sha !== commit)
      return reject();
    validateStagingApproval(approval, clock());
    return Object.freeze({
      observedAt: started.toISOString(),
      repository,
      ref: 'refs/heads/main',
      workflow,
      environment: 'npm-release',
      event: 'workflow_dispatch',
      repositoryPublic: true,
      commit,
      runId: approval.runId,
      runAttempt: approval.runAttempt,
      hostedRunner: true,
      protectedMain: true,
      qualityPassed: true,
      ownerEnvironmentApproved: true,
    } as const);
  } catch {
    return reject();
  }
}
