# Wayglass Roadmap

This roadmap translates the phases in `SPEC.md` into repository work. It does not widen the product
scope.

## Phase 0 — Repository foundation

Status: in progress.

- [x] Establish governing documents.
- [x] Record foundational architecture decisions.
- [x] Create the monorepo and package boundaries.
- [x] Configure formatting, linting, type checking, testing, and builds.
- [x] Establish deterministic design-token generation.
- [x] Establish the shared known-state model.
- [x] Establish Storybook and the dedicated documentation site.
- [x] Validate formatting, linting, type checking, unit tests, builds, and cross-browser
      accessibility locally.
- [ ] Perform visual-direction exploration before finalizing visual tokens.

## Phase 1 — Vertical slice

Build a domain-neutral operational-awareness slice using the component set defined in `SPEC.md`. It
must demonstrate the complete state, accessibility, responsive, theme, and framework contracts.

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
