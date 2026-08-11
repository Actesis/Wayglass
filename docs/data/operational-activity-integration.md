# Phase 3H Operational Activity integration contract

**Status:** Accepted for Phase 3H on August 11, 2026. This contract defines the integrated reference
workspace and its application-owned state boundary. It does not add a public component, record
schema, store, or package API.

**Implementation:** The shared model and production Storybook overview and focused compositions are
implemented. Both compositions consume the same state instance and reducer, explicitly register
production Custom Elements, preserve keyed application records, and provide one application-owned
announcement region. Runnable Vanilla and React integrations remain the next delivery slice.

The contract applies the accepted [operational-data ownership](./operational-data.md),
[Function Deck](../patterns/function-deck.md),
[filter and command](./filter-and-command-patterns.md), and [data-table](./data-table.md) contracts
as one system. The accepted architecture is recorded in
[ADR 0029](../architecture/adr/0029-operational-activity-reference-integration.md).

## Purpose

Operational Activity proves that the Phase 3 components work together as an operational workspace,
not only as isolated catalog examples. It must answer the Wayglass orientation questions across
several related functions while data changes:

1. **Where am I?** The workspace and each function retain explicit identity.
2. **What is happening?** Current values, condition, knowledge, activity, trends, history, and
   collection scope remain independently understandable.
3. **What should I do next?** Filters, commands, row actions, recovery paths, and consequential
   safeguards remain visibly attached to the function and target they affect.

This is a reference integration and validation fixture. It is not an application template or a
prescribed workflow engine.

## Reference functions

The workspace uses the three domain-neutral functions established in Phase 3A. Their names describe
data movement without encoding a service, facility, asset, account, agent, or smart-home domain.

### Intake

- current throughput metric with an authored unit and comparison interval;
- queue-depth telemetry with confirmed samples, one deliberate gap, and a stale latest sample;
- source status entries with positive, caution, unknown, and unavailable combinations; and
- a filterable event log whose repeated visible messages retain distinct record identity.

### Processing

- a metric group combining duration, count, percentage, and unitless values;
- rising backlog independent from neutral condition and falling error count with
  application-authored positive condition;
- a curated timeline with past milestones, an active interval, and an inferred occurrence; and
- commands whose pending, rejected, unavailable, and recovered request states never rewrite
  confirmed operational values prematurely.

### Delivery

- key-value details with long identifiers, absent optional data, and localized-looking values;
- a status list whose application-authored order changes while a stable entry retains focus;
- a wide native data table with row headers, compound cells, stale and unavailable values,
  application-owned sorting, and row actions; and
- filters, commands, loading, retained refresh, partial, filtered-empty, offline, failed, and
  recovered feedback composed around those records.

The functions are fixture content only. No public Wayglass name, type, token, event, or component
may encode Intake, Processing, or Delivery.

## One application-owned state

One mounted workspace has one application-owned state object and one transition owner. It contains
only the example data needed to prove integration: stable record keys, authored values and units,
timestamps, independent state axes, filter draft and applied values, sort direction, command request
state, selected focused function, and the active validation scenario.

The shared example module may expose fixture-local TypeScript types, initial-state factories,
derived selectors, and pure transition functions. It must remain outside production packages and
must not be exported from `@wayglass/core`, `@wayglass/elements`, or `@wayglass/react`.

Every surface derives its visible projection from that state:

- scalar summaries and collection records agree because they read the same authored source;
- filters change application-owned result projections rather than component data;
- sorting reorders retained keyed table rows without changing record truth;
- commands represent request activity separately from confirmed values;
- timeline and event records retain their distinct accepted semantics; and
- programmatic live updates do not emit user-intent events.

The fixture must not create a universal operational record. Each component family receives only the
content or narrow input already accepted by its own contract.

The shared model is implemented in `examples/shared/operational-activity-model.ts`. Its focused unit
suite verifies the ordered function definitions, stable fixture keys, every deterministic scenario,
unknown-before-confirmed loading state, draft and applied filters, retained identity during sorting,
request and confirmed-value separation, quiet idempotent live updates, consequential selector
summaries, scenario selection continuity, and the replaceable single announcement owner. Storybook
owns this example-only test gate because it is the canonical integration fixture; the module remains
available to the runnable vanilla and React examples without becoming production package code.

## Composition modes

Operational Activity supports two explicit compositions over the same ordered function definitions
and workspace state.

### Simultaneous overview

All three function regions remain present in DOM and visual order for scanning and comparison. Phone
stacks the functions without changing order or ownership. Desktop and wall-display layouts use
stronger neutral function boundaries and aligned scan points without using condition color as a
function identifier.

### Focused deck

One accepted Function Deck uses the existing tabs compound components. The selected value lives in
the workspace state and the tabs coordinator remains the sole selection and keyboard owner.
Non-selected selectors retain concise caution, critical, stale, unavailable, or pending summaries. A
hidden critical function retains a persistent path to its primary response when selecting its tab
alone would not be timely enough.

Overview and focused mode are separate compositions, not breakpoint-selected substitutes. A
reference story or example mounts one interactive composition at a time. It must not keep duplicate
active controls, live regions, tables, or IDs in visually hidden copies.

Changing composition preserves function order and state meaning. An application may deliberately
preserve the selected focused function, filter state, sorting, and reading context when it owns an
in-product mode switch; the reference fixtures need not add that navigation control merely to prove
both layouts.

