# ADR 0032: Compose documentation surfaces into one Cloudflare Workers deployment

- Status: accepted
- Date: 2026-08-15

## Context

Wayglass has a confirmed documentation origin at `https://wayglass.hoagsoftworks.com` and will use
Cloudflare for hosting. The repository currently produces several independent static builds:

- VitePress documentation in `apps/docs/.vitepress/dist`;
- Storybook in `apps/storybook/storybook-static`; and
- private Vite reference applications in their own `dist` directories.

Phase 5A must decide whether documentation, Storybook, and selected synthetic walkthroughs share a
deployment. The decision must preserve their different ownership and support meanings, provide
coherent version evidence, and avoid turning private reference applications into an automatically
public product surface.

Cloudflare currently recommends Workers Static Assets for new static sites and applications. One
Worker can deploy one collection of static assets as a versioned unit, attach an exact Custom
Domain, serve assets without invoking Worker code by default, and use a Worker only for selected
routing behavior. Workers Builds can connect to GitHub, create preview versions for non-production
branches, and promote production builds from a configured branch.

The current walkthrough routers assume they own `/` and use clean application paths such as
`/functions/...`. They cannot be copied under a path prefix without an explicit base-path contract
and path-scoped navigation fallback. A global single-page-application fallback would also turn
missing documentation and Storybook URLs into misleading `200` responses.

This decision defines future deployment architecture. It does not add Wrangler, create a Worker,
connect GitHub or Cloudflare, change DNS, expose a reference application, or deploy the site.

## Decision

### Use one canonical origin and one production deployment

The public documentation system will use one Cloudflare Worker with Static Assets at:

```text
https://wayglass.hoagsoftworks.com
```

The production Worker will own the exact custom hostname. Cloudflare must manage the matching DNS
record and certificate only after the zone, existing DNS, account ownership, and launch approval are
verified. The misspelling `wayglass.hoagsoftwors.com` is not an alias or supported origin.

All public surfaces in a release are assembled into one static asset collection and uploaded as one
Worker version. Documentation must never identify one source commit while Storybook or a walkthrough
silently comes from another.

### Give each surface a stable path and an honest role

| Path                    | Surface                                      | Role                                                                                   |
| ----------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| `/`                     | VitePress                                    | Normative contracts, guides, support scope, decisions, and release documentation       |
| `/storybook/`           | Storybook                                    | Production-component inspection, states, accessibility tooling, and visual review      |
| `/walkthroughs/<slug>/` | An explicitly admitted synthetic application | Illustrative complete workflow using a named Wayglass version; never live system truth |

Documentation links to Storybook and admitted walkthroughs, and those surfaces provide a clear path
back to the documentation root. Storybook stories remain inspection fixtures rather than normative
API documentation. A walkthrough states that its data is synthetic, names its source commit and
support status, and does not imply provider compatibility or deployment guidance.

No reference application is public merely because its build participates in repository checks. A
separate reviewed admission record must name the selected routes and scenarios, privacy and content
review, accessibility evidence, support owner, base-path work, and removal behavior before its files
enter the deployment bundle.

### Keep source builds independent and compose outputs deterministically

VitePress, Storybook, and each admitted walkthrough keep their current package ownership and build
commands. They do not import one another's private source, generated output, routing, or runtime.

A future repository-owned site assembly step will:

1. start from an empty private staging directory;
2. build every admitted surface from one clean checkout and committed lockfile;
3. place VitePress at the staging root, Storybook under `storybook/`, and each selected walkthrough
   under `walkthroughs/<slug>/`;
4. reject path collisions, symlinks escaping an output, missing entry points, unexpected source maps
   or secrets, and files not covered by the admitted manifest;
5. write a machine-readable manifest containing the source commit, surface names, package versions,
   output paths, file hashes, build environment, and classification; and
6. validate links, base paths, headers, routing, asset loading, and clean direct navigation against
   the composed directory.

