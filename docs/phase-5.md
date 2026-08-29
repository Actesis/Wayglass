# Phase 5 ecosystem roadmap

**Status:** Accepted on August 14, 2026. Phases 5A, 5B, and 5C are complete. Phase 5D-A accepted a
trimmed private icon build-and-validation candidate and its authoritative runtime reconciliation on
August 29, 2026; its minimum-runtime validation remains. Phase 5D-B is deferred. Every later
ecosystem track requires its own accepted charter before implementation, and an exploration may
conclude with no new package.

Phase 5 extends Wayglass beyond the core design language and its three reference domains. `SPEC.md`
names six ecosystem areas to explore: charts, Home Assistant integration, icon tooling, Figma
libraries, design-token platform transforms, and additional framework wrappers. The
[Phase 4 roadmap disposition](./phase-4-roadmap-disposition.md) adds application-author guidance,
cross-domain validation recipes, a possible hosted walkthrough, and deployment evidence as
high-value follow-up work.

This phase is not a backlog conversion exercise. It establishes which adjacent capabilities belong
in Wayglass, which should remain examples or integrations, and which should not be built.

## Outcomes

Phase 5 will:

- define ecosystem artifact tiers, ownership boundaries, compatibility promises, and release
  governance before adding public surface;
- publish application-author guidance from the Phase 4 evidence without turning reference-app policy
  into framework code;
- evaluate design-token interchange before building tooling or design-library synchronization on an
  ad hoc representation;
- investigate rich visualization against the proven telemetry boundary and accessible-equivalence
  requirements;
- separate icon authoring tools, reusable icon assets, and product-domain icon catalogs;
- use a Home Assistant proof to test an optional real integration without centering the core design
  language on smart homes;
- add a framework wrapper only when a real consumer and framework-specific behavior justify its
  maintenance cost; and
- end with an explicit release, defer, revise, or reject disposition for every explored track.

## Operating rules

### Exploration does not imply delivery

Every track begins with a charter that names:

1. the user and concrete task;
2. the gap in the platform, browser, existing Wayglass packages, or ordinary application code;
3. the proposed artifact tier and owner;
4. accessibility, performance, security, privacy, and maintenance risks;
5. the smallest credible proof and comparison baseline;
6. success, stop, and rejection criteria; and
7. the evidence required before public support or publication.

A completed exploration may accept a package, retain a private prototype, publish guidance only,
defer pending external evidence, or reject the capability.

### Artifact tiers stay distinct

Phase 5A must formalize these provisional tiers:

- **core runtime:** domain-neutral semantics and components suitable for independent Wayglass
  consumers;
- **optional runtime:** separately installed capabilities such as charts or a framework binding that
  do not enlarge the core dependency or support surface by default;
- **integration:** domain- or provider-specific adapters that translate external truth without
  becoming a core record schema;
- **build and design tooling:** token transforms, icon authoring, validation, and design-library
  generation that do not enter an application's runtime; and
- **examples and guidance:** non-package recipes, reference applications, and deployment
  walkthroughs that demonstrate application ownership.

Package names, version coupling, peer dependencies, browser support, and publication cadence are not
approved merely by naming a tier here.

### Release remains explicit

Wayglass, `@wayglass`, Apache-2.0, and the planned documentation origin are confirmed. Packages
remain private and at version `0.0.0` until a separate release-governance decision accepts:

- public package inventory, `files`, exports, dependency and peer-dependency policy;
- versioning, compatibility, deprecation, changelog, and support policy;
- license and `NOTICE` contents in every distributable artifact;
- reproducible packing, provenance, integrity, automation, and recovery procedures;
- documentation and migration requirements;
- the carried manual assistive-technology gates for the released surface; and
- an explicit publish rehearsal and approval. A dry run or packed tarball is not publication.

No Phase 5 milestone independently authorizes npm publication, a public demo, telemetry collection,
or a live credential.

### Dependencies require a recorded gap

