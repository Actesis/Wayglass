# ADR 0034: Generate icon runtime data and review artifacts from one private catalog

- Status: accepted
- Date: 2026-08-29

## Context

`@wayglass/icons` currently owns four domain-neutral control glyphs as inline Lit templates. Names,
geometry, rendering, and tests are hand-synchronized, while the accepted foundation contract also
requires labeling, semantic sizes, explicit logical direction, styling hooks, safe missing-name
behavior, and a component-specific export.

The dispositioned Phase 5D-A exploration proved that one strict structured catalog can preserve the
four current glyphs, reject active or ambiguous input, generate deterministic runtime data and
authenticated manifests, and create a script-free visual review index. It also proved direction,
accessible-use, drift, failure, browser, isolation, and maintenance behavior without adding a
dependency or changing production packages. The accepted runtime reconciliation keeps the Phase 2C
API authoritative and classifies the current runtime as incomplete.

The project owner accepted a trimmed private build-and-validation candidate and deferred Phase 5D-B
design-library work. Permanent architecture must retain only the useful source, validation,
generation, drift, and review capability—not the experiment's full proof and measurement surface.

## Decision

### Keep one reviewed TypeScript catalog authoritative

The permanent official catalog lives in `tooling/icon-pipeline/src/catalog.ts`. It is the only
source for stable identity, 24-unit geometry, direction metadata, reinforcement-only use, and
Wayglass/Apache-2.0 provenance.

Generated TypeScript, manifests, review HTML, screenshots, built package files, and design artifacts
are one-way projections and never authoring input. Domain meaning, labels at each use, application
state, control names, and domain-specific catalogs remain outside the tool.

The source language stays closed and narrow: exact records, path and circle primitives, accepted
path commands, finite in-bounds coordinates, and `currentColor`/`none` paint. It rejects arbitrary
SVG, active content, external references, embedded text or style, unknown fields, and semantic or
direction inference from geometry.

### Place the pipeline outside distributable packages

Permanent tooling lives at `tooling/icon-pipeline/`. It is private repository build and validation
tooling, not a pnpm workspace package, npm name, public schema, or runtime dependency.

Production packages do not import tooling modules. `@wayglass/icons` imports only the generated
inert catalog data assigned to `packages/icons/src/generated/catalog.ts`. Foundation and icon-absent
consumers receive no tool or icon code, registration, dependency, export, or browser-floor change.

### Generate one authenticated output set

One validated immutable catalog produces the runtime-data module, source manifest, output manifest,
and static review index named by the implementation contract. The runtime module carries only names,
direction metadata, and inert primitives. The manifests bind identities and bytes to the exact
catalog source fingerprint without self-authenticating recursively.

The review index shows every glyph by textual identity across accepted sizes, themes, and reading
directions and includes accessibility and missing-icon cases. It is script-free, uses accepted
Wayglass token outputs, and cannot become a production application or public design-tool claim.

### Keep runtime behavior separate from generated data

`packages/icons/src/icon.ts` remains the single owner of the `wg-icon` element, explicit
registration, property reflection, accessibility, direction resolution, styling, and rendering.
Generated records never decide a consumer's label, state, action, or domain meaning.

The component-specific `@wayglass/icons/icon` export and the package root resolve to the same
side-effect-free implementation. There is no generated element class and no import-time
registration.

### Separate pure generation from explicit effects

Catalog validation, normalization, rendering, hashing, manifest construction, and byte comparison
are pure modules. One explicit command adapter owns options, diagnostics, exit codes, writer
locking, staging, atomic replacement, and conservative recovery.

`icon-tooling:check` is write-free. `icon-tooling:generate` writes only the four contract-owned
outputs after all bytes validate. The output manifest is replaced last and marks the accepted set.
Concurrent or interrupted work cannot be mistaken for accepted output; distributed and power-loss
durability remain unsupported.

### Gate migration on the minimum environment

Before proof code moves, the unchanged experiment must produce the accepted bytes and diagnostics on
Node 22.13 and Linux. Migration then proceeds through pure tooling, writer, authenticated outputs,
runtime integration, complete validation, and proof cleanup stages.

The old inline and new generated paths may coexist only behind exact parity checks and never as two
production writers or authorities. Failure stops and rolls back the migration rather than broadening
the source model or runtime contract.

## Consequences

- Maintainers gain one reviewed edit for runtime data, provenance, direction, manifests, and visual
  review.
- The runtime package can satisfy its accepted accessibility and logical-direction contract without
  importing authoring code.
- Missing-name and direction policy become explicit rather than inferred from a default glyph or
  geometry.
- The repository acquires a small private command, generated-file, writer, and review maintenance
  surface.
- The initial production catalog remains four control glyphs; growth requires human eligibility and
  visual review.
- Node 22.13/Linux becomes an evidence gate before implementation, not a claim inferred from the
  package engine range.
- The full experiment remains temporarily until permanent evidence covers accepted behavior, then
  its executable proof is removed while historical records remain.
- Figma, public contribution tooling, publication, and external compatibility remain deferred.

## Alternatives considered

### Keep the inline catalog and guidance only

Rejected by the accepted disposition. Guidance cannot enforce direction metadata, safe source,
cross-output drift, deterministic review, provenance, or failed-generation integrity.

### Promote the experiment wholesale

Rejected. Benchmark, capacity, browser-isolation, attack, and removal harnesses establish evidence
but do not belong in the permanent authoring path. The proof's 1,551-line source/test surface is too
large to normalize as production maintenance cost.

### Put source and generation inside `@wayglass/icons`

Rejected. The package is an optional browser runtime; authoring, filesystem, hashing, and review
behavior have a different environment and support boundary. Only inert generated data belongs in the
runtime source tree.

### Keep raw SVG files as canonical source

Rejected for the accepted scope. Raw SVG would require a parser/sanitizer and a broader trust model
to reject active, external, styled, hidden, or ambiguous content. The structured model proved the
needed four-glyph task without that dependency or input language.

### Adopt an icon or SVG toolchain dependency

Rejected for this implementation. The proof demonstrated that Node and existing repository code are
sufficient. A dependency would add provenance, update, security, and transform behavior without a
demonstrated platform gap.

### Generate the Custom Element implementation

Rejected. Accessibility, reflection, direction resolution, styling, and registration are runtime
behavior owned by reviewed TypeScript, not data inferred from vector records.

### Add the synthetic directional glyph to production

Rejected. `arrow-inline-start` proves mirroring but has no accepted production consumer or catalog
review. Test evidence does not establish product eligibility.

### Connect a Figma library or plugin

Deferred as Phase 5D-B. A design artifact requires a named workspace, access model, versions,
reviewer, backup, version linkage, and drift plan before implementation.

## Related records

- [Icon-tooling implementation contract](../../governance/icon-tooling-implementation-contract.md)
- [`@wayglass/icons` runtime-contract reconciliation](../../governance/icon-runtime-contract-reconciliation.md)
- [Phase 5D-A exploration and disposition](../../governance/explorations/phase-5d-icon-tooling.md)
- [ADR 0011: foundation delivery](./0011-foundation-delivery-model.md)
- [ADR 0031: ecosystem artifact architecture](./0031-ecosystem-artifact-architecture.md)
- [Phase 5 validation plan](../../accessibility/phase-5-validation-plan.md)
