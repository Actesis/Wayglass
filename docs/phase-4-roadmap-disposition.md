# Phase 4 roadmap disposition

**Status:** Accepted on August 14, 2026 as the final Phase 4 closeout record. Phase 4 is complete.
Manual assistive-technology checks remain public-support gates, and deployment evidence remains a
prerequisite for claims about production integration rather than an unfinished Phase 4 component.

This disposition closes the three reference-domain milestones and their cross-domain validation. It
is based on the [Phase 4 roadmap](./phase-4.md), the
[reference-application contract](./reference-apps/phase-4-reference-applications.md),
[ADR 0030](./architecture/adr/0030-isolated-reference-applications.md), the accepted application
validation records, the [cross-domain audit](./accessibility/phase-4e-cross-domain-audit.md), and
the [integrated validation record](./accessibility/phase-4e-integrated-validation.md).

No package API is promoted by this record. A future promotion still requires its own contract,
accessibility evidence, ADR where consequential, tests, documentation, and review.

## Exit disposition

| Phase 4 obligation                    | Evidence                                                                                                                                                                          | Disposition                                 |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Three credible domains                | Cedar House, Northline Cold Storage, and Harbor Lab provide isolated, complete workflows with distinct users, records, and consequences                                           | Accepted                                    |
| Complete task loops                   | Each app covers orientation, awareness, investigation, action, confirmation, failure, recovery, and continuity                                                                    | Accepted                                    |
| Semantic consistency                  | Condition, knowledge, activity, freshness, trend, confidence, Boolean value, request state, and confirmed outcome remain independent across domains                               | Accepted                                    |
| Meaningful brand variation            | Household, operations, and agent-supervision applications use distinct density, geometry, topology, and emphasis without redefining semantic roles                                | Accepted                                    |
| Responsive and accessible foundations | Phone, desktop, wall, 200% text, long content, RTL mechanics, forced colors, grayscale, reduced motion, keyboard behavior, and automated accessibility pass the accepted matrices | Accepted; named manual support gates remain |
| Browser and performance evidence      | All 222 applicable integrated reference cases and all 1,390 applicable repository browser cases pass; maximum fixtures remain inside the accepted local envelope                  | Accepted                                    |
| Application isolation                 | Apps remain private, synthetic, dependency-neutral, and free of cross-app imports, package-owned domain models, live services, or private Shadow DOM dependencies                 | Accepted                                    |
| Roadmap disposition                   | Successful compositions, corrections, rejected abstractions, evidence candidates, and deferred work are recorded below                                                            | Accepted                                    |

Phase 4 completion does not claim that a public demo, npm release, live integration, or
screen-reader support matrix has shipped. Those claims require the separate evidence named below.

## Successful compositions and practices

### One truth, several projections

The strongest cross-domain result is the application-owned truth model. Each app derives overview,
focused detail, Boolean, scalar, status, temporal, tabular, media, request, and durable-result
projections from one reducer-owned state. Requested values never silently replace confirmed values,
and stale or unavailable evidence never manufactures a condition or outcome.

This is accepted implementation guidance, not a shared record schema. Household devices, outbound
loads, tasks, agents, evidence, and approvals retain different ownership and lifecycle meanings.

### Simultaneous overview and focused function deck

Both compositions proved useful:

- simultaneous overviews expose several strongly separated functions and one dominant answer for
  shared awareness; and
- focused routes use the folder-tab-like function deck to preserve peer context while giving one
  function enough space for investigation and control.

At narrow widths both return to one contained semantic tree rather than mounting desktop and mobile
copies. Function boundaries use structural identity and neutral geometry; condition color remains
reserved for authored health or attention meaning.

The composition choice stays application-owned. Phase 4 does not establish a universal dashboard
topology, required function count, or automatic responsive rearrangement.

### State that can be understood without icons

The production Boolean-value contract worked across on/off, open/closed, applied/not applied, and
granted/not granted. A lit or unlit asserted rail provides quick recognition while text and semantic
state preserve meaning without relying on color or icons. Condition, knowledge, and activity remain
separate axes.

Northline's corrected dispatch-hold projection confirmed that domain labels may vary while the
asserted/not-asserted contract remains stable. No additional Boolean component is needed.

### Consequential actions with honest boundaries

Cedar security, Northline dispatch hold, and Harbor merge approval demonstrated a common practice:
confirmation names target, scope, effect, and known limitation, while the application separately
owns authorization, request identity, pending state, adapter result, confirmed truth, retry, and
audit meaning. One deliberate announcement owner accompanies a durable visible result.

The practice is reusable documentation. It is not evidence for a generic command envelope,
authorization service, workflow engine, or optimistic-state controller.

### Identifying media beside operational truth

Cedar proved that native images and the focused media viewer can identify an asset without making
the image the sole source of instructions, status, or evidence. Loading and unavailable media keep
the asset and maintenance workflow usable. Media URL, authorization, alternative text, metadata,
storage, and evidence meaning remain application-owned.

### Dense evidence without a data-grid dependency

