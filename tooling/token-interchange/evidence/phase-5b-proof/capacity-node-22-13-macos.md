# Phase 5B capacity evidence — Node 22.13 on macOS

This completes the supported-minimum-runtime half of charter row `P5B-E08`. It records observations
rather than creating performance budgets or release thresholds.

## Environment and runtime verification

- Date: 2026-08-15
- Source and harness commit: `29bfc5a9150973a6152c72b06db82d28ba970df3`
- Runtime: Node.js 22.13.0, pnpm 11.9.0, and Vitest 4.1.10
- Platform: macOS / Darwin 25.5.0, arm64
- Hardware: Apple M4 Mac mini, 10 cores, 16 GB memory
- Official archive: `node-v22.13.0-darwin-arm64.tar.gz`
- Published and computed SHA-256: `bc1e374e7393e2f4b20e5bbc157d02e9b1fb2c634b2f992136b38fb8ca2023b7`
- Working tree: no tracked changes; the measurement runner verified both the checked-out commit and
  `WAYGLASS_SOURCE_REVISION`

The archive and checksum manifest came from the
[official Node.js 22.13.0 distribution directory](https://nodejs.org/dist/v22.13.0/). The verified
Node binary started pinned pnpm 11.9.0 successfully and reported that pinned version. The temporary
runtime was removed after measurement.

## Invocation

The committed Vitest CLI was invoked directly with the verified Node binary so the measured process
could not resolve the workstation's newer default Node runtime:

```sh
WAYGLASS_SOURCE_REVISION=29bfc5a9150973a6152c72b06db82d28ba970df3 \
  /temporary/node-v22.13.0-darwin-arm64/bin/node \
  node_modules/vitest/vitest.mjs run \
  --root experiments/phase-5b-token-interchange \
  --config vitest.measurement.config.ts \
  --reporter=verbose
```

Pinned-pnpm startup was checked separately with the same verified binary:

```sh
/temporary/node-v22.13.0-darwin-arm64/bin/node /opt/homebrew/bin/pnpm --version
# 11.9.0
```

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
| Cold time                           |      15.547 ms |            41.989 ms |
| Warm repetitions                    |             30 |                   30 |
| Warm minimum                        |       8.191 ms |            32.163 ms |
| Warm mean                           |       9.069 ms |            36.833 ms |
| Warm p50                            |       8.585 ms |            34.251 ms |
| Warm p95                            |      10.528 ms |            49.669 ms |
| Warm maximum                        |      11.445 ms |            53.532 ms |
| Web output                          |  117,716 bytes |      1,468,706 bytes |
| DTCG output                         |  375,535 bytes |      4,176,565 bytes |
| DTCG files                          |              7 |                    7 |
| Explicitly omitted tokens           |              4 |                   40 |
| Omitted mode overrides              |              0 |                    0 |
| Process maxRSS before case          |     65,360 KiB |          109,040 KiB |
| Process maxRSS observed after case  |    109,040 KiB |          331,280 KiB |
| Observed maxRSS high-water increase |     43,680 KiB |          222,240 KiB |

Output sizes and omission counts are identical to the retained Node 26 and historical Node 22.12
runs. Timing and memory differences between the single-machine processes are observations, not
performance-regression evidence. Neither supported-runtime run revealed a capacity stop condition,
and no threshold is inferred from either result.

## Limitations

- Cold time excludes Node and Vitest process startup and filesystem-cache controls.
- `maxRSS` includes Vitest, loaded modules, previous allocations, garbage-collection timing, and the
  sequential current-corpus case; it is not isolated transform allocation.
- The synthetic replicas exercise scale, not 10× independently designed semantics.
- The measurement excludes filesystem-writer throughput, concurrent writers, power-loss behavior,
  and external consumers.
- This is one machine and operating system. Repetitions characterize local variation, not a
  cross-platform performance guarantee.
