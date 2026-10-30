# Phase 6D-F read-only browser verifier implementation

**Status:** Implementation acceptance candidate prepared on October 30, 2026, after project-owner
acceptance and merge of the read-only edge verifier in PR #275.

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
  delivers the accepted CSP, and sends Version URL `noindex` plus `nofollow`;
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

## Verification completed in this slice

Focused tests prove exact artifact and target binding, deterministic evidence projection, absence of
local paths and authorization material, strict CLI parsing, rejection of the stable alias, and no
evidence publication after a browser failure. Existing accepted site-delivery browser tests remain
the local behavioral reference. Type checking compiles the real Playwright and Axe implementation;
the full repository gate must pass before this candidate is proposed for acceptance.

## Remaining Phase 6D-F work

Acceptance of this candidate completes the read-only verification tooling planned by the execution
contract. The next step is a final execution-readiness audit that names the clean candidate and
baseline artifacts, exact commands, evidence destinations, stop conditions, and required owner
authorization. It must not authenticate, create, upload, deploy, roll back, restore, or retain any
Cloudflare state. Those external effects remain blocked on the accepted contract's separate,
all-at-once execution authorization.
