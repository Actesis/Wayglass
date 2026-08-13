# Phase 4B Cedar House validation

**Status:** Automated, production visual, responsive, performance-bound, and supported-browser
validation completed on August 12, 2026. Representative VoiceOver/Safari and NVDA/Firefox reviews
remain explicit public-release gates. VoiceOver with iOS Safari remains required before claiming
mobile assistive-technology support.

This record closes Phase 4B for the Cedar House smart-home reference application. It follows the
accepted [Phase 4 validation plan](./phase-4-validation-plan.md), the
[reference-application contract](../reference-apps/phase-4-reference-applications.md), and
[ADR 0030](../architecture/adr/0030-isolated-reference-applications.md). Automated accessibility
evidence is not presented as screen-reader validation, and timing results are regression evidence
from the recorded machine rather than universal device guarantees.

## Acceptance result

| Area                    | Evidence                                                                                                                                                                                                        | Result                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Application truth       | One Cedar-owned reducer supplies overview, focused functions, controls, asset media, maintenance history, and the deterministic maximum fixture                                                                 | Pass                                             |
| State and scenarios     | Shared lifecycle scenarios plus partial security, failed lighting, maintenance due, media loading, and media unavailable retain confirmed truth and name uncertainty                                            | Pass                                             |
| Controls and feedback   | Routine lighting and consequential secure-house workflows separate requested and confirmed values, preserve per-target outcomes, restore focus, and provide one durable result and announcement owner           | Pass                                             |
| Asset media             | Useful native alternative text, visible identification, stable loading/unavailable media, focused inspection, focus return, written instructions, and resident-only maintenance evidence remain explicit        | Pass                                             |
| Responsive composition  | Phone, desktop, wall, compact and comfortable densities, both official themes, 200% root text, long content, and RTL mechanics remain contained and preserve critical state and response                        | Pass                                             |
| Visual adaptation       | Light branded wall, dark desktop, forced colors, grayscale, and reduced motion retain functional boundaries, non-color value and condition meaning, readable hierarchy, and visible focus                       | Pass                                             |
| Maximum fixture         | 40 devices and assets, exactly 24 simultaneous scalar or Boolean values, six 120-sample telemetry strips, and 60 maintenance records remain deterministic and application-owned                                 | Pass                                             |
| Mutation stability      | Confirmed control, failed control, partial secure-house, and complete telemetry replacement commit by the next animation frame without moving authored focus; routine telemetry replacement remains unannounced | Pass                                             |
| Performance             | Fifteen measured Chromium iterations after three warm-ups remain below the accepted 100-millisecond construction, mutation, and application-attributable synchronous-task gates                                 | Pass                                             |
| Automated accessibility | Representative steady, consequential, media, phone, forced-color, and maximum-fixture states pass role assertions and Axe scans across the accepted tier matrix                                                 | Pass; representative manual gates remain carried |
| Package boundary        | The private app adds no dependency, live service, persistence, deployment, package API, cross-reference-app import, copied component implementation, or private Shadow DOM dependency                           | Pass                                             |

## Production visual review

The built Cedar House application was reviewed on August 12, 2026 in Chromium by the implementing
Codex agent. The light compact `secure-partial` maximum-fixture overview preserved Cedar House and
place identity, the garage-door exception, filter-maintenance attention, five strong neutral
function boundaries, and the Secure Cedar House response without using condition color to identify
functions. The deterministic inventory, Boolean-value matrix, and telemetry region remained a
visibly subordinate validation surface rather than competing with household priorities.

The dark ready HVAC asset route, focused full-size viewer, and light compact unavailable-media route
were also reviewed in the production application. The image remained identifying rather than
decorative, written equipment facts and instructions stayed outside it, and the unavailable state
kept the complete maintenance workflow usable. A visual review exposed and corrected multipart
`part` selector matching in `wg-media`; the fallback now stays centered inside its reserved frame.

The extended matrix checks 320 by 900 phone, 1280 by 800 desktop, 1600 by 1000 wall, 320 CSS pixels
with 200% root text, both themes, both densities, RTL mechanics, forced colors, grayscale, and
reduced motion. The first 200%-text run exposed 21 CSS pixels of page overflow caused by compounded
narrow-layout spacing. Cedar now applies a token-based narrow composition with smaller app-local
function and panel spacing; the corrected production build has no page-level horizontal overflow.

