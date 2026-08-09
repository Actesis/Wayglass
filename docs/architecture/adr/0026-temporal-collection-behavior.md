# ADR 0026: Separate temporal views and keep reading context application-owned

- Status: proposed
- Date: 2026-08-09

## Context

Phase 3E introduces a curated timeline and a dense event log. Both contain authored occurrences and
must preserve identity, reading order, focus, and scroll during live updates. Their superficial
similarity creates pressure for one generic temporal list, one structured record schema, or a shared
live-update controller.

Those approaches would hide materially different jobs. Timeline items explain selected milestones
and intervals. Event records support dense inspection of a stream. Applications also differ in
whether “latest” follows occurrence time or receipt time, which records count as unseen, when a
person has left the latest boundary, and whether an update warrants speech.

The accepted [operational-data contract](../../data/operational-data.md) and
[ADR 0024](./0024-operational-data-ownership-and-updates.md) already establish consumer-owned data,
DOM continuity, authoritative DOM order, stationary updates, and no implicit live regions. The
[Phase 3E temporal-collection proposal](../../data/temporal-collections.md) requires a narrower
decision about component separation and reading-context behavior.

## Decision

### Use separate timeline and event-log families

Wayglass will define `wg-timeline` with `wg-timeline-item`, and `wg-event-log` with
`wg-event-record`. It will not define a generic temporal collection or shared public record element.

The collections may share private implementation helpers only for behavior whose semantics remain
identical: named ordered-list structure, visible chronology context, child diagnostics, busy state,
and stable slots. Private reuse must not force the record APIs or visual anatomy to converge.

Repeated records remain application-authored light DOM. No temporal-record type, JSON attribute,
records property, data source, or component-owned keyed reconciler is added.

### Make chronology visible while retaining authored order

Each collection requires an ascending or descending chronology value and localized visible wording.
The value describes authored DOM order; it never triggers sorting, reversal, or visual reordering.
DOM and accessibility-tree order remain the reading order in every writing direction.

Applications author occurrence time with readable native `<time>` content. Timeline intervals may
also author end time. Event records may author received time when it explains delay or out-of-order
delivery. Wayglass does not parse, compare, format, or refresh those values.

Grouping uses multiple named collections in application-authored sections. Wayglass does not infer
date, source, category, or severity groups.

### Preserve native content and interaction owners

Expandable record details use application-authored native `<details>` and `<summary>`. Media uses
the accepted Phase 2 media components. Links, buttons, and menu triggers remain independently
authored controls. A record and its whole surface are not interactive.

Occurrence condition, knowledge, and activity reuse the accepted Wayglass axes. A separate severity
enum is rejected because severity may mean impact, priority, logging level, or policy
classification. Applications author that context visibly and independently. An occurrence's state
never claims the source remains in that state now.

### Keep updates quiet and stationary

Neither collection uses `role="log"`, an implicit live region, automatic announcements, or
record-by-record speech. Insertions and updates do not move focus, disclosure, selection, or scroll.
Native scroll anchoring remains available, and the component does not create a fixed scrollport.

Applications may place a persistent unseen-record summary and explicit jump control in the
collection's status slot. When an update warrants speech, one application-selected feedback owner
announces a bounded summary. The inserted records themselves remain ordinary list content.

Follow-latest remains an application preference and policy. It is not a component property, method,
event, or automatic mode. Applications decide what “latest” and “seen” mean, suspend following when
the person leaves that boundary or interacts with older content, and resume only through explicit
policy or user intent. Applications also own scroll restoration after navigation, grouping,
filtering, paging, and retention.

### Validate a non-virtualized baseline

The baseline supports the existing Phase 3 envelope of 100 timeline items, 500 event records, and an
insertion burst of 50 records without forced scroll or record-by-record announcements. Larger
collections use application-owned retention, paging, or reviewed windowing. Virtualization is not
silently introduced because it changes native list semantics, browser find behavior, focus, and
reading position.

## Consequences

- Timeline and event-log APIs can evolve around their actual jobs instead of a
  lowest-common-denominator record.
- Light-DOM records preserve native semantics, framework identity, disclosure, media, controls, and
  useful pre-upgrade content.
- Reverse chronology remains honest because DOM, visual, and assistive-technology order agree.
- Applications must author chronology wording, record identity, grouping, unseen logic, and any
  follow-latest preference.
- Wayglass cannot promise automatic “tailing,” scroll restoration, or read receipts, but it avoids
  stealing context from a person inspecting older records.
- Native list semantics avoid the announcement expectations of `role="log"` and allow one deliberate
  feedback owner to summarize important changes.
- Deployment evidence can later justify pagination, virtualization, or a reusable reading-position
  helper without baking those policies into the first record components.

## Alternatives considered

### One generic temporal list with appearance variants

Rejected. A curated narrative and a dense inspectable stream have different minimum record anatomy,
density, detail, and validation needs. Appearance variants would conceal those semantic differences.

### One shared structured temporal-record property

Rejected. It would duplicate application data and framework reconciliation, weaken native fallback,
and force optional timeline and event fields into one unstable schema.

### `role="log"` with automatic announcements

Rejected. New records are not automatically important, multiple logs could speak at once, and the
role would couple visible collection semantics to live-update behavior. A named ordered list plus
one deliberate application-owned announcement is more predictable.

### Component-owned unseen count and follow-latest

Rejected. The component cannot know filter state, retention boundaries, occurrence-versus-receipt
ordering, user preferences, navigation restoration, or what the application considers seen. Hidden
automatic scrolling would also violate the accepted stationary-update rule.

### Component-owned details disclosure

Rejected. Native `<details>` and `<summary>` already own disclosure semantics, keyboard behavior,
state, and fallback. A second expansion API would duplicate platform behavior and complicate stable
record identity.

### Virtualization in the initial component

Rejected. It would weaken the native baseline before real deployment volumes demonstrate that the
accepted envelope is insufficient.
