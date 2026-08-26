# Phase 5C rich-visualization proof

This private experiment implements the bounded proof accepted in
[`P5C-RICH-VISUALIZATION-001`](../../docs/governance/explorations/phase-5c-rich-visualization.md).
It is not a workspace package, production export, public Custom Element, chart grammar, or release
candidate.

## Implemented slices

The foundation slice owns the shared deterministic input boundary and queue-investigation fixture:

- one fixed 24-hour window at 30-second intervals;
- four aligned series and 2,880 samples per series, for 11,520 points total;
- stable series, point, threshold, and annotation identities;
- application-authored labels, formatted times, formatted values, summary, scale, unit, threshold,
  and annotation;
- explicit gaps and observation knowledge without inferred condition, activity, trend, or policy;
- known first-breach and recovery answers used to validate every later adapter; and
- fail-fast validation for malformed, ambiguous, misaligned, or out-of-envelope input.

The native baseline slice adds:

- dependency-free authored SVG geometry for all series, the threshold, annotation, gaps, and
  knowledge marks;
- four non-color line patterns plus semantic data colors;
- persistent native-HTML exact inspection with previous/next sample and series controls;
- native checkboxes for series visibility while retaining at least one visible series;
- pointer selection that updates the same persistent inspector rather than a hover-only tooltip;
- a shared application-owned summary and lazily mounted native table containing all exact points;
- normalized SVG resizing without a listener, observer, registration, or global mutation; and
- focused model tests plus a private Playwright smoke, keyboard, table, containment, and Axe check.

The uPlot and D3-assisted SVG adapters remain absent. Their exact proof-only dependencies are
installed and locked, but no candidate library is imported or executed yet.

## Commands

From the repository root:

```sh
pnpm experiment:phase5c:check
pnpm experiment:phase5c:typecheck
pnpm experiment:phase5c:test
```

The ordinary repository `check` includes the focused proof typecheck and tests. Tests use no
network, credentials, personal data, provider data, generated output, registration, or filesystem
write outside the test runner's ordinary cache.

The dated dependency and fixture findings are retained in
[`evidence/dependency-and-fixture-foundation.md`](./evidence/dependency-and-fixture-foundation.md).
The first adapter findings are retained in
[`evidence/native-baseline.md`](./evidence/native-baseline.md).

## Ownership boundary

The fixture stands in for application-owned validated and formatted input. Wayglass does not derive
the unit, scale, threshold, annotation meaning, state axes, summary, or operational conclusion from
geometry. Later adapters must consume this same frozen object without mutation or candidate-specific
normalization that changes meaning.
