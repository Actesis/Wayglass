# Phase 3 operational components

**Status:** Formal roadmap accepted on August 3, 2026. Phase 3A operational-data architecture is
complete; Phase 3B scalar data is implemented and its automated cross-browser validation and
production review are complete. The Phase 3C telemetry-strip contract and rendering architecture are
proposed for review and browser proof. Representative manual assistive-technology gates remain
carried with explicit release impact.

Phase 3 turns the Phase 1 and Phase 2 foundations into a reusable operational-data layer. It adds
scalar summaries, compact telemetry, status collections, temporal records, collection tools, and
accessible tables while preserving the independent domain value, condition, knowledge, and activity
axes established by Wayglass.

The phase remains domain-neutral. Its production composition may describe facilities, services,
accounts, assets, agents, or another operational system, but no component API may encode one of
those domains.

## Delivery principles

- Applications own records, identifiers, timestamps, values, units, precision, ordering, filtering,
  sorting, paging, retention, transport, and update frequency. Wayglass owns presentation,
  interaction, semantics, and emitted user intent.
- A value, trend, condition, knowledge state, and activity state remain independent. Rising is not
  automatically good; falling is not automatically bad; old data is not silently presented as
  current.
- Components expose real text and native semantics. Canvas-only data, tooltip-only values,
  color-only trends, and inaccessible visual substitutes are not acceptable.
- Live updates preserve reading position, focus, selection, and user control. Announcement is
  deliberate and bounded rather than inferred from every data mutation.
- Phone, desktop, and wall-display compositions are first-class. Dense information may use contained
  scrolling when reflow would destroy relationships, but the page itself must remain usable.
- Framework-neutral Custom Elements remain the behavior owners. React wrappers are typed entry
  points over the same implementation.

## Formal milestone sequence

### Phase 3A — Operational-data architecture

Define the shared rules before public APIs make incompatible assumptions.

- Inventory the existing metric, value-tile, state, control-request, feedback, layout, and native
  ownership contracts that Phase 3 must extend rather than duplicate.
- Draft an operational-data ownership contract covering stable identity, authored values and units,
  timestamps, ordering, partial or unavailable records, live replacement, and consumer-controlled
  formatting.
- Draft an architecture decision for data ownership, update delivery, focus stability, and bounded
  announcements. Do not create a universal application record or store unless component evidence
  proves one is necessary.
- Define the distinction between a present value, a historical sample, a status entry, a curated
  timeline item, and an event-log record.
- Define representative fixtures and the Phase 3 validation matrix before tokens or implementation.
- Review and accept the contract, architecture decision, milestone exit criteria, and any explicitly
  carried questions.

### Phase 3B — Metrics and key values

Extend the existing scalar-value foundation without rebuilding `wg-metric` or `wg-value-tile`.

- Specify metric-group, trend-indicator, and key-value-display contracts and any compatible
  extension required by the existing metric.
- Keep units, precision, comparison interval, and trend meaning application-authored. A trend cue
  must not invent condition or confidence.
- Lock only the tokens needed for grouping, comparison, direction, density, and responsive reflow.
- Implement framework-neutral components, typed React wrappers, and production-backed stories.
- Validate long and localized-looking values, missing comparisons, stale and unavailable knowledge,
  mixed conditions, keyboard and screen-reader reading order, themes, forced colors, reduced motion,
  zoom, and supported browsers.

### Phase 3C — Telemetry strip

Deliver a compact operational history, not a general chart package.

- Specify sample ownership, time window, scale, gaps, stale or unavailable segments, current-value
  context, and an equivalent textual summary.
- Decide the rendering architecture only after accessible fallback, resize behavior, and
  forced-colors behavior are proven. Pixels or paths never become the sole data representation.
- Keep streaming transport, aggregation, downsampling policy, forecasting, arbitrary axes, legends,
  annotations, and chart composition outside the component.
- Lock tokens, implement the element and React wrapper, and add production-backed steady, changing,
  sparse, stale, unavailable, and live-update fixtures.
- Validate responsive sampling, resize, high data volume within the accepted bound, update
  stability, accessible alternatives, themes, forced colors, reduced motion, zoom, and supported
  browsers.

### Phase 3D — Status list

Provide a scan-efficient collection of independently meaningful operational entries.

- Specify entry identity, primary and secondary text, independent state axes, optional values,
  timestamps, actions, grouping, and authored ordering.
- Preserve native list and control semantics, useful text without icons, and stable focus when items
  update, move, arrive, or leave.
- Compose existing indicators, badges, key values, stale markers, and actions instead of creating a
  second status language.
- Lock tokens, implement framework-neutral and React delivery, and add dense and comfortable
  production fixtures.
- Validate mixed states, long content, empty and loading replacement, dynamic mutation, touch,
  keyboard, screen readers, responsive behavior, themes, forced colors, zoom, and supported
  browsers.

