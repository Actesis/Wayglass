# Phase 4 reference domains

**Status:** Formal roadmap accepted on August 12, 2026. Phase 4A reference-application architecture
is active. No application implementation is authorized until its architecture and validation
contracts are accepted.

Phase 4 tests Wayglass in three distinct, credible application contexts:

1. a smart-home reference application;
2. an operations-console reference application; and
3. an AI-agent-supervision reference application.

These are application proofs, not themed component catalogs. Each application must help a person
understand where they are, what is happening, and what they can do next through a coherent workflow
with application-owned state, failure, recovery, and consequential action. Together they must show
that Wayglass applications feel related without becoming visually or structurally identical.

## Outcomes

Phase 4 will:

- prove the Phase 0–3 language against three meaningfully different domain models and tasks;
- exercise awareness, understanding, decision, action, and confirmation as complete loops;
- demonstrate overview and focused compositions where each is appropriate rather than prescribing
  one layout for every application;
- prove that substantial application branding can adapt presentation while semantic tokens and state
  meaning remain intact;
- test application-owned routing, data access, reconciliation, and workflow policy without moving
  those concerns into Wayglass packages;
- use real production packages, typed React bindings, native semantics, and explicit registration;
- produce reusable implementation guidance and evidence-driven candidates; and
- identify gaps through deployment evidence before proposing a new public component or package API.

## Delivery principles

- **Applications remain applications.** Domain models, routes, stores, adapters, permissions,
  transport, persistence, formatting, and workflows live outside `@wayglass/*` production packages.
- **One source of truth per application.** Scalar, status, temporal, tabular, media, and control
  projections derive from application-owned records rather than synchronizing rendered components.
- **Confirmed and requested state remain distinct.** Optimistic presentation may be demonstrated
  only when pending and unconfirmed values remain explicit.
- **Reference code does not become public API by proximity.** Shared code between reference apps is
  extracted only when it represents identical behavior rather than superficially similar data.
- **Production packages are the interface substrate.** Apps do not copy component implementations,
  Storybook renderers, or private package styles.
- **Deterministic fixtures precede external integration.** Automated scenarios use local, stable,
  synthetic data. Live services, credentials, and deployment providers are separate decisions.
- **No domain is the visual center of Wayglass.** Smart-home content is one proof alongside
  operations and agent supervision, not the default vocabulary for generic APIs.
- **Promotion requires evidence.** A new token, component, shared helper, or package needs a narrow
  contract, cross-domain or repeated-domain evidence, accessibility behavior, and an approved
  proposal or ADR.

## Formal milestone sequence

### Phase 4A — Reference-application architecture

Define the common rules and validation method before application code establishes accidental
conventions.

The proposed
[Phase 4 reference-application contract](./reference-apps/phase-4-reference-applications.md)
inventories the accepted Wayglass surface and defines one credible user, environment, shared truth,
workflow, consequential action, failure envelope, and deliberate exclusion set for each application.
The accepted
[reference-application architecture decision](./architecture/adr/0030-isolated-reference-applications.md)
keeps three private React applications, state, adapters, routes, fixtures, branding, and sharing
thresholds outside production Wayglass packages. The proposed
[Phase 4 validation plan](./accessibility/phase-4-validation-plan.md) defines exact routes,
scenarios, viewports, browser tiers, application fixtures, performance thresholds, production visual
review, and representative assistive-technology gates.

- Inventory the Phase 1–3 components, patterns, state contracts, media ownership, and application
  boundaries each reference domain can reuse.
- Define the smallest credible workflow, user, environment, data model, and consequential action for
  each application.
- Draft an architecture decision covering application isolation, renderer choice, routing, local
  deterministic adapters, fixture ownership, and the threshold for sharing code.
- Define one common scenario vocabulary for initial loading, retained refresh, stale, partial,
  unavailable, permission failure, failed request, recovery, and meaningful live change while
  allowing domain-specific states.
- Define the Phase 4 validation plan, performance envelope, production visual-review method, and
  representative assistive-technology release gates.
