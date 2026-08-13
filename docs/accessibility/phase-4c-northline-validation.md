# Phase 4C Northline Cold Storage validation

**Status:** Automated, production visual, responsive, performance-bound, and supported-browser
validation completed on August 13, 2026. Representative VoiceOver/Safari and NVDA/Firefox reviews
remain explicit public-release gates. VoiceOver with iOS Safari remains required before claiming
mobile assistive-technology support.

This record closes Phase 4C for the Northline Cold Storage operations-console reference application.
It follows the accepted [Phase 4 validation plan](./phase-4-validation-plan.md), the
[reference-application contract](../reference-apps/phase-4-reference-applications.md), and
[ADR 0030](../architecture/adr/0030-isolated-reference-applications.md). Automated accessibility
evidence is not presented as screen-reader validation, and timing results are regression evidence
from the recorded machine rather than universal device guarantees.

## Acceptance result

| Area                    | Evidence                                                                                                                                                                                                                                | Result                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Application truth       | One Northline-owned reducer supplies overview, focused functions, load detail, temporal evidence, the dispatch request lifecycle, and the deterministic maximum fixture                                                                 | Pass                                             |
| State and scenarios     | Shared lifecycle scenarios plus stale trailer, denied hold, failed hold, confirmed hold, recovery, and inserted exception retain confirmed release truth and name uncertainty                                                           | Pass                                             |
| Investigation           | Application-owned filtering, authored sorting, stable row identity, timeline evidence, acknowledgement, route return, and quiet record insertion preserve the operator's context                                                        | Pass                                             |
| Consequential control   | Native confirmation names Dispatch, `NL-2048`, confirmed current state, consequence, and absent release path; pending, denied, failed, and successful outcomes remain distinct with durable recovery                                    | Pass                                             |
| Responsive composition  | Phone, desktop, wall, compact and comfortable densities, both official themes, 200% root text, long content, RTL mechanics, and contained dense data preserve critical state and response                                               | Pass                                             |
| Visual adaptation       | Light branded wall, dark dense Dispatch, forced colors, grayscale, and reduced motion retain function boundaries, state text, table ownership, readable hierarchy, and visible focus                                                    | Pass                                             |
| Maximum fixture         | 80 active loads, exactly 24 key values, eight 120-sample telemetry strips, 100 status entries, 250 retained events, and an 80-row by 12-column table remain deterministic and application-owned                                         | Pass                                             |
| Mutation stability      | Filter and sort, hold lifecycle, 25-event insertion, 20-row replacement, and complete telemetry replacement commit by the next animation frame without moving focus or reading position; quiet operational mutations remain unannounced | Pass                                             |
| Performance             | Fifteen measured Chromium iterations after three warm-ups remain below the accepted 100-millisecond construction, mutation, and application-attributable synchronous-task gates                                                         | Pass                                             |
| Automated accessibility | Representative overview, investigation, consequential, failure, phone, forced-color, maximum-fixture, and supported-browser states pass semantic assertions and Axe scans                                                               | Pass; representative manual gates remain carried |
| Package boundary        | The private app adds no dependency, live service, persistence, deployment, package API, cross-reference-app import, copied component implementation, or private Shadow DOM dependency                                                   | Pass                                             |

## Production visual review

The built Northline application was reviewed on August 13, 2026 in Chromium by the implementing
Codex agent. The light compact maximum-fixture wall overview preserved Northline and place identity,
one dominant outbound-readiness answer, the stale `NL-2048` evidence, the primary Dispatch path, and
four strong neutral function boundaries. Capacity and throughput remained context rather than
release claims, and condition color did not identify functions.

The dark compact maximum Dispatch route kept peer-function summaries, filters, exception ownership,
the 80-row native table, and the path to `NL-2048` visually ordered. The 12-column table stayed in a
labeled inline scroll region rather than producing page overflow. The validation-scale values,
telemetry, 100 status records, and bounded 250-event history remained visibly subordinate evidence
below the primary workflow rather than becoming a second operational dashboard.

The extended matrix checks 320 by 900 phone, 1280 by 800 desktop, 1600 by 1000 wall, 320 CSS pixels
with 200% root text, both themes, both densities, RTL mechanics, forced colors, grayscale, and
reduced motion. The supported-browser run exposed Firefox completing a focus-related page adjustment
when a meaningful update changed nearby content. Northline now restores the application reading
position around the committed update while retaining the same focused keyed row action; Chromium,
Firefox, and WebKit all pass the corrected continuity assertion.

## Automated and performance record