Charts, design tools, framework bindings, and external integrations can attract large dependency
graphs. Each new dependency requires a documented reason the platform and existing dependencies are
insufficient, plus license, maintenance, security, bundle, type, and browser implications. Optional
capabilities must not force their dependencies on core consumers.

## Formal milestone sequence

### Phase 5A — Ecosystem architecture and release governance

Define the boundaries used to evaluate every later track.

The accepted
[ecosystem artifact architecture decision](./architecture/adr/0031-ecosystem-artifact-architecture.md)
defines the artifact tiers, inward dependency direction, optional-dependency isolation, naming,
foundation release family, independent ecosystem versioning, support ownership, and promotion
thresholds used by the remaining Phase 5A records.

The accepted [release-governance contract](./governance/release-governance.md) defines candidate
states, versioning, package contents, clean evidence, one-time registry bootstrap, tokenless staged
publishing, human approval, provenance, recovery, and the explicit decisions that still block any
publication.

The accepted [ecosystem-exploration record](./governance/ecosystem-exploration-record.md) and its
[canonical template](./governance/templates/phase-5-exploration-template.md) define neutral decision
questions, bounded private proofs, dependency review, precommitted criteria, evidence integrity,
revision triggers, cleanup, and explicit outcomes for every Phase 5B–5F investigation.

The accepted [application-author guide](./guides/application-authoring.md) publishes the proven
Phase 4 method without defining an application framework. The
[application-validation boundary](./governance/application-validation-boundary.md) keeps domain
fixtures and policy harnesses local, retains the existing viewport constants as the only current
`@wayglass/testing` candidate surface, and requires repeated public-contract evidence before any new
helper is proposed.

The accepted
[Cloudflare documentation-delivery decision](./architecture/adr/0032-unified-cloudflare-documentation-delivery.md)
assigns `wayglass.hoagsoftworks.com` one composed Workers Static Assets deployment: normative
VitePress documentation at `/`, Storybook at `/storybook/`, and only explicitly admitted synthetic
walkthroughs under `/walkthroughs/`. Independent builds remain separate inputs to one deterministic,
versioned deployment artifact. No Cloudflare configuration or deployment is authorized yet.

The accepted [Phase 5 validation plan](./accessibility/phase-5-validation-plan.md) defines common
evidence stages and tier-specific matrices for foundation and optional runtime, framework bindings,
integrations, build tools, design artifacts, and documentation surfaces. It completes Phase 5A while
carrying publication, deployment, assistive-technology, provider, design-tool, and framework choices
to the milestones that own them.

- inventory current packages, exports, browser and framework support, private application proofs,
  documentation surfaces, and carried release gates;
- accept an ecosystem architecture decision covering artifact tiers, naming, dependency isolation,
  version coupling, support ownership, and promotion thresholds;
- define the release-governance contract without publishing a package;
- define a common exploration record with success, stop, defer, revision, and rejection outcomes;
- publish the Phase 4 application-author guidance and decide whether validation recipes remain
  documentation, local harnesses, or narrow public-behavior helpers;
- decide whether the documentation site, Storybook, and selected synthetic walkthroughs share one
  deployment or remain separately built artifacts; and
- define the Phase 5 validation plan for runtime packages, build tools, design artifacts,
  integrations, and wrappers.

Exit requires an accepted architecture decision, release-governance contract, validation plan, and
explicitly carried questions. No runtime ecosystem implementation enters Phase 5A.

**Exit disposition:** Complete on August 15, 2026. The accepted records above satisfy every Phase 5A
outcome without publishing, deploying, connecting a provider, or adding runtime ecosystem scope.

### Phase 5B — Design-token interchange and platform transforms

Establish the data contract that downstream design and build tools would consume.

The accepted and dispositioned
[Phase 5B design-token interchange record](./governance/explorations/phase-5b-token-interchange.md)
answers the ownership question against the DTCG 2025.10 comparison baseline. Its bounded private
proof validates one-way source authority, deterministic web and partial exchange transforms,
semantic preservation, failure behavior, capacity, and repository isolation without adding a
dependency or public surface.

