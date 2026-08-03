# Phase 2F modal-content and media-inspection validation

**Status:** Automated cross-browser validation and production Storybook review completed on August
3, 2026. Representative VoiceOver/Safari and NVDA/Firefox reviews remain explicit public-release
gates.

This record closes Phase 2F implementation validation for the shared native-modal controller,
`wg-dialog`, `wg-media-viewer`, their typed React wrappers, and their production-backed stories. It
does not turn automated accessibility evidence into a screen-reader claim.

## Acceptance result

| Area                    | Evidence                                                                                                                                                        | Result                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Modal ownership         | One shadow-owned native dialog per surface, document-level one-at-a-time coordination, and rejection of competing modal requests                                | Pass                                             |
| Naming and semantics    | Visible headings, native dialog and image semantics, consumer-authored alternative text, captions, content, and actions                                         | Pass                                             |
| Focus and dismissal     | Deterministic initial focus, Tab and Shift+Tab containment, Escape and close-control dismissal, non-dismissing backdrop, and invoker or fallback focus recovery | Pass                                             |
| Media inspection        | Fit, actual size, bounded zoom, native two-axis pan, neutral loading and unavailable states, and media-independent instructions and actions                     | Pass                                             |
| Responsive behavior     | Desktop and 320 CSS-pixel fixtures, 200% text-size containment, usable controls, and intentional internal scrolling without unintended page overflow            | Pass                                             |
| Adaptation              | Dark and light themes, forced colors, reduced motion, contrast-safe entry motion, and token-owned modal presentation                                            | Pass                                             |
| Framework parity        | Framework-neutral Custom Elements and typed React wrappers use the same classes, controller, methods, events, and consumer-owned light DOM                      | Pass                                             |
| Supported browsers      | 24 Phase 2F test definitions in Chromium, Firefox, and WebKit; 72 cases total                                                                                   | Pass                                             |
| Automated accessibility | Role, name, relationship, keyboard, focus, native-semantics, and Axe assertions in all supported engines                                                        | Pass; representative manual gates remain carried |

## Automated record

Phase 2F adds 13 content-dialog and 11 media-viewer definitions. All 72 resulting cases pass across
Chromium, Firefox, and WebKit. The complete repository matrix also passes: 249 definitions per
engine, 747 cases, and 22 browser specification files.

The first complete run passed 746 of 747 cases and exposed a timing-dependent WebKit contrast issue:
Axe could sample a dark-theme dialog during its `opacity: 0` entry keyframe. The shared modal
surfaces now use position-only entry motion, and a regression assertion verifies that the content
dialog surface remains fully opaque. The focused WebKit regression and the subsequent complete
747-case run passed.

Production Storybook review also exposed a multi-token `part` selector error that allowed
ready-state loading and unavailable text to remain visible. The selectors now match individual part
tokens, and the corrected ready, loading, and unavailable states pass in all supported engines.

## Production visual review

The production Storybook dialog and media-inspection stories were reviewed at desktop and 320
CSS-pixel phone widths in the dark theme. Dialog and viewer remain visibly distinct functions; the
viewer stayed contained while moving from fit at 42% to 63% zoom; and closing returned focus to the
inspection trigger without browser errors. Automated fixtures cover the same contracts in dark and
light themes, forced colors, and reduced motion.

Wayglass intentionally does not require one pixel-identical rendering. The review protects semantic
separation, readable hierarchy, focus visibility, responsive containment, loading truth, and media
legibility while preserving substantial brand adaptation.

## Representative assistive-technology procedures

Exercise both a framework-neutral and React entry point with VoiceOver and Safari on macOS, then
with NVDA and Firefox on Windows:

1. Open each surface and verify the dialog announcement, visible name, heading, and useful reading
   order without duplicate or misleading context.
2. Verify browse or virtual-cursor behavior and Tab and Shift+Tab containment, including authored
   links, controls, and long scrolling content.
3. Close with Escape and the visible close control; verify focus returns to the invoker, or to the
   documented fallback when that invoker was removed.
4. Attempt a competing modal request and verify that only one modal is exposed and operable.
5. In the viewer, verify the native image alternative, optional caption and context, scale-control
   names and states, and useful spoken scale readout.
6. At actual size and bounded zoom, verify that keyboard and virtual-cursor users can reach and use
   the native scroll region without losing the close or scale controls.
7. Exercise loading and unavailable transitions and verify that the change is understandable without
   announcing a false condition or hiding independent instructions and actions.

Record the operating system, browser, assistive-technology version, fixture, input method, expected
and observed result, and any corrective pull request in the
[Phase 2 assistive-technology ledger](./phase-2-assistive-technology-gates.md). Both desktop
pairings must pass before a public release containing these components. VoiceOver with iOS Safari
remains a gate before claiming mobile assistive-technology support.

## Reproduce

From a clean checkout with dependencies and Playwright browsers installed:

```bash
pnpm check
pnpm exec playwright test tests/browser/content-dialog.spec.ts tests/browser/media-viewer.spec.ts
pnpm test:browser
```
