# ADR 0031: Separate ecosystem artifacts by ownership and dependency direction

- Status: accepted
- Date: 2026-08-14

## Context

Phases 0–4 produced a domain-neutral runtime, a typed React binding, build and testing support, and
three isolated reference applications. Phase 5 explores charts, token transforms, icon tooling,
designer-facing libraries, a Home Assistant integration, and possible additional framework wrappers.
These artifacts have different users, dependencies, security boundaries, release cadences, and
evidence requirements.

The [Phase 5 roadmap](../../phase-5.md) requires an architecture decision before an ecosystem track
adds public surface. ADR 0022 confirms the Wayglass name, `@wayglass` scope, Apache-2.0 license, and
planned documentation origin but intentionally leaves packages private until release governance is
accepted. ADR 0030 keeps reference-app records, stores, adapters, routes, and workflows outside
production packages.

Without an ecosystem boundary, a chart dependency could enter every element consumer, a provider
adapter could create a core device schema, design tools could become a second token authority, or a
framework wrapper could acquire behavior that differs from the Custom Elements. A single version or
support promise could also imply compatibility across artifacts that have not been validated
together.

## Decision

### Classify every artifact before implementation

Every Phase 5 charter assigns one of these tiers and names the artifact owner, user, task,
dependencies, support environment, and non-goals.

| Tier                         | Ownership and purpose                                                                                  | Current examples                                                               | Permitted future examples                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Foundation runtime           | Domain-neutral semantics and browser runtime required by the core design language                      | `@wayglass/core`, `@wayglass/tokens`, `@wayglass/themes`, `@wayglass/elements` | A new core capability only after cross-domain promotion evidence |
| Optional runtime             | Separately installed runtime behavior or assets that core consumers do not receive by default          | `@wayglass/icons`                                                              | A chart package accepted by its own contract                     |
| Framework binding            | Framework-specific adaptation over framework-neutral behavior                                          | `@wayglass/react`                                                              | One demand-backed additional wrapper                             |
| Integration                  | Provider-specific translation between an external system and application-owned truth                   | None                                                                           | A Home Assistant adapter or example integration                  |
| Build and validation tooling | Development-time generation, validation, or testing with no application runtime requirement            | `@wayglass/testing`; private `@wayglass/eslint-config`                         | Token transforms, icon tooling, drift checks                     |
| Design artifact              | Designer-facing variables, styles, components, guidance, or libraries versioned against code contracts | None                                                                           | Figma variables, styles, or component library                    |
| Example and guidance         | Private applications, fixtures, recipes, and walkthroughs that demonstrate consumer ownership          | `apps/*`, `examples/*`, Storybook, documentation                               | Application-author guide, hosted synthetic walkthrough           |

An artifact may move tiers only through a reviewed decision that updates dependencies, ownership,
validation, compatibility, and release impact. Use by another repository file does not promote an
artifact.

### Keep dependency direction inward

The allowed dependency direction is:

```text
examples and guidance
    ↓
integrations / framework bindings / optional runtime
    ↓
foundation runtime

build and design tooling → authored contracts or public package surfaces
```

More specifically:

- foundation runtime packages do not import optional runtime, framework, integration, provider, or
  design-tool dependencies;
- optional runtime packages may depend on the smallest necessary foundation packages but not on an
  integration or framework binding;
- framework bindings adapt public framework-neutral contracts and declare the framework and Wayglass
  runtime as peers where consumer identity must remain singular;
- integrations translate provider data and commands into an application-owned boundary; neither
  foundation nor optional runtime packages import them;
- build tooling may consume authored sources or public package surfaces, but generated runtime
  artifacts do not require the generator to be installed; and
- examples and documentation may consume accepted artifacts from any tier without making their
  records, routes, stores, or policies package API.

Circular dependencies across tiers are rejected. A dependency exception requires its own ADR rather
than a workspace alias that hides the cycle.

### Isolate optional dependency cost

An ecosystem artifact must not change the install, bundle, registration, global state, or browser
support behavior of a consumer that does not import it. Optional runtime, integrations, tools, and
wrappers receive their own package entry points and manifests when accepted.

Every external dependency proposal records:

- the platform or existing-package gap;
- runtime, development-only, optional, or peer placement;
- license and notice obligations;
- maintenance health and security ownership;
- installed, bundled, and type-surface cost;
- supported runtime and browser implications; and
- removal or replacement strategy.

Core packages do not re-export optional ecosystem artifacts. Tree shaking is not treated as a
substitute for a package boundary.

### Preserve explicit registration and one behavior owner

Framework-neutral runtime behavior remains in Custom Elements or domain-neutral core functions.
Imports do not register Custom Elements as a side effect. Optional runtime elements use explicit
`defineWg*` registration with the same duplicate-definition safety as existing elements.

Framework bindings translate properties, events, refs, slots or children, and rendering lifecycle;
they do not fork interaction, accessibility, or state behavior. Integrations translate external
truth but do not infer condition, authorization, confirmation, or application policy that the
provider cannot guarantee.

### Separate naming patterns without reserving packages prematurely

All public package candidates remain under `@wayglass`. An accepted charter chooses the narrowest
name consistent with its tier:

- foundation and optional runtime use capability nouns, such as the existing `elements`, `themes`,
  and `icons`;
- framework bindings use the framework name, as `react` does;
- provider integrations use `integration-<provider>` unless provider naming or ecosystem convention
  requires a reviewed alternative;
- build tools use a purpose-qualified name such as `<subject>-tools`; and
- examples retain the private `example-<application>` pattern.

