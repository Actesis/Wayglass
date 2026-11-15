const repository = 'Actesis/Wayglass';
const ref = 'refs/heads/main';
const workflow = `${repository}/.github/workflows/initial-release-signing.yml@${ref}`;
const audience = 'sigstore';

export function claimResults(token: string, env: NodeJS.ProcessEnv) {
  const commit = env.GITHUB_SHA ?? '';
  const run = env.GITHUB_RUN_ID ?? '';
  const attempt = env.GITHUB_RUN_ATTEMPT ?? '';
  if (!/^[a-f0-9]{40}$/.test(commit) || !/^[1-9]\d*$/.test(run) || !/^[1-9]\d*$/.test(attempt))
    throw new Error('Invalid expected workflow context.');

  if (token.length > 32768 || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token))
    throw new Error('Invalid token format.');
  const claims: unknown = JSON.parse(Buffer.from(token.split('.')[1]!, 'base64url').toString());
  if (typeof claims !== 'object' || !claims || Array.isArray(claims))
    throw new Error('Invalid token payload.');
  const expected = {
    iss: 'https://token.actions.githubusercontent.com',
    aud: audience,
    repository,
    repository_id: '1314007333',
    repository_owner_id: '27646205',
    ref,
    event_name: 'workflow_dispatch',
    runner_environment: 'github-hosted',
    environment: 'npm-release',
    workflow_ref: workflow,
    job_workflow_ref: workflow,
    sha: commit,
    workflow_sha: commit,
    run_id: run,
    run_attempt: attempt,
  };
  return Object.entries(expected).map(([name, value]) => ({
    name,
    matches: Object.hasOwn(claims, name) && Reflect.get(claims, name) === value,
  }));
}

export function requestUrl(raw: string) {
  const url = new URL(raw);
  if (
    url.protocol !== 'https:' ||
    !url.hostname.endsWith('.actions.githubusercontent.com') ||
    url.username ||
    url.password ||
    url.port ||
    url.hash
  )
    throw new Error('Invalid GitHub OIDC endpoint.');
  url.searchParams.set('audience', audience);
  return url;
}

export function assertRunnerContext(env: NodeJS.ProcessEnv) {
  if (
    env.GITHUB_ACTIONS !== 'true' ||
    env.GITHUB_SERVER_URL !== 'https://github.com' ||
    env.GITHUB_REPOSITORY !== repository ||
    env.GITHUB_REF !== ref ||
    env.GITHUB_WORKFLOW_REF !== workflow ||
    env.GITHUB_EVENT_NAME !== 'workflow_dispatch' ||
    env.RUNNER_ENVIRONMENT !== 'github-hosted'
  )
    throw new Error('Unexpected execution context.');
}

async function main(env: NodeJS.ProcessEnv) {
  try {
    assertRunnerContext(env);
    const requestToken = env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
    if (!requestToken) throw new Error('Missing GitHub request credential.');
    const response = await fetch(requestUrl(env.ACTIONS_ID_TOKEN_REQUEST_URL ?? ''), {
      headers: { Authorization: `Bearer ${requestToken}` },
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error('GitHub token request failed.');
    const body: unknown = await response.json();
    if (typeof body !== 'object' || !body || !('value' in body) || typeof body.value !== 'string')
      throw new Error('Invalid GitHub response.');
    // Observe GitHub's direct TLS response only, not arbitrary JWTs as authentication evidence.
    const results = claimResults(body.value, env);
    for (const { name, matches } of results) console.log(`${name}: ${matches ? 'PASS' : 'FAIL'}`);
    if (results.some(({ matches }) => !matches)) process.exitCode = 1;
  } catch {
    // Never print errors containing response data, the request URL, or credentials.
    console.error('OIDC claim probe failed before producing results.');
    process.exitCode = 1;
  }
}

if (import.meta.main) await main(process.env);
