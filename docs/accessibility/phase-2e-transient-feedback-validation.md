# Phase 2E-C transient-feedback validation

**Status:** Automated cross-browser and visual review complete on August 2, 2026. Representative
assistive-technology review is carried as an explicit public-release gate in the
[Phase 2 ledger](./phase-2-assistive-technology-gates.md).

This record covers `wg-toast`, `wg-toast-region`, the document-level queue and announcement
coordinator, their locked tokens, typed React wrappers, and production-backed Storybook
compositions.

## Acceptance matrix

| Area                            | Evidence                                                                                                                                                         | Status  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Queue ownership                 | One region bounds visible feedback, retains queued requests without starting their timers, and promotes eligible requests in FIFO order                          | Pass    |
| Deduplication                   | Explicit duplicate keys replace in place, emit the `replaced` dismissal reason, suppress unchanged polite text, and announce materially changed replacement text | Pass    |
| Announcement scope              | Static markup is silent; dynamic feedback uses private polite or assertive nodes containing message and detail text without action or close labels               | Pass    |
| Timing                          | Timed lifetime starts on visibility, clamps to the accepted range, and preserves remaining time across pause and resume                                          | Pass    |
| Pause and dismissal             | Explicit pause, focus containment, timeout, close, programmatic dismissal, and focused `dismissAll` deferral follow the accepted coordinator contract            | Pass    |
| Focus independence              | Opening and promotion never move focus; explicit close returns focus to the usable stack-entry target without jumping to the originating action                  | Pass    |
| State normalization             | Invalid condition, announcement, placement, duration, and visible-limit values normalize to accepted safe values                                                 | Pass    |
| Reduced motion                  | The entry animation is absent when reduced motion is requested                                                                                                   | Pass    |
| Reflow and zoom                 | The complete toast remains usable without horizontal page overflow at the 320 CSS-pixel viewport produced by 400% zoom on a 1280-pixel baseline                  | Pass    |
| React parity                    | Typed wrappers preserve production properties, methods, refs, authored children, and dismissal-event detail                                                      | Pass    |
| Supported engines               | All 54 focused cases pass in Chromium, Firefox, and WebKit                                                                                                       | Pass    |
| Automated accessibility         | Axe reports no violations in dark and light fixtures across supported engines                                                                                    | Pass    |
| Representative assistive review | VoiceOver/Safari and NVDA/Firefox announcement timing, duplicate suppression, interruption, action navigation, and retained context                              | Carried |

## Automated review record

The focused Playwright matrix covers side-effect-free imports, useful initial content without
initial announcement, focus independence, announcement scope, visible queue bounds, FIFO promotion,
deduplication, dismissal reasons, action-bearing lifetime defaults, timed expiry, explicit and
focus-driven pausing, deferred focused dismissal, state normalization, dark and light Axe scans,
reduced motion, and narrow reflow. The original 51 focused cases passed across Chromium, Firefox,
and WebKit on August 2, 2026. All 54 current focused cases, including unchanged
assertive-to-assertive replacement suppression, passed across those engines on September 3, 2026.

The complete repository browser matrix also passed all 609 cases across those engines.

The validation runs found two implementation defects. `dismissAll()` correctly retained a toast that
contained focus, but did not complete the deferred dismissal after focus left. The corrected region
tracks focused deferred records, dismisses them only after focus leaves, and updates queue
visibility once. The initial entry animation also faded the entire toast from transparent, allowing
WebKit to observe a temporary sub-threshold text contrast during an automated accessibility scan.
Entry motion now uses position only, preserving the final text and surface contrast in every frame.
The regression cases pass in all supported engines.

The Phase 6B field-level audit found one additional coordinator defect: replacing an assertive toast
with the same normalized text and the same assertive priority repeated its announcement. The region
now suppresses that duplicate while continuing to announce changed text and a genuine transition to
assertive priority.

The first automated accessibility scan also found that the dedicated test fixture placed its static
toast outside the page's `main` landmark. The fixture now keeps the document-level region within the
page landmark without adding a role to the region itself. Component semantics did not change.

## Visual review record

The production Storybook composition was reviewed in dark and light desktop contexts and at a
390-by-844 phone viewport. The Preferences and Export history functions remain visually distinct,
while the viewport-edge toast reads as temporary feedback rather than a third function or modal
surface. The single resting action-bearing toast leaves both durable destinations apparent.

The compact phone composition stacks the two functions and constrains the toast to 358 pixels with
16-pixel viewport insets. The document client and scroll widths both remained 390 pixels. Triggering
the export result produced a second, caution-state toast; repeating the trigger replaced its
deduplicated request without adding a third visible toast. The browser console reported no errors.

## Carried representative review

DOM and accessibility-tree assertions do not prove spoken timing, interruption, or a screen reader's
handling of consecutive live-region mutations. Before public release, complete representative
VoiceOver with Safari and NVDA with Firefox review for:

1. no announcement from static initial content and one correctly scoped announcement for newly
   visible feedback;
2. unchanged duplicate suppression and changed replacement delivery without repeated action or close
   labels;
3. polite serialization and assertive interruption without changing visible FIFO order;
4. virtual-cursor access to toast message, detail, action, and close control without moving focus on
   appearance; and
5. pause and explicit dismissal behavior while keyboard focus is inside the toast stack.

## Reproduce automated checks

```bash
pnpm check
pnpm exec playwright test tests/browser/transient-feedback.spec.ts
pnpm test:browser
```
