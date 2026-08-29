# Phase 5D-A exploration: icon source and validation tooling

## Record control

| Field              | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Record ID          | `P5D-ICON-TOOLING-001`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Roadmap track      | Phase 5D-A — Icon source and validation tooling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Lifecycle state    | `charter-accepted`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Revision           | `1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Owner              | Wayglass maintainers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Evidence reviewers | Project owner and a Wayglass maintainer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Created            | 2026-08-28                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Last reviewed      | 2026-08-28                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Target decision    | After the bounded private proof and evidence review; no calendar deadline                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Related records    | [Phase 5 roadmap](../../phase-5.md), [ecosystem-exploration contract](../ecosystem-exploration-record.md), [ADR 0031](../../architecture/adr/0031-ecosystem-artifact-architecture.md), [ADR 0033](../../architecture/adr/0033-private-token-tooling-architecture.md), [foundation delivery ADR](../../architecture/adr/0011-foundation-delivery-model.md), [foundation contracts](../../foundations/foundation-contracts.md), [visual foundations ADR](https://github.com/Actesis/Wayglass/blob/main/docs/architecture/adr/0007-visual-foundations.md), and [Phase 5 validation plan](../../accessibility/phase-5-validation-plan.md) |

### Decision question

What source, validation, preview, and generation behavior, if any, should Wayglass own so a
maintainer can safely add or revise a domain-neutral icon without hand-synchronizing runtime code,
metadata, review evidence, and generated exports?

### Revision history

| Revision | Date       | Change           | Evidence still valid | Approval                                |
| -------- | ---------- | ---------------- | -------------------- | --------------------------------------- |
| 1        | 2026-08-28 | Initial proposal | None                 | Accepted by project owner on 2026-08-28 |

## User, task, and consequence

- **Credible user or maintainer:** a Wayglass maintainer reviewing a proposed domain-neutral control
  icon and the consumer who needs the same reviewed glyph behavior from `@wayglass/icons` without
  receiving a domain catalog or authoring dependency.
- **Complete task:** add one synthetic directional control glyph and revise one existing
  non-directional glyph; verify stable identity, safe SVG content, view box, geometry, optical
  alignment, stroke/fill policy, direction behavior, accessible-use metadata, deterministic runtime
  output, and a reviewable preview; then prove that malformed or semantically ambiguous input cannot
  replace the last accepted output.
- **Observed evidence:** `@wayglass/icons` currently contains four useful domain-neutral glyphs—
  `close`, `menu`, `more`, and `refresh`—as inline Lit templates. The names, geometry, rendering,
  and accessibility behavior share one source file, so there is no independent catalog record,
  generated-file check, import boundary, drift signal, optical review index, or direction metadata.
  The current tests cover catalog size, one domain rejection, and side-effect-free registration.
- **Existing contract drift:** the accepted foundation contract describes an `/icon` export,
  `label`, `size`, and `direction` properties, named-image behavior, and explicit directional
  mirroring. The current package exports only its root, always makes `wg-icon` decorative, and
  implements only `name`. This charter does not silently bless either side or repair production
  runtime behavior; the proof must inventory the mismatch and any later implementation decision must
  reconcile it explicitly.
- **Current path:** a maintainer edits `iconNames`, an inline render map, tests, and consumer
  examples by hand. Visual review occurs through component stories rather than a catalog-specific
  artifact.
- **Gap and consequence:** ordinary TypeScript catches some name errors but cannot enforce SVG trust
  rules, stable source identity, direction metadata, optical bounds, catalog policy, deterministic
  alternate outputs, or source-to-preview drift. Adding icons at scale could therefore normalize
  inconsistent geometry, unsafe markup, domain-specific meaning, or a second accessible-name owner.
- **Current truth and policy owners:** Wayglass maintainers own the reviewed generic catalog,
  runtime contract, metadata, generated output, and release decision. Applications own icon use,
  visible text, control labels, domain meaning, and whether an optional icon is appropriate. The
  browser owns SVG rendering and accessibility APIs.
- **Domain context:** the synthetic directional glyph exercises mirroring without adding navigation,
  device, provider, brand, or product vocabulary to the generic catalog.

## Boundary and artifact hypothesis

- **Provisional tier:** build and validation tooling. The existing `@wayglass/icons` package remains
  a separately versioned optional runtime and is an output/consumer under audit, not part of the
  tool's tier.
- **Proposed Wayglass ownership:** a private canonical icon record; strict validation; deterministic
  generation of runtime catalog data and a review artifact; drift detection; and actionable
  diagnostics for the accepted generic catalog policy.
- **Application ownership:** icon selection, surrounding text, accessible names on owning controls,
  domain catalogs, routes, commands, state, and policy.
- **External ownership:** browsers own SVG rendering; authoring tools own their editing UI and file
  formats; Figma owns its document, component, API, and permission behavior. None becomes source
  authority through this proof.
- **Consumers and support environment:** repository maintainers on the supported Node and pnpm
  range; generated runtime output is inspected through current Chromium, Firefox, and WebKit. The
  proof claims no external editor or design-tool compatibility.
- **Potential public surface:** none. A successful result may propose permanent private tooling
  under `tooling/icon-pipeline/`. It does not authorize `@wayglass/icon-tools`, a new runtime
  export, a Figma plugin, or publication.
- **Dependency direction and isolation:** private tooling may read an authored icon source and
  public foundation/token contracts. Runtime packages never import the tool, and generated runtime
  output contains no generator code or generator dependency.
- **Registration and global behavior:** the tool registers no Custom Element and mutates no browser
  global. The retained runtime continues explicit duplicate-safe registration. Imports perform no
  generation, filesystem write, network request, telemetry, timer, or environment mutation.
- **Version and compatibility unit:** private tooling has no public version. If later accepted, its
  generated runtime output follows the independently versioned `@wayglass/icons` compatibility
  record; review artifacts record the exact source and foundation revisions.
- **Non-goals:** growing the catalog for its own sake; domain, brand, provider, or franchise icons;
  remote URLs; arbitrary consumer SVG; icon fonts; emojis; animated icons; a general vector editor;
  automated semantic naming; icons as required state meaning; changing control accessibility;
  repairing the existing runtime contract under this proposed charter; Figma variables, components,
  plugins, synchronization, or bidirectional authoring; npm publication; or deployment.
- **Removal path:** delete the private proof, generated fixtures, preview, and proof commands;
  retain the charter, inventory, and disposition. No production package, export, lock entry, or
  generated foundation artifact changes before a separate accepted implementation contract.

## Gap analysis and comparison baseline

### Existing options

| Approach                                      | Capability and task fit                                                                          | Accessibility                                                                                           | Security and privacy                                                               | Performance and dependency cost                                     | Maintenance and compatibility                                                                  | Why it may be sufficient                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Keep the current inline TypeScript catalog    | Completes today's four-glyph task with direct review and no generator                            | Runtime behavior is inspectable, but accessible-use and direction metadata are not catalog records      | No import parser or new trust boundary                                             | Lowest build cost and no new dependency                             | Every catalog change remains a coordinated source/test/story edit                              | Sufficient if the catalog remains tiny and drift is cheaper than tooling          |
| Publish contribution and review guidance only | Can define naming, geometry, safety, direction, and optical rules                                | Makes anti-use rules explicit but cannot enforce them                                                   | No executable input boundary                                                       | Documentation cost only                                             | Reviewers manually apply every rule and output change                                          | Sufficient if enforcement would add more maintenance than it removes              |
| Private dependency-free source and generator  | Can validate a deliberately narrow authored data model and emit runtime data plus a review index | Metadata and preview can expose decorative/named-use, RTL, missing-icon, and icon-absent cases          | Local reviewed data only; rejects executable or external SVG features              | Small owned build surface; no install or supply-chain addition      | Wayglass owns parsing of its narrow record, geometry checks, output stability, and diagnostics | Sufficient if a narrow model covers the catalog without becoming an SVG processor |
| Established SVG optimizer or icon pipeline    | May import and normalize broader editor-produced SVG and reuse mature transforms                 | Still requires Wayglass semantic metadata and review rules                                              | Parses richer untrusted input and adds package/script/transitive review            | Proof and permanent dependency costs require exact-version evidence | Upstream configuration and output changes become compatibility obligations                     | Consider only if the no-dependency proof cannot safely complete the task          |
| Designer-facing Figma library or plugin       | Can provide design-context search, preview, components, and handoff                              | Requires target-tool review of labels, non-color meaning, focus intent, direction, and absence behavior | Adds account, permission, sharing, backup, API, and possibly credential boundaries | Separate design artifact and integration maintenance                | Version linkage and drift must be proved in Figma                                              | Belongs to Phase 5D-B and cannot answer the icon-source tooling question alone    |

### Gap statement

The platform and current package can render reviewed icons, but they do not provide a shared,
machine-enforced contract for authoring identity, permitted vector content, direction metadata,
optical review, deterministic outputs, and drift. Wayglass may be the right owner because those
rules define the official generic catalog and its runtime compatibility. The proof must still show
that enforcement is materially safer than a four-icon hand-maintained file.

## Dependency proposal

Revision 1 authorizes no new dependency. The first comparison uses Node, TypeScript, repository
test/build dependencies, and a deliberately narrow authored data model rather than parsing arbitrary
editor SVG. An established SVG package may be screened read-only, but installation or executable use
requires a charter revision with an exact dependency record.

| Field                                             | Finding                                                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Package and version policy                        | None in revision 1                                                                              |
| Placement                                         | Not applicable                                                                                  |
| Missing existing capability                       | The proof asks whether strict project-owned records and current platform/tooling are sufficient |
| License and notices                               | Repository Apache-2.0 applies to proof source; no third-party artifact is added                 |
| Health, security, and update owner                | Wayglass maintainers own the bounded proof; no upstream owner is introduced                     |
| Installed, packed, bundled, and type cost         | Zero dependency delta; measure generated runtime and private tool source/output instead         |
| Runtime and browser implications                  | Generated runtime must not change the existing browser floor or require the tool                |
| Network, telemetry, scripts, globals, transitives | No network, telemetry, install script, global mutation, or new transitive graph                 |
| Replacement and removal                           | Delete the private proof and commands; production packages remain unchanged                     |
| Proof-only approval                               | Accepted by the project owner on 2026-08-28 for revision 1 only                                 |

## Bounded proof

- **Single proof question:** can a narrow dependency-free source, validator, generator, and preview
  make the complete icon-contribution task materially safer and less drift-prone than the current
  inline catalog without expanding runtime or design-tool authority?
- **Minimum implementation:** one private canonical record containing the four current glyphs, one
  synthetic directional glyph, and one revised-glyph fixture; pure validation and generation; one
  runtime-catalog candidate output; one static review index; source/output manifests; and adverse
  fixtures. Production `@wayglass/icons` is comparison input only.
- **Private location:** `experiments/phase-5d-icon-tooling/`; no workspace package, production
  barrel, runtime import, documentation deployment, or design-tool file.
- **Inputs and deterministic fixtures:** reviewed repository-local synthetic vector records with
  stable IDs, `0 0 24 24` view boxes, declared directionality, stroke/fill intent, and provenance.
  Adverse fixtures cover duplicate/renamed IDs, unknown metadata, out-of-bounds geometry, malformed
  commands, non-finite values, embedded text/style/script, event attributes, external references,
  unsupported elements, hidden content, and non-deterministic ordering.
- **Comparison and measurements:** perform the same add/revise task manually and through the proof;
  compare files and decisions touched, diagnostics, generated drift, source inventory, review
  coverage, tool-owned lines, output bytes, and warm/cold generation across 50 runs. Use a synthetic
  500-glyph capacity fixture without treating it as catalog demand.
- **Test envelope:** minimum Node 22.13 and current Node; supported pnpm; macOS and one CI Linux
  environment when available; generated review index in Chromium, Firefox, and WebKit at compact,
  standard, and prominent sizes; light/dark, forced colors, 200% text, RTL, grayscale, and icon-
  absent review. No Figma or other design-tool claim.
- **External effects:** repository-local reads and private temporary writes only. No network,
  credentials, personal data, customer assets, analytics, clipboard, deployment, publication, remote
  schema, plugin execution, or external mutation.
- **Retained evidence:** charter revisions, current contract/runtime inventory, fixture manifest,
  task comparison, deterministic hashes, adverse diagnostics, capacity measurements, preview review,
  dependency screen if performed, deviations, limitations, and disposition.
- **Cleanup targets:** private proof, generated preview/runtime candidates, temporary manifests,
  caches, profiles, traces, and commands not accepted by disposition.
- **Bound:** five positive glyph fixtures, no curves or transforms beyond those required by the
  current catalog and synthetic directional case, one runtime candidate shape, one review index, no
  production write, no general SVG import, and no design-tool connection.
- **Quality gates:** proof typecheck/tests; deterministic generation and no-write drift check;
  adverse-fixture suite; browser preview matrix and Axe; secret/network/dependency/export checks;
  `pnpm check`; docs build; `git diff --check`; and clean removal verification.

## Criteria fixed before work

### Success

1. The proof completes the add/revise task from one source and accounts for every name, vector node,
   metadata field, and generated byte without changing production packages or requiring manual edits
   to either candidate output.
2. Validation rejects every adverse fixture before replacing accepted output, with stable diagnostic
   codes and no partial files; repeated generation is byte-for-byte deterministic across the named
   Node, locale, time-zone, current-working-directory, and input-order cases.
3. The preview and structured evidence make view box, optical bounds, stroke/fill, size, direction,
   forced-color behavior, missing-glyph behavior, and optional/decorative semantics reviewable while
   the complete task remains understandable with every icon absent.
4. The generated runtime candidate adds no runtime dependency, registration side effect, global,
   network behavior, or browser-floor change; a clean non-icon consumer retains its install and
   bundle graph.
5. The 500-glyph fixture completes within 2 seconds and 256 MiB peak process growth on the named
   desktop in every one of 50 runs, and accepted output changes only for the intentionally changed
   glyph and manifest metadata.
6. The maintainer can explain and remove the complete tool boundary, and the measured reduction in
   synchronized manual decisions justifies the permanent validation/generation surface over guidance
   and the current inline file.

Meeting these criteria starts disposition review; it does not approve production migration, package
status, Figma work, or publication.

### Stop early

1. Stop if the narrow data model cannot represent the accepted current catalog or directional case
   without becoming a general SVG parser, silently changing geometry, or accepting active/external
   content.
2. Stop if the generated runtime cannot preserve explicit registration, optional icon meaning,
   current browser behavior, and zero generator dependency leakage.
3. Stop if resolving the existing foundation-contract drift would require choosing a new public
   runtime API inside this tooling proof.
4. Stop before importing or executing an SVG/tooling dependency that lacks an accepted charter
   revision and exact dependency record.

### Reject

1. Reject build-tool ownership if guidance plus the current inline catalog completes the task with
   fewer synchronized decisions and lower credible maintenance cost.
2. Reject a general import/optimization pipeline if the official catalog does not require its
   broader syntax, transforms, dependency graph, or security surface.
3. Reject any source model that infers semantic names, accessible labels, direction, domain meaning,
   or state from geometry.
4. Reject production-package or public-tool placement without an accepted implementation contract,
   architecture decision, maintainer, and repeated real workflow evidence.

### Defer

| Missing evidence or prerequisite                               | Owner                                        | Decision impact                                                                                                     | Objective review trigger                                                                                             | Earliest review                    |
| -------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Reconciled `@wayglass/icons` runtime contract                  | Project owner and runtime maintainer         | Blocks production generation or runtime migration, not the private tooling comparison                               | A separate review decides the accepted foundation contract versus current implementation drift                       | Before any implementation contract |
| Independent icon contribution workflow                         | Project owner                                | Blocks a public icon-tool package and broad contribution claim                                                      | A named contributor or consuming project completes the same add/revise task                                          | After private disposition          |
| Named Figma workspace, access model, and exact target versions | Project owner and design-artifact maintainer | Blocks Phase 5D-B proof, Figma compatibility, synchronization, and design-library claims; does not block Phase 5D-A | A controlled Wayglass Figma workspace, reviewer, permission/backup policy, and supported version range are available | Phase 5D-B charter review          |
| Representative designer review                                 | Project owner                                | Blocks design-workflow usability claims                                                                             | A named designer can review the generated or auditable mapping in the target tool                                    | Phase 5D-B evidence                |

### Revise charter when

Revise before continuing if the source format, supported SVG subset, catalog task, production
output, proof location, dependency class, package boundary, design-tool scope, network or credential
use, public surface, runtime contract, browser/runtime matrix, capacity envelope, or success
threshold changes materially.

## Evidence plan and results

Provider, framework-binding, credential, deployment, and live design-tool matrices are not
applicable to Phase 5D-A because the proof is private, local, dependency-free, and has no provider,
framework, account, design file, or network effect. Phase 5D-B requires its own design-artifact
charter and the full design-artifact matrix.

| Evidence ID | Category                                      | Environment and versions                                     | Fixture or data                                                    | Method and expected result                                                                                              | Actual result and artifact                                                                                                                                                                                                                                                                                                                                                                                            | Reviewer and date                     | Limitation                                                           | Decision impact                                                    |
| ----------- | --------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `P5D-A-E01` | Current contract and task baseline            | Repository at `554fb79` and `21392f6`; Node 26.4.0           | Four current icons, accepted contracts, add/revise dry run         | Inventory source, exports, APIs, metadata, consumers, tests, and drift; complete add/revise task manually               | [Pass: inventory covers the current package and contract drift; an exact in-memory manual run changes two files and four synchronized representations but cannot complete direction, accessible-use, or dedicated-review requirements without new surfaces](https://github.com/Actesis/Wayglass/blob/main/experiments/phase-5d-icon-tooling/evidence/maintenance-and-task-comparison.md)                              | Codex runs, 2026-08-28 and 2026-08-29 | Dry run; production remains unchanged                                | Shows guidance/current inline source cannot complete the full task |
| `P5D-A-E02` | Source identity and semantic ownership        | Node 26.4.0; TypeScript 6.0.3; Vitest 4.1.10                 | Five positive structured records plus adverse mutations            | Account for every field; preserve optional meaning; reject inferred names, labels, direction, or domain policy          | [Partial automated pass: immutable structured model accounts for the current names plus one directional fixture; nine tests reject invalid identity, fields, semantics, vector kinds, paint, geometry, and envelopes](https://github.com/Actesis/Wayglass/blob/main/experiments/phase-5d-icon-tooling/)                                                                                                               | Codex run, 2026-08-28                 | Domain neutrality remains human review                               | Supports continuing to deterministic generation and drift proof    |
| `P5D-A-E03` | Generated runtime compatibility and isolation | Node 26.4.0; Vite 8.1.5; Chromium, Firefox, WebKit           | Runtime descriptor candidate plus clean no-icon core consumer      | Compare render and package boundaries; require zero dependency, export, registration, global, and browser-floor leakage | [Automated pass: current geometry survives the pure generated-data adapter; direction remains explicit; candidate and no-icon bundle graphs exclude tooling and icon leakage; direct imports in all three current engines add no registration or global](https://github.com/Actesis/Wayglass/blob/main/experiments/phase-5d-icon-tooling/evidence/runtime-compatibility-and-isolation.md)                             | Codex run, 2026-08-29                 | Private candidate, not package migration or historical-browser proof | Supports completing security, removal, and maintenance comparison  |
| `P5D-A-E04` | Visual, direction, and non-color review       | Chromium, Firefox, and WebKit; named themes and modes        | Static review index                                                | Inspect sizes, bounds, patterns, RTL, forced colors, grayscale, 200% text, missing icons, and icon-absent task          | [Pass: authenticated static review and nine three-engine cases cover both themes, three exact sizes, bounded geometry, declared RTL mirroring, forced colors, grayscale, 200% text, missing preview, and icon-absent tasks](https://github.com/Actesis/Wayglass/blob/main/experiments/phase-5d-icon-tooling/evidence/static-review-and-accessibility.md)                                                              | Codex run, 2026-08-29                 | Synthetic review; no optical-design sign-off                         | Supports completing the private comparison                         |
| `P5D-A-E05` | Accessibility and safe use                    | Browser semantic inspection and Axe                          | Decorative, named-reference, owning-control, and absent-icon cases | Require no focus, no duplicate accessible-name owner, no icon-dependent task, and no violations                         | [Automated pass: decorative geometry is hidden and unfocusable, references have one name owner, controls use visible text, icon-absent tasks remain complete, and baseline/adapted Axe scans report no violations](https://github.com/Actesis/Wayglass/blob/main/experiments/phase-5d-icon-tooling/evidence/static-review-and-accessibility.md)                                                                       | Codex run, 2026-08-29                 | No manual assistive-technology session; runtime drift unchanged      | Supports completing the private comparison                         |
| `P5D-A-E06` | Determinism, drift, and failure recovery      | Node 22.13/current; varied locale, time zone, cwd, and order | Repeated generation plus adverse fixtures                          | Identical outputs; targeted intentional drift; stable diagnostics; no replacement on failure                            | [Partial automated pass: committed drift/failure checks pass, and current Node produces identical bytes across two cwd, locale, time-zone, and order cases](https://github.com/Actesis/Wayglass/blob/main/experiments/phase-5d-icon-tooling/evidence/environment-and-capacity.md)                                                                                                                                     | Codex runs, 2026-08-29                | Minimum Node, Linux, and multi-host evidence remain                  | Current-runtime cases pass; minimum runtime remains open           |
| `P5D-A-E07` | Capacity and maintenance cost                 | Named desktop; Node 26.4.0; 50 warm/cold and capacity runs   | Five-glyph contribution and 500-glyph synthetic fixtures           | Meet time/memory bounds; compare owned surface and synchronized decisions with manual baseline                          | [Pass with trimming requirement: one canonical edit generates four authenticated outputs; 50 warm runs max at 0.342 ms, 50 cold processes max at 36.234 ms, and capacity remains within bounds; the complete 807-line source plus 744-line test proof is too broad to promote wholesale](https://github.com/Actesis/Wayglass/blob/main/experiments/phase-5d-icon-tooling/evidence/maintenance-and-task-comparison.md) | Codex runs, 2026-08-29                | Named desktop; synthetic capacity is not demand                      | Supports a trimmed private capability and disposition review       |
| `P5D-A-E08` | Security, dependency, and removal             | Repository at `7189e95`; Node 26.4.0; pnpm 11.9.0            | Source records, outputs, package/lock graph, removal plan          | Reject active/external SVG content; prove no network/dependency delta and complete removal                              | [Automated pass: exact-key and allowlist validation reject active, external, hidden, styled, and text content; executable audits find no network or credential API or dependency delta; a machine-checked plan removes all executable proof residue without production changes](https://github.com/Actesis/Wayglass/blob/main/experiments/phase-5d-icon-tooling/evidence/security-dependency-and-removal.md)          | Codex run, 2026-08-29                 | Does not test arbitrary untrusted SVG or a remote authoring boundary | Supports maintenance comparison and disposition review             |
| `P5D-A-E09` | Documentation and cleanup                     | VitePress, repository gates, clean worktree                  | Charter, evidence, proof residue                                   | Build links and samples; record unsupported claims; remove unaccepted outputs and authority                             | Pending                                                                                                                                                                                                                                                                                                                                                                                                               | Pending                               | Publication remains blocked                                          | Pending                                                            |

### Deviations and adverse evidence

Retain contract mismatches, geometry changes, parser/model limits, ambiguous direction, optical
review failures, non-determinism, unsafe-input gaps, performance misses, and evidence favoring the
current manual path. Do not expand the supported SVG subset or catalog to rescue the candidate after
results.

### Claims not supported

This proposed proof cannot support claims of a production generator, public contribution format,
complete SVG compatibility, editor import compatibility, security for arbitrary untrusted SVG,
catalog completeness, universal icon semantics, domain-icon ownership, Figma or other design-tool
compatibility, synchronization, plugin readiness, package publication, or correction of the existing
runtime contract.

## Disposition

- **Outcome:** Pending evidence.
- **Decision date and approver:** Pending.
- **Reasoning:** Pending comparison against the fixed criteria.
- **Retained ownership and boundaries:** Pending; application and runtime-contract ownership remain
  fixed regardless of outcome.
- **Known limitations:** Pending evidence; the charter limitations already apply.
- **Follow-up authorized:** the bounded repository-local private proof and validation described by
  this accepted charter.
- **Remaining approvals and gates:** a charter revision before any new dependency; a separate
  implementation contract and ADR after any artifact-candidate disposition; Phase 5D-B charter and
  design-tool access before Figma work; release governance before publication.
- **Cleanup completed:** Not applicable before proof work.

Acceptance as an artifact candidate would not authorize publication or permanent implementation.
