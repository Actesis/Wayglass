# Phase 6C-D3 React consumer implementation

**Status:** Proposed for project-owner acceptance on September 5, 2026. This record covers the four
private React/TypeScript fixtures and their offline probe runner authorized by the accepted Phase
6C-D2 implementation. It does not claim that an integrated candidate or browser matrix passed,
retain a candidate or consumer project, authorize Phase 6C-D4, contact or publish to npm, remove
package privacy, use credentials, create a tag or release, change repository visibility, deploy, or
build an external application.

## Exact cross-product

The runner executes four domain-neutral projects: exact TypeScript `5.9.3` and `6.0.3`, each crossed
with React and React DOM `19.0.0` and current `19.2.8`. The minimum line uses React and React DOM
type packages `19.0.0`; the current line uses React types `19.2.17` and React DOM types `19.2.3`.
Vite remains exact at `8.1.5`.

Each project receives only verified core, tokens, themes, elements, and React-binding tarballs. The
generated manifest is private, ESM, script-free, contains no workspace protocol, and holds the exact
framework, type, compiler, and build versions for that scenario.

## Client-only and registration boundary

The accepted v1 contract provides a client-only fallback rather than server rendering. The fixture
therefore detects and clears its static loading placeholder before calling React `createRoot`; it
does not call `hydrateRoot`, claim SSR, or treat replacement of server markup as hydration. This is
the narrow hydration-safe behavior accepted for v1: pre-existing fallback content is discarded
deliberately before client ownership begins.

The production entry imports only the `@wayglass/react/toggle` wrapper. Its initial guard requires
that `wg-toggle` was registered by that retained wrapper and that the unrelated direct
`wg-boolean-value` element was not registered. It then explicitly registers only the direct Boolean
element. Broad React and elements root imports remain declaration-only, so they cannot widen the
runtime registration or bundle surface.

## Parity, events, and browser-ready assertions

The fixture renders a typed React toggle and a direct toggle element with the same label, confirmed
Boolean state, and asserted/not-asserted labels. After both elements update, it compares their
properties, invokes the wrapper, and requires the typed `onWgToggleRequest` adapter to preserve the
requested and confirmed values in the Custom Event detail. Only then does it expose the
`WG_REACT_CLIENT_FALLBACK_READY` marker.

These assertions are emitted into the production bundle for trusted pointer, keyboard, rendering,
semantics, and cross-browser execution in Phase 6C-D4. This implementation record does not claim
those later Chromium, Firefox, or WebKit results.

## Build, tree-shaking, and complete binding removal

For each cross-product scenario, the runner declaration-checks and production-builds the project,
requires regular emitted HTML, JavaScript, and CSS, verifies token/theme/density/component CSS, and
requires the client-fallback, guarded-registration, parity, and event-adaptation markers. It rejects
unused `wg-media-viewer` and `wg-tabs` wrapper markers in the JavaScript bundle.

The runner then removes the declaration-only root-import source and replaces the React entry with a
direct Boolean-element entry. It removes `@wayglass/react`, `react`, `react-dom`, `@types/react`,
and `@types/react-dom` offline with lifecycle scripts disabled, verifies that all five are absent
from the generated manifest and installation, and repeats declaration checking, production building,
CSS inspection, and React-marker rejection. The surviving direct entry explicitly registers,
renders, and awaits the element before emitting `WG_REACT_BINDING_REMOVED`.

The command is
`pnpm release-candidate:probe:react -- --evidence <absolute-path> --store <absolute-path>`. It
rejects recognized credentials, accepts only verified evidence and an existing absolute store, runs
every scenario in a fresh operating-system temporary project, remains offline with scripts disabled,
and deletes each project on every exit.

## Retained validation and execution boundary

Focused tests cover all four exact scenarios, root and subpath declarations, the client-only
fallback, wrapper-scoped and explicit registration, wrapper/direct parity, typed event adaptation,
CSS imports and output, unused-wrapper rejection, complete framework and binding removal, the
direct-element rebuild, fresh-project orchestration, cleanup, and rejection of Vanilla or invented
scenarios. The focused release-candidate suite passes 64 assertions across 13 files with TypeScript
and ESLint checks.

The complete offline repository gate also passes against the final implementation: formatting and
repository lint; all 14 scheduled builds; 58 icon-tooling, 93 token-tooling, 64 release-candidate,
and 24 visualization assertions; all 20 scheduled typecheck tasks; and all 20 scheduled package and
application test tasks, including 242 documentation assertions. Only the repository's existing
informational Storybook chunk-size and Lit development-mode warnings were emitted.

No candidate or consumer result was assembled or retained for this implementation review. The
current local offline material contains only TypeScript `6.0.3`, React and React DOM `19.2.8`, React
types `19.2.17`, and React DOM types `19.2.3`; the minimum compiler and React lines are absent. No
registry contact was attempted. Phase 6C-D5 remains responsible for the ephemeral integrated
rehearsal after accepted offline material is available, while Phase 6C-E alone retains authoritative
candidate evidence. This implementation adds no dependency, lockfile change, source-package change,
or public runtime export.

## Acceptance effect

Acceptance completes Phase 6C-D3 and authorizes Phase 6C-D4 cross-browser consumer proof only. It
does not accept a Vanilla, React, or browser result, candidate, tarball, hash, retained evidence
run, publication readiness, package privacy change, npm or registry access, credential use, tag,
release, repository visibility change, deployment, or external application work.
