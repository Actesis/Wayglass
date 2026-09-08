# Phase 6C-E5C authoritative-run attempt record

**Status:** Attempt 2 passed with independent verification on September 8, 2026, after attempt 1
failed at output-path preflight. The exact local bundle remains untouched pending project-owner
disposition. This record does not accept the candidate, publish packages, use credentials, create
tags or releases, deploy, or begin external-application work.

## Append-only run ledger

The attempt-1 command-start instant was not independently captured before invocation. Inventing it
would create false evidence, so its `recordedAt` is the immediate postcondition-verification time
rather than a claimed start time. Attempt 2 records the actual whole-second UTC command-start time
taken immediately before invocation.

| Sequence | Recorded at            | Outcome | Code                    | Safe summary                                                                                |
| -------- | ---------------------- | ------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| 1        | `2026-09-08T03:37:50Z` | failed  | `WG_RC_OUTPUT_TEMP`     | The selected output was not a child of this host's operating-system temporary root.         |
| 2        | `2026-09-08T03:46:21Z` | passed  | `WG_RC_INTEGRATED_PASS` | Both authoritative runs, the complete retained matrix, and independent verification passed. |

## Attempt 1 authorized inputs

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

## Attempt 2 authorized inputs

After merging the attempt-1 record, the project owner explicitly authorized attempt 2 with:

- frozen source `ce400e89930a047c6af1c6992c64cfe422a1eeee` and tree
  `da2550b5aa2636d0896ae61e08c340f405fe1412`;
- merged tooling commit `1b8bf4bfb664a882f8a008c3c297f5d8506a09bb` and tree
  `bdbd9bfaa3212a001f2145a479064ac33c00401c`;
- approved snapshot SHA-256 `c67751865ce3fe05e294fc173246abefb0f875fe5f5afd6dc6f5f09a239ed3f9`;
- zero advisory findings and the accepted `WG_RC_ADVISORY_MEDIA_TYPE` warning; and
- snapshot validity through `2026-09-09T03:21:31Z`.

Immediately before invocation, the repository was clean at the merged tooling commit, the snapshot
was a regular non-symlink file with the approved hash, and the corrected host-resolved output path
did not exist.

## Attempt 2 retained evidence

Attempt 2 completed successfully and retained exactly 12 files totaling 339,947 bytes. The
independent verifier completed at `2026-09-08T03:56:06Z` and reproduced both top-level hashes:

| Evidence                  | SHA-256                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| Integrated evidence       | `ad579157e79acccdc0cb5927994c45fe563656f1b6c93d64b091d130fdaec73b` |
| Bundle inventory          | `520755286939ef89b04ef45fcabdb86f5fbc5c402d2ad236a4585eafc2e1e20b` |
| Deterministic run surface | `9ea04c2f61e138c9161a809543f91c72f2a8599a1052f1fce150c064dee23f48` |
| Package audit             | `e25714ce57d8ce0e4bbe7359a3703a1ff63fbe1f61b2d04a5d4dc919d206391e` |
| Dependency audit          | `45178532da0e24286d7e4fa9a4ed4cd6cef630d31e7341c3e6817d705ce3178f` |
| Advisory snapshot         | `c67751865ce3fe05e294fc173246abefb0f875fe5f5afd6dc6f5f09a239ed3f9` |
| Environment observation   | `789f8fdf2b84ce7d4dbb8bf110ba42baeaaf4f516538064e97b6c0bdc8236284` |
| Quality-gate observation  | `4c2384a696472255530039b20b25a47a53d44034c96643204d214db5e6b47a47` |
| Provenance observation    | `4db73590c31dbb48510acd2f8e9cfb33d3ba6293d7e35bbe74a3c6707c071650` |

The retained package tarballs are:

| Package              | Bytes   | SHA-256                                                            |
| -------------------- | ------- | ------------------------------------------------------------------ |
| `@wayglass/core`     | 7,818   | `cbe647b8cd0fa897e4e3a6b40d12faf9be24f183c16c067409bab8a9d247edfb` |
| `@wayglass/elements` | 139,023 | `c4b014498265816e3fc7d098ee3dfba2a5ade54ec63d24456edef9846cc6ba5d` |
| `@wayglass/icons`    | 11,069  | `2cd030d29ff41f639c21be3c1b66d306937b7665de4b1b1d6af5fc8720ef18af` |
| `@wayglass/react`    | 25,976  | `ea5581609b2b868f5482c7b40b998606bd4bcb7b758b4923b2d67bbbebcfe320` |
| `@wayglass/themes`   | 18,100  | `25080039b5afc2caa484e64af352ae2d7a8fe10bd320a41b47b8c20c578d8f71` |
| `@wayglass/tokens`   | 46,481  | `39696e55a5c75839684e9e42c22ca37b0a72f052bf6a48ff0d06f932bd08a971` |

Both complete runs were byte-identical. Each run passed two Vanilla scenarios, four React scenarios,
and 36 browser cases across Chromium, Firefox, and WebKit, for retained totals of two candidate
runs, four Vanilla scenario results, eight React scenario results, and 72 browser results. The
uncached offline quality gate passed all nine recorded result groups. The dependency audit retained
the exact seven-node production graph, and the advisory snapshot was consumed while valid with zero
findings.

The retained warnings requiring owner review are:

- `WG_RC_ADVISORY_MEDIA_TYPE` for the validated provider response without an advertised JSON media
  type;
- `WG_RC_LIT_DEVELOPMENT_WARNING` from package tests;
- `WG_RC_NODE_DEPRECATION_WARNING` from the Storybook build;
- `WG_RC_STORYBOOK_CHUNK_WARNING` for informational Storybook chunk size; and
- `WG_RC_QUALITY_WARNING_PRESENT`, the aggregate marker for successful warning output.

The two retained limitations are `WG_RC_AUTOMATED_BROWSER_ONLY`, which makes no human
assistive-technology claim, and `WG_RC_WINDOWS_UNOBSERVED`, preserving the deferred Windows
observation. Provenance recorded a clean worktree and no additional notice. Absolute machine paths
and raw successful command output are intentionally excluded from this repository record.

## Next authority boundary

Attempt 1 remains a failed attempt and attempt 2 consumed its one-shot authority successfully. The
retained bundle remains untouched through project-owner disposition. Merging this record accepts the
E5C evidence record only; it does not accept the candidate. The separate
[E5D disposition proposal](./phase-6c-e5d-candidate-disposition.md) asks the project owner to select
accept candidate, narrow or refreeze, or no candidate against these exact hashes.
