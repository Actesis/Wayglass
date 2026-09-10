# Phase 6D-D stage 2 independent response oracle

**Status:** Acceptance candidate completed on September 10, 2026, after project-owner acceptance and
merge of the deployment-metadata implementation in PR #270.

## Implemented boundary

The private, framework-neutral site composer now owns an independent local model of the frozen
Cloudflare Static Assets contract. `pnpm site:check-responses -- --input <verified-site>` first runs
the byte-exact artifact verifier, parses `_headers` without Wrangler, rejects unsafe or unsupported
metadata, and then resolves requests from the manifest-backed file set. Imports remain side-effect
free and no dependency was added.

The oracle models exact assets, `auto-trailing-slash` HTML handling, `404-page` fallback, query-safe
`307` redirects, GET and HEAD, derived MIME types, Cloudflare's default revalidation cache policy,
authored immutable overrides, overlapping `_headers` rules, common security headers, Storybook
`noindex`, and versioned or aliased `workers.dev` preview `noindex, nofollow`. It fails closed on
altered artifacts, malformed rules, unsupported methods, unsafe percent-encoded separators, unknown
MIME types, unversioned files in immutable namespaces, missing proof assets, false-success routes,
or a 404 document equal to the documentation shell.

## Cache-rule correction

Stage 1 placed revalidation and immutable `Cache-Control` values in overlapping authored rules.
Cloudflare joins duplicate header values from every matching `_headers` rule; it does not treat the
narrow rule as a conventional override. The corrected metadata therefore relies on Cloudflare's
documented `public, max-age=0, must-revalidate` default and authors only the two immutable
overrides. The oracle rejects a future global `Cache-Control` rule so this conflict cannot silently
return.

## Focused evidence

The site-composer typecheck and suite pass with 14 test files and 131 tests. The focused matrix
covers:

- root, clean-file, directory-index, Storybook manager, preview, missing-asset, and unknown-prefix
  routes for both GET and HEAD;
- canonical redirects with query preservation and no terminal-response headers or body;
- HTML, JavaScript, CSS, JSON, SVG, JPEG, and WOFF2 content types;
- revalidation and immutable cache classes, the public root manifest, common security headers, CSP
  restrictions, production indexing, Storybook `noindex`, and preview `noindex, nofollow`;
- overlapping header values, malformed metadata, rule and line bounds, unversioned immutable files,
  encoded separators, malformed percent encoding, and unsupported methods; and
- production canonical URL presence plus a real branded-404 asset distinct from `index.html`.

Linting and formatting pass. The complete repository check remains the final branch gate after this
record is added.

## Clean composed-artifact proof

`pnpm site:build` ran from clean implementation commit `479116c00faf73e7a76ef7e865f10edb5ea7fae2`
and tree `e09b361ce0fe59ebaa5cd930e0655282149ddb50` with lockfile SHA-256
`bdb6b4e916bd5fa2330fc3dd3f272814c6940ec04dab78b437b7007be386a525`. The independent response checker
then passed against that exact verified output:

| Evidence          | Exact result                                                       |
| ----------------- | ------------------------------------------------------------------ |
| Bundle SHA-256    | `69399fc891ca47bbb911e61c5c1934ba48ca3cc0a3fd55e61c421bdc76b1bab7` |
| Manifest SHA-256  | `0866ecaf61f0e287f52c5b5afa7cc1ee7698a154dad7973f0bd8a7459937b803` |
| Documentation     | 589 files; 27,719,876 bytes                                        |
| Storybook         | 133 files; 9,226,992 bytes                                         |
| Surface total     | 722 files; 36,946,868 bytes, plus the root manifest                |
| Build environment | Node `26.8.1`; pnpm `11.9.0`; `darwin`; `arm64`                    |

## Deliberate limitation and next authority

This is an independent contract oracle, not a claim of exact Cloudflare runtime parity. VitePress's
static `404.html` is a hydration shell: static response checking proves the real 404 asset and
status without falsely claiming its runtime-rendered text and links. The next Phase 6D-D stage is
the local server and Chromium proof of both surfaces, CSP enforcement, recovery links, navigation,
asset loading, absence of external runtime requests, responsive and forced-color behavior, and the
hydrated branded 404. Phase 6D-E will later compare the accepted oracle with credential-free local
Wrangler behavior.

Acceptance authorizes that composed browser-proof stage only. It does not authorize Wrangler
installation or configuration, Cloudflare or GitHub connection, preview upload, production
deployment, custom-domain attachment, DNS mutation, credentials, repository visibility changes,
analytics, npm publication, or SpaceTraders work.
