# Initial npm release preparation

Status: publication-disabled preparation. Repository visibility became public with owner approval on
November 7, 2026. This does not approve npm publication, tags, credentials, or a GitHub release.

## Proposed release

The release inventory remains `@wayglass/core`, `@wayglass/tokens`, `@wayglass/themes`,
`@wayglass/elements`, `@wayglass/icons`, and `@wayglass/react`, each initially `0.1.0` under
Apache-2.0. The foundation family is synchronized; icons and React remain independently versioned.
Testing helpers, ESLint configuration, apps, examples, experiments, and integrations are excluded.

The candidate source remains `ce400e89930a047c6af1c6992c64cfe422a1eeee`, not the workflow's current
main commit. ADR 0036 authenticates both identities separately. Do not silently refreeze the source
or publish an artifact built from today's workspace instead.

## Publication-disabled workflow

`.github/workflows/release-rehearsal.yml` is manually dispatched from main only, on a GitHub-hosted
Ubuntu runner. Official checkout, Node setup, and artifact-upload actions are pinned to full commit
hashes resolved from their v6 tags on November 7, 2026. No additional library dependency is needed.
The job has only repository read permission, does not persist checkout credentials, does not request
OIDC, references no secrets, and has no publish, stage, tag, or release command.

The runner installs exact Node 26.8.1 and pnpm 11.9.0, provisions dependencies from frozen lockfiles
without lifecycle scripts or restored caches, then invokes the existing offline two-pass assembler.
The assembler runs the frozen source's uncached quality gates, strips workspace-only metadata in
isolated staging, retains `private: true`, packs all six units, and verifies reproducibility.
Successful runs retain the new tarballs and evidence for seven days as GitHub Actions artifacts.
Because this repository is public, those artifacts must be treated as publicly downloadable;
`private: true` is an npm publication guard, not a confidentiality promise. This does not upload or
replace the separately retained historical Phase 6C bundle.

After this workflow merges, dispatch **Release rehearsal (no publication)** from main in Actions.
Review its source/tooling identities, environment, six package hashes, packed files, and
dependencies. A green run proves assembly on hosted Linux, not publication readiness or all consumer
support.

## Remaining release approval checklist

- [x] Hosted workflow run completed and its exact artifacts reviewed; see the
      [hosted rehearsal result](./initial-npm-hosted-rehearsal.md).
- [ ] Fresh independent Vanilla/React and three-engine consumer matrix completed for the release
      artifacts, with minimum/current supported compiler and framework lines.
- [ ] Fresh advisory capture reviewed; historical zero findings are not current security evidence.
- [ ] Resolve the recorded `@lit-labs/ssr-dom-shim@1.6.0` missing package-root license/notice-file
      limitation with an explicit legal/compliance disposition; do not fabricate license files.
- [ ] Preserve automated-browser-only and Windows/NVDA-unobserved limitations; no broader human
      assistive-technology support claim is created by the release.
- [ ] Verify npm organization ownership, account 2FA, maintainer access, and recovery contacts.
- [ ] Select the explicit initial npm dist-tag and approve release notes and support boundaries.
- [ ] Review protected main/release tags, pinned publishing actions, and human approval controls.
- [ ] Approve the exact public manifests and publishable tarballs in a subsequent release change.
      This rehearsal deliberately leaves source and projected package privacy unchanged.
- [ ] Recheck npm's first-package bootstrap requirements and prefer tokenless publishing if
      supported; otherwise use a short-expiry, minimally scoped bootstrap credential in a protected
      workflow, never in chat or during package builds, and revoke it immediately afterward.
- [ ] Approve exact versions, source/tooling commits, hashes, tags, and partial-failure recovery
      plan before the first immutable npm publication.
- [ ] After publishing, verify registry hashes, provenance, dependency availability, clean installs,
      and runtime use before announcing. Configure stage-only trusted publishing for later releases.

The private rehearsal tarballs cannot be passed to npm as-is. Removing their publication guard
changes bytes and hashes and requires a new approved assembly and consumer validation, not an
in-place edit of accepted evidence. The root workspace and non-release units remain private.

## Platform references

- [npm trusted publishers](https://docs.npmjs.com/trusted-publishers/): public-repository
  provenance, OIDC workflow binding, stage-only permissions, and publisher configuration expiry.
- [GitHub secure use](https://docs.github.com/en/actions/reference/security/secure-use): least
  privilege, immutable action pins, and credential isolation.
- [Release governance](./release-governance.md),
  [candidate disposition](./phase-6c-e5d-candidate-disposition.md), and
  [ADR 0036](../architecture/adr/0036-private-release-candidate-tooling.md).