The roadmap's illustrative names do not reserve npm packages or approve manifests. Avoid `common`,
`shared`, `utils`, `platform`, `ecosystem`, or a domain-neutral-looking name for mixed ownership.
Design artifacts use visible Wayglass naming and version metadata but are not assumed to be npm
packages.

### Use a foundation release family and independent ecosystem versions

`@wayglass/core`, `@wayglass/tokens`, `@wayglass/themes`, and `@wayglass/elements` form the
**foundation release family**. When publication is separately approved, they use one synchronized
version and compatibility baseline because their semantic, token, theme, stylesheet, and element
contracts are validated together.

`@wayglass/icons`, `@wayglass/react`, `@wayglass/testing`, and future optional runtime,
integrations, tooling, framework bindings, and design artifacts version independently. Each declares
its compatible foundation range and any peer range. A release may validate several artifacts as a
known-compatible set without forcing them to share a version.

All packages remain private and at `0.0.0` for now. This decision establishes future coupling; it
does not select an initial public version, stability level, release tool, registry workflow, or
publication date. The Phase 5A release-governance contract owns those choices.

### Assign support by artifact, not brand proximity

Each accepted artifact names a repository owner or maintainer and records:

- supported environments, browsers, frameworks, provider versions, or design-tool versions;
- security and dependency update responsibility;
- documentation, test, and manual validation responsibility;
- compatibility and deprecation expectations; and
- the claims blocked by incomplete evidence.

Wayglass branding, a shared repository, or inclusion in documentation does not grant the foundation
support matrix to an integration, design file, wrapper, or private example. An unowned artifact
cannot become a public release candidate.

### Require tier-specific promotion evidence

The following are minimum thresholds, not automatic approval:

- **foundation runtime:** identical domain-neutral semantics and ownership in at least two
  independently implemented domain contexts, plus evidence that ordinary composition is
  insufficient;
- **optional runtime:** one credible complete task, a clear reason not to enlarge foundation
  runtime, and an accessibility and performance contract proportional to the capability;
- **framework binding:** a named consumer, a demonstrated gap in direct Custom Element use, parity
  with framework-neutral behavior, and a maintainer for the supported framework range;
- **integration:** deterministic contract fixtures plus a representative real provider environment,
  explicit credential and privacy handling, and no claim beyond the tested provider versions;
- **build tooling:** at least two real outputs or workflows, deterministic generation, failure and
  drift behavior, and no runtime dependency leakage;
- **design artifact:** stable source authority, reproducible or auditable mapping, version linkage,
  drift detection, and review in the target design tool; and
- **example or guidance:** a concrete teaching task, production-package use, and an explicit line
  between demonstrated practice and supported API.

Cross-domain similarity in records, IDs, commands, routes, or request envelopes remains
insufficient. Promotion requires a separate contract and ADR when it changes public ownership,
interaction, security, or compatibility.

### Keep source trees honest

Existing `packages/`, `apps/`, and `examples/` locations remain unchanged. A new distributable code
artifact may enter `packages/` only after its charter accepts package status. A provider-specific
integration begins private and receives a dedicated workspace location only when its architecture is
accepted; it is not placed in `packages/` merely to simplify imports. Design artifacts receive a
source and generation location only after Phase 5D defines their authority.

Private feasibility prototypes use an explicitly named temporary or example-owned location and do
not export from production package barrels. Rejected prototypes are removed after their evidence is
recorded unless an accepted record names a continuing purpose.

## Consequences

- Foundation consumers do not acquire chart, provider, framework, or design-tool dependencies by
  default.
- The foundation release family can make one coherent semantic compatibility promise while adjacent
  artifacts evolve at their real cadence.
- Provider integrations and design artifacts can be useful without pretending to be domain-neutral
  runtime packages.
- Existing icons, React, and testing packages remain valid but receive independent compatibility and
  support records before publication.
- A new artifact needs more upfront evidence, ownership, and documentation; this is intentional
  friction against permanent low-confidence surface.
- Some code, fixtures, and generation steps may repeat until identical ownership and maintenance
  cost justify extraction.
- Repository placement, documentation navigation, and `@wayglass` naming no longer imply one support
  or release unit.

## Alternatives considered

### Publish one Wayglass package

Rejected. A monolith would couple tokens, themes, elements, framework code, optional visualization,
provider integrations, and tools into one dependency and support surface. Tree shaking cannot remove
install-time, peer, security, and compatibility coupling.

### Put every artifact in `packages/` and decide later

Rejected. Workspace location would normalize speculative code as distributable surface and make
examples, integrations, and private proofs look more stable than their evidence.

### Version every package in lockstep

Rejected. Integrations, wrappers, icon assets, testing tools, and design libraries respond to
different external versions and maintenance cycles. Lockstep would create releases with no relevant
change and imply compatibility that was not tested.

### Version the foundation packages independently

Rejected for the initial release family. Core semantics, authored tokens, themes, and elements are
validated as one system; independent public versions would multiply compatibility combinations
before the project has release evidence. This can be revisited after real consumer pressure.

### Let each ecosystem track choose architecture locally

Rejected. Local choices would allow contradictory naming, dependency direction, versioning, support,
and promotion rules, recreating the coupling this decision prevents.

### Promote repeated reference-app mechanics

Rejected. Phase 4 found syntactic similarities in routers, reducers, schedulers, scenarios, and
request records but different semantic ownership and failure guarantees. Line-count reduction is not
an ecosystem contract.

### Publish the existing workspace before ecosystem work

Rejected. Identity and license are settled, but package contents, synchronized foundation
versioning, provenance, automation, support gates, and recovery remain release-governance decisions.
