# Phase 3B scalar-data validation

**Status:** Automated cross-browser validation and production Storybook review completed on August
8, 2026. Representative VoiceOver/Safari and NVDA/Firefox reviews remain explicit public-release
gates.

This record closes Phase 3B implementation validation for `wg-metric-group`, `wg-trend-indicator`,
`wg-key-value`, the compatible `wg-metric` trend slot, and their typed React wrappers. Automated
accessibility evidence is not presented as a screen-reader claim.

## Acceptance result

| Area                    | Evidence                                                                                                                                                                                                 | Result                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Data truth              | Negative, zero, decimal, large, unitless, mixed-unit, and localized-looking values; absent, rising, falling, steady, mixed, and no-direction comparisons; independent condition, knowledge, and activity | Pass                                             |
| Native semantics        | Named groups, visible headings, native `time`, `code`, and action content, DOM-aligned reading order, and no component-created live region                                                               | Pass                                             |
| Mutation stability      | Twenty-four retained scalar nodes update and reorder by authored DOM identity while a connected action remains focused; readiness returns by the next animation frame                                    | Pass                                             |
| Responsive behavior     | One-column phone, two-column desktop, and three-column wall compositions; the 24-value envelope remains contained at 320 CSS pixels and 200% root text                                                   | Pass                                             |
| Visual adaptation       | Dark and light themes, compact and comfortable density, forced colors, reduced motion, grayscale, non-color direction words, and separate condition text                                                 | Pass                                             |
| Framework parity        | React wrappers render the same production elements, properties, slots, native content, state text, refs, and accessibility semantics                                                                     | Pass                                             |
| Performance envelope    | Fifteen measured Chromium iterations after three warm-ups remain below the 100-millisecond synchronous-task regression threshold                                                                         | Pass                                             |
| Automated accessibility | Axe scans, names, roles, state text, focus continuity, and absence of implicit announcements in Chromium, Firefox, and WebKit                                                                            | Pass; representative manual gates remain carried |

## Production visual review

The shared Storybook and browser fixture was reviewed in dark compact desktop, dark compact phone,
dark comfortable wall, and light compact 24-value compositions. The three metric groups remain
obvious functional sections, their actions stay inside the affected group, and the phone layout
stacks without losing value, unit, comparison, or state text. The wall layout preserves the same
source order across three separated groups.

The direction geometry stays a neutral blue data-change signal for rising, falling, steady, and
mixed movement. Positive, caution, and critical text remains separate, using stoplight condition
roles only when authored. Review removed duplicated condition presentation from trends whose parent
metric already carried the condition. Grayscale and forced-color review retain the visible direction
word and state text when color distinction is unavailable.

The 24-value envelope deliberately prioritizes scanning and wrapping over equal-height rows. Long
references and localized-looking content wrap within their own item without truncation or page
overflow. Wayglass does not require pixel-identical rendering across themes; the review protects
semantic separation, hierarchy, legibility, and containment while allowing brand adaptation.

## Automated and performance record

The focused scalar-data suite has 11 definitions. Ten run in every supported engine; the timing
definition runs only in Chromium as required by ADR 0024. The latest focused run completed 31
functional and performance cases with two intentional non-Chromium timing skips. The five existing
React-wrapper definitions also pass in all three engines with the new scalar composition included.
The authoritative full browser matrix scheduled 792 cases across Chromium, Firefox, and WebKit: all
790 applicable cases passed, with the same two intentional timing skips.

Full-matrix load also exposed three pre-existing test-observation races. The affected confirmation
dialog and media-viewer assertions now await their intentionally queued close events, media-viewer
actual-size coverage awaits the initial fit measurement, and theme-switch accessibility scans await
the tab transitions inside their shadow roots. Repeated cross-browser stress runs passed before the
authoritative matrix was recorded; production component behavior was unchanged.

The reference timing environment was macOS 26.5.2 on arm64 with Playwright 1.62.0 and its bundled
Chromium. The 24-value envelope used three warm-up loads and 15 measured iterations:

| Measurement                              |                   Observed |
| ---------------------------------------- | -------------------------: |
| Median synchronous construction          |                     1.4 ms |
| Median synchronous mutation of 24 values | 0.0 ms at timer resolution |
| Largest observed synchronous mutation    |                     0.1 ms |
| Regression threshold                     |                     100 ms |

These numbers are an engineering regression record for this environment, not a public device SLA.
The automated test enforces the threshold and also verifies next-frame readiness, focus retention,
semantic count, and page containment.

## Representative assistive-technology procedures

Exercise the shared production fixture and the React fixture with VoiceOver and Safari on macOS,
then with NVDA and Firefox on Windows:

1. Enter each metric group and verify its visible name, description, scalar reading order, and lack
   of an aggregate child condition.
2. Read metrics with and without trends; verify value, unit, direction word, comparison, and every
   non-default state without duplicate or fabricated meaning.
3. Read key values containing string, `time`, and `code` content; verify missing and unavailable
   values remain distinguishable.
4. Navigate all 24 values in browse or virtual-cursor mode and confirm source order matches the
   visual order without a second semantic owner.
5. Focus the authored group action while values update and reorder; confirm focus and reading
   context remain stable and no record-by-record speech occurs.
6. Repeat the representative composition through the React entry point and confirm equivalent names,
   roles, values, state, and reading order.

Record the date, operating system, browser, assistive-technology version, fixture, input method,
expected result, observed result, and corrective pull request. Both desktop pairings must pass
before a public release containing these components. VoiceOver with iOS Safari remains required
before claiming mobile assistive-technology support.

## Reproduce

```bash
pnpm check
pnpm exec playwright test tests/browser/scalar-data.spec.ts tests/browser/react-wrappers.spec.ts
pnpm test:browser
```
