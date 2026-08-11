# ADR 0029: Keep Operational Activity integration example-owned

- Status: accepted
- Date: 2026-08-11

## Context

Phase 3H must prove that metrics, telemetry, status collections, temporal records, filters,
commands, and native tables work as one system in both simultaneous and focused compositions. It
must also provide equivalent framework-neutral and React examples without duplicating state or
interaction behavior.

The component contracts deliberately keep application data, identity, updates, filters, sorting,
commands, and announcement policy consumer-owned. Integration could nevertheless drift into a new
workspace component, public operational schema, example-specific store, duplicated vanilla and React
behavior, or two simultaneously mounted responsive representations. Each would contradict the
ownership and semantic boundaries already accepted in ADRs 0010, 0024, 0026, 0027, and 0028.

## Decision

### Use an example-only state and transition module

Operational Activity will have one example-only TypeScript module containing fixture-local state
types, initial-state factories, derived selectors, deterministic scenario presets, and pure
transition functions. It owns stable example record keys, selected focused function, filter draft
and applied values, sort direction, request lifecycle, and confirmed fixture values.

The module is reference application code, not a Wayglass API. It remains outside production
packages, has no framework dependency, and is not exported from any `@wayglass/*` package. It does
not define a universal operational record; each component projection receives only the authored
content or narrow input required by its accepted contract.

### Keep renderers thin and framework-appropriate

Storybook and the vanilla example render explicitly registered production Custom Elements. The React
example renders the production typed wrappers. They share state interpretation and transitions from
the example module while retaining framework-appropriate rendering and lifecycle code.

Renderers translate application state into existing component attributes, properties, slots, native
descendants, and stable keyed nodes. They do not reimplement filtering, sorting, command outcomes,
scenario meaning, or announcement policy. Production packages never import example code, and
runnable examples never depend on Storybook-only rendering.

### Compose existing overview and tabs patterns

The simultaneous composition renders Intake, Processing, and Delivery as three named function
regions. The focused composition uses the accepted Function Deck directly from one `wg-tabs`
coordinator and its compound children. No `wg-operational-activity`, `wg-workspace`, or second
selection coordinator is introduced.

One interactive composition is mounted per fixture. Overview and focused mode are explicit stories
or example routes, not duplicate DOM trees selected by CSS or automatically switched at a viewport
breakpoint. This prevents duplicate controls, IDs, tables, state surfaces, and announcement owners.

Both compositions consume the same ordered function definitions and workspace state. Focused
selectors carry consequential hidden-state summaries and the accepted persistent response path.

### Derive several views without creating several truths

A confirmed fixture value or record may be projected into a scalar summary, status entry, temporal
record, or table row when those views communicate different accepted relationships. Every projection
derives from the same authored state and retains the semantics of its component family.

The integration does not synchronize components by listening to their rendered output. Native and
typed events report user intent to the application transition owner; new application state then
renders back through each affected projection. Programmatic updates remain silent.

### Use one deliberate announcement owner

Operational data surfaces remain non-live. The example state may derive one deliberate result
summary for an accepted filter, command, recovery, or consequential update. The applicable
application-authored feedback region owns that announcement and durable text. Renderers do not add
per-component mirrors or announce ordinary live samples and records.

### Validate deterministic states rather than simulate a backend

Steady, loading, retained refresh, stale, partial, unavailable, filtered-empty, failed, recovered,
and live-update scenarios are deterministic fixtures. They exercise integration boundaries without
adding timers, random failures, networking, persistence, routing, or a fake service layer.

## Consequences

- Phase 3 integration tests real production components without promoting reference application
  policy into package API.
- Vanilla and React use distinct rendering syntax but one interpretation of state, identity,
  transitions, requests, and scenarios.
- Overview and focused fixtures cannot drift into different data truths or function order.
- Only one interactive semantic representation and announcement owner exists in a mounted fixture.
- Stable node identity remains a renderer responsibility; React keys and framework-neutral retained
  nodes are validated explicitly.
- The example module may evolve or be replaced without a public package migration.
- Phase 4 reference applications may learn from the fixture but are not required to adopt its state
  shape or workflow.

Acceptance on August 11, 2026 authorizes the bounded Phase 3H integration slices defined by the
Operational Activity contract without promoting this example architecture into public package API.

## Alternatives considered

### Add a public operational-workspace component

Rejected. Existing layout, Function Deck, and operational components already own the necessary
presentation and interaction boundaries. A workspace component would either be a cosmetic wrapper or
begin owning application state, routing, responsive policy, and content schema.

### Add a shared production operational store or record schema

Rejected by ADR 0024. The component families do not share one required record, and a store would
pull subscriptions, reconciliation, filtering, sorting, request state, and retention into Wayglass.

### Implement independent vanilla and React demo behavior

Rejected. Equivalent screenshots would not prove equivalent transitions, record identity, command
outcomes, announcement policy, or failure behavior. Shared example-only state logic supplies that
evidence without coupling production packages to a framework.

### Reuse one Lit renderer inside React

Rejected. Mounting a parallel Lit application inside React would bypass the typed React wrappers,
refs, event props, lifecycle, and keyed rendering that Phase 3H must validate.

### Mount overview and focused workspaces together and hide one with CSS

Rejected. It duplicates interactive controls, IDs, tabular semantics, application reconciliation,
and potential announcement owners. Responsive or mode changes must not choose between duplicate
active semantic trees.

### Simulate live data with random timers and network failures

Rejected. Nondeterminism weakens visual review, accessibility testing, and regression evidence while
adding transport behavior that remains explicitly application-owned.
