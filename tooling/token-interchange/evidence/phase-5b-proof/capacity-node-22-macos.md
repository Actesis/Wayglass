# Phase 5B capacity evidence — Node 22.12 on macOS

> **Historical adverse evidence:** Node 22.12 was the declared minimum when this run occurred. The
> repository now requires Node 22.13 because pinned pnpm 11.9.0 cannot run on 22.12. The retained
> [Node 22.13 run](./capacity-node-22-13-macos.md) covers the corrected supported minimum.

This completes the minimum-runtime half of charter row `P5B-E08`. It records observations rather
than creating performance budgets or release thresholds.

## Environment and runtime verification

- Date: 2026-08-15
- Source and harness commit: `3d1808ee1ab414f1172991ac4a05523592116f2b`
- Runtime: Node.js 22.12.0 and Vitest 4.1.10
- Platform: macOS / Darwin 25.5.0, arm64
- Hardware: Apple M4 Mac mini, 10 cores, 16 GB memory
- Official archive: `node-v22.12.0-darwin-arm64.tar.gz`
- Published and computed SHA-256: `293dcc6c2408da21562d135b0412525e381bb6fe150d688edb58fe850d0f3e13`
- Working tree: no tracked changes; the measurement runner verified both the checked-out commit and
  `WAYGLASS_SOURCE_REVISION`

The archive and checksum manifest came from the
[official Node.js 22.12.0 distribution directory](https://nodejs.org/dist/v22.12.0/). The temporary
runtime was removed after measurement.

## Invocation

pnpm 11.9.0 refuses to start on Node 22.12.0 because that pnpm release requires Node 22.13 or later.
The committed Vitest CLI was therefore invoked directly with the verified Node binary:

```sh
WAYGLASS_SOURCE_REVISION=3d1808ee1ab414f1172991ac4a05523592116f2b \
  /temporary/node-v22.12.0-darwin-arm64/bin/node \
  node_modules/vitest/vitest.mjs run \
  --root experiments/phase-5b-token-interchange \
  --config vitest.measurement.config.ts \
  --reporter=verbose
```

This bypass establishes the transform's Node 22.12 behavior, but it does not establish that the
declared Node/pnpm combination is usable. That mismatch is retained as adverse evidence.

## Method

The methodology is identical to the retained [Node 26/macOS run](./capacity-node-26-macos.md): the
first execution is the in-process cold observation, followed by 30 warm repetitions. Each repetition
constructs the normalized graph and produces both web strings and the DTCG candidate exchange. The
10× fixture contains exactly 10× the tokens and mode overrides. Memory is whole-process
`resourceUsage().maxRSS`, and both cases run sequentially in one Vitest process.

## Results

| Observation                         | Current corpus | Synthetic 10× corpus |
| ----------------------------------- | -------------: | -------------------: |
| Tokens                              |            528 |                5,280 |
| Modes                               |              4 |                    4 |
| Mode overrides                      |            197 |                1,970 |
| Cold time                           |      14.573 ms |            39.987 ms |
| Warm repetitions                    |             30 |                   30 |
| Warm minimum                        |       7.563 ms |            29.810 ms |
| Warm mean                           |       8.562 ms |            34.101 ms |
| Warm p50                            |       8.005 ms |            31.556 ms |
| Warm p95                            |      10.876 ms |            45.585 ms |
| Warm maximum                        |      11.693 ms |            48.416 ms |
| Web output                          |  117,716 bytes |      1,468,706 bytes |
| DTCG output                         |  375,535 bytes |      4,176,565 bytes |
| DTCG files                          |              7 |                    7 |
| Explicitly omitted tokens           |              4 |                   40 |
| Omitted mode overrides              |              0 |                    0 |
| Process maxRSS before case          |     64,864 KiB |          108,432 KiB |
| Process maxRSS observed after case  |    108,432 KiB |          351,280 KiB |
| Observed maxRSS high-water increase |     43,568 KiB |          242,848 KiB |

Output sizes and omission counts are identical to the Node 26 run. Timing and memory differences
between the two single-machine processes are observations, not performance-regression evidence.
Neither run revealed a capacity stop condition, and no threshold is inferred from either result.

## Limitations

- Cold time excludes Node and Vitest process startup and filesystem-cache controls.
- `maxRSS` includes Vitest, loaded modules, previous allocations, garbage-collection timing, and the
  sequential current-corpus case; it is not isolated transform allocation.
- The synthetic replicas exercise scale, not 10× independently designed semantics.
- The measurement excludes filesystem-writer throughput, concurrent writers, power-loss behavior,
  and external consumers.
- The pnpm incompatibility means the repository's declared minimum runtime cannot execute its pinned
  package manager without changing one side of that contract.
