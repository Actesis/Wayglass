# Phase 5C exploration: rich time-series visualization

## Record control

| Field              | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Record ID          | `P5C-RICH-VISUALIZATION-001`                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Roadmap track      | Phase 5C — Rich visualization exploration                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Lifecycle state    | `charter-accepted`                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Revision           | `2`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Owner              | Wayglass maintainers                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Evidence reviewers | Project owner and a Wayglass maintainer                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Created            | 2026-08-24                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Last reviewed      | 2026-08-25                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Target decision    | After the bounded proof and evidence review; no calendar deadline                                                                                                                                                                                                                                                                                                                                                                                                          |
| Related records    | [Phase 5 roadmap](../../phase-5.md), [ecosystem-exploration contract](../ecosystem-exploration-record.md), [ADR 0031](../../architecture/adr/0031-ecosystem-artifact-architecture.md), [Phase 5 validation plan](../../accessibility/phase-5-validation-plan.md), [telemetry-strip contract](../../data/telemetry-strip.md), [ADR 0025](../../architecture/adr/0025-telemetry-rendering-and-accessible-equivalence.md), and [release governance](../release-governance.md) |

### Decision question

What rich time-series visualization behavior, if any, should Wayglass own beyond
`wg-telemetry-strip`, and should that behavior remain guidance or become a candidate optional
runtime artifact?

### Revision history

| Revision | Date       | Change                                        | Evidence still valid                            | Approval                                |
| -------- | ---------- | --------------------------------------------- | ----------------------------------------------- | --------------------------------------- |
| 1        | 2026-08-24 | Initial proposal                              | None                                            | Accepted by project owner on 2026-08-25 |
| 2        | 2026-08-25 | Add the D3 proof's required declaration graph | Revision 1 except its incomplete dependency set | Accepted by project owner on 2026-08-25 |

## User, task, and consequence

- **Credible user or maintainer:** an operator investigating a bounded period of related operational
  measurements, and the application maintainer who must provide equivalent exact data and
  interaction without rebuilding chart infrastructure for every product.
- **Complete task:** compare four queues over 24 hours against one authored caution threshold and
  one intervention annotation; determine which queue crossed the threshold first; inspect the exact
  values around that event; and determine whether every queue returned below the threshold within 15
  minutes of the intervention.
- **Observed evidence:** the accepted `wg-telemetry-strip` contract explicitly excludes multiple
  series, axes, threshold comparison, annotations, range analysis, exact-point inspection, and
  synchronized interaction. Existing reference applications prove compact telemetry and native
  tables, but no deployed independent consumer has yet demonstrated demand for a Wayglass chart
  package. The task is therefore representative evidence for exploration, not proof of package
  ownership.
- **Current path:** an application composes an authored summary and native table, then either writes
  its own SVG or Canvas rendering and navigation or adopts a general chart library with its own
  semantics, styling, dependency, and accessibility behavior.
- **Gap and consequence:** the web platform supplies graphics and table primitives but no shared
  contract joining multi-series rendering, exact keyboard inspection, persistent values, thresholds,
  annotations, forced colors, responsive containment, and non-visual equivalence. An application can
  solve the task, but repeated solutions can diverge in semantics and hide meaning behind color,
  hover, or pointer precision.
- **Current truth and policy owners:** the application owns measurement identity, units, timestamps,
  retention, aggregation, downsampling, scales, thresholds, annotation meaning, condition,
  knowledge, activity, formatting, and the confirmed operational conclusion. Wayglass owns only
  presentation and interaction behavior accepted by this exploration.
- **Domain context:** the queue fixture makes the task concrete. Queue names, intervention policy,
  breach meaning, recovery window, data transport, and operational decisions are not candidates for
  a Wayglass schema.

## Boundary and artifact hypothesis

- **Provisional tier:** optional runtime. The proof remains private and does not enter that tier
  unless disposition accepts an artifact candidate.
- **Proposed Wayglass ownership:** a narrow time-series view that renders application-authored
  series, one shared numeric scale, thresholds, and annotations; keeps exact inspection persistent
  and keyboard reachable; and connects the visual to an application-authored summary and native
  table without becoming their semantic owner.
