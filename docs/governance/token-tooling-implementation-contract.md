# Token-tooling implementation contract

**Status:** Accepted by the project owner on August 24, 2026. This contract implements the accepted
artifact-candidate disposition in
[`P5B-TOKEN-INTERCHANGE-001`](./explorations/phase-5b-token-interchange.md). It authorizes no code
migration beyond its staged boundaries and does not approve a package, dependency, publication, or
compatibility claim.

## Purpose

Wayglass will have one private build-and-validation path that reads the reviewed token and mode
definitions, constructs one normalized semantic graph, and deterministically produces:

1. the existing foundation web artifacts; and
2. an explicitly requested, partial DTCG 2025.10-aligned exchange set for private downstream work.

The tool exists to make identity, semantics, aliases, modes, drift, and generated-output integrity
machine-checkable. It does not create a second authoring system or make interchange an application
runtime concern.

## Classification and ownership

| Field                     | Contract                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Artifact tier             | Build and validation tooling under [ADR 0031](../architecture/adr/0031-ecosystem-artifact-architecture.md) |
| Permanent source location | `tooling/token-interchange/`                                                                               |
| Package status            | Private repository tooling; not a pnpm workspace package and no npm manifest                               |
| Owner                     | Wayglass maintainers responsible for `@wayglass/tokens` and `@wayglass/themes`                             |
| Supported execution       | Repository-supported minimum and current Node and pnpm versions                                            |
| Runtime consumers         | None; generated foundation files remain dependency-free                                                    |
| External dependencies     | None accepted; Node and existing repository development dependencies are sufficient                        |
| Public API                | None; commands, modules, schemas, and exchange files remain private until separately promoted              |
| Version linkage           | Exact source commit, foundation version, tool contract revision, and pinned exchange baseline              |

Moving the artifact into `packages/`, creating `@wayglass/token-tools`, publishing a schema, or
supporting an external consumer requires a new reviewed proposal. Repository use alone does not
promote the tool.

## Source authority

The reviewed TypeScript definitions remain the only authoring authority:

- `packages/tokens/src/definitions.ts` owns token identities, types, descriptions, values, aliases,
  deprecations, and semantic roles;
- `packages/themes/src/definitions.ts` owns official theme and density override mappings; and
- reviewed web policy remains code-owned beside the generator that applies it.

The normalized graph, CSS, legacy flat JSON, exchange JSON, resolver data, manifests, hashes, and
release pointers are derived artifacts. They MUST NOT be accepted as authoring input. A generated
file edited by hand MUST be replaced by generation or rejected as drift.

Application brand overrides, product policy, provider data, design-tool changes, and non-web
platform conventions remain outside this source authority.

## Permanent architecture

### Private tooling boundary

`tooling/token-interchange/` will contain:

- source adapters that read only the reviewed token, theme, and density definitions;
- stable identity mapping and normalized-graph types;
- semantic, alias, mode, type, description, and deprecation validation;
- the existing web-artifact transform family;
- the partial DTCG 2025.10 exchange transform and resolver projection;
- artifact comparison, manifest, fingerprint, and verification functions;
- explicit filesystem writers and recovery logic;
- focused tests, adverse fixtures, and retained validation evidence; and
- a private README that states commands, ownership, limitations, and cleanup behavior.

Pure modules MUST have no import-time writes, registration, network access, telemetry, environment
mutation, process exit, wall-clock dependency, or global mutable state. Filesystem and process
behavior belongs only in explicit command and writer adapters.

Foundation source modules MUST NOT import from `tooling/`. Package build scripts MAY invoke an
explicit repository command, but generated runtime artifacts MUST NOT import, bundle, or require the
tool or any of its development dependencies.

### One normalized graph

One normalization pass will:

1. load the canonical definitions;
2. validate every identity and official override exactly once;
3. preserve reference, semantic, component, typography, motion, density, and mechanical roles;
4. keep condition, knowledge, activity, selection, and Boolean assertion separate;
5. retain typed alias edges, descriptions, deprecations, modes, and deterministic order; and
6. stop before output work when identity, reference, type, mode, or semantic validation fails.

Transforms consume this immutable graph. They may not infer semantic meaning from equal values,
flatten aliases into new authority, rename public identities, or silently omit unsupported data.

### Web-artifact transform family

The web path will preserve the current supported foundation surface:

- `packages/tokens/dist/tokens.css`;
- `packages/tokens/dist/tokens.json`;
- `packages/themes/dist/themes.css`; and
- the existing compiled TypeScript exports produced by package compilation.

