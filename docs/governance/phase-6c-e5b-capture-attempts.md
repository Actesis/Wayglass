# Phase 6C-E5B advisory-capture attempt record

**Status:** Three failed pre-transport attempts recorded on September 7, 2026, with a
manifest-license evidence correction proposed for project-owner acceptance. No npm advisory request
occurred, no response was received, and no snapshot exists. This record does not authorize another
capture attempt, the E5C authoritative run, publication, credentials, tags, releases, deployment, or
external-application work.

## Append-only capture ledger

The execution environment did not preserve whole-second command-start times for the first two
attempts. Inventing them would create false evidence, so `recordedAt` is the whole-second UTC time
at which both already-observed outcomes were entered into this repository record. Future capture
attempts must record their actual command-start time at invocation.

| Sequence | Recorded at            | Outcome | Code                     | Safe summary                                                                 |
| -------- | ---------------------- | ------- | ------------------------ | ---------------------------------------------------------------------------- |
| 1        | `2026-09-07T22:52:57Z` | failed  | `WG_RC_OUTPUT_TEMP`      | The selected output was not below the operating-system temporary root.       |
| 2        | `2026-09-07T22:52:57Z` | failed  | `WG_RC_COMMAND_START`    | The pinned pnpm JavaScript launcher existed but was not directly executable. |
| 3        | `2026-09-07T23:01:24Z` | failed  | `WG_RC_DEPENDENCY_AUDIT` | One dependency declared a license but retained no license or notice file.    |

Both failures occurred before candidate assembly and before construction or transmission of the
advisory request. Neither attempt contacted npm, received provider bytes, created a snapshot,
changed the frozen source, or left candidate output. Attempt 2 used the corrected temporary-root
location from attempt 1; it did not overwrite or relabel attempt 1. Attempt 3 completed candidate
assembly before the dependency audit stopped it, but it also occurred before request construction or
transmission. None of the three attempts contacted npm, received provider bytes, or created a
snapshot.

## Attempt 2 diagnosis

The repository-pinned pnpm selection exposes a real absolute `npm_execpath`, but the selected
shebang-bearing `pnpm.cjs` store file has mode `0644`. The assembler authenticated that the path was
absolute and existed, then passed it directly to the process launcher. Direct spawning therefore
failed with `EACCES`. The same path was also symlinked as the nested-worktree `pnpm` command, so the
later install and build boundaries would have inherited the defect.

The correction keeps the exact pinned launcher and does not select a global or alternate pnpm. When
the authenticated launcher is executable, behavior is unchanged. When it is not executable, direct
commands invoke it through the current absolute Node executable, and the owned nested-command
directory receives an executable shell shim that does the same. Arguments remain an explicit argv
array and are forwarded without evaluation. The shim is removed with its assembly-pass temporary
root.

Regression validation uses a real non-executable JavaScript fixture for both direct invocation and
the generated nested shim. Existing executable-launcher behavior remains covered.

## Attempt 3 diagnosis

The exact installed `@lit-labs/ssr-dom-shim@1.6.0` package manifest declares `BSD-3-Clause`, but the
published package contains no package-root license, licence, copying, or notice file. The other six
nodes in the exact production graph retain legal files. The collector correctly reported the real
package contents; its accepted contract and synthetic fixture incorrectly required every dependency
to embed separate legal-file bytes.

The correction continues to require the installed manifest's non-empty license declaration and to
hash the exact manifest bytes. It hashes every recognized package-root legal file that is present.
When none is present, it retains `licenseFiles: []` as explicit evidence requiring project-owner
disposition; it does not invent legal text, retrieve substitute repository bytes, infer a license
from package identity, or turn the absence into a clean legal-review conclusion. A missing or empty
manifest declaration still fails closed.

Regression validation models the exact installed shim without a legal file, proves that its declared
license and empty legal-file list survive canonical serialization, proves that the other six nodes
retain their legal-file hashes, and continues to reject a missing manifest license. The complete
repository quality gate passed, including 125 release-candidate tests across 22 files, 285
documentation assertions across 42 files, and the documentation build.

A separate hard-offline audited assembly against implementation commit `6246992` then completed both
deterministic frozen-source passes and retained the exact seven-node graph. It observed
`@lit-labs/ssr-dom-shim@1.6.0` with declared license `BSD-3-Clause` and zero legal files. That local
validation had no advisory transport, created no snapshot, and its disposable candidate output was
removed.

## Next authority boundary

Merging this correction only makes a later capture attempt technically eligible. It does not retry
E5B. Attempt 4 requires a fresh explicit project-owner instruction after the reviewed correction is
merged, and it must create a new output file, append a fourth ledger entry, and preserve either its
failure or its exact canonical snapshot for owner review.
