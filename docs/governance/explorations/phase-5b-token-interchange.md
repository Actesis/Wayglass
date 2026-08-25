# Phase 5B exploration: design-token interchange

## Record control

| Field              | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Record ID          | `P5B-TOKEN-INTERCHANGE-001`                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Roadmap track      | Phase 5B — Design-token interchange and platform transforms                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Lifecycle state    | `dispositioned`                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Revision           | `4`                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Owner              | Wayglass maintainers                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Evidence reviewers | Project owner and a Wayglass maintainer                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Created            | 2026-08-15                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Last reviewed      | 2026-08-24                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Target decision    | After the bounded proof and evidence review; no calendar deadline                                                                                                                                                                                                                                                                                                                                                                                                           |
| Related records    | [Phase 5 roadmap](../../phase-5.md), [ADR 0031](../../architecture/adr/0031-ecosystem-artifact-architecture.md), accepted [ADR 0033](../../architecture/adr/0033-private-token-tooling-architecture.md), accepted [implementation contract](../token-tooling-implementation-contract.md), [exploration contract](../ecosystem-exploration-record.md), [validation plan](../../accessibility/phase-5-validation-plan.md), and [release governance](../release-governance.md) |

### Decision question

What token-interchange model, if any, should Wayglass own so that one authoritative token system can
produce the existing web artifacts and a standards-aligned exchange artifact without inverting
semantics, creating a second source of truth, or imposing build tooling on runtime consumers?

### Revision history

| Revision | Date       | Change                       | Evidence still valid    | Approval                                |
| -------- | ---------- | ---------------------------- | ----------------------- | --------------------------------------- |
| 1        | 2026-08-15 | Initial proposal             | None                    | Accepted by project owner on 2026-08-15 |
| 2        | 2026-08-15 | Formal validation completed  | All revision 1 evidence | Prepared for project-owner disposition  |
| 3        | 2026-08-15 | Artifact candidate accepted  | All revision 2 evidence | Accepted by project owner on 2026-08-15 |
| 4        | 2026-08-24 | Permanent migration complete | All revision 3 evidence | Stage 8 approved by project owner       |

## User, task, and consequence

- **Credible user or maintainer:** a Wayglass maintainer evolving tokens and themes, followed by a
  design-tool or non-web transform maintainer consuming an exchange artifact.
- **Complete task:** change one token identity, value, alias, description, theme, or density mapping
  in one authoritative place and reproducibly generate every supported output with semantic drift
  reported before review.
- **Observed evidence:** `@wayglass/tokens` currently authors definitions in TypeScript and emits
  CSS plus flat JSON. `@wayglass/themes` separately authors theme and density alias maps and emits
  CSS. The JSON test deliberately claims only a “DTCG-shaped” result. The stable DTCG 2025.10 format
  forbids periods inside token and group names and represents colors and dimensions structurally, so
  the present flat keys and primitive values are not a DTCG conformance surface.
- **Current path:** maintainers edit `packages/tokens/src/definitions.ts`, sometimes edit
  `packages/themes/src/definitions.ts`, and rely on package-specific compilers and tests. Runtime
  consumers use TypeScript exports, `tokens.css`, `themes.css`, and CSS custom properties.
- **Gap and consequence:** no explicit interchange contract currently joins base tokens, theme and
  density modes, stable identity, deprecation, units, or standards version. A downstream tool could
  mistake convenient JSON for a portable source, flatten aliases, rename semantic roles, or create
  competing authoring authority.
- **Current truth and policy owners:** Wayglass owns token identity and semantics in reviewed
  source; `@wayglass/tokens` owns base definitions and generated base artifacts; `@wayglass/themes`
  owns official theme and density mappings; applications own brand overrides and product policy.
- **Domain context:** operational-interface semantics such as condition, knowledge, activity,
  selection, and asserted value remain separate. Platform names and design-tool concepts must not
  replace those roles.

## Boundary and artifact hypothesis

- **Provisional tier:** build and validation tooling. The existing token and theme packages remain
  foundation runtime artifacts.
- **Proposed Wayglass ownership:** a normalized, versioned interchange contract and deterministic
  one-way transforms derived from reviewed Wayglass token and mode sources.
- **Application ownership:** brand values, application-only tokens, rollout policy, and any
  application build integration.
- **External ownership:** DTCG owns its specifications; each design or platform tool owns import,
  storage, rendering, and proprietary concepts.