CSS and legacy flat JSON are one compatibility family derived from the normalized graph. Existing
file names, CSS custom properties, selectors, cascade behavior, theme and density behavior,
serialization, trailing newlines, and public values MUST remain byte-for-byte stable unless a
separate foundation change explicitly approves a difference.

The tool does not own TypeScript compilation. It consumes compiled or source definitions through a
single documented repository build order and writes only the generated CSS and JSON files assigned
to it.

Forced-colors selectors, `color-scheme`, and other web-only behavior remain explicit web policy.
They MUST NOT be presented as portable exchange semantics.

### Private exchange transform

The exchange path remains an opt-in private artifact. It produces exactly:

```text
tokens.json
modes/density/comfortable.json
modes/density/compact.json
modes/theme/wayglass-dark.json
modes/theme/wayglass-light.json
resolver.json
wayglass-manifest.json
```

The manifest MUST identify the output as `partial-dtcg-2025.10-candidate` until new evidence changes
that status. It records the exact source commit, foundation version, contract revision, pinned DTCG
baseline, reversible identities, included and omitted items, omission reasons, file inventory,
SHA-256 hashes, and UTF-8 byte counts.

The current `ch` and `fr` limitations remain explicit omissions. A future mapping may reduce those
omissions only through a reviewed specification interpretation and regression evidence. The tool
MUST NOT coerce an unsupported value merely to increase coverage.

No exchange output is checked into a production package, included in `files`, published, deployed,
or described as conformant. A design tool or platform transform may consume a verified private
release only after its own accepted charter names the consumer and compatibility claim.

## Command contract

The implementation will expose explicit root commands with these responsibilities:

