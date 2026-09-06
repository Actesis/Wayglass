# Phase 6C-D4 cross-browser consumer implementation

**Status:** Proposed for project-owner acceptance on September 6, 2026. This record covers the
private Chromium, Firefox, and WebKit execution layer authorized by the accepted Phase 6C-D3
implementation. It does not claim that an integrated candidate, browser matrix, or consumer version
matrix passed; authorize Phase 6C-D5; contact or publish to npm; remove package privacy; use
credentials; create a tag or release; change repository visibility; deploy; or build an external
application.

## Exact browser matrix

The browser runner composes the already-reviewed D2 Vanilla and D3 React build probes rather than
creating another consumer implementation. Each verified production build is exercised in Chromium,
Firefox, and WebKit at two explicit stages:

1. the primary build, after declaration checking, bundling, and static-output inspection; and
2. the removal build, after unused-package or complete React-binding removal, another declaration
   check, and another production build and inspection.

The two Vanilla compiler scenarios therefore define 12 browser cases. The four React/compiler
scenarios define 24 browser cases. A complete D4 invocation contains exactly 36 cases, all of which
must pass without retry before the invocation succeeds.

## Isolated loopback delivery

Each ephemeral consumer project owns its own production `dist` directory. The runner starts an
ephemeral HTTP server bound only to `127.0.0.1` on an operating-system-selected port, disables
caching, serves only regular files below that exact `dist` root, rejects path escape and symlinks,
and closes the server after each build stage on success or failure. Browsers never receive a
workspace source path, frozen worktree path, Vite development server, registry URL, or external
network target.

Every engine launches in a fresh browser and context. Registration state, module caches, React
ownership, and page state therefore cannot leak from a primary build into a removal build or from
one browser engine into another.

## Runtime, semantic, interaction, and accessibility assertions

The Vanilla path requires the ready marker, explicit registration of only the retained Boolean and
toggle elements, absence of an unused media-viewer registration, and a rendered switch with the
expected accessible label and confirmed `aria-checked="false"` state. It separately requires the
condition `critical`, knowledge `stale`, activity `pending`, and Boolean value `asserted`, proving
that those axes were not collapsed. A browser-trusted pointer activation must emit a request whose
trigger remains `pointer`.

The primary React path requires the static client-only fallback to be gone before readiness,
wrapper-scoped toggle registration, explicit direct Boolean registration, and absence of unused
media-viewer registration. It compares the rendered wrapper and direct-element switch semantics,
then requires a browser-trusted wrapper activation to reach the typed React event callback with a
`pointer` trigger.

The React-removal path uses a new page realm and requires the direct Boolean element to render and
remain asserted while `wg-toggle`, the React ready marker, and all React ownership remain absent.
This is removal evidence, not a claim that React or server rendering is optional inside an
application that still imports the binding.

Every case rejects page errors and runs Axe against the final rendered document. These are automated
semantic and accessibility checks only. They do not create a new human screen-reader,
physical-device, embedded-runtime, provider, touch-hardware, or server-rendering claim.

## Command and dependency boundary

The private command is
`pnpm release-candidate:probe:browsers -- --evidence <absolute-path> --store <absolute-path>`. It
uses the repository's existing Playwright `1.62.0` and Axe Playwright `4.12.1` development
dependencies; no dependency or lockfile change is introduced. The command inherits the D1 credential
rejection, verified-evidence, absolute-store, offline-install, lifecycle-disabled,
temporary-project, and cleanup boundaries.

An unavailable browser executable is an unsupported-environment result, not permission to install
software or contact a network. A failed engine stops that build stage and is never recorded as a
pass. Phase 6C-E remains responsible for normalized browser versions, commands, failures, retries,
and final evidence retention.

## Retained validation and execution boundary

Focused tests cover both runtime callback stages, all three engine identities, per-case result
recording, fail-fast behavior, loopback URL construction, built-asset content types, path-escape
rejection, regular output lookup, and the unchanged Vanilla and React removal sequences. The focused
release-candidate suite passes 67 assertions across 14 files with TypeScript and ESLint checks.

The complete offline repository gate also passes against the final implementation: formatting and
repository lint; all 14 scheduled builds; 58 icon-tooling, 93 token-tooling, 67 release-candidate,
and 24 visualization assertions; all 20 scheduled typecheck tasks; and all 20 scheduled package and
application test tasks, including 246 documentation assertions. Only the repository's existing
informational Storybook chunk-size and Lit development-mode warnings were emitted.

No candidate or browser result was assembled or retained for this implementation review. The local
offline store still lacks the accepted TypeScript `5.9.3` and React `19.0.0` material required for
the complete version cross-product, and no registry contact was attempted. Phase 6C-D5 owns the
ephemeral integrated rehearsal after that material is available; Phase 6C-E alone owns the
authoritative retained candidate record.

## Acceptance effect

Acceptance completes Phase 6C-D4 and authorizes Phase 6C-D5 integrated ephemeral rehearsal only. It
does not accept a Vanilla, React, browser, candidate, tarball, hash, or retained evidence result;
publication readiness; package privacy changes; npm or registry access; credential use; tags;
releases; repository visibility changes; deployment; or external application work.
