# Phase 3E temporal-collection contracts

**Status:** Accepted for Phase 3E on August 9, 2026. This contract defines the boundary for
`wg-timeline`, `wg-timeline-item`, `wg-event-log`, and `wg-event-record`. Its required public tokens
are locked. Both framework-neutral collection families and their focused cross-browser tests are
implemented; React delivery, production stories, and full validation remain. It follows the accepted
[operational-data ownership contract](./operational-data.md),
[ADR 0024](../architecture/adr/0024-operational-data-ownership-and-updates.md), and accepted
[ADR 0026](../architecture/adr/0026-temporal-collection-behavior.md).

Timeline and event-log records both describe occurrences over time, but they answer different
questions. A timeline explains the meaningful progression of a subject. An event log supports dense
inspection of an authored occurrence stream. Wayglass shares their safe collection behavior without
turning them into two appearances of one generic list.

## Shared requirements

All four accepted elements:

- import without registration side effects and expose explicit registration functions;
- preserve consumer-authored light DOM, native controls, event handling, stable DOM nodes, and
  framework keys;
- use application-formatted visible text and consumer-authored native `<time>` elements;
- keep occurrence condition, knowledge, and activity independent from domain value and from the
  current state of the occurrence source;
- never infer identity, chronology, grouping, severity, receipt delay, loading, emptiness,
  importance, or actionability from authored content;
- never sort, filter, group, reconcile, select, acknowledge, expand, announce, focus, or scroll
  records in response to a data mutation;
- remain useful as authored text before client-only upgrade;
- provide typed React wrappers over the same framework-neutral elements; and
- remain coherent across accepted themes, densities, directions, accessibility modes, container
  sizes, and display classes.

## Why there are two collection families

`wg-timeline` is a curated narrative. Its items may be milestones or intervals, and omission is
expected: applications include the occurrences that explain progress, causality, transition, or
context. Timeline layout can emphasize sequence and relationships, but it does not promise an
exhaustive history.

`wg-event-log` is a dense inspectable stream. Its records favor consistent field placement, source
and category context, receipt-time differences, compact actions, and sustained scanning. It does not
promise persistence, tamper evidence, completeness, or compliance-grade auditing.

A timeline item and event record therefore do not share one public record element or structured
record type. Their genuinely shared contract is limited to consumer-owned identity and ordering,
authored temporal content, native list semantics, independent known-state axes, and stable update
behavior.

## Time, chronology, and grouping

Occurrence time is the primary temporal meaning. Applications author it as visible text, preferably
with a native `<time datetime="…">` element. An interval authors both a start and an end, or visible
ongoing wording when no end exists. An event may additionally show receipt time when delayed or
out-of-order delivery matters. Updated-at metadata is ordinary authored context and never replaces
occurrence time.

Each collection requires `chronology="ascending"` or `chronology="descending"` plus a localized,
visible `chronology-label`, such as “Oldest to newest” or “Newest to oldest.” The value describes
the authored DOM order; it does not cause sorting or CSS reversal. A mismatch is invalid consumer
markup, but Wayglass cannot reliably compare arbitrary authored timestamps and never rewrites
content.

DOM and accessibility-tree order are always reading order. Ascending places the earliest authored
record first. Descending places the latest authored record first. Writing direction changes logical
layout, not chronology.

Grouping is application-authored with multiple named collections inside native sections, panels,
stacks, tabs, or Function Deck functions. The components do not infer day, source, category, or
severity groups and do not add a group attribute. A visible group heading remains understandable
when records cross a date boundary or a filter removes neighboring groups.

## State scope, severity, source, and category

The shared `condition`, `knowledge`, and `activity` properties qualify one occurrence at its
authored time:

- condition communicates the application-authored operational meaning of that occurrence;
- knowledge communicates how the application knows the occurrence;
- activity communicates work represented by the occurrence, such as an ongoing interval.

They do not describe the current condition, knowledge, or activity of the source. An old critical
event does not assert that its source is still critical. A separate current-status component is
required when current source state matters.

“Severity” is not added as a second Wayglass condition enum. Some domains use severity for impact,
priority, logging level, policy classification, or escalation, and those meanings are not
interchangeable. Applications author a visible severity or priority in `metadata` or the event
record's `category` slot, using a badge when compact scanning helps. They may also supply occurrence
condition when its established meaning applies. Neither value is inferred from the other.

Source, category, public identifiers, correlations, and references remain optional authored text.
They are displayed only when they help people inspect or act on the record. Wayglass does not use
them as durable identity, filtering keys, or accessible names by default.

## Details, media, and actions

