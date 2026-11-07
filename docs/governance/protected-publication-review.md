# Protected publication metadata review

Status: preparation only; no npm publication authorized. This is the next bounded step after the
private candidate rehearsal, not a replacement for publishable-tarball validation.

## Verified account and approval boundary

Read-only npm checks on November 7, 2026 verified account `actesis` owns `@wayglass` and has
two-factor authentication enabled in `auth-and-writes` mode, with no pending setup. Recovery-code
storage and recovery contact readiness remain owner confirmations; no recovery material is read or
retained. No npm package or bootstrap credential is created here.

GitHub environment `npm-release` (ID `26577432631`) was created for this repository only. It
requires reviewer `Actesis` (existing user ID `27646205`), disables administrator approval bypass,
and permits only the `main` branch through policy `65867202`. Self-review is allowed because the
initial maintainer also dispatches the job; this is an explicit owner presence gate, not independent
two-person control. The agent must not approve the deployment through the API on the owner's behalf.
The owner reviews and approves the waiting job in GitHub's UI.

The exact environment and branch-policy requests are tracked under `.github/release-protection/`.
Both were read back after creation. No environment secrets are present. Creating this empty review
environment does not authorize adding a token or making an npm trusted-publisher connection.

## Isolated public manifest projection

```sh
pnpm release-candidate:publication-plan -- --source ce400e89930a047c6af1c6992c64cfe422a1eeee --output <new-absolute-temporary-directory>
```

The command authenticates clean tooling and the frozen commit/tree/lockfile, rejects release
credentials, and reads only frozen Git manifests. It reuses the strict six-package candidate
projection, then changes exactly `private: true` to `private: false` in **new isolated metadata**.
It retains no scripts, development dependencies, or workspace ranges. Workspace manifests, accepted
private tarballs, and prior evidence are never changed. The private assembler's default projection
remains private. Private evidence verification rejects the separate public-review evidence
discriminator; public archives require explicit review tooling.

Output contains six projected package manifests and a `publication-plan.json` recording each
manifest hash, frozen source identity, and tooling identity. `publicationAuthorized` is literally
false and `distTag` is null. These are review metadata, not installable packages or publication
artifacts. No archive is unpacked, no package is packed, and no registry call is made.

The manual main-only `.github/workflows/publication-review.yml` runs this command after owner
environment approval and clean quality checks. It uses pinned official actions, exact Node/pnpm, no
restored caches, read-only repository permissions, no OIDC and no credential references. It uploads
only metadata for seven-day public review. It contains no publish or stage command. The workflow's
environment gate was exercised successfully with the owner's UI approval on November 7, 2026.

## Owner-approved metadata rehearsal

[Run 42393786644](https://github.com/Actesis/Wayglass/actions/runs/42393786644) completed
successfully at `2026-11-07T17:00:16Z`, including `pnpm check`, on tooling commit
`01b00641331c31742ac9e2c4b22cebfabf3f471f`. Artifact `13583225397`,
`publication-metadata-01b00641331c31742ac9e2c4b22cebfabf3f471f-1`, has GitHub archive digest
`sha256:10d39b91f7609af3bb862b912c778b9b48929b9cc5ca72d96759ffc042971ae5` and expires
`2026-11-14T17:00:12Z`. Independent local inspection rehashed all six manifests and compared their
complete bytes with the public projection of each frozen Git manifest. All matched; the plan still
records `publicationAuthorized: false` and `distTag: null`. No tarballs were produced by this run.

## Public-review archive assembly

```sh
pnpm release-candidate:build-publication -- --source ce400e89930a047c6af1c6992c64cfe422a1eeee --output <new-absolute-temporary-directory>
pnpm release-candidate:verify-publication -- --evidence <absolute-publication-evidence-path>
```

This separate entry point authenticates clean tooling and the same frozen source. It performs two
independent detached-worktree offline frozen installations, uncached source checks, builds, isolated
staging, lifecycle-disabled local packing, and unpacked-file inspection. Public staging changes only
the strict projected manifest's `private` field. Shared mechanical staging/packing accepts either
explicit manifest type, but the existing private assembler entry points and private audit format do
not switch to public mode. No accepted private artifact is edited or relabeled.

Two passes must match tarball bytes, manifest hashes, and full file inventories. Output contains six
archives under `packages/` and `publication-evidence.json` binding frozen source, tooling,
environment, sizes, inventories, and hashes. The evidence explicitly says
`artifactKind: publication-review`, `publicationAuthorized: false`, and `distTag: null`.

The separate verifier rehashes retained archives and compares each packed manifest's complete bytes
and recorded hash with its exact frozen public projection. It streams the manifest without
extracting evidence-supplied archives onto disk. It does not independently replay the two assembly
passes or assert that the evidence came from a hosted run. Neither this verifier nor the assembly
command proves independent installed consumers or authorizes publication. Credential-bearing
environments are rejected before either command acts; missing offline material fails without a
registry fallback. No dependencies, credential access, publishing, tags, or automatic dist-tag
selection are added. The already approved hosted workflow remains metadata-only; running a future
archive workflow requires review of that workflow and a fresh owner environment approval.

## Next implementation and approval gates

1. Review the new public archive assembly tooling and its exact two-pass hashes and inventories,
   without mutating the private candidate evidence.
2. Exercise those exact public tarballs in fresh independent consumers and retain resolved-graph,
   browser, and environment evidence. A manifest projection is not a substitute for that proof.
3. Approve the initial dist-tag, release notes, support limitations, recovery contacts, and exact
   source/tooling/package hashes. No default npm `latest` movement is inferred.
4. Recheck advisory freshness at final approval; November 7 acceptance does not extend its expiry.
5. Review first-package authentication and provenance requirements, then implement a separately
   guarded publisher that consumes preverified tarballs without rebuilding under credentials.
   Token/bootstrap configuration, package creation, tags, provenance publication, and npm upload
   still require explicit approval. Subsequent stage-only trusted publishing remains the policy.

Existing release checks, owner approval, and protection policies must not be bypassed merely to
speed up the first publication. No npm package may be announced as released until registry and
clean-install verification has completed.
