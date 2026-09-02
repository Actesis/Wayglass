# Phase 6 real-world validation and v1 readiness roadmap

**Status:** Accepted by the project owner on September 2, 2026. Phase 6A is active. No application
integration, package release, repository-visibility change, npm action, Cloudflare implementation,
deployment, credential, or public support claim is authorized until the relevant stage and approval
gate below is accepted.

Phase 6 turns Wayglass from a thoroughly tested private system into an evidence-based v1 candidate.
It follows the [Phase 5 final disposition](./phase-5-roadmap-disposition.md), which directs the next
planning activity to begin with a real-world application, derive v1 scope from that pressure, and
keep npm publication and Cloudflare deployment as separately approved operations.

The project owner confirmed a client for [SpaceTraders](https://spacetraders.io) as the first
real-world consumer. Phase 6A must still record the client's exact name, repository, access path,
technology stack, owners, and accepted application charter before integration work starts.

## Phase objective

Establish what Wayglass v1 should actually promise by integrating private candidate artifacts into
one independently owned application, observing their behavior under real workflows and data, fixing
only demonstrated domain-neutral gaps, and then preparing separately reviewed release and
documentation-delivery proposals.

Phase 6 is successful if it produces a smaller, more credible public contract. It does not require
every private candidate, example, experiment, or deferred ecosystem track to ship.

## Governing boundaries

1. The consumer application owns its domain records, storage, transport, authentication,
   authorization, routes, orchestration, analytics, privacy decisions, and business consequences.
2. Wayglass owns only domain-neutral semantics, components, tokens, themes, framework bindings, and
   documented public behavior accepted through reviewed evidence.
3. Real application use is evidence, not automatic API promotion. Similar local code remains local
   until a reusable contract and ownership boundary are demonstrated.
4. The application repository does not become a Wayglass workspace package, fixture authority, or
   release dependency.
5. Private package consumption must be reproducible without publishing to npm and must test packed
   artifacts rather than relying solely on monorepo workspace links.
6. Production or personal data never enters Wayglass fixtures, screenshots, logs, issues, build
   artifacts, or documentation. Sanitized synthetic reproductions are created only when needed.
7. A Wayglass defect may be fixed during the application proof; a new public capability requires a
   contract, tests, documentation, accessibility evidence, and consequential ADR where appropriate.
8. Package publication, repository visibility, documentation deployment, walkthrough admission,
   analytics, and public announcements remain independent state changes with independent approval.

## Work sequence

### Phase 6A — Application nomination and battle-test charter

Confirm the application before touching either codebase. The accepted charter must record:

- application name, repository, owner, access path, technology stack, rendering model, supported
  devices, browsers, operating systems, and assistive-technology targets;
- real users and the operational questions they must answer, without copying private user data;
- workflows selected to exercise overview, focused functions, state axes, controls, forms, feedback,
  dense data, temporal data, media, responsive layouts, and failure recovery;
- existing application architecture and the exact boundary where Wayglass enters;
- data classification, screenshot/log rules, credential ownership, secret handling, and deletion or
  sanitization requirements;
- the initial set of private Wayglass packages and why each is necessary;
- baseline usability, accessibility, bundle, startup, update, memory, and maintenance measurements;
- a rollback path that can remove Wayglass without corrupting application data or behavior; and
- defect, candidate-gap, application-policy, and out-of-scope classification rules.

**Exit gate:** The project owner and application owner accept one charter. Without it, Phase 6 does
not modify Wayglass or the consumer application.

### Phase 6B — Reproducible private consumer integration

Create a clean, reviewable integration path before broad feature work:

1. build exact private Wayglass packages from one committed source revision;
2. produce and hash local tarballs without changing package privacy or contacting npm;
3. install only the nominated artifacts into an isolated consumer branch or worktree;
4. record package graph, styles, explicit Custom Element registration, React adaptation where used,
   and client-only rendering behavior;
5. prove clean install, typecheck, production build, startup, representative navigation, and
   complete removal from the consumer;
6. verify that the consumer receives no private tooling, examples, experiments, provider code, or
   unrelated optional runtime; and
7. establish a repeatable refresh procedure for later Wayglass candidate revisions.

Local tarball or other private artifact mechanics are chosen in the charter. A filesystem shortcut
that hides missing exports, metadata, peer ranges, or package contents is not sufficient evidence.

**Exit gate:** One independently owned consumer builds and runs from inspected private artifacts,
and removal restores its prior dependency and runtime boundary.

### Phase 6C — Real workflow and stress validation

Implement the chartered workflows in slices. Each slice begins with current Wayglass composition and
adds framework-neutral package behavior only when the real application demonstrates a gap.

Validation must include, where applicable:

- orientation, first-glance recognition, investigation, action, confirmation, failure, retry,
  recovery, and durable outcome;
- simultaneous overview and focused Function Deck compositions;
- independent condition, knowledge, activity, Boolean, scalar, trend, freshness, confidence,
  request, and confirmed-effect meaning;
- realistic empty, loading, stale, unavailable, partial, error, long-content, and maximum-data
  states;
- identifying media and focused inspection without making images the sole instruction or evidence;
- phone, tablet, desktop, and any wall or kiosk presentation actually used by the application;
- keyboard, pointer, touch, focus, zoom, 200% text, RTL mechanics, forced colors, grayscale, reduced
  motion, and supported-browser behavior;
- representative VoiceOver/Safari and NVDA/Firefox tasks for desktop release scope, plus iOS
  VoiceOver if mobile assistive-technology support is proposed;
- representative first-glance sessions and physical-device performance for any claim that depends on
  them;
- real persistence, network interruption, authorization denial, stale truth, concurrent updates, and
  recovery at the application-owned port; and
- bundle, startup, update, memory, and maintenance measurements against the Phase 6A baseline.

Every finding is classified as a Wayglass defect, missing domain-neutral contract, theme/token
pressure, application-owned policy, provider/platform behavior, documentation gap, or unsupported
request. The smallest responsible owner receives the fix.

**Exit gate:** All chartered workflows have accepted evidence and no unresolved severity-one or
severity-two Wayglass defect. Lower-severity limitations are owned and mapped to v1 impact.

### Phase 6D — V1 contract and scope freeze

Use the consumer evidence to decide the initial public surface:

- list every package and export proposed for v1 and every private artifact explicitly excluded;
- identify contract corrections, deprecations, naming changes, token changes, and migration needs;
- select initial versions and compatibility ranges without assuming every package shares the
  foundation version;
- define supported browsers, Node versions, React versions, rendering modes, devices, and
  assistive-technology claims from completed evidence only;
- close or explicitly exclude each carried Phase 5 gate affected by the proposed surface;
- define public documentation, examples, Storybook stories, security reporting, maintenance,
  deprecation, and support ownership;
- complete package metadata, public-helper inventory, icon compatibility record, changelog baseline,
  and release-note structure; and
- run the complete clean candidate matrix at the exact scope-freeze commit.

A private artifact may remain useful without entering v1. Native visualization, token tooling, icon
tooling, testing helpers, or the React binding each require their own evidence and release decision.

**Exit gate:** The project owner accepts one exact v1 scope-freeze record. Scope changes after that
point require a reviewed revision and repeated affected evidence.

### Phase 6E — Initial npm release proposal

Prepare, but do not execute, the exact initial-release proposal required by the accepted
[release-governance contract](./governance/release-governance.md). It must name:

- release units, versions, dependency order, commit, tags, dist-tags, packed hashes, and contents;
- repository-visibility decision and public-source history review;
- package metadata, compatibility, known limitations, owners, and support channels;
- clean install/build/runtime consumers outside the monorepo;
- current dependency, advisory, license, notice, provenance, and secret scans;
- protected GitHub workflow, pinned actions, minimal permissions, npm organization controls,
  maintainer 2FA, recovery contacts, and first-package bootstrap method;
- partial-failure, deprecation, withdrawal, and incident recovery; and
- required human approval immediately before any registry or visibility change.

**Exit gate:** A separately reviewed publish proposal is accepted. Phase 6 planning and candidate
success alone never remove `private: true`, change versions, expose the repository, create tags, or
contact npm.

### Phase 6F — Documentation and Storybook delivery proposal

Prepare the Cloudflare implementation and launch sequence under
[ADR 0032](./architecture/adr/0032-unified-cloudflare-documentation-delivery.md). The proposal must
satisfy all ten carried gates:

- verify zone, hostname, account, existing DNS, route conflicts, and operational owners;
- decide repository and content visibility;
- re-check current Cloudflare platform guidance and justify any dependency;
- implement and test deterministic surface composition and its source manifest;
- prove Storybook under `/storybook/` without output rewriting;
- admit no walkthrough until its own content, privacy, accessibility, support, and base-path record
  passes;
- define path-aware routing, headers, cache behavior, CSP, 404s, canonical URLs, and preview
  `noindex` behavior;
- validate previews against the exact release documentation and package state;
- rehearse promotion, custom-domain attachment, rollback, and incident response; and
- require separate implementation and production-launch approvals.

Documentation implementation may precede package publication, but public pages must describe private
candidates honestly until registry verification is complete. Analytics remains absent unless
separately proposed with privacy, consent, retention, and ownership decisions.

**Exit gate:** The implementation proposal and later launch approval pass independently. No Phase 6
application or npm decision implicitly deploys the site.

### Phase 6G — Initial release feedback and roadmap disposition

After any separately approved publication and deployment:

- verify registry artifacts, provenance, install instructions, deployed source identity, links,
  headers, routing, rollback, and support contacts before announcing availability;
- collect feedback without sending application data or hidden telemetry;
- triage defects, contract gaps, documentation gaps, feature requests, and domain-specific requests
  separately;
- compare real-world and external-consumer results with the v1 claims;
- issue corrections through the accepted release and deployment recovery paths; and
- close Phase 6 with an explicit disposition for retained private work and the next roadmap.

If publication or deployment is not approved, Phase 6 may close at a validated private v1 candidate
with those later stages still explicitly unexecuted.

## Cross-stage evidence gates

| Evidence ID | Claim                                                                   | Required evidence                                                                                                                     | Authority                                                            |
| ----------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `P6-E01`    | One real application is a valid independent consumer                    | Accepted charter, owners, architecture, workflows, privacy boundary, baseline, and rollback                                           | Project owner and application owner                                  |
| `P6-E02`    | Private package consumption is reproducible and isolated                | Exact-source tarballs or accepted private artifacts, hashes, clean install/build/run/removal, and dependency audit                    | Application owner and Wayglass maintainer                            |
| `P6-E03`    | Wayglass supports the selected real workflows within recorded limits    | Workflow, adverse-state, responsive, accessibility, browser, device, performance, and recovery evidence                               | Application owner, representative reviewers, and Wayglass maintainer |
| `P6-E04`    | V1 scope contains only evidence-backed public contracts                 | Accepted package/export inventory, compatibility and support matrix, carried-gate disposition, clean candidate validation             | Project owner and release owner                                      |
| `P6-E05`    | An initial npm release is ready for a human go/no-go decision           | Complete release proposal, packed artifacts, external consumers, registry prerequisites, provenance, security, and recovery rehearsal | Project owner and release owner                                      |
| `P6-E06`    | Documentation delivery is ready for implementation and launch decisions | ADR 0032 gate completion, composed preview, accessibility/privacy/security checks, owners, and rollback rehearsal                     | Project owner and deployment owner                                   |
| `P6-E07`    | Released or retained outcomes are verified and dispositioned            | Registry and deployment verification when executed, feedback triage, limitations, corrective results, and final roadmap disposition   | Project owner                                                        |

## Stop and correction rules

Stop the affected stage if:

1. consumer data, credentials, private endpoints, or identifying screenshots enter Wayglass;
2. integration requires Wayglass to own the application's domain model or policy;
3. a workspace link or source import hides a package/export/peer/metadata defect;
4. an import registers Custom Elements as a side effect;
5. a requested abstraction lacks repeated domain-neutral behavior and a clear owner;
6. automated or inferred evidence is presented as observed human or live-system evidence;
7. a carried gate is silently dropped, weakened, or generalized;
8. a package, repository, npm, Cloudflare, DNS, analytics, or public claim changes without its exact
   approval; or
9. the application cannot remove Wayglass without losing its own data or behavior.

A correction restores the accepted boundary. Material scope expansion returns to the project owner
for a roadmap or charter revision.

## Project-owner decision

On September 2, 2026, the project owner approved and directed the merge of these decisions:

1. Phase 6 as the real-world validation and v1-readiness phase;
2. a SpaceTraders client as the first consumer, with its exact repository and integration context
   recorded in Phase 6A;
3. application proof before v1 scope freeze;
4. private packed-artifact consumption before any npm publication;
5. separate Phase 6E npm and Phase 6F Cloudflare approval gates; and
6. the possibility that Phase 6 closes with a private v1 candidate if publication or deployment is
   not approved.

That approval activates Phase 6A charter work. It does not authorize application integration, npm
publication, repository-visibility changes, Cloudflare implementation or launch, credentials, or a
public support claim.
