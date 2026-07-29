# Phase 2C foundation substrate validation

Status: complete as of July 29, 2026.

This record covers the public typography, visually hidden, and focus-ring utilities; `wg-surface`;
`wg-divider`; their tokens and density aliases; typed React wrappers; and production-backed
Storybook stories. The first official icon catalog remains deferred to Phase 2D by the accepted
foundation contract and is outside this validation record.

The accessibility target is WCAG 2.2 AA.

## Evidence matrix

| Requirement                    | Evidence                                                                                                                                          | Result |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Native semantics               | Native heading role and level assertions; utilities add no roles, heading levels, focus stops, or margins                                         | Pass   |
| Typography hierarchy           | Computed title, section, body, metadata, compact-value, and prominent-value treatment; tabular numeric values                                     | Pass   |
| Visually hidden content        | Hidden content remains in the document and accessibility tree; the focus-revealed variant becomes fully visible                                   | Pass   |
| Focus treatment                | Native focus target retains platform behavior and receives a token-backed visible `:focus-visible` outline                                        | Pass   |
| Surface containment            | Panel, inset, and raised tones; subtle, strong, and absent boundaries; compact, comfortable, and absent padding; invalid-value normalization      | Pass   |
| Divider semantics              | Horizontal and vertical separator roles and orientation; decorative mode removes separator semantics; no focus or events                          | Pass   |
| Client-only fallback           | Light-DOM surface content remains visible before upgrade; importing the module does not register the Custom Element                               | Pass   |
| Theme and density              | Dark and light Axe scans; compact and comfortable aliases change measures without changing authored roles                                         | Pass   |
| Forced colors                  | System-color surface and divider boundaries plus visible keyboard focus treatment                                                                 | Pass   |
| Zoom and reflow                | At a 320 CSS-pixel viewport, equivalent to 400% zoom on a 1280-pixel display, content and actions remain visible without horizontal page overflow | Pass   |
| Framework parity               | Side-effect-free vanilla modules and typed React wrappers use the same production element classes                                                 | Pass   |
| Supported browser engines      | The complete 11-case foundation suite runs in Chromium, Firefox, and WebKit                                                                       | Pass   |
| Automated accessibility review | Axe reports no violations for the production fixture in dark and light themes and for the forced-colors fixture in every supported browser engine | Pass   |

## Automated and visual review record

The foundation-specific Playwright matrix executes 33 cases across Chromium, Firefox, and WebKit. It
verifies:

- explicit registration and visible pre-upgrade light-DOM content;
- native heading semantics, typographic hierarchy, and tabular numerals;
- assistive-only content, focus-revealed skip links, and shared keyboard focus treatment;
- surface and divider variants, semantics, normalization, theme, density, and forced colors;
- narrow reflow with no horizontal page overflow;
- Axe-clean accessibility trees in dark, light, and forced-colors presentations.

The complete 276-case browser regression suite also passes across all three engines, covering the
Phase 1 overview, existing structural and semantic components, framework examples, tabs, and
Function Deck.

Visual and computed-style review used the production Storybook bundle. It confirmed a 24-pixel
title, 18-pixel section heading, 16-pixel body, and 32-pixel prominent value in the reference scale.
The light-theme panel, inset, and raised surfaces remain neutral and differ through containment
depth, boundary, and elevation rather than condition color. The standard divider remains a
subordinate one-pixel internal separator.

The utilities and elements add no novel keyboard interaction model. A product integration must still
review final content and surrounding landmarks with its supported assistive-technology pairs before
public release.

## Reproduce

```bash
pnpm check
pnpm exec playwright test tests/browser/foundations.spec.ts
```

The browser command builds the required packages and executes the foundation suite in Chromium,
Firefox, and WebKit.
