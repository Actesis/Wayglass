# Phase 6D-F execution-readiness audit

**Status:** Acceptance candidate prepared on October 30, 2026, after project-owner acceptance and
merge of the read-only browser verifier in PR #276. This audit performs no Cloudflare authentication
or account operation and authorizes no upload, deployment, rollback, restoration, or retained remote
state.

## Readiness disposition

Phase 6D-F is ready for one separately authorized execution of the accepted two-version rehearsal.
The repository now has all locally reviewable prerequisites:

- the closed Static Assets configuration for the exact Worker name `wayglass-docs`;
- the exact installed `wrangler@4.128.0` command surface;
- a deterministic site builder and independent artifact verifier;
- a credential-free local Wrangler response rehearsal;
- read-only edge and browser verifiers bound to one exact version UUID and immutable Version URL;
  and
- the accepted target, isolation boundary, two-version sequence, evidence policy, and rollback
  contract in the
  [Phase 6D-F execution contract](./phase-6d-f-preview-and-rollback-execution-contract.md).

The final candidate source is the clean `main` merge commit that accepts this audit. Its full commit
and tree IDs do not exist until the merge occurs and therefore must be captured after merge, before
any authorized execution. Moving `main`, a dirty worktree, or a commit other than that exact
captured merge commit invalidates the run.

The rollback baseline remains the already accepted clean commit
`aadb0bf82f64a5a4e2ef322aed636ce3d7e7ea74`. Its rebuilt artifact must independently reproduce bundle
SHA-256 `36587495199bff85019af53f6a3ec72c65d5efcc29df211edc82feb76e28a122` before it can be
uploaded.

## Command authority and environment

The command forms below were checked against the locally installed Wrangler `4.128.0` help. Current
Cloudflare guidance continues to define a
[Version URL](https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/) as
an immutable URL for a particular uploaded version. The rehearsal does not adopt updating Worker
Previews, attach a route, or attach a Custom Domain.

The execution uses one interactive shell in the clean accepted repository. It creates one owned run
root with `mktemp -d`, mode `0700`, beneath the real operating-system temporary directory. That run
root contains:

```text
wayglass-phase-6d-f.*/
  baseline-checkout/       detached checkout of the accepted baseline commit
  baseline-site/           verified baseline artifact
  candidate-site/          verified candidate artifact
  evidence/
    baseline-edge.json
    baseline-active-manifest.json
    candidate-edge.json
    candidate-browser.json
    candidate-active-manifest.json
    final-candidate-edge.json
  wrangler.log             transient provider diagnostic log
```

Every evidence JSON file is created transactionally at mode `0600` by the accepted verifier. The run
must set `WRANGLER_SEND_METRICS=false` and `WRANGLER_LOG_PATH` to the transient log above for every
Wrangler invocation. It must not change `HOME`, inspect credential files, dump the environment,
redirect `wrangler whoami`, or retain raw provider diagnostics.

The operator records the following task-specific values only after proving them:

| Value                   | Source and constraint                                                    |
| ----------------------- | ------------------------------------------------------------------------ |
| `CANDIDATE_COMMIT`      | Full SHA of the accepted audit merge commit at clean `main`              |
| `CANDIDATE_TREE`        | Tree ID of that exact commit                                             |
| `RUN_ROOT`              | New canonical path returned by `mktemp -d`; never committed or published |
| `BASELINE_SITE`         | New `baseline-site` child of `RUN_ROOT`                                  |
| `CANDIDATE_SITE`        | New `candidate-site` child of `RUN_ROOT`                                 |
| `BASELINE_VERSION_ID`   | Exact UUID returned by the successful baseline upload                    |
| `BASELINE_VERSION_URL`  | Immutable URL returned for that exact UUID                               |
| `CANDIDATE_VERSION_ID`  | Exact UUID returned by the successful candidate upload                   |
| `CANDIDATE_VERSION_URL` | Immutable URL returned for that exact UUID                               |
| `CANDIDATE_ALIAS_URL`   | Returned `phase-6d-f` alias; convenience evidence only                   |
| `WORKERS_DEV_ROOT`      | Returned public root for `wayglass-docs`, without a trailing slash       |

All shell variables are task-specific and shell-quoted. A value is never inferred from a previous
run, a dashboard bookmark, a stable alias, or a mutable deployment. The immutable URL prefix must
match the associated version UUID under the verifier's accepted binding rule.

