# Phase 5C assistive-technology validation

**Prepared:** 2026-08-27  
**Scope:** `P5C-E03` and the non-visual portion of `P5C-E01`  
**Proof route:** `/experiments/phase-5c-rich-visualization/?candidate=native`  
**Disposition:** automated semantic preflight passes; VoiceOver/Safari and NVDA/Firefox human task
transcripts remain required before candidate disposition

## Why the native-only route exists

The default private proof continues to render all three comparison adapters. The accepted
maintenance review carries only native SVG/HTML into assistive-technology validation. The explicit
`candidate=native` mode therefore mounts one adapter plus the same application-owned readable
summary and exact table. It does not change the fixture, semantics, interaction contract, or public
surface. Candidate modules load through explicit direct imports, so the native route requests no
uPlot or D3 module. Unknown modes fail visibly before loading or mounting an adapter instead of
silently selecting a candidate.

## Automated semantic preflight

The retained Playwright test runs in Chromium, Firefox, and WebKit and verifies:

- one named native candidate and no uPlot or D3 candidate content;
- no uPlot or D3 module request on the native route;
- a hidden, non-focusable SVG with no graphic-owned task meaning;
- four correctly named native visibility checkboxes;
- four correctly named inspection buttons, bounded disabled state, keyboard activation, updated
  exact text, and retained focus;
- a collapsed-by-default exact table that mounts only after its native disclosure opens;
- the named exact-table region, caption-derived table name, five column headers, and exact 08:00 and
  14:00 row headers;
- no live region, alert, or status output that could announce thousands of samples or duplicate the
  persistent inspector; and
- no Axe violations on the complete route before the intentionally lazy exact table is expanded.

A full-document Axe scan after expanding all 2,880 rows was also attempted as adverse evidence.
Chromium completed without violations in 25.2 seconds and Firefox completed without violations in
37.9 seconds. WebKit did not complete within 90 seconds. That tooling timeout is not counted as a
pass or an accessibility violation. The retained cross-browser test instead asserts the expanded
table's region, table name, headers, target rows, and quiet announcement boundary directly; the
required VoiceOver/Safari transcript remains the authoritative WebKit human result.

This preflight inspects browser semantics and behavior. It cannot prove spoken output, browse-mode
navigation, table-header announcement, verbosity, or human task success, so it does not complete
`P5C-E03`.

The first semantic pass found that the inspection buttons' label was attached to a generic `div`.
The label did not establish an explicit control group. The corrected proof assigns `role="group"`;
the rendered browser structure now exposes one “Exact inspection navigation” group containing the
four buttons. A direct rendered-page inspection also confirmed the single native region, named
Visible series group, named inspection group, absence of uPlot/D3 headings and live regions, exact
table name, five headers, and target task rows after disclosure.

## Fixed task questions and expected answers

Use only screen-reader output, native keyboard navigation, the persistent inspector, application
summary, and exact table. Do not inspect the SVG or source.

1. Which queue crosses the authored 80-item caution threshold first, and when?  
   Expected: Review queue at 08:00 UTC.
2. What are all four exact values at that observation?  
   Expected: Review 86, Intake 46, Classification 47, and Dispatch 48 items.
3. What are all four exact values at the authored 14:00 UTC routing intervention?  
   Expected: Review 85, Intake 88, Classification 91, and Dispatch 95 items.
4. Do all queues recover below caution within 15 minutes, and which is last?  
   Expected: Yes; Dispatch is last at 14:12 UTC with 76 items.

## VoiceOver with Safari on macOS

Record exact macOS, Safari, and VoiceOver versions and the tested commit. Start Safari at the native
proof route, then enable VoiceOver without first visually inspecting the task answers.

1. Navigate by landmarks and headings. Confirm one main task, one native adapter, persistent exact
   inspection, and readable investigation evidence in source order. Confirm no chart image, SVG,
   path, point, Canvas, uPlot, or D3 content is announced.
2. Navigate the Visible series group. Confirm all four checkboxes have distinct queue names and
   checked state. Toggle one off and on; confirm the state changes without unsolicited task-summary
   speech or lost position.
3. Navigate the Exact inspection navigation group. Confirm Previous sample starts dimmed/disabled.
   Activate Next sample and Previous/Next series; confirm the persistent Series, Observed at, Value,
   and Knowledge fields change, focus stays on the activated button, and no graphic content speaks.
4. Read the authored summary and answer questions 1 and 4. Confirm it is ordinary text rather than a
   live announcement or inferred screen-reader-only conclusion.
5. Expand “Inspect all exact queue observations.” Confirm expansion does not read all 2,880 rows.
   Enter the named Exact queue observations region and table. Confirm the caption, five column
   headers, and row headers are understandable.
6. Use VoiceOver or Safari text search for `2026-08-18 08:00:00 UTC`, then table navigation to read
   the four data cells with queue-column context and answer question 2. Repeat at
   `2026-08-18 14:00:00 UTC` for question 3 and at `2026-08-18 14:12:00 UTC` to verify question 4.
7. Collapse and re-expand the table. Confirm identity and reading order remain stable and there is
   no duplicate or conflicting semantic owner.

## NVDA with Firefox on Windows

Record exact Windows, Firefox, and NVDA versions and the tested commit. Use the same native proof
route and repeat the seven steps above with NVDA browse mode and Firefox. Use NVDA table-navigation
commands and NVDA Find where appropriate. VoiceOver results cannot substitute for this pairing.

## Transcript record

For each pairing, record:

| Field                                | VoiceOver / Safari | NVDA / Firefox |
| ------------------------------------ | ------------------ | -------------- |
| Date and tester                      | Pending            | Pending        |
| OS version                           | Pending            | Pending        |
| Browser version                      | Pending            | Pending        |
| Assistive-technology version         | Pending            | Pending        |
| Commit                               | Pending            | Pending        |
| Orientation and single-owner result  | Pending            | Pending        |
| Controls and focus result            | Pending            | Pending        |
| Exact-table names and headers result | Pending            | Pending        |
| Four task answers                    | Pending            | Pending        |
| Unsolicited or duplicate speech      | Pending            | Pending        |
| Defect or corrective PR              | Pending            | Pending        |
| Overall result                       | Pending            | Pending        |

A failure must retain the observed announcement or navigation problem and corrective PR. Do not
weaken the task, table size, candidate, or expected answer after a result. Both pairings must pass
against the same proof revision before final artifact-candidate disposition.

## Reproduction

```sh
pnpm experiment:phase5c:check
pnpm exec playwright test tests/browser/phase-5c-assistive-preflight.spec.ts
pnpm exec vite --host 127.0.0.1 --port 4173 --strictPort
```
