# Phase 6C-D5 integrated rehearsal implementation

**Status:** Exact package-manager reuse correction proposed on September 6, 2026; integrated
execution remains open. The accepted consumer graph is materialized in the dedicated offline store,
and a retained diagnostic proved the frozen source gate under the exact pnpm executable. The
integrated runner has not yet completed after that correction. This record covers the fail-closed
preflight, the narrowly authorized cache preparation, and the disposable end-to-end runner
authorized by the accepted Phase 6C-D4 implementation. It does not claim that D5, an integrated
candidate, or a browser matrix passed; authorize Phase 6C-E; publish to npm; remove package privacy;
use credentials; create a tag or release; change repository visibility; deploy; or build an external
application.

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

## Observed environment preparation and assembly attempts

The first real command-level preflight ran on September 6, 2026 with the required source and hard
offline controls. The `vanilla-ts-5.9.3` lockfile resolved, but its frozen installation stopped at
missing `postcss@8.5.28`, a transitive package selected for the fresh Vite `8.1.5` graph. pnpm
reported zero downloaded packages and `ERR_PNPM_NO_OFFLINE_TARBALL`; the wrapper returned exit `2`.

No candidate assembly, consumer build, browser launch, registry request, or retained output
occurred. The failure is the intended unsupported-environment result and is not rewritten as a
failed candidate. Additional missing transitive material may become visible only after this first
blocker is resolved.

The project owner then explicitly authorized continuing to the next step. In disposable directories,
the exact six third-party-only graphs were installed into the dedicated repository store with an
empty npm configuration and lifecycle scripts disabled. All six preparations succeeded; the first
Vanilla graph downloaded five artifacts, the React `19.0.0` minimum-compiler graph downloaded five,
and the remaining graphs reused the resulting store material. The preparation directories were
removed. This one-time material preparation did not install a Wayglass package, publish anything,
change a manifest or lockfile in the repository, use release credentials, or broaden rehearsal-time
network access.

The next hard-offline rehearsal passed the six-scenario material preflight and reached the first
detached frozen-source assembly. Its `pnpm check` command stopped because pnpm could not find the
offline tarball for the repository-pinned package manager `pnpm@11.9.0`. A separate script-disabled
material check for that exact package reused an artifact already present in the dedicated store, but
a second hard-offline rehearsal stopped at the same point. Neither attempt produced candidate
tarballs, ran a consumer or browser case, or retained its temporary worktree or rehearsal root.

The initial failure appeared to be configuration reachability: the assembler supplied `--store-dir`
only to its install command, while later commands did not inherit the dedicated store. Propagating
`npm_config_store_dir` corrected that gap but did not complete assembly. A disposable, script-free
bootstrap invocation for the exact `pnpm@11.9.0` returned the accepted version, yet the following
hard-offline rehearsal stopped at the same boundary. Neither additional attempt created a candidate
tarball or reached a consumer or browser case, and both cleaned up their worktrees and rehearsal
roots.

A retained diagnostic worktree exposed the complete message hidden by the outer command summary. The
Homebrew pnpm `11.25.0` launcher was attempting to revalidate the repository-pinned pnpm `11.9.0`
registry signature before each new invocation. That online signature check is incompatible with the
rehearsal's mandatory hard-offline boundary even though the already-validated 11.9.0 executable and
package bytes are present locally. The first frozen install did run under pnpm `11.9.0`; a temporary
`PATH` shim that reused that exact executable then allowed the complete frozen source `pnpm check`
to pass offline: 14 builds, 20 typechecks, 20 test tasks, 58 icon-tooling, 93 token-tooling, 24
visualization, and 208 source-era documentation assertions.

The final correction requires the private command to be launched by a real absolute `npm_execpath`,
creates a per-pass temporary `pnpm` shim to that already-selected executable, and places the shim
first on `PATH` for every top-level and nested assembly command. It also reads the candidate
evidence pnpm version from the same executable. The shim and diagnostic worktree are removed with
their owning temporary roots. Hard-offline execution remains mandatory; there is no fallback to the
registry, another store, another pnpm version, or `pmOnFail=ignore`.

## Retained validation

Focused tests cover canonical material projection, all six exact preflight scenarios, both offline
install steps, script suppression, absence of Wayglass and workspace inputs, exact missing-scenario
diagnostics, preflight cleanup, source pinning, preflight-before-build ordering, direct evidence
handoff, exact 2/4/36 result counts, partial-matrix rejection, candidate cleanup on success and
failure, dedicated-store propagation through nested assembly commands, and exact package-manager
shim creation and precedence. The focused release-candidate suite passes 74 assertions across 16
files with TypeScript and ESLint checks.

The complete offline repository gate also passes against the final implementation: formatting and
repository lint; all 14 scheduled builds; 58 icon-tooling, 93 token-tooling, 74 release-candidate,
and 24 visualization assertions; all 20 scheduled typecheck tasks; and all 20 scheduled package and
application test tasks, including 250 documentation assertions. Only the repository's existing
informational Storybook chunk-size and Lit development-mode warnings were emitted.

## Acceptance effect

Acceptance approves the D5 runner implementation, the narrowly scoped material preparation, the
honestly recorded environment failures, and the exact-package-manager correction. It does not
complete Phase 6C-D5. Completion still requires an all-green ephemeral rehearsal and separate
project-owner acceptance of that result. Acceptance does not authorize further registry or npm
access, Phase 6C-E, retained candidate evidence, publication readiness, package privacy changes,
credentials, tags, releases, repository visibility changes, deployment, or external application
work.
