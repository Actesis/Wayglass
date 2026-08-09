# Phase 3E temporal-collections validation

**Status:** Automated cross-browser validation and production Storybook review completed on August
9, 2026. Representative VoiceOver/Safari and NVDA/Firefox reviews remain explicit public-release
gates.

This record closes automated Phase 3E implementation validation for `wg-timeline`,
`wg-timeline-item`, `wg-event-log`, `wg-event-record`, and their typed React wrappers. It follows
the accepted [temporal-collection contracts](../data/temporal-collections.md),
[ADR 0024](../architecture/adr/0024-operational-data-ownership-and-updates.md), and
[ADR 0026](../architecture/adr/0026-temporal-collection-behavior.md). Automated accessibility
evidence is not presented as a screen-reader claim.

## Acceptance result

| Area                    | Evidence                                                                                                                                                                                                                   | Result                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Data truth              | Milestones, intervals, occurrence and receipt times, repeated summaries, source, category, reference, metadata, details, actions, and every condition, knowledge, and activity value remain independently authored         | Pass                                             |
| Native semantics        | Visibly named ordered collections use quiet list/list-item semantics, native time, details, media, and controls; explicit chronology agrees with authored DOM order and no component creates `role="log"` or a live region | Pass                                             |
| Update ownership        | Unseen summaries and jump actions remain authored status content; ordinary and burst insertion stays quiet and stationary while deliberate announcement and follow-latest policy remain application-owned                  | Pass                                             |
| Mutation stability      | One hundred retained timeline nodes update with insertions at both chronology boundaries; 500 event records accept 50 insertions at and away from the newest boundary without focus, identity, or scroll takeover          | Pass                                             |
| Responsive behavior     | Phone and desktop compositions, compact and comfortable density, 320 CSS pixels, 200% text, long content, RTL, native actions, and no unintended page overflow                                                             | Pass                                             |
| Visual adaptation       | Dark and light themes, forced colors, grayscale, reduced motion, colored condition signals, fixed non-color knowledge boundaries, and persistent visible state words                                                       | Pass                                             |
| Framework parity        | React registers and renders all four production elements with typed properties, authored slots, native details and actions, refs, chronology, list semantics, state axes, and the same quiet update model                  | Pass                                             |
| Performance envelope    | Fifteen Chromium iterations after three warm-ups remain below ADR 0024's 100-millisecond synchronous-task threshold; all engines verify next-frame readiness, stable focus, semantics, and containment                     | Pass                                             |
| Automated accessibility | Axe scans across both themes and the forced-colors narrow state; names, roles, chronology context, reading order, state text, focus continuity, and absence of implicit announcements in Chromium, Firefox, and WebKit     | Pass; representative manual gates remain carried |

## Production visual review

Production Storybook stories were reviewed in dark compact desktop, dark compact phone, and light
comfortable compositions. Timeline and event-log functions remain obviously separate at desktop
widths and stack in source order on phone without losing their individual headings, chronology,
actions, or boundaries. Milestones preserve a narrative sequence while event records retain the
denser field rhythm; neither family is merely a reskin of the other.

Native details, accepted media, record actions, application-authored unseen status, and the explicit
jump action remain visually attached to the function and record they affect. Review exposed an
authored chronology mismatch in the first event-log fixture: a delayed event had been placed out of
descending occurrence order. Correcting the fixture confirmed that the component describes but does
not silently repair application ordering.

The expanded 320-pixel, 200%-text, RTL envelope then exposed a 6-pixel overflow in Chromium and
Firefox. The localized state word “Informational” retained an unbreakable flex-item minimum inside
`wg-event-record`. State labels now participate in the component's existing anywhere-wrap
containment rule. The full word remains visible, and ordinary widths retain the established visual
rhythm.

## Automated and performance record

The focused timeline, event-log, and React-wrapper suites schedule 96 cases across Chromium,
Firefox, and WebKit. All 92 applicable cases pass; the four skips are the expected non-Chromium
instances of the two timing-only definitions.

The authoritative full browser matrix schedules 999 cases across Chromium, Firefox, and WebKit. All
989 applicable cases pass. The ten skips are the expected non-Chromium instances of the Phase 3B,
Phase 3C, Phase 3D, and two Phase 3E timing-only definitions.

The reference timing environment was the closeout branch based on repository commit `c4a1f2d`, macOS
26.5.2 on arm64, and Playwright 1.62.0 with its bundled Chromium. Each envelope used three warm-up
loads and 15 measured construction and mutation iterations:

| Fixture and measurement                                    | Observed |
| ---------------------------------------------------------- | -------: |
| 500-event median synchronous construction                  |   4.8 ms |
| 50-event median synchronous insertion                      |   0.8 ms |
| Largest observed synchronous 50-event insertion            |   2.1 ms |
| 100-item timeline median synchronous construction          |   1.5 ms |
| Timeline median synchronous update and boundary insertions |   0.3 ms |
| Largest observed synchronous timeline mutation             |   0.6 ms |
| Regression threshold                                       | 100.0 ms |

These numbers are an engineering regression record for this environment, not a public device SLA.
The functional envelopes also verify stable focus and node identity, silent ordinary mutation,
correct list semantics, DOM-aligned chronology, and page containment by the next animation frame.

## Representative assistive-technology procedures

Exercise the production envelopes and React fixture with VoiceOver and Safari on macOS, then with
NVDA and Firefox on Windows:

1. Enter each named timeline and event log; verify its visible name, description, list semantics,
   chronology wording, item count, and source-aligned reading order without a live-log announcement.
2. Read milestones, intervals, repeated event summaries, occurrence and receipt times, every state
   axis, source, category, reference, metadata, native details, media, and record actions without
   duplicate or color-dependent meaning.
3. Compare ascending and descending collections and confirm DOM, browse-mode, and visual order agree
   while focus is inside an authored detail or action.
4. Keep focus or reading position on a retained record while timeline items update and event bursts
   arrive at and away from the newest boundary; confirm context remains stationary and no
   record-by-record speech occurs.
5. Exercise the authored unseen summary and jump action. Verify the durable visible outcome and one
   deliberate application-owned announcement when the fixture enables it, with no duplicate
   collection announcement.
6. Navigate the 100-item and 500-record envelopes in browse or virtual-cursor mode and confirm one
   list item per record, stable authored order, and no second semantic owner.
7. Repeat representative timeline and event-log behavior through the React entry point and confirm
   equivalent names, roles, chronology, state, authored content, refs, focus, and quiet updates.

Record the date, operating system, browser, assistive-technology version, fixture, input method,
expected result, observed result, and corrective pull request. Both desktop pairings must pass
before a public release containing temporal collections. VoiceOver with iOS Safari remains required
before claiming mobile assistive-technology support.

## Reproduce

```bash
pnpm check
pnpm exec playwright test tests/browser/timeline.spec.ts tests/browser/event-log.spec.ts tests/browser/react-wrappers.spec.ts
pnpm test:browser
```
