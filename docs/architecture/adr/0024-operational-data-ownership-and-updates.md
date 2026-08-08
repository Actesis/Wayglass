# ADR 0024: Keep operational data and update policy consumer-owned

- Status: accepted
- Date: 2026-08-08

## Context

Phase 3 adds metrics, telemetry, status lists, timelines, event logs, filter and command patterns,
and data tables. These components present related data, but they do not consume one interchangeable
record shape. A universal record or data-source abstraction would make Wayglass responsible for
application schemas, identity, subscriptions, reconciliation, formatting, and retention.

Dynamic operational views also create accessibility and interaction risks. Replacing or reordering
records can remove focus, change reading position, force scroll, or trigger repeated live-region
speech. Visual urgency alone cannot determine which change should interrupt a person. The
[Phase 3A operational-data contract](../../data/operational-data.md) defines the shared ownership
boundary; this decision defines its implementation architecture.

## Decision

### Data enters through authored content or narrow component input

Wayglass does not add a universal operational record, data source, subscription, query layer, or
store. Applications deliver updates through ordinary DOM, attribute, and property updates.
Components neither fetch nor subscribe.

Repeated semantic content remains consumer-authored light DOM or native HTML by default. Slots and
parts provide presentation without cloning the content into a second semantic owner. This applies to
status entries, timeline items, event records, filter controls, commands, and table structure.

A component may accept narrow structured input only when it must calculate a presentation from data.
Telemetry samples are the expected case. That input type remains local to the component unless a
second component proves identical semantics. Structured visual input never replaces the required
readable label, value, unit, time context, state, or summary.

No new Phase 3A type is added to `@wayglass/core`. The accepted `KnownState` and control-request
types remain shared; later component contracts may propose a small shared type with independent
evidence.

### DOM continuity is interaction identity

Applications own durable record identity. For authored repeated content, continuity of the actual
DOM node is the identity Wayglass can observe and preserve during interaction. Components do not
infer identity from index, label, timestamp, value, or serialized content and do not generate
durable record keys.

Applications should update and reorder existing keyed nodes instead of replacing them. React entry
points preserve the same rule through stable keys. A public record identifier is displayed or
announced only when authored content makes it meaningful to people.

Wayglass does not implement a cross-component keyed reconciler. A component-specific child element
may later expose a consumer key for an interaction that cannot rely on node continuity, but that key
does not become an application identity system.

### Updates do not move focus or scroll by default

Programmatic data updates emit no user-intent events and never deliberately move focus, selection,
disclosure, or scroll position. Components preserve a connected focused descendant and do not
replace slotted content during presentation updates.

When a component removes one of its own internal focused controls because its public state changed,
its component contract must name a deterministic focus fallback before implementation. When an
application removes consumer-authored focused content, the application owns the resulting recovery
because Wayglass cannot know the next valid task target. The surrounding component must remain a
stable labeled region that can serve as an explicitly documented fallback where appropriate.

New records do not auto-scroll. Native scroll anchoring remains enabled. Follow-latest, jump-to-new,
unseen-count, or scroll-restoration behavior is added only by the timeline or event-log contract if
evidence supports it; none is inferred by the shared layer.

### Reading order follows DOM order

Wayglass does not visually reorder records away from their DOM and accessibility-tree order.
Applications own sorting and grouping. An accepted sorting or filtering control emits typed user
intent; the application updates the authored records and visible result context.

Components may use CSS layout to align fields, but grid placement, transforms, and `order` cannot
create a conflicting semantic sequence. Reverse chronological content is authored in reverse
chronological DOM order and labeled where the direction would otherwise be unclear.

### Data surfaces are not live regions

Metrics, telemetry, status lists, timelines, event logs, and tables have no implicit `aria-live`,
`role="status"`, or `role="alert"`. Condition, including critical condition, does not change that
default.

Applications own update importance and announcement copy. They use one deliberate feedback or live-
status owner to summarize a meaningful result, unseen-record count, filter result, or urgent new
occurrence. Components expose stable visible state and the context needed to author that message but
do not mirror every mutation into a private announcement region.

