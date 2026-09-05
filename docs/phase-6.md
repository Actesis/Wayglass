# Phase 6 v1 release and feedback-readiness roadmap

**Status:** Corrected by the project owner on September 2, 2026. Phase 6C-B is complete and Phase
6C-C is active. No package publication, repository-visibility change, npm action, Cloudflare
implementation, deployment, credential use, or public support claim is authorized until its specific
gate below is accepted.

Phase 6 turns the private system completed in Phases 0–5 into a defined, documented, independently
installable Wayglass v1 release. It derives v1 from the evidence already accumulated in this
repository, releases Wayglass for external use, and only then receives real-world feedback.

The project owner intends a separate SpaceTraders client to be the first substantial consumer. That
application is not part of this repository, this roadmap's implementation, or this work task. Its
architecture, repository, credentials, deployment, and use of Wayglass belong to its own project.
SpaceTraders feedback may later enter Wayglass as sanitized issues or proposals through the same
process as feedback from any other independent consumer.

## Phase objective

Define the smallest credible Wayglass v1 contract; close its remaining release blockers; validate
the exact packed artifacts in clean, domain-neutral consumers; publish only the approved packages;
deliver accurate documentation and Storybook at the approved Cloudflare origin; and establish a
controlled intake for post-release feedback.

Phase 6 is successful when an external application can install, understand, use, and remove the
released packages without repository knowledge or maintainer intervention. A completed SpaceTraders
application is not a Wayglass v1 prerequisite.

## Governing boundaries

1. V1 scope comes from completed Wayglass contracts and evidence, not speculative consumer needs.
2. Private artifacts remain excluded unless their existing evidence supports an explicit v1
   decision.
3. Clean-package consumers are release fixtures, not application frameworks or domain authorities.
4. No external application repository becomes a Wayglass workspace package, fixture authority,
   release dependency, or required validation environment.
5. Package validation uses packed artifacts rather than workspace links or source imports.
6. Production or personal consumer data, credentials, endpoints, screenshots, and logs never enter
   Wayglass fixtures, issues, documentation, or build artifacts.
7. Publication, repository visibility, documentation implementation, production deployment,
   analytics, and public announcement are independent state changes with independent approval.
8. Documentation describes the registry and deployed state truthfully; it must not present private
   candidates as installable releases or previews as production.
9. Post-release feedback is evidence, not automatic API promotion. Domain-specific behavior remains
   in the consumer that owns it.
10. All packages remain private and no Cloudflare resource changes until the corresponding accepted
    stage explicitly authorizes implementation or execution.

## Work sequence

### Phase 6A — V1 contract inventory and proposed scope

Create one exact inventory of the current production surface:

- list every package, export, Custom Element, React wrapper, stylesheet, token, theme, icon,
  subpath, event, public type, and testing or tooling candidate;
- connect each proposed public item to its accepted contract, tests, documentation, accessibility
  evidence, compatibility evidence, owner, and maintenance expectation;
- identify breaking corrections, naming changes, deprecations, missing metadata, migration needs,
  and unresolved carried gates;
- propose foundation-family and independently versioned package membership under ADR 0031;
- name every private artifact explicitly excluded from v1 and why;
- define proposed browser, Node, React, rendering, device, and assistive-technology claims from
  completed evidence only; and
- record support, security, issue-triage, deprecation, and maintenance ownership.

No new feature is added merely to make the inventory look complete. A missing contract is either a
release blocker for an already-promised surface or an explicit exclusion.

**Exit gate:** The project owner accepts one exact proposed v1 scope and exclusion record. That
acceptance authorizes stabilization work, not publication.

### Phase 6B — Contract correction and scope freeze

Resolve only the blockers identified by the accepted inventory:

1. correct public names, exports, types, tokens, styles, registration behavior, metadata, peer
   ranges, documentation, tests, and accessibility gaps required by the proposed scope;
2. add an ADR for any consequential contract or compatibility decision;
3. preserve side-effect-free element imports and explicit Custom Element registration;
4. keep framework-neutral behavior outside bindings and optional artifacts outside foundation;
5. re-run affected browser, accessibility, visual, performance, packaging, and compatibility
   evidence;