The composition script copies already-built assets; it does not rewrite arbitrary generated HTML or
patch hashed JavaScript. Each producer must support its public base path in its own configuration.
The composed output is a deployment artifact, not a checked-in source directory or npm package.

### Use asset-first, path-specific routing

The Worker serves an exact static asset before running custom logic. Documentation and Storybook use
static-site 404 behavior and canonical HTML handling rather than a global SPA fallback.

An admitted walkthrough may receive navigation fallback only inside its exact
`/walkthroughs/<slug>/` prefix. The Worker may rewrite a navigation request with no matching asset
to that walkthrough's own `index.html`; it must not apply the fallback to asset requests, another
walkthrough, `/storybook/`, or documentation. Unknown prefixes and missing documentation remain real
404 responses.

Walkthrough routers must read and generate URLs relative to their configured base. They may not
strip the deployment prefix accidentally, navigate to the documentation root, or rely on Cloudflare
to hide incorrect links. Refresh, direct entry, browser history, query-driven deterministic
scenarios, asset URLs, and focus continuity must pass at the deployed prefix.

The initial deployment needs no dynamic application API. A minimal Worker script is justified only
when the first admitted walkthrough requires path-scoped fallback or when reviewed response behavior
cannot be expressed by Static Assets configuration. It must not become an application backend,
analytics collector, authentication layer, or proxy by convenience.

### Separate build verification, preview, and production authority

The future implementation will define one repository command that assembles and validates the site
locally before any Cloudflare integration. Deployment consumes exactly that output; it does not run
a second undocumented build path.

The intended Cloudflare lifecycle is:

- GitHub is connected through the Cloudflare Workers Builds integration only after repository and
  account access are approved;
- non-production branches upload preview Worker versions and receive Cloudflare preview URLs;
- preview URLs do not own the custom hostname, are labeled non-production, and send `noindex` search
  guidance;
- the protected production branch deploys the same build contract to the production Worker only
  after its required repository checks pass; and
- the custom domain is attached only after a production rehearsal, rollback check, DNS review,
  accessibility review, and explicit launch approval.

The implementation must pin the package manager and Wrangler version, select a reviewed Node
version, use minimal Cloudflare and GitHub permissions, and record the deployed Worker version and
source commit. Cloudflare dashboard-only build settings are mirrored in repository documentation so
the deployment can be reconstructed and audited.

Whether production deploys automatically from every accepted production-branch commit or requires a
protected manual promotion remains a launch-governance decision. Preview deployment does not grant
production authority.

### Treat headers, caching, privacy, and indexing as contracts

The composed output will carry reviewed path-aware response rules:

- fingerprinted immutable assets receive long-lived immutable caching;
- HTML, manifests, and service metadata remain revalidatable so a rollback or correction can take
  effect;
- content-type protection, referrer policy, framing policy, permissions policy, and a tested Content
  Security Policy are defined explicitly rather than inherited accidentally;
- Storybook framing is permitted only to the extent required by its own manager and preview under
  the same origin;
- production documentation is canonical and indexable only when launch is approved;
- preview and withdrawn surfaces are not indexable; and
- missing routes preserve useful branded 404 content without returning a false success status.

No analytics, Cloudflare Web Analytics beacon, cookies, user accounts, submitted forms, live
credentials, provider calls, personal data, or telemetry collection is enabled by this architecture.
Each needs a separate privacy, purpose, retention, consent, security, and ownership decision.

### Coordinate documentation claims with release governance

Every deployed surface identifies the source commit and project state. Documentation may be public
before npm packages are published, but it must label packages as private and avoid installation or
support claims that are not yet true. A package release may update documentation only through its
own verified release record.

A production site deploy is independently reversible from npm publication. The prior verified Worker
version remains the rollback target. Rolling back the site does not alter immutable package
versions, and moving documentation forward does not repair a failed package release.

## Implementation gates

Before the first Cloudflare implementation pull request:

