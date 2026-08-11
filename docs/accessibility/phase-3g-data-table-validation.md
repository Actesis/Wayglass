# Phase 3G data-table validation

**Status:** Automated cross-browser validation and production Storybook review completed on August
11, 2026. Representative VoiceOver/Safari and NVDA/Firefox reviews remain explicit public-release
gates.

This record closes automated Phase 3G implementation validation for `wg-data-table`, its explicit
native-table stylesheet, and its typed React wrapper. It follows the accepted
[data-table contract](../data/data-table.md),
[ADR 0028](../architecture/adr/0028-native-data-table-and-contained-overflow.md), and the shared
operational-data ownership and Phase 3 validation contracts. Automated accessibility evidence is not
presented as a screen-reader claim.

## Acceptance result

| Area                    | Evidence                                                                                                                                                                                                        | Result                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Native semantics        | One consumer-authored native table remains the sole semantic owner; visible captions, row and column headers, six column groups, and explicit `headers` relationships remain intact                             | Pass                                             |
| Ownership and state     | Applications own records, sorting, actions, state, and mutation; loading, empty, retained refresh, stale, partial, unavailable, failed, and recovered states remain visible context rather than fabricated rows | Pass                                             |
| Sorting and actions     | Authored sorting reorders existing keyed rows, preserves the sort control, and updates `aria-sort`; native row actions and consequential confirmation retain their existing contracts                           | Pass                                             |
| Mutation and focus      | Replacing rows 181–200 retains rows 1–180, the table, the scroll region, and focus on an unaffected action by the next animation frame without wrapper events, live regions, or long tasks                      | Pass                                             |
| Scale and overflow      | A 200-row by 20-column, 4,000-cell envelope remains one native table inside one labeled inline scroll region with no page overflow                                                                              | Pass                                             |
| Responsive behavior     | 320 CSS pixels, 200% text, long dense content, RTL, compact and comfortable density, and representative authored sticky presentation preserve relationships and reachable content                               | Pass                                             |
| Touch and adaptation    | Native actions retain at least 44-by-44 CSS-pixel targets; dark and light themes, forced colors, grayscale, and reduced motion preserve boundaries and visible state                                            | Pass                                             |
| Framework parity        | React explicitly registers and renders the wrapper, preserves native table descendants and slots, forwards native events, and exposes a typed element reference                                                 | Pass                                             |
| Performance             | Chromium warm runs remain within the accepted construction and synchronous-mutation budgets, with no observed long task during the 20-row replacement                                                           | Pass                                             |
| Automated accessibility | Axe scans cover both themes and the wide validation envelope in Chromium, Firefox, and WebKit; the wrapper creates no implicit live region or competing table semantics                                         | Pass; representative manual gates remain carried |

## Production visual review

The production Storybook data-state matrix and 200-by-20 validation envelope were reviewed in the
built Storybook rather than only in test fixtures. Loading, empty, retained refresh, stale, partial,
unavailable, failed, and recovered conditions remain calm, distinct, and attached to the table scope
without becoming data rows or implying state through color alone.

The wide envelope preserves the banded Wayglass surface, grouped column hierarchy, compound cell
content, native actions, and contained horizontal traversal. Initial review exposed awkward mid-word
wrapping in dense header and cell labels. The validation composition now keeps those labels intact
while relying on the named inline scroll boundary, without changing the general table stylesheet or
creating a public no-wrap option.

At narrow width and enlarged text, the page remains contained while the table retains its intrinsic
comparison width. RTL changes logical alignment and scroll origin without reordering columns. Forced
colors, grayscale, and reduced motion retain visible structure and do not introduce a second
semantic representation.

## Automated record

The focused data-table element, production-story, and React-wrapper suites schedule 99 cases across
Chromium, Firefox, and WebKit. All 97 applicable cases pass. The two skips are the expected
non-Chromium instances of the Phase 3G timing-only definition.

The authoritative full browser matrix schedules 1,149 cases across Chromium, Firefox, and WebKit.
All 1,137 applicable cases pass. The twelve skips are the expected non-Chromium instances of the six
timing-only definitions carried by Phase 3 validation envelopes.

The Chromium Phase 3G timing envelope uses three warm-ups and fifteen measured iterations. Its
observed median construction time for the 200-by-20 table was 10.7 milliseconds. Median synchronous
replacement time for rows 181–200 was 1.0 millisecond, and the largest observed synchronous
replacement was 2.3 milliseconds. These measurements are regression evidence, not universal device
guarantees.

The reference environment was the closeout branch based on repository commit `ccff172`, macOS 26.5.2
on arm64, and Playwright 1.62.0 with its bundled Chromium, Firefox, and WebKit. These results are an
engineering regression record for this environment, not a public device or assistive-technology
claim.

## Representative assistive-technology procedures

Exercise the production stories and React fixture with VoiceOver and Safari on macOS, then with NVDA
and Firefox on Windows:

1. Enter the named scroll region and table. Verify the visible caption, region name, six column
   groups, column headers, row headers, compound cell content, and ordinary reading order.
2. Navigate representative cells in the 200-by-20 envelope. Confirm each value is announced with its
   row, group, and column context and no duplicate table or grid owner appears.
3. Activate authored sorting and row actions. Confirm sort direction and next action are clear,
   focus remains on the authored control, and consequential confirmation returns focus correctly.
4. Exercise loading, empty, retained refresh, stale, partial, unavailable, failed, and recovered
   states. Confirm no fabricated row or unsolicited row-by-row announcement appears and retained
   truth remains understandable.
5. Replace rows 181–200 while an action in a retained row owns focus. Confirm retained reading
   position, focus, table identity, scroll-region identity, and quiet programmatic mutation.
6. Traverse the wide table by virtual cursor and through the named horizontal scroll region. Confirm
   controls remain reachable without a custom grid keyboard layer or a second mobile representation.
7. Repeat at 320 CSS pixels, 200% text, RTL, long content, and through the React entry point.
   Confirm equivalent names, relationships, slots, events, focus behavior, and announcement
   ownership.

Record the date, operating system, browser, assistive-technology version, fixture, input method,
expected result, observed result, and corrective pull request. Both desktop pairings must pass
before a public release containing the data table. VoiceOver with iOS Safari remains required before
claiming mobile assistive-technology support.

## Reproduce

```bash
pnpm check
pnpm exec playwright test tests/browser/data-table.spec.ts tests/browser/data-table-stories.spec.ts tests/browser/react-wrappers.spec.ts
pnpm test:browser
```
