# Phase 4E integrated validation

**Status:** Accepted on August 14, 2026. Automated, supported-browser, responsive,
performance-bound, production visual, and application-boundary validation is complete. The final
[roadmap disposition](../phase-4-roadmap-disposition.md) closes Phase 4. Representative
VoiceOver/Safari and NVDA/Firefox reviews remain explicit public-release gates. VoiceOver with iOS
Safari remains required before claiming mobile assistive-technology support.

This record integrates the accepted Cedar House, Northline Cold Storage, and Harbor Lab validation
evidence under the [Phase 4 validation plan](./phase-4-validation-plan.md), the
[cross-domain semantic and brand audit](./phase-4e-cross-domain-audit.md), and
[ADR 0030](../architecture/adr/0030-isolated-reference-applications.md). It is the technical
closeout checkpoint before the Phase 4 roadmap disposition. Automated accessibility evidence is not
presented as screen-reader validation, and local timing evidence is not a universal device
guarantee.

## Integrated result

| Area                      | Evidence                                                                                                                                                                                           | Result                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| End-to-end workflows      | Representative awareness, investigation, decision, action, confirmation, failure, and recovery paths pass for all three applications                                                               | Pass                                            |
| Semantic consistency      | Condition, knowledge, activity, freshness, confidence, Boolean value, trend, request state, and durable outcome retain the accepted cross-domain meanings                                          | Pass                                            |
| Responsive composition    | Phone, desktop, wall, 200% text, long content, RTL mechanics, forced colors, grayscale, reduced motion, both themes, and both useful densities remain covered by the accepted application matrices | Pass                                            |
| Supported browsers        | Applicable representative cases pass in Chromium, Firefox, and WebKit; Tier B presentation and timing permutations remain intentionally Chromium-only                                              | Pass                                            |
| Automated accessibility   | Representative high-risk routes and states pass semantic assertions and Axe scans                                                                                                                  | Pass; manual screen-reader gates remain carried |
| Performance and stability | Maximum fixtures and meaningful mutations remain inside the accepted 100-millisecond application-attributable synchronous-task envelope, with focus and reading-position stability asserted        | Pass                                            |
| Production visual review  | Cedar phone, Northline focused desktop, and Harbor overview desktop preserve domain identity, functional separation, state priority, and next-action legibility                                    | Pass                                            |
| Application boundary      | Apps remain private and isolated; no dependency, package API, copied component, cross-app import, or package-owned domain model was introduced                                                     | Pass                                            |

## Authoritative automated record

The integrated reference-application matrix schedules 252 cases from the Cedar composition,
controls, media, and validation suites; the Northline composition and validation suites; the Harbor
foundation, composition, investigation, workflow, and validation suites; and the cross-domain suite.
Using the repository's supported five-worker configuration, all 222 applicable cases pass. The 30
skips are the expected non-Chromium Tier B presentation and timing permutations.

A preliminary parallel run reported two Firefox timing-sensitive failures: one Northline
reading-position sample and one Northline maximum-fixture mutation sample. Each exact case passed in
an immediate one-worker rerun, and the complete authoritative matrix then passed without either
failure. A subsequent attempt to make the entire multi-browser matrix single-worker was abandoned
after the unsupported runner shape caused cascading fixture timeouts; it is not used as product
evidence.

The full repository matrix schedules 1,434 cases. All 1,390 applicable cases pass, with 44 expected
engine-specific skips and no failure. This supersedes the earlier per-application full-suite records
for the integrated checkpoint.

The reference environment was the closeout branch based on repository commit `d5b111b`, macOS 26.5.2
on arm64, and Playwright 1.62.0 with its bundled Chromium, Firefox, and WebKit.

## Production visual review

The built applications were reviewed in Chromium on August 14, 2026 by the implementing Codex agent.
This review supplements the accepted per-application phone, desktop, and wall reviews; it does not
replace their automated responsive matrices.

- Cedar House at 320 by 900 in the dark comfortable `secure-partial` scenario retained application
  identity, the whole-home answer, the dominant two-item attention summary, file-tab-like function
  bands, and legible nested content. Its document width remained contained within the viewport.
- Northline Cold Storage at the available 1280 by 720 desktop viewport in the dark compact
  `hold-failed` load route kept confirmed load state, caution and stale evidence, dispatch-hold
  value, investigation history, and action scope visually distinct without horizontal page overflow.
- Harbor Lab at the available 1280 by 720 desktop viewport in the light compact `stale-evidence`
  scenario kept the one human decision dominant while preserving strong separation among Work
  intake, Execution, and Review and approval. Agent activity remained context rather than an outcome
  claim.

Across the three views, app-owned geometry and brand expression remained meaningfully different
while semantic color, functional separation, hierarchy, and state language remained related.

## Manual and formative evidence carried forward

| Evidence                                                              | Current disposition                                                                                | Release impact                                                                                                                                        |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| VoiceOver with Safari on macOS                                        | Procedure defined in each application validation record; not performed in this local agent session | All affected desktop workflows remain ineligible for a public screen-reader support claim until this passes or release scope explicitly excludes them |
| NVDA with Firefox on Windows                                          | Procedure defined; unavailable in the macOS validation environment                                 | Same desktop release gate; VoiceOver alone cannot substitute for it                                                                                   |
| VoiceOver with Safari on iOS                                          | Procedure defined; not performed                                                                   | No mobile assistive-technology support claim until it passes                                                                                          |
| Structured five-second first-glance review with representative people | Not performed because representative participants were unavailable in the local agent session      | No formative claim about real-user first-glance prioritization; this does not replace or block the named assistive-technology release gates           |

The manual procedures must record date, operating system, browser and assistive-technology version,
app commit, route, scenario, input method, expected result, observed result, and corrective pull
request. Automated browser, semantic, and Axe results do not satisfy these gates.

## Boundary audit

- Every application under `examples/` remains marked `private: true`; packages remain unpublished.
- No production package imports from `examples/`, and no reference application imports another
  reference application.
- Cedar device and household records, Northline operational records, and Harbor task and agent
  records remain application-owned and do not enter package APIs.
- The applications continue to consume production Wayglass packages without copying component
  implementations or reaching into private Shadow DOM.
- No package manifest or lockfile changed, and no dependency entered this checkpoint.
- No public deployment, live service, credential, analytics, persistence, or external data entered
  the integrated validation.

## Closeout disposition

The technical integrated-validation checkpoint passes. The
[roadmap disposition](../phase-4-roadmap-disposition.md) records successful compositions, rejected
abstractions, evidence-driven candidates, and the final status of deferred work. Any promotion
remains a separate reviewed contract and ADR. The manual gates above remain tied to release claims
rather than being mislabeled as completed Phase 4 implementation evidence.

## Reproduce

```bash
pnpm check
pnpm exec playwright test tests/browser/cedar-house-composition.spec.ts tests/browser/cedar-house-controls.spec.ts tests/browser/cedar-house-media.spec.ts tests/browser/cedar-house-validation.spec.ts tests/browser/northline-composition.spec.ts tests/browser/northline-validation.spec.ts tests/browser/harbor-foundation.spec.ts tests/browser/harbor-composition.spec.ts tests/browser/harbor-investigation.spec.ts tests/browser/harbor-workflow.spec.ts tests/browser/harbor-validation.spec.ts tests/browser/phase-4-cross-domain.spec.ts
pnpm test:browser
```
