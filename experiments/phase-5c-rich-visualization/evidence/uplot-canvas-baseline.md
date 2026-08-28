# uPlot Canvas baseline evidence

**Recorded:** 2026-08-26  
**Scope:** partial evidence for `P5C-E01` through `P5C-E06`, `P5C-E08` through `P5C-E10`  
**Disposition:** rejected on 2026-08-28; historical evidence retained and executable adapter,
dependency, tests, and lock entries removed

## Implemented boundary

The adapter executes `uplot@1.6.32` only inside the private experiment. The exact release is MIT,
has built-in TypeScript declarations, and has no runtime dependency. It consumes the frozen shared
input without mutation and gives uPlot aligned full-resolution timestamps and values, including
explicit `null` gaps. The authored window and numeric scale remain fixed inputs rather than inferred
chart policy.

One Canvas is `aria-hidden`. Shared native HTML—also used by the native SVG baseline—owns the scale,
threshold and annotation context, series visibility, bounded navigation, and persistent exact
inspector. The application-owned summary and complete native table remain outside both adapters.
Consequently, Canvas pixels are never the sole owner of exact values or operational meaning.

The adapter supports:

- all four full-resolution series with semantic colors and distinct non-color dash patterns;
- Wayglass-owned Canvas overlays for the authored threshold, annotation, unavailable observations,
  and non-confirmed knowledge;
- native visibility controls that retain at least one visible series;
- previous and next sample, previous and next visible series, and pointer selection into the same
  persistent inspector;
- a single `ResizeObserver` that schedules at most one cancellable animation frame; and
- explicit teardown of the observer, animation frame, pointer listener, shared inspection DOM, uPlot
  instance, and adapter root.

It registers no element, changes no global, creates no network request, and adds no production
package export or foundation dependency.

## Automated and visual checks

The focused Phase 5C gate passes 18 tests across the shared boundary, fixture, native geometry,
shared inspection state, and uPlot model. The combined private browser check passes 18 tests across
current Chromium, Firefox, and WebKit: nine native-baseline checks and nine uPlot checks. The uPlot
checks verify Canvas semantic isolation, authored threshold and annotation identities, persistent
inspection, native visibility controls, pointer selection, 320-pixel containment, and an Axe scan.

Direct visual review at 1,440 CSS pixels found the expected compact, banded Wayglass composition,
matching native and Canvas context, distinguishable series treatments, visible threshold and
annotation, persistent exact inspection, and no browser warning or error.

The first responsive implementation resized uPlot synchronously inside its `ResizeObserver` and
produced a browser `ResizeObserver loop completed with undelivered notifications` warning. The
adapter now coalesces measurement and resize into one cancellable animation frame and explicitly
cancels it during teardown. The warning is absent from the corrected visual and browser checks.

## Evidence completed before rejection

This slice alone did not establish the later construction, update, inspection, memory,
installed-size, production-bundle, adaptation, assistive-technology, or teardown evidence. The
retained comparative records completed those planned measurements before rejecting uPlot. The
executable adapter and its tests are intentionally absent after cleanup.

## Reproduction

The rejected adapter can be inspected at tested proof commit `4875ba4`; it is not reproducible from
the dispositioned tree without deliberately restoring rejected code and dependencies.
