# Phase 3D status-list validation

**Status:** Automated cross-browser validation and production Storybook review completed on August
9, 2026. Representative VoiceOver/Safari and NVDA/Firefox reviews remain explicit public-release
gates.

This record closes automated Phase 3D implementation validation for `wg-status-list`,
`wg-status-entry`, and their typed React wrappers. It follows the accepted
[status-list contracts](../data/status-list.md) and
[ADR 0024](../architecture/adr/0024-operational-data-ownership-and-updates.md). Automated
accessibility evidence is not presented as a screen-reader claim.

## Acceptance result

| Area                    | Evidence                                                                                                                                                                                                           | Result                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| Data truth              | Every condition and knowledge value, pending activity, scalar and Boolean values, native time, metadata, actions, and entries without optional content; each state axis remains independently authored             | Pass                                             |
| Native semantics        | Named native lists and list items, visible headings, authored descriptions and feedback, native controls and time, stable DOM reading order, and no component-created live region                                  | Pass                                             |
| Collection feedback     | Initial loading, filtered-empty, partial, offline retained results, unavailable failure, and refresh-with-retained-content remain application-authored rather than inferred from child count                       | Pass                                             |
| Mutation stability      | One hundred retained nodes update and reorder; insertion before and after focus, moving the same node between lists, and application focus recovery before removal preserve required identity and focus guarantees | Pass                                             |
| Responsive behavior     | Phone, desktop, and wall compositions; compact and comfortable density; 320 CSS pixels, 200% text, long and localized-looking content, RTL, touch-sized production actions, and no unintended page overflow        | Pass                                             |
| Visual adaptation       | Dark and light themes, forced colors, grayscale, reduced motion, colored condition signals, fixed non-color knowledge boundaries, and contrast-safe visible state words                                            | Pass                                             |
| Framework parity        | React registers and renders the same production elements, typed state properties, slots, authored controls, refs, list semantics, and busy state                                                                   | Pass                                             |
| Performance envelope    | Fifteen Chromium iterations after three warm-ups remain below ADR 0024's 100-millisecond synchronous-task threshold; all engines verify next-frame readiness, focus retention, semantics, and containment          | Pass                                             |
| Automated accessibility | Axe scans across both themes and the forced-colors narrow state; names, roles, reading order, state text, focus continuity, and absence of implicit announcements in Chromium, Firefox, and WebKit                 | Pass; representative manual gates remain carried |

## Production visual review

The production Storybook stories were reviewed in dark compact desktop, light comfortable desktop,
dark compact phone, dark comfortable wall, feedback-state, and 100-entry reference-envelope
compositions. The desktop and wall layouts preserve three obvious function boundaries while each
list keeps its actions within the function they affect. Phone presents the same functions in one
source-ordered column without horizontal overflow; its smallest authored `wg-button` action measured
45.2 CSS pixels high.

Loading, filtered-empty, offline-retained, and ordinary populated collections remain visually and
semantically distinct without making every collection an operational warning. The 100-entry story
retains stable authored order, ten distributed actions, long and localized-looking values, and no
page overflow.

Review and the expanded Axe envelope exposed a contrast defect that smaller fixtures had not shown.
Informational, knowledge, and pending words used graphic-support colors directly against the inset
entry surface, producing ratios as low as 4.01:1 in the light theme and 4.24:1 in the dark theme.
Status words now use the contrast-safe status-entry text token while the compact condition signal,
pending emphasis, readable labels, and fixed knowledge border patterns preserve glanceable state.
The correction follows the Phase 3C precedent: semantic graphic color supports meaning but does not
become low-contrast body text.

## Automated and performance record

The focused status-list suite has 15 definitions. Fourteen run in every supported engine; the timing
definition runs only in Chromium. It schedules 45 cases: all 43 applicable cases pass, with two
intentional non-Chromium timing skips. The five React-wrapper definitions also pass in all three
engines, producing a combined focused result of 58 passes and two intentional skips across 60
scheduled cases.

The authoritative full browser matrix schedules 918 cases across Chromium, Firefox, and WebKit. All
912 applicable cases pass. The six skips are the expected non-Chromium instances of the Phase 3B,
Phase 3C, and Phase 3D timing-only definitions.

The reference timing environment was the closeout branch based on repository commit `3f9e92a`, macOS
26.5.2 on arm64, and Playwright 1.62.0 with its bundled Chromium. The 100-entry envelope used three
warm-up loads and 15 measured construction and whole-envelope mutation iterations:

| Measurement                                          | Observed |
| ---------------------------------------------------- | -------: |
| Median synchronous construction                      |   1.3 ms |
| Median synchronous mutation of 100 entries           |   0.3 ms |
| Largest observed synchronous whole-envelope mutation |   0.5 ms |
| Regression threshold                                 | 100.0 ms |

These numbers are an engineering regression record for this environment, not a public device SLA.
The functional envelope also verifies no component-attributable long task at or above the threshold,
stable focus and node identity, silent ordinary mutation, correct list semantics, and page
containment by the next animation frame.

## Representative assistive-technology procedures

Exercise the production envelope and React fixture with VoiceOver and Safari on macOS, then with
NVDA and Firefox on Windows:

1. Enter each named collection and verify its visible name, description, list semantics, entry
   count, and source-aligned reading order.
2. Read entries covering every condition, knowledge, and activity combination; verify subject, state
   words, description, value, time, metadata, and action without duplicate or icon-dependent
   meaning.
3. Compare loading, filtered-empty, partial, offline-retained, unavailable, and ordinary populated
   collections; verify each context is understandable without a fabricated item or unsolicited
   announcement.
4. Focus an authored action while entries update, reorder, and arrive before or after it; confirm
   focus and reading context remain stable and no record-by-record speech occurs.
5. Move one retained entry between named lists, then exercise application-directed focus recovery
   before removing a focused entry; verify identity, destination context, and recovery target.
6. Navigate the 100-entry envelope in browse or virtual-cursor mode and confirm one list item per
   record, stable authored order, and no second semantic owner.
7. Repeat the representative composition through the React entry point and confirm equivalent names,
   roles, state, authored controls, focus, and lack of implicit announcements.

Record the date, operating system, browser, assistive-technology version, fixture, input method,
expected result, observed result, and corrective pull request. Both desktop pairings must pass
before a public release containing status lists. VoiceOver with iOS Safari remains required before
claiming mobile assistive-technology support.

## Reproduce

```bash
pnpm check
pnpm exec playwright test tests/browser/status-list.spec.ts tests/browser/react-wrappers.spec.ts
pnpm test:browser
```
