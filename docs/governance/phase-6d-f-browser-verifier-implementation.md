# Phase 6D-F read-only browser verifier implementation

**Status:** Accepted by the project owner and merged in PR #276 on October 30, 2026, after
project-owner acceptance and merge of the read-only edge verifier in PR #275.

## Implemented boundary

The private Cloudflare delivery tooling now provides a direct, headless Chromium verifier for one
exact immutable `wayglass-docs` Version URL. It reuses the edge verifier's exact UUID-to-Version-URL
binding, independently verifies the supplied local site artifact before launch, and writes a second
sanitized evidence record only after the browser matrix passes.

```text
pnpm site:browser:edge:check -- \
  --input /absolute/verified/site \
  --url https://<version-prefix>-wayglass-docs.<subdomain>.workers.dev/ \
  --version-id <exact-cloudflare-version-uuid> \
  --output /absolute/os-temporary-directory/browser-evidence.json
```

The command does not invoke Wrangler, inspect an authenticated account, create a browser profile,
alter a Worker, upload or deploy a version, attach a hostname, change traffic, or perform rollback.
It uses the existing pinned Playwright and Axe dependencies; no dependency was added. This
implementation task contacted no Cloudflare endpoint and captured no real remote evidence.

## Browser acceptance matrix

One fresh, headless Chromium browser and credential-free context prove:

- `/phase-6` returns `200`, hydrates the Phase 6 heading, retains its production canonical URL,
  delivers the accepted CSP, and sends Version URL `noindex`, with `nofollow` accepted when present
  and every other indexing token rejected;
- the hydrated documentation page has zero automated Axe violations, makes no external application
  request, and rejects a deliberately injected external image with an `img-src` CSP violation;
- `/storybook/` returns `200`, hydrates the manager, remains non-indexable, exposes a safe concrete
  story ID from its same-origin index, and renders that story directly without a nested preview
  frame;
- the direct story has zero automated Axe violations and makes no external runtime request;
- both the documentation and Storybook missing routes return `404` with the branded heading and
  visible recovery links at `320 × 640`, reduced motion, and forced colors;
- the missing page has no horizontal overflow, retains visible keyboard focus, has zero automated
  Axe violations apart from the inapplicable forced-colors contrast rule, and makes no external
  runtime request; and
- the complete browser context creates no cookie and blocks service workers so retained proof cannot
  depend on prior state.

The CSP probe is the verifier's own deliberate request and is excluded from the application's
same-origin request count only after Chromium proves that CSP blocked it. The runner does not click
forms, submit data, download files, persist storage, or follow an external navigation.

## Sanitized evidence

Successful verification uses the shared transactional evidence writer introduced with the edge
verifier. The output is a new mode-`0600` JSON file beneath the real OS temporary root and contains
only:

- capture timestamp, public immutable Version URL, exact Worker name, and version ID;
- independently verified source, tooling, lockfile, bundle, manifest, and environment identities;
- Chromium name and numeric version;
- the validated public Storybook story ID;
- explicit pass projections for hydration, canonical identity, CSP enforcement, Axe, narrow and
  forced-colors behavior, recovery links, focus, overflow, same-origin requests, and cookies; and
- the aggregate application runtime-request count.

It contains no screenshot, trace, video, DOM or accessibility dump, raw network or console log,
header set, response body, cookie value, local path, browser profile, credential, account ID, email
address, or environment dump. Browser or artifact failure leaves no final evidence file.

## Live-edge correction

The first authorized candidate browser run on November 1, 2026 stopped before deployment because
Cloudflare's immutable Version URL supplied its documented automatic `noindex` token without the
authored `nofollow` token. The HTTP edge matrix had already passed all thirty comparisons against
the same candidate. This amendment gives the hydrated browser proof the same closed indexing rule as
the corrected edge verifier: `noindex` is required, `nofollow` is optional, and any other token
fails closed. No browser, accessibility, CSP, canonical, isolation, or artifact assertion changes.

After that correction, the browser reached Axe and exposed one serious `color-contrast` violation
covering 32 VitePress sidebar links: VitePress's unmapped tertiary default `#67676c` rendered at
2.84:1 against Wayglass's dark panel. The documentation adapter now maps both VitePress secondary
and tertiary text variables to the existing semantic `text.secondary` token. This is a real
accessibility correction, not a verifier exception; the failed candidate remains inactive and a
replacement candidate requires a new exact artifact identity and explicit upload authority.

The first replacement upload remained inactive and passed all thirty edge comparisons, then exposed
a second serious `color-contrast` violation covering 16 table headers. VitePress's unmapped
`--vp-c-bg-soft` supplied `#f6f6f7` beneath Wayglass secondary text for a 1.85:1 ratio. The adapter
now maps that background to the existing semantic panel surface. The local `/phase-6` browser proof
also runs Axe and retains only rule ID, impact, and affected-node count on failure, closing the gap
that allowed table content to pass the prior local hydration-only proof.

That strengthened local proof then caught the remaining three inline-code contrast failures before
another upload. VitePress derived inline-code text from the primary brand blue, which measured 4.0:1
on its code background. The adapter maps the VitePress inline-code text role to Wayglass semantic
primary text; background and monospace typography continue to distinguish code without misusing an
action or condition color.

The second replacement upload likewise remained inactive and passed all thirty immutable-edge
comparisons. Its direct Storybook story then exposed one moderate Axe `region` violation: the
keyboard skip link preceded the story's main landmark without belonging to any landmark. The story
now places that link in a labeled skip-links navigation landmark, preserving the native skip-link
behavior while giving the standalone preview a complete landmark structure. The local site browser
proof now runs Axe against the selected direct Storybook story as well as the documentation page, so
this failure must be caught before any further upload. The baseline remains the sole active
deployment; another replacement upload remains a separate provider mutation requiring renewed
project-owner authority.

## Verification completed in this slice

Focused tests prove exact artifact and target binding, deterministic evidence projection, absence of
local paths and authorization material, strict CLI parsing, rejection of the stable alias, and no
evidence publication after a browser failure. Existing accepted site-delivery browser tests remain
the local behavioral reference. Type checking compiles the real Playwright and Axe implementation;
the full repository gate must pass before this candidate is proposed for acceptance.

## Subsequent Phase 6D-F disposition

Acceptance completed the read-only verification tooling planned by the execution contract. A later
execution-readiness audit named the clean candidate and baseline artifacts, exact commands, evidence
destinations, stop conditions, and required owner authorization without performing a provider
mutation. The separately authorized rehearsal subsequently completed successfully; see the
[Phase 6D-F execution result](./phase-6d-f-execution-result.md). This implementation record does not
itself authorize any Cloudflare operation: it must not authenticate, create, upload, deploy, roll
back, restore, or retain provider state. The later run required and received its separate
all-at-once execution authorization.
