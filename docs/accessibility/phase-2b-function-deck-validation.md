# Phase 2B Function Deck validation

Status: complete as of July 29, 2026.

This record closes the Phase 2B validation gate for the production Function Deck composition. It
applies to the shared domain-neutral function model, the overview and focused compositions, the
persistent critical-response path, and the phone, desktop, and wall-display fixtures. The
accessibility target is WCAG 2.2 AA.

## Evidence matrix

| Requirement                          | Evidence                                                                                                                                                      | Result |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Composition ownership                | Browser assertions confirm that `wg-tabs` remains the only selection owner and that no `wg-function-deck` element or selector-like `wg-elbow` layer exists    | Pass   |
| Names, roles, and relationships      | One named tablist, stable peer tab names and summaries, associated tab panels, repeated function headings, and a named critical-response complementary region | Pass   |
| Keyboard selection and focus         | Arrow-key selection keeps tab, panel, heading, live selection text, and focus aligned; Tab enters the selected function panel                                 | Pass   |
| Stable remote updates                | Updating a non-selected function leaves the selected value and focused control unchanged                                                                      | Pass   |
| Per-function context                 | Consumer-owned panel context remains mounted and intact while switching to another function and back                                                          | Pass   |
| Hidden consequential state           | Caution, critical, stale, unavailable, and pending language remains in peer selectors without relying on color or icons                                       | Pass   |
| Critical-response discoverability    | The Processing response remains visible outside the tablist and opens the existing Processing tab without duplicating its control or emitting a tab event     | Pass   |
| Phone composition                    | Selectors retain readable widths in an internally scrolling strip; selected tabs scroll into view; the page has no horizontal overflow                        | Pass   |
| Desktop and wall-display composition | Desktop uses compact semantic displays; wall display uses comfortable density and prominent signals without changing function identity or order               | Pass   |
| Touch targets and reduced motion     | Visible selectors and actions remain at least 44 by 44 CSS pixels; reduced motion removes nonessential tab transition duration                                | Pass   |
| Forced colors                        | Function and panel boundaries, selected focus, explicit state words, and the Axe role graph remain intact                                                     | Pass   |
| Dark and light themes                | Automated Axe checks pass against the complete focused composition in both themes                                                                             | Pass   |
| 200% zoom and reflow                 | At a 320 CSS-pixel viewport, selected functions remain visible inside the tab scroller with no horizontal page overflow                                       | Pass   |
| Supported browser engines            | The complete Playwright suite runs in Chromium, Firefox, and WebKit                                                                                           | Pass   |

## Automated and visual review record

The Function Deck Playwright cases run in Chromium, Firefox, and WebKit. They verify the composition
as a whole rather than duplicating every test of the underlying tabs primitive. The suite covers:

- pointer and keyboard selection through the application-owned function model;
- stable focus during peer-function state updates;
- retained consumer-owned context while switching away from and back to a function;
- persistent hidden-state summaries and the external critical-response path;
- phone tab-strip scrolling, desktop density, wall-display signal prominence, touch targets, and
  200% zoom-equivalent reflow;
- dark and light theme Axe scans, reduced motion, and forced colors.

Visual review of the phone fixture caught a selector-shrinking failure that did not create page
overflow but made labels unreadable. The final composition prevents tabs from shrinking, keeps the
page fixed-width, and scrolls the selector strip internally. Wall-display review confirmed that
prominent signals and comfortable density improve distance legibility without changing semantics or
selection ownership.

Automated role queries and Axe scans are not certification against every assistive-technology
pairing. The accepted Phase 2A tabs record contains the representative VoiceOver review of the
underlying compound tabs interaction. A product integration must repeat screen-reader review with
its final content, navigation shell, and supported browser matrix before public release.

## Reproduce

```bash
pnpm check
pnpm test:browser
```

The browser command builds the packages and executes the full suite in Chromium, Firefox, and
WebKit.
