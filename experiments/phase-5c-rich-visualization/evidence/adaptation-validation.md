# Phase 5C responsive and non-color adaptation

**Recorded:** 2026-08-27  
**Environment:** macOS 26.5.2 arm64; Node 26.4.0; pnpm 11.9.0; Playwright 1.62.0; current bundled
Chromium, Firefox, and WebKit  
**Revision:** Phase 5C adaptation worktree based on merge commit `74111d2`  
**Disposition:** automated `P5C-E05` and `P5C-E06` envelopes pass; owner review pending

All three private adapters consumed the same full 4-series, 11,520-point fixture. A second validated
fixture changed only application-authored title, summary, series labels, formatted window labels,
threshold label, annotation label, and annotation detail to intentionally long localized text. It
did not change the proof identity, scale, window, series order, point count, or point identities.

## Automated matrix

The browser matrix ran nine tests, all passing:

- Chromium, Firefox, and WebKit;
- 320 and 1,440 CSS-pixel viewports;
- Wayglass dark and light themes;
- compact and comfortable densities, with a verified spacing change;
- both themes at 320 CSS pixels, 200% root text, comfortable density, RTL, and long labels;
- forced colors, grayscale, and reduced motion;
- four distinct non-color SVG series patterns and four matching legend samples;
- distinct threshold and annotation patterns;
- one Canvas with the persistent exact HTML inspector still visible; and
- no document overflow beyond the one-pixel rounding tolerance and no detectable Axe violations.

The carried production budgets were rerun after the forced-color code change. Native, uPlot, and D3
remained at 3,719 B, 29,976 B, and 13,815 B gzip respectively, below the 40 KiB ceiling. The named
Chromium production run again passed all timing budgets (largest observed synchronous replacement:
10.5 ms) and teardown budgets (retained heap ratio `1.048126`; zero adapter nodes, active resize
observers, or pending animation frames).

The bounded time axis intentionally retains physical left-to-right chronology inside either document
direction. Its plotted geometry and authored start/end labels therefore remain aligned. Surrounding
context and controls follow RTL. Application-authored text uses `unicode-bidi: plaintext`, allowing
a localized label or formatted value to choose its direction from its own first strong character
without changing the surrounding layout.

The uPlot Canvas adapter selects forced-color system colors at construction while retaining its
authored dash patterns, knowledge shapes, persistent HTML meaning, and exact table alternative. The
SVG candidates use system strokes in forced colors. Grayscale does not remove the series, threshold,
annotation, gap, knowledge, or selection patterns. The proof contains no active CSS animation or
transition under reduced motion.

## Visual review and adverse evidence

A representative 1,280-pixel light, comfortable, long-label RTL state was inspected in the local
browser after the automated run. Panel hierarchy, chart containment, chronology, line patterns,
legend patterns, native controls, and exact inspection remained visible without clipping in the
viewport.

The validation found and retained four adverse results before passing:

1. Theme and density attributes were initially placed on the root element, where root token defaults
   won the cascade. Moving the private proof attributes to `body` made every permutation genuine.
2. The first combined 320-pixel, 200%-text, long-label RTL run overflowed by 182 pixels in Chromium,
   183 pixels in Firefox, and 159 pixels in WebKit. Allowing authored text to wrap anywhere and the
   time-window labels to wrap removed the overflow without truncation.
3. The second and fourth legend samples both used a dashed border even though their plotted dash
   arrays differed. The fourth sample now uses a double rule, leaving solid, dashed, dotted, and
   double quick distinctions.
4. Visual review found that Latin-formatted timestamps reordered under inherited RTL outside the
   time axis. Bidi paragraph isolation corrected the values without forcing application text to one
   language direction.

These corrections did not widen the chart form, infer state, change the fixed envelope, or create a
public surface.

## Reproduction and limitations

Run from the repository root:

```sh
pnpm exec playwright test tests/browser/phase-5c-adaptation.spec.ts
```

This slice does not complete sighted task transcripts, touch interaction, 4x CPU throttling,
VoiceOver/Safari, NVDA/Firefox, a physical low-power tablet, or final artifact disposition. The long
fixture demonstrates layout handling, not translation quality; applications still own all localized
strings and formatted values. Forced-color Canvas verification combines system-color construction,
non-color model tests, visible Canvas/HTML checks, and the native exact alternative; it is not a
pixel-by-pixel Canvas color assertion.