6. decide initial versions and compatibility ranges without assuming every package shares the
   foundation version; and
7. freeze one exact commit and public-surface inventory.

A scope expansion returns to Phase 6A. Private usefulness does not imply v1 admission.

**Exit gate:** The project owner accepts one exact v1 scope-freeze commit with no unresolved
severity-one or severity-two release blocker.

### Phase 6C — Release-candidate and independent-consumer proof

Prove the frozen packages without contacting npm:

- build each release unit from a clean checkout of the frozen commit;
- run formatting, linting, type checking, unit, component, browser, accessibility, visual,
  performance, documentation, and package-content gates required by its scope;
- produce, inspect, and hash local tarballs in dependency order;
- verify licenses, notices, repository metadata, exports, types, styles, source maps, side effects,
  peer ranges, and absence of private files or secrets;
- install the tarballs into clean domain-neutral Vanilla and React consumers outside the monorepo;
- prove production build, runtime rendering, explicit registration, interaction, representative
  semantics, and complete removal;
- scan current dependencies, advisories, licenses, provenance inputs, and packed contents; and
- record reproducible commands, environment versions, results, limitations, and artifact hashes.

The consumers are minimal release probes. They do not implement SpaceTraders, another real product,
or a new Wayglass example application.

**Exit gate:** Every proposed v1 release unit passes the clean candidate matrix from the exact
scope-freeze commit, or is removed from the release proposal.

### Phase 6D — Documentation and Storybook delivery implementation

Prepare the unified Cloudflare delivery described by ADR 0032 without launching production:

- verify the Cloudflare account, zone, exact hostname, existing DNS, route conflicts, access, and
  operational owners;
- confirm the intended documentation origin spelling before any DNS or route change;
- decide repository and content visibility and re-check current Cloudflare platform guidance;
- implement deterministic documentation and Storybook composition with a source manifest;
- prove Storybook under `/storybook/` without rewriting generated output;
- define routing, headers, cache behavior, CSP, 404s, canonical URLs, preview `noindex`, rollback,
  and incident response;
- make installation, package status, versions, compatibility, limitations, support, and migration
  guidance match the frozen candidate exactly; and
- admit no walkthrough, analytics, or consumer material without its own privacy, accessibility,
  support, and ownership decision.

Preview infrastructure and URLs must be clearly non-production and must not claim that npm packages
exist before registry verification.

**Exit gate:** The implementation and preview evidence are accepted. Production launch remains a
separate decision.

### Phase 6E — Initial npm release

Prepare and execute only the exact proposal required by the accepted release-governance contract:

- name release units, versions, dependency order, commit, tags, dist-tags, hashes, contents,
  compatibility, known limitations, owners, and support channels;
- decide repository visibility and complete the public-source history review if visibility changes;
- verify protected GitHub workflow behavior, pinned actions, minimal permissions, npm organization
  controls, maintainer 2FA, recovery contacts, provenance, and first-package bootstrap mechanics;
- rehearse partial failure, withdrawal, deprecation, and incident recovery;
- obtain human approval immediately before any registry, tag, or visibility change;
- publish in the accepted dependency order without rebuilding the approved artifacts; and
- verify registry contents, provenance, versions, dist-tags, clean installs, and imports before
  calling the release available.

If approval is withheld, Phase 6 may retain a validated private candidate. Planning success never
removes `private: true`, changes versions, creates tags, or contacts npm by implication.

**Exit gate:** The approved packages are independently installable from npm and registry
verification matches the frozen proposal, or the no-release disposition is recorded.

### Phase 6F — Production documentation launch

After package status can be described truthfully:

- update the production source identity and package-installation state;
- run the complete production-content, link, route, header, CSP, accessibility, privacy, and
  rollback checks;
- obtain separate approval for DNS, route, or production deployment changes;
- promote the accepted immutable artifact rather than rebuilding it;
- attach the approved custom hostname and verify canonical URLs, `/storybook/`, 404s, caching,
  source identity, support contacts, and rollback; and
- announce availability only after npm and production-site verification both pass.

Documentation may launch while packages remain private only if it says so clearly and the project
owner approves that independent outcome. Analytics remains absent unless separately proposed.

