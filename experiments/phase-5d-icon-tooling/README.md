# Phase 5D-A icon-tooling proof

This private experiment implements only the bounded proof accepted in
[`P5D-ICON-TOOLING-001`](../../docs/governance/explorations/phase-5d-icon-tooling.md). It is not a
workspace package, production icon source, public contribution format, SVG importer, design-tool
artifact, or release candidate.

The source-foundation slice provides:

- a dependency-free structured geometry model instead of arbitrary SVG markup;
- the four current runtime glyphs plus one synthetic logical-direction fixture;
- stable identity, catalog envelope, provenance, optional-use, paint, primitive, command, finite-
  number, and authored-view-box validation;
- explicit rejection of unknown fields, unsupported primitives/commands, invisible geometry, and
  ambiguous input; and
- immutable validated copies with no mutation of authored input.

The deterministic-generation slice adds:

- a pure generator whose output is independent of authored catalog order;
- a runtime-catalog candidate, source manifest, and output manifest with SHA-256 fingerprints;
- committed candidate artifacts checked byte for byte by the proof suite;
- stable changed, missing, and unexpected-artifact diagnostics; and
- failure-before-output behavior for invalid source.

The environment-and-capacity slice checks current-Node output across two working directories,
locales, time zones, and source orders. It also measures 50 generations of an explicitly synthetic
500-glyph catalog against the charter's two-second and 256-MiB bounds. The synthetic catalog tests
capacity only; it is not evidence of demand or catalog eligibility.

The static-review slice generates a script-free HTML index from the same validated source. It shows
both review themes, three exact sizes, LTR and RTL geometry, metadata, named-reference and
owning-control cases, an icon-absent task, and a missing preview. Focused Playwright coverage checks
the page in Chromium, Firefox, and WebKit with Axe, forced colors, grayscale, reduced motion, and
200% text.

The runtime-isolation slice adds a pure descriptor adapter over the generated catalog. In-memory
bundle checks compare current production geometry, keep the directional fixture private, exclude
generator and validator code from the candidate graph, and prove that a clean no-icon core consumer
receives neither icon nor proof modules.

The security-and-removal slice exercises explicit active, external, hidden, styled, and text-bearing
input attacks; audits executable imports and side-effect APIs; and keeps a machine-checked removal
plan that leaves production packages and dependency graphs untouched.

The maintenance-comparison slice performs the fixed add-and-revise task against both the current
manual source and the canonical proof source. It records synchronized decisions, missing manual
surfaces, generated drift, owned lines, output bytes, and 50 warm plus 50 cold-process generations.

Domain neutrality and icon meaning remain human review decisions. The validator deliberately does
not infer semantic names, labels, direction, or catalog eligibility from geometry.

## Commands

```sh
pnpm experiment:phase5d:check
pnpm experiment:phase5d:typecheck
pnpm experiment:phase5d:test
```

The proof uses no network, credentials, personal data, design-tool access, new dependency, runtime
registration, production package import, or generator filesystem write. Tests read the committed
candidate artifacts to enforce drift; they never repair or replace them.

The current contract and runtime inventory is retained in
[`evidence/current-contract-and-source-inventory.md`](./evidence/current-contract-and-source-inventory.md).
The project-owner-approved disposition and authoritative runtime decision are recorded in the
[`@wayglass/icons` runtime-contract reconciliation](../../docs/governance/icon-runtime-contract-reconciliation.md).
The proposed permanent boundary is recorded in the
[icon-tooling implementation contract](../../docs/governance/icon-tooling-implementation-contract.md)
and [ADR 0034](../../docs/architecture/adr/0034-private-icon-pipeline-architecture.md).
Deterministic generation and drift findings are retained in
[`evidence/deterministic-generation-and-drift.md`](./evidence/deterministic-generation-and-drift.md).
Environment and capacity findings are retained in
[`evidence/environment-and-capacity.md`](./evidence/environment-and-capacity.md). The completed
minimum-environment prerequisite is retained in
[`evidence/node-22-linux-validation.md`](./evidence/node-22-linux-validation.md). Static visual and
accessibility findings are retained in
[`evidence/static-review-and-accessibility.md`](./evidence/static-review-and-accessibility.md).
Runtime-boundary findings are retained in
[`evidence/runtime-compatibility-and-isolation.md`](./evidence/runtime-compatibility-and-isolation.md).
Security, dependency-history, and cleanup findings are retained in
[`evidence/security-dependency-and-removal.md`](./evidence/security-dependency-and-removal.md). Task
and maintenance findings are retained in
[`evidence/maintenance-and-task-comparison.md`](./evidence/maintenance-and-task-comparison.md).
Documentation, cleanup, and the proposed disposition are retained in
[`evidence/documentation-cleanup-and-proposed-disposition.md`](./evidence/documentation-cleanup-and-proposed-disposition.md).
