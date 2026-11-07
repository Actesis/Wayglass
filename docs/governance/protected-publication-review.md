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

### Local archive rehearsal result

On November 7, 2026, tooling commit `caa51a0441b8c276a6757d91f82b94f820bdfebb` (tree
`05f1cc0f6fe26f3108b69af35e0b17cb6dca68cf`) assembled the frozen source
`ce400e89930a047c6af1c6992c64cfe422a1eeee` twice. Both independent offline passes completed the
uncached source quality gates, builds, staging, packing, and full unpacked-file inspection. The six
tarballs and inventories were byte-identical across passes. Environment: macOS arm64, Node
`v26.8.1`, pnpm `11.9.0`, npm `11.19.0`.

| Package (`0.1.0`)    | Tarball SHA-256                                                    |
| -------------------- | ------------------------------------------------------------------ |
| `@wayglass/core`     | `1b8d897bc11f4aef5a55ecd8d0f2a69c945ae762a50366f01d63a3617a4928d6` |
| `@wayglass/tokens`   | `5c7b8898846009e5f2a05cce3dd5af14a4fb1b5efb2876adc4c40eb5adbf0649` |
| `@wayglass/themes`   | `9ce1374e2365407fae0ee12cef6a8cf7bb8466f44bc4a2347a0979ad9e6349fa` |
| `@wayglass/elements` | `e680c455c3ae0c1a5a021741046cfd2dad085a153c61e4ead20b267afaae4d28` |
| `@wayglass/icons`    | `752f16b722865ebd16a4b9c8ff7b569c9ad29afd79b469a2b1c981857965bb42` |
| `@wayglass/react`    | `0e9b72ad58525826c6c0325aaa7d316b45f42da2882fc2389f1d6e6caac940e5` |

The separately rerun public verifier passed for all six retained archives. The complete local
`publication-evidence.json` has SHA-256
`de1dcc09e36934541e7df74e9293a067514ae02b599ecb4f2e5e45bb245344ea` and is retained with the archives
under the OS temporary run `wayglass-publication-review.nYiSoOGO/artifacts`. It includes the
per-file, manifest, and inventory hashes; this table is a review summary, not a replacement for that
evidence. Temporary storage is not durable hosted release retention.

All non-manifest file inventories match the earlier hosted private candidates exactly; complete
packed public manifests match the frozen projections. Reverification of the retained private
candidate evidence also passed unchanged. A separate `TURBO_FORCE=true pnpm check` passed for the
new tooling, including 25 release-tooling test files / 139 tests and 69 documentation test files /
395 assertions. This is local archive evidence, not hosted archive/consumer evidence, final artifact
acceptance, provenance, a fresh advisory capture, or npm publication approval. Independent consumer
proof for these exact public archives is implemented separately below.

## Retained public consumer proof

```sh
pnpm release-candidate:probe-publication -- --evidence <absolute-publication-evidence-path> --store <existing-absolute-store> --output <new-absolute-temporary-directory>
```

This explicit command authenticates clean consumer-proof tooling and verifies the six public-review
archives against the frozen source. It copies the archive set and its evidence into a new temporary
proof bundle and re-verifies the copy before and after consumer execution. Each independent consumer
re-verifies public evidence through the separate verifier; ordinary private-consumer commands
continue to reject it. Copied vendor archive hashes are checked before installation.

The six existing domain-neutral scenarios cover TypeScript `5.9.3` and `6.0.3`, with Vanilla and
React `19.0.0` / `19.2.8`. Each uses its own temporary project, only local Wayglass tarballs, an
explicit existing dependency store, empty npm configuration, and lifecycle-disabled offline
installation. The exact pnpm `11.9.0` launcher is checked and supplied to nested commands rather
than falling back to a different globally installed pnpm. Missing material fails; this command never
provisions registry dependencies or downloads browsers.

