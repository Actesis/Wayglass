# Phase 3A operational-data ownership contract

**Status:** Accepted for Phase 3A on August 8, 2026. This contract inventories the existing Wayglass
contracts that operational components extend and defines the shared data-ownership rules that their
public APIs must preserve. The accepted implementation architecture is recorded in
[ADR 0024](../architecture/adr/0024-operational-data-ownership-and-updates.md). It does not finalize
any component-specific API.

Operational data answers several different questions: what is true now, how a value has changed,
what condition a subject is in, what happened over time, and how a set of records relates. Wayglass
must present those answers consistently without becoming the application’s data model, store,
transport, formatter, or policy engine.

## Existing-contract inventory

Phase 3 begins with working contracts rather than a blank component inventory.

| Existing contract                                                    | Phase 3 obligation                                                                                                                              |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [Known-state model](../architecture/adr/0005-known-state-model.md)   | Reuse condition, knowledge, and activity without combined or component-specific status enums. Domain values remain separate.                    |
| [Metric](../components/metric.md)                                    | Extend the existing labeled, preformatted scalar presentation; do not replace it with a second metric primitive.                                |
| [Value tile](../components/value-tile.md)                            | Continue to compose one primary value and local context without copying the child’s state into a tile-level model.                              |
| [Boolean value and status indicator](../components/boolean-value.md) | Preserve icon-free domain value and condition cues; status collections do not create a second signal language.                                  |
| [Control-state contract](../controls/control-state.md)               | Data updates remain application truth. User interaction emits intent and does not optimistically rewrite confirmed operational data.            |
| [Feedback-state contract](../feedback/feedback-state.md)             | Loading, empty, stale, offline, unavailable, and update announcements retain their distinct meanings and durable recovery paths.                |
| [Native media ownership](../media/media-content.md)                  | Consumer-owned native content is the default where the platform already supplies correct semantics and lifecycle.                               |
| [Layout contracts](../layout/layout-contracts.md)                    | Reuse container responsiveness and labeled scroll regions; dense operational content does not invent page-level overflow behavior.              |
| [Forms, menus, and commands](../forms/form-controls.md)              | Filters and commands compose existing native controls and intent events rather than introducing a query language or command executor.           |
| [Tabs and Function Deck](../patterns/function-deck.md)               | Operational collections work in simultaneous and focused compositions while consequential hidden state remains discoverable.                    |
| Typed React wrappers and client-only fallback                        | React remains an entry point over the same Custom Elements, and useful authored content survives before upgrade where the contract requires it. |

### Inventory conclusion

No existing gap requires one universal operational record. The shared concepts are ownership,
identity, temporal meaning, update behavior, state scoping, and accessible equivalence. Component
contracts may share small types only when the same field has the same semantics in every consumer.

## Ownership boundary

Applications own:

- record creation, identifiers, schemas, source data, authorization, fetching, subscriptions,
  caching, persistence, correlation, reconciliation, retention, and deletion;
- raw values, units, precision, rounding, locale, date and time zone formatting, relative-time copy,
  thresholds, comparison intervals, aggregation, sorting, filtering, paging, and grouping;
- whether a record is current enough to be confirmed, stale, unknown, conflicting, or unavailable;
- the domain meaning of rising, falling, steady, asserted, open, completed, or any other value; and
- whether an update is important enough to announce, retain, acknowledge, or escalate.

Wayglass owns:

- visual hierarchy, compact and comfortable density, responsive containment, and tokenized
  presentation;
- the native or authored semantics documented by each component;
- stable focus and reading behavior while consumer-authored content changes;
- component-local interaction, such as an accepted sort-request control or bounded telemetry
  inspection, without applying the requested data operation; and
- typed events that report user intent when a component provides interaction.

Rendering a value does not transfer its ownership to Wayglass. Removing and recreating a component
must not erase the underlying record, filter, sort order, acknowledgement, or update history.

## No universal record schema

Phase 3 does not add an `OperationalRecord`, `DataSource`, or application store to `@wayglass/core`.
Present values, samples, status entries, timeline milestones, event-log records, and table rows have
different minimum semantics:

