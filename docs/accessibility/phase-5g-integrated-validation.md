# Phase 5G integrated validation

**Status:** Stages 5G-A and 5G-B completed on September 1, 2026. `P5G-E01` through `P5G-E03` pass.
Stages 5G-C through 5G-E remain pending; this record does not authorize publication, deployment,
candidate promotion, or a new compatibility or support claim.

This is the cumulative evidence record for the accepted
[Phase 5G closeout plan](./phase-5g-closeout-plan.md). Results are added by stage so an unavailable,
failed, skipped, or inferred result cannot be mistaken for completed evidence.

## Stage 5G-A — Ledger and repository baseline

### Frozen baseline

| Field           | Recorded value                                                                              |
| --------------- | ------------------------------------------------------------------------------------------- |
| Source baseline | `89349962935e267a754b4c0796567bafca4f78b1`                                                  |
| Host            | macOS 26.6.2 (`25G83`), Darwin arm64                                                        |
| Node            | `v26.4.0`                                                                                   |
| pnpm            | `11.9.0`; root manifest declares `pnpm@11.9.0`                                              |
| TypeScript      | `6.0.3`                                                                                     |
| Playwright      | `1.62.0`                                                                                    |
| Chromium        | Chrome for Testing `151.0.7922.34`, Playwright revision `1234`, present locally             |
| Firefox         | `153.0`, Playwright revision `1538`, present locally                                        |
| WebKit          | `26.5`, Playwright revision `2336`, present locally                                         |
| Lockfile        | `pnpm-lock.yaml` SHA-256 `6d3b70b144bde5e52ed63562b4f343bea22857639482a6265ebec278cbdb5b17` |

The source baseline is the accepted closeout-plan commit. Stage 5G-A documentation is layered on a
branch from that exact commit. Stage 5G-B must record the final validation commit separately and
must perform its own frozen install and uncached checks.

### Reconciled track ledger

| Track                     | Lifecycle and outcome                                                             | Retained boundary                                                                                            | Cleanup and unsupported claims                                                                                               | Objective next gate                                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 5A ecosystem architecture | Complete                                                                          | ADRs 0031–0032, exploration and release governance, validation plan                                          | No publication or deployment authority inferred                                                                              | Separately approved release or deployment proposal                                                                             |
| 5B token interchange      | `dispositioned`; trimmed private tooling implemented under ADR 0033               | `tooling/token-interchange`, authored token sources, deterministic outputs, historical evidence              | No public package or general interoperability claim                                                                          | Independent consumer before package or interoperability proposal                                                               |
| 5C rich visualization     | `dispositioned`; narrow native SVG/HTML candidate retained, uPlot and D3 rejected | Private native proof, focused tests, browser cases, historical comparative evidence                          | Rejected code and dependencies removed; no package, stable API, broad chart, AT, or device claim                             | Named independent application before implementation/package work; NVDA/Firefox and physical-device gates remain claim-specific |
| 5D-A icon tooling         | `dispositioned`; trimmed private pipeline implemented under ADR 0034              | `tooling/icon-pipeline`, authenticated runtime outputs, review artifact, manifest, historical evidence       | Superseded executable proof removed; no public contribution, design-tool, or publication claim                               | Independent contribution workflow and release governance                                                                       |
| 5D-B design library       | Deferred                                                                          | Governance records only                                                                                      | No Figma dependency, credential, generated library, or second token authority                                                | Named workspace, access, versions, reviewer, backup, linkage, and drift plan                                                   |
| 5E Home Assistant         | `dispositioned`; guidance only                                                    | Domain-neutral guide, bounded recipe, charter, historical evidence and raw measurements                      | Executable proof, root commands, runtime dependency, credentials, provider import, and compatibility claim removed or absent | Separate live-environment approval; second consumer and compatibility/security owner before shared runtime                     |
| 5F framework wrapper      | `dispositioned`; deferred                                                         | Demand-audit record only                                                                                     | React remains the only accepted binding; no speculative wrapper, peer, or compatibility claim                                | Named application, reproducible direct-use gap, exact versions/rendering mode, and maintainer                                  |
| Package release           | Unapproved                                                                        | Seven candidate public-package manifests remain private at `0.0.0`; eslint config remains repository-private | No registry, version, tag, provenance, publish, or support action authorized                                                 | Separate exact release proposal and release-governance gates                                                                   |
| Documentation delivery    | Architecture accepted; implementation and launch unapproved                       | Local VitePress, Storybook, examples, and ADR 0032                                                           | No tracked Cloudflare/Worker deployment configuration or public deployment claim                                             | Separate implementation, preview, rollback, and launch approvals                                                               |