## Exact preparation and preflight

These commands run only after the project owner grants the all-at-once authorization at the end of
this audit. Angle-bracket values mean the exact proved values from the table above, not optional
operator choices.

1. From the accepted repository, prove the candidate identity and local gates:

   ```sh
   umask 077
   RUN_ROOT="$(mktemp -d -t wayglass-phase-6d-f)"
   mkdir -m 0700 <RUN_ROOT>/evidence
   git status --short --branch
   git rev-parse HEAD
   git rev-parse HEAD^{tree}
   pnpm check
   pnpm site:build -- --output <CANDIDATE_SITE>
   pnpm site:verify -- --input <CANDIDATE_SITE>
   pnpm site:check-responses -- --input <CANDIDATE_SITE>
   pnpm site:wrangler:check -- --input <CANDIDATE_SITE>
   pnpm exec wrangler --version
   ```

   `git status` must show clean `main`, `HEAD` must equal `CANDIDATE_COMMIT`, and Wrangler must
   report exactly `4.128.0`. The candidate manifest supplies the source, tree, lockfile, bundle,
   manifest, environment, surface-count, and byte-count evidence.

2. Build the baseline in a new detached temporary checkout:

   ```sh
   git worktree add --detach <RUN_ROOT>/baseline-checkout aadb0bf82f64a5a4e2ef322aed636ce3d7e7ea74
   pnpm --dir <RUN_ROOT>/baseline-checkout install --frozen-lockfile --offline
   pnpm --dir <RUN_ROOT>/baseline-checkout site:build -- --output <BASELINE_SITE>
   pnpm --dir <RUN_ROOT>/baseline-checkout site:verify -- --input <BASELINE_SITE>
   pnpm --dir <RUN_ROOT>/baseline-checkout site:check-responses -- --input <BASELINE_SITE>
   ```

   Offline installation is deliberate: the execution authority does not include registry access or
   dependency changes. A missing cached dependency stops the run for a new decision. The baseline
   manifest must reproduce the accepted source identity and exact bundle SHA-256 above.

3. Re-run the closed configuration checker immediately before account access:

   ```sh
   pnpm site:wrangler:check -- --input <CANDIDATE_SITE>
   ```

   The checked-in configuration must still name only `wayglass-docs`, enable only `workers.dev` and
   Version URLs, omit `assets.directory`, and contain no route, Custom Domain, Worker script,
   binding, variable, secret, account identifier, observability, or unreviewed field.

4. Use the existing OAuth session for read-only account and collision checks:

   ```sh
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler whoami
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler versions list --config wrangler.jsonc --name wayglass-docs --json
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler deployments list --config wrangler.jsonc --name wayglass-docs --json
   ```

   The owner must recognize the authenticated account interactively; identifiers and email are not
   copied into evidence. Both name checks must produce the provider's unambiguous not-found result.
   A successful list, an authorization ambiguity, a transport error, or any response other than
   exact absence is a stop, not evidence that the name is free.

## Exact mutation and verification sequence

Each numbered mutation is allowed only if every preceding check passed in the same task. No command
is automatically retried. The operator substitutes only the proved paths, IDs, and URLs above.

1. Repeat the two name-absence reads, then upload the baseline:

   ```sh
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler versions list --config wrangler.jsonc --name wayglass-docs --json
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler deployments list --config wrangler.jsonc --name wayglass-docs --json
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler versions upload --config wrangler.jsonc --name wayglass-docs --assets <BASELINE_SITE> --tag phase-6d-f-baseline --message "Phase 6D-F rollback baseline aadb0bf82f64a5a4e2ef322aed636ce3d7e7ea74" --strict
   ```

   Record the exact baseline UUID and immutable URL. Verify them before deployment:

   ```sh
   pnpm site:edge:check -- --input <BASELINE_SITE> --url <BASELINE_VERSION_URL> --version-id <BASELINE_VERSION_ID> --output <RUN_ROOT>/evidence/baseline-edge.json
   ```

2. Confirm the versions list contains exactly the expected baseline, then establish it at 100%:

   ```sh
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler versions list --config wrangler.jsonc --name wayglass-docs --json
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler versions deploy <BASELINE_VERSION_ID>@100% --config wrangler.jsonc --name wayglass-docs --message "Phase 6D-F establish verified rollback baseline" --yes
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler deployments list --config wrangler.jsonc --name wayglass-docs --json
   ```

   The list must identify one 100% active baseline version.

