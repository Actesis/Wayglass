# Phase 5G ecosystem closeout plan

**Status:** Proposed on September 1, 2026 for project-owner review. This plan closes Phase 5 across
accepted, guidance-only, rejected, and deferred work. It does not publish a package, deploy a site,
create a credential, reopen a deferred exploration, promote a private candidate, or make a public
support claim.

This plan follows the [Phase 5 roadmap](../phase-5.md),
[ecosystem artifact architecture](../architecture/adr/0031-ecosystem-artifact-architecture.md),
[release-governance contract](../governance/release-governance.md), and
[Phase 5 validation plan](./phase-5-validation-plan.md). It produces an integrated validation record
and a final roadmap disposition. Passing the closeout matrix may complete Phase 5 while every
package remains private and documentation remains undeployed.

## Closeout decision

Phase 5G asks whether the accepted Phase 5 boundaries still hold together at one exact repository
revision and whether every remaining external or human gate has an explicit owner and impact.

It does not ask whether every candidate should ship. The expected passing result is narrower:

1. permanent private tools and retained candidates still pass their accepted contracts;
2. rejected and guidance-only executable surfaces remain absent;
3. deferred tracks remain closed until their objective triggers are met;
4. foundation, optional, integration, tooling, framework, example, and deployment tiers remain
   isolated;
5. documentation, Storybook, examples, generated artifacts, and private evidence identify one source
   revision without claiming a deployment that does not exist; and
6. npm publication, Cloudflare launch, compatibility, assistive-technology, provider, device, and
   representative-user claims are either separately approved or explicitly carried.

## Accepted input ledger

| Track or boundary                     | Accepted outcome                                                                                            | Retained surface                                                                                                           | Closeout obligation                                                                                                                                                                              | Carried gate or restart trigger                                                                                                                                        |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 5A ecosystem architecture       | Complete                                                                                                    | ADRs 0031–0032, release governance, exploration contract, validation plan, application guidance                            | Verify later tracks still use the accepted tiers, inward dependencies, private-release state, and explicit authority boundaries                                                                  | Publication and deployment remain separate decisions                                                                                                                   |
| Phase 5B token interchange            | Private artifact candidate implemented under ADR 0033                                                       | `tooling/token-interchange`, authored token sources, deterministic web and partial exchange outputs, retained evidence     | Run generation, drift, fingerprint, failure, capacity, isolation, and root integration checks; verify foundation consumers do not install the tool                                               | External consumer required before package or interoperability proposal                                                                                                 |
| Phase 5C rich visualization           | Narrow native SVG/HTML optional-runtime candidate retained privately; dependency-backed candidates rejected | `experiments/phase-5c-rich-visualization` native proof and historical evidence                                             | Run focused unit, browser, adaptation, adverse, replacement, bundle, performance, exact-equivalence, and isolation checks; verify uPlot/D3 remain absent                                         | Independent application before permanent implementation; NVDA/Firefox before desktop screen-reader claim; low-power device before such performance claim               |
| Phase 5D-A icon tooling               | Trimmed private tooling implemented under ADR 0034                                                          | `tooling/icon-pipeline`, authenticated four-icon runtime artifacts, generated review and manifest files, retained evidence | Run catalog, generation, integrity, drift, adverse, isolation, root, minimum/current runtime, and output-authentication checks                                                                   | Independent contributor workflow before public contribution claim; release governance before publication                                                               |
| Phase 5D-B design library             | Deferred                                                                                                    | Governance record only; no Figma artifact or connection                                                                    | Verify no design-tool dependency, credential, generated library, or second token authority entered the repository                                                                                | Named workspace, access, versions, reviewer, backup, linkage, and drift plan                                                                                           |
| Phase 5E Home Assistant               | Guidance only                                                                                               | Domain-neutral external-state guide, bounded provider recipe, charter, stage evidence, raw measurements                    | Build and link-check guidance; verify executable proof, credential, provider dependency, production import, root command, and compatibility claim remain absent                                  | Separate live-environment approval; second consumer and compatibility/security owner before shared runtime                                                             |
| Phase 5F additional framework wrapper | Deferred                                                                                                    | Dispositioned demand audit only                                                                                            | Verify React remains the only accepted binding and no speculative wrapper, dependency, generated output, or compatibility claim exists                                                           | Named application, reproducible direct-use gap, exact versions/rendering mode, and compatibility maintainer                                                            |
| Release and package boundary          | No publish approval                                                                                         | Seven candidate package manifests remain private at `0.0.0`; `@wayglass/eslint-config` remains repository-private          | Inspect manifests, exports, files, dependencies, peers, license/notice inclusion, pack contents, side effects, clean install boundary, and exact release blockers without changing package state | Separate exact publish proposal, registry bootstrap, provenance, rehearsal, human approval, recovery, and manual support gates                                         |
| Documentation delivery                | Architecture accepted; implementation and launch not authorized                                             | VitePress, Storybook, examples, and ADR 0032                                                                               | Build all surfaces from one revision; audit links, generated assets, source identity, privacy, secrets, and current absence of deployment configuration                                          | Zone/DNS/account verification, public-content decision, tooling review, deterministic site assembler, headers/routing, preview/rollback rehearsal, and launch approval |

