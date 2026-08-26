# D3-assisted SVG baseline evidence

**Recorded:** 2026-08-26  
**Scope:** partial evidence for `P5C-E01` through `P5C-E06`, `P5C-E08` through `P5C-E10`  
**Disposition:** candidate calculation adapter retained for comparison; evidence rows remain
incomplete

## Implemented boundary

The adapter executes the exact proof-only runtime set `d3-array@3.2.4`, `d3-scale@4.0.2`, and
`d3-shape@3.2.0`. Those runtime packages are ISC licensed. Their accepted strict-type boundary uses
`@types/d3-array@3.2.2`, `@types/d3-scale@4.0.9`, and `@types/d3-shape@3.2.0`, with the resolved
type-only `@types/d3-time@3.0.4` and `@types/d3-path@3.1.1`; the declaration packages are MIT
licensed and erased from runtime output.

D3 owns only adjacent-point pairing, authored-domain linear scale mapping, and line-path
calculation. It does not create DOM, choose domains, infer scale, format values, derive thresholds,
interpret knowledge, own interaction, or provide accessibility semantics. The adapter consumes the
same frozen validated input as the other candidates without mutation or downsampling.

The native and D3 calculations feed one shared Wayglass-owned authored-SVG renderer. That renderer
keeps its SVG `aria-hidden` and non-focusable while shared native HTML owns context, visibility,
bounded navigation, and persistent exact inspection. The application-owned summary and complete
native table remain outside every adapter. This isolates the comparison to calculation code rather
than duplicating semantics or interaction.

The adapter supports:

- all four full-resolution series, explicit path breaks at unavailable observations, and all
  authored knowledge marks;
- fixed application-authored time and numeric domains, threshold, and annotation;
- semantic colors plus four non-color series patterns;
- native visibility controls, keyboard navigation, and pointer selection into the persistent exact
  inspector; and
- responsive normalized SVG geometry without an observer, timer, global mutation, network request,
  registration, production export, or foundation dependency.

## Automated and visual checks

The focused Phase 5C gate passes 21 tests across the shared boundary, fixture, native and D3
geometry, shared inspection state, and uPlot model. The combined private browser check passes 27
tests across current Chromium, Firefox, and WebKit: nine checks for each adapter. The D3 checks
verify SVG semantic isolation, threshold and annotation presence, all four series, persistent exact
inspection, native visibility controls, pointer selection, 320-pixel containment, and an Axe scan.

Direct visual review at 1,440 CSS pixels found the native and D3 SVG outputs visually equivalent:
the same plot bounds, step changes, gaps, knowledge marks, selection, threshold, annotation, labels,
and interaction region were retained. The complete three-adapter page produced no browser warning or
error.

The geometry tests independently compare D3 output with the native baseline for series identity,
knowledge ordering, marks, authored bounds, threshold, annotation, and explicit gap breaks. D3 path
serialization differs internally, but no authored meaning or observable interaction changes.

## Remaining evidence

This slice does not establish construction, update, inspection, memory, installed-size, production
bundle, gzip, parse, or complete-removal budgets. It also does not complete the zoom, RTL,
forced-color, grayscale, reduced-motion, touch, long-label, manual VoiceOver, NVDA, physical tablet,
or repeated teardown matrix. Those comparative measurements and adaptation checks are now unblocked
because all three adapters share the fixed harness.

## Reproduction

```sh
pnpm experiment:phase5c:check
pnpm exec playwright test tests/browser/phase-5c-native-baseline.spec.ts tests/browser/phase-5c-uplot-adapter.spec.ts tests/browser/phase-5c-d3-adapter.spec.ts
```
