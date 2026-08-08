# Phase 3 validation plan

**Status:** Proposed for Phase 3A review on August 3, 2026. This plan defines the evidence every
Phase 3 milestone must produce and the integrated closeout matrix. It will become the cumulative
validation record as components are delivered.

Phase 3 adds dense, dynamic operational data. Passing static role queries is insufficient: the
system must preserve data meaning, native relationships, focus, reading and scroll context, and
bounded performance while authored records change.

## Supported baseline

- Current stable Chromium, Firefox, and WebKit projects configured by the repository.
- Framework-neutral Custom Elements and typed React wrappers using identical implementation.
- Dark and light Wayglass themes, compact and comfortable density, forced colors, reduced motion,
  grayscale inspection, and non-color state text.
- Phone at 320 CSS pixels, desktop, wall display, 200% text size, and zoom-equivalent reflow.
- Keyboard, pointer, and touch-sized controls.
- VoiceOver with Safari on macOS and NVDA with Firefox on Windows as representative public-release
  gates; VoiceOver with iOS Safari remains required before a mobile assistive-technology claim.

## Validation dimensions

| Dimension              | Required evidence                                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data truth             | Domain value, condition, knowledge, activity, trend, loading, and availability remain independently labeled through every applicable combination.                                                       |
| Native semantics       | Headings, lists, time, images, tables, labels, controls, and scroll regions retain native or explicitly authored roles, names, relationships, and reading order.                                        |
| Mutation stability     | Connected focused nodes remain focused; authored selection, disclosure, and scroll context remain stable; new records do not force focus or follow-latest behavior.                                     |
| Announcement ownership | Static and ordinary updated data are not implicit live regions; each deliberate dynamic result has one tested announcement owner and durable visible outcome.                                           |
| Responsive containment | Relationships survive narrow containers and text growth; dense data uses labeled contained overflow only where reflow would destroy meaning.                                                            |
| Visual adaptation      | State, trend, freshness, grouping, focus, and interactive affordances remain distinguishable in both themes, forced colors, grayscale, and reduced motion.                                              |
| Framework parity       | Attributes, properties, slots, native events, typed Custom Events, methods, refs, fallback content, and mutation behavior match between vanilla and React entry points.                                 |
| Performance envelope   | Maximum reference fixtures and mutation scenarios from ADR 0024 complete without component tasks at or above the recorded regression threshold, focus loss, semantic loss, or unintended page overflow. |

## Milestone evidence

### Phase 3A — Architecture

- Accepted operational-data contract and ADR.
- Production-representative fixture sizes and mutation scenarios.
- Test harness design for timing records, focus continuity, scroll stability, and absence of
  implicit live regions.

### Phase 3B — Metrics and key values

- Long, negative, zero, decimal, large, unitless, mixed-unit, and localized-looking values.
- Trend absent, unknown, steady, rising, falling, and mixed independently from every applicable
  condition and knowledge state.
- Metric groups at the 24-value envelope with stable reading order and responsive reflow.

### Phase 3C — Telemetry

- Steady, sparse, gapped, changing, out-of-range, stale, unavailable, and live-replaced series.
- Equivalent readable value, unit, time window, state, and trend summary without relying on rendered
  paths or pixels.
- One 240-sample strip and 12 simultaneous 120-sample strips; resize and replacement without
  unbounded observers or announcement.

### Phase 3D — Status list

- Mixed condition, knowledge, activity, value, time, metadata, and action content with icon-free
  meaning.
- Empty, filtered-empty, initial loading, refresh, partial, offline, and unavailable collections.
- One hundred stable entries updated and reordered while focus and reading context remain valid.

### Phase 3E — Timeline and event log

- Past milestones, intervals, current activity, inferred time, delayed receipt, duplicated visible
  events, chronological directions, grouping, details, and actions.
- New-record and burst updates with no forced scroll or implicit speech; deliberate unseen-summary
  announcements tested separately.
