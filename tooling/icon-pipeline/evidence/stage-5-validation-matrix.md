# Icon-tooling Stage 5 validation matrix

- Implementation commit: `79c9d82a6caaf51ad7a72f71a2af515b2bd5582e`
- Date: 2026-08-30
- Host: Apple silicon, macOS 26.5.2, APFS
- Current runtime: Node 26.4.0 and pnpm 11.9.0
- Minimum runtime: authenticated Node 22.13.0 macOS arm64 archive and pnpm 11.9.0
- Reviewer: project-owner review pending

## Result

Stage 5 passes. The write-free `pnpm icon-tooling:check` now runs exactly once in the ordinary root
gate after the bootstrap build, and a permanent test fixes that order. Minimum/current runtime,
clean-checkout, supported-browser, automated accessibility, visual, package, dependency, and
documentation evidence passes within the boundaries below. Stage 6 proof cleanup remains separate
and has not been performed.

The package remains private at `0.0.0`. No dependency, lockfile entry, package manifest, production
export, glyph, runtime API, deployment, publication, or public support claim changed.

## Root integration and clean checkout

The root `check` sequence now places `pnpm icon-tooling:check` immediately after `pnpm build`. This
ordering ensures ignored package build output exists before the permanent command verifies the four
committed icon artifacts. The new permanent integration test rejects a missing, repeated, or
pre-build icon check.

An isolated sibling checkout of the exact implementation commit installed the committed lockfile and
ran `TURBO_FORCE=true pnpm check`. The gate passed with:

- all 14 build tasks executed with zero cache hits, including VitePress and Storybook production
  builds;
- all 20 typecheck tasks and all 20 package test tasks executed with zero cache hits;
- the 56-test permanent icon-pipeline suite, 40-test retained Phase 5D proof, token drift gates,
  formatting, linting, and application tests included in the ordinary sequence; and
- no tracked change after generation, build, drift verification, typechecking, or tests.

A diagnostic attempt placed the clean checkout under `/tmp`. The icon stages passed, but an existing
token-tooling adverse test took its permitted-temporary-root branch instead of its repository-root
branch. The authoritative clean gate therefore used the ordinary sibling-directory shape already
used by the repository's clean-bootstrap evidence. This location-sensitive token test did not
identify icon drift or a Stage 5 implementation defect.

## Runtime and determinism matrix

The official `node-v22.13.0-darwin-arm64.tar.gz` archive and Node.js checksum manifest were
downloaded to an isolated temporary directory. The published and computed SHA-256 were both
`bc1e374e7393e2f4b20e5bbc157d02e9b1fb2c634b2f992136b38fb8ca2023b7`.

Validation initially found that Node 22.13 prints its experimental type-stripping warning to stderr.
The supported command now suppresses only `ExperimentalWarning`; it does not suppress application,
validation, drift, or filesystem diagnostics. The corrected exact commit passes the CLI test with
empty stderr.

| Runtime      | Locale        | Time zone          | Launch directory | Result                                       |
| ------------ | ------------- | ------------------ | ---------------- | -------------------------------------------- |
| Node 26.4.0  | `C`           | `UTC`              | repository root  | Pass; four icons and four artifacts verified |
| Node 26.4.0  | `en_US.UTF-8` | `Pacific/Auckland` | `/private/tmp`   | Pass; identical result                       |
| Node 22.13.0 | `C`           | `UTC`              | repository root  | Pass; four icons and four artifacts verified |
| Node 22.13.0 | `en_US.UTF-8` | `Pacific/Auckland` | `/private/tmp`   | Pass; identical result                       |

Both runtimes pass the permanent TypeScript check and all 56 focused tests. One observed current-run
check took 0.08 seconds wall time; one minimum-run check took 0.17 seconds. These single warm local
observations are not performance budgets. Memory measurement was unavailable because the sandbox
blocked the timing utility's system query; no memory claim is made.

The committed artifact hashes were identical in every case:

| Artifact                                               | SHA-256                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `packages/icons/src/generated/catalog.ts`              | `0ee50919542652fe6a979dd3ad2e80dc72c4360314689b7f55a9eb01c0675c15` |
| `tooling/icon-pipeline/generated/source-manifest.json` | `fdb07b075750014ac3b11cdc21c74a8df8e926041c3e59620925eda2ed5b4254` |
| `tooling/icon-pipeline/generated/output-manifest.json` | `eb3071ab7ca9f31946cb4cee02ba97088d482522d0ad8434c116aa4f0292261a` |
| `tooling/icon-pipeline/generated/review-index.html`    | `2e853105f73001a2a061df64b05737b6857e482dbdc3ea5e49696a0c48dc704f` |

