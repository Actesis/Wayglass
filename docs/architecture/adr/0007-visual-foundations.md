# ADR 0007: Adopt the Phase 0 visual foundations

- Status: accepted
- Date: 2026-07-27

## Context

Phase 1 will lock token values and build a domain-neutral vertical slice. Before that work begins,
Wayglass needs an accepted visual grammar that distinguishes function ownership, section purpose,
domain value, condition, knowledge, activity, and action.

Exploration showed that ordinary section dividers do not create strong enough boundaries between
functions, stoplight color becomes confusing when it is applied to domain values, and an icon-led
language would bias the system toward home automation.

## Decision

Adopt the visual rules in `docs/foundations/visual-language.md`:

- humanist typography, compact density, and banded geometry;
- explicit functional zoning;
- independent information, monitor, and control section purposes;
- stoplight color reserved for condition and attention meaning;
- asserted and not-asserted Boolean value roles with no health meaning;
- value rail, value field, and supplementary value-text treatments;
- optional domain icons rather than icon-dependent semantics.

Domain value remains separate from the known-state axes. Unknown remains knowledge, not a false
Boolean value.

## Consequences

Tokens and component APIs must name semantic roles rather than domain values or hues. Generic
primitives can support many domains without defining every possible state. Themes may substantially
adapt the brand while preserving functional boundaries and semantic meaning.

The Phase 1 slice must demonstrate multiple functions, mixed section purposes, icon-free Boolean
values, and independent value and known-state combinations.

## Alternatives considered

- Status color for every value: rejected because `off`, `closed`, and `unverified` are not
  inherently failures.
- Domain-specific state components: rejected because the system would require a new visual rule for
  every product vocabulary.
- Icon-first state recognition: rejected because icons are not universal and would overfit the
  foundation to device-control interfaces.
- Decorative LCARS-style geometry: rejected because Wayglass borrows the principle of functional
  separation, not a franchise-specific surface language.