Phase 5C used the noncanonical label `disposition-accepted` despite having an accepted disposition.
Revision 4 normalizes the label to `dispositioned`; it changes no evidence, scope, authority, files,
or carried gate. All started Phase 5 exploration records now use the canonical final state.

### Repository inventory and boundary audit

- Workspace applications: private documentation and Storybook applications.
- Examples: Agent Supervision, Operations Console, React, Smart Home, and Vanilla.
- Packages: `core`, `tokens`, `themes`, `elements`, `icons`, `react`, `testing`, and the
  repository-private `eslint-config`. Every manifest remains private at `0.0.0`.
- Permanent private tooling: token interchange and icon pipeline. Retained private experiment: Phase
  5C's native visualization proof. Phase 5D keeps historical proof evidence only. Phase 5E keeps its
  README, historical evidence, and raw measurements only.
- Root commands retain permanent token/icon checks and the accepted Phase 5C private-proof checks.
  No Phase 5E executable command remains.
- No tracked GitHub workflow, temporary validation workflow, deployment configuration, credential,
  environment file, build output, package cache, browser trace, Playwright report, or test-result
  directory was found.
- No direct uPlot, D3, Home Assistant, Angular, Svelte, Figma, or Wrangler dependency was found in
  workspace manifests or the lockfile. VitePress's transitive Vue implementation remains confined to
  the private documentation application and is not an additional Wayglass binding.
- Foundation package scans found no import from private tooling, experiments, examples, Home
  Assistant, the React binding, or the icon optional runtime. Only documentation references to the
  accepted Cloudflare delivery ADR are tracked; there is no deployment implementation.

These are tracked-tree and manifest findings, not a substitute for Stage 5G-C's built-artifact,
pack, dependency, security, advisory, license, and provenance audit. Ignored local dependency and
build caches were not treated as repository artifacts and were not deleted.

### Stage-change validation

The documentation build and root `pnpm check` passed after the ledger changes. The root check
covered formatting, lint, builds, icon and token integrity, Phase 5C type and unit checks, workspace
typechecks, and unit tests. Turbo legitimately replayed prior local results for most workspace
tasks; therefore this run validates the Stage 5G-A documentation change but is not recorded as
`P5G-E02`. Stage 5G-B requires a clean frozen install and an explicitly uncached integrated run.

### Reproduction commands

```bash
git rev-parse HEAD
sw_vers
uname -sm
node --version
pnpm --version
pnpm exec tsc --version
pnpm exec playwright --version
pnpm exec playwright install --dry-run
shasum -a 256 pnpm-lock.yaml
git ls-files
rg -n '"(uplot|d3|@types/d3|home-assistant|@angular|svelte|figma|wrangler)"' \
  package.json pnpm-lock.yaml packages/*/package.json apps/*/package.json examples/*/package.json
```

The browser command reports the versions pinned by the installed Playwright package; the matching
managed-browser directories were checked separately for local presence. It does not launch a
browser. Browser execution belongs to Stage 5G-B.

## Stage 5G-B — Integrated automated and browser matrix

### Authoritative source and clean environment

The passing run used detached clean checkout `26652321299d5c3146c9f360627c68ddd3f57f7a`. That commit
contains the two portability corrections found by the earlier clean attempts. The checkout began
without `node_modules`, build output, browser output, or a local Turbo cache.

| Command                                             | Result                                                                                                                                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                    | Passed; all 375 packages were fetched for the clean checkout, the committed lockfile was accepted without resolution changes, and both declared install scripts completed |
| `TURBO_CACHE_DIR=.turbo-phase5g-b-final pnpm check` | Passed; the build phase executed 14 of 14 tasks with zero cache hits, followed by all focused tooling checks, typechecks, and unit suites                                 |
| `pnpm exec playwright test --list`                  | Scheduled 1,506 cases in 54 files: 502 per engine                                                                                                                         |
| `pnpm test:browser`                                 | Passed on the first permitted launch in 3.1 minutes: 1,458 passed, 48 intentionally skipped, zero failed, and no retry or flaky result                                    |

The six cache hits reported during each later Turbo typecheck and test phase were build
prerequisites created earlier in the same command and isolated cache. They were not replayed from
another checkout. Generated token files were created in the clean worktree, then authenticated
against source commit `2665232`; the final tracked tree remained unchanged.

### Automated repository coverage

- All 14 scheduled builds passed, including VitePress, Storybook, Vanilla, React, the three
  reference applications, production packages, themes, tokens, icons, and testing support.
- Icon generation and four generated artifacts passed integrity checks; 58 private icon-tooling
  tests passed.
