# Phase 5C adverse input and update validation

**Recorded:** 2026-08-27  
**Environment:** macOS 26.5.2 arm64; Node 26.4.0; pnpm 11.9.0; Playwright 1.62.0; current bundled
Chromium, Firefox, and WebKit  
**Revision:** Phase 5C adverse-update worktree based on merge commit `71c9522`  
**Disposition:** automated `P5C-E02` and `P5C-E10` adverse-input envelopes pass; owner review
pending

All three private adapters now validate the shared input boundary before mounting and validate a
replacement before checking compatibility or mutating adapter state. Failure is synchronous and uses
a stable `P5C_INPUT_*` or `P5C_REPLACEMENT_SHAPE` diagnostic. Because this is a private proof API,
the consuming application remains responsible for deciding how to present that diagnostic to its
users.

## Adverse model matrix

The 26-test focused suite passes and covers:

- a non-record root, empty series, empty points, more than four series, and more than 2,880 points
  per series;
- missing text, non-finite numbers, an invalid window or scale, out-of-window observations, and
  out-of-scale values, thresholds, or annotations;
- duplicate series and point identities, including cross-series point duplication;
- unordered observations, cross-series timestamp misalignment, duplicate exact formatted times, and
  cross-series formatted-time misalignment;
- unknown knowledge vocabulary, unavailable gaps without unavailable knowledge, and finite values
  incorrectly labeled unavailable; and
- accepted immutable maximum input, bounded inspection, stable visibility, nearest-point selection,
  valid replacement identity, and incompatible replacement shape.

Validation does not mutate the candidate input. It does not derive a unit, threshold, condition,
activity, knowledge value, annotation, formatted value, or task conclusion.

## Transactional browser matrix

Nine Playwright tests pass: native SVG/HTML, uPlot Canvas, and D3-assisted SVG in Chromium, Firefox,
and WebKit. For every adapter the test verifies that:

1. an empty-series mount throws `P5C_INPUT_SERIES_COUNT` before adding adapter DOM;
2. a same-shape update with an out-of-scale value throws `P5C_INPUT_POINT_SCALE`;
3. the failed update preserves exact inspection state, displayed value, rendered-data signature, and
   focused native control;
4. a validated but incompatible window throws `P5C_REPLACEMENT_SHAPE` before mutation;
5. a valid replacement still succeeds after both failures and retains focus; and
6. destroy removes all adapter DOM.

The existing 60-update resource test remains the listener, observer, animation-frame, DOM, and
retained-heap check. It was rerun after full replacement validation was added. Both performance
tests pass: the largest observed synchronous construction was 10.1 ms, the largest replacement was
7.4 ms, exact inspection was at most 0.1 ms, retained heap ratio was `1.055175`, and teardown left
zero adapter nodes, active observers, or pending frames.

## Reproduction and limitations

Run from the repository root:

```sh
pnpm experiment:phase5c:check
pnpm exec playwright test tests/browser/phase-5c-adverse-update.spec.ts
pnpm exec playwright test --config playwright.phase5c-performance.config.ts
```

This evidence exercises deterministic synchronous replacement, not streaming, partial transport,
provider, persistence, retry, or concurrency behavior. The proof deliberately has no built-in
user-facing error panel: applications own failure presentation and must not convert an input error
into inferred operational status. Manual assistive-technology review and final owner disposition
remain separate; the maintenance and dependency comparisons are retained in later evidence.
