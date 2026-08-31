# Phase 5D-A security, dependency, and removal audit

- Evidence: `P5D-A-E08`
- Environment: repository at `7189e95`, Node 26.4.0, pnpm 11.9.0
- Date: 2026-08-29
- Disposition: automated pass for the bounded private proof

## Input and output security

The canonical source is structured data, not SVG or HTML markup. Exact-key validation rejects
embedded markup, text, style, event handlers, external references, transforms, clipping, opacity,
display overrides, and nested content. The primitive allowlist contains only paths and circles; it
rejects script, style, text, image, use, animation, and foreign-object nodes. Existing paint checks
also reject geometry with both fill and stroke disabled. These cases fail before generation and do
not replace committed output.

The executable proof and generated artifacts contain no network, credential, persistence, clipboard,
cookie, telemetry, or custom-element registration API. The generated review document is script-free
and contains only same-document symbol references. This establishes the bounded model's behavior; it
is not a claim that Wayglass safely parses arbitrary untrusted SVG.

## Dependency history and runtime boundary

Comparison from the charter baseline `554fb79` through merged runtime-isolation commit `7189e95`
shows no change to `pnpm-lock.yaml` or `pnpm-workspace.yaml`. The only root-manifest delta is the
three private Phase 5D check commands and their addition to the root check chain. No dependency,
dev-dependency, package export, install script, workspace package, or transitive lock entry was
added.

Automated import inspection limits proof execution to relative modules, Node built-ins, and the
repository's existing exact `vite@8.1.5` and `vitest@4.1.10` dev tools. Playwright coverage uses the
already accepted root test dependency. The runtime candidate's in-memory bundle remains dependency-
free as recorded in `P5D-A-E03`.

## Complete removal

The archived
[`removal-plan.json`](https://github.com/Actesis/Wayglass/blob/da5b975b7526ec47a3927b336446cd97f6e04868/experiments/phase-5d-icon-tooling/removal-plan.json)
was the exact machine-checked cleanup boundary. Removal deletes the private source, generated
artifacts, tests, configs, command documentation, removal manifest, and two browser proofs; removes
the three root scripts; and removes the Phase 5D invocation from the root check chain. The
production packages, exports, workspace definition, dependency graph, lockfile, and generated
foundation artifacts require no change.

The evidence directory, Phase 5 roadmap, charter, and VitePress include are deliberately retained as
historical decision records. Automated repository scanning verifies that every reference outside the
private experiment is one of those three external records, the root command surface, or the two
browser proofs. The removal plan deletes all executable references while preserving the contract
inventory and governance history.

## Limitations

No arbitrary SVG parser, remote design tool, upload boundary, credential, network client, install
hook, or published package was tested because none exists in the accepted proof. Dependency history
uses the recorded charter baseline and current repository state; promotion would require a fresh
audit and a separate implementation decision.
