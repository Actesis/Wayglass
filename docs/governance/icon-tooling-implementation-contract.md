# Icon-tooling implementation contract

**Status:** Accepted by the project owner on August 29, 2026. This contract implements the accepted
artifact-candidate disposition in [`P5D-ICON-TOOLING-001`](./explorations/phase-5d-icon-tooling.md)
against the accepted
[`@wayglass/icons` runtime reconciliation](./icon-runtime-contract-reconciliation.md). It authorizes
code migration only through its staged boundaries after the minimum-Node/Linux prerequisite passes.
It does not approve a package, dependency, publication, Figma work, or public compatibility claim.

## Purpose

Wayglass will have one private build-and-validation path that reads a reviewed, domain-neutral icon
catalog and deterministically produces:

1. the runtime catalog data consumed by the private `@wayglass/icons` package;
2. source and output integrity manifests; and
3. a static, script-free visual review index.

The tool exists to make identity, safe geometry, provenance, optional-use policy, logical direction,
generated output, drift, and review evidence machine-checkable. It does not create a general SVG
pipeline, an application icon service, or a second source of runtime meaning.

## Classification and ownership

| Field                      | Contract                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Artifact tier              | Build and validation tooling under [ADR 0031](../architecture/adr/0031-ecosystem-artifact-architecture.md) |
| Permanent tooling location | `tooling/icon-pipeline/`                                                                                   |
| Runtime output location    | `packages/icons/src/generated/catalog.ts`                                                                  |
| Package status             | Private repository tooling; not a pnpm workspace package and no npm manifest                               |
| Owner                      | Wayglass maintainers responsible for the generic icon catalog and `@wayglass/icons`                        |
| Supported execution        | Repository minimum Node 22.13 and pnpm 11.9 on Linux, plus the current maintainer environment              |
| Runtime consumers          | `@wayglass/icons` only; generated runtime data contains no tool code or dependency                         |
| External dependencies      | None accepted; Node and existing repository development dependencies are sufficient                        |
| Public API                 | None; source schema, commands, modules, manifests, and review output remain private                        |
| Version linkage            | Exact catalog source fingerprint, `@wayglass/icons` version, contract revision, and generated hashes       |

Moving the tool into `packages/`, creating `@wayglass/icon-tools`, publishing its schema, accepting
external catalog input, or supporting a design tool requires a new reviewed proposal. Repository use
alone does not promote the tool.

## Source authority

One reviewed TypeScript catalog under `tooling/icon-pipeline/src/catalog.ts` is the only geometry
and metadata authority for the official generic catalog. Each record owns:

- schema version and stable lower-kebab-case identity;
- the currently accepted `control` category;
- `neutral` or `mirrors-in-rtl` direction intent;
- the fixed `reinforcement-only` accessible-use classification;
- Wayglass authorship and Apache-2.0 provenance; and
- ordered, 24-unit-view-box path or circle primitives using only the accepted commands and
  `currentColor`/`none` paint roles.

The generated runtime module, source manifest, output manifest, review index, screenshots, built
JavaScript, and package output are derived artifacts. They MUST NOT be accepted as authoring input.
A generated file edited by hand MUST be replaced through explicit generation or rejected as drift.

Applications own icon selection, surrounding text, control names, state, value, domain meaning, and
domain-specific catalogs. The validator cannot infer catalog eligibility, semantic names, accessible
labels, direction, or domain neutrality from geometry; those remain human review decisions.

## Permanent architecture

### Private tooling boundary

`tooling/icon-pipeline/` will contain:

- the canonical four-glyph production catalog;
- stable source-model types and strict validation;
- pure deterministic runtime-data, manifest, and static-review generation;
- write-free comparison and targeted drift diagnostics;
- one explicit command and filesystem writer boundary;
- focused positive, adverse, determinism, failure, and writer tests;
- retained implementation evidence; and
- a private README stating commands, ownership, limitations, review, recovery, and removal behavior.