| Command                                                                                | Effect                                                                                                                          |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm token-tooling:check`                                                             | Validate source, generate all outputs in memory, compare web artifacts, verify exchange structure and hashes, and write nothing |
| `pnpm token-tooling:generate:web`                                                      | Generate only the assigned foundation CSS and legacy JSON files after validation                                                |
| `pnpm token-tooling:generate:exchange -- --source-revision <full-sha> --output <path>` | Create or replace one verified private exchange release at an explicit repository-local or temporary path                       |
| `pnpm token-tooling:verify -- --output <path>`                                         | Verify an existing private exchange release against its manifest without accepting it as source                                 |
| `pnpm token-tooling:measure -- --source-revision <full-sha>`                           | Run the informational current and 10× capacity fixture without imposing a release threshold                                     |

Exact option parsing may use existing Node APIs or a small owned parser. A CLI dependency is not
justified for this bounded surface.

Commands MUST:

- resolve repository-owned inputs relative to their module location rather than the launch
  directory;
- require an explicit output path for exchange writes;
- reject a source revision that is absent, malformed, or different from the checked-out commit;
- reject tracked source changes for authenticated generation and measurement;
- print stable, actionable diagnostics without secrets or arbitrary source content;
- use exit code `0` for success, `1` for validation, drift, or artifact-integrity failure, and `2`
  for invalid invocation or unsupported environment;
- support `--help` without loading source definitions or writing files; and
- perform no network request, credential lookup, telemetry, or implicit publication.

Private command names are repository contracts, not public APIs. Renaming them still requires
coordinated script, documentation, and CI updates.

## Filesystem integrity and concurrency

Web generation writes each assigned file to a sibling temporary path and atomically renames it only
after the full in-memory set passes validation. A failed generation MUST leave the previous accepted
files intact and remove tool-owned temporary files.

Exchange generation retains immutable content-addressed releases and an atomic `current.json`
pointer. The permanent writer adds a single-writer lock acquired without replacement. A live or
unverifiable lock fails safely with an actionable diagnostic; it is never broken automatically.
Documented recovery may remove a stale lock only after confirming its recorded process is absent and
the accepted pointer and release inventory verify.

Recovery may remove only names owned by this contract. It MUST preserve similarly prefixed or
unknown files, reject traversal and symlink escape, verify content before pointer replacement, and
leave the last accepted release available when staging or acceptance fails.

Atomic rename is the accepted process-interruption boundary on supported repository filesystems.
Power-loss durability, distributed filesystems, and concurrent generation across hosts remain
unsupported until separately tested.

## Build integration and migration

Implementation proceeds in reviewable stages:

1. move the accepted pure graph, identity, transform, comparison, and fixture logic from
   `experiments/phase-5b-token-interchange/` into `tooling/token-interchange/`;
2. add the command boundary, explicit option parsing, stable exit codes, and source-revision checks;
3. extend the web compatibility family to reproduce the existing flat `tokens.json` byte for byte;
4. add single-writer locking and the permanent filesystem recovery contract;
5. wire `token-tooling:check` into ordinary repository validation;
6. migrate the token and theme generated-file steps to the explicit web command while preserving
   package build order and exact output;
7. run the minimum/current runtime, deterministic, failure, capacity, package, browser, docs, and
   clean-build matrices; and
8. remove superseded compiler logic and the `experiments/phase-5b-token-interchange/` proof only
   after retained evidence shows the permanent path covers every accepted behavior.

During migration, old and new generators may coexist only behind exact parity tests. They MUST NOT
both write the same destination in one build. A failed stage is reverted without changing public
artifacts; it does not broaden the contract to rescue implementation convenience.

## Compatibility and change policy

The tool supports the repository's declared minimum and current Node and pnpm versions. A runtime
floor change follows repository compatibility governance and requires corrected minimum-runtime
evidence.

Changes to public token identities, meanings, aliases, CSS variables, selectors, file names, theme
or density behavior, or legacy JSON shape remain foundation changes. The private tool cannot approve
them. Changes to the normalized private schema or exchange projection require deterministic fixture
migration, manifest revision, limitations review, and downstream-consumer impact review.

The DTCG baseline stays pinned to 2025.10. A newer stable report is a compatibility proposal, not an
automatic upgrade. Supporting multiple baselines, configuration files, plugins, custom transforms,
or application token sources is outside this contract.

## Security, privacy, licensing, and provenance

- Inputs are reviewed repository source and deterministic synthetic fixtures; no customer or
  personal data is permitted.
- Commands use no credentials, network, analytics, subprocess shell evaluation, arbitrary code
  loading, or remote schemas.
- Paths are validated before creation; output stays within the explicit target and cannot overwrite
  repository source.
- Generated files carry the repository's Apache-2.0 licensing context, source attribution, exact
  revision, and contract metadata where the format supports it.
- No third-party code or schema is copied into the tool without a separate license and dependency
  review.
- Logs contain identities and validation reasons only as necessary; they do not dump arbitrary file
  contents or environment variables.

## Validation and completion gates

Implementation is complete only when:

1. every current token and official override is accounted for exactly once;
2. public web artifacts match the accepted baseline byte for byte;
3. one source change produces targeted, reviewed drift across the applicable outputs;
4. minimum/current Node and pnpm runs agree across locale, time zone, launch directory, input order,
   and repeated generation;
5. CLI help, options, exit codes, dry checks, overwrite protection, locking, interruption, recovery,
   path rejection, and cleanup are tested;
6. the private exchange inventory, partial status, omissions, manifest, and hashes verify;
7. production packages have no runtime dependency, export, registration, bundle, or support-surface
   change beyond their existing generated files;
8. installed dependency and lockfile inventory remain unchanged;
9. capacity evidence is refreshed without inventing a post hoc threshold;
10. documentation states source authority, commands, limitations, migration, and removal behavior;
11. `pnpm check`, authenticated fingerprinting, and `git diff --check` pass from a clean checkout;
    and
12. retained implementation evidence maps each gate to its environment, method, actual result,
    limitation, reviewer, and date.

The implementation PRs remain private repository work. Passing these gates does not make the
artifact publishable or the exchange externally compatible.

## Non-goals and blocked claims

This contract does not authorize:

- an npm package, public CLI, public JavaScript or TypeScript API, or supported schema;
- DTCG conformance or complete interchange;
- Figma, Tokens Studio, Style Dictionary, mobile, or other tool/platform compatibility;
- bidirectional editing, design-tool authority, automatic source rewriting, or round trips;
- application brand-token authoring, plugins, arbitrary configuration, or a general transform
  framework;
- new dependencies, network access, credentials, telemetry, deployment, or publication; or
- changing semantic meaning, public token identity, foundation support, or release policy.

Any such change requires the controlling Phase 5 charter, dependency review, architecture decision,
validation matrix, and explicit project-owner approval.

## Removal and rollback

Until permanent migration is accepted, deleting `tooling/token-interchange/` and restoring the
existing package generators is the rollback. After migration, the previous accepted generator
remains recoverable through version control and release evidence; generated files never become the
only copy of source meaning.

If implementation cannot meet exact web parity, source authority, safe writes, or runtime isolation,
stop the migration, retain adverse evidence, restore the prior generator, and revise or reject this
contract rather than weakening its gates.
