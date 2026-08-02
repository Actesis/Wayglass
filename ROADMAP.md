# Wayglass Roadmap

This roadmap translates the phases in `SPEC.md` into repository work. It does not widen the product
scope.

## Phase 0 — Repository foundation

Status: complete.

- [x] Establish governing documents.
- [x] Record foundational architecture decisions.
- [x] Create the monorepo and package boundaries.
- [x] Configure formatting, linting, type checking, testing, and builds.
- [x] Establish deterministic design-token generation.
- [x] Establish the shared semantic model for domain value, condition, knowledge, activity, and
      section purpose.
- [x] Establish Storybook and the dedicated documentation site.
- [x] Validate formatting, linting, type checking, unit tests, builds, and cross-browser
      accessibility locally.
- [x] Perform visual-direction exploration before finalizing visual tokens.
- [x] Codify the accepted humanist, compact, banded visual grammar and functional zoning rules.

## Phase 1 — Vertical slice

Status: complete.

Build a domain-neutral operational-awareness slice using the component set defined in `SPEC.md`. It
must demonstrate multiple functions, mixed section purposes, icon-free Boolean values, and the
complete state, accessibility, responsive, theme, and framework contracts.

- [x] Define the Operations Overview reference composition.
- [x] Specify the public contracts for the initial component set.
- [x] Lock the Phase 1 reference, semantic, and component token values.
- [x] Implement dark and light themes and the theme provider.
- [x] Implement structural and action primitives.
- [x] Implement semantic display components.
- [x] Add typed React wrappers.
- [x] Compose the production-backed Storybook reference slice.
- [x] Add vanilla and React examples.
- [x] Validate accessibility, responsive behavior, visual states, and supported browsers.

## Phase 2 — Core system

Status: planned.

Phase 2 expands the vertical slice into the generic foundations, layouts, controls, forms, and
feedback required by `SPEC.md`. Work is divided into reviewable milestones so each interaction model
can be validated before later components depend on it.

### Phase 2A — Selection foundation

- [x] Define the Phase 2 milestone sequence.
- [x] Draft the tabs public contract.
- [x] Draft the tabs accessibility architecture decision.
- [x] Review and accept the tabs contract and architecture decision.
- [x] Lock the required selection and tab tokens.
- [x] Implement the tabs compound elements and framework-neutral interaction model.
- [x] Add typed React wrappers without duplicating behavior.
- [x] Add production-backed stories and examples.
- [x] Validate keyboard behavior, focus, accessible relationships, touch targets, forced colors,
      reduced motion, zoom, dynamic selection, and supported browser engines.

### Phase 2B — Focused Function Deck

- [x] Define the production composition API after the tabs primitive is validated.
- [x] Compose the deck from tabs without adding selection behavior to `wg-elbow`.
- [x] Reuse one domain-neutral function model across overview and focused compositions.
- [x] Preserve labeled summaries for hidden caution, critical, stale, unavailable, and pending
      state.
- [x] Keep critical state and its primary response discoverable while another function is selected.
- [x] Add phone, desktop, and wall-display fixtures.
- [x] Validate stable selection, focus, per-function context, responsive behavior, and supported
      browser engines.

### Phase 2C — Foundation, layout, and media expansion

- [x] Specify the remaining foundation contracts: typography, icon, visually hidden content, focus
      ring, surface, and divider.
- [x] Specify the remaining layout contracts: frame, stack, cluster, grid, split, and scroll region.
- [x] Implement, document, and validate the accepted foundation and layout primitives.
- [x] Specify a domain-neutral media-content pattern for consumer-authored images, pictures, and
      figures without adding media URLs to the shared function state model.
- [x] Define responsive sizing and cropping, useful alternatives and captions, loading and
      unavailable presentation, full-size inspection, and privacy guidance.
- [x] Add image-bearing information fixtures and validate that missing media never hides state,
      instructions, or actions across phone, desktop, and wall displays.

### Phase 2D — Controls and forms

#### Phase 2D-A — Control-state architecture

- [x] Define the Phase 2D milestone sequence.
- [x] Draft the shared contract for confirmed values, requested values, pending and rejected
      requests, unavailable targets, and local selection.
- [x] Draft the controlled-request architecture decision.
- [x] Draft the native form-control ownership and submission decision.
- [x] Review and accept the control-state contract and architecture decisions.

#### Phase 2D-B — Core controls

