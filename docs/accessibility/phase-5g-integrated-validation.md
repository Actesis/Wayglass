# Phase 5G integrated validation

**Status:** Stage 5G-A completed on September 1, 2026. `P5G-E01` passes. Stages 5G-B through 5G-E
remain pending; this record does not authorize publication, deployment, candidate promotion, or a
new compatibility or support claim.

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

## Evidence status

| Evidence ID         | Result  | Basis and limitation                                                                                                                                                                     |
| ------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `P5G-E01`           | Passed  | Every started track has one accepted state, retained boundary, cleanup result, unsupported-claim boundary, and objective gate. The one vocabulary mismatch was revisioned and corrected. |
| `P5G-E02`–`P5G-E03` | Pending | Stage 5G-B clean frozen install, uncached repository checks, and supported-browser matrix have not run for closeout.                                                                     |
| `P5G-E04`–`P5G-E06` | Pending | Stage 5G-C package, isolation, security, advisory, provenance, and license evidence has not run.                                                                                         |
| `P5G-E07`–`P5G-E08` | Pending | Stage 5G-D documentation-system and deployment-boundary evidence has not run.                                                                                                            |
| `P5G-E09`–`P5G-E10` | Pending | Stage 5G-E carried-gate and final project-owner disposition remain open.                                                                                                                 |

## Next stage

Stage 5G-B performs a frozen install and the uncached integrated automated and supported-browser
matrix. A failure, skip, unavailable browser, or environmental rerun will be recorded explicitly.
