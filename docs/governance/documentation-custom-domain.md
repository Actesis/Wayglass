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

## Content deployments

Content updates upload a new version with the assets-only `wrangler.jsonc`, verify it on its
immutable preview URL, and only then move traffic to it. The hostname configuration is untouched.

| Date       | Content             | Source commit | Version                                | Deployment                             |
| ---------- | ------------------- | ------------- | -------------------------------------- | -------------------------------------- |
| 2026-11-15 | Wayglass 0.1.0 docs | `4a6a219`     | `2722cb3a-d17c-4d12-9f30-f2cf2e8260cf` | `68d4b135-a56f-481e-ae04-a2d991de7bed` |
| 2026-11-23 | Wayglass 0.1.1 docs | `f36df7b`     | `c744f066-dc96-40c9-be87-087fa53f7851` | `b846fb67-4faf-4547-b909-4190a3e4970c` |

The 0.1.1 deployment was built from a clean checkout of `f36df7b` after the full repository gate
passed. Before deployment it passed:

- manifest verification (bundle `835cbf6068b3dba09a1080dffb67674f7b6deff8b8728e66048d56b9f5786060`);
- the response oracle;
- the Wrangler configuration rehearsal;
- 30 immutable edge comparisons;
- the browser verifier in Chromium 151.

After deployment, the production manifest was byte-identical to the verified artifact. The main
routes returned 200 with an enforced content security policy, and a missing route returned 404. The
previous version, `2722cb3a…`, remains the rollback target.
