# Documentation Custom Domain

The owner authorized publication of documentation and Storybook at
`https://wayglass.hoagsoftworks.com` on November 7, 2026. Packages and the GitHub repository remain
private. This does not authorize npm publication, analytics, or additional hostnames.

`wrangler.domains.jsonc` is a triggers-only configuration for the existing `wayglass-docs` Worker.
It intentionally remains separate from the inert build/rehearsal configuration in `wrangler.jsonc`:
local checks and version uploads must not implicitly attach a production hostname. Do not use this
file with `wrangler deploy` or `versions upload`.

Apply only domain triggers, without replacing assets or changing the active Worker version:

```sh
pnpm exec wrangler triggers deploy --config wrangler.domains.jsonc --dry-run
pnpm exec wrangler triggers deploy --config wrangler.domains.jsonc
```

Cloudflare owns the exact hostname's DNS record and managed TLS certificate. Do not add a manual
CNAME to workers.dev. Stop on an existing DNS record or domain/route conflict rather than
overwriting it. Preserve workers.dev and immutable preview URLs for verification and recovery.

Verify HTTPS, documentation hydration and canonical links, `/storybook/` and a direct story,
security headers, genuine 404 responses, and exact live artifact manifest identity after attachment.
Attaching a hostname must not change the active version or traffic split. Content rollback uses the
retained verified Worker version; hostname removal is a separate, explicit action.

The deployed documentation already uses this canonical origin. Storybook remains non-indexable. The
earlier Phase 6D-F execution record describes the rehearsal state, not this later launch.

## Launch verification

Wrangler 4.128.0 attached the hostname successfully on November 7, 2026. HTTPS worked immediately.
The active deployment remained `b3b1695a-e93f-4b86-a77b-8c8ddfd2f407`, with version
`16b9368c-0731-416e-bdb0-9a683ad4e95d` serving 100%. No new asset version was uploaded. The
custom-origin manifest matched the previously verified artifact byte-for-byte (bundle
`b1c1e18d74d03831073fefcf559773ac33e059db0b03dc905f3b7afcb98acb84`, source
`bdec3efa7604748a696ab521e19dad28a4326d94`). Phase 1 and Phase 6 pages returned 200 with correct
canonical URLs, enforced CSP, and zero axe findings. Storybook returned 200 with `noindex`; a
missing documentation route returned a genuine 404.
