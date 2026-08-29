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

Domain neutrality and icon meaning remain human review decisions. The validator deliberately does
not infer semantic names, labels, direction, or catalog eligibility from geometry.

## Commands

```sh
pnpm experiment:phase5d:check
pnpm experiment:phase5d:typecheck
pnpm experiment:phase5d:test
```

The proof uses no network, credentials, personal data, design-tool access, new dependency, runtime
registration, production package import, or filesystem write.

The current contract and runtime inventory is retained in
[`evidence/current-contract-and-source-inventory.md`](./evidence/current-contract-and-source-inventory.md).