The accepted proof's benchmark, synthetic 500-glyph capacity generator, cold-process launcher,
browser-isolation bundle harness, attack catalog, complete-removal simulator, and proof-only runtime
descriptor are not permanent tooling. Their recorded evidence remains historical input.

Pure modules MUST have no import-time writes, Custom Element registration, network access,
credentials, telemetry, subprocesses, environment mutation, process exit, wall-clock dependency, or
global mutable state. Filesystem and process behavior belongs only in the explicit command and
writer adapters.

Production source modules MUST NOT import from `tooling/`. The icon package may import only the
generated runtime-data module assigned to it. Compiled package files MUST contain no validator,
generator, manifest, review, writer, or command code.

### Closed source model

Validation will preserve the proven narrow language:

- exact record and primitive keys; no ignored extension fields;
- one 24-by-24 authored coordinate system with finite, in-bounds numbers;
- path `move-to`, `line-to`, `arc-to`, and `close-path` commands only;
- circle primitives only in addition to paths;
- visible `currentColor` fill or stroke and no arbitrary CSS values;
- stable unique names, deterministic order, fixed provenance, explicit direction, and explicit
  optional-use metadata; and
- rejection before output for unknown elements, commands, attributes, active content, external
  references, embedded text/styles, invisible geometry, or malformed envelopes.

Expanding the primitive set, coordinate policy, category vocabulary, paint language, provenance
model, or accepted input format is a contract revision with new adverse and visual evidence. The
tool does not parse or sanitize arbitrary SVG.

### Authenticated outputs

One validated immutable catalog generates exactly:

```text
packages/icons/src/generated/catalog.ts
tooling/icon-pipeline/generated/source-manifest.json
tooling/icon-pipeline/generated/output-manifest.json
tooling/icon-pipeline/generated/review-index.html
```

The runtime module contains only the stable name, direction metadata, and inert primitive data
needed by `@wayglass/icons`. It contains no accessible label because labels belong to each consumer
use, no domain meaning, and no generator import.

The source manifest records the contract/schema revision, stable record inventory, provenance,
direction, optional-use classification, and source fingerprint. The output manifest records the
exact generated-file inventory, SHA-256 hashes, and UTF-8 byte counts. Manifests never authenticate
themselves recursively.

The review index is deterministic, static, and script-free. It presents every glyph by name in
compact, standard, and prominent sizes, in light and dark themes, and in LTR and RTL contexts. It
identifies direction and optional-use metadata in text; includes named-reference, owning-control,
missing-icon, and icon-absent examples; and consumes accepted Wayglass token outputs. Private
mechanical layout constants must be documented in generator code and may not become meaningless
public tokens.

The production catalog initially remains exactly `close`, `menu`, `more`, and `refresh`. The
proof-only `arrow-inline-start` remains a test fixture and is not generated into the runtime
package.

## Runtime integration boundary

The generated data supports the accepted runtime contract without owning the element:

- `packages/icons/src/icon.ts` owns `WgIcon`, property reflection, accessibility, styling, direction
  resolution, rendering, and `defineWgIcon()`;
- `packages/icons/src/generated/catalog.ts` owns only reviewed inert catalog data;
- `packages/icons/src/index.ts` may re-export the same runtime symbols as a side-effect-free barrel;
  and
- `@wayglass/icons/icon` resolves to the component-specific module without a second implementation.

The migration must remove the implicit `more` fallback, implement decorative and labeled-image
modes, consume the accepted size tokens and styling hooks, mirror only records marked
`mirrors-in-rtl`, expose the `svg` part, and preserve no-focus/no-event/no-slot behavior. Those are
runtime obligations from the reconciliation, not behaviors generated from geometry.

A pure runtime direction helper may accept already reviewed record metadata so a synthetic
directional fixture can test `auto`, `ltr`, and `rtl` resolution without entering the production
catalog. Browser fixtures that exercise the same behavior remain test-only, outside package exports
and packed files.

## Command contract

The permanent implementation will expose two explicit root commands:

| Command                      | Effect                                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `pnpm icon-tooling:check`    | Validate source, generate all four outputs in memory, verify manifests and compare committed bytes, then write nothing |
| `pnpm icon-tooling:generate` | Validate and generate the exact four assigned outputs through the explicit writer                                      |

Commands MUST:

- resolve repository-owned inputs relative to their module location, not the launch directory;
- reject unknown options and accept `--help` without loading catalog source or writing files;
- emit stable, targeted diagnostics for validation and generated drift;
- use exit code `0` for success, `1` for validation/drift/integrity failure, and `2` for invalid
  invocation or unsupported environment;
- perform no network request, credential lookup, telemetry, publication, browser launch, or
  arbitrary plugin execution; and
- leave the working tree unchanged after `icon-tooling:check`.

The command names are private repository contracts. Renaming them still requires coordinated script,
documentation, and validation updates.

## Filesystem integrity and concurrency

Generation validates and renders the complete output set in memory before acquiring an exclusive,
non-replacing repository-local writer lock. It writes only contract-owned sibling staging files,
verifies their bytes and hashes, moves current destinations to exact tool-owned backups, atomically
renames each staged destination, and commits the output manifest last. An ordinary validation or
write failure restores the previous set and removes tool-owned staging and backup files.

A live or unverifiable lock fails safely and is never broken automatically. Documented recovery may
remove a stale lock only after confirming its recorded process is absent and the committed output
set verifies. Recovery touches only exact names owned by this contract, rejects traversal and
symlink escape, and preserves similarly prefixed or unknown files.

The output manifest is the accepted-set marker. Process interruption between atomic file renames may
leave a set that fails the next check but cannot be mistaken for accepted output. Power-loss
durability, distributed filesystems, and concurrent generation across hosts remain unsupported.

## Staged implementation authority

Implementation proceeds in reviewable stages:

