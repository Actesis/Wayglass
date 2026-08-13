# Phase 4 reference-application validation plan

**Status:** Proposed for Phase 4A on August 12, 2026. No reference-application implementation is
authorized until this plan is reviewed and accepted.

This plan defines the evidence required from the Cedar House, Northline Cold Storage, and Harbor Lab
reference applications. It extends the component-level evidence from Phases 1–3 into complete
application workflows without turning application policy, records, routing, or branding into
Wayglass package API.

Automated accessibility evidence is not a screen-reader claim. Timing results are regression
evidence from a recorded environment, not universal end-user latency guarantees.

## Supported baseline

- Current stable Chromium, Firefox, and WebKit projects configured by the repository.
- Private React/Vite applications consuming production Wayglass packages and typed React wrappers.
- Wayglass Dark and Wayglass Light with each application's local brand layer.
- Compact and comfortable density where the workflow supports both without hiding information.
- Phone at 320 by 900 CSS pixels, desktop at 1280 by 800, and wall at 1600 by 1000.
- 200% root text at a 320-CSS-pixel reflow width, long localized-looking content, and
  direction-neutral layout under `dir="rtl"`.
- Keyboard, pointer, and touch-sized controls; reduced motion, forced colors, and grayscale.
- VoiceOver with Safari on macOS and NVDA with Firefox on Windows as representative public-release
  gates. VoiceOver with iOS Safari remains required before a mobile assistive-technology claim.

## Validation tiers

The matrix separates behavioral compatibility from high-volume presentation permutations.

| Tier                             | Coverage                                                                 | Required use                                                                                                                                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A — supported-browser behavior   | Chromium, Firefox, and WebKit                                            | Every primary workflow, success and failure outcome, recovery path, route/back behavior, keyboard path, focus continuity, semantic assertion, and high-risk Axe scan at phone and desktop                                                   |
| B — extended application stress  | Chromium                                                                 | Full deterministic scenario set, maximum fixture, wall display, both themes, supported densities, brand layer, 200% text, long content, RTL mechanics, forced colors, grayscale, reduced motion, touch, mutation stability, and performance |
| C — representative manual review | Production builds in the named browser and assistive-technology pairings | Screen-reader tasks, production visual review, and formative first-glance review without converting observations into universal claims                                                                                                      |

Firefox and WebKit also receive one branded wall-display visual and containment check per
application. A failure in any engine blocks the affected behavior; Tier B is not permission to label
an essential workflow Chromium-only.

## Canonical route and task fixtures

Human-readable route paths are application-owned. Each app must expose these typed route identities
and stable fixture records so tests do not depend on display text alone.

| Application            | Required route identities                                             | Primary task                                                                 | Consequential path                                                                                    |
| ---------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Cedar House            | whole-home overview, Access focus, HVAC asset detail                  | Request a porch-light change and distinguish requested from confirmed value  | Secure the house; confirm scope, retain partial results, and expose the unresolved garage door        |
| Northline Cold Storage | operations overview, Dispatch focus, load `NL-2048` detail            | Filter and sort loads, inspect `NL-2048`, and return without losing context  | Request a dispatch hold; preserve confirmed truth through permission denial or failure                |
| Harbor Lab             | supervision overview, Review and Approval focus, task `HL-317` detail | Inspect task provenance and tool history, then return without losing context | Approve a merge request with exact target and effect; handle denial, timeout, failure, and completion |

Every route must have a useful title, one visible page heading, visible application and place
context, native-link navigation where a destination has a URL, and deterministic browser back and
forward behavior. Exactly one semantic composition mounts for the active route.

## Shared deterministic scenario vocabulary

The same query value has the same lifecycle meaning in every application. A scenario may omit a
state that cannot credibly apply, but it must not reinterpret it.

| Scenario            | Required meaning                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `steady`            | Confirmed current data, no request in progress, and no fabricated success condition            |
| `initial-loading`   | No retained domain value yet; labeled loading presentation owns no false value                 |
| `retained-refresh`  | Previously confirmed values remain visible and labeled while refresh activity is separate      |
| `stale`             | Retained values remain visible with explicit age or freshness context                          |
| `partial`           | Available sources remain usable while missing sources and affected scope are named             |
| `unavailable`       | The required source or function cannot currently provide trustworthy content                   |
| `permission-denied` | The user lacks authority for a named request; confirmed domain truth is unchanged              |
| `request-pending`   | Intent has been accepted locally but its requested value is not presented as confirmed         |
| `request-failed`    | The request ended without the claimed effect; retained truth and retry policy remain explicit  |
| `recovered`         | A prior degraded state has current confirmed data again without erasing relevant history       |
| `meaningful-update` | A new domain record arrives without forcing focus, reading position, or follow-latest behavior |