- compare the current authored definitions and generated CSS, TypeScript, and JSON with a documented
  interchange model, including current Design Tokens Community Group conventions;
- preserve semantic, component, density, motion, typography, and mechanical-token distinctions;
- define stable identity, aliases, modes or themes, descriptions, units, color representation, and
  deprecation without making generated names the source of truth;
- prototype at least two useful transforms from one canonical model and verify deterministic output;
- prove round-trip or one-way ownership explicitly rather than implying that code and design tools
  can both author the same token; and
- keep brand layers from renaming or inverting semantic roles.

Exit may accept a formal schema and tooling package, retain the existing compiler with documented
exports, or reject a proposed interchange. Figma synchronization is not implemented until this
ownership decision is stable.

**Exit disposition:** Complete on August 15, 2026. A narrow private build-and-validation artifact
candidate is accepted because machine-enforced identity, semantic validation, deterministic output,
and targeted drift add safety beyond documentation alone. The accepted
[implementation contract](./governance/token-tooling-implementation-contract.md) and
[ADR 0033](./architecture/adr/0033-private-token-tooling-architecture.md) define the permanent
private boundary and staged implementation authority. Package status, public schema, dependency
adoption, publication, DTCG conformance, design-tool compatibility, and non-web platform support
remain unapproved.

### Phase 5C — Rich visualization exploration

Evaluate a chart capability against needs that `wg-telemetry-strip` intentionally does not serve.

The accepted
[Phase 5C rich-visualization charter](./governance/explorations/phase-5c-rich-visualization.md)
precommits a four-series time-window task, native and dependency-backed comparison baselines,
application ownership, exact non-visual equivalence, performance and bundle budgets, supported
browser evidence, stop criteria, and cleanup before any private proof begins.

- use a credible task requiring multiple series, scales, legends, thresholds, annotations, exact
  point inspection, or range comparison;
- compare native and lightweight authored approaches with candidate rendering dependencies;
- define accessible textual and tabular equivalence, keyboard inspection, focus behavior, forced
  colors, grayscale, reduced motion, zoom, localization, and responsive containment;
- keep data acquisition, aggregation, units, thresholds, retention, and business meaning
  application-owned;
- measure initial rendering, meaningful update, memory, and bundle cost against an explicit data
  envelope; and
- decide whether the result belongs in an optional `@wayglass/*` package, guidance, or the
  application.

Phase 5C must not turn compact telemetry into a universal chart or hide exact values behind pointer
interaction. A private feasibility proof precedes any public component contract.

**Exit disposition:** Complete on August 28, 2026. The native SVG/HTML interaction and
exact-equivalence contract is accepted as a narrow optional-runtime artifact candidate; uPlot and D3
are rejected for the bounded form and their executable code and dependency graph are removed.
Permanent implementation, package work, and a stable public API are deferred until a named
independent application consumer demonstrates the complete task. NVDA/Firefox remains an explicit
desktop release gate and is not represented as passing.

### Phase 5D — Icon tooling and design-library bridge

Treat code assets, authoring automation, and designer-facing libraries as related but distinct.

Phase 5D is intentionally sequenced. The accepted and dispositioned
[Phase 5D-A icon-tooling charter](./governance/explorations/phase-5d-icon-tooling.md) first asked
whether Wayglass needs private source, validation, generation, drift, and review tooling for the
existing optional icon runtime. It records—but does not repair—the current difference between the
accepted icon contract and implementation. Phase 5D-B will require its own design-artifact charter,
named Figma workspace and access model, target versions, reviewer, version linkage, backup, and
drift plan. Phase 5D-A can be rejected or accepted without presuming that a Figma library or plugin
should exist.

- audit the existing foundation and control icon catalog, SVG contract, naming, directionality,
  optical alignment, and accessible-use guidance;
- define import, normalization, validation, preview, and generated-export needs before choosing an
  icon toolchain;
- keep domain icon catalogs outside the generic runtime unless repeated cross-domain meaning is
  proven;
