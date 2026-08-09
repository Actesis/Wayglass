# Phase 3C telemetry validation

**Status:** Automated cross-browser validation and production Storybook review completed on August
9, 2026. Representative VoiceOver/Safari and NVDA/Firefox reviews remain explicit public-release
gates.

This record closes automated Phase 3C implementation validation for `wg-telemetry-strip` and its
typed React wrapper. It supplements the accepted
[rendering architecture proof](./phase-3c-telemetry-architecture-proof.md); automated accessibility
evidence is not presented as a screen-reader claim.

## Acceptance result

| Area                    | Evidence                                                                                                                                                               | Result                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Data truth              | Steady, changing, sparse, stale, unavailable, and updating histories; explicit null gaps; mixed sample knowledge; independent strip condition, knowledge, and activity | Pass                                             |
| Accessible equivalence  | One named group, visible authored heading, current context, native time labels, summary, and state text; calculated SVG excluded from the accessibility tree           | Pass                                             |
| Mutation stability      | Application-owned array replacement emits no event, creates no live region, and retains focus; malformed input removes only geometry and warns once                    | Pass                                             |
| Responsive behavior     | One-column phone, two-column desktop, and three-column wall compositions; six strips remain contained at 320 CSS pixels and 200% root text                             | Pass                                             |
| Visual adaptation       | Dark and light themes, compact and comfortable density, RTL, forced colors, reduced motion, fixed non-color knowledge patterns, and contrast-safe visible state text   | Pass                                             |
| Framework parity        | React assigns the same property-only sample array, numeric bounds, states, slots, and element ref to the production Custom Element                                     | Pass                                             |
| Load envelope           | One 240-sample irregular strip plus 12 simultaneous 120-sample strips; supplied samples are retained without component downsampling or resize observers                | Pass                                             |
| Automated accessibility | Axe scans, names, roles, readable state, focus continuity, and absence of implicit announcements in Chromium, Firefox, and WebKit                                      | Pass; representative manual gates remain carried |

## Production visual review

The shared Storybook and browser fixture was reviewed in dark compact desktop and light comfortable
phone compositions. Steady, changing, sparse, stale, unavailable, and updating histories remain
visually separated, with the readable current value and summary adjacent to each bounded strip. The
phone composition stacks in source order without horizontal overflow, and the same data geometry
reflows rather than being recalculated according to viewport width.

Review caught and corrected two issues before closeout. Knowledge-color selectors are now scoped to
SVG geometry, so visible state words use the contrast-safe telemetry state token rather than muted
graphic colors. An authored sparse-history summary was also corrected to state the actual count of
five finite observations. Neither correction changes application ownership of state or summary
meaning.

Confirmed series remain a neutral data signal. Inferred, stale, unknown, conflicting, and
unavailable observations use shared knowledge colors only as support; fixed dash patterns, boundary
points, and gap marks preserve distinctions without color. Condition language remains separate and
uses stoplight semantics only when explicitly authored.

## Automated and performance record

The focused Phase 3C matrix schedules 66 cases across Chromium, Firefox, and WebKit. All 64
applicable cases pass; the two non-Chromium instances of the timing-only definition are
intentionally skipped. The authoritative full browser matrix schedules 873 cases: 869 pass and four
timing-only instances are intentionally skipped outside Chromium.

The production timing fixture at commit `7a7b783` uses 12 simultaneous strips with 120 samples each.
The reference environment was macOS 26.5.2 on arm64 with Playwright 1.62.0 and its bundled Chromium.
After three warm-up loads, 15 construction iterations and 15 whole-envelope replacements produced:

| Measurement                                    |                   Observed |
| ---------------------------------------------- | -------------------------: |
| Median synchronous construction                |                     1.2 ms |
| Median synchronous assignment across 12 strips | 0.0 ms at timer resolution |
| Largest observed synchronous assignment        |                     0.1 ms |
| Regression threshold                           |                     100 ms |

An isolated focused run observed a 1.0 ms construction median, 0.1 ms mutation median, and 0.2 ms
largest assignment. The authoritative matrix values above are the recorded closeout result. These
numbers are an engineering regression record for this environment, not a public device SLA. All
three engines also verify next-frame readiness, retained focus, semantic stability, and containment.

## Representative assistive-technology procedures

Exercise the production envelope and React fixture with VoiceOver and Safari on macOS, then with
NVDA and Firefox on Windows:

1. Enter each telemetry group and verify its visible name, current context, logical-start and
   logical-end time labels, summary, and non-default state in source order.
2. Confirm the calculated SVG has no separate image, path, point, or sample announcement and that
   the visible authored summary supplies the meaning needed for the overview task.
3. Compare confirmed, inferred, stale, unavailable, and explicit-gap histories; verify uncertainty
   and absence remain understandable from readable text without relying on color or line pattern.
4. Focus the authored update action and replace its sample array; confirm focus and reading context
   remain stable and no sample-by-sample speech occurs.
5. Navigate the 12-strip load envelope in browse or virtual-cursor mode and confirm one named group
   per strip, stable source order, and no duplicate semantic owner.
6. Repeat the representative composition through the React entry point and confirm equivalent names,
   roles, states, authored content, and lack of implicit announcements.

Record the date, operating system, browser, assistive-technology version, fixture, input method,
expected result, observed result, and corrective pull request. Both desktop pairings must pass
before a public release containing telemetry. VoiceOver with iOS Safari remains required before
claiming mobile assistive-technology support.

## Reproduce

```bash
pnpm check
pnpm exec playwright test tests/browser/telemetry-strip.spec.ts tests/browser/telemetry-data.spec.ts tests/browser/react-wrappers.spec.ts
pnpm test:browser
```
