# Phase 6D documentation and Storybook delivery implementation plan

**Status:** Accepted by the project owner on September 8, 2026, after completion of Phase 6C. Phase
6D-A readiness and dependency-proposal work and the Phase 6D-B site-composition contract are
accepted. Phase 6D-B implementation stage 1 is accepted, and transactional-composer stage 2 is
proposed for project-owner acceptance. This plan decomposes the accepted Cloudflare delivery
architecture into reviewable local, configuration, preview, and closeout slices. Its acceptance does
not connect Cloudflare or GitHub, change DNS, install Wrangler, upload a preview, deploy production,
enable analytics, publish packages, or expose credentials. The owner separately authorized the
read-only account inspection recorded during 6D-A.

## Objective

Produce one deterministic, locally verifiable deployment artifact containing normative VitePress
documentation at `/` and Storybook at `/storybook/`. Then prove the reviewed artifact through a
separately authorized Cloudflare preview without attaching the production hostname. Production
launch remains Phase 6F, after npm state can be described truthfully.

No walkthrough is admitted in Phase 6D. Reference applications, examples, experiments, provider
guidance, and the SpaceTraders client remain outside the composed artifact.

## Current platform basis

Cloudflare guidance was rechecked on September 8, 2026:

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) remains the
  current static-site model and permits one asset collection per Worker;
