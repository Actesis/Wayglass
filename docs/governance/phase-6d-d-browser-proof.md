# Phase 6D-D composed browser proof

**Status:** Accepted by the project owner and merged in PR #272 on September 11, 2026, after
project-owner acceptance and merge of the independent response oracle in PR #271.

## Implemented boundary

The private site composer now exposes the accepted response oracle through a loopback-only HTTP
server. `pnpm site:serve -- --input <verified-site>` verifies the manifest-backed artifact before
binding to `127.0.0.1`, serves GET and HEAD through the independent oracle, and rejects other
methods with `405 Method Not Allowed`. Imports remain side-effect free and no dependency was added.

`pnpm site:browser-proof -- --output <path>` is the single clean proof command. It builds VitePress
and Storybook from one source revision, composes and independently verifies the output, starts the
ephemeral server, runs the checked-in Chromium matrix, closes the server on either success or
failure, and retains the verified artifact for inspection. The Playwright configuration accepts only
the exact loopback origin supplied by the runner and limits discovery to the site-delivery suite.

## Automated Chromium matrix

The four-test Chromium proof validates:

- canonical redirects, query preservation, real Storybook-path 404s, GET, HEAD, rejected POST, and
  the accepted response headers over HTTP;
- hydrated documentation, its production canonical URL, `nosniff`, CSP delivery, same-origin runtime
  requests, and a deliberately injected external image rejected by Chromium with an `img-src`
  security-policy violation;
- the Storybook manager, its `noindex` response, discovery of a real story from `index.json`, and a
  direct same-origin preview containing rendered story content; and
- the hydrated branded 404 at a `320 × 640` viewport with reduced motion and forced colors, visible
  recovery links, keyboard focus indication, no horizontal overflow, and no external requests.

The focused site-composer check passes with 15 test files and 133 tests. Its added server tests
prove manifest verification before binding, loopback-only service, GET and HEAD parity with the
response oracle, method rejection, content integrity, and clean shutdown. Linting, formatting,
browser-test discovery, and the complete repository gate pass.

## Clean composed-artifact proof

The retained proof was produced from clean implementation commit
`98a7f4099ddfc88762c432c07b06099d46961447`, tree `c2b38a3b9ca2bfff71bb0b99a2e03b35d292d372`, and
lockfile SHA-256 `bdb6b4e916bd5fa2330fc3dd3f272814c6940ec04dab78b437b7007be386a525`.

| Evidence          | Exact result                                                       |
| ----------------- | ------------------------------------------------------------------ |
| Bundle SHA-256    | `da4c4c5efe7f8f6b44570533a0769e14f587aa529c1ca17a84aa787ea876215f` |
| Manifest SHA-256  | `d7050d8ef093130811f99a03df462b2d30a850a1e63dedbbd41dc0351fdf286e` |
| Documentation     | 592 files; 27,952,355 bytes                                        |
| Storybook         | 133 files; 9,226,992 bytes                                         |
| Surface total     | 725 files; 37,179,347 bytes, plus the root manifest                |
| Build environment | Node `26.8.1`; pnpm `11.9.0`; `darwin`; `arm64`                    |

## Direct visual inspection

The same local artifact was also inspected in the in-app browser. The Phase 6 documentation page
hydrated with its expected navigation and content, a concrete foundation typography story rendered
inside the direct Storybook preview, and the missing-route page showed the Wayglass identity plus
both recovery destinations without overflow. This direct inspection is corroborating visual
evidence; it does not replace the automated assertions for HTTP status and headers, blocked
requests, keyboard focus, forced colors, or the exact narrow viewport.

## Acceptance effect and next authority

Acceptance completes Phase 6D-D and authorizes Phase 6D-E only: add the previously accepted exact
`wrangler@4.128.0` development dependency, check in minimum credential-free Static Assets
configuration pointing at an independently verified composed directory, and compare local Wrangler
behavior with the accepted oracle. Any mismatch must be documented and resolved before Phase 6D-E
can pass.

Acceptance does not authorize Cloudflare or GitHub connection, preview upload, production
deployment, custom-domain attachment, DNS mutation, credentials, repository visibility changes,
analytics, npm publication, or SpaceTraders work. Those actions retain their later independent
gates.
