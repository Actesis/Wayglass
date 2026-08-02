# Phase 2D-E form-control validation

**Status:** Automated cross-browser and visual review complete on August 1, 2026. Representative
assistive-technology, real-profile autofill, and password-manager review remain open.

This record covers `wg-text-field`, `wg-number-field`, `wg-select`, `wg-checkbox`, `wg-radio`, and
`wg-slider`, their locked tokens, typed React wrappers, and production-backed Storybook
compositions.

## Acceptance matrix

| Area                            | Evidence                                                                                                                                                                | Status  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Ownership and fallback          | Native light-DOM controls remain the only roles, focus targets, form values, and event owners before and after upgrade                                                  | Pass    |
| Text and number editing         | Text, textarea, and numeric entry retain native editing, stepping, values, and events without shell translation                                                         | Pass    |
| Select                          | Native options, optgroups, selection, popup ownership, and change behavior remain intact                                                                                | Pass    |
| Checkbox                        | Label activation, checked state, mixed property, native submission, and reset remain intact                                                                             | Pass    |
| Radio                           | Native group naming, mutual exclusion, arrow movement, submission, and reset remain intact                                                                              | Pass    |
| Slider                          | Native keyboard adjustment, bounded value, application-owned output, and 44px cross-axis target remain intact                                                           | Pass    |
| Submission and reset            | Native successful-control data, submitter value, defaults, and application-owned reset follow-up remain intact                                                          | Pass    |
| Validation                      | Persistent Wayglass error styling follows explicit `aria-invalid`; descriptions remain explicit and pristine native validity is not styled as an authored error         | Pass    |
| Target geometry                 | Field controls and labeled choices retain at least 44px targets; WebKit select and range exceptions receive explicit block geometry without replacing native appearance | Pass    |
| Themes and states               | Dark and light review distinguishes ordinary, readonly, disabled, selected, checked, and explicit error states without condition color on routine structure             | Pass    |
| Forced colors                   | Native controls remain present and focus/error distinctions survive system color substitution                                                                           | Pass    |
| Reflow                          | The complete fixture remains within a 320 CSS-pixel viewport without horizontal page overflow                                                                           | Pass    |
| React parity                    | Typed shells use production element classes while native React controls retain ordinary props, refs, and events                                                         | Pass    |
| Supported engines               | All 45 focused cases pass in Chromium, Firefox, and WebKit                                                                                                              | Pass    |
| Automated accessibility         | Axe reports no violations in dark, light, and forced-colors fixtures across supported engines                                                                           | Pass    |
| Representative assistive review | VoiceOver/Safari and NVDA/Firefox labeling, grouping, value/state, invalid, and focus behavior                                                                          | Pending |
| Representative autofill review  | Real browser profile and password-manager behavior for semantic identity, contact, and password fields                                                                  | Pending |

## Automated review record

The focused Playwright matrix covers side-effect-free imports, native fallback, roles and focus
targets, text and textarea editing, numeric stepping, select options and optgroups, checkbox mixed
state, radio keyboard movement, slider keyboard adjustment and output, native form data and reset,
target geometry, explicit invalid presentation, dark and light Axe scans, forced colors, and narrow
reflow. All 45 focused cases passed across Chromium, Firefox, and WebKit on August 1, 2026.

The complete repository browser matrix also passed all 522 cases across those engines.

The first run found that WebKit retains 23px intrinsic geometry for native single selects and range
inputs despite `min-block-size`. The accepted correction sets an explicit 44px block size for those
two control boxes while retaining their native disclosure, popup, track, and thumb.

## Visual review record

Production Storybook compositions were reviewed in dark and light desktop contexts and a 390px phone
context. Field surfaces, native choice indicators, native select disclosure, native range track and
thumb, labels, messages, actions, and functional panels remain visually coherent with the humanist,
compact, banded language. Routine form structure stays neutral; blue communicates action, focus, or
selected form value rather than health. Explicit errors retain redundant border and text treatment.
Readonly and disabled controls remain distinct.

The phone composition had no horizontal overflow, all reviewed native controls remained inside their
owning panel, and the browser console reported no errors.

## Open representative review

Automated accessibility-tree and Axe results do not prove spoken output, virtual-cursor behavior,
autofill, password-manager integration, or mobile software-keyboard selection. Final Phase 2D-E
acceptance still needs:

1. VoiceOver with Safari: verify labels, help and error descriptions, fieldset/legend grouping,
   checkbox mixed state, radio position and selection, range value, invalid state, and focus order.
2. A representative browser profile: verify `autocomplete` for name, email, telephone, address, and
   password fields without shell interference, including password-manager fill and save behavior.

NVDA with Firefox on Windows remains required before a public release.

## Reproduce automated checks

```bash
pnpm check
pnpm exec playwright test tests/browser/form-controls.spec.ts
pnpm test:browser
```