- [Wrangler asset configuration](https://developers.cloudflare.com/workers/wrangler/configuration/#assets)
  exposes the asset directory, optional binding, asset-first routing, HTML handling, and explicit
  not-found handling used by this plan;
- [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) supports connected Git
  builds and separates uploaded preview versions from active deployments;
- [build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) uses
  `wrangler versions upload` for non-production preview versions by default; and
- [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
  are appropriate when the Worker is the origin, but cannot claim a hostname with an existing CNAME
  or a zone the account does not own.

This confirms ADR 0032's Workers Static Assets direction. Exact Wrangler version, configuration
fields, dependency behavior, and account settings must still be frozen by their own reviewed slices.

## Accepted operating decisions

The project owner accepted these operating decisions:

| Decision                 | Proposed Phase 6D value                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| Canonical origin         | `https://wayglass.hoagsoftworks.com`                                                        |
| Repository visibility    | Keep `Actesis/Wayglass` private until the project owner approves general release            |
| Content visibility       | Documentation and Storybook may become public at the canonical origin after launch approval |
| Public surfaces          | VitePress at `/`; Storybook at `/storybook/`; no walkthroughs                               |
| Worker architecture      | One Worker with one Static Assets collection; no dynamic API                                |
| Production promotion     | Automated from the protected production branch after launch approval and required checks    |
| Preview behavior         | Non-production Worker version, `noindex`, no custom hostname, clearly labeled preview       |
| Analytics and collection | None: no beacon, cookies, forms, accounts, submitted data, or telemetry                     |

Keeping the repository private means Workers Builds GitHub access, if later approved, must be
deliberately limited to this repository. Automation does not bypass Phase 6F launch approval: it
becomes active only after the production connection, branch protections, checks, rollback, and
custom-hostname change are separately accepted.

## Work sequence

### 6D-A — readiness, ownership, and dependency proposal

Record evidence or an explicit unresolved state for every prerequisite before Cloudflare-specific
implementation:

1. confirm control of the `hoagsoftworks.com` zone and the exact hostname spelling;
2. inspect existing DNS, Custom Domain, Worker route, and Pages/Worker project conflicts without
   changing them;
3. accept the repository and public-content visibility decisions above;
4. assign Cloudflare account, GitHub integration, deployment, production approval, rollback, and
   incident-response owners;
5. name the proposed Worker and verify it does not collide with an existing project;
6. select a current Wrangler candidate and audit its license, dependency graph, install scripts,
   lockfile effect, Node compatibility, and why platform-neutral existing tools are insufficient;
7. freeze the intended Workers Builds commands and minimal GitHub repository access without
   connecting either service; and
8. preserve production launch, DNS mutation, credentials, and preview upload as later approvals.

**Exit gate:** The project owner accepts one exact readiness record and Wrangler proposal. That
acceptance authorizes local composition implementation only.

### 6D-B — deterministic local site composition

Implement a private, framework-neutral composer that:

- starts from an empty owned temporary staging directory;
- consumes independently built VitePress and Storybook outputs from one clean source revision;
- places documentation at the root and Storybook under `storybook/` without rewriting generated HTML
  or hashed JavaScript;
- rejects collisions, symlinks, missing entry points, path escape, secrets, unexpected source maps,
  undeclared surfaces, and changed inputs;
- emits one canonical manifest with source/tooling identity, surface classifications, versions,
  relative paths, byte counts, file hashes, environment, and whole-bundle hash; and
- removes partial output on every failure.

The composer remains independent of Cloudflare and does not add Wrangler.

**Exit gate:** Repeated clean local composition is byte-identical and independently verified.

### 6D-C — Storybook subpath and cross-surface navigation

Configure Storybook itself for `/storybook/`. Prove direct entry, manager/preview frames, static
assets, story deep links, browser history, accessibility tooling, and a clear return to normative
documentation without output rewriting. VitePress gains an intentional Storybook link but does not
embed or own Storybook.

**Exit gate:** Local direct-navigation and asset checks pass at the exact production prefix.

### 6D-D — response, route, and content contracts

Define and test:

- exact static assets before custom logic;
- real 404 responses for missing documentation, Storybook assets, and unknown prefixes;
- reviewed HTML canonicalization and trailing-slash behavior;
- immutable caching for fingerprinted assets and revalidation for HTML and manifests;
- content-type protection, referrer, framing, permissions, and Content Security Policy headers;
- same-origin Storybook framing only to the extent its manager and preview require;
- production canonical/indexable behavior and preview `noindex`; and
- branded, useful 404 content without a global SPA fallback.

With no admitted walkthrough, this slice should not add a Worker script unless a tested response
requirement cannot be expressed by Static Assets configuration. Any such script needs a separate
justification and review.

**Exit gate:** A local server/emulator passes the complete route, header, link, asset, and 404
matrix.

### 6D-E — reviewed Cloudflare configuration and local rehearsal

After the accepted dependency audit, add the pinned Wrangler dependency and minimum configuration
needed to point at the verified composed directory. Mirror proposed Workers Builds settings in the
repository. Run local configuration validation and a credential-free rehearsal; do not upload.

**Exit gate:** The checked-in configuration reproduces the local contract, contains no account ID or
secret, and cannot promote or attach the production hostname through the ordinary verification
command.

### 6D-F — separately authorized preview and rollback rehearsal

After fresh project-owner authorization, connect only the approved account/repository scope or use
an approved minimal deployment credential. Upload one immutable non-production Worker version,
record its source and version identity, verify its preview URL and `noindex` behavior, and rehearse
rollback between non-production versions. Do not attach the custom hostname or promote production.

**Exit gate:** The project owner accepts the preview, exact immutable artifact, route/header/content
evidence, access scope, and rollback result.

### 6D-G — Phase 6D implementation disposition

Reconcile all ten ADR 0032 implementation gates, exact dependency/configuration state, preview
evidence, limitations, owner assignments, rollback target, incident path, and remaining launch work.
Remove rejected experiments and retain only accepted local tooling, configuration, and evidence.

**Exit gate:** The project owner accepts Phase 6D implementation and preview evidence. Phase 6E npm
release planning becomes next; production documentation launch remains Phase 6F.

## Authority map

| Action                                        | Authority after plan acceptance                 |
| --------------------------------------------- | ----------------------------------------------- |
| Read-only public Cloudflare documentation     | Allowed                                         |
| Read-only account, zone, DNS, and route audit | Authorized for 6D-A; permits no mutation        |
| Local composer, manifest, and tests           | Allowed after 6D-A acceptance                   |
| Add pinned Wrangler dependency/configuration  | Allowed only after accepted dependency proposal |
| Connect GitHub or Cloudflare                  | Not authorized                                  |
| Upload a preview version                      | Requires separate 6D-F authorization            |
| Attach custom hostname or change DNS          | Not authorized in Phase 6D                      |
| Promote or deploy production                  | Not authorized until Phase 6F                   |
| Enable analytics or data collection           | Not authorized                                  |

## Recorded owner confirmations

On September 8, 2026, the project owner confirmed:

1. control of the `hoagsoftworks.com` Cloudflare zone and authorization to inspect its DNS and
   Worker configuration without mutation;
2. that `wayglass.hoagsoftworks.com` has no existing DNS record, Worker route, Pages project, or
   Custom Domain;
3. that the repository stays private until general-release approval while documentation and
   Storybook may be published at the canonical origin;
4. that Codex may act as implementation and deployment operator during an active, explicitly
   authorized task; the project owner remains the durable account owner, production approval
   authority, rollback owner, and incident contact outside an active task; and
5. automated documentation and Storybook deployment is acceptable after its production launch gate,
   rather than requiring manual promotion for every accepted production-branch commit.

These answers authorize no external change. If account inspection requires a credential or
Cloudflare connection, that exact read-only access is requested separately.

## Acceptance effect

Acceptance of this plan completes the Phase 6C-to-6D transition and authorizes Phase 6D-A readiness
and dependency-proposal work only. It does not authorize installing Wrangler, writing deployment
configuration, connecting accounts, uploading assets, changing DNS, using credentials, deploying
production, publishing npm packages, changing repository visibility, or beginning the SpaceTraders
client.
