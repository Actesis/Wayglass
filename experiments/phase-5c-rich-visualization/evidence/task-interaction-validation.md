# Phase 5C task and interaction validation

**Recorded:** 2026-08-27  
**Environment:** macOS 26.5.2 arm64; Node 26.4.0; pnpm 11.9.0; Playwright 1.62.0; current bundled
Chromium, Firefox, and WebKit  
**Revision:** Phase 5C task-interaction worktree based on merge commit `ebe18f8`  
**Disposition:** automated portions of `P5C-E01`, `P5C-E02`, and `P5C-E04` pass; owner review and
named assistive-technology transcripts remain pending

The automated matrix ran 12 tests, all passing. Every browser completed the same maximum-fixture
investigation through the shared application-authored summary, native exact table, persistent
inspector, and all three rendering adapters.

## Task result

The evidence answers the charter's four questions without deriving policy from chart geometry:

1. The Review queue is the first series to cross the authored 80-item caution threshold, at 08:00
   UTC.
2. Exact aligned values at that event are 86 Review, 46 Intake, 47 Classification, and 48 Dispatch
   items.
3. At the authored 14:00 UTC routing intervention the exact values are 85, 88, 91, and 95 items.
4. All queues recover below caution within 15 minutes; Dispatch is last, at 14:12 UTC with 76 items.

The complete 2,880-row table also verifies the exact values independently of all graphics. Its
focusable named overflow region remains available to keyboard users without creating custom table
navigation semantics.

## Interaction result

- Keyboard interaction uses native checkboxes and buttons. Visibility changes and sample/series
  movement retain focus, and every exact result persists in native HTML.
- Pointer interaction first selects a series through the same native controls, then uses the entire
  plot width to choose an approximate time. Adjacent sample buttons complete exact 30-second
  selection when display pixels cannot represent every observation.
- The task traverses the first and last observation, the first caution crossing, the authored
  intervention, the latest recovery, and an explicit unavailable gap. Exact value and knowledge
  remain visible after every action.
- Touch emulation at a 390 by 844 CSS-pixel viewport verifies 44-CSS-pixel minimum native controls,
  tap-driven sample movement, and tap-driven visibility changes without requiring line precision.
- SVG and Canvas now share the same coarse contract: vertical pointer position never guesses the
  intended series, and no information exists only on hover.

The carried named-Chromium performance gate was rerun after the interaction correction. Both tests
pass: the largest observed synchronous construction or replacement was 8.4 ms, exact inspection was
at most 0.1 ms, retained heap ratio was `1.056015`, and teardown left zero adapter nodes, active
observers, or pending animation frames.

## Adverse evidence retained

The validation found five material issues before passing:

1. The 30-second fixture originally formatted timestamps only to the minute, giving two distinct
   observations the same supposed exact label. The fixture now includes seconds, and the shared
   boundary rejects duplicate or cross-series-misaligned formatted timestamps.
2. The original SVG click conversion assumed that view-box coordinates filled the rendered SVG and
   selected 07:22 when the test targeted 08:00. Pointer conversion now uses the live SVG screen
   matrix.
3. Wide transparent hit strokes overlapped and selected the series painted last rather than the
   series the user intended. Series choice now belongs exclusively to native controls.
4. Empty parts of an SVG plot did not receive pointer events. A private transparent plot rectangle
   now makes the complete authored plot area operable.
5. One display pixel spans multiple 30-second samples at the maximum envelope, and the extreme
   Canvas edge is not a reliable click target. The proof now treats plot selection as coarse
   positioning and native previous/next sample controls as the exact operation. The test rejects a
   mid-plot result more than five samples away; its deliberately inset final-boundary click may be
   up to 32 samples away before exact native adjustment.

The browser-native `End` behavior on the named overflow region was not consistent enough to claim as
a custom table command. The proof retains ordinary focusable overflow and does not intercept or
redefine platform keys.

## Reproduction and limitations

Run from the repository root:

```sh
pnpm experiment:phase5c:check
pnpm exec playwright test tests/browser/phase-5c-task-interaction.spec.ts
```

This slice is deterministic synthetic evidence, not a representative deployed user study. It does
not complete VoiceOver/Safari, NVDA/Firefox, a physical touch device, low-power performance, or
final disposition. The later
[`maintenance-and-candidate-comparison.md`](./maintenance-and-candidate-comparison.md) completes the
source and ownership comparison. The summary, formatted values, thresholds, annotation, and task
conclusion remain application-owned.
