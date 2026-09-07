# Phase 6C-E5B advisory-capture attempt record

**Status:** Two failed pre-transport attempts recorded on September 7, 2026, with a launcher
correction proposed for project-owner acceptance. No npm advisory request occurred, no response was
received, and no snapshot exists. This record does not authorize another capture attempt, the E5C
authoritative run, publication, credentials, tags, releases, deployment, or external-application
work.

## Append-only capture ledger

The execution environment did not preserve whole-second command-start times for these two attempts.
Inventing them would create false evidence, so `recordedAt` is the whole-second UTC time at which
both already-observed outcomes were entered into this repository record. Future capture attempts
must record their actual command-start time at invocation.

| Sequence | Recorded at            | Outcome | Code                  | Safe summary                                                                 |
| -------- | ---------------------- | ------- | --------------------- | ---------------------------------------------------------------------------- |
| 1        | `2026-09-07T22:52:57Z` | failed  | `WG_RC_OUTPUT_TEMP`   | The selected output was not below the operating-system temporary root.       |
| 2        | `2026-09-07T22:52:57Z` | failed  | `WG_RC_COMMAND_START` | The pinned pnpm JavaScript launcher existed but was not directly executable. |

Both failures occurred before candidate assembly and before construction or transmission of the
advisory request. Neither attempt contacted npm, received provider bytes, created a snapshot,
changed the frozen source, or left candidate output. Attempt 2 used the corrected temporary-root
location from attempt 1; it did not overwrite or relabel attempt 1.

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
the generated nested shim. Existing executable-launcher behavior remains covered. The complete
release-candidate suite, documentation tests, documentation build, and repository quality gate must
pass before this correction is offered for acceptance.

## Next authority boundary

Merging this correction only makes a later capture attempt technically eligible. It does not retry
E5B. Attempt 3 requires a fresh explicit project-owner instruction after the reviewed correction is
merged, and it must create a new output file, append a third ledger entry, and preserve either its
failure or its exact canonical snapshot for owner review.
