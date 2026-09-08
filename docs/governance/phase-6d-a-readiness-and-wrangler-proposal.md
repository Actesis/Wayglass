# Phase 6D-A readiness and Wrangler dependency proposal

**Status:** Accepted by the project owner on September 8, 2026. This record completes the authorized
read-only readiness checks that can be performed with the current CLI and accepts one exact Wrangler
dependency for later implementation. It does not install Wrangler in the repository, write
Cloudflare configuration, connect GitHub, create a Worker, change DNS, upload assets, enable a
build, deploy, publish packages, or expose credentials.

## Readiness disposition

| Prerequisite           | Evidence and disposition                                                                                                                                                                                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zone control           | The project owner confirmed control of the `hoagsoftworks.com` Cloudflare zone and authorized read-only inspection.                                                                                                                                                                            |
| Exact origin           | `https://wayglass.hoagsoftworks.com`; the unsupported `hoagsoftwors.com` spelling remains excluded.                                                                                                                                                                                            |
| Public DNS             | A, AAAA, and CNAME queries returned `NXDOMAIN` on September 8, 2026.                                                                                                                                                                                                                           |
| Private DNS and routes | The owner confirmed that the hostname has no DNS record, Worker route, Pages project, or Custom Domain. Wrangler has no general DNS-record or Custom Domain inventory command, so the owner assertion and public DNS result are retained rather than presented as an API-level zone inventory. |
| Account access         | `wrangler whoami` succeeded through the existing OAuth session. The session exposes zone-read and Workers-management capability. Account identifiers, email, and token material are intentionally omitted.                                                                                     |
| Pages collision        | `wrangler pages project list` returned no projects.                                                                                                                                                                                                                                            |
| Worker collision       | `wrangler deployments list --name wayglass-docs --json` returned Cloudflare code `10007`, confirming that `wayglass-docs` does not exist in the accessible account.                                                                                                                            |
| Repository visibility  | `Actesis/Wayglass` remains private until the project owner approves general release.                                                                                                                                                                                                           |
| Public content         | VitePress and Storybook may become public at the canonical origin after the separate production launch gate. No walkthrough is admitted.                                                                                                                                                       |
| Collection             | No analytics, beacon, cookies, forms, accounts, submitted data, or telemetry.                                                                                                                                                                                                                  |

`wayglass-docs` is the proposed Worker name. Acceptance reserves it in repository governance only;
it does not create or reserve anything in Cloudflare.

## Ownership and operating model

The project owner is the durable Cloudflare account owner, GitHub integration approver, production
approval authority, rollback owner, and incident contact. Codex may act as implementation and
deployment operator only during an active task whose exact external action has been authorized.
Codex cannot receive incidents, monitor the deployment, retain accountability, or act after the task
ends.

After the separate Phase 6F launch approval, documentation deployment may run automatically from the
protected `main` branch after required checks pass. That future automation does not authorize the
initial GitHub connection, hostname attachment, DNS change, or production deployment.

## Why a Cloudflare dependency is necessary

The existing VitePress, Storybook, Node, pnpm, and repository tooling can build and compose static
files, but they cannot validate Cloudflare configuration or perform Cloudflare-native local serving,
immutable preview-version upload, version inspection, deployment, and rollback. Hand-written REST
requests would duplicate authentication, configuration validation, asset upload, and versioning
behavior maintained by Cloudflare.

Wrangler is therefore proposed as a root development dependency used only for Cloudflare-specific
validation and delivery. Site composition remains framework-neutral and must not import Wrangler.
Wrangler is not a runtime dependency of any public Wayglass package and must not enter package
tarballs or the composed static asset collection.

## Exact dependency proposal

| Field              | Proposed value                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Package            | `wrangler`                                                                                        |
| Version            | `4.128.0`, exact rather than a range                                                              |
| Registry integrity | `sha512-jNXy9e8/pbx8iqTzXPiuflnitKJZoAfEUSUUDLW87bwyeMvJ7kb3yQMSbxEcfNdfHqJW38KRcKaLljOYV4N/4w==` |
| License            | `MIT OR Apache-2.0`                                                                               |
| Node requirement   | Wrangler requires Node `>=22.0.0`; Wayglass requires Node `>=22.13.0`                             |
| Publication date   | September 1, 2026; old enough to satisfy the current minimum-release-age policy on the audit date |
| Package size       | 15,170,778 unpacked bytes reported by npm                                                         |

Wrangler `4.129.1` was current on the audit date but was published on September 7, 2026. A
disposable lock calculation required minimum-release-age exceptions for both `wrangler@4.129.1` and
`miniflare@5.20260907.0-alpha`. The proposal rejects those exceptions and selects `4.128.0`, the
newest checked version that passes the existing supply-chain policy unchanged.

