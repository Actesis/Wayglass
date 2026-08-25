# Token-tooling Stage 7 validation matrix

- Implementation commit: `8b96c72660bb5567e03fcf0ebe2c5b13bf6e1c8f`
- Date: 2026-08-24
- Host: Apple silicon, macOS 26.5, APFS
- Reviewer: project-owner review pending

## Result

The permanent token-tooling path passes its source, determinism, failure, capacity, package,
documentation, and cache-bypassed repository gates. All browser cases exercised by the supported
Chromium, Firefox, and WebKit projects passed, but the monolithic browser command did not complete
as one green invocation on this host: unrelated cases intermittently timed out under sustained
browser load and passed when rerun. This is retained as a qualified browser result, not rewritten as
an unqualified pass.

Stage 8 removal remains gated on project-owner review of this record. The private exchange remains
partial, unpublished, and unsupported outside the repository.

## Runtime and deterministic matrix

Node 26.4.0 and pnpm 11.9.0 were the installed current runtime. The official Node 22.13.0 macOS
arm64 archive was downloaded into an isolated temporary directory and authenticated against the
retained published checksum. The archive SHA-256 was
`bc1e374e7393e2f4b20e5bbc157d02e9b1fb2c634b2f992136b38fb8ca2023b7`.

Each case authenticated the exact implementation commit and a tracked-clean checkout before printing
the permanent fingerprint.

| Node    | pnpm   | Locale        | Time zone          | Launch directory | Result                  |
| ------- | ------ | ------------- | ------------------ | ---------------- | ----------------------- |
| 26.4.0  | 11.9.0 | `C`           | `UTC`              | repository root  | Pass; exact fingerprint |
| 26.4.0  | 11.9.0 | `en_US.UTF-8` | `Pacific/Auckland` | `/private/tmp`   | Pass; exact fingerprint |
| 22.13.0 | 11.9.0 | `C`           | `UTC`              | repository root  | Pass; exact fingerprint |
| 22.13.0 | 11.9.0 | `en_US.UTF-8` | `Pacific/Auckland` | `/private/tmp`   | Pass; exact fingerprint |

Both runtimes also passed the permanent TypeScript check and all 91 focused tests. Reversed source
order, repeated transforms, targeted drift, and adverse identity, mode, alias, writer, lock,
recovery, output-path, and command cases are covered by those tests.

### Common artifact fingerprint

The graph contained 528 tokens, four modes, and 197 overrides. The exchange included 524 tokens,
omitted the four documented `ch`/`fr` cases, omitted zero overrides, and retained status
`partial-dtcg-2025.10-candidate`.

| Artifact                           |   Bytes | SHA-256                                                            |
| ---------------------------------- | ------: | ------------------------------------------------------------------ |
| `packages/themes/dist/themes.css`  |  79,109 | `00a0c6bb7342c4f1d79aac93244732e5f16564a4943c65171e80d98fb48cfa92` |
| `packages/tokens/dist/tokens.css`  |  38,607 | `b253b9a03c856a8a4b619f4c7b53042b32a5234ae3126b6963392ad188aa1263` |
| `packages/tokens/dist/tokens.json` |  91,317 | `eeb8066bcf909cba5ce29dc9f9345deb4c545d119bfbb381fa1ca2500a2d5f28` |
| `modes/density/comfortable.json`   |  22,069 | `27678d80d3340fb6add3965e2862afb2de9745628f1579ee58cdec6b2e2e7f72` |
| `modes/density/compact.json`       |  21,793 | `28df8b07915ed81d458973b53f814f58f9749ff4d18b0682d724ffa7da27ca4e` |
| `modes/theme/wayglass-dark.json`   |  12,630 | `fd21c7b6843cfff9e83fc0608085e43880e7b5e58e059c76de8103d297696e89` |
| `modes/theme/wayglass-light.json`  |  13,095 | `1fcee330818528588a4f7e096d51f403bc92bf9ed9aaf1338ca6b2ef672657c7` |
| `resolver.json`                    |   1,358 | `813e71cbe835302775bfa7dfcd7a719df8202f260fae4eb10db03aca20b6f799` |
| exchange `tokens.json`             | 241,217 | `b58a94e49d6cc7de744cc7387710f99662a5cde2882da7bd78490b9b697595d8` |
| `wayglass-manifest.json`           |  63,373 | `5eb136a0eb37357e2c1c28c77c348b14f535552499f347d55821fad9cb664f67` |

## Command and failure matrix

- `generate:web` returned three unchanged files and left the tracked artifacts byte-identical.
- `generate:exchange` created release
  `5eb136a0eb37357e2c1c28c77c348b14f535552499f347d55821fad9cb664f67` in an explicit temporary root;
  `verify` accepted it; repeated generation returned `unchanged`.
- The parser accepts direct options and pnpm's conventional `--` separator. Help loads no command
  handler. Missing, duplicate, unknown, malformed, and mismatched options retain exit class `2`.
