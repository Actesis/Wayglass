# Phase 3 roadmap disposition

**Status:** Accepted during the Phase 3 closeout audit on August 12, 2026. Phase 3 is complete. This
record carries representative assistive-technology release gates and evidence-driven candidates
without widening the three Phase 4 reference applications.

Phase 3 delivered the operational-component families defined in `SPEC.md`: scalar summaries, compact
telemetry, status collections, temporal collections, filter and command compositions, and native
operational tables. The Operational Activity reference workspace proved those families together
without introducing an application store, shared operational schema, query engine, or workspace
component.

This audit separates compatible future work from missing Phase 3 work. A deferred capability is not
promised merely because a production contract leaves room for it.

## Phase 3 completion

Every accepted Phase 3 component has a framework-neutral implementation, typed React wrapper,
package export, contract documentation, production-backed story, supported-browser coverage, and
automated accessibility evidence. The domain-neutral Operational Activity workspace has equivalent
Storybook, Vanilla, and React compositions, and the complete repository browser matrix passes.

Representative VoiceOver/Safari and NVDA/Firefox procedures remain explicit public-release gates.
They are validation obligations, not unfinished component implementation. VoiceOver with iOS Safari
remains required before claiming mobile assistive-technology support.

## Phase 2 candidates reviewed

No unassigned candidate from the [Phase 2 roadmap disposition](./phase-2-roadmap-disposition.md) is
promoted by Phase 3 evidence. The following remain compatible future work:

- finite-value presentation or control;
- Wayglass High Contrast and Wayglass Dim themes;
- a presentation-only Function Deck wrapper;
- automatic navigation-rail collapse, icon-only navigation, and destination migration;
- checked, radio, nested, and context menus or a command palette;
- media galleries, comparison, annotation, and editing;
- drawers, teaching overlays, tooltips, nonmodal lightboxes, and universal popup positioning;
- inline confirmation and a generic error-summary component; and
- specialized form controls.

Phase 3 did not establish a reusable semantic and ownership contract for these capabilities.
Existing primitives remain sufficient for its accepted production surfaces.

## Evidence-driven candidates produced by Phase 3

Phase 3 produced the following candidates for later evaluation. They have no Phase 4 delivery
commitment.

### Rich operational visualization

Multiple telemetry series, arbitrary axes, legends, annotations, thresholds, bands, point
inspection, range selection, pan and zoom, export, and a reusable chart package require a distinct
proposal. The compact `wg-telemetry-strip` remains an overview with an authored textual equivalent;
exact inspection continues to use visible native lists or tables.

### Large and navigable collections

Pagination, virtualization, bounded-window replacement, scroll restoration, follow-latest,
unseen-count handling, acknowledgements, and bulk selection remain application policy. A future
proposal must preserve native semantics, focus, reading position, browser find behavior, and one
deliberate announcement owner before extracting a package pattern.

### Advanced data-table behavior

Selection, bulk action, inline editing, column customization, frozen columns, tree grids, pivot or
spreadsheet interaction, and a package-owned sticky-header option remain separate candidates. The
accepted table is intentionally a styled native read-and-act surface rather than a headless data
engine or ARIA grid.

### Advanced filtering and commands

Saved views, suggestions, autocomplete, advanced multi-select, command discovery, shortcuts, generic
toolbars, adaptive overflow, and command palettes remain evidence-driven. Phase 3 confirms that
stable authored controls and explicit application ownership are preferable until a repeated
deployment establishes common behavior.

### Additional presentation coordinators

A multi-pair key-value list, status-group wrapper, generalized operational workspace, or public
operational record schema is not warranted by the integration evidence. Native composition, multiple
named lists, and example-owned projections already preserve semantics and application identity
without another coordinator.

## Application-owned boundaries confirmed

Phase 3 strengthens rather than relaxes these boundaries:

- applications own data, identity, transport, authorization, persistence, reconciliation, staleness
  calculations, querying, filtering, sorting, grouping, aggregation, and formatting;
- applications own request correlation, cancellation, retry, undo, optimistic behavior, and conflict
  resolution;
- applications own chronology, retention, seen state, follow-latest policy, scroll restoration,
  selection meaning, editing, export, and saved views;
- applications own command registration, authorization, execution, analytics, and durable history;
  and
- applications own update importance and one deliberate announcement surface. Operational data
  components remain quiet and never infer loading, failure, urgency, or speech policy.

These are not missing Wayglass features. Repeated deployment evidence may later identify a narrow
shared pattern, but package ownership requires an approved proposal or ADR.

## Phase 4 interpretation

Phase 4 remains limited to the smart-home, operations-console, and AI-agent-supervision reference
applications defined in `SPEC.md`. Those applications may compose application-owned paging,
filtering, transport, visualization, navigation, and workflow behavior as needed to demonstrate a
real deployment. Reference implementation does not make that behavior a public Wayglass API.

Before Phase 4 implementation, its formal plan must define shared acceptance criteria and keep each
application's domain model, state, data access, routing, and orchestration outside core packages.
Any promotion from this disposition requires production evidence, a reusable semantic and ownership
contract, accessibility and responsive behavior, performance bounds, and an approved proposal or
ADR.

## Cross-cutting work

Package publication and release automation, deployment-provider selection, full server-side
rendering and hydration, and localization implementation remain separate roadmap decisions. The
confirmed Wayglass name, `@wayglass` npm organization, and Apache-2.0 license resolve identity and
licensing prerequisites but do not authorize publication.
