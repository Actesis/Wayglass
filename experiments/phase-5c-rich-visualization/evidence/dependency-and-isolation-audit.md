# Phase 5C dependency and runtime-isolation audit

**Recorded:** 2026-08-27  
**Scope:** `P5C-E08` and `P5C-E09`  
**Environment:** Node 26.4.0; pnpm 11.9.0; Vite 8.1.5; Playwright 1.62.0; current Chromium, Firefox,
and WebKit project browsers  
**Disposition:** automated dependency, bundle, maintenance, removal, and runtime-isolation checks
pass; promotion remains unapproved

## Exact proof dependency graph

The private root has seven exact direct development dependencies. They resolve to 16 unique
proof-related packages: 11 runtime packages and five erased declaration packages. No candidate is
present in a workspace manifest, runtime dependency field, package export, or public registration.

| Exact package           | Relationship                          | License | Registry unpacked / packed bytes |
| ----------------------- | ------------------------------------- | ------- | -------------------------------: |
| `uplot@1.6.32`          | Direct runtime; no dependency         | MIT     |                545,468 / 164,279 |
| `d3-array@3.2.4`        | Direct runtime                        | ISC     |                 163,730 / 38,377 |
| `internmap@2.0.3`       | Runtime through `d3-array`            | ISC     |                   10,470 / 3,608 |
| `d3-scale@4.0.2`        | Direct runtime                        | ISC     |                 174,363 / 33,190 |
| `d3-color@3.1.0`        | Runtime through `d3-scale`            | ISC     |                  61,152 / 14,297 |
| `d3-format@3.1.2`       | Runtime through `d3-scale`            | ISC     |                   42,342 / 9,802 |
| `d3-interpolate@3.0.1`  | Runtime through `d3-scale`            | ISC     |                  69,687 / 18,040 |
| `d3-time@3.1.0`         | Runtime through `d3-scale`            | ISC     |                  64,483 / 13,544 |
| `d3-time-format@4.1.0`  | Runtime through `d3-scale`            | ISC     |                  85,603 / 21,389 |
| `d3-shape@3.2.0`        | Direct runtime                        | ISC     |                 247,267 / 51,395 |
| `d3-path@3.1.0`         | Runtime through `d3-shape`            | ISC     |                   20,858 / 5,755 |
| `@types/d3-array@3.2.2` | Direct declaration                    | MIT     |                  52,479 / 10,030 |
| `@types/d3-scale@4.0.9` | Direct declaration                    | MIT     |                 134,973 / 16,198 |
| `@types/d3-time@3.0.4`  | Declaration through `@types/d3-scale` | MIT     |                   31,274 / 5,355 |
| `@types/d3-shape@3.2.0` | Direct declaration                    | MIT     |                 141,150 / 17,968 |
| `@types/d3-path@3.1.1`  | Declaration through `@types/d3-shape` | MIT     |                    8,384 / 2,887 |

Registry totals are 545,468 unpacked / 164,279 packed bytes for uPlot, 939,955 / 209,397 bytes for
the D3 runtime graph, and 368,260 / 52,438 bytes for the D3 declaration graph. The complete graph is
1,853,683 unpacked / 426,114 packed bytes. Its installed filesystem allocation is 3,020 KiB: 552 KiB
uPlot, 2,056 KiB D3 runtime, and 412 KiB declarations. The difference from registry bytes is
expected filesystem block and file-count overhead.

Every exact artifact includes license text. None declares `preinstall`, `install`, or `postinstall`.
Some D3 artifacts declare publisher-only `prepublishOnly` or `postpublish` commands; those do not
run during a consumer install. uPlot declares no dependency or side-effect metadata. Most D3 runtime
packages declare `sideEffects: false`; `d3-format` and `d3-time-format` retain bounded
default-locale module state. The proof imports neither locale mutator. D3 runtime artifacts provide
no built-in TypeScript declarations, which accounts for the five-package declaration graph rather
than hiding that maintenance cost behind local ambient types.

## Bundle and parse/evaluation cost

