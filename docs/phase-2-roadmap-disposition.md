# Phase 2 roadmap disposition

**Status:** Accepted at Phase 2 closeout on August 2, 2026. Phase 3 remains limited to the
operational-component scope already defined in `SPEC.md`.

Phase 2 deliberately left some capabilities application-owned or evidence-driven. This record
separates those boundaries from missing work and resolves older milestone notes that pointed to a
later part of Phase 2.

## Phase 3 interpretation

Phase 3 still delivers metrics, telemetry, event log, timeline, status list, filter and command
patterns, and data tables. Phase 2 refines that scope without adding new component families:

- metrics expand the existing `wg-metric` and `wg-value-tile` foundation through metric groups,
  telemetry strips, trend indicators, and key-value presentation; they are not rebuilt;
- filter and command work means the planned filter bar and command bar, composed with the existing
  flat command menu where appropriate;
- checked or radio menu items, nested menus, context menus, general toolbars, and command palettes
  do not enter Phase 3 automatically; and
- pagination, virtualization, scroll restoration, and live-update announcement policy are decided by
  the Phase 3 data contracts that need them, not added to generic layout primitives.

## Unassigned evidence-driven candidates

The following remain compatible future work but have no Phase 3 delivery commitment:

- the finite-value indicator named in the initial component inventory and a distinct operational
  finite-value request control; neither is inferred from Boolean presentation or segmented local
  selection;
- Wayglass High Contrast and Wayglass Dim themes;
- a presentation-only Function Deck wrapper;
- automatic navigation-rail collapse, icon-only navigation, and responsive destination migration;
- checked, radio, nested, and context menu variants and command palettes;
- a package-owned media viewer, galleries, comparison tools, annotations, and editing;
- general modal dialogs, drawers, lightboxes, teaching overlays, tooltips, and universal overlay
  positioning;
- inline-confirmation and generic error-summary components; and
- specialized form controls such as comboboxes, date or file controls, masking, password reveal,
  custom multi-selects, and advanced sliders.

Promotion requires a production use case, a reusable ownership and semantic contract, and an
approved proposal or ADR. Phase 3 may produce that evidence without inheriting a delivery
obligation.

## Application-owned boundaries

Wayglass continues not to own:

- application data, transport, authorization, asset storage, upload, transformation, CDN, or media
  metadata;
- schema, cross-field, remote, and server-side validation;
- request IDs, queued writes, cancellation, optimistic reconciliation, conflict resolution, undo,
  transaction rollback, retry policy, or staleness calculations;
- notification centers, durable history, operating-system notifications, cross-tab queues, service
  workers, audio, or haptics;
- typed-name verification, reauthentication, permission elevation, approvals, legal consent, and
  audit policy; or
- application analytics, localization content, relative-time formatting, and domain icon catalogs.

Repeated deployment evidence may justify a later generic pattern. Until then, these remain consumer
or integration responsibilities rather than gaps in the core system.

## Resolved Phase 2 deferrals

Earlier milestone documents correctly deferred work to a later Phase 2 milestone. Phase 2 ultimately
delivered the official foundation icon component and initial control icon catalog; flat menus and
commands; native form presentation; persistent and transient feedback; and narrow native modal
confirmation. Those historical notes remain useful sequencing evidence and do not represent open
roadmap items.

One plan was revised: form-foundation guidance initially placed a generic error summary in Phase 2E.
Phase 2E provided the primitives needed to compose one, but repeated form evidence did not establish
a stable package-owned component. Error summaries therefore remain application compositions unless
future evidence supports a separate contract.

The confirmation dialog does not satisfy the prerequisites for a general overlay or media-viewer
system. Its accepted ownership is intentionally narrow, so those deferrals remain open.

## Cross-cutting work outside Phase 3

Initial npm publication and release automation, a deployment provider, full server-side rendering
and hydration, and localization and right-to-left implementation remain separate roadmap decisions.
The
[representative assistive-technology gates](./accessibility/phase-2-assistive-technology-gates.md)
are release obligations rather than component-roadmap deferrals.
