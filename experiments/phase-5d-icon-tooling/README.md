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
