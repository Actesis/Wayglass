# Phase 2D-C menu and command validation

Status: automated and visual validation complete as of July 31, 2026; representative screen-reader
acceptance remains open.

This record covers `wg-menu`, `wg-command-item`, their logical placement and client-only fallback,
tokens, typed React wrappers, and production-backed Storybook stories. The accessibility target is
WCAG 2.2 AA.

## Evidence matrix

| Requirement                     | Evidence                                                                                                                                          | Result  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Menu-button semantics           | Internal named native button, `aria-haspopup="menu"`, synchronized expanded state, internal named relationship, and one popup menu                | Pass    |
| Focus entry                     | Pointer, Enter, Space, Arrow Down, Arrow Up, and programmatic first, last, or no-focus entry                                                      | Pass    |
| Composite keyboard model        | Wrapping arrows, Home, End, buffered typeahead, composition guards, and disabled-item discovery                                                   | Pass    |
| Command intent                  | Stable values, keyboard, pointer, and programmatic provenance, disabled suppression, one bubbling composed event, and no persistent command state | Pass    |
| Dismissal and focus             | Escape, activation, trigger, Tab, outside pointer, explicit API, empty-menu, and mutation paths with reason-specific focus behavior               | Pass    |
| Popup delivery                  | Native auto Popover path plus scoped client-only fallback without registration side effects                                                       | Pass    |
| Logical placement               | Four logical preferences, CSS anchor collision fallbacks, private geometry fallback, viewport inset, and internal scrolling                       | Pass    |
| State without hue or icons      | Visible command labels, neutral raised surface, boundary, focus outline, disabled text, and optional reinforcing trigger icon                     | Pass    |
| Theme and density               | Dark and light visual review; compact and comfortable menu spacing aliases; minimum 44-pixel targets                                              | Pass    |
| Forced colors and motion        | System-color boundaries and focus, Axe-clean forced-colors fixture, and no required motion                                                        | Pass    |
| Reflow                          | Popup remains within a 320 CSS-pixel viewport without horizontal page overflow                                                                    | Pass    |
| Framework parity                | Side-effect-free element modules and typed React properties, refs, methods, and custom-event callbacks use the production classes                 | Pass    |
| Supported browser engines       | The menu-specific suite passes in Chromium, Firefox, and WebKit                                                                                   | Pass    |
| Automated accessibility review  | Axe reports no violations in open dark, light, and forced-colors fixtures across supported engines                                                | Pass    |
| Representative assistive review | VoiceOver with Safari review of the internal menu button, slotted custom menu items, disabled discovery, and focus return                         | Pending |

## Automated and visual review record

The menu-specific Playwright matrix covers import behavior, native and fallback popup paths,
semantics, target size, focus entry, keyboard movement, buffered typeahead, disabled discovery,
command provenance, all dismissal routes, programmatic control, mutation recovery, dark and light
Axe scans, forced colors, reduced motion, and narrow-viewport containment in Chromium, Firefox, and
WebKit. All 42 menu-specific cases passed on July 31, 2026. The complete repository browser matrix
also passed all 438 cases across those engines, and `pnpm check` passed formatting, linting,
type-checking, unit tests, and production builds.

Visual review used the production Storybook stories in dark and light themes. It confirmed that the
menu remains a neutral raised command surface, does not resemble operational condition or function
selection, preserves visible primary actions, gives keyboard focus a redundant high-contrast
boundary, and keeps the compact icon trigger subordinate to its labeled function context.

Browser role queries and Axe inspect the platform accessibility representation, but they do not
prove spoken interaction across the internal menu container and slotted custom menu-item hosts.
Phase 2D-C therefore remains short of final validation until the following representative VoiceOver
and Safari review is recorded:

1. Tab to Report actions and confirm its stable name, menu-button role, collapsed state, and popup
   availability are announced.
2. Press Control-Option-Space or Enter and confirm the menu opens, expanded state is announced, and
   focus enters Refresh report.
3. Use arrows, Home, End, and typeahead; confirm each item and its position are understandable and
   disabled Archive report remains discoverable but cannot activate.
4. Activate Copy report identifier and confirm one command occurs, the menu closes, and focus
   returns to Report actions.
5. Reopen, press Escape, and confirm closure and focus return; reopen and press Tab, confirming
   focus continues to the following control without a trap.

NVDA with Firefox on Windows remains required before a public release. VoiceOver with iOS Safari is
recommended before claiming mobile assistive-technology support.

## Reproduce automated checks

```bash
pnpm check
pnpm exec playwright test tests/browser/menu-commands.spec.ts
pnpm test:browser
```
