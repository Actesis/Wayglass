# Contributing to Wayglass

Wayglass is licensed under the Apache License, Version 2.0. The project remains pre-release and all
npm packages remain private until release governance is approved. Contributions intentionally
submitted for inclusion are licensed under Apache-2.0 as described in `LICENSE`.

## Before making a change

Read `VISION.md`, `DESIGN_PRINCIPLES.md`, and `SPEC.md`. Search the architecture decisions in
`docs/architecture/adr` before introducing a new dependency, package boundary, public API, or
interaction pattern.

## Workflow

1. Create a focused branch from `main`.
2. Keep changes within the approved phase or proposal.
3. Add tests for behavior changes and documentation for public API changes.
4. Run `pnpm check`.
5. Run `pnpm test:browser` for changes affecting browser behavior or accessibility.
6. Submit the change for review before merging.

## Commit style

Use concise, imperative commit subjects with a conventional category when useful:

```text
feat: add status indicator semantics
fix: restore focus after dialog closes
docs: explain stale telemetry
chore: update the token compiler
```

## Architecture decisions

Consequential decisions require an architecture decision record. Copy
`docs/architecture/adr/0000-template.md`, assign the next number, and describe context, decision,
consequences, and alternatives.

## Definition of done

A change is complete only when the relevant requirements in `SPEC.md` section 29 are satisfied.
Incomplete validation or known failures must be reported rather than hidden.