**Stage 0 result:** Passed on August 29, 2026. The unchanged proof produced identical bytes and
diagnostics under Node 22.13.0 and pnpm 11.9.0 on Ubuntu 24.04.4. The retained
[minimum-environment evidence](https://github.com/Actesis/Wayglass/blob/main/experiments/phase-5d-icon-tooling/evidence/node-22-linux-validation.md)
also records the repository's separate clean-checkout bootstrap limitation. No production migration
occurred during validation.

0. run the unchanged accepted proof and its deterministic outputs on Node 22.13 and Linux; stop and
   revise this contract if the minimum environment changes bytes, diagnostics, or accepted behavior;
1. move only the canonical four-glyph catalog, source types, validator, pure generator, drift logic,
   and focused fixtures into `tooling/icon-pipeline/`;
2. add the explicit command, writer lock, staging, atomic replacement, recovery, and stable exit
   behavior;
3. generate and authenticate the exact four permanent outputs while retaining byte/geometry parity
   with the current four runtime glyphs;
4. add the `/icon` export and migrate `@wayglass/icons` to the reconciled runtime API over generated
   inert data, including unit, accessibility, direction, browser, Storybook, and package-boundary
   coverage;
5. wire the write-free check into ordinary repository validation and run minimum/current runtime,
   supported-browser, visual, accessibility, package, clean-build, and documentation matrices; and
6. remove the superseded inline catalog and executable proof only after retained evidence maps every
   accepted behavior to the permanent path.

Old and new catalog paths may coexist only behind exact geometry, name, and output parity checks.
They MUST NOT both write or own production data. A failed stage is reverted without widening the
catalog, source language, dependency graph, or runtime API to rescue implementation convenience.

## Compatibility and change policy

The tool supports the repository's declared minimum and current Node and pnpm versions. A runtime
floor change requires compatibility governance and corrected minimum-runtime evidence.

Changes to public icon names, geometry, labeling, size, direction, styling hooks, accessibility,
registration, entry points, or missing-icon behavior remain optional-runtime changes. The private
tool cannot approve them. Source-schema or generator changes require deterministic fixture
migration, manifest revision, security review, visual review, and runtime-output comparison.

Adding a glyph requires one reviewed generic need, application-owned meaning, non-domain catalog
eligibility, provenance, direction, optional-use review, visual inspection, generated drift, and
runtime tests. Repetition in one domain is not sufficient promotion evidence.

## Security, privacy, licensing, and provenance

- Inputs are reviewed repository source and deterministic fixtures; no customer or personal data is
  permitted.
- Commands use no credentials, network, analytics, arbitrary file discovery, dynamic code loading,
  or shell evaluation.
- Paths are fixed by contract; generation cannot choose an arbitrary destination or overwrite
  source.
- The validator rejects active and externally referenced vector content before generation.
- Generated runtime data and manifests retain Wayglass/Apache-2.0 provenance where the format
  supports it.
- No third-party icon, code, parser, or schema enters the tool without separate provenance, license,
  dependency, and maintenance review.
- Diagnostics contain stable identities and validation reasons, not arbitrary file contents or
  environment variables.

## Validation and completion gates

Permanent implementation is complete only when:

1. Node 22.13/Linux produces the accepted proof bytes and diagnostics before migration begins;
2. every production icon is accounted for exactly once in canonical source and generated runtime
   data;
3. source validation rejects the complete accepted adverse matrix without parsing arbitrary SVG;
4. repeated generation is byte-identical across supported Node environments, locale, time zone,
   launch directory, source order, and clean checkout;
5. one source change produces targeted drift in runtime data, manifests, and review output;
6. check/help/options/exit codes, locking, staging, replacement, interruption, recovery, traversal,
   symlink rejection, and cleanup are tested;
7. current production names and visible geometry remain exact unless a separate runtime change is
   approved;
8. the reconciled `name`, `label`, `size`, `direction`, accessibility, styling, registration, and
   missing-icon behaviors pass unit and supported-browser tests;
9. the static review passes theme, size, direction, forced-color, grayscale, text-scale, missing,
   and icon-absent review without depending on color or icon recognition;
10. foundation and icon-absent consumers receive no icon/tool export, registration, dependency,
    bundle, or support-floor change;
11. installed dependencies and lockfile remain unchanged;
12. documentation states authority, commands, contribution review, limitations, recovery, and
    removal behavior;
13. `pnpm icon-tooling:check`, `pnpm check`, supported-browser coverage, and `git diff --check`
    pass; and
14. retained evidence maps every gate to environment, method, result, limitation, reviewer, and
    date.

Passing these gates does not make the tool public, publish the package, or establish design-tool
compatibility.

## Non-goals and blocked claims

This contract does not authorize:

- an npm tool package, public CLI, public source schema, or supported authoring API;
- Figma, Tokens Studio, editor, import, export, synchronization, or plugin compatibility;
- bidirectional editing, generated-source acceptance, or design-tool authority;
- arbitrary SVG/XML input, sanitization, general vector conversion, optimization, animation, fonts,
  emoji, brands, domain catalogs, or automatic semantic naming;
- a public contribution workflow before an independent contributor completes the task;
- new dependencies, network access, credentials, telemetry, deployment, or publication; or
- a catalog expansion or runtime API change beyond the reconciled contract.

Phase 5D-B remains deferred. Any blocked capability requires its controlling charter, architecture,
dependency/security review, validation matrix, and explicit project-owner approval.

## Removal and rollback

Before permanent runtime migration, deleting `tooling/icon-pipeline/`, its root commands, and the
unconsumed generated candidate restores the current inline package unchanged. During migration,
version control and exact parity fixtures retain the last accepted inline implementation.

After migration, the canonical source and generated runtime data move together. The previous inline
catalog remains recoverable through version control and retained evidence; generated output never
becomes the only copy of geometry or meaning.

If implementation cannot meet the minimum environment, exact geometry, reconciled runtime API, write
safety, deterministic review, or isolation gates, stop the migration, retain adverse evidence,
restore the last accepted runtime, and revise or reject this contract rather than weakening its
requirements.
