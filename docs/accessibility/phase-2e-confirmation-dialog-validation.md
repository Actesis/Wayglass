# Phase 2E-D confirmation-dialog validation

**Status:** Automated cross-browser and visual review complete on August 2, 2026. Representative
assistive-technology review remains open for Phase 2 closeout.

This record covers `wg-confirmation-dialog`, its document-local modal coordinator, locked tokens,
typed React wrapper, and production-backed proportional-friction stories.

## Acceptance matrix

| Area                            | Evidence                                                                                                                                                       | Status  |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Native modal ownership          | One shadow-owned native `dialog` uses `showModal()`; invalid anatomy, a second Wayglass confirmation, a reentrant request, and a foreign native modal reject   | Pass    |
| Semantics and labeling          | Visible heading and description name the native dialog; interruptive mode explicitly selects `alertdialog`; action and cancel retain specific visible labels   | Pass    |
| Initial and contained focus     | Cancel, action, and static-heading entry modes work; native Tab and Shift+Tab behavior does not reach inert page controls                                      | Pass    |
| Cancellation and backdrop       | Visible cancel, Escape, and programmatic closure report distinct reasons; backdrop pointer interaction neither decides nor dismisses                           | Pass    |
| Confirmed action                | Native closure and focus return precede one close event and one confirmed-intent event; repeated activation emits no duplicate intent                          | Pass    |
| Focus return                    | Connected invokers, removed invokers with explicit fallbacks, and invokers inside a shadow root recover the accepted logical destination                       | Pass    |
| Stale terms and reentrancy      | Application-owned stale-term closure settles without reopening; requests during the current close lifecycle reject instead of queueing                         | Pass    |
| Proportional friction           | Stories distinguish direct action, modal confirmation, interruptive decision, and stronger application-owned verification without using color as policy        | Pass    |
| Color independence              | Specific labels and visible boundaries retain meaning in dark, light, grayscale-equivalent, and forced-color presentation                                      | Pass    |
| Motion                          | Reduced-motion preference removes the entry animation                                                                                                          | Pass    |
| Reflow, text size, and overflow | At 320 CSS pixels and 200% root text size, the surface remains within the viewport, long terms wrap, and vertical overflow stays inside the dialog             | Pass    |
| React parity                    | The typed wrapper preserves production properties, methods, refs, authored children, events, and the same document-local coordinator                           | Pass    |
| Supported engines               | All 63 focused cases pass in Chromium, Firefox, and WebKit                                                                                                     | Pass    |
| Automated accessibility         | Axe reports no non-contrast violations in dark and light open-dialog fixtures; every modal foreground/background pair passes explicit contrast measurement     | Pass    |
| Representative assistive review | VoiceOver/Safari and NVDA/Firefox announcement, reading order, modality, cancellation, focus containment, and focus return with vanilla and React entry points | Pending |

## Automated review record

The focused Playwright matrix covers side-effect-free import, native modal ownership, ordinary and
interruptive semantics, all initial-focus modes, native keyboard containment, visible and Escape
cancellation, backdrop restraint, programmatic and confirmed closure, exact event order, duplicate
activation suppression, invoker and fallback recovery, shadow-root focus return, simultaneous,
reentrant, and foreign-modal rejection, stale-term closure, vocabulary normalization, dark and light
accessibility scans, forced colors, reduced motion, and constrained reflow at 200% text size. All 63
focused cases passed across Chromium, Firefox, and WebKit on August 2, 2026.

The complete 675-case repository matrix was also exercised. Resource saturation caused unrelated
Firefox worker termination on the first run and three WebKit page-navigation timeouts on the
lower-concurrency rerun; all 147 affected confirmation, framework-example, and Function Deck cases
and all 12 affected WebKit persistent-feedback cases passed on isolated reruns. No component
assertion remained failing.

Axe's color-contrast rule currently composites a shadow-owned native `::backdrop` over the dialog
surface itself. The focused scan therefore retains every other Axe rule and checks the heading,
description, cancel, primary-action, and critical-action foreground/background pairs directly at the
accepted contrast threshold.

Validation found three implementation defects. The coordinator initially rejected only other
Wayglass confirmations and allowed a confirmation to stack over an application-owned native modal.
The accepted correction detects a foreign light-DOM native modal and rejects the request. Native
close and Lit reflection could also race, allowing a stale `open` update or a synchronous reentrant
request to reopen a closing dialog. The close lifecycle now retains coordinator ownership, rejects
reentrancy, and suppresses reflective reopening until close events and focus return settle. Finally,
200% text size exposed native intrinsic minimum sizing and long-label overflow; the dialog now
removes the user-agent minimum and permits visible terms to wrap.

## Visual review record

The production Storybook proportional-friction composition was reviewed in dark and light desktop
contexts. Direct preference change, consequential modal confirmation, interruptive decision, and
stronger verification remain visibly distinct without making every critical-looking action modal.
The confirmation surface preserves the established banded visual language, clear function context, a
dominant visible heading, specific safe and consequential labels, and a durable result in the
originating function after confirmation.

The meaning survives without hue: border, band, heading, consequence text, explicit action wording,
and the always-visible cancel path remain available in grayscale-equivalent and forced-color
presentation. At the constrained viewport and 200% text size, labels wrap without clipping, both
choices remain reachable, and long content scrolls inside the modal rather than moving the document
behind it.

## Open representative review

DOM, accessibility-tree, and keyboard assertions do not prove spoken dialog entry, virtual-cursor
context, or platform-specific focus recovery. Before Phase 2 closeout, complete representative
VoiceOver with Safari and NVDA with Firefox review for both vanilla and React entry points:

1. ordinary `dialog` and explicit `alertdialog` name, description, role, and initial announcement;
2. cancel-first, action-first, and static-heading entry with forward and reverse navigation confined
   to the modal;
3. visible cancel and Escape closure, ignored backdrop interaction, and returned context at a
   connected invoker, shadow-root invoker, or explicit fallback;
4. one-at-a-time rejection without an unexpected announcement, focus jump, or queued reopening; and
5. close-before-action event behavior followed by durable pending, success, and failure feedback at
   the originating function.

## Reproduce automated checks

```bash
pnpm check
pnpm exec playwright test tests/browser/confirmation-dialog.spec.ts
pnpm exec playwright test tests/browser/react-wrappers.spec.ts
pnpm test:browser
```