**Exit gate:** The approved documentation and Storybook artifact is verified at the production
origin, or the no-launch disposition is recorded.

### Phase 6G — External feedback intake and roadmap disposition

Once v1 is available, independent applications may test it in their own repositories and tasks.
Wayglass receives only sanitized, reproducible findings that identify:

- released version, package, public contract, environment, task, expected behavior, observed
  behavior, severity, workaround, and removal impact;
- whether the finding is a Wayglass defect, documentation gap, compatibility gap, ergonomic issue,
  missing domain-neutral capability, consumer-owned policy, provider behavior, or unsupported
  request; and
- the smallest responsible owner and required regression evidence.

The planned SpaceTraders client is one such consumer, not a privileged source of requirements.
Wayglass work may link to its sanitized findings but does not coordinate its implementation,
credentials, data, deployment, or architecture here.

Close Phase 6 with verified release and deployment results, initial feedback disposition, retained
private artifacts, known limitations, and the next roadmap. If publication or deployment was not
approved, record the validated private outcome and its remaining gates instead.

**Exit gate:** Released or retained outcomes are verified, feedback received to date is owned, and
the project owner accepts the final disposition.

## Cross-stage evidence gates

| Evidence ID | Claim                                                           | Required evidence                                                                                                     | Authority                          |
| ----------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `P6-E01`    | V1 scope contains only evidence-backed contracts                | Accepted package/export inventory, compatibility and support proposal, exclusions, carried-gate disposition           | Project owner and release owner    |
| `P6-E02`    | The frozen v1 contracts are internally complete                 | Corrected contracts, tests, documentation, ADRs, compatibility ranges, exact freeze commit                            | Project owner and maintainers      |
| `P6-E03`    | Release artifacts are reproducible and independently consumable | Clean matrix, inspected tarballs and hashes, Vanilla and React install/build/run/removal, security and license checks | Release owner                      |
| `P6-E04`    | Documentation delivery is ready for launch review               | ADR 0032 gates, immutable preview, accurate package state, accessibility/privacy/security checks, rollback            | Project owner and deployment owner |
| `P6-E05`    | The initial npm release is verified                             | Approved proposal, registry artifacts, provenance, clean installs, recovery evidence                                  | Project owner and release owner    |
| `P6-E06`    | Documentation and Storybook are verified in production          | Approved promotion, origin and route checks, source identity, headers, rollback, support links                        | Project owner and deployment owner |
| `P6-E07`    | Post-release outcomes are controlled and dispositioned          | Sanitized feedback, classification, corrective results, limitations, final roadmap disposition                        | Project owner                      |

## Stop and correction rules

Stop the affected stage if:

1. a proposed v1 item lacks an accepted public contract, evidence, owner, or removal path;
2. a workspace link or source import hides a package, export, peer, metadata, or side-effect defect;
3. an import registers Custom Elements as a side effect;
4. private tooling, examples, provider code, secrets, or consumer data enter a packed artifact;
5. a release is rebuilt after its accepted hashes are recorded;
6. automated evidence is presented as observed human, assistive-technology, physical-device, live-
   service, registry, or production evidence;
7. documentation claims a package, compatibility level, or deployed behavior that is not verified;
8. a package, repository, npm, Cloudflare, DNS, analytics, or public announcement changes without
   its exact approval;
9. external application work is brought into the Wayglass repository or treated as a release gate;
   or
10. a consumer request lacks domain-neutral evidence and a clear Wayglass owner.

A correction restores the accepted boundary. Material scope expansion returns to the project owner
and repeats all affected evidence.

## Project-owner correction

On September 2, 2026, the project owner clarified the intended order and ownership:

1. finish Wayglass v1 using the evidence already accumulated in this repository;
2. publish the approved npm packages and deliver documentation and Storybook through separately
   approved release and deployment steps;
3. build and operate the SpaceTraders client later as a separate project; and
4. use that client and other independent consumers for real-world post-release feedback.

This correction supersedes the earlier proposal to make SpaceTraders integration a prerequisite for
the Wayglass v1 scope freeze. It activates Phase 6A v1 inventory work and authorizes no external
application activity.
