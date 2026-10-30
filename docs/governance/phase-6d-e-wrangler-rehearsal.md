# Phase 6D-E Wrangler configuration and local rehearsal

**Status:** Accepted by the project owner and merged in PR #273 on October 25, 2026, after
project-owner acceptance and merge of the Phase 6D-D composed browser proof in PR #272.

## Implemented boundary

The repository now pins the previously accepted exact `wrangler@4.128.0` development dependency and
contains a private, provider-specific delivery checker under `tooling/cloudflare-delivery`. Wrangler
remains outside the framework-neutral site composer. No package is published, no Worker is uploaded,
and no Cloudflare or GitHub resource is read or changed by this implementation.

The checked-in `wrangler.jsonc` describes one Static Assets Worker named `wayglass-docs`. It enables
`workers.dev` and preview URLs for the later preview gate, disables Wrangler metrics and dependency
instrumentation, selects `auto-trailing-slash` HTML handling and `404-page` not-found handling, and
contains no account identifier, route, Custom Domain, secret, variable, binding, Worker script, or
production promotion command.

The compatibility date is `2026-09-07`, the newest date accepted by the `workerd` runtime pinned
through the reviewed Wrangler lockfile. It is deliberately not advanced beyond the installed
runtime's support. A future Wrangler update must review and advance this date through its own
dependency and compatibility proof.

## Fail-closed asset selection

The checked-in configuration deliberately omits `assets.directory`. A bare `wrangler deploy`,
including a dry run, therefore cannot select a stale or unverified repository directory. The local
rehearsal first runs the independent manifest verifier and injects only that verified, absolute
temporary directory into an in-memory configuration and Wrangler's explicit `--assets` argument.

The delivery checker accepts a closed set of exact configuration keys and values, verifies both the
declared and installed Wrangler versions, removes Cloudflare credential variables from the dry-run
environment, disables metrics, uses an owned temporary output directory, and removes that directory
on either success or failure. Imports do not execute the rehearsal as a side effect.

There is no Worker script, runtime code, binding, or hand-written `Env` interface in this
architecture. Consequently `nodejs_compat`, source maps, observability configuration, and generated
binding types do not apply to this artifact-only Static Assets configuration. The Wrangler schema,
closed configuration parser, credential-free dry run, and local runtime harness validate the
configuration that does exist.

## Credential-free response rehearsal

The single `pnpm site:wrangler:check -- --input <verified-site>` command:

1. verifies the composed artifact and its manifest before invoking Wrangler;
2. runs `wrangler deploy --dry-run` with no Cloudflare credential environment;
3. starts Wrangler's current `createTestHarness` against an in-memory configuration containing only
   the independently verified asset directory;
4. compares 15 representative routes under both GET and HEAD with the accepted independent response
   oracle, for 30 exact status, body, canonical-location, and terminal-header comparisons;
5. verifies that POST remains rejected with `405 Method Not Allowed`; and
6. closes the harness and removes its temporary dry-run output on success or failure.

The route set covers documentation and Storybook entry points, clean-file and directory
canonicalization, query preservation, the Storybook preview document, missing paths in both
surfaces, an unknown prefix, and the root site manifest.

## Retained local-runtime differences

The rehearsal records two narrow differences rather than weakening the accepted production contract:

| Local Wrangler result                                             | Accepted production contract                                                                                                                 | Required Phase 6D-F check                                                                       |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Canonical `307` responses include custom `_headers`.              | Cloudflare documents canonicalization before `_headers`; redirects are required only to preserve status, location, query, and an empty body. | Observe representative version-preview redirects and retain the documented edge behavior.       |
| Rejected POST returns `405` with an empty body but omits `Allow`. | The local independent server includes `Allow: GET, HEAD`; the public contract's core requirement is method rejection.                        | Record the exact version-preview method response without claiming local-emulator header parity. |

These quarantined emulator differences do not justify a Worker script. Host-specific
`X-Robots-Tag: noindex, nofollow` behavior also cannot be established from a loopback host; the
Phase 6D-F immutable version preview must prove it at the real `workers.dev` host before preview
acceptance.

## Clean composed-artifact proof

The final rehearsal consumed an artifact rebuilt from clean implementation commit
`aadb0bf82f64a5a4e2ef322aed636ce3d7e7ea74`, tree `26951463fb82a8e98174e437ef780eca6fd83246`, and
lockfile SHA-256 `4d99210871dbe5b6bb69a43d67d16edab155e1db55c99cade231986ce2cb5d60`.

| Evidence          | Exact result                                                       |
| ----------------- | ------------------------------------------------------------------ |
| Bundle SHA-256    | `36587495199bff85019af53f6a3ec72c65d5efcc29df211edc82feb76e28a122` |
| Manifest SHA-256  | `3996ac5e29cba52de7146f311a5b156be43873ea9f3b73d7e45e8603eed1c032` |
| Documentation     | 595 files; 28,173,080 bytes                                        |
| Storybook         | 133 files; 9,226,992 bytes                                         |
| Surface total     | 728 files; 37,400,072 bytes, plus the root manifest                |
| Build environment | Node `26.8.1`; pnpm `11.9.0`; `darwin`; `arm64`                    |

The rehearsal reported 30 matching GET and HEAD responses and the two explicitly retained local
differences above. The focused delivery-tool check passes with 2 test files and 6 tests. The
complete repository quality gate also passes.

## Acceptance effect and next authority

Acceptance completes Phase 6D-E and authorizes preparation of the Phase 6D-F preview and rollback
execution record. It does not itself authorize a Version upload. Phase 6D-F still requires fresh,
explicit project-owner authorization before using credentials, connecting an account or repository,
or creating or changing any Cloudflare resource.

Acceptance does not authorize production deployment, custom-domain attachment, DNS mutation, GitHub
integration, repository visibility changes, analytics, npm publication, or SpaceTraders work. The
exact clean artifact, preview target, access scope, version identity, edge response proof, and
rollback operation remain independently reviewable Phase 6D-F evidence.
