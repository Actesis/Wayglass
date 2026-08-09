# Phase 3F filter-and-command validation

**Status:** Automated cross-browser validation and production Storybook review completed on August
9, 2026. Representative VoiceOver/Safari and NVDA/Firefox reviews remain explicit public-release
gates.

This record closes automated Phase 3F implementation validation for `wg-filter-bar`,
`wg-command-bar`, and their typed React wrappers. It follows the accepted
[filter and command pattern contracts](../data/filter-and-command-patterns.md),
[ADR 0027](../architecture/adr/0027-filter-and-command-composition.md), and the existing native
form, menu, confirmation, feedback, and temporal-collection contracts. Automated accessibility
evidence is not presented as a screen-reader claim.

## Acceptance result

| Area                    | Evidence                                                                                                                                                                                                                      | Result                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Native ownership        | Exactly one consumer-authored native form retains validation, successful-control data, submitter identity, submission, and reset; existing buttons and flat menus retain their native and typed command events                | Pass                                             |
| State and feedback      | Draft and applied filters remain distinct; pending work retains confirmed results; no-match, rejection, retry, and unavailability remain durable application-authored context outside transient controls                      | Pass                                             |
| Command composition     | Primary, secondary, and explicitly authored overflow commands retain stable identity and priority; ordinary Tab order and the accepted flat-menu keyboard model operate without toolbar semantics or aggregate command events | Pass                                             |
| Focus and announcements | Submission, reset, result updates, pending commands, and responsive changes preserve authored focus; one deliberate result live region remains the only result announcement owner                                             | Pass                                             |
| Responsive behavior     | Desktop, phone, and wall compositions; compact and comfortable density; 320 CSS pixels, 200% text, long localized-looking content, RTL, and no unintended page overflow                                                       | Pass                                             |
| Touch and adaptation    | Form actions, native select, primary and secondary commands, and overflow trigger retain at least 44-by-44 CSS-pixel targets; dark and light themes, forced colors, grayscale, and reduced motion retain visible structure    | Pass                                             |
| Framework parity        | React explicitly registers and renders both bars, preserves slots and typed element refs, forwards native form and command events, and composes the accepted consequential-confirmation path                                  | Pass                                             |
| Resilient delivery      | Side-effect-free imports, useful fallback content, explicit registration, public API behavior, and one stable diagnostic for unsupported anatomy pass in every supported engine                                               | Pass                                             |
| Automated accessibility | Axe scans cover both themes and the combined forced-colors, reduced-motion, grayscale, narrow, enlarged-text, and RTL envelope in Chromium, Firefox, and WebKit                                                               | Pass; representative manual gates remain carried |

## Production visual review

Production Storybook compositions were reviewed in dark compact desktop, light comfortable desktop,
dark compact phone, light comfortable RTL phone, wall-panel, pending/failure/recovery, and no-match
states. Filter controls, commands, and results remain three visibly distinct functional areas. The
result collection stays outside the filter surface, and command status stays attached to the command
surface rather than a dismissed menu.

At phone width, controls stack in source order without migrating or duplicating commands. The
primary response, secondary response, and explicit overflow trigger all remain visible, while long
headings, descriptions, applied values, and record content wrap inside the composition. The
320-CSS-pixel automated viewport reports no page overflow in all three engines. RTL changes logical
alignment without changing filter sequence or command priority.

Pending filter and command language continues to describe retained confirmed truth. Rejected and
unavailable commands identify what remains true and expose a visible recovery path or reason. Dark
and light treatments preserve the banded Wayglass function separation without turning the bars into
a generic toolbar or making color the sole source of meaning.

## Automated record

The focused `composition-bars`, production `composition-stories`, and React-wrapper suites schedule
81 cases across Chromium, Firefox, and WebKit. All 81 pass. The production suite verifies native
constraint validation, application-owned draft and applied state, stable record and command nodes,
focus retention, ordinary Tab and menu keyboard behavior, explicit overflow, durable status,
touch-target geometry, responsive containment, adaptive media, and Axe results.

The authoritative full browser matrix schedules 1,065 cases across Chromium, Firefox, and WebKit.
All 1,055 applicable cases pass. The ten skips are the expected non-Chromium instances of the five
timing-only definitions carried by earlier Phase 3 validation envelopes.

The reference environment was the closeout branch based on repository commit `f4930d4`, macOS 26.5.2
on arm64, and Playwright 1.62.0 with its bundled Chromium, Firefox, and WebKit. These results are an
engineering regression record for this environment, not a public device or assistive-technology
claim.

## Representative assistive-technology procedures

Exercise the production compositions and React fixture with VoiceOver and Safari on macOS, then with
NVDA and Firefox on Windows:

1. Enter the named filter and command regions and the separately named result collection. Verify
   visible names, descriptions, native fieldset and form relationships, ordinary reading order, and
   the absence of toolbar semantics.
2. Edit several filter controls, submit with different submitters, and reset the draft. Confirm the
   applied summary describes committed state, native validation remains understandable, and focus
   stays on the authored control or submitter.
3. Apply and clear filters while reading a retained event record. Confirm stable result identity,
   one deliberate result-context announcement, and no record-by-record or duplicate announcement.
4. Navigate primary, secondary, and overflow commands with Tab, Shift+Tab, and the accepted flat
   menu keys. Confirm source-aligned priority, menu focus return, disabled discovery, and no second
   arrow-key layer on the command bar.
5. Exercise pending, rejected, unavailable, retry, and consequential-confirmation paths. Confirm
   retained truth, target scope, recovery, and command outcome remain durable and function-local.
6. Repeat the phone, 200%-text, RTL, long-content, and comfortable-density compositions. Confirm
   controls remain discoverable, labels are complete, and no horizontal traversal is required.
7. Repeat the representative behavior through the React entry point and confirm equivalent names,
   roles, slots, native events, typed command events, refs, focus, and announcement ownership.

Record the date, operating system, browser, assistive-technology version, fixture, input method,
expected result, observed result, and corrective pull request. Both desktop pairings must pass
before a public release containing filter and command bars. VoiceOver with iOS Safari remains
required before claiming mobile assistive-technology support.

## Reproduce

```bash
pnpm check
pnpm exec playwright test tests/browser/composition-bars.spec.ts tests/browser/composition-stories.spec.ts tests/browser/react-wrappers.spec.ts
pnpm test:browser
```
