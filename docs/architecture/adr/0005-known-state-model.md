# ADR 0005: Model condition, knowledge, and activity separately

- Status: accepted
- Date: 2026-07-27

## Context

A flat status enum cannot honestly represent combinations such as a critical condition reported by
stale telemetry or a positive condition while a requested action is pending. Conflating severity,
confidence, availability, and progress creates contradictory APIs.

## Decision

Use three orthogonal state axes:

- Condition: `neutral`, `informational`, `positive`, `caution`, `critical`
- Knowledge: `confirmed`, `inferred`, `stale`, `unknown`, `conflicting`, `unavailable`
- Activity: `idle`, `pending`

Shared types live in `@wayglass/core`. Components may constrain applicable values but must not
redefine their meaning.

## Consequences

Components can communicate known state honestly without proliferating combined enum members. Visual
presentation must consider the axes together and must retain non-color labels or iconography.

## Alternatives considered

- One combined enum: rejected because combinations grow rapidly and lose semantic consistency.
- Component-specific status strings: rejected because products and themes could not rely on shared
  meaning.
