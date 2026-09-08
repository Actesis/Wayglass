# Phase 6C-E5D release-candidate disposition proposal

**Status:** Proposed for project-owner decision on September 8, 2026. This proposal recommends
accepting the exact verified private candidate described below and completing Phase 6C. It does not
accept the candidate by itself, publish packages, change package privacy or versions, use
credentials, create tags or releases, upload artifacts, deploy, or begin external-application work.

## Proposed decision

**Recommendation: accept candidate.** All six proposed v1 release units passed the frozen-source
candidate matrix, both authoritative runs were byte-identical, the independent verifier reproduced
the retained bundle, and the approved advisory input reported zero findings. No evidence requires a
scope reduction or refreeze.

Acceptance would apply only to:

- frozen source `ce400e89930a047c6af1c6992c64cfe422a1eeee` and tree
  `da2550b5aa2636d0896ae61e08c340f405fe1412`;
- E5C tooling commit `1b8bf4bfb664a882f8a008c3c297f5d8506a09bb` and tree
  `bdbd9bfaa3212a001f2145a479064ac33c00401c`;
- integrated evidence SHA-256 `ad579157e79acccdc0cb5927994c45fe563656f1b6c93d64b091d130fdaec73b`;
  and
- bundle-inventory SHA-256 `520755286939ef89b04ef45fcabdb86f5fbc5c402d2ad236a4585eafc2e1e20b`.

The exact candidate remains private. Acceptance means the Phase 6C proof is sufficient for this
scope; it is not npm publish approval and does not turn these tarballs into publishable artifacts.

## Exact release-unit disposition

| Release unit         | Version | Tarball SHA-256                                                    | Proposed disposition |
| -------------------- | ------- | ------------------------------------------------------------------ | -------------------- |
| `@wayglass/core`     | `0.1.0` | `cbe647b8cd0fa897e4e3a6b40d12faf9be24f183c16c067409bab8a9d247edfb` | Accept               |
| `@wayglass/tokens`   | `0.1.0` | `39696e55a5c75839684e9e42c22ca37b0a72f052bf6a48ff0d06f932bd08a971` | Accept               |
| `@wayglass/themes`   | `0.1.0` | `25080039b5afc2caa484e64af352ae2d7a8fe10bd320a41b47b8c20c578d8f71` | Accept               |
| `@wayglass/elements` | `0.1.0` | `c4b014498265816e3fc7d098ee3dfba2a5ade54ec63d24456edef9846cc6ba5d` | Accept               |
| `@wayglass/icons`    | `0.1.0` | `2cd030d29ff41f639c21be3c1b66d306937b7665de4b1b1d6af5fc8720ef18af` | Accept               |
| `@wayglass/react`    | `0.1.0` | `ea5581609b2b868f5482c7b40b998606bd4bcb7b758b4923b2d67bbbebcfe320` | Accept               |

Testing helpers, ESLint configuration, applications, examples, experiments, private tooling,
provider integrations, and SpaceTraders work remain excluded exactly as frozen in Phase 6B.

## Evidence disposition

The accepted interpretation would retain:

| Evidence                    | Result                                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Reproducibility             | Two byte-identical retained runs; deterministic SHA-256 `9ea04c2f61e138c9161a809543f91c72f2a8599a1052f1fce150c064dee23f48` |
| Independent consumers       | Four Vanilla, eight React, and 72 browser results passed across both runs                                                  |
| Browser engines             | Chromium `151.0.7922.34`, Firefox `153.0`, and WebKit `26.5` through Playwright `1.62.0`                                   |
| Package audit               | SHA-256 `e25714ce57d8ce0e4bbe7359a3703a1ff63fbe1f61b2d04a5d4dc919d206391e`                                                 |
| Dependency audit            | Seven reachable production nodes; SHA-256 `45178532da0e24286d7e4fa9a4ed4cd6cef630d31e7341c3e6817d705ce3178f`               |
| Advisory snapshot           | Zero findings; SHA-256 `c67751865ce3fe05e294fc173246abefb0f875fe5f5afd6dc6f5f09a239ed3f9`                                  |
| Quality gate                | All nine recorded result groups passed offline and uncached                                                                |
| Independent bundle verifier | Passed and reproduced the integrated-evidence and bundle-inventory hashes                                                  |

The bundle remains local and untouched through owner disposition. Absolute machine paths and raw
successful command output are excluded from the repository record.

## Warning and limitation disposition

Acceptance would carry, not erase, the five recorded warnings:

- `WG_RC_ADVISORY_MEDIA_TYPE`: npm did not advertise JSON, but the exact response bytes passed the
  accepted strict validation and the owner already approved this warning;
- `WG_RC_LIT_DEVELOPMENT_WARNING`: accepted development-mode output from package tests;
- `WG_RC_NODE_DEPRECATION_WARNING`: an observed Storybook-build deprecation warning;
- `WG_RC_STORYBOOK_CHUNK_WARNING`: informational Storybook chunk-size output; and
- `WG_RC_QUALITY_WARNING_PRESENT`: the aggregate marker that successful commands emitted warning
  output requiring review.

None indicates a failed release unit or changes the exact hashes. The Node and Storybook warnings
remain maintenance inputs for later work; acceptance does not promise that future tool versions will
remain warning-free.

Acceptance would also carry these support limitations:

- `WG_RC_AUTOMATED_BROWSER_ONLY`: automated browser evidence does not establish human
  assistive-technology support or certification; and
- `WG_RC_WINDOWS_UNOBSERVED`: Windows remains unobserved, so the already accepted v1 claims stay
  narrowed rather than implying Windows or NVDA validation.

The installed `@lit-labs/ssr-dom-shim@1.6.0` manifest declares `BSD-3-Clause`, but that exact
package contains no package-root license or notice file. The audit preserves `licenseFiles: []`
rather than inventing text. This transitive package is installed separately and is not embedded in a
Wayglass tarball. Candidate acceptance treats the evidence as sufficient for Phase 6C while
requiring Phase 6E release review to preserve the exact dependency and complete its legal/compliance
disposition before publication approval.

## Alternatives available to the project owner

| Decision               | Effect                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Accept candidate**   | Accept the exact bundle and six release units above; complete Phase 6C                                              |
| **Narrow or refreeze** | Change a release unit, source, dependency, contract, or claim through a new Phase 6B freeze; invalidate this bundle |
| **No candidate**       | Retain the reason and close Phase 6C without an accepted release candidate                                          |

The evidence supports **accept candidate**. Selecting another outcome requires the owner to state
the release-unit, source, claim, warning, limitation, or risk that changes the recommendation.

## Acceptance effect and next boundary

Only an explicit project-owner decision accepting this exact disposition completes Phase 6C. If
accepted, Phase 6D documentation and Storybook delivery implementation becomes the next roadmap
stage. Phase 6D remains local implementation and preview preparation; production deployment still
requires its own approval.

The retained local bundle must remain untouched until a separately approved durable private
retention location is verified. Candidate acceptance does not authorize that upload or removal of
the local bundle. It also does not authorize Phase 6E npm work, repository-visibility changes,
publication, tags, releases, credentials, Cloudflare changes, production launch, or the separate
SpaceTraders client.
