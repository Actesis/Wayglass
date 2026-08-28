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

The uPlot Canvas slice adds:

- full-resolution aligned uPlot data with explicit null gaps and the fixed authored scale;
- a single non-semantic Canvas while shared native HTML retains context, visibility controls,
  navigation, and persistent exact inspection;
- four non-color series patterns, semantic data colors, and Wayglass-owned Canvas overlays for the
  threshold, annotation, gaps, and observation knowledge;
- pointer selection into the same shared inspector used by the native baseline;
- contained responsive sizing through one cancellable animation frame and a disconnected
  `ResizeObserver`; and
- focused model tests plus private Chromium, Firefox, and WebKit smoke, interaction, containment,
  and Axe checks.

The D3-assisted SVG slice adds:

- `d3-array` pairing, `d3-scale` authored-domain mapping, and `d3-shape` line generation without a
  general chart runtime or inferred scale;
- the same full-resolution series, explicit gaps, knowledge marks, threshold, and annotation as the
  native SVG baseline;
- one shared authored-SVG renderer and native-HTML inspection contract for the native and D3
  calculations, keeping semantics and interaction out of D3;
- normalized view-box resize without an observer, listener, timer, or global mutation; and
- focused geometry tests plus private Chromium, Firefox, and WebKit smoke, interaction, containment,
  and Axe checks.

The comparative-measurement slice adds:

- fixed-envelope in-place replacement for all three adapters, with stable inspector focus,
  selection, and semantic HTML;
- explicit rejection of replacement input that changes proof identity, window, scale, series order,
  or point identities;
- isolated production JavaScript bundle measurements for each self-contained adapter;
- construction, exact-inspection, and replacement timing from a minified production build; and
- 60-update teardown checks for retained heap, adapter DOM, resize observers, and animation frames.

The responsive and non-color adaptation slice adds:

- reproducible private proof states for official themes, densities, direction, grayscale, and long
  localized application text;
- genuine compact/comfortable mapping and contained 320/1,440-pixel layouts;
- long-text reflow at 200% root text in both themes without truncation or page overflow;
- physical left-to-right chronology inside direction-neutral RTL composition, with bidi isolation
  for application-authored labels and formatted values;
- four distinct non-color series and legend patterns; and
- forced-color Canvas system colors plus retained SVG, grayscale, reduced-motion, persistent HTML,
  and exact-table meaning.

The task-interaction slice adds:

- one complete maximum-fixture investigation through the authored summary, exact table, and every
  adapter;
- unique second-resolution exact labels enforced by the shared input boundary;
- native keyboard and touch-sized controls with persistent focus and exact HTML output;
- one coarse pointer contract across SVG and Canvas: native series choice, whole-plot time choice,
  and native adjacent-sample refinement; and
- explicit first/last, caution-crossing, intervention, recovery, and unavailable-gap validation in
  Chromium, Firefox, and WebKit.

The adverse-input and update slice adds:

- fail-fast validation before any adapter DOM is mounted;
- transactional validation before a replacement can mutate state or rendered data;
- explicit empty, malformed, non-finite, out-of-bounds, duplicate, unsorted, misaligned, oversized,
  and semantic-conflict coverage;
- preservation of the last valid inspection, geometry, focus, and later update capability after a
  rejected replacement; and
- nine cross-browser adapter tests plus a post-validation performance and teardown rerun.

All three bounded adapters and the named-desktop comparative measurement are now implemented. The
automated responsive/non-color, task-interaction, dependency, maintenance, complete-removal, and
runtime-isolation matrices also pass. Manual assistive-technology, owner review, and disposition
evidence remain intentionally separate.

## Commands

From the repository root:

```sh
pnpm experiment:phase5c:check
pnpm experiment:phase5c:typecheck
pnpm experiment:phase5c:test
pnpm exec playwright test --config playwright.phase5c-performance.config.ts
pnpm exec playwright test tests/browser/phase-5c-adaptation.spec.ts
pnpm exec playwright test tests/browser/phase-5c-task-interaction.spec.ts
pnpm exec playwright test tests/browser/phase-5c-adverse-update.spec.ts
pnpm exec playwright test tests/browser/phase-5c-isolation.spec.ts
pnpm exec playwright test tests/browser/phase-5c-assistive-preflight.spec.ts
```

The ordinary repository `check` includes the focused proof typecheck and tests. Tests use no
network, credentials, personal data, provider data, generated output, registration, or filesystem
write outside the test runner's ordinary cache.

The dated dependency and fixture findings are retained in
[`evidence/dependency-and-fixture-foundation.md`](./evidence/dependency-and-fixture-foundation.md).
The first adapter findings are retained in
[`evidence/native-baseline.md`](./evidence/native-baseline.md). The uPlot adapter findings are
retained in [`evidence/uplot-canvas-baseline.md`](./evidence/uplot-canvas-baseline.md). The
D3-assisted adapter findings are retained in
[`evidence/d3-assisted-svg-baseline.md`](./evidence/d3-assisted-svg-baseline.md). Production bundle,
timing, replacement, and resource findings are retained in
[`evidence/comparative-measurements.md`](./evidence/comparative-measurements.md). Responsive,
theme/density, RTL, long-text, and non-color findings are retained in
[`evidence/adaptation-validation.md`](./evidence/adaptation-validation.md). Complete task, keyboard,
pointer, touch, and exact-label findings are retained in
[`evidence/task-interaction-validation.md`](./evidence/task-interaction-validation.md). Adverse
input, transactional replacement, and post-validation performance findings are retained in
[`evidence/adverse-input-and-update-validation.md`](./evidence/adverse-input-and-update-validation.md).
Dependency, maintenance, removal, bundle parse/evaluation, and cross-browser isolation findings are
retained in
[`evidence/dependency-and-isolation-audit.md`](./evidence/dependency-and-isolation-audit.md).
Comparative owned-source, lifecycle, and candidate findings are retained in
[`evidence/maintenance-and-candidate-comparison.md`](./evidence/maintenance-and-candidate-comparison.md).
The native-only semantic preflight and fixed VoiceOver/Safari and NVDA/Firefox transcript protocol
are retained in
[`evidence/assistive-technology-validation.md`](./evidence/assistive-technology-validation.md).

## Ownership boundary

The fixture stands in for application-owned validated and formatted input. Wayglass does not derive
the unit, scale, threshold, annotation meaning, state axes, summary, or operational conclusion from
geometry. Later adapters must consume this same frozen object without mutation or candidate-specific
normalization that changes meaning.
