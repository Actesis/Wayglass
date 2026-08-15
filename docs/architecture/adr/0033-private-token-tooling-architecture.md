# ADR 0033: Use one private normalized graph for token generation

- Status: proposed
- Date: 2026-08-15

## Context

`@wayglass/tokens` and `@wayglass/themes` currently author related token and mode definitions but
use separate compilers. The token package emits CSS and flat JSON; the themes package emits theme
and density CSS. The flat JSON is intentionally only DTCG-shaped and does not express the complete
mode, identity, alias, unit, or standards-version contract a downstream tool would need.

The dispositioned Phase 5B exploration proved that one immutable normalized graph can preserve all
528 current identities and 197 official overrides, reproduce base and theme/density CSS byte for
byte, and emit a deterministic partial DTCG 2025.10-aligned exchange. It also proved stable
identity, targeted drift, adverse-input rejection, explicit omissions, manifest verification, and
isolation from runtime consumers. The exchange represents 524 tokens; four `ch` or `fr` dimensions
remain explicitly unsupported.

The project owner accepted a narrow artifact candidate in the build-and-validation tier. That
disposition requires a permanent placement and architecture before production code replaces the
private proof. It does not approve a package, dependency, public schema, conformance claim, design
tool, or non-web platform.

## Decision

### Keep TypeScript definitions authoritative

The reviewed definitions in `packages/tokens/src/definitions.ts` and
`packages/themes/src/definitions.ts` remain the sole authoring authority. Generated CSS, flat JSON,
exchange files, manifests, fingerprints, and resolver data are one-way projections and are never
accepted as source.

Equal values do not imply equal semantics. Normalization preserves token layer, type, description,
deprecation, alias edges, modes, and Wayglass state axes. Unsupported target values are reported,
not coerced or silently dropped.

### Place the tool outside distributable packages

Permanent implementation lives at `tooling/token-interchange/`. It is private repository build and
validation tooling, not a pnpm workspace package, npm name, public entry point, or production
runtime dependency.

The tool may consume authored foundation source and existing repository development dependencies.
Foundation source modules do not import the tool. Package build scripts may invoke an explicit root
generation command, while emitted runtime artifacts remain dependency-free and contain no tool code.

### Generate both output families from one graph

One validated, immutable graph feeds:

1. a web compatibility family that preserves current token CSS, legacy flat token JSON, and theme
   and density CSS; and
2. an opt-in private exchange family containing nested token data, four mode overlays, resolver
   contexts, and a manifest.

The web family must remain byte-for-byte compatible unless a separate foundation decision approves
public drift. Web-only selector and forced-color policy stays explicit and is not mislabeled as
portable token data.

The exchange remains `partial-dtcg-2025.10-candidate`, records exact source and output integrity,
and accounts for every omission. It is not checked into a production package, published, or
represented as conformant or compatible with an external tool.

### Separate pure transforms from effects

Normalization, validation, transformation, comparison, hashing, and manifest construction are pure
modules with no import-time effects. Explicit command adapters own option parsing, diagnostics, exit
codes, source-revision authentication, and filesystem writes.

Repository commands provide a write-free check, web generation, private exchange generation,
existing-release verification, and informational capacity measurement. They use no network,
credentials, telemetry, remote schema, or arbitrary plugin execution.

### Fail before replacement and serialize writers

All outputs are validated in memory before filesystem replacement. Web artifacts use sibling
temporary files and atomic rename. Exchange artifacts use immutable content-addressed releases and
an atomic pointer.

The permanent exchange writer adds a non-replacing single-writer lock. It fails on a live or
unverifiable lock and exposes a documented, conservative stale-lock recovery path. Recovery touches
only names owned by the tool and preserves the last verified release. Power-loss durability,
distributed filesystems, and multiple hosts remain unsupported until tested.

### Migrate in parity-gated stages

The accepted experiment is promoted by moving its covered behavior, adding flat-JSON parity and
concurrency handling, wiring the write-free check into ordinary validation, then routing existing
generated-file steps through the explicit web command. Old and new generators may overlap only for
comparison and never write the same destination in one build.

The proof directory and superseded compiler logic are removed only after the permanent path passes
the implementation contract's complete validation matrix. Every stage remains reversible through
version control without treating generated output as source.

## Consequences

- Token identity and semantics gain one validation boundary across existing web artifacts and future
  private exchange work.
- Documentation-only ownership becomes executable drift and failure evidence.
- Existing runtime consumers receive the same files without installing or bundling the tool.
- The repository acquires a private command and maintenance surface whose compatibility must be
  tested at the supported Node and pnpm floor.
- DTCG interpretation and explicit omissions become maintained private policy even before an
  external consumer exists.
- Exact web compatibility and conservative writes add implementation complexity but keep migration
  reviewable and reversible.
- A later design tool or platform transform can begin from a verified artifact without gaining
  authoring authority automatically.
- Package status, public documentation, publication, external compatibility, and conformance remain
  separate decisions.

## Alternatives considered

### Keep only the private experiment

Rejected as the permanent architecture. The proof answers feasibility but does not own production
generation, stable commands, concurrency, migration, or ongoing compatibility. Retaining it alone
would leave the demonstrated safety disconnected from the current build.

### Keep the current compilers and publish guidance only

Rejected by the accepted disposition. Guidance cannot enforce reversible identity, semantic-axis
preservation, cross-output drift, manifest integrity, or safe failure.

### Put the implementation inside `@wayglass/tokens`

Rejected for now. Exchange and validation tooling has an independent build-time ownership boundary
and must not enlarge the foundation runtime package's files, exports, dependency, or support
surface. The token package remains an authored foundation source and runtime artifact.

### Create `@wayglass/token-tools`

Rejected without repeated external consumers. A workspace or npm package would imply versioning,
compatibility, contents, and support decisions not established by the Phase 5B proof.

### Adopt Style Dictionary as the permanent transformer

Rejected for this implementation. The proof demonstrated that existing Node and repository code are
sufficient, while dependency adoption would add scripts, transitives, update ownership, and mapping
behavior without demonstrated parity benefit. The candidate may be reconsidered for a real external
consumer through a fresh dependency review.

### Make DTCG files canonical

Rejected. The pinned format cannot represent four current dimensions without omission, and making a
generated target authoritative would split or invert ownership.

### Support bidirectional design-tool synchronization

Rejected as a different risk and ownership model. Round-trip conflict policy, design-tool access,
credentials, versions, and target review belong to Phase 5D and require their own accepted charter.

## Related records

- [Token-tooling implementation contract](../../governance/token-tooling-implementation-contract.md)
- [Phase 5B exploration and disposition](../../governance/explorations/phase-5b-token-interchange.md)
- [Phase 5B formal validation](https://github.com/Actesis/Wayglass/blob/main/experiments/phase-5b-token-interchange/evidence/formal-validation.md)
- [ADR 0031: ecosystem artifact architecture](./0031-ecosystem-artifact-architecture.md)
- [Phase 5 validation plan](../../accessibility/phase-5-validation-plan.md)