- derive Figma variables or styles from the accepted token interchange rather than maintaining a
  second hand-authored semantic model;
- define component-library scope, version linkage, change review, contribution, and drift detection;
  and
- verify that designer assets preserve text, non-color state distinctions, focus intent, density,
  and logical direction.

Icon tooling may ship without a Figma component library, and Figma guidance may ship without an
automated plugin. The milestone accepts only artifacts that can be maintained and versioned with the
code contracts they represent.

Phase 5D-A was dispositioned on August 29, 2026. The accepted outcome retains a trimmed private
source, validation, deterministic-generation, drift, and static-review artifact candidate; it does
not promote the full proof or authorize runtime migration or package publication. The accepted
[`@wayglass/icons` runtime-contract reconciliation](./governance/icon-runtime-contract-reconciliation.md)
keeps the Phase 2C foundation API authoritative and classifies the current package as incomplete. A
accepted [implementation contract](./governance/icon-tooling-implementation-contract.md) and
[ADR 0034](./architecture/adr/0034-private-icon-pipeline-architecture.md) define the trimmed
permanent boundary. The unchanged proof on Node 22.13/Linux comes next and must pass before any
production migration begins.

Phase 5D-B design-library work was deferred by the project owner on August 29, 2026. It may restart
only when a named Figma workspace, access model, exact target versions, reviewer, backup policy,
version linkage, and drift plan are available.

### Phase 5E — Home Assistant integration proof

Use one optional smart-home integration to test the ecosystem boundary under real external state.

- define the smallest credible user-owned deployment and data set; synthetic fixtures remain the
  default automated evidence;
- map external entities, attributes, availability, timestamps, commands, and service results into an
  application-owned model without publishing a universal Wayglass device schema;
- distinguish external reported value, knowledge, activity, request, and confirmed effect;
- document authentication, secret handling, network exposure, reconnect, rate, privacy, and failure
  behavior before using a live credential;
- keep dashboards, rooms, automations, authorization, persistence, and optimistic policy in the
  consuming application; and
- decide whether the reusable result is an adapter package, an example integration, a starter
  recipe, or no Wayglass artifact.

This milestone does not make smart-home terminology the default Wayglass vocabulary. Live testing
requires an explicit environment and credential-handling approval; no secret enters the repository,
fixtures, screenshots, logs, or browser bundle.

### Phase 5F — Additional framework wrapper evaluation

Select a framework from demonstrated consumer demand rather than popularity alone.

- name the consumer, framework version, rendering mode, Custom Element integration gaps, form and
  event semantics, and server-rendering expectations;
- compare direct Custom Element use with a generated or handwritten wrapper;
- preserve explicit element registration and avoid import-time side effects;
- provide typed properties, events, refs, slots or children, Boolean and complex values, and a clear
  client-only fallback where hydration cannot be guaranteed;
- validate native semantics, focus, forms, themes, and supported browsers against the existing
  Vanilla and React baselines; and
- define version support and maintenance ownership before accepting a package.

If direct Custom Element use is sufficient, the correct result is framework documentation rather
than a wrapper package. Phase 5 does not promise Vue, Svelte, Angular, or another binding in
advance.

### Phase 5G — Ecosystem integration and disposition

Close the phase across accepted, rejected, and deferred tracks.

- run the complete repository and accepted ecosystem validation matrices;
- verify optional packages do not enlarge core install, runtime, registration, or support behavior;
- test documentation, Storybook, examples, generated artifacts, and selected private integrations as
  one versioned system;
- audit licenses, notices, dependency graphs, bundle boundaries, security assumptions, and package
  contents;
- record manual assistive-technology and representative-user evidence with exact release impact;
- disposition every exploration and remove private prototypes that no longer provide evidence; and
- make a separate explicit decision about documentation deployment, npm publication, and any public
  support claim.

Phase 5 can complete without publishing packages. Publication is an outcome to approve, not a phase
exit shortcut.