The retained Stage 0 evidence remains the exact Node 22.13/Linux prerequisite required before
migration. This Stage 5 run adds permanent-tool Node 22.13 evidence on macOS; it does not claim a
second permanent-tool Linux execution.

## Browser, accessibility, and visual matrix

The focused production-runtime suite passed all 24 cases across Chromium, Firefox, and WebKit from
the exact clean implementation commit. It covers entry-point identity, explicit registration,
authenticated geometry, semantic sizes, accessibility modes, missing and unknown names, reviewed
logical direction, styling hooks, inertness, both themes, Axe, forced colors, reduced motion, and
200% text at 320 CSS pixels.

The implementing Codex agent reviewed the built dark fixture in the in-app Chromium browser at 1280
by 720. It showed 23 icon hosts, 21 rendered SVGs, the two intentional empty missing/unknown hosts,
all size and semantics examples, a 40-pixel custom-property example, and zero horizontal overflow.
The only console message was Lit's expected local development-mode warning.

Stage 4B's light Storybook review and full 1,518-case repository browser result remain applicable
because Stage 5 changes only repository command integration and the Node warning flag; package
runtime, generated bytes, fixture, stories, browser dependencies, and browser configuration are
identical. That full result remains qualified by its one transient existing Chromium Axe
execution-context loss, which passed in isolation. Automated Axe evidence is not manual
screen-reader evidence; VoiceOver/Safari and NVDA/Firefox remain release gates.

## Package, dependency, and supply-chain matrix

The exact clean checkout packed `@wayglass/icons@0.0.0` to the same 10,350-byte tarball recorded in
Stage 4B, with SHA-256 `d085d3db3b843876207b1e6c8afd8487a792127249a112583a86373db4b7afcb`. It
contains only compiled runtime JavaScript, declarations, source maps, `package.json`, and `LICENSE`;
tooling, tests, experiments, manifests, review HTML, and Storybook files remain absent.

All package manifests and `pnpm-lock.yaml` are byte-identical to the Stage 4 baseline. The private
icon package retains its existing nine-package production tree: Lit 3.3.3 and its already accepted
transitive packages. Locked installation passed the repository supply-chain policy, and
`pnpm audit --prod --audit-level high` reported no known vulnerabilities on August 30, 2026. This is
a time-bound advisory result, not a guarantee against future disclosures.

## Completion-gate mapping

| Contract gate                        | Evidence and result                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Source accounting and exact geometry | Four canonical records and generated runtime remain authenticated; permanent parity tests pass                           |
| Determinism and drift                | Four runtime/locale/time-zone/launch-directory cases match; root check runs write-free and leaves tracked files clean    |
| CLI and recovery                     | Permanent 56-test suite covers help, options, diagnostics, writer, lock, interruption, recovery, traversal, and cleanup  |
| Runtime contract                     | Stage 4 unit, package-boundary, 24-case browser, Axe, and visual evidence remains exact and passes at the Stage 5 commit |
| Isolation and package boundary       | Package tarball excludes tooling; icon-absent consumers and package manifests remain unchanged                           |
| Dependency and license               | Apache-2.0 retained; no dependency or lock change; production audit reports no known vulnerability                       |
| Repository and documentation         | Cache-bypassed clean `pnpm check`, VitePress, Storybook, and `git diff --check` pass                                     |
| Human support gates                  | VoiceOver/Safari and NVDA/Firefox remain explicitly incomplete release gates                                             |

## Limits and next boundary

The evidence covers one APFS/macOS host, one prior hosted Linux prerequisite, current bundled
Playwright engines, deterministic local fixtures, and a local private package tarball. It does not
establish power-loss or distributed-filesystem durability, public contribution readiness, Figma
compatibility, package publication, registry integrity, or public assistive-technology support.

Stage 5 is complete. Stage 6 may remove the superseded executable proof and legacy parity fixture
only after project-owner review of this matrix confirms that every accepted behavior is mapped to
the permanent path. Historical evidence and governing decisions must remain.

## Reproduce

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit -p tooling/icon-pipeline/tsconfig.json
pnpm exec vitest run --root tooling/icon-pipeline --config vitest.config.ts
pnpm icon-tooling:check
TURBO_FORCE=true pnpm check
pnpm exec playwright test tests/browser/icons.spec.ts
pnpm --filter @wayglass/icons pack --pack-destination <temporary-directory>
pnpm audit --prod --audit-level high
git diff --check
git status --short
```