An entry is not reopened merely because Phase 5G validates it. New implementation work still
requires the authority named by its accepted record.

## Work breakdown

### Phase 5G-A — Freeze the ledger and repository baseline

Record one source commit, operating system, architecture, Node, pnpm, TypeScript, Playwright,
browser, and package-manager state. From a clean checkout and committed lockfile:

- reconcile every Phase 5 track with its lifecycle state, disposition, retained files, owner,
  cleanup, unsupported claims, and restart triggers;
- inventory packages, exports, examples, applications, docs, stories, experiments, tooling,
  generated artifacts, dependencies, workflows, deployment files, and root commands;
- verify there is no open Phase 5 charter still marked `proposed`, `charter-accepted`, or
  `evidence-complete` without an accepted next action;
- verify rejected dependencies, obsolete proofs, temporary workflows, caches, traces, credentials,
  external downloads, and migration-only artifacts are absent; and
- create the initial integrated-validation ledger with actual commands and exact limitations.

This stage changes no production surface. A mismatch stops closeout until the originating record or
repository state is corrected explicitly.

### Phase 5G-B — Run the integrated automated and browser matrix

Run the repository and accepted ecosystem surfaces as one versioned system:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test:browser
```

The authoritative run must not rely solely on replayed cache output. Record scheduled, passed,
failed, and intentionally skipped cases separately. It must include:

- every production package build, typecheck, unit suite, explicit-registration and package-surface
  check already in the repository;
- token and icon generation, drift, output-integrity, failure, isolation, and root-command checks;
- the full Phase 5C native visualization unit and supported-browser matrix;
- VitePress, Storybook, Vanilla, React, and the three reference-application builds and browser
  routes;
- themes, densities, phone, desktop, wall, 200% text, long content, RTL, forced colors, grayscale,
  reduced motion, keyboard, pointer, touch, focus, forms, native semantics, and Axe cases already
  carried by the full matrix; and
- exact-table and nonvisual equivalence for the retained visualization task.

A flaky or environmental rerun is recorded as adverse evidence. It is not silently replaced by a
passing result.

### Phase 5G-C — Audit artifact isolation, packaging, security, and licenses

Use an isolated temporary directory and local pack/rehearsal operations only. Do not change
`private`, version, registry, GitHub, Cloudflare, or npm state.

- inspect the seven candidate package manifests, export maps, `files`, built output, dependency and
  peer graph, side-effect declarations, TypeScript declarations, package ownership, license, and
  notice content;
- produce local package tarballs for inspection only when the current private manifest supports a
  truthful pack rehearsal; record a blocked rehearsal rather than editing metadata
  opportunistically;
- verify foundation-only consumers contain no icons, React, provider, visualization, token-tooling,
  icon-tooling, design-tool, or deployment code unless explicitly imported;
- scan source, built files, maps, manifests, evidence, and logs for credentials, private endpoints,
  personal data, unexpected network behavior, install scripts, unapproved telemetry, and
  provider-specific runtime leakage;
- confirm uPlot, D3, Home Assistant runtime code, design-tool SDKs, and speculative framework peers
  are absent from the dependency and bundle graphs; and
- record dated dependency, advisory, license, provenance, compatibility, and support limitations
  without claiming a future release audit remains current indefinitely.

This stage may conclude that a package is not release-ready. That is compatible with closing Phase 5
and must not trigger package metadata or publication work without a separate decision.

### Phase 5G-D — Verify documentation-system coherence without deployment

Build VitePress, Storybook, examples, generated token artifacts, generated icon artifacts, retained
guidance, and private evidence from the same commit. Verify:

- documentation links, include wrappers, code samples, Storybook story imports, generated hashes,
  source revision, package privacy language, unsupported claims, and cleanup references;
- Storybook remains inspection evidence rather than normative documentation, and VitePress does not
  reproduce its interactive fixtures;
- examples remain synthetic, private, application-owned, credential-free, and excluded from any
  public walkthrough claim;
- no checked-in or generated deployment output, Wrangler configuration, Worker, DNS state,
  Cloudflare credential, analytics beacon, cookie, account, form submission, or public URL claim has
  appeared; and
- ADR 0032's site assembler, path-prefix, headers, routing, preview, rollback, DNS, ownership, and
  launch gates remain visible as unimplemented deployment prerequisites.

Local independent builds can pass this stage. Phase 5G does not implement the composed Cloudflare
artifact merely to close the phase.

### Phase 5G-E — Record human gates and final decisions

Create the final integrated validation record and Phase 5 roadmap disposition. They must:

- distinguish automated, observed, and inferred evidence;
- retain the completed Phase 5C VoiceOver/Safari task evidence without generalizing it to every
  component or workflow;
- carry Windows NVDA/Firefox, VoiceOver/iOS where mobile support is claimed, remaining component and
  application screen-reader procedures, representative five-second first-glance sessions,
  low-power-device performance, live-provider, independent-consumer, design-tool, deployment, and
  battle-testing evidence with named owners and exact release impact;
- explicitly decide to keep packages private or open a separately reviewed release proposal;
- explicitly decide to keep documentation undeployed or open a separately reviewed Cloudflare
  implementation and launch sequence;
- state which private candidates remain supported only as repository internals and which
  explorations are guidance-only, rejected, or deferred; and
- confirm that completing Phase 5 creates no npm, Cloudflare, provider, framework, design-tool,
  assistive-technology, device, or public-support claim beyond the recorded evidence.

The project owner reviews the final disposition after the integrated evidence is complete. Phase 5
does not close merely because commands pass.

## Cross-track evidence matrix

| Evidence ID | Stage | Claim                                                                                                                   | Method and expected result                                                                                                                                         | Retained artifact                          | Current status | Release impact                                                                                  |
| ----------- | ----- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------- |
| `P5G-E01`   | 5G-A  | Every started track has one accepted state, retained boundary, cleanup result, and objective gate                       | Reconcile roadmap, charters, contracts, ADRs, evidence, repository inventory, and git state; no unresolved lifecycle or unexplained artifact                       | `phase-5g-integrated-validation.md` ledger | Pending        | Blocks phase closeout                                                                           |
| `P5G-E02`   | 5G-B  | Repository, accepted tooling, retained visualization, docs, stories, examples, and packages pass together at one commit | Clean frozen install, uncached `pnpm check`, full supported-browser matrix, focused command counts, exact environments, and adverse rerun log                      | Integrated command and browser results     | Pending        | Blocks phase closeout for affected surface                                                      |
| `P5G-E03`   | 5G-B  | Browser-facing meaning and interaction remain equivalent across accepted presentation modes                             | Review full matrix for keyboard, touch, focus, forms, themes, responsive, RTL, forced-color, grayscale, reduced-motion, Axe, and exact-table cases                 | Integrated accessibility summary           | Pending        | Blocks affected private candidate or carries exact public gate                                  |
| `P5G-E04`   | 5G-C  | Optional and private artifacts do not enlarge unrelated foundation consumers                                            | Static imports, clean consumer builds, bundle/dependency scans, explicit registration, globals, provider/design/framework leakage, and complete-removal boundaries | Isolation audit                            | Pending        | Blocks phase closeout if boundary regressed                                                     |
| `P5G-E05`   | 5G-C  | Candidate package contents and release blockers are known without publication                                           | Manifest/export/files/type/pack/license/notice/dependency/peer/script/advisory/provenance review in isolated local staging                                         | Package and release-readiness audit        | Pending        | Does not grant publish approval                                                                 |
| `P5G-E06`   | 5G-C  | Security and privacy boundaries remain credential-free and network-bounded                                              | Scan source, outputs, maps, logs, evidence, configs, endpoints, telemetry, install scripts, and external-side-effect paths                                         | Security and privacy audit                 | Pending        | Blocks closeout on leak; does not prove production security                                     |
| `P5G-E07`   | 5G-D  | Documentation surfaces and generated artifacts agree at one source revision                                             | Build and inspect VitePress, Storybook, examples, token outputs, icon outputs, links, hashes, claims, and source identity                                          | Documentation-system audit                 | Pending        | Blocks phase closeout for drift; does not deploy                                                |
| `P5G-E08`   | 5G-D  | Cloudflare implementation and public walkthroughs remain outside current authority                                      | Verify absence of deployment configuration/output and map every ADR 0032 implementation gate                                                                       | Deployment-boundary audit                  | Pending        | Separate implementation and launch approval required                                            |
| `P5G-E09`   | 5G-E  | Human, provider, device, design-tool, consumer, and operational omissions have owners and exact impacts                 | Reconcile all carried ledgers; preserve completed evidence and prohibit broader inference                                                                          | Carried-gate ledger                        | Pending        | Blocks only the corresponding release/support claim unless the final disposition says otherwise |
| `P5G-E10`   | 5G-E  | Final Phase 5 outcomes and release/deployment decisions are explicit                                                    | Project-owner review of integrated evidence and roadmap disposition                                                                                                | `phase-5-roadmap-disposition.md`           | Pending        | Required for Phase 5 completion                                                                 |

## Carried-gate ledger

| Gate                                             | Current evidence                                                                                                                           | Owner                                                     | Phase 5 closeout treatment                                                                 | Required before                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| NVDA with Firefox on Windows                     | Unavailable locally; Phase 5C revision 3 accepts the omission for private disposition                                                      | Project owner or representative Windows reviewer          | Carry with exact untested tasks; do not claim cross-platform desktop screen-reader support | Affected desktop screen-reader support or public release scope that includes the carried surfaces |
| VoiceOver with Safari on macOS                   | Focused evidence exists for tabs, selected controls, and all seven Phase 5C tasks; broader component/application ledgers remain incomplete | Project owner or representative macOS reviewer            | Reuse only exact completed tasks; carry the rest                                           | Corresponding public desktop screen-reader claim                                                  |
| VoiceOver with Safari on iOS                     | Not completed for the complete supported mobile surface                                                                                    | Project owner or representative iOS reviewer              | Carry                                                                                      | Mobile assistive-technology support claim                                                         |
| Representative five-second first-glance sessions | No representative participants recorded                                                                                                    | Product owner                                             | Carry as formative evidence, never as an accessibility substitute                          | Real-user first-glance or prioritization claim                                                    |
| Low-power physical-device performance            | Phase 5C measurements are named-desktop only                                                                                               | Candidate owner                                           | Carry                                                                                      | Low-power tablet/device performance claim                                                         |
| Independent visualization consumer               | One synthetic queue task only                                                                                                              | Future application owner                                  | Keep candidate private                                                                     | Permanent implementation contract or package proposal                                             |
| Independent icon contribution workflow           | Maintainer-owned bounded catalog only                                                                                                      | Future contributor and maintainer                         | Keep tooling private                                                                       | Public contribution/workflow claim                                                                |
| Live Home Assistant environment                  | Synthetic evidence and guidance only                                                                                                       | Environment owner                                         | Keep provider runtime absent                                                               | Provider compatibility or live-integration claim                                                  |
| Figma workspace and ownership                    | No named workspace, access, versions, reviewer, backup, linkage, or drift plan                                                             | Design owner                                              | Keep Phase 5D-B deferred                                                                   | Any design-library work or compatibility claim                                                    |
| Additional framework consumer                    | No named application, direct-use gap, versions, rendering mode, or maintainer                                                              | Future application and compatibility owner                | Keep Phase 5F deferred                                                                     | Any additional framework proof, package, or support claim                                         |
| npm publication                                  | Identity and governance only; packages private at `0.0.0`                                                                                  | Project owner and release owner                           | Make an explicit keep-private or separate-release decision                                 | Registry bootstrap, version, tag, provenance, publish, or public package support                  |
| Cloudflare deployment                            | ADR 0032 architecture only; no implementation or account state                                                                             | Project owner, Cloudflare account owner, deployment owner | Make an explicit keep-undeployed or separate-implementation decision                       | Preview, custom domain, production launch, analytics, walkthrough, or deployment support claim    |

Windows access remains unavailable in the current local environment. Phase 5G records that gate and
may close the private phase without it; it cannot erase or downgrade the corresponding release
obligation.

## Stop and correction rules

Stop Phase 5G and correct the affected boundary if:

1. an exploration lacks an accepted outcome or retained files contradict its disposition;
2. a rejected dependency, provider runtime, speculative wrapper, design artifact, credential,
   deployment file, or public claim has entered without authority;
3. token or icon generation is nondeterministic, stale, unauthenticated, or capable of replacing
   accepted output after invalid input;
4. the retained visualization fails exact equivalence, keyboard/focus behavior, adverse updates,
   supported-browser isolation, or its accepted budgets;
5. a production package imports private tooling, an experiment, integration, example, framework
   binding, or optional runtime against the accepted dependency direction;
6. package contents omit required license/notice material or include unintended source, secrets,
   maps, tests, private records, or dependencies;
7. documentation contradicts package privacy, disposition, support, provider, deployment, or
   compatibility truth; or
8. a failed, skipped, unavailable, or inferred result is presented as a completed automated or human
   validation.

A correction remains scoped to restoring an accepted contract. Any new capability, package,
dependency, deployment implementation, public surface, or compatibility promise requires its own
authority rather than being folded into closeout.

## Exit artifacts

Phase 5G produces:

1. `docs/accessibility/phase-5g-integrated-validation.md`, containing exact automated, browser,
   package, isolation, security, documentation-system, and carried-gate evidence; and
2. `docs/phase-5-roadmap-disposition.md`, containing final accepted, private, guidance-only,
   rejected, deferred, release, deployment, and next-phase decisions.

The project owner must approve the final disposition. Until then, the Phase 5 roadmap remains active
even if all executable checks pass.
