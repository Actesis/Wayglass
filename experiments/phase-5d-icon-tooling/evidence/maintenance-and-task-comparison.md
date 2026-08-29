# Phase 5D-A maintenance and add/revise task comparison

- Evidence: `P5D-A-E01` completion and `P5D-A-E07` completion
- Environment: repository at `21392f6`, Node 26.4.0, Vite 8.1.5, Vitest 4.1.10
- Date: 2026-08-29
- Disposition: comparison complete; supports a trimmed private capability, not wholesale promotion
  of the proof

## Same-task dry run

The fixed task starts from the four current production glyphs, adds the synthetic directional
`arrow-inline-start`, and revises the first coordinate of `close` from 6 to 5. The production
package is never changed: the test performs the manual path as exact in-memory edits against the
current runtime and test source, then performs the tooling path against cloned structured records.

| Concern                           | Current manual path                                                                  | Tooling path                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Authored files changed            | 2: runtime source and catalog test                                                   | 1: canonical catalog                                                       |
| Synchronized representations      | 4: name list, render map addition, geometry revision, test expectation               | 1 reviewed record change; 4 outputs are generated                          |
| Direction metadata and behavior   | No current representation; completing it would require a new convention/API decision | Explicit source field and generated review behavior                        |
| Accessible-use metadata           | No current catalog representation                                                    | Explicit reinforcement-only field                                          |
| Dedicated catalog review          | No current artifact                                                                  | Generated review index with generic browser coverage                       |
| Drift and adverse diagnostics     | Type/test failures cover only current names and registration                         | Stable source, geometry, safety, drift, and failure diagnostic codes       |
| Result for the full accepted task | Incomplete without adding at least three new synchronized surfaces                   | Complete inside the private proof without hand-editing generated artifacts |

The tooling comparison changes all four authenticated outputs, as expected because each records the
source fingerprint or visible catalog. Manifest comparison identifies only the added
`arrow-inline-start` and revised `close`; unchanged identities keep their fingerprints. This is a
stronger and more targeted drift signal than line-level output differences alone.

## Measured maintenance surface

The measurement includes the complete proof as it exists after security and removal auditing, not a
hypothetical minimized implementation:

| Measurement                                  | Result                                      |
| -------------------------------------------- | ------------------------------------------- |
| Private source surface                       | 807 nonblank TypeScript lines               |
| Private test surface                         | 744 nonblank TypeScript lines               |
| Generated outputs per contribution           | 4 files / 31,341 bytes                      |
| Warm five-glyph generation, 50 runs          | 0.140 ms mean / 0.243 ms p95 / 0.342 max    |
| Cold Node process plus generation, 50 runs   | 32.299 ms mean / 35.770 ms p95 / 36.234 max |
| Cold authenticated byte counts               | One value across all runs: 31,341 bytes     |
| Prior 500-glyph capacity maximum             | 10.30 ms                                    |
| Prior 500-glyph full-series max-RSS increase | 157,600 KiB                                 |

All timing bounds pass by wide margins. Runtime cost is therefore not the deciding factor.
Maintenance surface is: the full experiment has 1,551 nonblank owned source/test lines for a current
four-icon production catalog. Much of that surface is proof-only capacity, environment, comparison,
runtime-candidate, security, and removal evidence, but the result does not justify copying the
experiment wholesale into permanent tooling.

## Decision impact

Guidance plus the current inline file cannot complete the accepted task because direction,
accessible-use metadata, deterministic review output, and targeted drift are absent. A narrow
canonical source, validator, generator, and static review artifact materially reduce synchronized
per-contribution edits and make unsafe or ambiguous changes fail explicitly.

The evidence supports carrying that capability into disposition with a requirement to design and
measure a trimmed permanent boundary. It does not support promoting the runtime candidate,
benchmarks, synthetic capacity corpus, comparison harness, or the proof directory as a public or
production package. The existing public runtime-contract mismatch must still be reconciled before
generated data can replace production icon source.

## Limitations

The manual run is an exact dry run over current source, not a production commit. It deliberately
does not invent missing direction, metadata, or preview conventions merely to make the manual path
look complete. Timing reflects one named desktop and current Node; minimum Node and Linux remain
open in `P5D-A-E06`. Future catalog size and contribution frequency remain unknown.