- Authenticated effects reject a mismatched revision or tracked changes with exit class `1`.
- Exchange output is restricted to a canonical repository-local or operating-system temporary
  directory and rejects unrelated nonempty directories, filesystem roots, traversal, and symlink
  escape.
- Focused tests cover invalid graphs, web staging failure, partial replacement rollback, exchange
  partial writes, interruptions before and after release commit, live and stale locks, corrupt
  pointers, missing or changed artifacts, bounded recovery, and tool-owned cleanup.

The failure matrix is controlled simulation on one APFS host. It does not claim power-loss,
disk-exhaustion, permission-change, distributed-filesystem, or multi-host behavior.

## Capacity matrix

Both runtimes ran 30 warm repetitions for the current and exact 10× synthetic corpora. No threshold
was added after observing results.

| Node    | Corpus        | Tokens | Overrides | Web bytes | Exchange bytes | Cold ms | Warm mean ms | Warm p95 ms | Max RSS delta KiB |
| ------- | ------------- | -----: | --------: | --------: | -------------: | ------: | -----------: | ----------: | ----------------: |
| 26.4.0  | current       |    528 |       197 |   209,033 |        375,535 |   14.04 |         8.90 |       10.03 |            76,992 |
| 26.4.0  | synthetic 10× |  5,280 |     1,970 | 2,485,097 |      4,176,565 |   32.65 |        28.07 |       37.75 |           216,368 |
| 22.13.0 | current       |    528 |       197 |   209,033 |        375,535 |   15.20 |         7.76 |        9.21 |            63,488 |
| 22.13.0 | synthetic 10× |  5,280 |     1,970 | 2,485,097 |      4,176,565 |   36.23 |        31.13 |       40.97 |           232,768 |

These are synthetic observations from one machine and are not performance guarantees or budgets.

## Package, documentation, browser, and clean-build matrix

- `TURBO_FORCE=true pnpm check` passed from the tracked-clean implementation commit. Formatting,
  lint, permanent token checks, retained experiment checks, type checks, unit tests, and builds all
  passed. Turbo executed 14 of 14 build tasks with zero cache hits.
- The root build generated the three web artifacts once before Turbo. The token and theme package
  tasks compiled only; no old and new writer targeted the same file in one build.
- Documentation and Storybook production builds passed inside the cache-bypassed root build.
- No package manifest, package export, production dependency, lockfile entry, element registration,
  or runtime import changed. `pnpm-lock.yaml` and all package manifests were byte-identical to
  `main`; only private root scripts were added.
- The browser matrix exercised 1,434 Chromium, Firefox, and WebKit cases. One full run reported
  1,389 passes, 44 intentional skips, and one Firefox scroll-position failure; that exact case
  passed immediately in isolation. A second full run cleared Firefox and reported 1,384 passes, 44
  skips, and six late WebKit navigation timeouts; all six passed together via `--last-failed`.
- A serial WebKit diagnostic produced different, nonrepeatable timeouts in cases that had passed in
  both full runs. This establishes coverage of the affected behavior but also establishes that the
  monolithic browser harness is resource-flaky on this host. No failure consistently reproduced and
  no failure identified token bytes, CSS semantics, package loading, or a generated-artifact change.

Browser behavior is therefore a qualified pass with an explicit harness limitation. It must not be
described as a clean single-command browser run.

## Completion-gate mapping

| Contract gate                   | Evidence and result                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| Source accounting and semantics | 528 tokens and 197 overrides; focused graph and adverse-fixture tests pass               |
| Exact public web compatibility  | Three tracked files match the common fingerprint and `git diff` is empty                 |
| Targeted drift                  | Permanent tests change one reference value and verify only applicable output drift       |
| Minimum/current determinism     | Four authenticated runtime/locale/time-zone/launch-directory cases match                 |
| CLI and filesystem behavior     | 91 focused tests plus authenticated command round-trip pass                              |
| Exchange integrity              | Seven-file partial inventory, omissions, manifest, byte counts, and hashes verify        |
| Package isolation               | No package manifest, export, dependency, registration, bundle, or runtime import changed |
| Dependency inventory            | `pnpm-lock.yaml` unchanged; no dependency added                                          |
| Capacity                        | Current and 10× records refreshed on both runtimes without a threshold                   |
| Documentation                   | Private README covers authority, commands, limitations, migration, and removal           |
| Repository gates                | Cache-bypassed `pnpm check`, fingerprinting, and `git diff --check` pass                 |
| Retained evidence               | This record names environment, method, result, limitation, date, and pending reviewer    |

## Cleanup and limitations

The temporary Node runtime and exchange output were removed after measurement. No exchange release,
pointer, writer lock, stage, browser trace, generated token drift, dependency change, or accepted
output remains in the repository. Existing ignored experiment and tooling-local dependency caches
remain unchanged and are not package or exchange outputs.

This matrix covers one macOS/APFS host. It does not establish cross-platform filesystem durability,
DTCG conformance, external-tool compatibility, publication readiness, a public API, or a support
contract. The browser qualification and project-owner review are the explicit decision points before
Stage 8 removes legacy compilers and the retained Phase 5B proof.