A later component may propose one narrowly scoped announcement event or opt-in coordinator only when
manual assistive-technology testing proves that consumer-authored delivery cannot provide consistent
timing. It may not add an `announce-every-update` mode.

### Loading and refresh remain authored state transitions

Components do not infer loading, staleness, emptiness, or failure from collection length, elapsed
time, network events, or missing values. Applications set the documented state and compose existing
Phase 2 feedback. Background refresh retains valid records and focus; initial loading may replace an
otherwise empty content area with a labeled busy state.

Busy semantics belong to the smallest stable region whose content is being replaced. They do not
make every descendant a live update or hide retained values.

### Performance uses a supported validation envelope

Phase 3 publishes an initial non-virtualized validation envelope rather than a device-independent
timing guarantee:

| Surface                   | Maximum reference fixture exercised without package-owned pagination or virtualization |
| ------------------------- | -------------------------------------------------------------------------------------: |
| Metric or key-value group |                                                                              24 values |
| Telemetry strip           |       240 samples in one strip; 12 strips with 120 samples in the integrated workspace |
| Status list               |                                                                            100 entries |
| Timeline                  |                                                                              100 items |
| Event log                 |                                                                            500 records |
| Data table                |                               200 rows by 20 columns, including row and column headers |

The mutation envelope exercises:

- replacement of 24 scalar values while preserving readable labels and units;
- replacement of one 240-sample telemetry series;
- in-place update and reorder of 100 status entries while a descendant remains focused;
- insertion of 50 event records without forced scroll or record-by-record announcement; and
- replacement of 20 table rows while header relationships and an unaffected focused action remain
  intact.

At the envelope, automated tests require usable interaction immediately after the next animation
frame, no component-created polling or unbounded observer loop, no unintended page overflow, and no
loss of focus or semantic relationships. A Chromium reference benchmark also records construction
and mutation durations and fails on a component-attributable synchronous task of 100 milliseconds or
more. The timing gate is an engineering regression threshold, not a public device SLA; fixture size,
hardware, browser version, and observed median are recorded with the result.

Applications with larger collections use application-owned paging, bounded windows, or another
reviewed strategy. Crossing the reference envelope is not evidence that Wayglass should silently add
virtualization; virtualized semantics, find behavior, focus, and reading position require a separate
contract.

## Consequences

- Component APIs remain narrow and domain-neutral, and applications keep their existing stores and
  framework reconciliation.
- Useful native and authored semantics can exist before Custom Element upgrade.
- Stable keys and DOM-node reuse become documented consumer responsibilities for dynamic
  collections.
- Wayglass cannot repair focus after arbitrary consumer removal; component contracts and examples
  must show safe application recovery.
- Applications write intentional announcement summaries instead of opting into noisy automatic
  speech.
- Telemetry may use structured numeric input, but its readable equivalent and state remain
  separately authored.
- The initial envelope catches accidental quadratic work and unsafe mutation without promising that
  thousands of semantic records need no paging or virtualization.

## Alternatives considered

### Universal `OperationalRecord` and data-source adapter

Rejected. The component families do not share one required schema, and adapters would pull fetching,
subscriptions, reconciliation, and application policy into the design system.

### JSON attributes for repeated records

Rejected. They lose native authored semantics, make useful pre-upgrade content difficult, duplicate
framework data, and encourage private rendering of application-owned actions and text.

### Component-owned keyed reconciliation

Rejected for the shared layer. It would duplicate React and application reconciliation, require a
universal identity API, and make focus recovery depend on hidden component state.

### Automatic live regions on operational surfaces

Rejected. Mutation frequency is not the same as importance, critical styling is not announcement
policy, and several simultaneous surfaces would produce duplicate or unusable speech.

### Package-owned virtualization from the beginning

Rejected. It changes native semantics, browser find behavior, focus movement, measurement, and
screen-reader navigation before the baseline components and real deployment volumes are known.

### No performance envelope

Rejected. “Application-owned scaling” without reference sizes would allow accidental component
overhead and make later pagination or virtualization decisions anecdotal.