Supporting details remain light DOM. Applications use native `<details>` and `<summary>` when
disclosure is useful, ordinary content when it should always remain visible, and the accepted media
components for images or media inspection. This preserves native disclosure state and avoids a
second component-owned expansion API.

Links, buttons, menu triggers, and other actions retain their documented events and focus behavior.
The record surface is not a whole-row command. Action names identify both the operation and target;
nearby layout alone is not sufficient.

Removing a record that contains focus remains an application-owned destructive update. The
application first moves focus to a stable, task-appropriate target or defers removal. Wayglass
cannot infer whether the next record, collection heading, filter, or another function is correct.

## New records, announcements, and reading position

The default update behavior is intentionally quiet and stationary:

- insertion does not announce the new record;
- insertion does not move focus, selection, or disclosure;
- insertion does not call `scrollIntoView`, change `scrollTop`, or disable native scroll anchoring;
- the collection does not synthesize an unseen count; and
- the collection does not enter or leave a follow-latest mode.

Applications that receive meaningful off-screen records compose a persistent summary and an explicit
jump action in the collection's `status` slot. For example, “12 newer records” with a “Jump to
newest” button. The summary is application-owned because filters, retention, correlation, receipt
order, user preferences, and what counts as “seen” are application policy.

The summary is not automatically live. When one bounded update warrants speech, the application uses
one accepted feedback owner, normally a concise `wg-alert` with an explicit announcement mode, and
does not also announce the inserted records. Bursts are summarized rather than spoken one record at
a time. Critical occurrence condition does not automatically select assertive delivery.

Follow-latest remains an application-owned opt-in preference, not a component property. An
application may keep a view at its latest boundary only while the person has explicitly enabled the
behavior and remains at that boundary. Moving away, focusing or selecting older content, opening
details, or invoking a “pause updates” affordance suspends following. Resumption is explicit. A jump
action moves scroll only after user intent and moves focus only when its visible label and task make
that consequence clear.

The application also owns scroll restoration across navigation, filters, grouping, paging, and
retention. If it creates a contained scroll region, that region has a visible label and remains
keyboard accessible without trapping focus. The collection itself does not create a fixed-height
scrollport.

## `wg-timeline`

### Purpose and anatomy

`wg-timeline` presents one visibly named, curated temporal sequence. It owns the collection
boundary, ordered-list semantics, a visible chronology label, sequence presentation, responsive
spacing, and optional collection context.

Use it to explain milestones, transitions, and intervals where the relationship between selected
occurrences matters. Do not use it for an exhaustive stream, current status set, process stepper,
calendar, schedule editor, activity feed, or compliance audit.

Its anatomy contains a visible heading, optional description, visible chronology label, optional
collection actions, optional authored feedback or new-record summary, and one ordered list of
timeline items.

### Behavior and accessibility

Only direct `wg-timeline-item` children participate in the supported list anatomy. The component
does not connect items semantically beyond their ordered-list relationship or claim cause and
effect. Visual sequence lines, nodes, and interval geometry are decorative and hidden from the
accessibility tree.

The item container exposes list semantics and is named by the visible heading or `label` fallback.
The collection is not a live region and is not focusable. `busy` exposes bounded replacement or
refresh activity without erasing retained items or announcing each mutation.

### API

Attributes and properties:

- `label: string`: required visible and accessible fallback heading.
- `chronology: 'ascending' | 'descending'`: required description of authored DOM order.
- `chronology-label: string`: required localized visible wording for that order.
- `busy: boolean`: bounded loading, refresh, or replacement activity; default `false`.

Slots:

- `heading`: optional visible heading; overrides visible `label` while it remains the fallback.
- `description`: optional sequence context.
- `actions`: optional collection-level native or Wayglass controls.
- `status`: optional loading, empty, partial, failure, refresh, paused-update, or unseen-record
  composition outside list semantics.
- default: direct `wg-timeline-item` children in authored reading order.

Events and methods: none.

CSS custom properties:

- `--wg-timeline-color-background`
- `--wg-timeline-color-border`
- `--wg-timeline-color-heading`
- `--wg-timeline-color-context`
- `--wg-timeline-radius`
- `--wg-timeline-space`
- `--wg-timeline-space-item`

CSS parts:

- `base`
- `header`
- `heading`
- `chronology`
- `description`
- `actions`
- `status`
- `list`

## `wg-timeline-item`

### Purpose and anatomy

`wg-timeline-item` presents one curated milestone or interval. It contains required occurrence-time
content, a required visible heading, persistent known-state meaning, optional description, end-time,
metadata, details, media, and actions.