- [x] Draft icon button, toggle, segmented control, and navigation rail public contracts.
- [x] Draft the core-control semantics and ownership architecture decision.
- [x] Review and accept the core-control contracts and architecture decision.
- [x] Lock control tokens and implement the accepted framework-neutral interaction models.
- [x] Add typed React wrappers and production-backed stories.
- [x] Validate request behavior, selection, keyboard, touch, focus, zoom, forced colors, reduced
      motion, and supported browser engines.

#### Phase 2D-C — Menus and commands

- [x] Draft menu and command-item ownership, semantics, keyboard behavior, and composition.
- [x] Draft popup positioning, dismissal, focus entry, and focus return without prematurely creating
      a general overlay system.
- [x] Review and accept the menu and command contracts and architecture decision.
- [x] Lock menu tokens and implement the accepted framework-neutral interaction model.
- [x] Add typed React wrappers and production-backed stories.
- [ ] Validate menus and command items across supported inputs, assistive technology, and browser
      engines.

#### Phase 2D-D — Form foundation

- [x] Draft field label, field message, and form group contracts around consumer-authored native
      controls.
- [x] Define validation timing, submission, reset, disabled, read-only, required, and
      error-announcement behavior.
- [x] Review and accept the form-foundation contracts and explicit-relationship architecture
      decision.
- [x] Lock form-foundation tokens and implement the accepted native presentation and association
      substrate.
- [x] Add typed React wrappers and production-backed form-foundation stories.
- [ ] Validate labeling, grouping, submission, reset, native constraints, error announcements,
      autofill, zoom, forced colors, and supported browser and assistive-technology combinations.

#### Phase 2D-E — Form controls and validation

- [x] Draft text field, number field, select, checkbox, radio, and slider public contracts.
- [x] Draft the styled-native control presentation architecture decision.
- [x] Review and accept the form-control contracts and architecture decision.
- [x] Prototype and lock the native-control selectors and tokens, then implement the accepted
      framework-neutral presentation shells.
- [x] Add typed React wrappers and production-backed form compositions.
- [ ] Validate native submission, reset, autofill-compatible ownership, constraint validation,
      keyboard, touch, zoom, forced colors, and supported browser and assistive-technology
      combinations.

### Phase 2E — Feedback and closeout

#### Phase 2E-A — Feedback-state architecture

- [x] Define the Phase 2E milestone sequence.
- [x] Draft the shared contract for persistent feedback, transient announcements, loading and
      absence, degraded knowledge or availability, and modal confirmation.
- [x] Draft the feedback delivery, announcement, and lifetime architecture decision.
- [x] Review and accept the shared feedback contract and architecture decision.

#### Phase 2E-B — Persistent feedback and loading

- [x] Draft badge, alert, progress, skeleton, empty-state, offline-state, and stale-data-marker
      public contracts.
- [x] Lock tokens and implement the accepted framework-neutral components and patterns.
- [x] Add typed React wrappers and production-backed stories.
- [ ] Validate semantics, labeling, retained context, loading replacement, motion, zoom, forced
      colors, and supported browser and assistive-technology combinations.

#### Phase 2E-C — Transient feedback

- [x] Draft toast, toast-region, queue, lifetime, dismissal, and announcement contracts.
- [x] Lock tokens and implement the accepted framework-neutral interaction model.
- [x] Add typed React wrappers and production-backed stories.
- [x] Validate queue behavior, duplicate announcements, timing, pause and dismissal, focus
      independence, reduced motion, zoom, and supported browser and assistive-technology
      combinations.

#### Phase 2E-D — Confirmation and proportional friction

- [x] Draft confirmation-dialog ownership, native-dialog integration, focus, dismissal, action, and
      proportional-friction contracts.
- [x] Record the modal confirmation and destructive-action architecture decision.
- [x] Lock tokens and implement the accepted framework-neutral interaction model.
- [ ] Add typed React wrappers and production-backed stories.
- [ ] Validate keyboard and focus behavior, cancellation, destructive labeling, nested invocation,
      zoom, forced colors, reduced motion, and supported browser and assistive-technology
      combinations.

#### Phase 2E-E — Phase 2 closeout

- [ ] Complete Phase 2 documentation and production-backed examples.
- [ ] Close or explicitly carry the remaining representative assistive-technology gates from Phase
      2D.
- [ ] Run the Phase 2 accessibility, responsive, visual-state, framework, and supported-browser
      validation matrix.
- [ ] Record deferred or revised component-roadmap decisions without widening Phase 3.

## Later phases

Phases 3–5 remain as defined in `SPEC.md`. Their scope will be refined through proposals or
architecture decisions before implementation.

## Deferred decisions

- Final project and package name
- Software license
- Public npm scope
- GitHub Actions and deployment provider
- Full server-side rendering and hydration
- Localization and right-to-left implementation
