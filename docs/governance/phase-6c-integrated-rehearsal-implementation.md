# Phase 6C-D5 integrated rehearsal implementation

**Status:** Implementation proposed for project-owner acceptance on September 6, 2026; execution is
open because the accepted consumer graph is not fully materialized in the offline store. This record
covers the fail-closed preflight and disposable end-to-end runner authorized by the accepted Phase
6C-D4 implementation. It does not claim that D5, an integrated candidate, or a browser matrix
passed; authorize Phase 6C-E; contact or publish to npm; add registry material; remove package
privacy; use credentials; create a tag or release; change repository visibility; deploy; or build an
external application.

## One integrated rehearsal

The private command is
`pnpm release-candidate:rehearse -- --source ce400e89930a047c6af1c6992c64cfe422a1eeee`. It accepts
no alternate source, output path, store, package set, scenario, browser subset, retry, or retention
option.

After preflight, one invocation:

1. authenticates the accepted frozen source through the existing assembler;
2. performs both clean assembly passes and requires six byte-identical private candidate tarballs;
3. passes the assembler's exact evidence path and repository `.pnpm-store` directly to the combined
   consumer runner;
4. executes two Vanilla and four React build/removal scenarios against those tarballs;
5. executes Chromium, Firefox, and WebKit for both stages of every scenario, requiring exactly 36
   browser cases; and
6. returns only a small success summary after deleting the entire rehearsal root.

The rehearsal cannot substitute a pre-existing candidate directory, retain its generated evidence,
or turn a partial matrix into success. Any unexpected count fails with `WG_RC_REHEARSAL_MATRIX`.

## Exact offline material preflight

Before the expensive two-pass source build, the runner projects six third-party-only manifests from
the same canonical scenario definitions used by the real consumer projects. These contain exact
TypeScript `5.9.3` and `6.0.3`, Vite `8.1.5`, React and React DOM `19.0.0` and `19.2.8`, and their
accepted exact type-package lines. They contain no Wayglass dependency, tarball, workspace range,
script, or lifecycle hook.

Each scenario receives a fresh temporary directory and empty npm configuration. The runner first
resolves a lockfile and then performs a frozen install with `--offline`, `--ignore-scripts`, and the
repository's validated `.pnpm-store`. This verifies resolved transitive bytes as well as cached
metadata. A missing package fails with `WG_RC_CONSUMER_OFFLINE_MATERIAL`, names the exact scenario,
and removes the whole preflight root. It does not fall back to another version, another store, the
network, or the registry.

The material projection and actual consumer manifest share one dependency-construction function so
their compiler, build, framework, and type versions cannot drift independently.

## Cleanup and evidence boundary

The preflight root and later rehearsal root are separate operating-system temporary directories.
Each is removed in a `finally` boundary on success, assertion failure, command failure, browser
failure, or incomplete matrix. The rehearsal root owns the only candidate output and evidence path,
so successful D5 execution leaves no candidate tarball, evidence JSON, consumer project, browser
server, worktree, npm cache, or generated lockfile behind.

This deliberate deletion distinguishes D5 integration confidence from Phase 6C-E's authoritative,
immutable evidence record. Console diagnostics may establish why a rehearsal did not run; they are
not candidate evidence and cannot be promoted into it.

## Observed offline preflight

The first real command-level preflight ran on September 6, 2026 with the required source and hard
offline controls. The `vanilla-ts-5.9.3` lockfile resolved, but its frozen installation stopped at
missing `postcss@8.5.28`, a transitive package selected for the fresh Vite `8.1.5` graph. pnpm
reported zero downloaded packages and `ERR_PNPM_NO_OFFLINE_TARBALL`; the wrapper returned exit `2`.

No candidate assembly, consumer build, browser launch, registry request, or retained output
occurred. The failure is the intended unsupported-environment result and is not rewritten as a
failed candidate. Additional missing transitive material may become visible only after this first
blocker is resolved.

No registry access is authorized by this implementation. Material must enter the dedicated store
through a separately explicit project-owner decision before the rehearsal may be rerun.

## Retained validation

Focused tests cover canonical material projection, all six exact preflight scenarios, both offline
install steps, script suppression, absence of Wayglass and workspace inputs, exact missing-scenario
diagnostics, preflight cleanup, source pinning, preflight-before-build ordering, direct evidence
handoff, exact 2/4/36 result counts, partial-matrix rejection, and candidate cleanup on success and
failure. The focused release-candidate suite passes 73 assertions across 16 files with TypeScript
and ESLint checks.

The complete offline repository gate also passes against the final implementation: formatting and
repository lint; all 14 scheduled builds; 58 icon-tooling, 93 token-tooling, 73 release-candidate,
and 24 visualization assertions; all 20 scheduled typecheck tasks; and all 20 scheduled package and
application test tasks, including 250 documentation assertions. Only the repository's existing
informational Storybook chunk-size and Lit development-mode warnings were emitted.

## Acceptance effect

Acceptance approves the D5 runner implementation and the honestly blocked preflight result. It does
not complete Phase 6C-D5. Completion still requires a no-retry, all-green ephemeral rehearsal and
separate project-owner acceptance of that result. Acceptance does not authorize acquiring offline
material, registry or npm access, Phase 6C-E, retained candidate evidence, publication readiness,
package privacy changes, credentials, tags, releases, repository visibility changes, deployment, or
external application work.