- One hundred timeline items and 500 event records, including insertion of 50 records away from and
  at the newest boundary.

### Phase 3F — Filters and commands

- Native labeling, grouping, submission, reset, applied-filter summary, result context, overflow,
  pending commands, rejection, and unavailable actions.
- Keyboard and touch operation at narrow widths without moving consequential actions into an
  undiscoverable mode.
- Application updates results; intent events do not mutate records or claim command success.

### Phase 3G — Data table

- Caption, column headers, row headers, simple and compound cell content, authored sorting controls,
  row actions, and empty or loading replacement.
- Sparse, dense, wide, stale, unavailable, and dynamically replaced data with native table
  relationships intact.
- Two hundred rows by 20 columns plus replacement of 20 rows; narrow layouts use a labeled scroll
  region rather than card transformation.

### Phase 3H — Integration

- Operational Activity in simultaneous and focused compositions at phone, desktop, and wall sizes.
- Shared records presented consistently across scalar, status, temporal, and tabular views without
  duplicate state or announcement ownership.
- Full repository suite, production Storybook review, framework examples, and assistive-technology
  gate ledger updated with exact case counts and carried release impact.

## Automated matrix

Each applicable component fixture must cover:

1. side-effect-free import and explicit registration;
2. useful client-only fallback before upgrade;
3. public attributes, properties, slots, parts, methods, and events;
4. native semantics, accessible names and descriptions, relationships, and DOM-aligned reading
   order;
5. keyboard operation, focus visibility, focus continuity, and no unexpected focus movement;
6. initial rendering plus in-place update, reorder, insertion, removal, and partial replacement;
7. absence of implicit live-region semantics and duplicate announcements;
8. dark, light, forced-colors, and reduced-motion presentation;
9. 320 CSS-pixel containment, 200% text, touch targets, and intended internal overflow;
10. the component’s maximum reference fixture and mutation envelope;
11. Axe scans in supported themes and high-risk states; and
12. the same behavior through the typed React wrapper.

The complete browser matrix runs every definition in Chromium, Firefox, and WebKit. Focused
milestone suites run during implementation; the complete repository suite is authoritative at each
milestone closeout.

## Performance record

The performance test records repository commit, operating system, browser and version, hardware,
fixture size, warm-up count, iteration count, median construction duration, median mutation
duration, largest component-attributable synchronous task, and any variance or correction.

Chromium enforces the 100-millisecond synchronous-task regression threshold from ADR 0024. All three
engines validate functional readiness by the next animation frame, focus continuity, semantic
relationships, and overflow at the maximum fixture. Timing numbers compare regressions in the
recorded reference environment; they are not presented as universal end-user latency guarantees.

## Representative assistive-technology procedures

For each new component family, VoiceOver/Safari and NVDA/Firefox review must verify:

1. entry announcement, visible and accessible name, role, reading order, and state or value context;
2. virtual-cursor or browse-mode navigation through repeated data without duplicate semantic owners;
3. keyboard operation of authored links, actions, filters, commands, sort controls, details, and
   contained scrolling;
4. update behavior while focus or reading position is inside, before, and after the changed records;
5. absence of unsolicited record-by-record speech during ordinary and burst updates;
6. one deliberate application-authored result or unseen-update summary with no duplicate delivery;
7. stale, unknown, conflicting, unavailable, loading, partial, empty, and failure context without
   fabricated values; and
8. equivalent vanilla and React entry behavior.

Each record names the date, operating system, browser, assistive-technology version, fixture, input
method, expected result, observed result, and corrective pull request. A component family may finish
automated implementation with a carried manual gate, but it may not enter a public release until
both desktop representative pairings pass or the release scope explicitly excludes it.

## Exit rule

A Phase 3 milestone closes when its accepted contracts are implemented, its focused automated suite
passes in all supported engines, production visual review is recorded, and every representative
manual gate is either complete or carried with explicit release impact. Phase 3 closes only after
the integrated composition and complete repository matrix pass with final exact counts.
