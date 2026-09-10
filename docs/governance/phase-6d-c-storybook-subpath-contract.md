# Phase 6D-C Storybook subpath and cross-surface navigation contract

**Status:** Acceptance candidate completed on September 9, 2026, following project-owner acceptance
and merge of Phase 6D-B in PR #266. The exact implementation and composed-browser proof are recorded
below.

## Public-path ownership

Storybook owns the exact `/storybook/` prefix. Its Vite preview build uses `/storybook/` as its
explicit base and must emit URLs that work without composer or server rewriting. The manager,
preview iframe, story index, fonts, images, JavaScript, and CSS remain Storybook-owned output copied
byte for byte by the accepted composer. No global navigation fallback is introduced.

The supported entry points are `/storybook/`, `/storybook/index.html`, and `/storybook/iframe.html`.
A manager deep link using `?path=/story/<story-id>` and a direct preview using
`?id=<story-id>&viewMode=story` must load the selected story without leaving the prefix.
Query-string history changes must preserve the manager document and browser back/forward behavior.

## Cross-surface navigation

VitePress exposes a `Storybook` navigation link to `/storybook/` with an explicit `_self` browsing
context. The target attribute intentionally prevents VitePress's same-origin documentation router
from claiming the non-documentation route while preserving ordinary same-tab navigation. The
Storybook manager exposes a keyboard-focusable `Wayglass documentation` link to `/`. Neither surface
embeds the other, and neither claims the other's content as normative. Storybook remains component
inspection; VitePress remains the normative documentation source.

## Local composed-site validation

Validation must build and compose from one clean revision, serve the composed directory without
rewrites, and prove:

1. direct manager, explicit index, and direct iframe requests succeed at the exact prefix;
2. manager and preview requests remain under `/storybook/` and load every requested static asset;
3. at least one stable story deep link renders in the preview;
4. manager query navigation and browser back/forward remain functional;
5. the documentation link reaches Storybook and the manager return link reaches documentation;
6. both links expose accessible names and visible keyboard focus; and
7. no request for a Storybook runtime asset escapes to the documentation root.

The focused source and generated-output tests, documentation tests and build, formatting, linting,
the relevant Chromium browser proof, and the full repository gate must pass before acceptance is
proposed. Firefox and WebKit compatibility remain governed by existing browser evidence; this
delivery-path proof uses Chromium because it validates URL construction rather than a new runtime
component contract.

## Acceptance-candidate evidence

The proof used implementation commit `cce43042917541baaa3259a516f5c8ee7e16ce39` and tree
`a0ab19b6f32f4cd8aa3d179e1405a57a60db50a2`, with lockfile SHA-256
`bdb6b4e916bd5fa2330fc3dd3f272814c6940ec04dab78b437b7007be386a525`. A clean `pnpm site:build`
produced an independently verified composed artifact with bundle SHA-256
`aaefebbf432447c469e6e7e7943976f1d24fdd0299dda6a2cf878961bfdfab1d` and manifest SHA-256
`3e74ece584f47d1c0cca90edf796cb6f3c4e01c73a4a730deed9215810be37cc`.

That artifact was served by an ordinary static HTTP server with no rewrites. Chromium proved the
documentation root, `/storybook/`, `/storybook/index.html`, a direct preview iframe, and the stable
`foundations-foundation-primitives--surfaces-and-dividers` story. The manager deep link rendered the
selected story; changing stories updated the query-string URL; browser back and forward restored the
corresponding story selections. The preview also rendered when its iframe URL was loaded directly.

The documentation navigation exposed the accessible `Storybook` link and reached the manager in the
same tab. The manager exposed the accessible `Return to Wayglass documentation` link and returned to
the documentation root in the same tab. Keyboard focus on the return link produced a two-pixel solid
outline. Generated-output inspection found every root-absolute preview runtime reference under
`/storybook/assets/`; manager runtime references are relative to `/storybook/`. The only intentional
cross-prefix reference is the manager's return link to `/`, and the loaded manager and selected
preview completed without an escaped runtime request.

The first browser pass exposed VitePress claiming the same-origin `/storybook/` link and rendering a
documentation 404. The accepted correction adds an explicit `_self` target, which VitePress excludes
from client-router interception while retaining same-tab browser behavior. Focused documentation
tests now preserve that integration requirement.

## Authority boundary

Acceptance completes Phase 6D-C and authorizes Phase 6D-D response, route, content, caching, header,
and 404 contracts only. It does not authorize Wrangler installation, Cloudflare or GitHub
connection, upload, deployment, DNS change, npm publication, repository visibility change,
analytics, or SpaceTraders work.
