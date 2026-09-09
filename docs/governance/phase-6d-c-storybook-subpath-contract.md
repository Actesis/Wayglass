# Phase 6D-C Storybook subpath and cross-surface navigation contract

**Status:** Implementation in progress on September 9, 2026, following project-owner acceptance and
merge of Phase 6D-B in PR #266.

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

## Authority boundary

Acceptance completes Phase 6D-C and authorizes Phase 6D-D response, route, content, caching, header,
and 404 contracts only. It does not authorize Wrangler installation, Cloudflare or GitHub
connection, upload, deployment, DNS change, npm publication, repository visibility change,
analytics, or SpaceTraders work.
