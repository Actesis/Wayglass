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
- [ ] Implement dark and light themes and the theme provider.
- [ ] Implement structural and action primitives.
- [ ] Implement semantic display components.
- [ ] Add typed React wrappers.
- [ ] Compose the production-backed Storybook reference slice.
- [ ] Add vanilla and React examples.
- [ ] Validate accessibility, responsive behavior, visual states, and supported browsers.

## Later phases

Phases 2–5 remain as defined in `SPEC.md`. Their scope will be refined through proposals or
architecture decisions before implementation.

## Deferred decisions

- Final project and package name
- Software license
- Public npm scope
- GitHub Actions and deployment provider
- Full server-side rendering and hydration
- Localization and right-to-left implementation