3. Reconfirm the exact baseline deployment, then upload the candidate:

   ```sh
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler deployments list --config wrangler.jsonc --name wayglass-docs --json
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler versions upload --config wrangler.jsonc --name wayglass-docs --assets <CANDIDATE_SITE> --tag phase-6d-f-candidate --preview-alias phase-6d-f --message "Phase 6D-F candidate <CANDIDATE_COMMIT>" --strict
   ```

   Record the candidate UUID, immutable URL, and alias. Acceptance uses the immutable URL only:

   ```sh
   pnpm site:edge:check -- --input <CANDIDATE_SITE> --url <CANDIDATE_VERSION_URL> --version-id <CANDIDATE_VERSION_ID> --output <RUN_ROOT>/evidence/candidate-edge.json
   pnpm site:browser:edge:check -- --input <CANDIDATE_SITE> --url <CANDIDATE_VERSION_URL> --version-id <CANDIDATE_VERSION_ID> --output <RUN_ROOT>/evidence/candidate-browser.json
   ```

4. Confirm both exact versions and the unchanged 100% baseline deployment, then deploy the
   candidate:

   ```sh
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler versions list --config wrangler.jsonc --name wayglass-docs --json
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler deployments list --config wrangler.jsonc --name wayglass-docs --json
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler versions deploy <CANDIDATE_VERSION_ID>@100% --config wrangler.jsonc --name wayglass-docs --message "Phase 6D-F deploy verified candidate <CANDIDATE_COMMIT>" --yes
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler deployments list --config wrangler.jsonc --name wayglass-docs --json
   ```

5. Confirm one 100% candidate deployment, then prove rollback to the exact baseline:

   ```sh
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler deployments list --config wrangler.jsonc --name wayglass-docs --json
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler rollback <BASELINE_VERSION_ID> --config wrangler.jsonc --name wayglass-docs --message "Phase 6D-F rollback proof to verified baseline" --yes
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler deployments list --config wrangler.jsonc --name wayglass-docs --json
   curl --fail --silent --show-error --proto '=https' --max-redirs 0 --max-time 30 --output <RUN_ROOT>/evidence/baseline-active-manifest.json <WORKERS_DEV_ROOT>/wayglass-site-manifest.json
   cmp --silent <BASELINE_SITE>/wayglass-site-manifest.json <RUN_ROOT>/evidence/baseline-active-manifest.json
   ```

   The new deployment must point 100% to `BASELINE_VERSION_ID`. Fetch the public root manifest and
   compare its canonical bytes and identities with the independently verified baseline manifest; do
   not rely on a dashboard label or cache status.

6. Confirm the exact baseline rollback, then restore the candidate explicitly:

   ```sh
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler deployments list --config wrangler.jsonc --name wayglass-docs --json
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler versions deploy <CANDIDATE_VERSION_ID>@100% --config wrangler.jsonc --name wayglass-docs --message "Phase 6D-F restore verified candidate <CANDIDATE_COMMIT>" --yes
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler deployments list --config wrangler.jsonc --name wayglass-docs --json
   curl --fail --silent --show-error --proto '=https' --max-redirs 0 --max-time 30 --output <RUN_ROOT>/evidence/candidate-active-manifest.json <WORKERS_DEV_ROOT>/wayglass-site-manifest.json
   cmp --silent <CANDIDATE_SITE>/wayglass-site-manifest.json <RUN_ROOT>/evidence/candidate-active-manifest.json
   pnpm site:edge:check -- --input <CANDIDATE_SITE> --url <CANDIDATE_VERSION_URL> --version-id <CANDIDATE_VERSION_ID> --output <RUN_ROOT>/evidence/final-candidate-edge.json
   ```

   The final deployment must point 100% to `CANDIDATE_VERSION_ID`; the root manifest must match the
   candidate artifact. The immutable recheck complements that active-root check and proves the
   retained version itself did not change.

7. Remove only the local detached worktree, artifacts, and transient provider log after the retained
   record has been projected and independently checked. Do not delete either Cloudflare version, the
   alias, the Worker, or the final candidate deployment.

   Before cleanup, revalidate that `RUN_ROOT` is the exact canonical directory created by this run,
   is named `wayglass-phase-6d-f.*`, and is a descendant of the real operating-system temporary
   root. Then run:

   ```sh
   git worktree remove <RUN_ROOT>/baseline-checkout
   rm -rf -- <RUN_ROOT>
   ```

