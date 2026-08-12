# Phase 4 reference-application contract

**Status:** Proposed for Phase 4A review on August 12, 2026. This contract defines the smallest
credible workflow and existing Wayglass surface for each Phase 4 reference application. It does not
select application architecture, authorize implementation, or add public package APIs.

The [formal Phase 4 roadmap](../phase-4.md) requires three applications that test the design
language under different domain pressure. This contract fixes what each application must prove
before Phase 4A selects renderer, routing, adapter, fixture, and validation architecture.

## Shared application contract

Each reference application has one primary user, operating context, shared application truth, and
complete task loop. Secondary screens may support that loop, but component coverage is never a
reason to add a screen.

Every primary workflow must expose:

1. **orientation:** named application, current place, current scope, and path to broader context;
2. **awareness:** current values, condition, knowledge, activity, freshness, and meaningful change;
3. **decision context:** expected state, consequence, uncertainty, and relevant history;
4. **action:** explicit function and target ownership with permission and availability stated;
5. **confirmation:** requested state remains distinct from confirmed effect, with durable outcome;
6. **failure:** retained truth, what failed, what remains safe, and an available recovery path; and
7. **continuity:** stable focus, record identity, reading position, selection, and one deliberate
   announcement owner through updates.

The applications use production Wayglass packages and native authored content. Domain records, state
transitions, scenario presets, selectors, adapters, routes, formatting, permissions, and
announcement copy remain application-owned. Similar names or fields across domains do not establish
a shared type.

## Existing-system inventory

| Need                               | Accepted Wayglass surface                                                                                                           | Application responsibility                                                                                |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Application and function structure | canvas, frame, panel, stack, cluster, grid, split, rail, elbow, divider, overview and Function Deck compositions                    | information architecture, route scope, function order, responsive composition choice                      |
| State and glanceability            | status indicator, Boolean value, metric, metric group, value tile, key-value, trend indicator, telemetry strip, badge, stale marker | domain labels, values, units, condition, knowledge, activity, freshness, thresholds, comparison meaning   |
| Collections and investigation      | status list, timeline, event log, data table, scroll region, filter bar, command bar                                                | identity, ordering, querying, filtering, sorting, grouping, retention, paging, update importance          |
| Action and selection               | button, icon button, toggle, segmented control, tabs, navigation rail, menu, command item, native form controls                     | authorization, execution, request correlation, optimistic policy, retry, cancellation, undo, audit        |
| Durable and transient feedback     | alert, progress, skeleton, empty state, offline state, toast region, confirmation dialog                                            | outcome wording, lifetime, deliberate announcement owner, what remains true, recovery policy              |
| Asset and supporting media         | native image, `wg-media`, `wg-media-viewer`, `wg-dialog`                                                                            | URL, authorization, source selection, metadata, alternative text, storage, transformation, asset identity |
| Brand adaptation                   | semantic tokens, official themes, density, typography and shape roles                                                               | app-owned brand layer that preserves state semantics, focus, contrast, and structural meaning             |

No inventory gap currently requires a new component. A reference application may compose ordinary
native HTML and app-local CSS when no package abstraction is warranted.

## Smart-home application brief

### User and environment

The primary user is a resident checking and operating a synthetic occupied home named **Cedar
House**. The same application is used briefly from a phone, deliberately from a desktop or tablet,
and passively from a shared wall display. It must remain understandable without technical entity
identifiers or home-automation knowledge.

### Primary workflow

The resident answers “Is the house settled for the evening?” and resolves the one condition that
prevents that known state.

The stable application truth covers these peer functions:

- **Comfort and air:** indoor temperature, target, HVAC activity, recent trend, air-handler
  availability, filter condition, and last confirmed observation;
- **Access and safety:** exterior openings and locks as Boolean values, independent device condition
  and knowledge, and security-sensitive responses;
- **Lighting:** room and exterior lighting as asserted or not-asserted values, with routine controls
  and requested-versus-confirmed transitions;
- **Energy:** present use, recent history, source freshness, and explanatory context without turning
  rising usage into an inferred problem; and
- **Maintenance:** due work, affected asset, identifying image, instructions, history, and
  completion evidence.

The representative issue is an overdue HVAC return-filter change while the air handler remains
available and indoor comfort remains normal. This keeps maintenance attention separate from device
failure. The asset detail uses an identifying photograph and the accepted focused media viewer so a
resident can recognize the equipment before beginning work.

### Actions and consequences

- A porch-light request is the routine reversible control. The value stays at its last confirmed
  state while pending unless the fixture explicitly labels an optimistic value as unconfirmed.
- “Secure Cedar House” is the consequential action. Confirmation names the house, affected exterior
  locks and garage door, known exceptions, and requested effect. Partial completion retains per-
  target truth and a durable path to the unresolved garage door.
- Marking the filter replaced records application-owned maintenance history; it does not claim that
  the HVAC sensor or runtime automatically verified the physical work.

### Required failure evidence

The application must cover a stale air-quality sensor, an unavailable garage-door controller,
permission denial for the security action, partial secure-home completion, a failed lighting
request, recovery, and retained last-confirmed household state. `Off`, `Closed`, and `Unlocked`
remain domain values; condition is authored independently.

### Deliberate exclusions

No floor-plan editor, automation-rule builder, voice assistant, camera stream, media controller,
device onboarding, household account system, Home Assistant adapter, or generic device/room package
component enters the initial workflow.

## Operations-console application brief

### User and environment

The primary user is a shift coordinator at the synthetic **Northline Cold Storage** distribution
hub. Desktop is the main working environment, a wall display supports shared awareness, and phone
supports bounded triage rather than full dense-table parity.

### Primary workflow

