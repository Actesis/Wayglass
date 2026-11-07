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
private tarballs, and prior evidence are never changed. The private assembler and its verifiers
remain unchanged and still require the private projection.

Output contains six projected package manifests and a `publication-plan.json` recording each
manifest hash, frozen source identity, and tooling identity. `publicationAuthorized` is literally
false and `distTag` is null. These are review metadata, not installable packages or publication
artifacts. No archive is unpacked, no package is packed, and no registry call is made.

The manual main-only `.github/workflows/publication-review.yml` runs this command after owner
environment approval and clean quality checks. It uses pinned official actions, exact Node/pnpm, no
restored caches, read-only repository permissions, no OIDC and no credential references. It uploads
only metadata for seven-day public review. It contains no publish or stage command. The workflow's
environment gate still needs an owner-operated hosted rehearsal after merge.

## Next implementation and approval gates

1. Assemble new public tarballs from the authenticated frozen source and these strict projections,
   without mutating the private candidate evidence. Produce new two-pass hashes and inventories.
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