## Retained evidence record

The post-execution proposal records:

- candidate and baseline commit, tree, lockfile, bundle, manifest, environment, file-count, and
  byte-count identities;
- exact Wrangler version and closed-configuration result;
- whole-second UTC start and end times and pass/fail status for every numbered stage;
- public immutable and alias URLs, version IDs, deployment IDs, and sanitized list projections;
- SHA-256 identities of all four verifier evidence files and their accepted result projections;
- the observed edge disposition of redirect headers and rejected POST `Allow` behavior;
- the baseline, candidate, rollback, and restored-candidate active-root manifest comparisons;
- the last successful mutation, exact known active version, and safe recovery choice if execution
  stops after a write; and
- confirmation that the production hostname, DNS, routes, Custom Domains, GitHub, repository
  visibility, secrets, analytics, npm, and SpaceTraders remained untouched.

The record excludes OAuth and API tokens, authorization headers, account IDs, emails, local paths,
raw environment data, credential files, raw Wrangler logs, response bodies, browser traces, and
screenshots. Public IDs and URLs are evidence, not credentials. The record is proposed for owner
disposition in a normal pull request; no failed or partial run is relabeled as success.

## Fail-closed stop and recovery table

| Condition                                                                              | Required disposition                                                 |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Candidate is not the clean accepted audit merge commit                                 | Stop before account access; rebuild nothing remotely                 |
| Baseline bundle hash or either artifact verifier differs                               | Stop before account access                                           |
| Wrangler is not exactly `4.128.0` or config is not closed                              | Stop before account access                                           |
| Offline baseline install cannot complete                                               | Stop; obtain a separate dependency/network decision                  |
| Account is unrecognized or identifiers cannot be checked safely                        | Stop before any write                                                |
| `wayglass-docs` already exists or absence is ambiguous                                 | Stop before any write; do not inspect, overwrite, or delete it       |
| A route, Custom Domain, binding, variable, secret, script, or unreviewed field appears | Stop before any write                                                |
| Upload result lacks an exact UUID/immutable URL or its identity binding fails          | Stop; retain known remote state for owner review                     |
| A version/deployment list differs from the immediately expected state                  | Stop; do not continue or repair                                      |
| Edge, browser, manifest, CSP, accessibility, privacy, header, or response check fails  | Stop; do not promote that version                                    |
| Active traffic is not exactly 100% on the intended version                             | Stop; report the exact known deployment                              |
| `--strict` reports concurrent remote change                                            | Stop; do not retry around it                                         |
| A command fails after any mutation                                                     | Stop; record last successful mutation and exact known active version |
| Cleanup would change Cloudflare state                                                  | Do not clean it up without a new owner decision                      |

The already authorized rollback and candidate restoration are normal steps only while their
immediately preceding checks pass. They are not blanket recovery authority for an unexpected
failure. If state becomes ambiguous, no further mutation occurs.

## Required all-at-once execution authorization

Acceptance and merge of this audit completes readiness review but still does **not** authorize the
run. Immediately before execution, the project owner must explicitly authorize all of these effects
together:

1. use the existing Wrangler OAuth session for the named read and write operations;
2. create `wayglass-docs` only if the fresh preflight proves the name absent;
3. upload the verified baseline and candidate Static Assets versions and expose their public
   immutable Version URLs plus the `phase-6d-f` alias;
4. deploy the baseline, deploy the candidate, roll back to the exact baseline, and restore the exact
   candidate at 100% on the public non-production `workers.dev` root; and
5. retain both versions, the alias, the Worker, and the restored candidate deployment for owner
   review.

That authorization does not include the production hostname, DNS, route or Custom Domain changes,
GitHub or Workers Builds integration, repository visibility, secrets, analytics, npm publication,
public release claims, automatic retry, unexpected-state repair, or SpaceTraders work.

## Acceptance effect

Project-owner acceptance and merge freezes this exact candidate-selection rule, baseline identity,
command sequence, evidence destination and projection, stop conditions, recovery boundary, and
authorization wording. The next step is the owner's separate all-at-once execution authorization,
followed by one continuous run and a pull request containing the sanitized result for disposition.

No external effect is implied by accepting this audit.
