# ADR 0036: Use private tooling to assemble frozen release candidates

- Status: proposed
- Date: 2026-09-04

## Context

Phase 6B froze package source commit `ce400e89930a047c6af1c6992c64cfe422a1eeee` for the v1 candidate
proof. That commit intentionally retains repository scripts, development dependencies,
workspace-only links, and `private: true`. Phase 6C must build that exact source, deterministically
project installable manifests, create and inspect local tarballs, and exercise them outside the
monorepo without contacting npm or changing the frozen commit.

Release-candidate tooling necessarily lands after the frozen source. Putting it into a candidate
package, changing the frozen manifests in place, or silently advancing the source commit would
invalidate the accepted freeze.

## Decision

Create private repository tooling under `tooling/release-candidate/`. It is not a workspace or npm
package, public command, runtime dependency, or release unit. It uses Node built-ins and existing
repository tools; no dependency is added.

The tool treats the frozen package tree and the tooling revision as separate authenticated inputs.
An explicit driver creates an operating-system temporary detached worktree at the required full
source commit, verifies its tree and lockfile hash, and installs the committed dependency graph in
offline, frozen-lockfile, lifecycle-disabled mode. A missing local dependency-store entry is a
preflight failure, not permission to use the registry.

The frozen worktree owns compilation and source validation. The later private tool reads its
manifests and built files, validates the accepted package set, copies only reviewed package files
into a separate staging tree, and writes deterministic projected manifests there. It never edits a
source manifest or candidate build output.

Projected manifests preserve reviewed consumer metadata and runtime relationships while removing all
`scripts`, `devDependencies`, lifecycle hooks, and workspace or filesystem ranges. Phase 6C retains
`private: true`; only the separately approved initial-release change may remove it. Local packing
runs with scripts disabled and network-dependent npm behavior disabled.

The package order is core, tokens, themes, elements, icons, then React. Every run produces an
inventory binding source commit, source tree, lockfile hash, tooling commit, environment, projected
manifest hash, tarball SHA-256, sizes, and packed paths. Repetition must produce byte-identical
projected files and tarballs.

Vanilla and React probes live only in operating-system temporary directories. They install local
tarballs plus already materialized third-party dependencies without workspace resolution or source
imports. They prove type checking, production build, runtime behavior, explicit registration,
representative semantics, interaction, and removal. They are domain-neutral probes, not examples or
external applications.

All write targets are explicit descendants of a newly created temporary run root. The tool rejects
the repository root, source worktree, symlink escapes, existing non-tool paths, dirty or mismatched
source, unapproved packages, and credentials in its environment. Failure preserves evidence already
accepted and removes only paths owned by the failed run.

## Consequences

- Phase 6C can prove the accepted source without rewriting history or broadening candidate scope.
- Candidate bytes are attributable to both frozen source and reviewed assembly logic.
- Offline local proof depends on the required packages already existing in the local pnpm store;
  Phase 6E must still repeat release validation in its separately approved clean hosted workflow.
- `private: true` prevents a Phase 6C artifact from becoming the publication artifact by accident.
- The repository gains a bounded private maintenance surface and deterministic evidence format.
- A tooling change or source correction invalidates affected hashes and requires a fresh run.

## Alternatives considered

### Add release scripts to the frozen commit

Rejected because the project owner accepted one exact earlier source commit. Rewriting or replacing
that identity would require a new Phase 6B freeze.

### Edit package manifests before packing

Rejected because it mutates the authenticated source and makes the artifact difficult to reproduce
or audit. Projection occurs only in isolated staging.

### Adopt a release framework

Rejected for Phase 6C. Existing Node, pnpm, npm pack, TypeScript, Vite, Vitest, and Playwright
capabilities cover the bounded proof; another dependency would add policy, lifecycle, and supply-
chain surface without a demonstrated gap.

### Make Phase 6C tarballs publishable

Rejected. Publication requires a later approved change that removes package privacy, verifies
current platform controls, and creates exact release artifacts without rebuilding after approval.

### Keep release-candidate fixtures in the monorepo

Rejected because workspace resolution could hide missing ranges, files, exports, or side effects.
Only fixture source templates and assertions may be retained; every install and build occurs outside
the workspace.

## Related records

- [Phase 6C release-candidate proof contract](../../governance/phase-6c-release-candidate-proof-contract.md)
- [Phase 6B integrated v1 freeze](../../governance/phase-6b-integrated-freeze.md)
- [Release-governance contract](../../governance/release-governance.md)
- [ADR 0035: initial version and compatibility](./0035-initial-version-and-compatibility.md)
- [ADR 0031: ecosystem artifact architecture](./0031-ecosystem-artifact-architecture.md)