### Phase 3E — Timeline and event log

Share only the record structure that the two temporal views genuinely have in common.

- Define a timeline as a curated sequence of meaningful milestones and an event log as a dense,
  inspectable stream of records; neither is merely a differently styled list.
- Specify timestamp semantics, chronological direction, grouping, severity and knowledge cues,
  source and category context, details, actions, new-record behavior, and retained reading position.
- Decide opt-in live announcements, unseen-record summaries, follow-latest behavior, and safe focus
  handling without making every event a notification.
- Keep retention, ingestion, auditing guarantees, search indexing, export, pagination, and
  virtualization application-owned unless measured evidence establishes a reusable contract.
- Lock tokens, implement elements and React wrappers, add production-backed fixtures, and validate
  temporal reading order, mutation, overflow, responsive density, assistive technology, themes,
  forced colors, reduced motion, zoom, and supported browsers.

### Phase 3F — Filter and command patterns

Create compositional working areas for existing controls rather than a query engine or universal
toolbar.

- Specify filter-bar and command-bar structure, labeling, grouping, responsive priority, overflow,
  submission, reset, result context, and focus order.
- Applications own filter definitions, query state, result calculation, persistence, command
  authorization, shortcuts, execution, and failure recovery.
- Reuse native form controls, buttons, segmented controls, menus, command items, badges, and result
  announcements. Do not pull command palettes, nested menus, or a generic toolbar into scope.
- Lock composition tokens, implement framework-neutral and React delivery, and add fixtures around
  status, event, and table collections.
- Validate keyboard and touch operation, accessible grouping, narrow-width prioritization, overflow
  discoverability, pending and unavailable actions, reset, focus retention, themes, forced colors,
  zoom, and supported browsers.

### Phase 3G — Data table

Deliver an accessible operational table while retaining native tabular relationships.

- Specify captions, column and row headers, cell content, empty and loading states, overflow,
  authored sorting controls, row actions, and live replacement.
- Start with a native table architecture. Responsive behavior may use a labeled scroll region but
  must not silently transform rows into cards or duplicate semantic ownership.
- Applications own schemas, data access, sorting, selection meaning, editing, pagination,
  virtualization, column persistence, export, and server interaction. Any promotion of those
  capabilities requires explicit evidence and review.
- Lock tokens, implement framework-neutral and React delivery, and add sparse, dense, wide, empty,
  loading, stale, and unavailable fixtures.
- Validate header relationships, reading and focus order, sorting intent, row actions, mutation,
  contained overflow, sticky presentation where accepted, 320 CSS-pixel width, 200% text size,
  touch, assistive technology, themes, forced colors, zoom, and supported browsers.

### Phase 3H — Integration and closeout

Prove the components as one system rather than a catalog of isolated demonstrations.

- Compose a domain-neutral Operational Activity workspace using metrics, telemetry, status, temporal
  records, filters, commands, and a data table across simultaneous and focused functions.
- Add equivalent framework-neutral and React examples without duplicating state or interaction
  behavior.
- Verify that loading, stale, unavailable, mixed-condition, live-update, and empty states remain
  understandable across component boundaries.
- Complete production documentation, package exports, typed wrappers, Storybook coverage, and the
  dedicated docs site.
- Run the full accessibility, responsive, visual-state, framework, performance-bound, and
  Chromium/Firefox/WebKit matrix; complete or explicitly carry representative assistive-technology
  gates with release impact.
- Audit deferred and revised candidates before Phase 4 without silently widening the three reference
  applications.

## Required decision records

Phase 3A must determine the smallest necessary set. The expected starting set is:

1. operational-data ownership, identity, updates, and announcements;
2. telemetry rendering and accessible equivalence;
3. temporal collection behavior for timelines and event logs; and
4. native table ownership and responsive containment.

A milestone may combine decisions when one architecture genuinely governs multiple components, but
it must not hide materially different ownership or accessibility tradeoffs in a broad “data
components” decision.

## Deliberate boundaries

Phase 3 does not add a chart package, application data model, state store, transport client, query
language, stream processor, alerting engine, audit system, command palette, generic toolbar,
spreadsheet grid, tree grid, data editor, or domain-specific component. Pagination, virtualization,
selection, inline editing, export, saved views, column customization, and follow-latest behavior are
compatible future capabilities, not implied deliverables.

The evidence-driven candidates retained by the
[Phase 2 roadmap disposition](./phase-2-roadmap-disposition.md) remain unassigned unless a Phase 3
contract demonstrates a reusable need and an approved proposal explicitly promotes them.

## Phase exit criteria

Phase 3 is complete only when every accepted component has a framework-neutral implementation, typed
React wrapper, package export, contract documentation, production-backed story, supported-browser
coverage, and accessibility evidence; the integrated workspace passes the full repository matrix;
and every unresolved manual or deployment-dependent validation has a named owner and release impact.
