# Phase 6B v1 support-claim disposition

**Status:** Proposed for project-owner acceptance on September 4, 2026. This record defines the
support claims that the initial `0.1.0` release proposal may make from completed evidence. It does
not publish a package, make the repository public, deploy documentation, close the final freeze
matrix, or turn an unverified environment into a supported one.

## Decision model

Wayglass uses four labels so evidence and support are not conflated:

- **Supported** is a released public contract that maintainers accept reproducible defects against
  when the report stays inside the named version and environment boundary.
- **Validated** is automated evidence from the exact release matrix. It supports a bounded claim but
  is not human observation, certification, or proof of every browser brand and operating system.
- **Task-observed** is a dated human result for the exact task and environment recorded. It is not a
  library-wide support claim.
- **Unclaimed** means no v1 support promise exists because representative evidence is absent. It
  does not assert that the environment is broken.

Only an accepted release record can move this candidate matrix into released support. Source on
`main`, private candidates, examples, Storybook, and historical evidence remain outside that
promise.

## Proposed initial matrix

| Surface                     | Proposed v1 claim                                                                                                                                                                            | Boundary and evidence                                                                                                                                                                                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package and tooling runtime | Node `>=22.13.0 <27`                                                                                                                                                                         | Applies to package management, ESM loading, compiler helpers, and supported tooling use. It is not a browser claim. Minimum Linux and current macOS evidence exists; Phase 6C must repeat the clean consumer proof.                                                                    |
| Type declarations           | TypeScript `>=5.9.0 <6.1.0`                                                                                                                                                                  | Applies to the emitted public declarations. JavaScript consumers do not need TypeScript. Minimum/current compiler evidence exists and must be repeated against packed declarations.                                                                                                    |
| Browser engines             | Current stable Chromium, Firefox, and WebKit lines recorded by the exact release freeze                                                                                                      | Applies to standards behavior exercised by the cross-engine matrix for core, tokens, themes, elements, icons, and React. It does not imply every branded browser, operating system, embedded webview, or older engine. Exact engine versions belong in release evidence.               |
| Input and adaptation        | Keyboard and pointer operation; emulated touch interaction and target sizing; responsive phone, desktop, and wall compositions; 200% text; RTL; forced colors; grayscale; and reduced motion | Applies only to the component behaviors and fixtures covered by the release matrix. Emulated viewports and input do not establish physical phone, tablet, kiosk, or wall-device support.                                                                                               |
| Automated accessibility     | Semantic, keyboard, focus, reflow, preference, contrast, and Axe behaviors covered by the release matrix                                                                                     | Wayglass targets WCAG 2.2 AA. Passing automation is not WCAG certification and does not establish a screen-reader or physical-device claim.                                                                                                                                            |
| React binding               | React `>=19.0.0 <20`, client-rendered wrappers over `@wayglass/elements` `^0.1.0`                                                                                                            | Direct-element parity, typed props/events/refs, guarded client registration, safe server import, and a client-only fallback are supported. Server rendering of component internals, declarative Shadow DOM, hydration, React Server Components, and future React majors are unclaimed. |
| Forms                       | Native form ownership, labeling, grouping, validation, submission, reset, and documented form-control behavior covered by the browser matrix                                                 | Real-profile autofill, password-manager fill/save, mobile software-keyboard behavior, and a particular password manager are unclaimed.                                                                                                                                                 |
| Package removal             | Consumers can remove an unused package without relying on import registration side effects                                                                                                   | Direct element and icon imports remain registration-free. Retained React wrappers register only in a client environment; importing a wrapper solely for that effect is unsupported. Phase 6C owns packed install and removal proof.                                                    |

The engine claim is deliberately expressed as the three validated engine lines. A Chromium result
does not promise every Chromium-derived product, and Playwright WebKit evidence does not become a
claim about every Safari version or Apple device. The release record must name the exact tested
versions and may narrow this row if the final matrix differs.

## Assistive-technology disposition

The initial release makes **no broad desktop or mobile screen-reader support claim**.

The following completed results remain task-observed evidence only:

- VoiceOver with Safari on macOS for the accepted tabs task: naming, selection, disabled-tab
  skipping, consequential summary announcement, panel entry, and return focus;
- VoiceOver with Safari on macOS for the accepted core-controls task: switch state and request
  behavior, radio-group selection and disabled-option skipping, wrapping, and ordinary navigation
  order; and
- VoiceOver with Safari on macOS for the seven fixed Phase 5C visualization tasks. That proof is
  excluded from the v1 package set, so its observations create no v1 visualization or package claim.

These observations do not cover the remaining component families, complete applications,
NVDA/Firefox, iOS, or another macOS screen-reader workflow. Automated accessibility trees and Axe
results remain validated evidence, not substitutes for those observations.

The following future gates remain open:

| Future evidence                                                                                            | Claim it may enable                                 | Current v1 disposition                                 |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| Representative VoiceOver/Safari procedures for every affected released workflow                            | Corresponding macOS desktop screen-reader support   | Unclaimed except for the exact task observations above |
| Representative NVDA/Firefox procedures on Windows for every affected released workflow                     | Corresponding Windows desktop screen-reader support | Unclaimed; Windows access remains deferred             |
| Representative VoiceOver/iOS Safari procedures, including native software keyboard behavior where relevant | Mobile assistive-technology support                 | Unclaimed                                              |
| Representative real-profile autofill and password-manager procedures                                       | Autofill or password-manager workflow support       | Unclaimed                                              |

Completing one row changes only its named claim after review. It does not automatically broaden the
browser, device, component, or application support matrix.

## Other explicitly unclaimed environments

V1 makes no support claim for:

- physical mobile devices, low-power tablets, kiosks, or wall hardware;
- installed PWAs, Electron, Tauri, Home Assistant, or Chromium-based embedded webviews;
- a provider, live service, application architecture, authorization model, data transport, or asset
  host;
- arbitrary third-party CSS, component-internal overrides beyond documented tokens and parts, or
  unsupported combinations of package versions;
- a specific assistive technology beyond the exact task observations above; or
- production battle testing, representative five-second recognition, or performance on hardware
  other than the named release-evidence machine.

These are support boundaries, not prohibitions. Consumers may evaluate an unclaimed environment and
submit a reproducible finding. Adding a public claim requires representative evidence, an owner, and
a reviewed compatibility update.

## Package-specific application

- `@wayglass/core`, `@wayglass/tokens`, and `@wayglass/themes` inherit the Node, TypeScript, and
  applicable browser-engine claims only for their exported runtime or generated artifacts.
- `@wayglass/elements` inherits the browser, input, adaptation, automated-accessibility, and form
  boundaries for its accepted component contracts, with no broad screen-reader claim.
- `@wayglass/icons` inherits the browser and automated-accessibility boundaries for `wg-icon` and
  its four accepted built-ins, with no general icon-library or screen-reader claim.
- `@wayglass/react` inherits the elements boundary only through its React 19 client wrapper
  contract; it does not widen any element, browser, rendering, or assistive-technology claim.

Examples, Storybook, reference applications, private token and icon tooling, the retained Phase 5C
proof, and provider guidance are evidence or documentation rather than supported npm release units.

## Reporting and maintenance

After public release, reports inside the accepted matrix use GitHub Issues and include the exact
package, version, runtime or browser and version, operating system when relevant, minimal
reproduction, expected and observed behavior, and accessibility or writing-mode conditions. Security
reports use the separately verified private process.

A report from an unclaimed environment may still expose a standards defect. Maintainers will
classify it from evidence, but v1 promises neither a fix nor a response time outside the accepted
matrix. Release notes must repeat material limitations and link the authoritative support policy.

## Acceptance effect and next gate

Acceptance closes Phase 6A correction 10 by narrowing claims rather than inventing Windows or mobile
assistive-technology evidence. It preserves every unrun procedure for a future reviewed claim. It
authorizes no public support statement before release.

Phase 6B then advances to the integrated freeze: run the complete affected matrix, record exact
environments and limitations, classify all blockers, and propose one exact v1 scope-freeze commit.
The final matrix may narrow this proposal; widening it requires new evidence and review.