The coordinator answers “Can today’s outbound loads leave within temperature and schedule limits?”
and resolves or escalates a load that cannot.

The stable application truth covers these peer functions:

- **Receiving:** inbound appointments, dock availability, delayed arrivals, and intake temperature;
- **Cold storage:** zone temperature, capacity, refrigeration condition, sensor knowledge, and
  recent excursions;
- **Order preparation:** pick backlog, completion trend, staffing context, exceptions, and work
  records; and
- **Dispatch:** outbound loads, cutoff time, trailer readiness, release state, carrier context, and
  row-level response.

The representative issue is outbound load `NL-2048`, whose trailer temperature source is stale near
its release cutoff. Scalar, status, temporal, and tabular projections derive from the same load and
sensor records. The application must not present the load as safe or unsafe solely from missing
fresh evidence.

### Actions and consequences

- Filtering dispatch work and acknowledging an investigation are routine application-owned actions
  with durable result context.
- “Place NL-2048 on dispatch hold” is consequential because it affects schedule and custody. The
  action repeats the load and dispatch scope, states the confirmed current release state, and keeps
  pending separate from the final hold result.
- Releasing a hold is not included until the application can present the authorization, fresh
  temperature evidence, and audit consequence necessary to make that workflow honest.

### Required failure evidence

The application must cover delayed inbound data, partial refrigeration telemetry, unavailable
trailer temperature, a permission-denied hold, a failed request with unchanged release state,
recovery, new exception insertion without forced scroll, and application-owned bounded retention.
Critical dispatch consequence remains discoverable while another function is selected.

### Deliberate exclusions

No warehouse-management system, route optimizer, carrier integration, billing, regulatory claim,
generic incident engine, spreadsheet grid, chart package, or public operations schema enters the
initial workflow. Synthetic values are illustrative and do not claim cold-chain compliance.

## AI-agent-supervision application brief

### User and environment

The primary user is an engineering lead supervising synthetic software-maintenance work in **Harbor
Lab**. Desktop supports investigation and approval; phone supports awareness, denial, and safe
pause; the wall view summarizes workload and human attention without exposing sensitive prompts or
output.

### Primary workflow

The lead answers “Which automated work can continue, and which task needs a human decision?” and
resolves one blocked task without confusing agent activity with trustworthy outcome.

The stable application truth covers these peer functions:

- **Work intake:** authored maintenance requests, priority, provenance, acceptance status, and
  queued tasks;
- **Execution:** agent availability, current activity, task progress, tool activity, retained logs,
  and cancellation boundaries;
- **Review and approval:** proposed effects, evidence, confidence, policy checks, requested
  approval, timeout, denial, and human decision; and
- **Outcome and recovery:** confirmed external result, failed or partial work, retry eligibility,
  reassignment, and durable history.

The representative issue is task `HL-317`, which has completed analysis and tests and requests
permission to merge a synthetic dependency update. The proposal, test evidence, source freshness,
agent activity, and approval state are separate. “Agent finished” never means “change merged” or
“result correct.”

### Actions and consequences

- Pause and resume are routine only when the fixture can guarantee their boundary; otherwise the
  action says that a pause was requested while the current tool step may finish.
- “Approve merge for HL-317” is consequential. Confirmation identifies repository, target branch,
  proposed revision, evidence age, irreversible or reversible effects, and approval expiry. Pending,
  accepted, denied, timed-out, failed, and confirmed-merged states remain distinct.
- Retry creates a new application-owned attempt linked visibly to the failed attempt; it does not
  overwrite history or imply identical execution.

### Required failure evidence

The application must cover stale test evidence, unavailable execution worker, partial tool results,
permission denial, approval timeout, failed merge with unchanged target branch, cancellation request
while a tool step is active, recovery, and a quiet meaningful task update with one deliberate
summary.

### Deliberate exclusions

No model provider, prompt editor, autonomous planner, agent protocol, tool registry, code executor,
real repository integration, secrets, billing, or public agent/task schema enters the initial
workflow. Content remains factual and avoids claims of intent, emotion, or human-like understanding.

## Cross-domain comparison obligations

The three briefs intentionally reuse semantic concepts while differing in workflow and structure:

| Concept              | Cedar House                       | Northline Cold Storage                       | Harbor Lab                                                   |
| -------------------- | --------------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| Boolean value        | light on/off; door open/closed    | dispatch hold applied/not applied            | approval granted/not granted                                 |
| Condition            | device or household attention     | service, storage, or load attention          | task or outcome attention                                    |
| Knowledge            | sensor freshness and availability | source freshness and completeness            | evidence provenance, freshness, and confidence               |
| Activity             | device transition or request      | receiving, preparation, or dispatch request  | agent, task, tool, or approval activity                      |
| Consequential action | secure the house                  | place a load on hold                         | approve a merge                                              |
| Identifying media    | household asset photograph        | optional authored load or equipment evidence | optional authored artifact preview, never hidden tool output |
| Dense investigation  | maintenance and device history    | operational table and temporal records       | task and tool history                                        |

Visual review must confirm shared semantic meaning without forcing identical navigation, panel
arrangement, density, or accent. Cross-domain similarity is evidence only when behavior, ownership,
semantics, accessibility, and failure handling also match.

## Phase 4A handoff

Acceptance of this contract authorizes the next Phase 4A planning slices:

1. an architecture decision for three isolated private React applications, application-owned state
   and adapters, deterministic scenarios, routing, production-package consumption, and code-sharing
   thresholds; and
2. a validation plan with exact fixtures, viewports, state coverage, performance envelopes, visual
   review, and representative assistive-technology gates.

It does not authorize application scaffolding or a public domain component. Implementation begins
only after both records are reviewed and accepted.