- Decide how application-owned brand layers may adapt typography, shape, density, and accent while
  preserving semantic token roles and supported themes.
- Review and accept the architecture, validation plan, milestone scopes, and explicitly carried
  questions before implementing an application.

### Phase 4B — Smart-home reference application

Build the first complete domain proof around household awareness, asset context, and controlled
change. The initial slice should include:

- a whole-home overview with clearly separated comfort, access, lighting, energy, and maintenance
  functions;
- at-a-glance Boolean values such as on/off and open/closed without treating either value as health;
- independent device condition, knowledge, activity, freshness, and requested-versus-confirmed
  state;
- an HVAC asset detail with an identifying image, filter-maintenance context, recent history, and a
  focused media-inspection path;
- at least one reversible routine control and one consequential or security-sensitive action with
  proportionate confirmation and durable outcome feedback; and
- phone, desktop, and wall-display compositions that preserve critical household state and primary
  responses.

The application owns rooms, devices, capabilities, entity identity, service calls, authorization,
staleness, optimistic behavior, media URLs, and storage. It must not introduce generic device or
room components until repeated evidence establishes a reusable contract.

### Phase 4C — Operations-console reference application

Build a multi-function operational workspace for monitoring and acting on a service or process under
change. It must be a credible application rather than a renamed copy of Operational Activity.

- Provide overview and focused work for several functions with different information, monitor, and
  control needs.
- Present capacity, throughput, backlog, service condition, recent change, incidents, and work
  records using shared truth with stable identity.
- Exercise filtering, authored sorting, row actions, temporal investigation, retained refresh,
  partial sources, outage, recovery, and a meaningful live update.
- Include one cross-function consequence whose owning function and response remain discoverable
  while another function is selected.
- Demonstrate application-owned paging or bounded retention if credible data volume exceeds the
  Phase 3 non-virtualized envelope, without presenting that policy as package behavior.
- Validate dense keyboard and screen-reader workflows, reading-position stability, narrow-width
  containment, and at-a-distance wall awareness.

The application owns services, queues, incidents, records, queries, commands, authorization,
retention, escalation, and audit policy.

### Phase 4D — AI-agent-supervision reference application

Build a human-supervision workspace for agents, tasks, tool activity, uncertainty, approval, and
recovery without anthropomorphic or falsely authoritative language.

- Distinguish agent availability and activity from task condition, outcome confidence, and human
  attention.
- Show queued, running, waiting, blocked, failed, completed, cancelled, and recovered work without
  collapsing those meanings into one severity axis.
- Preserve the provenance, freshness, and confidence of reported or inferred outcomes.
- Provide inspectable task history and tool activity with bounded announcements and stable reading
  position.
- Include explicit human approval for one consequential operation, with target scope, reversible or
  irreversible effect, pending state, final confirmation, and denial or timeout behavior.
- Demonstrate pause, cancel, retry, and reassignment only where the application can state what those
  actions actually guarantee.

The application owns agent protocols, prompts, model providers, tool schemas, orchestration,
authorization, execution, logs, retention, approvals, and audit guarantees. Phase 4 does not add an
agent framework or imply that inferred output is confirmed truth.

### Phase 4E — Cross-domain validation and closeout

Compare the three applications as one design-language proof rather than reviewing only isolated
screens.

- Verify that condition, knowledge, activity, trend, Boolean value, section purpose, and action
  feedback retain the same meaning across all domains.
- Verify that each application has a distinct information architecture and brand expression without
  overriding semantic meaning or copying another application's workflow.
- Run the full accessibility, responsive, visual-state, framework, performance, and
  supported-browser matrix for representative end-to-end workflows.
- Complete or explicitly carry manual VoiceOver/Safari and NVDA/Firefox gates with release impact;
  require VoiceOver/iOS Safari before claiming mobile assistive-technology support.
- Audit application code for accidental package APIs, duplicate component implementations,
  application data in core packages, and undocumented dependencies.
