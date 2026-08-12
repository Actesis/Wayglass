# Phase 3H integrated validation

**Status:** Automated cross-browser validation and production Storybook review completed on August
12, 2026. Representative VoiceOver/Safari and NVDA/Firefox reviews remain explicit public-release
gates.

This record closes the automated integration-validation portion of Phase 3H for the Operational
Activity reference workspace, its framework-neutral and React routes, and the complete repository
matrix. It follows the accepted
[Operational Activity integration contract](../data/operational-activity-integration.md),
[ADR 0029](../architecture/adr/0029-operational-activity-reference-integration.md), and the
[Phase 3 validation plan](./phase-3-validation-plan.md). Automated accessibility evidence is not
presented as a screen-reader claim.

## Acceptance result

| Area                    | Evidence                                                                                                                                                                      | Result                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Shared truth            | Scalar, status, temporal, and tabular projections derive from one example-owned state with stable record identifiers                                                          | Pass                                             |
| Composition             | Overview mounts three ordered function regions; focused mode mounts one tabs coordinator, one selected panel, and one persistent consequential response path                  | Pass                                             |
| State coverage          | Loading, retained refresh, stale partial, unavailable, filtered empty, failed request, recovered, and live update remain explicit and retain confirmed truth where applicable | Pass                                             |
| Interaction and focus   | Filters, sorting, function selection, and controlled requests preserve retained nodes, authored focus, confirmed state, and application ownership                             | Pass                                             |
| Announcement ownership  | One application-authored polite region owns deliberate outcomes; ordinary and live-updated records remain quiet                                                               | Pass                                             |
| Responsive behavior     | Phone, desktop, and wall compositions preserve function order, consequential state, touch targets, contained tables, and page containment                                     | Pass                                             |
| Visual adaptation       | Dark and light themes, compact and comfortable density, forced colors, grayscale, reduced motion, RTL, and 200% text retain labeled state and structure                       | Pass                                             |
| Framework parity        | Vanilla and React expose equivalent function, tab, event-record, and table-row semantics while using independent production renderers                                         | Pass                                             |
| Performance             | Integrated construction and synchronous filter mutation remain below the accepted 100-millisecond Chromium regression threshold with no observed qualifying long task         | Pass                                             |
| Automated accessibility | Axe scans pass in the high-risk phone, RTL, forced-color, enlarged-text, and framework routes in Chromium, Firefox, and WebKit                                                | Pass; representative manual gates remain carried |

## Production visual review

The built production Storybook stories were reviewed for the dark desktop overview, light focused
composition, and phone overview. The overview presents Intake, Processing, and Delivery as strong
neutral peer boundaries rather than condition-colored regions. Internal bands organize each function
without making informational content look actionable or healthy.

The focused composition keeps one active function surface while the tab labels retain useful
summaries for hidden functions. The persistent Delivery response remains visible outside the active
Processing panel, repeats its owning function, and provides a direct path to the consequential
state. Condition, knowledge, activity, and trend remain visible in text and geometry rather than
color alone. No corrective production visual change was required by this review.

## Automated record

The focused Operational Activity story suite schedules 30 cases across Chromium, Firefox, and
WebKit. All 28 applicable cases pass; the two skips are the expected non-Chromium instances of the
timing-only definition. The framework routes add equivalent Vanilla and React behavior and parity
coverage.

The authoritative full browser matrix schedules 1,182 cases across Chromium, Firefox, and WebKit.
All 1,168 applicable cases pass. The fourteen skips are the expected non-Chromium instances of the
seven timing-only definitions carried by the validation envelopes.

The first full closeout run exposed one stale Phase 1 test target that still pointed at the Vanilla
example after that route became Operational Activity. The test now exercises the preserved Phase 1
production fixture at its explicit phone composition. Its 15 focused cases pass in all three
engines, and the complete authoritative matrix was rerun successfully after the correction.

The Chromium Phase 3H timing envelope uses three warm-ups and fifteen measured iterations. Its
observed median synchronous construction time was 2.9 milliseconds. Median synchronous filter
mutation was 0.4 milliseconds, and the largest observed synchronous mutation was 0.8 milliseconds.
These values are regression evidence, not universal device guarantees.

The reference environment was the closeout branch based on repository commit `8a7b2a2`, macOS 26.5.2
on arm64, and Playwright 1.62.0 with its bundled Chromium, Firefox, and WebKit.

## Representative assistive-technology procedures

Exercise the production Storybook stories and both framework routes with VoiceOver and Safari on
macOS, then with NVDA and Firefox on Windows:

1. Enter the overview and confirm the page heading, three named function regions, internal heading
   hierarchy, native lists, times, controls, and Delivery table relationships without duplicate
   semantic owners.
2. Enter focused mode and confirm the tablist name, each labeled summary, selected state, active
   panel relationship, and persistent consequential response outside the selected panel.
3. Apply and clear Intake and Delivery filters, change Delivery sort direction, and exercise the
   Processing request lifecycle. Confirm focus stays on the authored control and one durable result
   is announced once.
4. Exercise loading, retained refresh, stale partial, unavailable, filtered empty, failed request,
   recovered, and live-update scenarios. Confirm retained truth, uncertainty, and recovery remain
   understandable without unsolicited record-by-record speech.
5. Repeat representative operations in the Vanilla and React routes. Confirm equivalent names,
   order, events, focus, selected state, table context, and announcement ownership.
6. Repeat at phone width and 200% text, then inspect the wall overview. Confirm function order,
   hidden-state summaries, controls, contained overflow, and reading context remain usable.

Record the date, operating system, browser, assistive-technology version, fixture, input method,
expected result, observed result, and corrective pull request. VoiceOver/Safari and NVDA/Firefox
must both pass before a public release containing the Phase 3 operational components. VoiceOver with
iOS Safari remains required before claiming mobile assistive-technology support.

## Reproduce

```bash
pnpm check
pnpm exec playwright test tests/browser/operational-activity-stories.spec.ts tests/browser/framework-examples.spec.ts
pnpm exec playwright test tests/browser/phase-1-validation.spec.ts
pnpm test:browser
```
