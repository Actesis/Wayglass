# Phase 6C-E5C authoritative-run attempt record

**Status:** Attempt 1 failed at output-path preflight on September 8, 2026. The approved E5B
snapshot remains intact and no candidate assembly, quality gate, browser matrix, or retained bundle
was started. This record does not authorize a retry, publication, credentials, tags, releases,
deployment, or external-application work.

## Append-only run ledger

The command-start instant was not independently captured before invocation. Inventing it would
create false evidence, so `recordedAt` is the immediate postcondition-verification time rather than
a claimed start time.

| Sequence | Recorded at            | Outcome | Code                | Safe summary                                                                        |
| -------- | ---------------------- | ------- | ------------------- | ----------------------------------------------------------------------------------- |
| 1        | `2026-09-08T03:37:50Z` | failed  | `WG_RC_OUTPUT_TEMP` | The selected output was not a child of this host's operating-system temporary root. |

## Authorized inputs

The project owner explicitly approved and authorized the attempt with:

- frozen source `ce400e89930a047c6af1c6992c64cfe422a1eeee`;
- merged tooling commit `d7298882df605c2778b30fbbb0d1c51ac2a6446b`;
- approved snapshot SHA-256 `c67751865ce3fe05e294fc173246abefb0f875fe5f5afd6dc6f5f09a239ed3f9`;
- zero advisory findings and the accepted `WG_RC_ADVISORY_MEDIA_TYPE` warning; and
- snapshot validity through `2026-09-09T03:21:31Z`.

Immediately before invocation, the snapshot was a regular non-symlink file with the approved hash,
the repository was clean at the merged tooling commit, and the requested output path did not exist.

## Attempt 1 outcome

The operator selected a new directory below the system-wide temporary-directory alias. On this host,
Node resolves the operating-system temporary root to a different per-user directory. The integrated
runner therefore rejected the output at its first path-containment preflight with
`WG_RC_OUTPUT_TEMP`. The absolute machine paths and raw command output are intentionally excluded
from this repository record.

The failure occurred before the uncached quality gate, candidate assembly, consumer probes, browser
matrix, environment observation, or evidence retention. Verification immediately after the failure
confirmed:

- the requested output directory did not exist;
- no sibling partial directory existed;
- the repository remained clean at the merged tooling commit;
- only the main repository worktree existed; and
- the approved snapshot still had its exact accepted SHA-256.

No integrated-evidence hash, bundle-inventory hash, tarball hash, run count, or verifier result
exists for this attempt.

## Next authority boundary

Attempt 1 consumed its one-shot authority and cannot be relabeled or retried automatically. A new
attempt would select a new nonexistent directory below the actual operating-system temporary root,
but may run only after fresh explicit project-owner authorization. It must use the still-approved
snapshot before `2026-09-09T03:21:31Z`; otherwise a new E5B capture and approval are required first.