`kind="milestone"` describes an occurrence placed at a point in the authored sequence.
`kind="interval"` describes a span and requires authored end-time or visible ongoing wording. Kind
changes sequence presentation only; it does not calculate duration or activity.

### Behavior and accessibility

The host exposes list-item semantics. Its reading sequence is occurrence time, optional end time,
heading, applicable state, description, metadata, details or media, then actions. Condition always
has visible text and a non-color cue. Non-default knowledge and activity remain visible.

The item is display-only and not focusable. It does not format time, calculate duration, infer an
active interval, toggle details, or make its whole surface clickable. The application retains the
same node for the same curated occurrence.

### API

Attributes and properties:

- `label: string`: required visible and accessible fallback heading.
- `kind: 'milestone' | 'interval'`: default `milestone`.
- `condition`, `knowledge`, and `activity`: accepted Wayglass known-state axes; defaults are
  `neutral`, `confirmed`, and `idle`.

Slots:

- `time`: required visible occurrence or interval-start time, preferably native `<time>`.
- `end-time`: optional interval end time or visible ongoing wording; invalid on a milestone.
- `heading`: optional visible heading; overrides visible `label` while it remains the fallback.
- default: optional concise description.
- `metadata`: optional authored context, including severity, category, source, or reference.
- `details`: optional ordinary content or native disclosure, including accepted media compositions.
- `actions`: optional consumer-authored controls.

Events and methods: none.

CSS custom properties:

- `--wg-timeline-item-color-heading`
- `--wg-timeline-item-color-detail`
- `--wg-timeline-item-color-state`
- `--wg-timeline-item-color-condition`
- `--wg-timeline-item-color-sequence`
- `--wg-timeline-item-color-signal-border`
- `--wg-timeline-item-radius-signal`
- `--wg-timeline-item-space`
- `--wg-timeline-item-space-related`
- `--wg-timeline-item-size-signal`
- `--wg-timeline-item-width-sequence`

CSS parts:

- `base`
- `sequence`
- `signal`
- `content`
- `time`
- `end-time`
- `heading`
- `state`
- `condition`
- `knowledge`
- `activity`
- `description`
- `metadata`
- `details`
- `actions`

## `wg-event-log`

### Purpose and anatomy

`wg-event-log` presents one visibly named dense stream of inspectable event records. It owns the
collection boundary, ordered-list semantics, visible chronology label, consistent field alignment,
responsive density, and optional collection context.

Use it when people need to scan occurrences, compare source or category context, inspect details, or
reach record-local actions. Do not use it as a current-status list, notification center, chat
transcript, terminal emulator, security audit guarantee, or package-owned query surface.

Its anatomy matches the timeline at the collection level while retaining event-log-specific record
layout. It deliberately does not use `role="log"`; that role carries live-update expectations that
conflict with Wayglass's quiet default and application-owned announcement policy.

### Behavior and accessibility

Only direct `wg-event-record` children participate in the supported list anatomy. The record
container exposes named list semantics. The event log is not focusable and adds no keyboard model.
`busy` marks bounded refresh or replacement without clearing retained records.

At the accepted Phase 3 envelope, one log supports 500 authored records and insertion of 50 records
without component-owned pagination, virtualization, forced scroll, or record-by-record speech.
Larger or long-lived streams use application-owned retention, paging, or reviewed windowing.

### API

Attributes and properties:

- `label: string`: required visible and accessible fallback heading.
- `chronology: 'ascending' | 'descending'`: required description of authored DOM order.
- `chronology-label: string`: required localized visible wording for that order.
- `busy: boolean`: bounded loading, refresh, or replacement activity; default `false`.

Slots:

- `heading`: optional visible heading; overrides visible `label` while it remains the fallback.
- `description`: optional stream context, including the authored ordering basis when needed.
- `actions`: optional collection-level native or Wayglass controls.
- `status`: optional loading, empty, partial, failure, refresh, paused-update, or unseen-record
  composition outside list semantics.
- default: direct `wg-event-record` children in authored reading order.

Events and methods: none. This collection-level parity with `wg-timeline` does not imply
interchangeable record semantics or one shared implementation class.

CSS custom properties:

- `--wg-event-log-color-background`
- `--wg-event-log-color-border`
- `--wg-event-log-color-heading`
- `--wg-event-log-color-context`
- `--wg-event-log-radius`
- `--wg-event-log-space`
- `--wg-event-log-space-record`

CSS parts:

- `base`
- `header`
- `heading`
- `chronology`
- `description`
- `actions`
- `status`
- `list`

## `wg-event-record`

