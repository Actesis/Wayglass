# Phase 5C rich-visualization proof

This private experiment implements the bounded proof accepted in
[`P5C-RICH-VISUALIZATION-001`](../../docs/governance/explorations/phase-5c-rich-visualization.md).
It is not a workspace package, production export, public Custom Element, chart grammar, or release
candidate.

## Current slice

The first slice owns only the shared deterministic input boundary and queue-investigation fixture:

- one fixed 24-hour window at 30-second intervals;
- four aligned series and 2,880 samples per series, for 11,520 points total;
- stable series, point, threshold, and annotation identities;
- application-authored labels, formatted times, formatted values, summary, scale, unit, threshold,
  and annotation;
- explicit gaps and observation knowledge without inferred condition, activity, trend, or policy;
- known first-breach and recovery answers used to validate every later adapter; and
- fail-fast validation for malformed, ambiguous, misaligned, or out-of-envelope input.

The native SVG/HTML, uPlot, and D3-assisted SVG adapters are intentionally absent from this slice.
The exact proof-only dependencies are installed and locked after the accepted pre-install screen,
but no candidate library is imported or executed yet.

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

## Ownership boundary

The fixture stands in for application-owned validated and formatted input. Wayglass does not derive
the unit, scale, threshold, annotation meaning, state axes, summary, or operational conclusion from
geometry. Later adapters must consume this same frozen object without mutation or candidate-specific
normalization that changes meaning.
