# Phase 2D-D form-foundation validation

Status: automated and visual validation complete as of July 31, 2026. Representative screen-reader
and autofill acceptance is consolidated with the complete form composition and carried as an
explicit public-release gate in the [Phase 2 ledger](./phase-2-assistive-technology-gates.md).

This record covers `wg-field-label`, `wg-field-message`, `wg-form-group`, the native
`wg-form-action` class, their tokens and typed React wrappers, and production-backed Storybook
stories. The accessibility target is WCAG 2.2 AA.

## Evidence matrix

| Requirement                     | Evidence                                                                                                                                      | Result  |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Native label ownership          | Consumer-authored `label` and `for` retain click-to-focus behavior and one native accessible name                                             | Pass    |
| Native grouping                 | Consumer-authored `fieldset` and first `legend` expose one named group with native radio controls                                             | Pass    |
| Inert presentation              | Form-foundation hosts add no control, label, group, alert, or status role and no tab stop                                                     | Pass    |
| Persistent help                 | Authored IDs and `aria-describedby` expose visible help without generated or rewritten relationships                                          | Pass    |
| Submission-first errors         | A pristine required field has native invalidity without authored error state; attempted submission exposes persistent text and `aria-invalid` | Pass    |
| Error redundancy                | Current errors use text, critical color, and a bar/boundary that remains distinct without icons and in forced colors                          | Pass    |
| Native submission               | Constraint validation runs before submit; `SubmitEvent.submitter`, submitter name/value, and successful-control `FormData` remain native      | Pass    |
| Native reset                    | One native reset restores control defaults; application-owned error state is cleared deliberately without a duplicate Wayglass event          | Pass    |
| Disabled/read-only ownership    | Native disabled controls remain unsuccessful; native read-only controls remain successful and visually distinct                               | Pass    |
| Native actions                  | Submit and reset remain native buttons with visible keyboard focus and a minimum 44-pixel target                                              | Pass    |
| Failure behavior                | Side-effect-free imports leave light-DOM label and message content visible before registration                                                | Pass    |
| Theme and density               | Dark and light visual review; density-aware group and action spacing; no operational condition treatment on ordinary form structure           | Pass    |
| Forced colors and motion        | Native focus and error distinction remain visible; no behavior or understanding depends on motion                                             | Pass    |
| Reflow                          | The complete form fixture remains within a 320 CSS-pixel viewport without horizontal page overflow                                            | Pass    |
| Framework parity                | Typed React wrappers use the production classes while native input properties and events stay ordinary React APIs                             | Pass    |
| Supported browser engines       | The focused suite passes in Chromium, Firefox, and WebKit                                                                                     | Pass    |
| Automated accessibility review  | Axe reports no violations in dark, light, and forced-colors fixtures across supported engines                                                 | Pass    |
| Representative assistive review | VoiceOver/Safari labeling, description, invalid announcement, native grouping, and focus behavior                                             | Carried |
| Representative autofill review  | Real browser autofill and password-manager behavior with production-like profile fields                                                       | Carried |

## Automated and visual review record

The focused Playwright matrix covers side-effect-free imports, useful fallback content, native label
activation, explicit accessible descriptions, pristine required state, native constraint validation,
persistent error exposure, submitter identity, successful-control form data, native reset, native
fieldset/legend grouping, closed message vocabulary, absence of automatic live-region semantics,
native action target size, dark and light Axe scans, forced colors, reduced motion, and
narrow-viewport containment. All 39 focused cases passed across Chromium, Firefox, and WebKit on
July 31, 2026.

The complete repository browser matrix also passed all 477 cases across Chromium, Firefox, and
WebKit on August 1, 2026.

Visual review used the production Storybook stories in dark and light themes. It confirmed a clear
label-control-message hierarchy, neutral ordinary form structure, a restrained redundant error
signal, readable help and requirement text, native semantic groups, and distinct submit/reset
actions. Specific text, number, select, checkbox, radio, and range-control presentations remain
intentionally deferred to Phase 2D-E.

Browser role queries and Axe inspect the platform accessibility representation but do not prove
spoken output or real profile-data integration. Phase 2 closeout consolidates the following checks
into the Phase 2D-E form composition and carries them to the public-release gate:

1. VoiceOver with Safari: confirm native label, requirement, help, and current error output; native
   fieldset/legend grouping; invalid submission focus; error correction; and reset behavior.
2. A representative browser profile: confirm `autocomplete` works with production-like name,
   address, email, telephone, and password fields without Wayglass elements interfering.

NVDA with Firefox on Windows remains required before a public release. Password-manager validation
belongs with the Phase 2D-E password-capable text-field composition.

## Reproduce automated checks

```bash
pnpm check
pnpm exec playwright test tests/browser/form-foundation.spec.ts
pnpm test:browser
```
