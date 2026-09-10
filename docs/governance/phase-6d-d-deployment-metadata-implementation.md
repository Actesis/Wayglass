# Phase 6D-D stage 1 deployment metadata implementation

**Status:** Accepted by the project owner and merged in PR #270 on September 10, 2026.

## Implemented boundary

The VitePress producer now owns the initial deployment metadata and production content required by
the accepted contract:

- `_headers` supplies one common security policy, narrow immutable rules for the two fingerprinted
  asset namespaces, Storybook `noindex`, and versioned or aliased `workers.dev` preview
  `noindex, nofollow`;
- `robots.txt` permits production documentation crawling and names the canonical sitemap;
- VitePress generates the sitemap for `https://wayglass.hoagsoftworks.com`;
- every documentation page except the error document receives one route-derived absolute canonical
  URL; and
- a Wayglass-specific not-found component identifies the missing route and offers keyboard-visible
  links to documentation home and Storybook without an automatic redirect.

The shared policy uses `X-Frame-Options: SAMEORIGIN` and CSP `frame-ancestors 'self'`, allowing the
Storybook manager and preview to frame one another without cross-origin framing. It admits the
producer-required inline script and style behavior but does not admit `unsafe-eval`, external script
origins, wildcard network origins, remote frames, forms, plugins, analytics, cookies, or telemetry.
Every intentional CSS value in the error surface uses VitePress semantic variables or documented
typographic and mechanical layout constants, and all layout properties are logical.

The `.vue` module declaration is private documentation compiler plumbing made necessary by the first
local VitePress single-file components. It adds no dependency and changes no public Wayglass
package.

## Focused evidence

The documentation typecheck passes. The documentation suite passes 347 tests across 53 files,
including canonical route derivation, exact host and path policies, preview and Storybook indexing,
absence of `unsafe-eval`, Cloudflare line limits, byte-exact robots metadata, useful error links,
focus visibility, forced-color support, and absence of scripted redirection. The production
VitePress build passes and generates its sitemap. Linting and formatting pass.

Generated-output inspection proves:

- the source and built `_headers` SHA-256 are both
  `a90984fc3c13675891fb54c09c31f5398bbf3759e7ac4eb3af7902255a02a63b`;
- the source and built `robots.txt` SHA-256 are both
  `6d96598ab286a2b25009ef356f78fa6afa293c2a5ae9579a8e0b8c0e5b830e7f`;
- the root and representative leaf documentation pages contain the correct absolute canonical URL,
  while `404.html` has no canonical URL; and
- every file recursively contained by `/assets/` and `/storybook/assets/` has a producer-generated
  content fingerprint in its filename.

## Clean composed-artifact proof

`pnpm site:build` ran from clean implementation commit `390fa71` and tree
`81f2f5df97ae7245087d41b6f943d3e13b39aa9f` with lockfile SHA-256
`bdb6b4e916bd5fa2330fc3dd3f272814c6940ec04dab78b437b7007be386a525`. The independently verified
result contains the exact deployment metadata, sitemap, canonical documents, error document,
Storybook manager, and Storybook preview:

| Evidence          | Exact result                                                       |
| ----------------- | ------------------------------------------------------------------ |
| Bundle SHA-256    | `05060f8a41f329cab8142e051146b6f34e93fdf2e20be1d7a724fea184b8fc2a` |
| Manifest SHA-256  | `444c35d1c524095e44a047ddd159a16a20851d920c91926ff2846a4ed8d50c5f` |
| Documentation     | 586 files; 27,486,258 bytes                                        |
| Storybook         | 133 files; 9,226,992 bytes                                         |
| Surface total     | 719 files; 36,713,250 bytes, plus the root manifest                |
| Build environment | Node `26.8.1`; pnpm `11.9.0`; `darwin`; `arm64`                    |

This stage intentionally does not claim HTTP status, redirect, MIME, applied-header, CSP runtime, or
browser behavior from file inspection alone. The independent response emulator/checker and its
complete matrix are the next Phase 6D-D stage; the composed browser proof follows that oracle.

The response-oracle implementation subsequently removed `Cache-Control` from the overlapping global
rule. Cloudflare combines duplicate headers from every matching authored rule, so the immutable
asset rules must override Cloudflare's default revalidation policy rather than combine with an
authored global cache value. The original clean-artifact hashes above remain the historical evidence
for this accepted stage; the corrected artifact has its own response-oracle evidence.

## Authority boundary

Acceptance completes Phase 6D-D stage 1 and authorizes the framework-neutral independent local
response emulator/checker and its focused tests only. It does not authorize Wrangler installation or
configuration, Cloudflare or GitHub connection, preview upload, production deployment, custom-domain
attachment, DNS mutation, credentials, repository visibility changes, analytics, npm publication, or
SpaceTraders work.
