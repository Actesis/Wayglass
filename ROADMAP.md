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

Build a domain-neutral operational-awareness slice using the component set defined in `SPEC.md`. It
must demonstrate multiple functions, mixed section purposes, icon-free Boolean values, and the
complete state, accessibility, responsive, theme, and framework contracts.

- [x] Define the Operations Overview reference composition.
- [x] Specify the public contracts for the initial component set.
- [x] Lock the Phase 1 reference, semantic, and component token values.
- [x] Implement dark and light themes and the theme provider.
- [x] Implement structural and action primitives.
- [ ] Implement semantic display components.
- [ ] Add typed React wrappers.
- [ ] Compose the production-backed Storybook reference slice.
- [ ] Add vanilla and React examples.
- [ ] Validate accessibility, responsive behavior, visual states, and supported browsers.

## Later phases

Phases 2–5 remain as defined in `SPEC.md`. Their scope will be refined through proposals or
architecture decisions before implementation.

### Recorded Phase 2 composition work

- Implement the tabs and selection primitives with native-equivalent keyboard and accessibility
  behavior.
- Implement the focused Function Deck as a composition of those primitives rather than adding
  interaction to `wg-elbow`.
- Provide overview and focused-deck fixtures for phone, desktop, and wall displays.
- Preserve labeled summaries for hidden caution, critical, stale, unavailable, and pending state.
- Validate stable selection, focus, per-function context, reduced motion, zoom, and supported
  browsers.

## Deferred decisions

- Final project and package name
- Software license
- Public npm scope
- GitHub Actions and deployment provider
- Full server-side rendering and hydration
- Localization and right-to-left implementation
