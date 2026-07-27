# Instructions for coding agents

Before implementation, read these documents in order:

1. `VISION.md`
2. `DESIGN_PRINCIPLES.md`
3. `SPEC.md`
4. Relevant architecture decisions under `docs/architecture/adr`

Follow `SPEC.md` section 28 in full.

## Repository rules

- Do not publish packages. Every package remains private until naming, licensing, and release
  governance are approved.
- Do not add a dependency without documenting why the platform or existing dependencies are
  insufficient.
- Keep framework-neutral behavior outside framework bindings.
- Use explicit Custom Element registration; imports must not register elements as a side effect.
- Use semantic tokens for intentional visual values. Private mechanical constants are allowed only
  when documented in code and when making them tokens would create meaningless API surface.
- Treat condition, knowledge, and activity as separate state axes.
- Use logical CSS properties and direction-neutral names.
- Add or update tests and documentation with behavior or public API changes.
- Run the relevant local quality gates before reporting completion.

## Current scope

Phase 0 establishes foundations. Production UI components and the vertical slice belong to Phase 1
unless a task explicitly authorizes them.
