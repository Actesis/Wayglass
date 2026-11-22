# ADR 0039: Release later versions through one reusable, staged, owner-approved workflow

- Status: proposed
- Date: 2026-11-22

## Context

Wayglass 0.1.0 shipped through tooling built for one frozen candidate. `tooling/release-candidate/`
(ADR 0036) and its workflows hard-code source commit `ce400e89930a047c6af1c6992c64cfe422a1eeee`,
version `0.1.0`, and the retained `initial-npm-public-0.1.0.zip` archive. They proved that first
release thoroughly, but cannot release a second version.

The release-governance contract already names the path for later releases. A pinned GitHub-hosted
workflow stages each package with `npm stage publish`, authenticated by npm trusted publishing
(OIDC), with no long-lived npm token. The owner then reviews each staged version and approves it
with two-factor authentication. That workflow did not exist yet.

The first consumer feedback produced a compatible defect fix in `@wayglass/elements`, which needs a
foundation patch release.

## Decision

Add `.github/workflows/npm-release.yml` and the small private tool `tooling/npm-release/`. The tool
is not a package or public command and uses only Node built-ins, npm, Git, and `tar`; no dependency
is added.

1. **Manual and main-only.** The workflow runs only by dispatch from `main` in `Actesis/Wayglass`.
   Its inputs are the release unit (`foundation`, `icons`, or `react`), the version, and the
   dist-tag (`latest` or `next`).
2. **No release from an unverified commit.** The prepare job requires exactly one passing
   `Wayglass quality` check from GitHub Actions on the dispatched commit. That check aggregates
   `pnpm check` and the browser suite in three engines. The job refuses a release tag or npm version
   that already exists.
3. **Versions come from reviewed manifests.** The tool never edits versions. Each manifest in the
   unit must already carry the requested version on `main` and stay `private: true` there. Every
   Wayglass dependency range must admit the versions released with it.
4. **A small, fixed projection to the public manifest.** The published manifest is the workspace
   manifest with `private: false`, and without `scripts` and `devDependencies`. Key order is
   preserved, so `exports` keeps TypeScript's `types`-first condition order. Against the published
   0.1.0 packages, this projection reproduces the same manifests (up to key order) and the same file
   lists.
5. **Each tarball is verified before anything is uploaded.** Each packed manifest must equal the
   projection. Every file must fall under the manifest's `files` or be `package.json`. The readme,
   license, notice, and every export target must be present. The tarballs must install together in a
   clean consumer. Hashes go into `SHA256SUMS` and `release-plan.json`.
6. **Staging holds the only OIDC permission and runs no repository code.** The stage job runs in the
   owner-reviewed `npm-release` environment. It downloads the prepared artifact, checks every hash
   and the plan against the run, and calls pinned npm `11.21.2`, staging in dependency order with
   `--provenance`, `--access=public`, and the chosen dist-tag. It never checks out or runs
   repository code.
7. **The owner remains the release authority.** A staged version is not installable until the owner
   approves it on npmjs.com with two-factor authentication. The owner also approves the
   `npm-release` environment run, creates the release tag (only administrators may), and moves any
   second dist-tag.

## Consequences

- A release becomes a reviewed manifest change on `main` plus one dispatch and the owner's npm
  approvals. Most steps are automated; the approvals stay human by design.
- Each package needs a one-time trusted-publisher entry on npmjs.com that names this repository,
  `npm-release.yml`, and the `npm-release` environment. Until it exists, staging fails safely before
  anything is uploaded.
- Partial failure leaves earlier packages staged but not published. The owner discards or approves
  them; published versions are never reused.
- The initial-release tooling and its workflows remain as the 0.1.0 record. They are not reused or
  edited for later releases.
- The workflow does not create tags, GitHub releases, or announcements. Those stay explicit owner
  actions.

## Alternatives considered

- **Generalize `tooling/release-candidate/`.** Rejected. It is about 10,000 lines of evidence
  tooling bound to one frozen candidate, offline replay, and signing ceremonies. Making it generic
  would put the accepted 0.1.0 record at risk for little gain.
- **Release automation such as Changesets or semantic-release.** Rejected for now. It adds
  dependencies and automatic versioning that the governance contract has not approved, and it
  usually publishes directly rather than staging for human approval.
- **Publish directly with a granular token.** Rejected. It requires a long-lived write secret and
  skips the staged, two-factor approval that the governance contract requires.
- **Stage from the same job that builds.** Rejected. The OIDC token would then be available to
  repository build code and its dependencies.
