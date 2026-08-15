# Phase 5B capacity evidence — Node 26 on macOS

This is retained partial evidence for charter row `P5B-E08`. It records observations rather than
creating performance budgets or release thresholds.

## Environment

- Date: 2026-08-15
- Source and harness commit: `a28983d49ac968e866ebd3640c2863d65d845b8e`
- Runtime: Node.js 26.4.0, pnpm 11.9.0, Vitest 4.1.10
- Platform: macOS / Darwin 25.5.0, arm64
- Hardware: Apple M4 Mac mini, 10 cores, 16 GB memory
- Working tree: no tracked changes; the measurement runner verifies both the checked-out commit and
  `WAYGLASS_SOURCE_REVISION` before running

Command:

```sh
WAYGLASS_SOURCE_REVISION=a28983d49ac968e866ebd3640c2863d65d845b8e \
  pnpm experiment:phase5b:measure
```

## Method

Each repetition constructs the normalized graph from the reviewed sources, produces both web
strings, and produces the DTCG candidate exchange. The current corpus runs first. The synthetic
corpus retains one original namespace for web-policy coverage and adds nine deterministic prefixed
replicas; aliases and mode overrides point into their own replica. It therefore contains exactly 10×
the tokens and overrides, but it is not evidence about 10× independently designed semantics.

For each corpus, the first pipeline execution is the in-process cold observation. Thirty subsequent
executions form the warm sample. Times use `performance.now()`. Memory is Node's process-wide
`resourceUsage().maxRSS`; the recorded delta is the difference between the process high-water mark
before and after that case. The current and 10× cases run sequentially in one Vitest process.

## Results

| Observation                         | Current corpus | Synthetic 10× corpus |
| ----------------------------------- | -------------: | -------------------: |
| Tokens                              |            528 |                5,280 |
| Modes                               |              4 |                    4 |
| Mode overrides                      |            197 |                1,970 |
| Cold time                           |      13.893 ms |            33.203 ms |
| Warm repetitions                    |             30 |                   30 |
| Warm minimum                        |       8.956 ms |            26.665 ms |
| Warm mean                           |       9.665 ms |            30.526 ms |
| Warm p50                            |       9.528 ms |            29.620 ms |
| Warm p95                            |      10.720 ms |            39.481 ms |
| Warm maximum                        |      11.106 ms |            40.426 ms |
| Web output                          |  117,716 bytes |      1,468,706 bytes |
| DTCG output                         |  375,535 bytes |      4,176,565 bytes |
| DTCG files                          |              7 |                    7 |
| Explicitly omitted tokens           |              4 |                   40 |
| Omitted mode overrides              |              0 |                    0 |
| Process maxRSS before case          |     73,760 KiB |          154,032 KiB |
| Process maxRSS observed after case  |    153,920 KiB |          384,640 KiB |
| Observed maxRSS high-water increase |     80,160 KiB |          230,608 KiB |

The omitted-token count scaled exactly with the corpus, and neither corpus omitted an override.
Output byte growth exceeds 10× because the synthetic namespaces lengthen identities and because the
manifest retains every identity. This run did not reveal a capacity stop condition, but the charter
does not permit inventing a threshold from that observation.

## Limitations and remaining evidence

- The repository minimum Node.js 22.12 environment was not installed locally; that required rerun
  remains pending before `P5B-E08` can be complete.
- Cold time excludes Node and Vitest process startup, module loading before the test body, and
  filesystem-cache controls. It is specifically the first in-process pipeline execution.
- `maxRSS` includes Vitest, loaded modules, previous allocations, garbage-collection timing, and the
  sequential current-corpus case. It is not isolated transform allocation or a power-loss measure.
- The measurement covers normalization and the two in-memory transforms. It excludes the
  experiment-only filesystem writer, disk throughput, concurrent writers, and external consumers.
- This is one machine and operating system. Repetitions characterize local variation, not a
  cross-platform performance guarantee.
