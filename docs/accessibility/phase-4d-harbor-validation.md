# Phase 4D Harbor Lab validation

**Status:** Automated, production visual, responsive, performance-bound, and supported-browser
validation completed on August 13, 2026. Representative VoiceOver/Safari and NVDA/Firefox reviews
remain explicit public-release gates. VoiceOver with iOS Safari remains required before claiming
mobile assistive-technology support.

This record closes Phase 4D for the Harbor Lab agent-supervision reference application. It follows
the accepted [Phase 4 validation plan](./phase-4-validation-plan.md), the
[reference-application contract](../reference-apps/phase-4-reference-applications.md), and
[ADR 0030](../architecture/adr/0030-isolated-reference-applications.md). Automated accessibility
evidence is not presented as screen-reader validation, and timing results are regression evidence
from the recorded machine rather than universal device guarantees.

## Acceptance result

| Area                    | Evidence                                                                                                                                                                                                                            | Result                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Application truth       | One Harbor-owned reducer supplies overview, focused functions, task investigation, retained tool activity, approval and execution requests, confirmed merge truth, and the deterministic maximum fixture                            | Pass                                             |
| State and scenarios     | Shared lifecycle scenarios plus stale evidence, denied and timed-out approval, failed and confirmed merge, recovery, new tool record, pause, cancellation, and retry preserve independent state axes                                | Pass                                             |
| Investigation           | Repository and revision scope, evidence provenance and age, confidence, worker context, linked attempt identity, and retained tool history remain inspectable without presenting activity or confidence as correctness              | Pass                                             |
| Consequential control   | Native confirmation names exact scope and lifetime; approval, authorization, pending work, adapter outcome, and confirmed branch truth remain separate through denial, timeout, failure, completion, pause, cancellation, and retry | Pass                                             |
| Responsive composition  | Phone, desktop, wall, compact and comfortable densities, both official themes, 200% root text, long content, RTL mechanics, and contained dense task data preserve the dominant decision and response                               | Pass                                             |
| Visual adaptation       | Light branded wall, dark dense task and recovery, forced colors, grayscale, and reduced motion retain function boundaries, evidence meaning, readable hierarchy, durable results, and visible focus                                 | Pass                                             |
| Maximum fixture         | 60 tasks, 12 agents, exactly 24 key values, six 120-sample telemetry strips, 250 task/tool events, and a 60-row by 10-column table remain deterministic and application-owned                                                       | Pass                                             |
| Mutation stability      | Approval lifecycle, linked retry, 25-event insertion, 20-row replacement, and complete telemetry replacement commit by the next animation frame without moving focus or reading position; quiet mutations remain unannounced        | Pass                                             |
| Performance             | Fifteen measured Chromium iterations after three warm-ups remain below the accepted 100-millisecond construction, mutation, and application-attributable synchronous-task gates                                                     | Pass                                             |
| Automated accessibility | Representative overview, investigation, confirmation, failure, phone, forced-color, maximum-fixture, and supported-browser states pass semantic assertions and Axe scans                                                            | Pass; representative manual gates remain carried |
| Package boundary        | The private app adds no dependency, live service, persistence, deployment, package API, cross-reference-app import, copied component implementation, or private Shadow DOM dependency                                               | Pass                                             |

## Production visual review

The built Harbor Lab application was reviewed on August 13, 2026 in Chromium by the implementing
Codex agent. The light compact maximum-fixture wall overview preserved Harbor Lab and place
identity, one dominant `HL-317` human decision, stale evidence, confirmed not-merged truth, the
primary investigation path, and four strong neutral function boundaries. Agent availability and tool
activity remained context rather than outcome claims.

The dark compact merge-failed task route kept proposed scope, task condition, worker context,
evidence provenance, confidence, granted approval, confirmed not-merged truth, recovery controls,
and retained history visually ordered. The maximum-fixture values and telemetry remained subordinate
validation context. The 60-row by 10-column task table stayed inside a labeled inline scroll region
rather than producing page overflow, and the 250-event window retained explicit application
ownership.

The phone review preserved application and route identity, the failed-task answer, exact repository
and revision scope, current merge truth, and the path to recovery without mounting a duplicate
interactive representation. The extended matrix checks 320 by 900 phone, 1280 by 800 desktop, 1600
by 1000 wall, 320 CSS pixels with 200% root text, both themes, both densities, RTL mechanics, forced
colors, grayscale, and reduced motion.

The first maximum-fixture run exposed repeated clones of the representative task retaining
`decision-required`, which diluted the one dominant human-decision answer. Harbor now keeps that
state only on `HL-317`; cloned review work remains labeled `review`. A later failure was an
ambiguous test locator for two valid links to the same task and required no product change.