Northline and Harbor used native tables inside labeled scroll regions, authored filtering and
sorting, bounded retention, timelines, event logs, and stable record identity. Their maximum
fixtures remained usable without virtualization or a schema-driven grid. This validates the current
component boundary; it does not rule out a future grid after a real deployment demonstrates a gap.

## Corrections found by reference-domain pressure

Phase 4 found integration defects and authored-content problems rather than missing public
components:

- Cedar production review corrected multipart `part` matching in `wg-media` and removed narrow
  200%-text page overflow caused by compounded application spacing.
- Northline cross-domain review corrected its dispatch-hold Boolean projection, and
  supported-browser validation preserved reading position around a Firefox focus-related page
  adjustment.
- Harbor maximum-fixture review removed duplicate `decision-required` emphasis from cloned tasks so
  one real human decision remained dominant.

These corrections validate the production-review and stress-fixture method. None establishes a new
domain-neutral package contract.

## Rejected abstractions

The following remain rejected after implementation evidence:

- a universal device, room, load, incident, task, agent, evidence, approval, or operational-record
  schema;
- a shared reference-application shell, router, store, reducer, adapter, scheduler, scenario
  runtime, command envelope, or announcement manager;
- domain cards, queue tiles, room summaries, agent cards, or schema-driven dashboard generation;
- a generic consequential-action controller that conflates confirmation, authorization, execution,
  and confirmed effect;
- automatic extraction of app-owned function summaries, information architecture, breakpoints, or
  brand geometry;
- a data-grid, chart, router, state-store, schema, or mock-service dependency without a demonstrated
  platform gap;
- whole-application Storybook copies in place of routed production applications; and
- live service connections during component validation.

The three routers and injected deterministic ports contain small mechanical similarities, but their
route types, defaults, commands, failure behavior, and ownership differ. Extracting them would save
lines while hiding the exact boundaries Phase 4 was designed to test.

## Evidence-driven candidates

These candidates have enough evidence to remain visible, but none is approved package scope:

1. **Reference-application implementation guide.** Turn the one-truth, independent-state-axis,
   simultaneous-versus-focused, durable-result, and app-owned-adapter practices into documentation
   for application authors. This is the highest-confidence follow-up because it requires no new API.
2. **Cross-domain validation recipes.** Preserve guidance for deterministic lifecycle scenarios,
   maximum fixtures, mutation stability, reading-position continuity, and one announcement owner.
   Promote a helper to `@wayglass/testing` only if it tests public Wayglass behavior with identical
   semantics; application-policy harnesses stay local.
3. **Hosted reference walkthrough.** A later demo site could present selected synthetic workflows
   beside Storybook and documentation. It first needs hosting, privacy, accessibility, versioning,
   support, and release-governance decisions; the private apps are not deployment authorization.
4. **Deployment performance profile.** Re-run representative maximum and mutation cases on a
   lower-powered target and real hosting path before converting local timing evidence into a support
   claim or designing virtualization.
5. **Phase 5 ecosystem explorations.** Charts, Home Assistant integration, icon tooling, Figma
   libraries, token-platform transforms, and additional framework wrappers remain independent Phase
   5 investigations. Phase 4 supplies context but found no urgent gap that changes their order.

## Deferred evidence and release impact

| Deferred item                        | Why it remains deferred                                                                                                          | Required before                                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| VoiceOver with Safari on macOS       | Requires representative human execution in the named environment                                                                 | Public desktop screen-reader support claim for affected workflows                                           |
| NVDA with Firefox on Windows         | Windows and NVDA were unavailable in the local validation environment                                                            | Same desktop support claim; VoiceOver cannot substitute                                                     |
| VoiceOver with Safari on iOS         | Requires representative mobile assistive-technology execution                                                                    | Mobile assistive-technology support claim                                                                   |
| Five-second first-glance sessions    | Representative participants were unavailable                                                                                     | Any formative claim about real-user first-glance priority; not a substitute for assistive-technology review |
| Public deployment and battle testing | Hosting, privacy, analytics, support, versioning, and operational ownership are undecided                                        | Public demo or production-integration claim                                                                 |
| Live domain integrations             | Authentication, authorization, privacy, network failure, persistence, and real-world safety are outside the synthetic references | Home, logistics, repository, or agent-service compatibility claim                                           |
| Package publication                  | Release governance still requires an explicit publish decision even though name, scope, and Apache-2.0 license are settled       | Any npm release                                                                                             |

Excluded application features such as a floor-plan editor, hold release, real merge execution,
camera streaming, prompt editing, and route optimization are not automatically deferred Wayglass
work. They become candidates only when a credible application needs them and exposes a
domain-neutral gap.

## Handoff

Phase 4 closes with no immediate component or package promotion. The recommended next sequence is:

1. choose whether to complete the named manual assistive-technology gates now or attach them to the
   first public-release candidate;
2. formalize Phase 5 scope and ordering without importing reference-app domain models;
3. treat a hosted walkthrough and real integration as separate governance and architecture work;
4. begin any ecosystem exploration with a narrow problem statement, platform-gap analysis, and exit
   criteria; and
5. continue requiring a separate contract and ADR before new public surface enters Wayglass.

This preserves Phase 4's central result: Wayglass supports materially different applications through
semantic contracts and composable primitives without becoming the owner of their domains.