The focused Northline production-build matrix schedules 66 cases across Chromium, Firefox, and
WebKit. All 56 applicable cases pass. The ten skips are the expected non-Chromium Tier B
presentation and timing permutations; primary workflows, failure and recovery, route continuity, the
maximum fixture, mutation stability, automated accessibility, and branded wall containment pass in
all three engines.

The Chromium performance envelope uses three warm-ups and fifteen measured iterations against the
maximum fixture. The authoritative focused run observed:

- median initial construction of 15.8 milliseconds and a largest measured construction of 19.6
  milliseconds;
- median filter-and-sort mutation of 7.9 milliseconds and a largest measurement of 12.9
  milliseconds;
- median hold-lifecycle mutation of 11.7 milliseconds and a largest measurement of 34.3
  milliseconds;
- median 25-event insertion of 13.7 milliseconds and a largest measurement of 18.6 milliseconds;
- median 20-row replacement of 13.2 milliseconds and a largest measurement of 17.2 milliseconds; and
- median eight-strip telemetry replacement of 12.3 milliseconds and a largest measurement of 19.4
  milliseconds.

No observed application-attributable synchronous task reached 100 milliseconds. The reference
environment was the closeout branch based on repository commit `0ef2f67`, macOS 26.5.2 on arm64, an
Apple M4 Mac mini with 16 GB memory, and Playwright 1.62.0 with its bundled Chromium, Firefox, and
WebKit.

The full repository matrix schedules 1,329 cases. The first closeout run completed with 1,294
passes, 34 expected engine-specific skips, and one Chromium Axe harness failure caused by a
destroyed page execution context; that exact case passed immediately in isolation. A subsequent full
rerun became invalid when its preview server stopped responding late in an 11-minute run. Each of
the six affected Firefox and WebKit cases then passed in its original engine, including the
Northline continuity, branded-wall, and maximum-fixture mutation assertions. The focused Northline
matrix above remains the authoritative application result; the repository-wide runs add no
repeatable product failure.

## Representative assistive-technology procedures

Exercise the built application with VoiceOver and Safari on macOS, then with NVDA and Firefox on
Windows:

1. Enter the overview and identify Northline Cold Storage, the current place, outbound-readiness
   answer, four function regions, stale `NL-2048` evidence, and next available Dispatch path.
2. Navigate the operational-function selectors and confirm current-page state and hidden peer
   summaries without duplicate semantic owners; verify the Dispatch consequence remains reachable
   while Receiving is active.
3. Filter and sort outbound loads, inspect the 12-column table through its labeled scroll region,
   enter `NL-2048`, inspect the evidence timeline, and return without losing filter or sort context.
4. Acknowledge the investigation and confirm the action records ownership without claiming fresh
   evidence or changing the confirmed release state.
5. Open the dispatch-hold confirmation, review the named function, load, current state, consequence,
   and absent release path, cancel once, confirm, and inspect pending plus denied or failed outcomes
   without hearing false success.
6. Receive one deliberate final result announcement and find the same durable visible result; then
   insert a meaningful exception while reading older content and confirm there is no forced speech,
   focus movement, scroll movement, or follow-latest behavior.
7. Recover trailer-temperature evidence and verify current knowledge without erasing relevant
   history. Repeat representative work at phone width and 200% text, then inspect the branded wall
   overview for priority, reading order, target size, and containment.

Each result must name date, operating system, browser, assistive-technology version, app commit,
route, scenario, input method, expected result, observed result, and corrective pull request.
VoiceOver/Safari and NVDA/Firefox must both pass before a public release containing the affected
Northline workflows. VoiceOver with iOS Safari remains required before claiming mobile
assistive-technology support.

## Boundary audit

- `@wayglass/example-operations-console` remains private and imports no reference application.
- Production packages import nothing from `examples/` and expose no Northline record, route,
  fixture, adapter, command, scenario, or validation API.
- The maximum fixture and app-local measurement hooks remain Northline-owned and are enabled only by
  the application route query used for validation; they expose no package surface.
- The app consumes typed production React wrappers and the accepted public native-table stylesheet;
  it does not copy components or reach into private Shadow DOM.
- Dense-table containment and responsive composition use existing tokens plus the already documented
  private breakpoint constants.
- No package publication, public deployment, credentials, analytics, persistence, network request,
  or new dependency entered Phase 4C.

## Reproduce

```bash
pnpm check
pnpm exec playwright test tests/browser/northline-composition.spec.ts tests/browser/northline-validation.spec.ts
pnpm test:browser
```