### Direct dependency projection

The registry manifest for `wrangler@4.128.0` names eight direct dependencies:

| Dependency                     | Exact version        |
| ------------------------------ | -------------------- |
| `@cloudflare/kv-asset-handler` | `0.5.0`              |
| `@cloudflare/unenv-preset`     | `2.16.1`             |
| `blake3-wasm`                  | `2.1.5`              |
| `esbuild`                      | `0.28.1`             |
| `miniflare`                    | `5.20260831.0-alpha` |
| `path-to-regexp`               | `6.3.0`              |
| `unenv`                        | `2.0.0-rc.24`        |
| `workerd`                      | `1.20260831.1`       |

The `alpha` label belongs to Cloudflare's exact Miniflare dependency; the candidate does not widen
that version. It remains a maintenance input for each future Wrangler update.

## Disposable install and lockfile audit

The audit ran outside the repository with pnpm `11.9.0` and lifecycle scripts disabled:

- the standalone graph resolved 91 lockfile package records and installed 36 packages applicable to
  the audit host;
- a disposable copy of the exact Wayglass tree passed the repository supply-chain policies;
- the projected repository change is one exact root `devDependency` plus 555 lockfile lines and 56
  new package-resolution records;
- `pnpm-workspace.yaml` needs no minimum-release-age exception;
- the installed host graph declared only `MIT`, `Apache-2.0`, `MIT OR Apache-2.0`, `ISC`, `CC0-1.0`,
  and `LGPL-3.0-or-later` license expressions;
- `@img/sharp-libvips-darwin-arm64@1.3.1` supplies the observed LGPL expression as an optional
  platform package under the dev-only Miniflare path; it is not copied into the static site or a
  Wayglass package;
- `esbuild@0.28.1` and `workerd@1.20260831.1` are the only applicable packages with lifecycle
  scripts, each using `node install.js`; and
- `pnpm audit --prod --audit-level low` reported no known vulnerabilities on September 8, 2026.

The existing workspace already permits the `esbuild` build. A later accepted installation must add
only `workerd: true` to `allowBuilds`, install from the frozen lockfile, and verify the resulting
Wrangler executable. No lifecycle script was executed during this proposal audit.

This is a dependency review, not legal advice. The exact license and advisory evidence must be
rechecked when Wrangler changes.

## Proposed Workers Builds settings

These settings are frozen as the intended future configuration, not applied account state:

| Setting                       | Proposed value                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Repository                    | GitHub App access limited to `Actesis/Wayglass` only                                                        |
| Root directory                | `/`                                                                                                         |
| Production branch             | protected `main`                                                                                            |
| Build command                 | `pnpm site:build` after that local contract exists                                                          |
| Production deploy command     | `pnpm exec wrangler deploy`                                                                                 |
| Non-production deploy command | `pnpm exec wrangler versions upload`                                                                        |
| Node                          | `24.18.0`, a version preinstalled by the current Workers Builds image                                       |
| pnpm                          | `11.9.0`, matching `packageManager`, set with `PNPM_VERSION` because the current image default is `10.11.1` |
| Production behavior           | automated only after the initial Phase 6F connection and launch approval                                    |
| Preview behavior              | immutable non-production version, Cloudflare preview URL, `noindex`, no custom hostname                     |

Cloudflare currently defaults production delivery to `wrangler deploy`, non-production branches to
`wrangler versions upload`, and uses the Wrangler version in `package.json`. Dashboard-only settings
must be mirrored in repository documentation after they are eventually applied.

## Known dashboard/API gap

Wrangler can confirm authentication, Pages projects, and a named Worker's existence, but it cannot
produce the authoritative general inventory of DNS records, Custom Domains, Workers Builds GitHub
connections, or dashboard build variables required by the final launch record. When those gates
become active, the project owner must either:

1. configure or verify those values in the Cloudflare dashboard using the exact accepted record; or
2. authorize a narrowly scoped Cloudflare API or connector inspection that does not expose secrets.

No additional configuration is needed for 6D-B local composition work.

## Acceptance effect

Accepting this exact readiness and dependency proposal completes Phase 6D-A and authorizes Phase
6D-B deterministic local site-composition implementation. It approves `wrangler@4.128.0` and the
named `workerd` lifecycle allowance for later Phase 6D-E installation, but does not install them
now. It does not authorize Cloudflare configuration, GitHub connection, preview upload, production
deployment, custom-domain attachment, DNS mutation, credentials, repository visibility changes,
analytics, npm publication, or SpaceTraders work.
