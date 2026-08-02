# Phase 2E-B persistent-feedback validation

**Status:** Automated cross-browser and visual review complete on August 2, 2026. Representative
assistive-technology review remains open for Phase 2 closeout.

This record covers `wg-badge`, `wg-alert`, `wg-progress`, `wg-skeleton`, `wg-empty-state`,
`wg-offline-state`, and `wg-stale-data-marker`, their locked tokens, typed React wrappers, and
production-backed Storybook compositions.

## Acceptance matrix

| Area                            | Evidence                                                                                                                                                     | Status  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| Fallback and ownership          | Side-effect-free modules retain useful light-DOM content; applications continue to own condition, activity, knowledge, availability, and timing              | Pass    |
| Persistent semantics            | Passive feedback adds no focus stop or implicit live role; explicit alert announcements scope the live node to message content and exclude actions           | Pass    |
| Labels and relationships        | Native progress retains its accessible name and value; stale context remains an explicit description of its related value                                    | Pass    |
| Loading and replacement         | Native determinate and indeterminate progress remain intact; skeleton visuals are hidden from assistive technology while adjacent loading text stays visible | Pass    |
| State separation                | Condition, activity, stale knowledge, bounded absence, and offline availability remain visually and semantically independent                                 | Pass    |
| State normalization             | Invalid closed-vocabulary values normalize safely; skeleton line count is bounded from one through eight                                                     | Pass    |
| Color independence              | Visible text carries meaning; caution, stale knowledge, positive outcome, and striped offline availability have redundant treatments                         | Pass    |
| Motion and forced colors        | Reduced motion suppresses skeleton animation; boundaries and meaning survive forced-color substitution                                                       | Pass    |
| Reflow                          | The complete fixture remains within a 320 CSS-pixel viewport without horizontal page overflow                                                                | Pass    |
| React parity                    | Typed wrappers use the production element classes and preserve component properties, methods, refs, and authored children                                    | Pass    |
| Supported engines               | All 36 focused cases pass in Chromium, Firefox, and WebKit                                                                                                   | Pass    |
| Automated accessibility         | Axe reports no violations in dark, light, and forced-colors fixtures across supported engines                                                                | Pass    |
| Representative assistive review | VoiceOver/Safari and NVDA/Firefox reading order, announcement scope, progress changes, stale descriptions, and retained context                              | Pending |

## Automated review record

The focused Playwright matrix covers import behavior, useful fallback content, focus and live-role
restraint, opt-in alert announcements, closed-vocabulary normalization, native progress semantics,
invalid progress anatomy, skeleton semantics and bounds, stale/offline separation, dark and light
Axe scans, forced colors, reduced motion, and narrow reflow. All 36 focused cases passed across
Chromium, Firefox, and WebKit on August 2, 2026.

The complete repository browser matrix also passed all 558 cases across those engines.

The first focused run found two presentation defects. Valid `wg-skeleton` line counts were returning
before Lit's update path, leaving one visual line instead of the authored count. The stale-data
marker also shared the caution marker color, conflating degraded knowledge with a warning condition.
The accepted corrections preserve normalized line updates and map stale knowledge to the neutral
confirmed-knowledge token. The focused and complete matrices passed after both corrections.

## Visual review record

The production Storybook composition was reviewed in dark and light desktop contexts and at a 390px
phone width. Persistent outcome, active progress and freshness, bounded absence, and scoped offline
availability remain clearly separated without making every panel resemble an alarm. Positive outcome
uses a green band, caution uses an amber marker, stale knowledge uses a neutral marker, and offline
availability uses a striped marker with explicit text.

The compact phone composition stacked the four function panels without horizontal overflow. Text,
actions, progress, stale context, skeleton lines, and feedback bands remained contained in their
owning panels, and the browser console reported no errors.

## Open representative review

Accessibility-tree queries and Axe do not prove spoken timing, announcement interruption, or
virtual-cursor context. Before Phase 2 closeout, complete representative VoiceOver with Safari and
NVDA with Firefox review for:

1. reading order and retained surrounding context for badge, alert, empty, offline, and stale
   states;
2. determinate-to-indeterminate and loading-to-content transitions without duplicate output;
3. polite and assertive alert announcement scope, confirming slotted actions are not repeated; and
4. the stale marker's explicit description of its related value without condition-language leakage.

## Reproduce automated checks

```bash
pnpm check
pnpm exec playwright test tests/browser/persistent-feedback.spec.ts
pnpm test:browser
```
