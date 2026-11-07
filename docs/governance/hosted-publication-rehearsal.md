# Owner-gated hosted public archive and consumer rehearsal

Status: implementation for review; no hosted execution claimed. No npm publication, package
creation, credential configuration, tags, dist-tag change, provenance, or release acceptance is
authorized by this workflow. The earlier metadata-only review remains unchanged.

This follows the [local archive and consumer proof](./protected-publication-review.md) accepted
through PR #299. It preserves the source freeze at `ce400e89930a047c6af1c6992c64cfe422a1eeee` and
the separate assembly/tooling identities required by
[ADR 0036](../architecture/adr/0036-private-release-candidate-tooling.md).

## Execution boundary

`.github/workflows/publication-rehearsal.yml` is manual, main-only, repository-specific, and uses
the existing `npm-release` environment. It must first land through a reviewed PR and the required
main quality check. Before dispatch, read back the environment reviewer, main-only branch policy,
administrator-bypass restriction, and zero environment-secret count. No approval is inferred from
the earlier metadata run. The owner must review this workflow and approve this new run separately.

After merge, dispatch **Public archive and consumer rehearsal (no publication)** from `main`. The
owner opens the waiting run, selects **Review deployments**, selects `npm-release`, then **Approve
and deploy**. The agent must never approve or bypass this gate through the API on the owner's
behalf. With a solo maintainer, this is owner presence, not independent two-person review. The
workflow shares the metadata review's concurrency group and does not cancel an active run.

The job uses a fresh GitHub-hosted Ubuntu 24.04 runner, exact Node `26.8.1` and pnpm `11.9.0`,
full-history checkout without persisted credentials, and SHA-pinned official checkout/setup/upload
actions. Permissions are only `contents: read`; there is no OIDC, secret reference, publishing
command, npm/repository-write credential, automatic trigger, or continue-on-error path. No new
dependency is introduced. There is a 60-minute job timeout and no restored dependency/build/browser
caches.

## Ordered execution

1. Install fresh tooling dependencies from the committed frozen lockfile with scripts disabled; run
   cache-disabled `pnpm check` and authenticate the exact frozen source.
2. In an explicitly separate network preparation step, provision frozen source dependencies into the
   new repository-local store through a temporary detached checkout, then remove that checkout.
3. Provision external consumer material for all six scenarios, retaining those preparation locks.
   Install the already pinned Playwright's three engines and Linux system dependencies. Browser
   binaries use a new run/attempt-specific path outside the uploaded review directory. These
   preparation steps are not described as offline proofs.
4. Run `build-publication` for two independent offline, lifecycle-disabled, frozen-source passes;
   require matching tarball bytes and complete inventories. Run the separate public verifier.
5. Run `probe-publication` against **those exact archives**, without rebuilding or registry
   fallback. Require the six independent consumers, all 36 browser cases, and twelve actual
   resolved/installed graph snapshots. Temporary consumers are still cleaned up.
6. Run the read-only `verify-publication-consumers` command over the retained proof. It verifies the
   candidate-evidence hash and public archive hashes/manifests, matching source/assembly identities,
   required review-only limitations, matrix coverage, and all 48 graph-file hashes.
7. Create `hosted-run.json` binding the proof hash to this run's repository/ref, workflow, source,
   tooling SHA, run ID, and attempt. Require the proof tooling SHA to equal the checked-out GitHub
   SHA. This receipt is **not provenance** or an independent signature.
8. Only after every preceding step succeeds, upload `public-review-<tooling-sha>-<attempt>` for
   **seven days**. Missing output fails the upload. Failed/cancelled jobs do not upload a success
   bundle; they are not silently retried or accepted.

## Retained output and independent review

The artifact contains `assembly/` (six new archives and evidence), `material-locks/` (the separately
provisioned external graphs), `proof/` (the exact tested archive copy, `consumer-proof.json`, and 48
actual graph files), and `hosted-run.json`. No worktree, dependency store, npm configuration,
browser binary, or credential is uploaded. Preparation locks are not substituted for actual consumer
graph evidence.

After success, independently read the GitHub run's head SHA, event/ref, repository, workflow,
environment approval, result, artifact ID/name/digest, and expiry. Download that exact run's
artifact. Compare its receipt and proof hash against the run metadata, confirm assembly and tested
candidate hashes match, and execute:

```sh
pnpm release-candidate:verify-publication-consumers -- --evidence <absolute-download-root>/proof/consumer-proof.json
```

The verifier is read-only and rejects credentials, implied publication authority, unexpected
candidate paths, altered identities, incomplete matrices, and changed files. It does not replay
browser tests or certify who ran them. The proof deliberately retains
`hostedRunAuthenticated: false`; hosted admission comes from the separate GitHub run/artifact
inspection, not a self-asserted flag. Record exact hosted artifact identities/hashes and known
limitations in a subsequent reviewed result. Temporary local storage and seven-day artifacts are not
indefinite release retention.

Two passes on one host must match compressed archive bytes. Linux gzip bytes may differ from the
earlier macOS archives, so do not relabel local hashes as hosted evidence. Compare full unpacked
file inventories and frozen public manifest bytes across platforms, then review and accept the exact
hosted archive set separately. Tests, green checks, and owner run approval do not constitute final
npm artifact approval.

No new advisory capture is made. Recheck advisory expiry and request a separately authorized fresh
capture if required. Initial dist-tag, release notes/support boundaries, recovery readiness,
first-package authentication/provenance, final artifact acceptance, and registry verification remain
separate gates. Automated axe/browser results are not human assistive-technology or Windows/NVDA
observations. Documentation deployment is unaffected.

## Platform references

- [Playwright CI guidance](https://playwright.dev/docs/ci): explicit browser/system-dependency
  provisioning before browser tests.
- [GitHub deployment review](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/review-deployments):
  the owner-operated review gate; no API bypass is permitted here.