## Automated and performance record

The focused Cedar House production-build matrix schedules 81 cases across Chromium, Firefox, and
WebKit. All 71 applicable cases pass. The ten skips are the expected non-Chromium Tier B
presentation and timing permutations; supported workflows, the maximum fixture, mutation stability,
and branded wall containment pass in all three engines.

The Chromium performance envelope uses three warm-ups and fifteen measured iterations against the
maximum fixture. The authoritative focused run observed:

- median initial construction of 3.4 milliseconds and a largest measured construction of 7.2
  milliseconds;
- median confirmed-control mutation of 0.5 milliseconds and a largest measurement of 0.8
  milliseconds;
- median failed-control mutation of 0.4 milliseconds and a largest measurement of 0.7 milliseconds;
- median partial secure-house mutation of 0.5 milliseconds and a largest measurement of 0.7
  milliseconds; and
- median six-strip telemetry replacement of 0.4 milliseconds and a largest measurement of 1.1
  milliseconds.

No observed application-attributable synchronous task reached 100 milliseconds. The reference
environment was the closeout branch based on repository commit `05fa622`, macOS 26.5.2 on arm64, an
Apple M4 Mac mini with 16 GB memory, and Playwright 1.62.0 with its bundled Chromium, Firefox, and
WebKit.

The authoritative full repository suite schedules 1,263 cases across Chromium, Firefox, and WebKit.
All 1,239 applicable cases pass. The 24 skips are the expected non-Chromium instances of timing-only
definitions and Phase 4B Tier B presentation permutations. The focused counts above identify Cedar
House evidence independently of unrelated component fixtures.

## Representative assistive-technology procedures

Exercise the built application with VoiceOver and Safari on macOS, then with NVDA and Firefox on
Windows:

1. Enter the overview and identify Cedar House, the current place, evening-readiness summary, five
   function regions, garage-door exception, filter-maintenance item, and next available action.
2. Navigate the household-function selectors and confirm their current-page state and hidden peer
   summaries without duplicate semantic owners.
3. Request a porch-light change and confirm the requested value never replaces the confirmed value
   before resolution; repeat the failed path and find the durable unchanged result.
4. Open Secure Cedar House, review the named house and affected targets, cancel once, confirm, and
   inspect pending plus partial or denied results without hearing false success.
5. Enter the HVAC asset route, inspect the identifying image, viewer controls, written instructions,
   unavailable fallback, history, and record confirmation; close the viewer and dialogs and confirm
   focus returns to each explicit invoker.
6. Receive a meaningful energy update and replace the maximum telemetry fixture while reading older
   content; confirm there is no forced speech, focus movement, or follow-latest behavior.
7. Repeat representative work at phone width and 200% text, then inspect the branded wall overview.
   Confirm critical state, response, reading order, target size, and containment remain usable.

Each result must name date, operating system, browser, assistive-technology version, app commit,
route, scenario, input method, expected result, observed result, and corrective pull request.
VoiceOver/Safari and NVDA/Firefox must both pass before a public release containing the affected
Cedar House workflows. VoiceOver with iOS Safari remains required before claiming mobile
assistive-technology support.

## Boundary audit

- `@wayglass/example-smart-home` remains private and imports no reference application.
- Production packages import nothing from `examples/` and expose no Cedar record, route, fixture,
  adapter, or validation API.
- The maximum fixture and app-local measurement hooks remain Cedar-owned and are enabled only by the
  application route query used for validation; they expose no package surface.
- The app consumes typed production React wrappers and does not copy components or reach into
  private Shadow DOM.
- Narrow-layout values use existing tokens; the comment explaining private composition breakpoints
  remains adjacent to the applicable CSS.
- No package publication, public deployment, credentials, analytics, persistence, network request,
  or new dependency entered Phase 4B.

## Reproduce

```bash
pnpm check
pnpm exec playwright test tests/browser/cedar-house-composition.spec.ts tests/browser/cedar-house-controls.spec.ts tests/browser/cedar-house-media.spec.ts tests/browser/cedar-house-validation.spec.ts
pnpm test:browser
```
