# Node 22/Linux prerequisite validation

- Evidence: `P5D-A-E06` minimum-environment completion and implementation-contract stage 0
- Date: 2026-08-29
- Subject revision: `78365d7b2c78d6f2ce9cd60e6909427b64f99e09`
- Host: GitHub-hosted `ubuntu-24.04`, Ubuntu 24.04.4 LTS, x86-64, Linux 6.17.0-1022-azure
- Runtime: Node 22.13.0 and pnpm 11.9.0
- Successful run:
  [GitHub Actions run 33266209887](https://github.com/Actesis/Wayglass/actions/runs/33266209887)
- Production effect: none

## Method and result

The temporary branch-only workflow checked out the subject revision without prior build output,
installed the locked dependency graph, and ran the unchanged `pnpm experiment:phase5d:check` before
any repository bootstrap build. All nine proof files and all 40 tests passed. That result includes
the retained adverse diagnostics, order/cwd/environment cases, repeated generation,
failure-before-output behavior, and authenticated committed-output comparison.

The four committed candidates had these hashes on Linux:

| Artifact               | SHA-256                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `output-manifest.json` | `611d2d07ec4e9e04efe4ebd07f594b3008cafbf8821129be2af6d3048bb2cb2c` |
| `review-index.html`    | `14359776121e9298d3114c1296dfbf5611040055d9e3ce1e3bae5e23e42339e1` |
| `runtime-catalog.ts`   | `7abbc73a5ffef957e03787c2c0b2e794d2c6726abd64a67ad0e1c9554b728d40` |
| `source-manifest.json` | `5a052d8a54012a247831a280d4aacca763f932d8447fcfaf2b1e10db586f5aa3` |

These are byte-identical to the accepted candidates produced and checked on the current maintainer
runtime. Node 22.13/Linux therefore changes neither accepted bytes, diagnostics, nor proof behavior.
The implementation contract's stage-0 prerequisite passes, so its staged permanent implementation
may begin without revising the accepted source or output boundary.

After the proof result was captured, the runner materialized ignored package build outputs with
`pnpm build`, ran the complete `pnpm check`, and verified both cached and uncached tracked diffs.
The repository gate and clean tracked-output checks passed.

## Adverse clean-checkout finding

Two retained diagnostic runs established that a literal fresh-checkout `pnpm check` is not currently
self-bootstrapping:

- [run 33265982233](https://github.com/Actesis/Wayglass/actions/runs/33265982233) passed the
  unchanged Phase 5D proof, then failed because the ignored token/theme CSS and JSON outputs did not
  exist;
- [run 33266142739](https://github.com/Actesis/Wayglass/actions/runs/33266142739) generated those
  three files, then exposed additional missing ignored package declaration output before
  typechecking.

The successful run used the existing root build to create those ignored outputs before the full
repository gate. This limitation belongs to repository bootstrap ordering, not the Phase 5D proof:
the unchanged proof ran and passed before either bootstrap step. It should be corrected separately
before claiming that a new contributor can run `pnpm check` immediately after `pnpm install`.

**Follow-up:** The subsequent bootstrap-order correction moved the root gate's existing `pnpm build`
step ahead of token validation, typechecking, and tests. A focused test now prevents those consumers
from moving ahead of the build again, and an isolated checkout confirms that `pnpm check`
self-bootstraps after `pnpm install`.

## Limits and cleanup

This is one GitHub-hosted Linux image, not a multi-distribution or repeated-run support matrix. The
checkout and setup actions execute on GitHub's action runtime, while the recorded project commands
executed under the explicitly installed Node 22.13.0. The temporary workflow used no secrets,
deployment, publication, package change, or permanent automation and was removed after the evidence
was captured.