| Concept            | Required meaning                                                                                 | Not implied                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Present value      | A labeled value the application is currently willing to show, with optional unit and known state | Numeric type, history, trend, or positive condition                |
| Historical sample  | One observed value positioned within an authored sequence or time window                         | Current truth, equal sampling interval, or condition               |
| Status entry       | A stable subject with a current summary and scoped state                                         | Event history, actionability, or application-wide severity         |
| Timeline milestone | A curated occurrence or interval whose place in a sequence is meaningful                         | Exhaustive audit history or live streaming                         |
| Event-log record   | One inspectable occurrence in an authored record stream                                          | Current source status, acknowledgement, or durable audit guarantee |
| Table row          | One authored record whose cells participate in named column or row relationships                 | Selection, editing, sorting, persistence, or domain identity       |

Component-specific contracts may introduce narrow types after proving the need. A type is shared
only when its fields retain identical ownership, optionality, and meaning; visual similarity is not
enough.

Repeated authored content should normally remain in light DOM or native elements so applications
retain semantics, event handling, keys, and fallback content. A structured property is appropriate
only when the component must calculate a presentation from data—compact telemetry is the expected
case—and must still provide an accessible textual equivalent.

## Stable identity

Dynamic operational views require stable consumer-owned identity so updates can preserve nodes,
focus, reading position, and local disclosure. Identity follows these rules:

1. It identifies the represented subject or record within the owning collection, not its current
   index, visual position, label, timestamp string, or rendered value.
2. Reordering does not change identity. A changed value does not turn a record into a new record.
3. A genuinely new occurrence, such as a new event-log record, receives new identity even when its
   visible text duplicates an earlier occurrence.
4. Identity is not automatically displayed or announced. Applications expose an identifier only when
   people need it for recognition, support, auditing, or action.
5. Wayglass does not generate durable IDs, infer identity from content, or reconcile records across
   application updates.

React keys, DOM node reuse, and application record IDs may derive from the same source, but Wayglass
does not require them to be the same public string.

## Values and formatting

Applications supply the text people should read. Scalar components continue the existing `wg-metric`
model of a preformatted value string and a separately authored unit. Wayglass does not apply locale,
precision, significant-digit, abbreviation, currency, duration, or unit-conversion policy.

Raw numeric values may be accepted when a component must perform geometry, scaling, or bounded
interaction. In that case:

- the raw number is calculation input, not the complete accessible value;
- the application still supplies the readable value, unit, label, and necessary context;
- invalid, non-finite, missing, and out-of-range input has an explicit neutral presentation; and
- a calculated direction, delta, or visual slope does not acquire domain condition.

Long values, negative values, zero, small decimals, large magnitudes, mixed units, and
localized-looking strings are baseline fixtures rather than exceptional content.

## State scope

The accepted `KnownState` axes remain orthogonal and must identify what they qualify.

- A present value’s knowledge describes confidence in that value. Staleness does not change its
  domain value or condition.
- A status entry’s condition describes the named subject or the explicitly named aspect of it, not
  every nested value and action.
- An event record’s condition describes the occurrence at that time. It does not assert that the
  source remains in that condition now.
- Activity describes ongoing work. Loading a collection, refreshing known content, and a domain
  operation in progress are separately labeled activities even when each uses `pending`.
- Control availability remains the ability to accept a request. It is not an alias for unavailable
  knowledge about displayed data.

Trend remains a domain value or comparison result, not a fourth known-state axis. Rising, falling,
steady, mixed, and absent trends must be understandable without color and must not imply positive,
caution, or critical condition unless the application supplies that condition separately.

## Time and ordering

Applications own clock source, observation time, occurrence time, receipt time, time zone, locale,
relative-time policy, and chronological direction. When time is shown, consumer-authored native
`<time datetime="…">` is preferred so readable copy and a machine-readable value remain together.

Component contracts preserve these distinctions:

- **observed at** qualifies when a value or sample represents the domain;
- **occurred at** places a milestone or event in domain time;
- **received at** may explain delayed or out-of-order delivery but does not replace occurrence time;
  and
- **updated at** describes application record maintenance and is not automatically a domain event.

DOM and accessibility-tree order are authoritative reading order. Applications perform sorting and
grouping and keep visual order aligned with semantic order. Wayglass may emit a typed sorting intent
from an accepted control, but it does not reorder consumer data or claim that an event stream is
chronological when the application supplied another order.

## Loading, replacement, and absence

Initial loading, background refresh, partial data, no matching results, genuine emptiness, source
failure, stale knowledge, offline availability, and unavailable data remain distinct.

- Initial loading may use a labeled busy owner and non-semantic skeletons when no prior content
  exists.
