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

- [ ] Specify and implement icon button, toggle, segmented control, navigation rail, menu, and
      command item.
- [ ] Specify and implement text field, number field, select, checkbox, radio, slider, field label,
      field message, and form group.
- [ ] Define form participation, validation, submission, and error-announcement behavior before
      extending `wg-button`.
- [ ] Document and validate keyboard, touch, zoom, forced-colors, reduced-motion, and framework
      behavior.

### Phase 2E — Feedback and closeout

- [ ] Specify and implement badge, alert, toast, progress, skeleton, empty state, offline state,
      stale-data marker, and confirmation dialog.
- [ ] Complete Phase 2 documentation and production-backed examples.
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