## State and update scenarios

The integrated fixture must provide deterministic scenarios rather than simulated random failures:

- **steady:** mixed condition, knowledge, activity, value, and trend without an urgent request;
- **initial loading:** scoped placeholders or progress before a function has confirmed records;
- **retained refresh:** valid records remain visible and focused while the smallest stable owner is
  busy;
- **stale and partial:** retained truth is labeled with its age, limits, and missing scope;
- **unavailable or offline:** last-known values remain distinct from current knowledge and expose a
  useful recovery path;
- **filtered empty:** the collection remains valid but no records match the applied filters;
- **failed request:** the request outcome is durable and the confirmed value remains unchanged;
- **recovered:** the same stable surfaces regain confirmed data without stealing focus; and
- **live update:** values and records update quietly while one deliberate workspace summary may
  describe a meaningful accepted result.

Scenario changes are test and story controls. Components do not infer them from elapsed time,
network activity, missing values, or collection length.

## Interaction and announcement ownership

Each interaction keeps its existing owner:

| Concern                                                         | Owner                                                      |
| --------------------------------------------------------------- | ---------------------------------------------------------- |
| Function selection and selector focus                           | Existing tabs compound components                          |
| Filter validation, submission, reset, draft, and applied values | Native form plus application state                         |
| Command, sort, disclosure, and row-action intent                | Existing native or typed component event                   |
| Confirmed data, record identity, ordering, and replacement      | Application state and renderer                             |
| Request lifecycle and failure recovery                          | Application state and durable function-local feedback      |
| Consequential confirmation                                      | Existing confirmation contract                             |
| Deliberate result announcement                                  | One application-authored workspace or function-local owner |

Metrics, telemetry, status lists, temporal collections, and tables remain non-live. The workspace
does not mirror their updates into separate announcers. A deliberate summary names the affected
function, result, and retained truth; visual data surfaces remain durable evidence rather than a
second announcement channel.

Focus remains on connected authored controls through retained updates. Before removing focused
consumer content, the application moves focus to a documented continuation target. New records do
not force follow-latest behavior, sorting, selection, or scrolling.

## Framework delivery

The framework-neutral Storybook fixture and runnable vanilla example use production Custom Elements
with explicit registration. The runnable React example uses the production typed wrappers. Both
consume the same example-only initial-state factories, selectors, transition functions, and scenario
vocabulary.

Rendering syntax is necessarily framework-specific. State interpretation, transitions, record
identity, action outcomes, selection meaning, and scenario semantics are not reimplemented in each
renderer. React stable keys and retained DOM nodes must preserve the same interaction identity as
the framework-neutral renderer.

Imports remain side-effect free. No example may depend on a Storybook-only implementation, and no
production package may depend on example code.

## Responsive and adaptive behavior

Both compositions must cover phone at 320 CSS pixels, desktop, and wall display in compact and
comfortable density. The integrated workspace must also retain meaning at 200% text, with long and
localized-looking content, RTL, forced colors, grayscale, and reduced motion.

- Phone preserves function and reading order, keeps critical state and primary recovery reachable,
  and contains wide tabular comparison in its named scroll region.
- Desktop supports efficient cross-function scanning without blurring boundaries or section purpose.
- Wall display enlarges glanceable values and summaries without hiding detail or inventing a
  different semantic representation.
- Focused selectors may scroll inline when necessary, but selected identity and consequential
  summaries remain visible and keyboard reachable.
- The page itself does not overflow because a telemetry strip, temporal collection, or data table
  exceeds its available inline size.

## Validation requirements

The implementation slices must prove:

1. identical ordered function identity and state meaning in overview and focused compositions;
2. consistent shared records across scalar, status, temporal, and table projections;
3. one state-transition owner and no duplicate request, sorting, filtering, or selection logic;
4. one deliberate announcement owner with no implicit or duplicate operational live regions;
5. stable focus, keyed nodes, selection, disclosure, and scroll context during retained updates;
6. deterministic loading, refresh, stale, partial, unavailable, filtered-empty, failure, recovery,
   and live-update scenarios;
7. framework-neutral and React parity for names, roles, relationships, events, refs, outcomes, and
   focus behavior;
8. phone, desktop, wall, 320 CSS pixels, 200% text, RTL, both themes, both densities, forced colors,
   grayscale, reduced motion, keyboard, pointer, touch, and supported browser engines;
9. the integrated performance envelope, including twelve simultaneous 120-sample telemetry strips
   where the production composition meaningfully exercises it; and
10. production Storybook review, full repository validation, and the representative
    assistive-technology gate ledger with exact results and release impact.

## Delivery sequence

Phase 3H proceeds in bounded slices:

1. implement the example-only state, selectors, transitions, and deterministic scenarios;
2. compose the production Storybook overview and focused workspaces;
3. add equivalent runnable vanilla and React integrations;
4. complete docs, package-export, typed-wrapper, and Storybook audits;
5. run integrated visual, accessibility, responsive, framework, performance, and browser validation;
6. update the assistive-technology ledger and Phase 3 closeout record; and
7. audit deferred and revised candidates before Phase 4 without widening its three reference apps.

Acceptance of this contract authorizes those integration slices. It does not authorize a new public
workspace component, application store, data adapter, chart package, router, transport client, query
engine, or domain component.