- Refresh preserves still-valid content and marks activity separately; it does not replace known
  values with blank scaffolding.
- Partial records expose what is known and label unavailable fields without coercing them to zero,
  false, an empty string, or a fabricated timestamp.
- Empty and no-match states use the accepted empty-state composition and explain the next useful
  action when one exists.
- Failed loading retains the affected scope, useful previous context when safe, and a durable retry
  or alternate path owned by the application.

## Live updates and announcements

An application data mutation is not automatically a live-region announcement. Static content and
background updates default to no interruption. Component-specific contracts must define any
announcement path and preserve these rules:

- Updating data never moves focus on its own.
- Stable records reuse their authored nodes where practical. A focused record or descendant does not
  disappear merely because another item arrived or ordering changed.
- New records do not force scroll, selection, expansion, or follow-latest behavior.
- Visual critical condition alone does not select assertive announcement.
- One logical update has one deliberate announcement owner. A metric, status list, toast, and page
  region must not repeat the same message independently.
- Bursty changes are summarized or rate-limited at an application-appropriate boundary rather than
  announced record by record.
- A person who paused, filtered, sorted, or moved away from the newest records keeps that context.

Phase 3A’s architecture decision will define the shared focus-stability and announcement mechanism.
Timeline, event-log, table, and telemetry contracts will then specify only their additional needs.

## Interaction and events

Display-only data does not emit change events. Interactive operational components emit typed user
intent, such as a request to change sort direction, reveal details, apply authored filters, or
invoke an authored command. They do not report successful data mutation until the application
supplies the result.

Programmatic data updates do not emit user-intent events. Events must include the requested local
operation and enough current component context for the application to interpret it, but must not
copy entire application records when a stable key and requested value are sufficient.

## Representative fixture model

The Phase 3 reference composition is **Operational Activity**, a domain-neutral three-function
workflow. It provides coherent data relationships without adding a reusable pipeline model.

### Intake

- current throughput metric with an authored unit and comparison interval;
- queue-depth telemetry with confirmed samples, a deliberate gap, and a stale latest sample;
- source status entries with positive, caution, unknown, and unavailable combinations; and
- a filterable event stream containing duplicated visible messages with distinct record identity.

### Processing

- a metric group combining duration, count, percentage, and unitless values;
- rising backlog shown independently from neutral condition, plus a falling error count supplied
  with positive condition by the application;
- a curated timeline containing past milestones, an active interval, and an inferred occurrence; and
- commands whose pending or rejected request state does not rewrite confirmed operational values.

### Delivery

- key-value details with long identifiers, absent optional data, and localized-looking values;
- a status list whose authored order changes while focus remains inside one stable entry;
- a wide native table with row headers, stale and unavailable cells, and application-owned sorting;
  and
- loading, partial, empty-filter, refresh, offline, and failed states composed from Phase 2
  feedback.

The fixtures must run in dark and light themes, compact and comfortable density, and phone, desktop,
and wall-display compositions. Names and copy remain generic enough to substitute a service,
facility, asset workflow, account process, or agent system without changing component APIs.

## Validation obligations inherited by every Phase 3 component

- useful semantics and reading order before and after dynamic updates;
- visible text for value, state, trend, time, and action meaning without reliance on color or icons;
- stable focus, selection, disclosure, and scroll context under authored mutation;
- initial loading, refresh, partial, empty, filtered-empty, stale, unavailable, offline, and failed
  states where applicable;
- long and localized-looking content, 320 CSS-pixel width, 200% text size, zoom, touch targets, dark
  and light themes, forced colors, and reduced motion;
- framework-neutral and typed React entry points using the same production behavior; and
- Chromium, Firefox, WebKit, and the representative assistive-technology gates assigned by the Phase
  3 validation matrix.

## Questions resolved by the proposed architecture decision

1. DOM-node continuity, stable consumer keys, DOM-aligned order, and no component-driven focus or
   scroll movement preserve interaction context without a shared record reconciler.
2. Applications own update announcements. Phase 3 data surfaces have no implicit live region; a
   component-specific opt-in requires later manual evidence.
3. ADR 0024 defines a non-virtualized fixture and mutation envelope plus a recorded engineering
   regression threshold rather than a device-independent speed guarantee.
4. No new Phase 3A type enters `@wayglass/core`. Component-local types remain the default until
   repeated identical semantics prove otherwise.