### Purpose and anatomy

`wg-event-record` presents one occurrence in an authored stream. It contains required occurrence
time and summary, persistent known-state meaning, and optional received time, source, category,
reference, metadata, details, media, and actions.

Occurrence time remains primary. Received time appears only when delivery timing materially changes
interpretation. The application may order by occurrence time or receipt time, but its visible
chronology wording must say which sequence is shown when ambiguity matters.

### Behavior and accessibility

The host exposes list-item semantics. Its reading sequence is occurrence time, summary, applicable
state, received time, source, category, reference, metadata, details or media, then actions. The
record is display-only and not focusable. It does not parse log text, correlate records, infer
severity, calculate latency, acknowledge an occurrence, or make the whole row clickable.

Duplicate visible summaries remain distinct occurrences with distinct application identity. The
application reuses the same node when correcting or enriching the same occurrence and creates a new
node for a genuinely new occurrence.

### API

Attributes and properties:

- `label: string`: required visible summary fallback.
- `condition`, `knowledge`, and `activity`: accepted Wayglass known-state axes; defaults are
  `neutral`, `confirmed`, and `idle`.

Slots:

- `time`: required visible occurrence time, preferably native `<time>`.
- `summary`: optional visible summary; overrides visible `label` while it remains the fallback.
- `received-time`: optional visibly labeled receipt time, preferably native `<time>`.
- `source`: optional visibly labeled occurrence source.
- `category`: optional visibly labeled category, severity, priority, or logging level.
- `reference`: optional visible public identifier or correlation reference.
- `metadata`: optional additional concise context.
- `details`: optional ordinary content or native disclosure, including accepted media compositions.
- `actions`: optional consumer-authored controls.

Events and methods: none.

CSS custom properties:

- `--wg-event-record-color-background`
- `--wg-event-record-color-border`
- `--wg-event-record-color-summary`
- `--wg-event-record-color-detail`
- `--wg-event-record-color-state`
- `--wg-event-record-color-condition`
- `--wg-event-record-color-signal-border`
- `--wg-event-record-radius`
- `--wg-event-record-radius-signal`
- `--wg-event-record-space`
- `--wg-event-record-space-related`
- `--wg-event-record-size-signal`

CSS parts:

- `base`
- `signal`
- `content`
- `time`
- `summary`
- `state`
- `condition`
- `knowledge`
- `activity`
- `received-time`
- `source`
- `category`
- `reference`
- `metadata`
- `details`
- `actions`

## Responsive behavior

Both collections remain in one logical block flow and never visually reverse record order. At narrow
container widths, record fields stack in documented reading order and actions follow informational
content. Essential time, summary, state, and sole values do not truncate. Long identifiers and
unbroken content wrap or use a consumer-owned labeled detail treatment without creating page-level
horizontal overflow.

Timeline sequence geometry adapts without becoming meaning-bearing. Event-log alignment may become
less tabular as space narrows, but visible field labels preserve relationships. Density is inherited
from the active theme and does not change merely because the viewport changed.

## Deferred and excluded behavior

The following remain application-owned and outside these component APIs:

- ingestion, subscriptions, durable storage, retention, deletion, and auditing guarantees;
- date, source, category, severity, or correlation grouping;
- sorting, filtering, search, indexing, export, and saved views;
- pagination, virtualization, bounded-window replacement, and scroll restoration;
- seen state, acknowledgements, selections, bulk actions, and read receipts;
- follow-latest preference, pause/resume policy, unseen-count calculation, and jump behavior;
- timestamp parsing, time-zone conversion, relative-time refresh, duration, and receipt latency;
- causal graphs, nested timelines, process steppers, calendars, terminal output, and chat behavior.

These are compatible later capabilities only after deployment evidence proves a reusable contract.
The collection slots deliberately permit application compositions without implying future package
ownership.

## Resolved contract decisions

1. Timeline and event log remain separate collection and record families.
2. Their records remain authored light DOM; no shared structured record type is added.
3. Chronology is explicit, visible, localized, and consistent with DOM order; components do not
   sort.
4. Native disclosure owns expandable details, and accepted media components own media inspection.
5. Condition describes an occurrence, while domain-specific severity remains authored context.
6. Event logs use named list semantics rather than the implicitly live `log` role.
7. Announcements, unseen counts, follow-latest, and scroll restoration remain application-owned
   compositions; Wayglass provides stable slots and stationary update behavior.
8. Public tokens are locked only for intentional surfaces, sequence and signal geometry, text roles,
   radii, and density-aware spacing; implementation, stories, and validation proceed in later
   reviewable slices.