## Automated and performance record

The focused Harbor Lab production-build matrix schedules 93 cases across Chromium, Firefox, and
WebKit. All 83 applicable cases pass. The ten skips are the expected non-Chromium Tier B
presentation and timing permutations; primary workflows, failure and recovery, route continuity, the
maximum fixture, mutation stability, automated accessibility, and branded wall containment pass in
all three engines.

The Chromium performance envelope uses three warm-ups and fifteen measured iterations against the
maximum fixture. The authoritative focused run observed:

- median initial construction of 16.4 milliseconds and a largest measured construction of 18.8
  milliseconds;
- median approval-lifecycle mutation of 9.0 milliseconds and a largest measurement of 14.9
  milliseconds;
- median linked-retry mutation of 8.8 milliseconds and a largest measurement of 9.8 milliseconds;
- median 25-tool-event insertion of 10.1 milliseconds and a largest measurement of 18.1
  milliseconds;
- median 20-task-row replacement of 9.4 milliseconds and a largest measurement of 10.4 milliseconds;
  and
- median six-strip telemetry replacement of 9.3 milliseconds and a largest measurement of 12.9
  milliseconds.

No observed application-attributable synchronous task reached 100 milliseconds. The reference
environment was the closeout branch based on repository commit `5d57eb3`, macOS 26.5.2 on arm64, an
Apple M4 Mac mini with 16 GB memory, and Playwright 1.62.0 with its bundled Chromium, Firefox, and
WebKit.

The full repository matrix schedules 1,422 cases. The closeout run completed with 1,377 passes, 44
expected engine-specific skips, and one Chromium Axe harness failure caused by a destroyed page
execution context in the unrelated Vanilla Operational Activity phone fixture. That exact case
passed immediately in isolation. The focused Harbor matrix above remains the authoritative
application result; the repository-wide run adds no repeatable product failure.

## Representative assistive-technology procedures

Exercise the built application with VoiceOver and Safari on macOS, then with NVDA and Firefox on
Windows:

1. Enter the overview and identify Harbor Lab, the current place, the `HL-317` human decision, stale
   evidence, confirmed not-merged truth, four function regions, and the next investigation path.
2. Navigate the supervision-function selectors and confirm current-page state and hidden peer
   summaries without duplicate semantic owners; verify the review consequence remains reachable
   while Execution is active.
3. Enter `HL-317`, inspect repository and revision scope, evidence source and age, confidence,
   assigned-worker context, attempt identity, retained history, and the contained maximum task
   table, then return without losing route context.
4. Open the merge confirmation, review exact scope, evidence, lifetime, one-attempt effect, failure
   behavior, and absence of automatic reversal; cancel once, confirm, and inspect pending plus
   denied, timed-out, or failed outcomes without hearing false success.
5. Receive one deliberate final result announcement and find the same durable visible result;
   confirm granted approval and confirmed merge truth remain separate after a failed merge.
6. Request pause and cancellation and verify the app claims only that the request was recorded and
   an active tool step may finish. Retry the failed task and confirm a new linked attempt retains
   prior history and invalidates prior approval.
7. Insert meaningful tool activity while reading older content and confirm there is no forced
   speech, focus movement, scroll movement, or follow-latest behavior. Recover evidence without
   erasing relevant history, then repeat representative work at phone width and 200% text.

Each result must name date, operating system, browser, assistive-technology version, app commit,
route, scenario, input method, expected result, observed result, and corrective pull request.
VoiceOver/Safari and NVDA/Firefox must both pass before a public release containing the affected
Harbor workflows. VoiceOver with iOS Safari remains required before claiming mobile
assistive-technology support.

## Boundary audit

- `@wayglass/example-agent-supervision` remains private and imports no reference application.
- Production packages import nothing from `examples/` and expose no Harbor task, agent, evidence,
  tool, attempt, approval, adapter, route, scenario, or validation API.
- The maximum fixture and app-local measurement hooks remain Harbor-owned and are enabled only by
  the application route query used for validation; they expose no package surface.
- The app consumes typed production React wrappers and uses app-owned token-based native-table
  presentation; it does not copy components or reach into private Shadow DOM.
- Responsive composition uses existing tokens plus the already documented private breakpoint
  constants.
- No package publication, public deployment, credentials, analytics, persistence, network request,
  or new dependency entered Phase 4D.

## Reproduce

```bash
pnpm check
pnpm exec playwright test tests/browser/harbor-foundation.spec.ts tests/browser/harbor-composition.spec.ts tests/browser/harbor-investigation.spec.ts tests/browser/harbor-workflow.spec.ts tests/browser/harbor-validation.spec.ts
pnpm test:browser
```
