# ADR 0008: Establish the Phase 1 contracts before component implementation

- Status: accepted
- Date: 2026-07-27

## Context

The Phase 1 vertical slice must prove the visual language, state model, theming, responsive
composition, accessibility, Custom Element APIs, and React wrappers together. Building components
without a shared reference composition would make local API choices difficult to evaluate and could
produce a collection of individually plausible parts that do not form a coherent operational screen.

Executable documentation must use production packages, so a throwaway visual mock would create a
second implementation and invite drift.

## Decision

Define Operations Overview as the Phase 1 reference composition with three neutral example
functions: Access, Communications, and Processing. Use it to exercise multiple functional zones,
mixed section purposes, independent value and known-state axes, action feedback, and phone, desktop,
and wall-panel recomposition.

Document the public contracts for the ten Phase 1 components before implementing them. Lock the
reference, semantic, and component token values required by those contracts. Structural rails and
elbows remain neutral and never carry unlabeled value or condition meaning.

The first executable reference fixture will be built from production components in Storybook. No
parallel mock component implementation will be added.

## Consequences

Implementation has an explicit integration target and public API review can happen before code makes
accidental contracts expensive. Token changes during Phase 1 require deliberate review and updated
tests. The values are locked for Phase 1 development but are not a public stability promise before
naming, licensing, and release governance are resolved.

The example function names do not become component concepts or limit later reference domains.

## Alternatives considered

- Implement components first and compose later: rejected because integration and responsive problems
  would surface too late.
- Build a standalone HTML/CSS mock: rejected because it would violate the production-backed
  documentation rule and create visual drift.
- Center the first slice on smart-home controls: rejected because the generic component layer needs
  to prove domain neutrality first.
