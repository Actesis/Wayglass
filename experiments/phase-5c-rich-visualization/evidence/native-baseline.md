# Native SVG and HTML baseline evidence

**Recorded:** 2026-08-26  
**Scope:** partial evidence for `P5C-E01` through `P5C-E06`, `P5C-E09`, and `P5C-E10`  
**Disposition:** accepted on 2026-08-28 as the dependency-free private artifact candidate; permanent
implementation remains deferred pending an independent consumer

## Implemented boundary

The native adapter consumes the frozen shared input without mutation or candidate-specific semantic
normalization. It uses authored SVG only for visual geometry and keeps that SVG `aria-hidden` and
non-focusable. Persistent native HTML owns exact inspection, series visibility, threshold and
annotation context, and keyboard controls. A separate shared equivalence region owns the authored
summary and lazily constructs a native 2,880-row by five-column exact table.

The adapter supports:

- all four full-resolution series, one authored scale, one threshold, and one annotation;
- explicit path breaks and marks for unavailable observations;
- semantic colors plus four distinct line patterns for series identity;
- non-color marks for non-confirmed observation knowledge;
- previous and next sample, previous and next visible series, and bounded navigation;
- pointer selection into the same persistent exact inspector;
- native checkboxes that cannot hide the last visible series; and
- resize through a normalized SVG view box without listeners or observers.

It registers no element, modifies no global state, creates no timer or network request, and imports
no uPlot or D3 candidate code.

## Automated and visual checks

The focused TypeScript and Vitest gate passes 16 tests across the shared boundary, fixture, native
geometry, and selection state. The private Playwright check passes nine tests across current
Chromium, Firefox, and WebKit. It verifies the non-semantic graphic boundary, threshold and
annotation presence, persistent inspection, native visibility controls, complete exact table,
320-pixel containment, and an Axe scan of the proof.

Direct visual review at 1,440 CSS pixels found the expected compact, banded Wayglass composition and
distinguishable series samples. The first pass also exposed insufficient button-text contrast: an
action-text token had been combined with a neutral raised surface. The corrected baseline uses the
primary text token for that neutral control surface, after which the browser Axe check passed.

## Remaining evidence

This slice does not establish construction, update, inspection, memory, or bundle budgets; the
complete visual, zoom, RTL, forced-color, grayscale, reduced-motion, touch, and long-label matrix;
manual VoiceOver or NVDA task success; or comparative maintenance value. All three adapters now
share the harness, so those measurements and matrices are the next evidence step. The lazy table has
been validated for row and column completeness, not timed as part of adapter construction.

## Reproduction

```sh
pnpm experiment:phase5c:check
pnpm exec playwright test tests/browser/phase-5c-native-baseline.spec.ts
```