- **Application ownership:** source records, acquisition, validation, ordering, identifiers,
  timestamps, units, scales, thresholds, annotations, labels, formatting, aggregation, downsampling,
  summaries, tables, alerts, routes, persistence, and actions.
- **External ownership:** browsers own SVG, Canvas, HTML, focus, pointer, and accessibility APIs;
  candidate libraries own only their documented rendering or calculation behavior.
- **Consumers and support environment:** initially repository maintainers using the supported Node
  and pnpm range and current Chromium, Firefox, and WebKit. A future artifact would be independently
  installed and lazy-loadable; no support beyond validated environments is implied.
- **Potential public surface:** none during proof. A disposition may propose guidance or an
  independently versioned `@wayglass/charts` candidate, but would still require a separate
  implementation contract and architecture decision.
- **Dependency direction and isolation:** the proof may consume public foundation surfaces.
  Foundation packages never import the proof or its dependencies. A clean foundation-only consumer
  must retain the same install graph, bundle, registration, and browser behavior.
- **Registration and global behavior:** private Custom Elements, if used, register only through an
  explicit duplicate-safe function. Imports perform no registration, global event handling, observer
  creation, timers, network work, telemetry, environment mutation, or writes.
- **Version and compatibility unit:** any accepted optional runtime would version independently and
  declare its compatible foundation range. The roadmap name does not reserve an npm package.
- **Non-goals:** replacing `wg-telemetry-strip`; a universal chart or operational-data schema;
  automatic condition, trend, anomaly, threshold, or forecast inference; data acquisition or
  streaming; aggregation or downsampling; dashboards; arbitrary chart grammars; maps, networks,
  gauges, pies, or three-dimensional rendering; freeform pan or zoom; editable annotations; export;
  publication; or support for untested assistive technologies and devices.
- **Removal path:** delete the private experiment, proof-only dependencies and lockfile entries,
  generated bundles, screenshots, traces, and caches; retain only the charter, evidence, and
  disposition. No production export or generated foundation artifact changes.

## Gap analysis and comparison baseline

### Existing options

| Approach                                | Capability and task fit                                                                                                     | Accessibility                                                                                               | Security and privacy                                                | Performance and dependency cost                                                           | Maintenance and compatibility                                                        | Why it may be sufficient                                                                                   |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Keep telemetry plus a native table      | Exact values remain available, but visual correlation, thresholds, and annotations stay application-specific                | Strong native table semantics; visual comparison is absent                                                  | No new input or dependency boundary                                 | Lowest runtime and maintenance cost                                                       | Uses accepted foundation surfaces                                                    | Sufficient when the readable table and compact trends complete the task                                    |
| Publish composition guidance            | Documents summary, table, filters, and an application-owned chart without owning runtime behavior                           | Can require equivalence, but cannot enforce inspection parity or rendering behavior                         | No new runtime code                                                 | Documentation cost only                                                                   | Every application maintains its renderer and interaction                             | Sufficient if repeated behavior is small or product-specific                                               |
| Native SVG and HTML proof               | Can implement the exact bounded task with browser primitives and complete control over DOM, geometry, and focus             | Best opportunity for native DOM structure and persistent HTML equivalence                                   | Local deterministic code; no supply-chain addition                  | Smallest dependency graph; Wayglass owns scale, path, hit-testing, and update complexity  | Browser behavior and every interaction remain Wayglass maintenance                   | Sufficient if the bounded logic remains understandable, fast, and materially smaller than a dependency     |
| Canvas through `uPlot@1.6.32`           | Purpose-built dense time-series rendering, scales, cursors, and updates; annotations and Wayglass semantics remain authored | Canvas has no inherent point semantics; persistent HTML, table equivalence, and keyboard control are needed | Local deterministic runtime; exact package and hooks require review | Zero direct dependencies; bundle, memory, and redraw cost require measurement             | External rendering lifecycle and compatibility become a maintained optional boundary | Sufficient if it materially improves capacity without controlling semantics or accessibility               |
| D3 calculation subset plus authored SVG | Reuses scale, array, and path calculations while Wayglass retains markup, interaction, annotations, and equivalence         | Same DOM opportunity as native SVG; Wayglass still owns the accessible interaction                          | Local deterministic modules; transitive graph requires review       | Modular but nonzero runtime graph; actual tree-shaken and installed cost require evidence | Calculation APIs become compatibility dependencies; rendering remains Wayglass-owned | Sufficient if it removes error-prone mathematics with lower permanent cost than a full chart runtime       |
| Broader general chart library           | Chart.js and Observable Plot cover more chart forms than this task requires                                                 | Canvas or generated-SVG semantics still need task-specific equivalence and interaction review               | Larger package and plugin surfaces                                  | Screening metadata is materially broader than the narrow candidates; no proof install     | More upstream behavior and options than the accepted question                        | Reconsider only if narrow candidates cannot complete the task and charter revision justifies broader scope |

