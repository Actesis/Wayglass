# Phase 6C-D2 Vanilla consumer implementation

**Status:** Proposed for project-owner acceptance on September 5, 2026. This record covers the two
private Vanilla compiler fixtures and their offline probe runner authorized by the accepted Phase
6C-D1 harness. It does not claim that an integrated candidate passed, retain a candidate or consumer
project, authorize Phase 6C-D3, contact or publish to npm, remove package privacy, use credentials,
create a tag or release, change repository visibility, deploy, or build an external application.

## Implemented matrix

The runner executes the same domain-neutral Vanilla fixture twice: once with exact TypeScript
`5.9.3` and once with exact TypeScript `6.0.3`. Each generated project receives only the verified
core, tokens, themes, elements, and icons tarballs selected by the accepted D1 harness. Vite remains
exact at `8.1.5`; the generated manifest remains private, ESM, script-free, and free of workspace
protocols.

The fixture checks declarations from every package root plus accepted JavaScript and CSS subpaths.
Its production entry imports only the core root, Boolean-value and toggle element subpaths, token
CSS, theme CSS, and element foundation CSS. This deliberately keeps the broad elements root and
icons package out of the runtime graph while still checking their public declarations.

## Browser-ready runtime fixture

The authored page fails if importing the selected element subpaths registers either Custom Element.
It then calls the two explicit registration functions, renders a representative Boolean value and
toggle, waits for both Lit updates, and exercises the toggle's keyboard-equivalent request path. The
self-check verifies the adapted request detail and retained confirmed state before exposing the
`WG_VANILLA_PROBE_READY` marker.

The fixture also proves that Boolean assertion is not a health condition: `asserted` is checked
separately from the simultaneous `critical` condition, `stale` knowledge, and `pending` activity
values. The page and emitted markers are ready for trusted pointer, keyboard, rendered semantics,
and cross-browser execution in Phase 6C-D4; this D2 record does not claim those later browser
results.

## Build, CSS, tree-shaking, and removal

For each compiler line, the probe runner:

1. performs declaration checking with the project's exact local TypeScript;
2. creates a Vite production build;
3. requires emitted HTML, JavaScript, and CSS as regular non-symlink files;
4. verifies the registration, interaction, and separate-state-axis fixture markers in the emitted
   JavaScript;
5. verifies emitted token, theme, density, and component-foundation CSS markers;
6. rejects bundled `wg-media-viewer` and `wg-icon` runtime markers;
7. removes the declaration-only source and the sole compile-only direct package, `@wayglass/icons`,
   using offline mode with lifecycle scripts disabled;
8. verifies that icons are absent from both the generated manifest and installation; and
9. repeats declaration checking, production building, CSS inspection, and unused-code inspection.

Core, tokens, themes, and elements remain because the production fixture uses them. Icons is the
only unused runtime package, so removing it is the complete unused-direct-package proof rather than
an artificial removal of a required dependency.

The command is
`pnpm release-candidate:probe:vanilla -- --evidence <absolute-path> --store <absolute-path>`. It
rejects recognized credentials, accepts only verified evidence and an existing absolute store, uses
fresh operating-system temporary projects, installs and removes offline with scripts disabled, and
deletes each project on every exit. It cannot contact a registry to fill missing material.

## Retained validation and execution boundary

Focused tests cover both exact compiler scenarios, root and subpath declarations, CSS imports,
import-time registration guards, explicit registration, interaction detail, orthogonal semantic
axes, command order, emitted-output requirements, unused-code rejection, package removal, rebuild,
fresh-project orchestration, cleanup, and rejection of React or invented scenarios. The focused
release-candidate suite passes 56 assertions across 11 files with TypeScript and ESLint checks.

The complete offline repository gate also passes against the final implementation: formatting and
repository lint; all 14 scheduled builds; 58 icon-tooling, 93 token-tooling, 56 release-candidate,
and 24 visualization assertions; all 20 scheduled typecheck tasks; and all 20 scheduled package and
application test tasks, including 237 documentation assertions. Only the repository's existing
informational Storybook chunk-size and Lit development-mode warnings were emitted.

No candidate was assembled or retained for this implementation review. The current local offline
store contains TypeScript `6.0.3` but not `5.9.3`; no registry contact was attempted to change that
state. Phase 6C-D5 remains responsible for the ephemeral integrated rehearsal of the accepted D
matrix, while Phase 6C-E remains solely responsible for retained authoritative candidate evidence.
This implementation adds no dependency, lockfile change, source-package change, or public runtime
export.

## Acceptance effect

Acceptance completes Phase 6C-D2 and authorizes Phase 6C-D3 React consumer implementation only. It
does not accept a Vanilla or React result, candidate, tarball, hash, retained evidence run,
publication readiness, package privacy change, npm or registry access, credential use, tag, release,
repository visibility change, deployment, or external application work.