The initial stage follows offline lockfile resolution and a frozen installation. The removal stage
follows the existing offline `pnpm remove` operation and production rebuild. Before each stage's
browser execution, the tool retains that project's `package.json`, `pnpm-workspace.yaml`, resolved
`pnpm-lock.yaml`, and actual `node_modules/.pnpm/lock.yaml` (as `installed-lock.yaml`). These are
the graphs used by these consumers, not the earlier standalone provisioning lockfiles. All twelve
snapshots / 48 files are individually hashed and rehashed before completion. Temporary projects are
still removed; successful graph snapshots and the candidate copy remain in the owned proof bundle.

The production consumer harness checks declarations, CSS, production bundles, registration,
independent known-state axes, React parity/events/client fallback, tree shaking, and removal. All 36
Chromium/Firefox/WebKit stage cases must pass runtime and semantics assertions, zero automated axe
violations, and zero page errors. Coverage validation rejects missing, duplicate, failed, or
incomplete build/browser records and missing or changed graph files. No test-executor override is
offered by this CLI. A failure removes only this command's new output; input artifacts and earlier
proof bundles remain untouched.

`consumer-proof.json` is written only after successful completion. It binds the exact candidate
evidence hash, assembly and consumer-tooling revisions, source identity, Node/pnpm/browser versions,
matrix results, and graph-file hashes. It retains `publicationAuthorized: false` and
`distTag: null`. This is local review evidence, not authenticated hosted execution, registry
installation, provenance, human assistive-technology validation, Windows/NVDA evidence, advisory
renewal, or publication acceptance. The hosted metadata workflow remains unchanged. No dependency is
added: existing pnpm, TypeScript, Vite, Playwright, axe, and Node filesystem/hash operations cover
this proof.

### Local consumer rehearsal result

On November 7, 2026, clean consumer tooling `5d5dda60169652de28c7e584e7ec3a6e3bdbd18a` (tree
`f8a51254dcccb72e367c77877573956180d7a3d6`) passed the complete local public-consumer proof against
the unchanged archive evidence `de1dcc09e36934541e7df74e9293a067514ae02b599ecb4f2e5e45bb245344ea`.
Both Vanilla scenarios, all four React scenarios, and all 36 initial/removal Chromium/Firefox/WebKit
cases passed, including zero axe violations and zero page errors in each browser case. Actual
browser versions were Chromium `151.0.7922.34`, Firefox `153.0`, and WebKit `26.5`; the host was
macOS arm64 with Node `v26.8.1` and pnpm `11.9.0`.

The proof bundle remains under temporary run `wayglass-publication-review.nYiSoOGO/consumer-proof`.
It retains an exact copy of the six archives, candidate evidence, all twelve graph snapshots / 48
files, and `consumer-proof.json` with SHA-256
`5928b937bfd24441b24c1a5fe3421f280f2eee958d6ee7d48a7f849a00c8764d`. The graph-file inventory, sorted
by portable relative path and hashed with the existing `hashFileInventory` format, is
`f6882125b0c4e14af2fddd1ea830c043c399cdc6cb6e118939b7f65005d572b5`. Independent post-run
verification rehashed every graph file and candidate archive, compared all public manifests against
frozen Git source, and checked complete matrix coverage. All passed. None of the retained graph
files contains an absolute repository or temporary-project path.

The new tooling passed cache-disabled `pnpm check` (including 26 release-tooling test files / 144
tests), plus final targeted typecheck/tests/lint. This local success does not claim authenticated
hosted execution or durable artifact storage. The next step is a separately reviewed, owner-gated
hosted public-archive and consumer rehearsal. Final artifact approval, advisory freshness,
dist-tag/recovery decisions, credentials/provenance, and registry publication remain open.

## Next implementation and approval gates

1. Review the new public archive assembly tooling and its exact two-pass hashes and inventories,
   without mutating the private candidate evidence.
2. Review the local public-consumer proof above and the separate
   [owner-gated hosted rehearsal](./hosted-publication-rehearsal.md) with retained artifacts and
   graph evidence. Local success does not authenticate hosted execution or final release artifact
   acceptance.
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
