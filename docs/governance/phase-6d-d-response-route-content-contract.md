# Phase 6D-D response, route, and content contract

**Status:** Accepted by the project owner and merged in PR #269 on September 10, 2026. Deployment
metadata was accepted and merged in PR #270. The independent local response oracle is complete as an
accepted implementation in PR #271; the composed browser proof is complete as an acceptance
candidate.

## Architecture disposition

The initial documentation deployment remains a static-site-generation application. Exact assets are
served before any custom logic, `not_found_handling` is `404-page`, and `html_handling` is
`auto-trailing-slash`. There is no global single-page-application fallback, admitted walkthrough,
dynamic API, analytics endpoint, or Worker script. `run_worker_first` therefore remains omitted.

Cloudflare's current Static Assets behavior can express the complete initial contract. In
particular, `_headers` accepts combined host and path rules, including placeholders for versioned
preview hosts. Preview `noindex` therefore does not justify a Worker script or a second artifact.
The later Phase 6D-E configuration must point only at an independently verified composed directory.

## Canonical route matrix

Only `GET` and `HEAD` are admitted public read methods. Query strings do not change asset identity,
canonical path, cache class, or response policy.

| Request example                     | Required result                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| `/`                                 | `200`; root `index.html`                                                        |
| `/phase-6`                          | `200`; clean URL for `phase-6.html`                                             |
| `/phase-6.html` or `/phase-6/`      | `307` to `/phase-6`                                                             |
| `/foundations/`                     | `200`; `foundations/index.html`                                                 |
| `/foundations`                      | `307` to `/foundations/`                                                        |
| `/foundations/index.html`           | `307` to `/foundations/`                                                        |
| `/storybook/`                       | `200`; Storybook manager                                                        |
| `/storybook` or `/storybook/index`  | `307` to `/storybook/`                                                          |
| `/storybook/index.html`             | `307` to `/storybook/`                                                          |
| `/storybook/iframe`                 | `200`; clean URL for the preview document, preserving its query                 |
| `/storybook/iframe.html?<query>`    | `307` to `/storybook/iframe?<same-query>`                                       |
| missing documentation or asset      | `404`; nearest branded `404.html`, never `index.html`                           |
| missing `/storybook/` path or asset | `404`; nearest branded `404.html`, never the manager or documentation home page |
| unknown prefix                      | `404`; nearest branded `404.html`, never another surface                        |

Redirect locations are same-origin absolute paths and preserve the request query. Redirects never
change a missing route into a successful shell response. The route proof covers both `GET` and
`HEAD`, direct navigation, manager and preview queries, percent-encoded input, dot segments as
normalized by the URL implementation, and representative HTML, JavaScript, CSS, JSON, image, SVG,
and font assets.

## Not-found content

The root `404.html` is the sole initial error document and is served with status `404`. It
identifies Wayglass, says that the requested page was not found, and offers explicit links to
documentation home and Storybook. It contains no automatic redirect, search form, telemetry, remote
asset, or claim that the missing path is a valid application route. Keyboard navigation, focus
visibility, zoom, narrow viewport, and forced-color behavior must remain usable.

## Cache classes

| Class                                      | Required `Cache-Control`              |
| ------------------------------------------ | ------------------------------------- |
| `/assets/*` and `/storybook/assets/*`      | `public, max-age=31536000, immutable` |
| HTML, redirects, 404s, root site manifest  | `public, max-age=0, must-revalidate`  |
| Storybook manager/add-on files and indexes | `public, max-age=0, must-revalidate`  |
| Other non-fingerprinted static files       | `public, max-age=0, must-revalidate`  |

The immutable rules are allowed only because both named asset directories contain producer-owned
content-hashed filenames. A generated-output check must reject an unversioned file in either
immutable namespace. Cloudflare-supplied `ETag` remains the revalidation mechanism;
`CF-Cache-Status` is observational and never a correctness signal. Rollback must not require purging
an immutable URL.

## Response headers

Every terminal static-asset and branded-404 response receives:

- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()`;
- a tested `Content-Security-Policy`; and
- an explicit same-origin framing policy.

Cloudflare applies canonical redirects before `_headers`, so generated `307` responses are validated
for status, location, query preservation, and absence of a body rather than falsely claiming the
terminal response's custom security or cache headers.

Wrangler-derived `Content-Type` values must agree with the requested representation. HTML is
`text/html; charset=utf-8`; JavaScript, CSS, JSON, SVG, common raster images, and WOFF2 receive
their correct MIME families. `nosniff` is never removed to conceal a type mismatch.

All terminal responses use `X-Frame-Options: SAMEORIGIN` and CSP `frame-ancestors 'self'`. This one
non-overlapping `_headers` policy permits the Storybook manager and preview to frame one another but
does not permit cross-origin framing. It also avoids duplicate CSP or framing headers: Cloudflare
joins duplicate values from overlapping rules rather than treating a narrower path rule as an
override.

The initial CSP defaults to self-only loading, blocks plugins, limits base URLs and form submission,
and allows only the producer behavior proven necessary by a production build. Inline styles and
scripts may be admitted when generated by VitePress or Storybook and verified in the local browser
matrix; `unsafe-eval`, wildcard network sources, external script origins, and remote frames remain
blocked unless a later evidence-backed contract revision explicitly admits them. Documentation may
load same-origin frames but does not embed Storybook as normative content. Storybook may frame only
same-origin manager or preview documents.

## Canonical and indexing policy

Production documentation pages emit one absolute canonical URL beneath
`https://wayglass.hoagsoftworks.com`, derived from their accepted clean route. The production root
publishes a `robots.txt` that permits documentation crawling. Storybook is public inspection
material but non-normative, so its responses use `X-Robots-Tag: noindex` and do not compete with the
documentation in search results.

Every versioned or aliased `workers.dev` preview response additionally receives
`X-Robots-Tag: noindex, nofollow` through the host rule `https://:version.:subdomain.workers.dev/*`.
That rule applies to the same immutable artifact and does not depend on runtime host detection.
Preview HTML must not claim the production origin as its own current location; canonical links
remain production references, not preview-indexing permission.

## Local proof and retained implementation boundary

Phase 6D-D implementation will add deterministic deployment metadata and a framework-neutral local
response emulator/checker without importing Wrangler. The checker consumes an independently verified
composed artifact, applies the frozen Static Assets route and header model, and runs the complete
route, method, MIME, cache, security, canonical, link, asset, indexing, and 404 matrix. A Chromium
proof then enforces the CSP and validates both surfaces and the branded 404. The implementation must
fail closed on malformed rules, unversioned immutable assets, missing headers, false-success routes,
external runtime requests, or artifact changes.

Phase 6D-E will install the already accepted exact Wrangler version, add minimal configuration, and
compare the credential-free local Wrangler behavior with this independent oracle. A Cloudflare
preview remains separately authorized Phase 6D-F work.

## Current platform basis

This proposal rechecked current Cloudflare documentation on September 9, 2026:

- [Static Assets SSG and custom 404 behavior](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
  documents nearest-`404.html` responses with real `404` status;
- [HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)
  defines the selected clean-file and directory-index redirects;
- [Static Assets headers](https://developers.cloudflare.com/workers/static-assets/headers/)
  documents `_headers`, overlapping host/path rules, preview-host placeholders, cache overrides,
  MIME defaults, and security headers; and
- [Preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/)
  distinguishes immutable versioned preview URLs from production deployment.

Cloudflare behavior will be checked again against the installed `wrangler@4.128.0` schema and local
runtime in Phase 6D-E. Dated documentation is evidence for this contract, not a permanent platform
guarantee.

## Acceptance effect

Acceptance freezes the Phase 6D-D behavior and authorizes its deterministic metadata, independent
local emulator/checker, composed-artifact matrix, and browser validation only. It does not authorize
Wrangler installation or configuration, Cloudflare or GitHub connection, preview upload, production
deployment, custom-domain attachment, DNS mutation, credentials, repository visibility changes,
analytics, npm publication, or SpaceTraders work.