- Record gaps, successful compositions, rejected abstractions, and evidence-driven candidates in a
  Phase 4 roadmap disposition.
- Propose promotion only through a separate reviewed contract and ADR; do not add a component during
  closeout merely because two examples look similar.

## Shared acceptance criteria

Every reference application must:

1. answer “Where am I?”, “What is happening?”, and “What should I do next?” from its primary
   workflow;
2. contain at least three obvious functional zones with local identity, state, information, and
   actions where the domain supports them;
3. distinguish domain value, condition, knowledge, activity, freshness, trend, and request state;
4. cover loading, retained refresh, stale, partial, unavailable, empty where applicable, permission
   failure, failed action, recovery, and meaningful live change;
5. preserve stable focus, record identity, reading position, selection, and confirmed truth during
   updates;
6. use one deliberate announcement owner per active workflow and keep ordinary operational data
   surfaces quiet;
7. provide explicit ownership and target scope for consequential actions, proportionate friction,
   and durable results;
8. work with keyboard, touch, pointer, screen reader, 200% text, reduced motion, forced colors,
   grayscale, and RTL-compatible layout mechanics;
9. preserve critical state and primary response across phone, desktop, and wall compositions without
   mounting duplicate interactive representations;
10. use synthetic content that is credible, specific, domain-appropriate, and free of secrets or
    personal data;
11. use production Wayglass packages and remain private and locally built until release and
    deployment governance are approved; and
12. include contract documentation, deterministic tests, production visual review, and an explicit
    record of incomplete manual or deployment-dependent evidence.

## Validation strategy

The proposed [Phase 4 validation plan](./accessibility/phase-4-validation-plan.md) publishes the
exact fixtures and thresholds. The baseline matrix includes:

- unit tests for application state, selectors, request transitions, reconciliation, and scenario
  presets;
- browser tests for primary workflows, keyboard behavior, focus continuity, responsive containment,
  semantics, deliberate announcements, and recovery;
- automated accessibility scans for representative high-risk states in Chromium, Firefox, and
  WebKit;
- production visual review of both official themes, compact and comfortable density where useful,
  app-owned brand adaptation, phone, desktop, and wall presentation;
- forced-colors, grayscale, reduced-motion, 200%-text, long-content, and RTL-compatible fixtures;
- performance evidence for initial construction, meaningful state mutation, and the largest credible
  authored collection in each application; and
- manual VoiceOver/Safari and NVDA/Firefox procedures tied to public-release impact.

Automated accessibility evidence must never be presented as screen-reader validation. A structured
five-second first-glance review may test orientation and priority with representative people, but it
must be reported as formative evidence rather than a universal usability claim.

## Required decision records

Phase 4A includes an accepted architecture decision for reference-application isolation, state and
adapter ownership, deterministic scenarios, renderer choice, routing, and code-sharing thresholds.
Additional decisions are required only when an application introduces a consequential choice not
already governed by Phase 1–3 contracts, such as application-owned paging, optimistic control,
approval timeout, or promotion of a domain pattern.

## Deliberate boundaries

Phase 4 does not authorize:

- publication of npm packages or deployment of a public demo;
- a shared application framework, router, store, transport client, authentication layer, or backend;
- a public operational, device, incident, task, or agent record schema;
- a Home Assistant adapter, chart package, AI-agent framework, or new framework binding;
- real household, business, customer, or model-provider credentials or data;
- automatic extraction of device tiles, room summaries, task queues, agent cards, or system-health
  components; or
- expansion of Phase 5 ecosystem scope.

The existing dependencies should be sufficient for the initial local reference applications. Any new
dependency requires a documented platform and existing-dependency gap before approval.

## Phase exit criteria

Phase 4 is complete only when all three reference applications satisfy the shared acceptance
criteria, their representative workflows pass the accepted validation matrix, cross-domain review
confirms semantic consistency and meaningful brand variation, application and package boundaries
remain intact, and every unresolved manual or deployment-dependent check has a named release impact.
