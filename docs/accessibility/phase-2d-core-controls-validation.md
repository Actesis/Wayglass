# Phase 2D-B core-controls validation

Status: automated and visual validation complete as of July 31, 2026; representative screen-reader
acceptance remains open.

This record covers `wg-icon-button`, `wg-toggle`, `wg-segmented-control`, `wg-segment`,
`wg-navigation-rail`, the first domain-neutral `@wayglass/icons` catalog, their tokens and density
aliases, typed React wrappers, and production-backed Storybook stories. The accessibility target is
WCAG 2.2 AA.

## Evidence matrix

| Requirement                     | Evidence                                                                                                                                                          | Result  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Command semantics               | Required icon-button name, internal native button activation, explicit registration, 44-pixel target, disabled and pending suppression, and focus retention       | Pass    |
| Confirmed operational truth     | Switch checkedness remains confirmed while pointer, keyboard, pending, rejected, retry, unavailable, and remote property behavior stay separate                   | Pass    |
| Local selection                 | Named radio group, one checked radio, roving tab stop, wrapping arrows, Home/End/Space, disabled skipping, RTL mapping, silent programmatic updates, and mutation | Pass    |
| Native navigation               | Consumer-authored named `nav`, native links, `aria-current`, ordinary source-order focus, hash navigation, and no rail widget role or captured arrow keys         | Pass    |
| State without hue or icons      | Toggle rail and text, selected-segment surface and band, current-link surface and band, disabled treatment, and visible labels remain redundant                   | Pass    |
| Theme and density               | Dark and light automated Axe scans; compact and comfortable token aliases; neutral selection treatment                                                            | Pass    |
| Forced colors and motion        | System-color boundaries, value and selection signals, visible focus, Axe-clean forced-colors fixture, and no required motion                                      | Pass    |
| Reflow                          | At a 320 CSS-pixel viewport, equivalent to 400% zoom on a 1280-pixel display, controls and destinations remain visible without horizontal page overflow           | Pass    |
| Framework parity                | Side-effect-free element and icon modules plus typed React properties and custom-event callbacks use the same production classes                                  | Pass    |
| Supported browser engines       | The complete 11-case control suite runs in Chromium, Firefox, and WebKit                                                                                          | Pass    |
| Automated accessibility review  | Axe reports no violations in dark, light, and forced-colors fixtures across supported engines                                                                     | Pass    |
| Representative assistive review | VoiceOver with Safari review of the internal switch and custom radio hosts                                                                                        | Pending |

## Automated and visual review record

The control-specific Playwright matrix executes 33 cases across Chromium, Firefox, and WebKit. The
complete 396-case browser regression suite also passes across all three engines. `pnpm check` passes
formatting, linting, type checks, unit tests, documentation, examples, Storybook, and package
builds.

Visual review used the production Storybook story in dark and light themes. It confirmed three
distinct functional panels; an icon-free lit or unlit operational signal with confirmed text;
neutral local selection reinforced by surface and a bottom band; quiet compact commands; and a
destination rail that remains visually distinct from operational state.

Browser role queries and Axe inspect the platform accessibility representation, but they do not
prove the spoken interaction of the internal switch or custom radio hosts. Phase 2D-B therefore
remains short of final validation until the following representative VoiceOver and Safari review is
recorded:

1. Tab to Email notifications and confirm that its stable name, switch role, and confirmed On value
   are announced.
2. Activate it and confirm that the application-facing request does not cause VoiceOver to announce
   Off before confirmed state changes.
3. Tab to the Display density group and confirm Compact is announced as a selected radio within a
   named group.
4. Use Right Arrow to select Comfortable, then Right Arrow again to confirm disabled Spacious is
   skipped and selection wraps to Compact.
5. Continue with Tab and confirm focus enters the Account navigation links in source order without
   the rail being announced as a second composite widget.

NVDA with Firefox on Windows remains required before a public release. VoiceOver with iOS Safari is
recommended before claiming mobile assistive-technology support.

## Reproduce automated checks

```bash
pnpm check
pnpm exec playwright test tests/browser/core-controls.spec.ts
pnpm test:browser
```