### Gap statement

Wayglass lacks a tested, reusable way to preserve its operational semantics while people correlate
several time series, thresholds, annotations, and exact points through vision, keyboard, touch, and
non-visual equivalents. The smallest plausible ownership is one narrow time-series interaction and
equivalence contract in an isolated optional runtime—not a chart grammar. The proof must still show
that this ownership improves on native application composition enough to justify permanent code.

## Dependency proposal

Revision 2 acceptance authorized the complete exact proof-only root development dependency set after
pre-install inspection showed that the D3 runtime modules do not ship TypeScript declarations. The
seven direct dependencies are now installed and locked at the repository root for this private
experiment. Promotion still requires a fresh dependency decision.

| Candidate and exact version                                                                                                                                                                                                               | Placement                                                     | Missing existing capability                                                                                                                   | License and notices                                           | Health, security, and update owner                                                                  | Cost measurement                                                                                                            | Runtime implications                                                                       | Effects and transitives                                                                                                                       | Replacement and removal                                                 | Proof-only approval    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------- |
| [`uplot@1.6.32`](https://registry.npmjs.org/uplot/1.6.32)                                                                                                                                                                                 | Root dev dependency used only by the experiment               | Dense time-series Canvas rendering, scale layout, cursor calculation, and bounded updates                                                     | MIT; retain exact license finding in evidence                 | Exact release, repository activity, advisories, and maintainer health rechecked before installation | Record lock graph, installed and packed bytes, production bundle gzip, parse work, memory, and timings                      | Optional proof bundle only; no foundation import or browser-floor change                   | Registry metadata reports zero direct dependencies; verify tarball scripts, globals, network, and telemetry before use                        | Remove dependency, lock entries, adapter, bundles, and caches           | Accepted in revision 2 |
| [`d3-array@3.2.4`](https://registry.npmjs.org/d3-array/3.2.4), [`d3-scale@4.0.2`](https://registry.npmjs.org/d3-scale/4.0.2), and [`d3-shape@3.2.0`](https://registry.npmjs.org/d3-shape/3.2.0)                                           | Root dev dependencies used only by the experiment             | Reviewed numeric extents, linear scales, ticks, and SVG path construction without adopting a complete chart runtime                           | ISC; retain exact licenses and notices in evidence            | Exact releases, repositories, advisories, and maintainer health rechecked before installation       | Record direct and transitive graph, installed and packed bytes, tree-shaken gzip, parse work, and timings                   | Optional proof bundle only; authored SVG, interaction, and semantics remain Wayglass-owned | Known registry metadata names `internmap`, formatting, interpolation, time, and path modules; verify the exact lock graph and package scripts | Remove dependencies, lock entries, adapter, bundles, and caches         | Accepted in revision 2 |
| [`@types/d3-array@3.2.2`](https://registry.npmjs.org/@types/d3-array/3.2.2), [`@types/d3-scale@4.0.9`](https://registry.npmjs.org/@types/d3-scale/4.0.9), and [`@types/d3-shape@3.2.0`](https://registry.npmjs.org/@types/d3-shape/3.2.0) | Root dev dependencies used only for strict proof typechecking | The exact D3 runtime packages provide no `types` or `typings` entry; local ambient declarations would hide compatibility and maintenance cost | MIT; type-only notices remain part of the dependency evidence | DefinitelyTyped owns declarations; Wayglass owns version compatibility and update review            | Record 328,602 unpacked bytes for the three direct declaration packages plus the two exact resolved declaration transitives | Erased during compilation and excluded from production bundles; no runtime import          | `@types/d3-scale` resolves `@types/d3-time@3.0.4`; `@types/d3-shape` resolves `@types/d3-path@3.1.1`; `@types/d3-array` has no dependency     | Remove direct type packages, resolved lock entries, imports, and caches | Accepted in revision 2 |

### Pre-install dependency screen

Read-only inspection on 2026-08-25 used Node 26.4.0 and npm 11.17.0 on arm64 macOS 26.5.2. It
downloaded the seven named candidate tarballs to an operating-system temporary directory and
resolved their graph into a temporary package lock with scripts disabled. It found:

- matching registry integrity and package measurements for every exact tarball;
- MIT for uPlot and the declaration packages, and ISC for the D3 runtime modules;
- built-in declarations for uPlot and no built-in declarations for the three D3 runtime modules;
- 16 resolved packages when the three direct declaration packages are included;
- no `preinstall`, `install`, or `postinstall` hook in the resolved lock;
- zero known vulnerabilities across all severities from `npm audit` at the time of review; and
- no candidate code was installed, imported, bundled, or executed.

Registry and advisory findings are dated evidence, not a permanent security guarantee. After
revision 2 acceptance, the repository pnpm install resolved the same 16-package candidate graph and
no lifecycle hook. Candidate code remains unexecuted until its bounded adapter slice. The repository
audit's unrelated findings are recorded with the partial dependency evidence.

Screening metadata on 2026-08-24 also identified `chart.js@4.5.1` (MIT) and
`@observablehq/plot@0.6.17` (ISC) as maintained comparison references. Their registry unpacked
packages and broader dependency or feature surfaces do not justify proof installation for this
bounded task. Registry unpacked size is screening metadata, not a browser-bundle measurement.

## Bounded proof

- **Single proof question:** can a narrow Wayglass-owned interaction and equivalence contract
  complete the four-series queue investigation more accessibly and maintainably than application
  composition, without imposing unacceptable runtime, dependency, or ownership cost?
- **Minimum implementation:** one shared deterministic fixture and application-owned summary/table,
  plus three private adapters—native SVG/HTML, uPlot Canvas, and D3-assisted SVG—that implement only
  series visibility, persistent exact inspection, previous/next sample, previous/next series, one
  threshold, one annotation, and resize. Each adapter receives identical already-validated,
  already-formatted application input.
- **Private location:** `experiments/phase-5c-rich-visualization/`; no workspace package, production
  barrel export, public tag, release inventory, or docs runtime import.
- **Inputs and deterministic fixtures:** generated non-personal queue-depth samples with stable IDs,
  timestamps, labels, formatted values, explicit gaps, and observation knowledge. The maximum
  fixture contains four series of 2,880 samples each—11,520 points over 24 hours at 30-second
  intervals—one shared authored scale, one threshold, and one intervention annotation. Smaller
  fixtures cover one, two, and four series at 120, 1,440, and 2,880 samples per series.
- **Comparison and measurements:** compare complete-task success, implementation surface,
  diagnostics, direct and transitive dependencies, production bundle gzip, construction, meaningful
  update, inspection latency, retained memory, and cleanup. Use five warm-ups and 30 measured runs;
  record median, p95, maximum relevant synchronous task, variance, and raw structured output.
- **Precommitted budgets:** at the maximum fixture, median meaningful construction under 50 ms and
  no synchronous task at or above 100 ms on the named desktop baseline; median keyboard inspection
  response under 50 ms; one four-series replacement update under 50 ms median; candidate-specific
  production JavaScript under 40 KiB gzip excluding shared foundation code; no detached-node,
  listener, timer, or observer growth across 60 updates; and retained heap after forced collection
  no more than 125% of the post-warm-up baseline. A result that meets timing by dropping points,
  meaning, or equivalence fails.
- **Test envelope:** current Chromium, Firefox, and WebKit; Vanilla direct use; dark and light,
  compact and comfortable, 320 and 1,440 CSS pixels, wall-width containment, 200% text, long labels,
  RTL, forced colors, grayscale, reduced motion, keyboard, pointer, touch emulation, and 4× CPU
  throttling where supported. Complete the task without vision or pointer through the persistent
  inspector and native table. Record VoiceOver/Safari and NVDA/Firefox task results before any
  artifact-candidate disposition.
- **External effects:** no network at runtime, credentials, personal or provider data, analytics,
  publication, deployment, external mutation, persistence, clipboard, downloads, or telemetry.
  Revision 2 authorized the repository dependency install; each candidate executes only in its
  bounded adapter and creates no runtime network behavior.
- **Retained evidence:** accepted charter revisions, exact dependency and license inventory, source
  commit, fixture manifest, bundle reports, raw timing and memory output, browser results, task
  transcripts, screenshots for visual states, deviations, limitations, and disposition.
- **Cleanup targets:** all private adapters, fixtures not retained as structured evidence,
  proof-only dependencies and lock entries, bundles, screenshots not selected as evidence, traces,
  profiles, caches, and generated reports.
- **Bound:** one line/time-series form, one shared numeric scale, four series, one threshold, one
  annotation, fixed-window inspection, three adapters, and the stated envelope. No generalized
  renderer, plugin system, chart grammar, production component, framework wrapper, or package.
- **Quality gates:** proof-focused typecheck and tests, deterministic fixture hashes, browser task
  tests, Axe, production visual review, dependency and bundle inspection, `pnpm check`, docs build,
  `git diff --check`, and clean export/registration/dependency checks.

## Criteria fixed before work

### Success

1. Sighted pointer, sighted keyboard, and non-visual keyboard users can answer all four task
   questions from the same application-owned data in current Chromium, Firefox, and WebKit without
   hover-only content, pointer precision, color-only meaning, or an inferred operational conclusion.
2. Series, scale, unit, threshold, annotation, gaps, observation knowledge, selected point, summary,
   and exact table remain distinct and application-authored; condition, knowledge, activity, and
   value are never derived from geometry or collapsed.
3. At least one candidate meets every precommitted construction, update, inspection, bundle,
   resource, responsive, and isolation budget at the maximum fixture without downsampling or
   changing the task.
4. The accepted candidate demonstrates a materially smaller or safer repeated maintenance surface
   than native application composition. If native SVG/HTML is the best result, evidence must show
   whether that supports shared code or guidance only.
5. An identifiable maintainer can explain the retained interaction, browser, accessibility,
   dependency, and update obligations and can remove the candidate without changing foundation
   consumers.

Meeting these criteria starts disposition review; it does not approve a package, public component,
dependency, or publication.

### Stop early

1. Stop if exact values or relationships cannot be reached without vision and pointer precision, or
   if fixing equivalence would require a second conflicting semantic owner.
2. Stop if the task requires Wayglass to infer thresholds, conditions, trends, annotations,
   aggregation, units, or domain policy from raw data.
3. Stop a dependency candidate before executable use if its exact license, scripts, transitive
   graph, advisories, globals, network behavior, or maintenance ownership cannot be accepted within
   the proof boundary.
4. Stop an adapter when it cannot meet the maximum fixture or budgets without silently dropping
   points, hiding exact data, weakening browser coverage, or widening the chart form.

### Reject

1. Reject Wayglass runtime ownership if the native table, telemetry composition, and concise
   application guidance complete the task with lower repeated cost.
2. Reject a general chart package or grammar when only the bounded time-series task is proven.
3. Reject an artifact whose accessibility depends on generated SVG or Canvas semantics that cannot
   be made consistent across the supported browsers and named assistive technologies.
4. Reject a dependency whose installed, bundled, security, compatibility, or update burden is
   disproportionate to the native baseline.
5. Reject foundation placement: rich visualization remains optional even if an artifact candidate is
   accepted.

### Defer

| Missing evidence or prerequisite | Owner                            | Decision impact                                                                | Objective review trigger                                                   | Earliest review            |
| -------------------------------- | -------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | -------------------------- |
| Independent application consumer | Project owner                    | Blocks package and public-support justification, not the bounded proof         | A named application and maintainer commit to the complete task             | At disposition or later    |
| Representative low-power tablet  | Project owner or test maintainer | Blocks a low-power-device performance claim                                    | The maximum fixture can be run on a named supported physical tablet        | Before release candidacy   |
| VoiceOver and NVDA task evidence | Project owner and maintainer     | Blocks artifact-candidate disposition and desktop screen-reader support claims | Both named task transcripts are completed against the same proof revision  | During proof validation    |
| A second visualization form      | Future charter owner             | Blocks any generalized chart-system claim                                      | A distinct complete task cannot be served by the accepted time-series form | After Phase 5C disposition |

### Revise charter when

Revise before continuing if the complete task, chart form, series or sample envelope, scale count,
interaction model, tier, package boundary, candidate dependency or version, dependency placement,
public surface, proof location, data sensitivity, network behavior, supported browser or assistive
technology set, performance budget, or disposition prerequisite changes materially.

## Evidence plan and results

All rows use deterministic synthetic data. Provider, credential, design-tool, server-rendering, and
framework-binding matrices are not applicable because the proof has no provider, secret, design
artifact, network, public wrapper, or claimed SSR behavior.

| Evidence ID | Category                         | Environment and versions                                             | Fixture or data                                             | Method and expected result                                                                                        | Actual result and artifact                                                                                                                                                                            | Reviewer and date                           | Limitation                                        | Decision impact                                                         |
| ----------- | -------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------- |
| `P5C-E01`   | Task and comparison baseline     | Current supported browser and runtime matrix                         | Maximum queue task plus native table and all adapters       | Complete four questions; compare code, failure, and maintenance surface                                           | [Partial: complete task and exact-table answers pass in all three browsers](../../../experiments/phase-5c-rich-visualization/evidence/task-interaction-validation.md)                                 | Codex run, 2026-08-27; owner review pending | Representative task, not deployed demand          | Task supports continuing; maintenance comparison remains pending        |
| `P5C-E02`   | Semantics and ownership          | Proof typecheck and deterministic fixtures                           | Series, scale, threshold, annotation, gaps, and knowledge   | Account for every input without derived policy, semantic-axis collapse, mutation, or ambiguous identity           | [Partial: authored semantics remain shared; ambiguous and misaligned exact labels now fail at the boundary](../../../experiments/phase-5c-rich-visualization/evidence/task-interaction-validation.md) | Codex run, 2026-08-27; owner review pending | One data shape and one shared numeric scale       | Supports continuing; full adverse-fixture review remains pending        |
| `P5C-E03`   | Non-visual and exact equivalence | VoiceOver/Safari and NVDA/Firefox                                    | Summary, persistent inspector, and native exact table       | Answer the same questions without vision or pointer; no duplicate or conflicting announcement owner               | Pending                                                                                                                                                                                               | Pending                                     | Named desktop AT only                             | Pending                                                                 |
| `P5C-E04`   | Keyboard, pointer, and touch     | Chromium, Firefox, WebKit, keyboard, pointer, touch emulation        | All series, gaps, annotation, first and last points         | Persistent exact inspection, stable focus, logical navigation, native controls, and no hover-only information     | [Partial: 12-test keyboard, coarse-pointer, exact-control, and touch matrix passes](../../../experiments/phase-5c-rich-visualization/evidence/task-interaction-validation.md)                         | Codex run, 2026-08-27; owner review pending | Fixed window; no freeform pan or zoom             | Supports continuing; physical touch and owner review remain pending     |
| `P5C-E05`   | Responsive and visual behavior   | Named viewport, zoom, theme, density, long-label, and wall cases     | Maximum fixture and all states                              | No page overflow or essential truncation; stable axes, labels, table access, and selected context                 | [Partial: automated 320/1,440-pixel, theme, density, 200%-text, long-label, and visual-review envelope passes](../../../experiments/phase-5c-rich-visualization/evidence/adaptation-validation.md)    | Codex run, 2026-08-27; owner review pending | Synthetic fixtures                                | Supports continuing; task transcripts and owner review pending          |
| `P5C-E06`   | Adaptation and non-color meaning | RTL, forced colors, grayscale, reduced motion, locale-formatted text | Threshold, annotation, selection, gaps, and knowledge       | Geometry, text, and system colors preserve distinctions; motion is absent or safely reduced                       | [Partial: RTL, bidi, forced-color, grayscale, reduced-motion, and non-color pattern matrix passes](../../../experiments/phase-5c-rich-visualization/evidence/adaptation-validation.md)                | Codex run, 2026-08-27; owner review pending | Application supplies all localized strings        | Supports continuing; manual AT and owner review pending                 |
| `P5C-E07`   | Performance and capacity         | Clean production build on named hardware plus supported browsers     | 1/2/4 series at 120/1,440/2,880 samples                     | Five warm-ups, 30 runs, 60 updates; meet every fixed timing and resource budget with raw output retained          | [Partial: named-desktop maximum-fixture timing and resource budgets pass](../../../experiments/phase-5c-rich-visualization/evidence/comparative-measurements.md)                                      | Codex run, 2026-08-27; owner review pending | Single-machine measurements until device evidence | Supports continuing; browser, fixture-size, and device evidence pending |
| `P5C-E08`   | Dependency and bundle            | Exact registry artifacts and clean lock graph                        | Native, uPlot, D3 subset, screened broad candidates         | Audit license, scripts, advisories, transitives, install, pack, gzip, parse, maintenance, and complete removal    | [Partial: isolated production JavaScript gzip budgets pass](../../../experiments/phase-5c-rich-visualization/evidence/comparative-measurements.md)                                                    | Codex run, 2026-08-27; owner review pending | Registry and source findings are date-bounded     | Bundle evidence supports continuing; complete dependency audit pending  |
| `P5C-E09`   | Browser and runtime isolation    | Supported Node/pnpm plus current Chromium, Firefox, and WebKit       | Clean foundation consumer and private proof                 | No foundation dependency, bundle, export, registration, global, or browser-floor change; lazy direct import works | Pending                                                                                                                                                                                               | Pending                                     | Private proof is not package installation         | Pending                                                                 |
| `P5C-E10`   | Failure and live update behavior | Browser matrix and adverse deterministic fixtures                    | Empty, invalid, duplicate, unsorted, oversized, and updates | Fail visibly without stale geometry, focus loss, semantic corruption, listener leaks, or inferred condition       | [Partial: fixed-envelope replacement preserves focus and semantics; shape changes fail visibly](../../../experiments/phase-5c-rich-visualization/evidence/comparative-measurements.md)                | Codex run, 2026-08-27; owner review pending | Simulated updates; no transport or provider       | Supports continuing; complete adverse-fixture matrix pending            |
| `P5C-E11`   | Documentation and cleanup        | VitePress, repository gates, and clean worktree                      | Charter, evidence, dependency graph, exports, proof residue | Build links; document unsupported claims; remove rejected code, dependencies, outputs, traces, and caches         | Pending                                                                                                                                                                                               | Pending                                     | Publication remains separately blocked            | Pending                                                                 |

### Deviations and adverse evidence

The pre-install screen found that the D3 runtime candidates lack built-in TypeScript declarations.
Revision 2 exposes the three required direct declaration packages and two resolved type-only
transitives instead of hiding that cost behind local ambient declarations. This finding does not
change the task, tier, runtime candidate, budgets, browser matrix, or revision 1 ownership evidence.

Record future failed candidates, budget misses, browser differences, assistive-technology friction,
and evidence favoring application composition without narrowing the envelope after work.

### Claims not supported

This proposed proof cannot support claims of package readiness, publication, a stable public API,
all chart forms, arbitrary data size, streaming, automatic aggregation, design-tool compatibility,
mobile assistive-technology support, cross-platform screen-reader support, low-power tablet
performance before physical-device evidence, or correctness of application-authored thresholds and
operational conclusions.

## Disposition

- **Outcome:** Pending evidence.
- **Decision date and approver:** Pending.
- **Reasoning:** Pending comparison against the fixed criteria.
- **Retained ownership and boundaries:** Pending; application data and policy ownership remain fixed
  regardless of outcome.
- **Known limitations:** Pending evidence; the charter limitations already apply.
- **Follow-up authorized:** the bounded repository-local private proof and validation described by
  this accepted charter.
- **Remaining approvals and gates:** completed proof evidence and accepted disposition; a separate
  implementation contract and ADR after any artifact-candidate disposition; release governance
  before publication.
- **Cleanup completed:** Not applicable before proof work.

Acceptance as an artifact candidate would not authorize publication or permanent implementation.