1. verify control of the `hoagsoftworks.com` Cloudflare zone and the exact custom hostname;
2. inspect existing DNS records and confirm that no conflicting CNAME or Worker route exists;
3. accept the public-repository and public-documentation content decision;
4. document why Cloudflare tooling is required and audit its dependency, license, install scripts,
   and lockfile effect;
5. define the deterministic site manifest, staging path, collision checks, and local verification
   command;
6. make Storybook work at `/storybook/` without output rewriting;
7. keep walkthroughs excluded until each has an accepted admission record and base-path proof;
8. define and test headers, caching, 404, canonical URL, and preview `noindex` behavior;
9. record account owner, GitHub integration scope, production approver, rollback owner, and incident
   path; and
10. rehearse preview upload, production promotion, custom-domain attachment, and rollback without
    publishing packages or enabling analytics.

Deployment remains blocked until those gates and the separate launch approval are complete.

## Consequences

- Users receive one coherent Wayglass origin and can move among normative guidance, component
  inspection, and admitted examples without subdomain drift.
- One deployment manifest makes version mismatch and rollback easier to detect.
- Independent builds preserve VitePress, Storybook, and application ownership while adding a small
  deterministic composition layer.
- Storybook and walkthroughs need explicit base-path validation before deployment.
- A future path-aware Worker may be necessary for walkthrough navigation, but normal static assets
  continue to bypass Worker code.
- Deploying one surface requires rebuilding the admitted set so the production artifact remains
  coherent.
- Walkthrough admission carries real documentation, accessibility, privacy, content, and support
  cost; no private app is exposed by default.
- The first implementation adds Cloudflare tooling and external configuration that must be owned,
  audited, and reconstructable.

## Alternatives considered

### Use Cloudflare Pages

Rejected as the new baseline. Pages can host the current static outputs, but Cloudflare's current
guidance recommends Workers Static Assets for new static and full-stack sites. Workers also gives a
single path from static hosting to the narrowly scoped routing an admitted walkthrough may require.

### Use separate projects or subdomains for documentation and Storybook

Rejected for the initial public system. Separate deploys reduce composition work but allow versions,
headers, navigation, rollback, and support labels to drift. They also fragment the already confirmed
documentation origin. A future high-risk live integration may deserve a separate origin, but a
synthetic static walkthrough does not receive one automatically.

### Embed Storybook inside the VitePress build

Rejected. Storybook is its own generated application with a manager, preview frames, assets, and
tooling. Making VitePress generate or own it would couple two valid independent build systems and
blur normative documentation with inspection fixtures.

### Give every missing route a global SPA fallback

Rejected. It would return the wrong application shell and successful status for misspelled
documentation, Storybook assets, and unknown paths. Fallback is scoped to an admitted walkthrough's
navigation prefix.

### Deploy all reference applications immediately

Rejected. The applications are private synthetic evidence with root-owned routers, incomplete
public-support gates, and no deployment admission. Repository build success is not publication or
hosting approval.

### Add Cloudflare configuration in this decision

Rejected. Account state, DNS, dependency review, build composition, credentials, and launch policy
need their own validated implementation. An unexecuted configuration file would look more complete
than the external prerequisites actually are.

## External basis

This decision was verified on August 15, 2026 against current Cloudflare documentation:

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/), including
  atomic Worker-and-asset deployment, caching, and not-found behavior;
- [Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/),
  which recommends Workers Static Assets for new static sites and applications;
- [Static Assets configuration and bindings](https://developers.cloudflare.com/workers/static-assets/binding/),
  including the one-asset-collection boundary and asset binding;
- [Static Assets HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/),
  for canonical path behavior;
- [Workers Builds Git integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/)
  and [build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/),
  for GitHub-connected production and preview versions;
- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/),
  for exact-host routing, managed DNS records, and certificates; and
- [Static Assets headers](https://developers.cloudflare.com/workers/static-assets/headers/), for
  repository-defined response rules.

Cloudflare capabilities may change. The implementation pull request must re-verify platform behavior
rather than treating this dated review as an API guarantee.