## Shared acceptance criteria

Every accepted Phase 5 artifact must:

1. preserve the core promise that Wayglass turns complex systems into known states;
2. have a named artifact tier, owner, user, task, and non-goals;
3. remain domain-neutral when placed in core and visibly domain-specific when placed in an
   integration;
4. keep condition, knowledge, activity, value, trend, confidence, request, and confirmed effect
   semantically distinct;
5. avoid import-time Custom Element registration and undocumented global behavior;
6. use semantic tokens for intentional visuals and logical CSS for layout;
7. document platform and dependency gaps, package and bundle impact, security, privacy, and
   maintenance cost;
8. provide framework-neutral behavior before a framework binding where runtime behavior exists;
9. include contracts, tests, documentation, accessible alternatives, production visual review, and
   supported-browser evidence proportional to risk;
10. state what remains application-, provider-, platform-, or designer-owned;
11. remain private until release governance and the artifact's carried support gates are accepted;
    and
12. retain a clear rejection or removal path if the exploration does not justify permanent surface.

## Validation strategy

Phase 5A will publish the detailed validation plan. Its baseline must include:

- current repository quality gates and supported-browser regression coverage;
- package-boundary, export, install, pack-content, side-effect, dependency, and bundle checks;
- deterministic generated-artifact and drift tests for tokens, icons, and design outputs;
- automated accessibility plus named manual procedures for interactive runtime surfaces;
- accessible-equivalence, performance, memory, forced-color, grayscale, reduced-motion, text-scale,
  localization, RTL, keyboard, touch, and responsive evidence where applicable;
- fixture and contract tests for external integrations, with live smoke tests isolated from normal
  CI and protected by explicit secret policy;
- direct-use parity and rendering-mode tests for framework wrappers; and
- exact environment, version, result, limitation, and release-impact records.

Tooling and design artifacts do not inherit runtime browser tests mechanically, but they must prove
determinism, semantic preservation, version compatibility, and failure behavior. Integrations do not
claim provider compatibility from mocks alone.

## Deliberate boundaries

Phase 5 does not authorize:

- a universal operational, visualization, device, task, agent, command, or data-source schema;
- automatic movement of reference-app code into production packages;
- a monolithic `@wayglass/ecosystem` package or mandatory optional dependencies;
- package publication, deployment, credentials, analytics, or personal data without a separate
  accepted decision;
- Figma as a second source of semantic truth;
- a chart that lacks an equivalent way to reach its meaning without vision or pointer precision;
- a Home Assistant dashboard framework, home-automation engine, or core smart-home vocabulary;
- wrappers for multiple frameworks in parallel without named consumers and maintainers;
- AI-generated validation, sound, haptics, spatial computing, multimodal command surfaces, design
  linting, or starter kits merely because they appear in the future vision; or
- expansion of a milestone after its charter is accepted without review.

## Phase exit criteria

Phase 5 is complete when each started exploration has an accepted release, guidance-only, defer,
revise, or reject disposition; accepted artifacts satisfy their tier-specific validation; core and
application boundaries remain intact; package, deployment, and support claims are explicit; and all
unresolved human, provider, device, or operational evidence has a named owner and release impact.

The completed Phase 5C proof used a shared deterministic input, maximum queue fixture, native
SVG/HTML baseline, uPlot Canvas adapter, D3-assisted SVG adapter, and named-desktop production
bundle, timing, replacement, and resource measurements. Desktop budgets; responsive and non-color
adaptation; sighted keyboard, pointer, touch, complete-task, and exact-table behavior; adverse-input
and transactional replacement behavior; dependency and maintenance review; the automated semantic
preflight; and VoiceOver/Safari all pass within the recorded limitations. Charter revision 3 carries
the unavailable Windows NVDA/Firefox task transcript as an explicit desktop release obligation; it
did not block the private disposition and cannot support a desktop screen-reader claim until
completed. The rejected dependency-backed adapters have been removed; the native candidate and
historical evidence remain private pending an independent-consumer trigger.
