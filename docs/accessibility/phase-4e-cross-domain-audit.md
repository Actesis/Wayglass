# Phase 4E cross-domain semantic and brand audit

**Status:** Accepted on August 14, 2026 as the first Phase 4E closeout checkpoint. Integrated
end-to-end validation, final exact repository counts, formative first-glance evidence when
available, and the roadmap disposition remain ahead.

This audit compares Cedar House, Northline Cold Storage, and Harbor Lab as one design-language
proof. It does not replace the application validation records or claim completion of manual
assistive-technology procedures.

## Method

The three production builds were compared at their light-theme overview routes and representative
focused routes. Review covered the exposed accessibility tree, rendered hierarchy, semantic state
attributes, app-owned CSS, routing and state ownership, and the accepted cross-domain obligations in
the Phase 4 contract. A new supported-browser suite preserves the conclusions as executable
evidence.

## Semantic comparison

| Concept         | Cedar House                                                  | Northline Cold Storage                                | Harbor Lab                                                   | Result                                                                     |
| --------------- | ------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Boolean value   | Porch light on/off and access open/closed                    | Dispatch hold applied/not applied                     | Approval granted/not granted                                 | Shared asserted/not-asserted meaning; domain labels remain explicit        |
| Condition       | Household or device attention                                | Service, source, or load attention                    | Task, worker, or outcome attention                           | Positive, caution, critical, and neutral retain health/attention meaning   |
| Knowledge       | Sensor freshness and availability                            | Observation freshness and completeness                | Evidence provenance, freshness, and confidence               | Stale and unavailable never fabricate confirmed truth                      |
| Activity        | Device and request transition                                | Flow and dispatch request                             | Worker, task, tool, and approval activity                    | Activity remains independent from condition and outcome                    |
| Trend           | Household telemetry                                          | Capacity and throughput telemetry                     | Work and evidence telemetry                                  | Change remains informational unless condition is separately authored       |
| Section purpose | Household information, monitor, and control regions          | Operational information, monitor, and control regions | Supervision information, monitor, and control regions        | Purpose remains structural rather than decorative                          |
| Feedback        | Durable household request result plus one announcement owner | Durable hold result plus one announcement owner       | Durable approval or retry result plus one announcement owner | Requested, pending, failed, partial, and confirmed results remain distinct |

The review found one contract mismatch: Northline modeled a dispatch hold as applied or not applied
but rendered only its `scheduled` or `held` release-state text. Northline now uses the production
Boolean-value primitive for that projection, with `Applied` and `Not applied` labels, while the
application continues to own the release-state record and hold workflow.

## Information architecture and brand comparison

- **Cedar House** keeps the comfortable, rounded household expression, five function regions, and
  the separate identifying-media and maintenance path.
- **Northline Cold Storage** uses compact density, tighter app-owned panel geometry, a four-function
  shift overview, and table- and timeline-led investigation.
- **Harbor Lab** uses the tightest app-owned geometry, banded file-tab function selection, and an
  asymmetric four-column overview that gives the human-decision function twice the ordinary function
  width at desktop and wall sizes.

These variations change shape, density, topology, and workflow emphasis without overriding
condition, knowledge, activity, Boolean, focus, action, or selection colors. At phone widths each
composition returns to one semantic tree and a contained single-column reading order.

## Automated evidence

`tests/browser/phase-4-cross-domain.spec.ts` checks in Chromium, Firefox, and WebKit that:

1. every overview identifies a different application task and preserves its authored function count;
2. unrelated Boolean values share the same asserted contract while retaining domain labels;
3. condition, knowledge, and activity remain independently exposed;
4. shared panel purposes remain intact; and
5. the three app-owned geometries are observably distinct, including Harbor's asymmetric desktop
   overview.

The final Phase 4E validation record will publish the exact focused and repository-wide case counts.

## Boundary result

- No production package, public API, dependency, lockfile, or shared reference-app runtime changed.
- Northline's Boolean projection and all brand geometry remain application-owned.
- The applications still import no other reference application.
- No live service, credential, analytics, publication, or deployment entered scope.
- Similarity did not justify promotion. Boolean value, status, panels, and feedback already use
  accepted production contracts; the domain records and compositions remain deliberately separate.

## Remaining Phase 4E evidence

Phase 4E still requires the integrated representative workflow and complete repository matrices,
final production visual review, explicit disposition of VoiceOver/Safari, NVDA/Firefox, and
VoiceOver/iOS Safari gates, formative five-second first-glance evidence when representative people
are available, and the Phase 4 roadmap disposition. No public assistive-technology or deployment
claim is made by this checkpoint.