- Token web generation, 528-token and 197-override drift checks, three web artifacts, seven exchange
  files, and 93 private token-tooling tests passed.
- The retained Phase 5C proof passed typechecking and all 24 unit tests.
- All 20 scheduled workspace typecheck tasks and all 20 scheduled workspace test tasks passed.
  Packages or applications with no unit files exited successfully only where their manifest already
  declares `--passWithNoTests`; browser behavior is covered separately below.

### Supported-browser accounting

| Engine                 | Scheduled |    Passed | Intentionally skipped | Failed |
| ---------------------- | --------: | --------: | --------------------: | -----: |
| Chromium 151.0.7922.34 |       502 |       502 |                     0 |      0 |
| Firefox 153.0          |       502 |       478 |                    24 |      0 |
| WebKit 26.5            |       502 |       478 |                    24 |      0 |
| **Total**              | **1,506** | **1,458** |                **48** |  **0** |

The 24 non-Chromium cases per engine are explicitly coded Chromium-only timing thresholds or Tier B
presentation permutations. They are not unavailable browsers or runtime skips. Chromium executed
those cases. Firefox and WebKit still executed the shared cross-engine functional, semantic,
keyboard, focus, form, responsive, forced-color, reduced-motion, accessibility, and retained Phase
5C task coverage.

Across the matrix, the accepted themes and densities, phone/desktop/wall compositions, 200% text,
long content, RTL, forced colors, grayscale, reduced motion, keyboard, pointer/touch-sized controls,
focus retention/restoration, native forms and dialogs, Axe scans, explicit registration, reference
applications, React wrappers, media, and exact telemetry paths passed. The retained Phase 5C native
candidate passed its shared summary/table equivalence, quiet nonvisual path, persistent inspection,
keyboard and touch controls, adverse update, replacement, adaptation, and supported-browser cases;
its timing and retained-heap budgets passed in Chromium as intentionally scoped.

### Corrections and adverse-run log

1. The first sandboxed frozen install could not resolve npm and was stopped during DNS retries. The
   same command passed with authorized network access. No dependency or lockfile changed.
2. The first clean check at baseline `3a1331c` found that exchange-output validation reached the
   nonempty-directory check when the repository itself lived below the OS temporary root. The tool
   now rejects the canonical repository root before considering allowed parent roots, and the test
   names the temporary-checkout case explicitly.
3. That first worktree also revealed shared Git-worktree Turbo cache reuse. Every authoritative
   rerun used a new checkout and a fresh explicit worktree-local cache directory.
4. The second clean check at `1388b3a` found that the outside-boundary test assumed the repository's
   parent could not be the temporary root. The fixture now starts at the filesystem root, which is
   outside both allowed boundaries on macOS, Linux, and Windows. The final clean check passed all 93
   token-tooling tests.
5. The sandboxed browser launch could not bind `127.0.0.1:4173`; zero tests ran. The identical
   authorized command then passed on its first launch with all four local fixture servers.
6. Vite logged one non-failing dependency pre-scan warning for a root fixture's bare `lit` import;
   the fixture and all affected routes resolved and passed in every engine. Storybook also retained
   its existing large-chunk warning. Both observations carry into Stage 5G-C's dependency and bundle
   audit; neither was treated as a browser failure or silently removed.

No failed test was rerun into a pass, and no product failure was classified as environmental. The
two failed clean checks led to committed corrections and wholly new clean checkouts.

## Evidence status

| Evidence ID         | Result  | Basis and limitation                                                                                                                                                                     |
| ------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `P5G-E01`           | Passed  | Every started track has one accepted state, retained boundary, cleanup result, unsupported-claim boundary, and objective gate. The one vocabulary mismatch was revisioned and corrected. |
| `P5G-E02`           | Passed  | A clean frozen install and isolated-cache repository check passed at `2665232`; every scheduled build, tooling check, typecheck, and unit task completed.                                |
| `P5G-E03`           | Passed  | The full three-engine matrix passed 1,458 cases with 48 explicit Chromium-only skips and no failure, retry, or flaky result.                                                             |
| `P5G-E04`–`P5G-E06` | Pending | Stage 5G-C package, isolation, security, advisory, provenance, and license evidence has not run.                                                                                         |
| `P5G-E07`–`P5G-E08` | Pending | Stage 5G-D documentation-system and deployment-boundary evidence has not run.                                                                                                            |
| `P5G-E09`–`P5G-E10` | Pending | Stage 5G-E carried-gate and final project-owner disposition remain open.                                                                                                                 |

## Next stage

Stage 5G-C audits artifact isolation, local package contents, dependency and peer graphs, security,
privacy, advisories, provenance, notices, and licenses without changing package privacy or
publishing anything.