Scenario selection fixes the initial records, clock, scheduler, adapter result, and identifiers.
Tests resolve controlled promises directly; they do not depend on random values, wall-clock delay,
network access, or races. `scenario`, `theme`, `density`, and `dir` query parameters may select test
conditions but never replace the route identity.

Domain-specific extensions must cover:

- **Cedar House:** a partially completed secure-house request, failed lighting request, stale sensor
  beside a still-confirmed value, maintenance due, media loading, and media unavailable.
- **Northline:** a stale trailer source, hold denied, hold failed, recovery, and an inserted
  exception while the user is inspecting older records.
- **Harbor Lab:** stale evidence, approval denied, approval timeout, merge failure, recovery, a new
  tool record, and a cancellation or pause request whose guarantee is stated precisely.

## Application truth and workflow assertions

Every app must prove:

1. one application-owned record supplies every scalar, Boolean, status, temporal, tabular, media,
   and control projection of the same fact;
2. condition, knowledge, activity, value, permission, request state, and outcome remain independent;
3. no Boolean value is converted into healthy/failing merely because it is asserted or not asserted;
4. a control emits intent and the application owns pending, reconciliation, failure, and durable
   outcome state;
5. retained truth is not cleared during refresh or failed mutation unless the domain source actually
   invalidates it;
6. stable record keys preserve focused controls, authored selection, disclosure, scroll position,
   and route return context through meaningful updates;
7. removal of focused authored content moves focus to the application-defined continuation target;
8. each deliberate result has one visible durable owner and at most one announcement owner; and
9. ordinary data updates, media progress, and repeated records are not implicit live regions.

Application-specific assertions include:

- Cedar House identifies the HVAC asset through useful alternative text, preserves the media
  viewport across loading or failure, returns focus after inspection, and does not imply that
  recording a filter replacement verifies a sensor or repairs equipment.
- Northline preserves filter, sort, focused row action, and investigation position while records
  refresh or arrive. Its bounded-retention or paging policy remains visible and application-owned.
- Harbor Lab keeps agent availability, agent activity, task condition, evidence knowledge,
  confidence, and human attention distinct. Retry is a new attempt; approval, pause, cancellation,
  and reassignment text claims only the guarantees the adapter can provide.

## Responsive, theme, and brand matrix

Each application records these production-build reviews:

| Required composition             | Theme and density                                       | Primary purpose                                                                         |
| -------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 320 × 900 phone                  | Dark and the app's default density                      | Critical state, primary response, route navigation, touch targets, contained dense data |
| 1280 × 800 desktop               | Dark and Light; compact and comfortable where supported | Complete workflow, function separation, focus order, and long-content reflow            |
| 1600 × 1000 wall                 | Light plus branded layer and app-selected density       | At-a-distance priority, state legibility, and absence of hidden critical response       |
| 320 CSS pixels at 200% root text | Both official themes across the three apps              | Reflow, no page-level horizontal overflow, and reachable controls                       |

The Tier B matrix also covers RTL mechanics, forced colors, grayscale, and reduced motion on the
highest-risk route for each app. Meaning must survive without color or icons. Brand review confirms
that typography, shape, structural surfaces, accent, and density can differ while semantic roles,
non-color state text, focus visibility, and contrast remain intact.

Visual review is performed against the built application route rather than a whole-app Storybook
copy. It records route, scenario, viewport, browser, theme, density, direction, reviewer, date,
result, and corrective pull request. Screenshots may support the record but are not a substitute for
keyboard, responsive, or semantic inspection.

## Automated accessibility and interaction evidence

For every Tier A task, tests cover:

1. page title, heading hierarchy, landmarks, navigation context, names, descriptions, native
   relationships, and DOM-aligned reading order;
2. keyboard-only completion, visible focus, modal containment and return, and no unexpected focus
   movement during updates;
3. route navigation and back/forward restoration without duplicate interactive trees;
4. loading, stale, partial, unavailable, pending, denied, failed, recovered, and updated content
   without fabricated values or duplicate announcements;
5. status text and structure that remain understandable when color and optional icons are absent;
6. labeled contained scrolling for tables, logs, or media where reflow would destroy meaning;
7. image alternative text, loading and unavailable fallback, viewer controls, zoom, pan, close, and
   focus return where media is present;
8. minimum 44-by-44-CSS-pixel touch targets for primary and consequential controls; and
9. an Axe scan of the steady route and the highest-risk consequential failure state.

