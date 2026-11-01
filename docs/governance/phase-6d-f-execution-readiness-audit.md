# Phase 6D-F execution-readiness audit

**Status:** Corrected acceptance candidate prepared on October 31, 2026, after the absolute-path
reproducibility defect was fixed and independently proved. This audit performs no Cloudflare
authentication or account operation and authorizes no upload, deployment, rollback, restoration, or
retained remote state.

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

The corrected rollback baseline is clean merge commit `8d154458b7de3818db9338f47c1775102fe9e361`.
Its rebuilt artifact must independently reproduce bundle SHA-256
`1701653b00fe6b701fa62053fdd97ce170891b1d09d8ae45c54b06d0b1d61fb7` and manifest-file SHA-256
`d02ef91db33635b83031f1cefbce35651a7590e4187a233cc6bb7eb423d8bebd` before it can be uploaded. The
[baseline reproducibility audit](./phase-6d-f-baseline-reproducibility-audit.md) records the
independent absolute-parent proof and expressly withdraws the earlier path-sensitive admission.

## Provider-discovered initial-deploy correction

On November 1, 2026, a fresh authorized preflight authenticated successfully and both version and
deployment reads returned Cloudflare code `10007`, proving that `wayglass-docs` did not exist. The
immediately following `wrangler versions upload` was rejected before any write because Wrangler
cannot upload a version of a Worker that does not yet exist and requires `wrangler deploy` first.

No Worker, version, deployment, route, alias, or other Cloudflare resource was created or changed.
The corrected sequence below uses one initial baseline `deploy`, which creates the already
authorized Worker and baseline version and establishes that version at 100% in the same provider
operation. Every later candidate, rollback, restoration, isolation, and evidence boundary remains
unchanged.

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
    baseline-initial-manifest.json
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
| `WAYGLASS_PNPM_BIN_DIR` | Canonical parent of the cached exact pnpm `11.9.0` executable            |
| `WAYGLASS_PNPM_STORE`   | Canonical existing Wayglass repository-local pnpm store                  |

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
   RUN_ROOT="$(mktemp -d "${TMPDIR%/}/wayglass-phase-6d-f.XXXXXXXXXX")"
   RUN_ROOT="$(realpath "$RUN_ROOT")"
   mkdir -m 0700 <RUN_ROOT>/evidence
   PATH="<WAYGLASS_PNPM_BIN_DIR>:$PATH"
   pnpm --version
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
   git worktree add --detach <RUN_ROOT>/baseline-checkout 8d154458b7de3818db9338f47c1775102fe9e361
   pnpm --dir <RUN_ROOT>/baseline-checkout install --frozen-lockfile --offline --store-dir <WAYGLASS_PNPM_STORE>
   pnpm --dir <RUN_ROOT>/baseline-checkout build
   pnpm --dir <RUN_ROOT>/baseline-checkout site:build -- --output <BASELINE_SITE>
   pnpm --dir <RUN_ROOT>/baseline-checkout site:verify -- --input <BASELINE_SITE>
   pnpm --dir <RUN_ROOT>/baseline-checkout site:check-responses -- --input <BASELINE_SITE>
   ```

   Offline installation is deliberate: the execution authority does not include registry access or
   dependency changes. The exact cached pnpm executable and existing repository-local store must be
   proved before use; a missing executable, store entry, or version mismatch stops the run. The root
   build is also offline and delegates workspace dependency ordering to the baseline's committed
   Turbo graph. It produces the package `dist` exports required by the documentation and Storybook
   producers; other private workspace outputs remain outside the composer's closed two-surface
   admission set. `site:build` then owns the clean producer builds, composition, and verification. A
   missing cached dependency or failed root build stops the run for a new decision. The baseline
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

1. Repeat the two name-absence reads, then create the Worker and establish the baseline at 100% in
   one initial deployment:

   ```sh
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler versions list --config wrangler.jsonc --name wayglass-docs --json
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler deployments list --config wrangler.jsonc --name wayglass-docs --json
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler deploy --config wrangler.jsonc --name wayglass-docs --assets <BASELINE_SITE> --message "Phase 6D-F create verified rollback baseline 8d154458b7de3818db9338f47c1775102fe9e361" --strict
   ```

   `wrangler versions upload` cannot create a Worker that does not exist. Cloudflare and the
   installed Wrangler therefore require this first operation to couple version creation with a 100%
   deployment. Record the exact baseline UUID, deployment ID, immutable URL, and `workers.dev` root.
   Verify the immutable version before continuing:

   ```sh
   pnpm site:edge:check -- --input <BASELINE_SITE> --url <BASELINE_VERSION_URL> --version-id <BASELINE_VERSION_ID> --output <RUN_ROOT>/evidence/baseline-edge.json
   ```

2. Confirm the versions and deployments lists contain exactly the expected baseline at 100%, then
   prove the active-root manifest:

   ```sh
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler versions list --config wrangler.jsonc --name wayglass-docs --json
   WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=<RUN_ROOT>/wrangler.log pnpm exec wrangler deployments list --config wrangler.jsonc --name wayglass-docs --json
   curl --fail --silent --show-error --proto '=https' --max-redirs 0 --max-time 30 --output <RUN_ROOT>/evidence/baseline-initial-manifest.json <WORKERS_DEV_ROOT>/wayglass-site-manifest.json
   cmp --silent <BASELINE_SITE>/wayglass-site-manifest.json <RUN_ROOT>/evidence/baseline-initial-manifest.json
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
- the initial baseline, candidate, rollback, and restored-candidate active-root manifest
  comparisons;
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
| Offline baseline install or workspace package build cannot complete                    | Stop; obtain a separate dependency/build decision                    |
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