- **Consumers and support environment:** initially repository maintainers on the supported Node and
  pnpm range. No design tool, mobile platform, or third-party transformer is supported by this
  charter.
- **Potential public surface:** an accepted schema or documented generated exchange artifact. A new
  package, CLI, plugin, or public API is not presumed.
- **Dependency direction and isolation:** proof code may read foundation token and theme data at
  build time. Foundation runtime packages must not depend on a new transform package or its
  dependencies, and generated runtime files must remain dependency-free.
- **Registration and global behavior:** not applicable to Custom Element registration. Tools must
  have no import-time writes, network access, telemetry, environment mutation, or global state.
- **Version and compatibility unit:** any retained tool is independently versioned but declares the
  foundation range and interchange-spec version it supports. Existing foundation artifacts remain in
  the synchronized foundation family.
- **Non-goals:** Figma synchronization; bidirectional or visual authoring; Android, Apple, Flutter,
  or other platform support claims; application brand management; publishing; changing token
  meanings; broad token renaming; or exposing private mechanical constants as public tokens.
- **Removal path:** delete the private proof and generated fixtures, remove any proof-only manifest
  changes, and retain only this record plus evidence and disposition. Existing package outputs must
  remain unchanged.

## Gap analysis and comparison baseline

### Existing options

| Approach                                              | Capability and task fit                                                  | Accessibility                                                     | Security and privacy                                 | Performance and dependency cost                             | Maintenance and compatibility                                                            | Why it may be sufficient                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Keep the current compilers                            | Already produces all current runtime artifacts                           | Preserves the reviewed token semantics used for accessible states | Local and dependency-free                            | Lowest current cost                                         | No interchange or mode contract; JSON is not conformant DTCG 2025.10                     | Sufficient if no credible downstream exchange task exists             |
| Document current TypeScript and JSON only             | Makes ownership and limitations explicit without new code                | No behavioral change                                              | No new execution surface                             | Documentation-only                                          | Downstream tools must write Wayglass-specific adapters                                   | Sufficient if guidance prevents false portability claims              |
| Generate a standards-aligned projection in-repository | Can preserve code authority while providing a portable exchange boundary | Can retain semantic roles, descriptions, and non-color intent     | Deterministic local generation is feasible           | Adds schema and transform maintenance                       | Must map dotted identities, structured values, aliases, modes, and extensions explicitly | Candidate hypothesis for the bounded proof                            |
| Adopt an established transformer                      | May supply parsers, transforms, validation, and ecosystem compatibility  | Depends on preserved metadata and output behavior                 | Adds supply-chain and execution review               | Potentially less code but greater installed and update cost | Version and extension behavior may control Wayglass semantics                            | Sufficient only if dependency evidence beats a small owned projection |
| Create a separate Wayglass tool package               | Can isolate build-time APIs and future platform transforms               | Can enforce semantic rules centrally                              | Keeps runtime isolated but expands supported surface | Highest packaging and support cost                          | Requires independent compatibility, release, and support policy                          | Appropriate only after repeated consumers justify a package           |

### Gap statement

Wayglass lacks a truthful, versioned exchange representation spanning base tokens and official
modes. The smallest plausible Wayglass-owned solution is a generated projection with explicit
identity mapping—not a new authoring system or general token platform. The proof must show whether
that projection improves on documentation alone and whether an established transformer is necessary.

## Specification and dependency proposal

The comparison baseline is the stable Design Tokens Community Group 2025.10 reports:

- [technical-report index](https://www.designtokens.org/TR/2025.10/);
- [format module](https://www.designtokens.org/TR/2025.10/format/);
- [color module](https://www.designtokens.org/TR/2025.10/color/); and
- [resolver module](https://www.designtokens.org/TR/2025.10/resolver/).

These are stable Community Group reports, not W3C Standards. The proof pins `2025.10`; a later
report is new evidence, not a silent baseline update.

| Field                                             | Finding                                                                                                                                                                          |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package and version policy                        | None proposed for charter acceptance. Candidate transformers and validators are comparison subjects only.                                                                        |
| Placement                                         | Private proof code and fixtures only; no production dependency.                                                                                                                  |
| Missing existing capability                       | Node and current workspace code can build a bounded projection; the proof first establishes whether third-party parsing or validation is needed.                                 |
| License and notices                               | DTCG reports use the W3C Community Final Specification Agreement. Any code, schema, fixture, or package copied or installed requires a separate exact license and notice review. |
| Health, security, and update owner                | Not applicable until a named package is proposed; Wayglass maintainers own specification-version review.                                                                         |
| Installed, packed, bundled, and type cost         | Zero at charter acceptance. Candidate dependency costs must be measured before installation approval.                                                                            |
| Runtime and browser implications                  | None permitted; proof execution is build-time Node only.                                                                                                                         |
| Network, telemetry, scripts, globals, transitives | No network, telemetry, install scripts, or ambient writes are permitted in the proof.                                                                                            |
| Replacement and removal                           | Private proof is deletable without changing current outputs.                                                                                                                     |
| Proof-only approval                               | No dependency approved. Adding one revises this section before installation.                                                                                                     |

## Bounded proof

- **Single proof question:** can one normalized graph derived from the current reviewed token and
  theme sources produce both current web artifacts and a DTCG 2025.10-aligned exchange set while
  preserving identity, aliases, modes, and semantics deterministically?
- **Minimum implementation:** a private normalizer, validation diagnostics, and two transforms: (1)
  the current CSS custom-property and theme/density behavior, compared structurally and where
  practical byte-for-byte; and (2) nested DTCG 2025.10 format documents plus a resolver document for
  official theme and density contexts. A manifest records source commit, schema version, identity
  mapping, and output hashes.
- **Private location:** `experiments/phase-5b-token-interchange/`; no production barrel export,
  workspace package, VitePress runtime import, or release inventory entry.
- **Inputs and deterministic fixtures:** committed `tokens`, `themeTokenOverrides`, and
  `densityTokenOverrides`; synthetic fixtures for missing aliases, cycles, type mismatch, deprecated
  tokens, mode gaps, invalid identities, and unsupported value forms. No customer or personal data.
- **Canonical ownership:** the proof is strictly one-way: reviewed Wayglass source → normalized
  graph → generated artifacts. Generated JSON, CSS, resolver data, and future design-tool files are
  never authoring inputs.
- **Identity policy:** existing dotted Wayglass token names remain stable public identities. A
  reversible segment mapping produces nested DTCG paths because periods are forbidden inside DTCG
  names. CSS custom-property names remain the current `--wg-` projection. Collisions or ambiguous
  reverse mappings stop the proof.
- **Semantic policy:** reference, semantic, component, theme, density, motion, and typography roles
  remain explicit metadata. Condition, knowledge, activity, selection, and Boolean assertion may
  alias the same reference value but may not collapse into one role. Private mechanical constants
  remain absent.
- **Value policy:** colors, dimensions, durations, cubic Bézier values, fonts, weights, numbers,
  shadows, aliases, descriptions, and deprecations receive documented lossless mappings or an
  explicit unsupported diagnostic. CSS strings are not automatically claimed as DTCG values.
- **Comparison and measurements:** compare current compiler output, documented-only exchange, the
  owned projection, and at least one maintained transformer candidate. Record meaningful output
  diffs, elapsed time, peak memory, installed cost, diagnostics, and maintainer burden.
- **Test envelope:** repository-supported minimum and current Node/pnpm environments; dark and light
  themes; compact and comfortable density; forced-colors intent as non-token runtime policy; all
  current token types and alias chains; locale, time-zone, working-directory, and input-order
  variation.
- **External effects:** none. No credentials, network, publication, design-tool connection,
  analytics, generated file overwrite outside the experiment, or consumer mutation.
- **Retained evidence:** charter revision, commands, environment versions, output manifest and
  hashes, structural diffs, diagnostics, timings, dependency comparison, limitations, and final
  disposition.
- **Cleanup targets:** all experiment code and unaccepted outputs; temporary schemas; dependencies,
  lockfile changes, caches, and configuration introduced solely for the proof.
- **Bound:** one normalizer, the two named transforms, fixtures needed for the precommitted cases,
  and comparison research. No generalized plugin system, CLI framework, platform SDK, or design-tool
  integration.
- **Quality gates:** proof-focused tests, deterministic rebuild comparison, `git diff --check`, and
  `pnpm check`. Generated output must not dirty tracked production artifacts unexpectedly.

## Criteria fixed before work

### Success

1. Every current public token identity and official theme/density override has exactly one stable,
   reversible interchange identity, with aliases and descriptions preserved and no semantic-axis
   collapse.
2. The normalized graph produces the two named transforms deterministically across the test
   envelope; current CSS behavior has no unexplained meaningful drift.
3. The exchange documents satisfy the pinned DTCG 2025.10 format, color, and applicable resolver
   requirements, while all Wayglass extensions are namespaced, documented, optional, and preserved
   without being mistaken for standard fields.
4. Invalid references, cycles, collisions, missing modes, unsupported values, and overwrite or
   partial-output cases fail before committed output changes, with stable actionable diagnostics and
   nonzero status.
5. The projection requires no application-runtime dependency, no external service, and no second
   authoring path; measured build cost and maintenance surface are proportionate to current token
   generation.
6. Evidence shows the projection is materially clearer and safer for a downstream transform than the
   existing flat JSON or documentation alone. A package is proposed only if the evidence also
   demonstrates a distinct repeated consumer boundary.

Meeting these criteria starts disposition review; it does not accept a schema, package, dependency,
publication, or design-tool integration.

### Stop early

1. Stop if a lossless identity or value mapping would require changing public token meaning,
   collapsing semantic roles, making generated artifacts authoritative, or exporting private
   mechanical constants.
2. Stop if DTCG alignment requires a runtime dependency, network access, credentials, a design-tool
   account, or unapproved production-output changes.
3. Stop if the current compilers plus accurate documentation satisfy the complete credible task and
   the projection provides no reusable safety or interoperability benefit.

### Reject

1. Reject Wayglass-owned interchange when ordinary documentation or an established transformer can
   preserve the same ownership and semantics with lower permanent cost.
2. Reject a separate tool package without at least two independent real consumers or workflows.
3. Reject bidirectional synchronization, generated-source edits, implicit semantic inference from
   names, or any mapping that treats reference color equality as semantic equivalence.
4. Reject a conformance claim when the pinned specification cannot represent a current required
   value or mode without undocumented loss.

### Defer

| Missing evidence or prerequisite          | Owner                | Decision impact                                                                                 | Objective review trigger                                          | Earliest review                    |
| ----------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------- |
| Named target design tool and access model | Phase 5D owner       | Blocks design-artifact compatibility and synchronization claims, not this format proof          | Accepted Phase 5D charter                                         | Phase 5D                           |
| Non-web platform consumer                 | Project owner        | Blocks Apple, Android, Flutter, or other platform support and may block a separate tool package | Named application and maintainer commit to an actual transform    | After Phase 5B disposition         |
| Superseding DTCG report                   | Wayglass maintainers | May require mapping or compatibility revision                                                   | New stable Community Group report materially changes used modules | At release or compatibility review |

### Revise charter when

Revise before continuing if the canonical source, supported specification version, output set,
artifact tier, dependency class, public surface, proof location, design-tool access, platform
target, round-trip direction, success threshold, or network and credential policy changes.

## Evidence plan and results

| Evidence ID | Category                     | Environment and versions                                             | Fixture or data                                                                                 | Method and expected result                                                                                 | Actual result and artifact                                                                                                                                                                                                                                                                                                                                                                                                                                     | Reviewer and date                   | Limitation                                 | Decision impact                      |
| ----------- | ---------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------ | ------------------------------------ |
| `P5B-E01`   | Task and ownership           | Current repository and supported Node/pnpm range                     | Current token, theme, and density sources                                                       | Complete one-source change through both outputs; compare documentation-only and owned-projection paths     | [Formal validation](https://github.com/Actesis/Wayglass/blob/main/tooling/token-interchange/evidence/phase-5b-proof/formal-validation.md): pass; one authoritative value change reaches both outputs with targeted drift and stable identity                                                                                                                                                                                                                   | Prepared 2026-08-15; review pending | No external consumer claim                 | Supports disposition review          |
| `P5B-E02`   | Public surface and isolation | Clean workspace build                                                | Package graph and generated artifacts                                                           | Prove no runtime dependency, export, registration, or production-package side effect                       | [Formal validation](https://github.com/Actesis/Wayglass/blob/main/tooling/token-interchange/evidence/phase-5b-proof/formal-validation.md): pass; private experiment has no runtime dependency, export, registration, or production artifact                                                                                                                                                                                                                    | Prepared 2026-08-15; review pending | Private proof only                         | Supports disposition review          |
| `P5B-E03`   | Semantic fidelity            | All current definitions plus adverse fixtures                        | Identity, type, alias, role, mode, description, and deprecation mappings                        | Account for every source item exactly once; reject loss and collisions                                     | [Formal validation](https://github.com/Actesis/Wayglass/blob/main/tooling/token-interchange/evidence/phase-5b-proof/formal-validation.md): pass; 528 identities and 197 overrides are accounted for with roles and axes preserved; adverse loss cases fail                                                                                                                                                                                                     | Prepared 2026-08-15; review pending | Visual similarity is not evidence          | Supports disposition review          |
| `P5B-E04`   | DTCG compatibility           | Pinned 2025.10 format, color, and resolver reports                   | Generated exchange set and conformance fixtures                                                 | Validate required structure, types, references, nested names, and resolver contexts                        | [Formal validation](https://github.com/Actesis/Wayglass/blob/main/tooling/token-interchange/evidence/phase-5b-proof/formal-validation.md): qualified pass; the internally validated representable subset includes 524 tokens and all overrides, with four explicit omissions                                                                                                                                                                                   | Prepared 2026-08-15; review pending | No conformance or tool-import claim        | Supports disposition with limitation |
| `P5B-E05`   | Web compatibility            | Supported browser/build matrix through existing suites               | Generated base, theme, and density CSS                                                          | Structural and behavioral comparison with no unexplained meaningful drift                                  | [Formal validation](https://github.com/Actesis/Wayglass/blob/main/tooling/token-interchange/evidence/phase-5b-proof/formal-validation.md): pass; base and theme/density CSS match byte for byte and existing browser/build gates pass                                                                                                                                                                                                                          | Prepared 2026-08-15; review pending | Does not add browser support               | Supports disposition review          |
| `P5B-E06`   | Determinism and drift        | Minimum/current Node; varied locale, time zone, cwd, and input order | Repeated normalized builds                                                                      | Identical manifest and hashes; meaningful source changes produce stable targeted drift                     | [Formal validation](https://github.com/Actesis/Wayglass/blob/main/tooling/token-interchange/evidence/phase-5b-proof/formal-validation.md): pass; four environment cases share one authenticated fingerprint, reversed input is stable, and source drift is targeted                                                                                                                                                                                            | Prepared 2026-08-15; review pending | One macOS/APFS host only                   | Supports disposition review          |
| `P5B-E07`   | Failure and recovery         | Current Node                                                         | Invalid aliases, cycles, types, identities, modes, values, overwrite, and interruption fixtures | Fail before accepted output replacement; stable diagnostics and cleanup                                    | [Formal validation](https://github.com/Actesis/Wayglass/blob/main/tooling/token-interchange/evidence/phase-5b-proof/formal-validation.md): pass in the simulated envelope; invalid inputs fail and staged or orphaned writes recover without replacing accepted output                                                                                                                                                                                         | Prepared 2026-08-15; review pending | No power-loss or concurrent-writer proof   | Supports disposition with limitation |
| `P5B-E08`   | Performance and capacity     | Minimum/current Node                                                 | Current corpus and 10× synthetic corpus                                                         | Record repetitions, warm/cold timing, peak memory, and output size; no threshold invented after results    | [Node 26](https://github.com/Actesis/Wayglass/blob/main/tooling/token-interchange/evidence/phase-5b-proof/capacity-node-26-macos.md) and [Node 22.13](https://github.com/Actesis/Wayglass/blob/main/tooling/token-interchange/evidence/phase-5b-proof/capacity-node-22-13-macos.md) pass; [Node 22.12](https://github.com/Actesis/Wayglass/blob/main/tooling/token-interchange/evidence/phase-5b-proof/capacity-node-22-macos.md) is retained adverse evidence | Prepared 2026-08-15; review pending | Synthetic single-machine scale             | Supports disposition review          |
| `P5B-E09`   | Dependency and maintenance   | Research environment; no repository install                          | Style Dictionary 5.5.1 and `@tokens-studio/sd-transforms` 2.0.3                                 | Compare capability, license, health, security, install/bundle/type cost, scripts, transitives, and removal | [Exact-version comparison](https://github.com/Actesis/Wayglass/blob/main/tooling/token-interchange/evidence/phase-5b-proof/transformer-candidate-comparison.md): pass; Style Dictionary is eligible for a future isolated prototype, but no dependency is adopted                                                                                                                                                                                              | Prepared 2026-08-15; review pending | Published metadata only; no parity run     | Supports disposition review          |
| `P5B-E10`   | Documentation and cleanup    | Documentation build and clean worktree                               | Contract, limitations, generated manifest, and cleanup list                                     | Build links and samples; verify unsupported claims and remove unaccepted proof artifacts                   | [Documentation and cleanup validation](https://github.com/Actesis/Wayglass/blob/main/tooling/token-interchange/evidence/phase-5b-proof/documentation-and-cleanup-validation.md): pass; links, sample contract, claim boundaries, isolation, and residue cleanup are verified                                                                                                                                                                                   | Prepared 2026-08-15; review pending | Publication and disposition remain blocked | Supports disposition review          |

Accessibility interaction and assistive-technology rows are not applicable to the private build tool
because it has no user interface. Semantic accessibility is required in `P5B-E03` and `P5B-E05`:
state meanings, forced-color runtime ownership, focus roles, and non-color distinctions must survive
or be explicitly outside the exchange format. Security and privacy are addressed by local
deterministic inputs, no network or credentials, dependency evidence, safe writes, and cleanup. A
UI, service, credential, or live design-tool connection requires charter revision and its applicable
validation rows.

### Deviations and adverse evidence

- **Resolved runtime mismatch:** Wayglass formerly declared Node `>=22.12.0` while pinned pnpm
  `11.9.0` required Node `>=22.13.0`. The Node 22.12 capacity run invoked the committed Vitest CLI
  directly and remains historical adverse evidence. Commit
  `29bfc5a9150973a6152c72b06db82d28ba970df3` raised the repository floor to Node `>=22.13.0`; an
  authenticated Node 22.13 run then verified both pinned-pnpm startup and capacity behavior at the
  corrected supported minimum.

### Claims not supported

The completed evidence does not support claims of DTCG conformance, design-tool compatibility,
mobile-platform support, round-trip editing, public package readiness, publication, deployment, or a
permanent canonical schema. Those claims require a corresponding disposition and later scoped
evidence.

## Disposition

- **Outcome:** Accept artifact candidate.
- **Decision date and approver:** 2026-08-15, project owner.
- **Reasoning:** The private proof demonstrates that a Wayglass-owned normalized graph and one-way
  transforms provide enforceable identity preservation, semantic checks, deterministic generation,
  targeted drift reporting, and safer failure behavior that documentation alone cannot provide. The
  candidate produces the current web artifacts without meaningful drift and a truthful partial
  exchange artifact without making generated output authoritative. The evidence supports a narrow
  build-and-validation artifact, but not a package or interoperability promise.
- **Retained ownership and boundaries:** Wayglass maintainers own the candidate normalized contract,
  validation policy, and deterministic transforms as build and validation tooling. Reviewed
  TypeScript token and mode definitions remain authoritative. Foundation runtime packages,
  application brand policy, DTCG specifications, design-tool imports, and non-web platform
  transforms remain outside this candidate's ownership.
- **Known limitations:** The exchange includes 524 of 528 tokens and explicitly omits four
  unrepresentable dimensions; it is not DTCG-conformant or externally validated. No design tool,
  non-web platform, or independent consumer has used it. Cross-runtime evidence covers one
  macOS/APFS host, and writer recovery uses controlled interruption fixtures rather than power-loss
  or concurrent-writer tests.
- **Follow-up authorized:** prepare a separate
  [implementation contract](../token-tooling-implementation-contract.md) and consequential
  [ADR 0033](../../architecture/adr/0033-private-token-tooling-architecture.md) for a private
  in-repository build-and-validation artifact. That proposal may define how the accepted normalized
  graph and one-way web and exchange transforms replace duplicated generation paths. It may not
  create a public package, schema, dependency, or compatibility claim without another explicit
  decision.
- **Remaining approvals and gates:** require an actual external consumer before proposing package
  status; repeat dependency review before adoption; and satisfy release governance before any
  publication or public support claim. The private placement, ownership, compatibility, and
  migration gates are complete under the accepted contract and ADR 0033.
- **Cleanup completed:** Temporary runtimes, downloaded archives, candidate dependencies, generated
  output, and caches are removed. Stage 8 removed the executable private proof after permanent
  coverage passed; its historical evidence is retained under
  `tooling/token-interchange/evidence/phase-5b-proof/` and remains outside production packages.

This disposition accepts only a private artifact candidate. It does not authorize permanent
implementation, package creation, publication, Figma synchronization, design-tool compatibility,
platform support, deployment, or a DTCG conformance claim.