Each adapter is built as a self-contained, minified ES2022 production entry. Five warm-ups precede
30 fresh module parse/evaluation measurements. The 40 KiB gzip and 50 ms maximum budgets pass.

| Adapter         | Raw JavaScript | Gzip JavaScript | Parse/evaluation median / p95 / max |
| --------------- | -------------: | --------------: | ----------------------------------: |
| Native SVG      |       16,333 B |         5,247 B |            0.327 / 0.462 / 0.715 ms |
| uPlot Canvas    |       94,549 B |        31,335 B |            2.599 / 3.070 / 4.043 ms |
| D3-assisted SVG |       48,063 B |        15,347 B |            1.133 / 1.549 / 1.753 ms |

These figures include the complete current adapter boundary and supersede earlier pre-validation
bundle-only measurements. Module timing is a named-machine Node parse/evaluation proxy, not a
low-power-device download or execution claim.

## Security and maintenance screen

The fresh `pnpm audit --audit-level low --json` result contains six existing development-tool
advisories: three moderate and three high, with no critical finding. No advisory names or traverses
any Phase 5C candidate. The unrelated paths are:

- esbuild through VitePress (`GHSA-67mh-4wv8-2f99`, moderate);
- Vite through VitePress (`GHSA-4w7w-66w2-5vf9` and `GHSA-v6wh-96g9-6wx3`, moderate;
  `GHSA-fx2h-pf6j-xcff`, high);
- brace-expansion through ESLint/typescript-eslint (`GHSA-rgw5-rvv9-x895`, high); and
- nanoid through existing PostCSS, Vite, Vitest, VitePress, Storybook, and example paths
  (`GHSA-2v37-7h3g-55p8`, high).

The repository-wide audit is therefore not clean, but the candidate graph is clean in this dated
screen. The findings are not a claim about future releases.

Official GitHub repository metadata checked on 2026-08-27 reports uPlot, `d3-array`, `d3-scale`,
`d3-shape`, and DefinitelyTyped as unarchived. Their latest repository pushes were respectively
2026-04-22, 2025-03-16, 2026-02-23, 2023-10-06, and 2026-08-27. This is enough to reject an
abandoned or archived-package stop condition, but activity alone does not transfer update ownership:
Wayglass would own candidate compatibility, advisory triage, browser regression, and
declaration/runtime alignment after any promotion.

## Isolation and complete-removal boundary

The retained static test proves that candidate versions exist only as exact root development
dependencies; the experiment is not a workspace package and the private root has no export map; no
application, example, or production package manifest or source imports a candidate; only explicit
uPlot and D3 proof modules import candidate code; and proof source performs no Custom Element
registration or assignment to `window`/`globalThis`.

The clean-page Playwright test begins with no proof script. Across Chromium, Firefox, and WebKit,
the native adapter loads before any uPlot or D3 request; uPlot then loads without D3; and D3 loads
only after its own direct import. All requests remain on the local proof origin. No `uPlot` or `d3`
global or Custom Element registration appears, and every adapter destroys all `.p5c-adapter` DOM.

Candidate removal requires no production-consumer edit. uPlot removal is bounded to its exact root
dependency and lock entry, adapter/model/tests, and proof evidence. D3 removal is bounded to its six
direct root dependencies, resolved runtime/declaration lock graph, adapter/geometry/tests, and proof
evidence. Removing the entire private proof additionally removes its experiment directory, Phase 5C
browser tests and performance config, root proof scripts, seven direct dependencies and lock
entries, and charter evidence links. Generated benchmark output, Playwright output, traces, and
caches are disposable and remain ignored. The accepted proof is retained until disposition, so this
audit verifies the complete removal boundary without prematurely deleting evidence.

## Reproduction

```sh
pnpm experiment:phase5c:check
pnpm exec vitest run --root experiments/phase-5c-rich-visualization --config vitest.config.ts test/bundle-budget.test.ts --reporter=verbose --disableConsoleIntercept
pnpm exec playwright test tests/browser/phase-5c-isolation.spec.ts
pnpm audit --audit-level low
```

No command publishes, deploys, contacts a provider, or changes a production package boundary.