The extended Chromium suite additionally checks long content, root-text growth, responsive
containment, RTL layout mechanics, forced colors, reduced motion, grayscale, maximum fixtures, and
meaningful updates while focus or scroll context is inside the affected region.

## Representative data and performance envelopes

Phase 4 integration fixtures remain within the already-proven Phase 3 component maxima. They are
large enough to expose application coordination costs without redefining a public package limit.

| Application | Maximum application fixture                                                                                                             | Measured mutations                                                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Cedar House | 40 devices and assets, 24 simultaneous scalar or Boolean values, six 120-sample telemetry strips, and 60 history or maintenance records | One confirmed control change, one failed request retaining truth, one partial secure-house result, and replacement of all telemetry samples |
| Northline   | 80 active loads, 24 key values, eight 120-sample telemetry strips, 100 status entries, 250 events, and an 80-row by 12-column table     | Filter and sort, hold request lifecycle, insertion of 25 events away from the reading position, and replacement of 20 rows                  |
| Harbor Lab  | 60 tasks, 12 agents, 24 key values, six 120-sample telemetry strips, 250 task/tool events, and a 60-row by 10-column table              | Approval lifecycle, retry as a new attempt, insertion of 25 tool events, and replacement of 20 task rows                                    |

Chromium performance tests use production builds, load application modules before timing the
measured mount, perform three warm-up iterations, and record 15 measured iterations for initial
route construction and every listed mutation. Each record includes repository commit, operating
system, browser and version, hardware, application route, scenario, fixture size, warm-up and
iteration counts, median construction duration, median mutation duration, largest
application-attributable synchronous task, and any variance or correction.

The regression gates are:

- median measured construction and mutation duration remain below 100 milliseconds;
- no application-attributable synchronous task reaches 100 milliseconds;
- the committed state, semantics, focus, and intended overflow are observable by the next animation
  frame after the synchronous transition; and
- mutation does not cause unexpected focus movement, page overflow, follow-latest behavior, or
  movement of the focused control.

If the reference machine cannot reproduce a threshold consistently, the result blocks closeout until
the fixture, measurement boundary, environment variance, and any revised threshold are documented
and reviewed. It does not justify silently reducing the fixture.

## Representative assistive-technology procedures

VoiceOver/Safari and NVDA/Firefox must complete one route-orientation and one consequential workflow
per application:

1. identify the application, current place, primary condition, freshness, and available next action;
2. traverse function navigation and repeated data in browse mode without duplicate semantic owners;
3. enter the representative detail, inspect its table, history, or media, and return with context;
4. initiate the consequential action, review target and effect, cancel once, then confirm;
5. inspect pending plus one denied, timeout, partial, or failed outcome without hearing false
   success;
6. receive one deliberate result announcement and find the same durable visible result afterward;
7. experience a meaningful update while reading older content without forced speech or movement; and
8. recover from the degraded scenario and verify that confirmed truth and relevant history remain.

Each record names date, operating system, browser, assistive-technology version, app commit, route,
scenario, input method, expected result, observed result, and corrective pull request. Automated
implementation may finish with these gates explicitly carried, but no public release may include an
affected workflow until both desktop pairings pass or release scope explicitly excludes it.

## Formative first-glance review

At Phase 4E, each overview receives a structured five-second review from representative people at
desktop and wall size. After the exposure, ask what application and place they saw, what most needed
attention, and what action they believed was available. Record answers, confusion, route, viewport,
theme, participant context, and resulting changes. This is formative prioritization evidence, not a
statistical usability or safety claim, and it does not replace task-based accessibility review.

## Package and application boundary audit

Every milestone verifies that:

- each example package is private and imports no other reference application;
- production packages import nothing from `examples/` and expose no domain record, route, adapter,
  command, or scenario API;
- applications consume production component implementations rather than copies or private Shadow DOM
  structure;
- application styles use documented tokens or clearly private mechanical constants;
- no shared runtime layer appears without the extraction evidence required by ADR 0030; and
- no new dependency, live service, credential, analytics, persistence, publication, or deployment
  has entered the Phase 4 scope.

## Milestone evidence and exit rule

Phase 4B, 4C, and 4D each close only when the app's state and selector unit tests, Tier A browser
matrix, Tier B extended matrix, production visual review, boundary audit, exact case counts, and
carried manual-gate impact are recorded. Focused suites may run during implementation; the full
repository suite is authoritative at milestone closeout.

Phase 4E reruns all three production applications and the complete repository suite, completes or
explicitly carries manual assistive-technology gates, performs the cross-domain semantic and brand
review, records formative first-glance evidence when available, and publishes exact final counts.
Phase 4 cannot close on application screenshots, automated scans, or Chromium-only behavior.
