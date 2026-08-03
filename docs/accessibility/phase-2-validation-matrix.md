# Phase 2 validation matrix

**Status:** Updated for Phase 2F on August 3, 2026 from the implementation baseline at `main` commit
`2164d00`. Repository checks and all 747 browser cases pass after the contrast-safe modal-motion
correction recorded below.

This record consolidates the Phase 2 validation evidence. It does not replace the detailed milestone
records or convert automated accessibility evidence into a screen-reader claim. Remaining manual
platform reviews retain the release impact defined in the
[representative assistive-technology gate ledger](./phase-2-assistive-technology-gates.md).

## Closeout result

| Dimension            | Evidence                                                                                                                                                                                | Result                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Repository integrity | Formatting, lint, TypeScript, unit tests, package builds, documentation, Storybook, and vanilla and React application builds through `pnpm check`                                       | Pass                                             |
| Supported browsers   | The same 249 test definitions in Chromium, Firefox, and WebKit; 747 cases total                                                                                                         | Pass                                             |
| Accessibility        | Native and authored semantics, names and relationships, keyboard and focus behavior, target geometry, Axe, forced colors, reduced motion, and retained context                          | Pass; representative manual gates remain carried |
| Responsive behavior  | Phone, desktop, wall-display, container-responsive, 320 CSS-pixel, 200% text-size, and zoom-equivalent fixtures without unintended page overflow                                        | Pass                                             |
| Visual states        | Dark and light themes, density, selection, focus, pending, rejected, loading, stale, offline, disabled, read-only, invalid, destructive, forced-color, and reduced-motion presentations | Pass                                             |
| Framework parity     | Production Custom Elements, typed React wrappers, shared coordinators, native events, typed Custom Events, refs and methods, fallback content, and runnable vanilla and React examples  | Pass                                             |

The visual-state result combines browser assertions with the production Storybook reviews recorded
in each milestone validation document. Wayglass intentionally has no universal pixel-diff baseline:
themes permit substantial brand adaptation, so validation protects semantic distinctions, layout,
contrast, boundaries, focus, and required state cues rather than one fixed rendering.

## Browser-suite coverage

| Area                                       | Test definitions per engine | Cases across three engines | Browser specifications                                                               |
| ------------------------------------------ | --------------------------: | -------------------------: | ------------------------------------------------------------------------------------ |
| System and composition                     |                          39 |                        117 | `operations-overview`, `function-deck`, `tabs`                                       |
| Foundations, layout, and media             |                          40 |                        120 | `foundations`, `layout`, `media`                                                     |
| Phase 1 primitives retained by Phase 2     |                          25 |                         75 | `theme-provider`, `structural-primitives`, `semantic-displays`, `phase-1-validation` |
| Controls and forms                         |                          53 |                        159 | `core-controls`, `menu-commands`, `form-foundation`, `form-controls`                 |
| Feedback and confirmation                  |                          50 |                        150 | `persistent-feedback`, `transient-feedback`, `confirmation-dialog`                   |
| Modal content and media inspection         |                          24 |                         72 | `content-dialog`, `media-viewer`                                                     |
| Framework parity and accessibility harness |                          18 |                         54 | `framework-examples`, `react-wrappers`, `accessibility`                              |
| **Total**                                  |                     **249** |                    **747** | **22 specification files**                                                           |

The matrix covers side-effect-free imports and useful pre-upgrade content as well as registered
behavior. This keeps the accepted client-only fallback and explicit registration model inside the
closeout gate instead of validating only the fully upgraded presentation.

## Reproduce

From a clean checkout with dependencies and Playwright browsers installed:

```bash
pnpm check
pnpm test:browser
```

`pnpm test:browser` starts the repository fixture server and runs the full suite in the configured
Chromium, Firefox, and WebKit projects. The first Phase 2F closeout run passed 746 of 747 cases and
exposed a temporary low-contrast state when WebKit sampled a dark dialog during its opacity entry
animation. Modal entry motion was changed to position-only, an opacity regression assertion was
added, and the authoritative rerun completed all 747 cases in 2.1 minutes with five workers.

## Remaining release gates

The matrix closes Phase 2 automated, responsive, visual-state, framework, and supported-engine
validation. It does not close the carried VoiceOver/Safari, NVDA/Firefox, real-profile autofill,
password-manager, or mobile support-claim gates. Those require the manual evidence format and exit
criteria in the assistive-technology ledger before the corresponding release or support claim.
