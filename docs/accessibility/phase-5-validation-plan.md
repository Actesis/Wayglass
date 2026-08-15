# Phase 5 ecosystem validation plan

**Status:** Accepted for Phase 5A on August 15, 2026. This plan defines the evidence required to
explore, accept, implement, release, and integrate Phase 5 artifacts. It does not accept an
ecosystem artifact, dependency, provider, design tool, deployment, support claim, or publication.

The plan applies the artifact tiers from
[ADR 0031](../architecture/adr/0031-ecosystem-artifact-architecture.md), the decision lifecycle from
the [ecosystem-exploration record](../governance/ecosystem-exploration-record.md), and the package
evidence required by [release governance](../governance/release-governance.md). Earlier component
and application matrices remain authoritative for existing foundation behavior.

## Validation principles

### Validate the user task and the ownership decision

An exploration must prove more than technical feasibility. Evidence must show that a credible user
can complete the named task, that the candidate improves on the accepted comparison baseline, and
that Wayglass is the appropriate long-term owner.

A passing prototype is rejected or retained as guidance when ordinary platform behavior, application
composition, direct Custom Element use, a provider SDK, or an existing tool owns the task more
honestly.

### Scale evidence with risk and claims

Every artifact uses the common evidence dimensions below, but its charter marks each dimension:

- **required:** evidence must pass before the current lifecycle transition;
- **conditional:** the record states the condition that makes it applicable;
- **not applicable:** the record explains why the artifact cannot make that claim; or
- **carried gate:** named human or external evidence remains incomplete with an owner and exact
  release impact.

An omitted row is a validation defect. A tool does not inherit browser interaction tests without a
browser surface, and an integration does not inherit provider support from deterministic fixtures
alone.

### Separate automated, observed, and inferred evidence

- **Automated evidence** is reproducible from a named commit, command, fixture, and environment.
- **Observed evidence** records a named reviewer, procedure, environment, result, and limitation.
- **Inferred conclusions** identify the evidence they rely on and remain narrower than that
  evidence.

Automated accessibility checks are not screen-reader evidence. Local timing is not a universal
performance claim. A mock response is not provider compatibility. A generated design file is not
proof that its target tool preserves meaning.

### Keep validation deterministic by default

Normal repository checks use committed fixtures, fixed identifiers, controlled clocks, controlled
promises, local assets, and no network, credentials, personal data, or external mutation. Live
provider, hosted, or design-tool evidence runs separately under explicit approval and never becomes
a prerequisite for ordinary contributor checks.

## Evidence stages

| Stage                 | Purpose                                         | Minimum evidence                                                                   | Authority created                        |
| --------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------- |
| Exploration proposal  | Decide whether a bounded proof is worth running | User task, gap, comparison, risks, criteria, proof location, cleanup               | Read-only research only                  |
| Charter accepted      | Authorize the exact private proof               | Precommitted success, stop, reject, defer, revision, dependency, and evidence plan | Bounded private proof only               |
| Evidence complete     | Support a disposition                           | Actual results, adverse evidence, limitations, deviations, cleanup state           | Disposition review only                  |
| Artifact candidate    | Accept Wayglass ownership hypothesis            | Tier-specific task, quality, maintenance, and boundary evidence                    | Separate implementation contract and ADR |
| Implemented candidate | Verify permanent private surface                | Contract, tests, docs, compatibility, package or artifact boundaries               | Continued private validation             |
| Release candidate     | Verify the distributable unit                   | Clean build, pack or export inspection, consumer smoke, support gates, recovery    | Publish-approval review only             |
| Released or deployed  | Verify external state                           | Registry or host integrity, provenance, routing, install or task smoke, rollback   | Exact approved public claim              |

Evidence from an earlier stage may be reused only when the inputs, environment, contract, and claim
remain equivalent. The record identifies what was reused and why it is still valid.

## Common evidence ledger

Every track keeps one ledger with these fields:

| Field                 | Requirement                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| Evidence ID           | Stable identifier referenced by criteria and disposition                                                 |
| Artifact and revision | Exact record revision, source commit, artifact, and proposed version when applicable                     |
| Claim                 | One observable statement the evidence can support                                                        |
| Tier and stage        | Provisional or accepted tier plus lifecycle stage                                                        |
| Environment           | OS, architecture, runtime, browser, framework, provider, device, AT, or design-tool versions that matter |
| Input                 | Fixture, data envelope, authored file, package tarball, provider account class, or workflow              |
| Method                | Commands and human procedure, including warm-up, repetitions, and measurement boundaries                 |
| Expected result       | Threshold or behavior fixed before execution                                                             |
| Actual result         | Raw or summarized result with reproducible artifact link                                                 |
| Reviewer and date     | Person or role that executed or reviewed the evidence                                                    |
| Limitations           | Untested conditions, variance, unavailable environments, and claims not supported                        |
| Impact                | Pass, fail, stop, revise, defer, release block, or informational                                         |

Screenshots may support visual evidence but do not replace semantic, keyboard, responsive, or
structured result records. Generated reports are retained only when their content is reviewable and
contains no secret or sensitive data.

## Common validation dimensions

Every charter assigns a disposition to these dimensions before proof work:

| Dimension                     | Required question                                                                                                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task and comparison           | Can the named user complete the named task, and is the candidate materially better than doing nothing, guidance, platform use, or current Wayglass composition?                                   |
| Ownership and semantics       | Does the artifact preserve its tier boundary, application and external ownership, and independent Wayglass state axes without creating a universal domain model?                                  |
| Public surface                | Are names, exports, properties, events, files, generated identifiers, design objects, commands, and error behavior deliberate, typed or schema-checked where applicable, and documented?          |
| Isolation and side effects    | Do non-consumers avoid install, bundle, runtime, registration, global-state, credential, network, and support cost?                                                                               |
| Accessibility and equivalence | Can people reach the task and meaning without color, icons, vision, pointer precision, animation, or an unsupported interaction mode?                                                             |
| Compatibility                 | Are supported browsers, runtimes, frameworks, providers, and design-tool versions tested at stated minimum and current boundaries?                                                                |
| Responsive and localized use  | Do supported widths, text growth, long content, RTL mechanics, units, locale-sensitive formatting, forced colors, grayscale, and reduced motion preserve meaning where applicable?                |
| Performance and capacity      | Does the accepted data or artifact envelope remain within precommitted construction, update, memory, bundle, generation, or file-size budgets without semantic or focus loss?                     |
| Failure and recovery          | Are invalid input, partial data, unavailable dependencies, interrupted generation, denied authority, network loss, version mismatch, and rollback behavior explicit and safe?                     |
| Security and privacy          | Are trust boundaries, input handling, secrets, permissions, network destinations, telemetry, personal data, retention, supply chain, and incident ownership documented and tested proportionally? |
| Dependency and license        | Is every dependency gap justified, classified, licensed, maintained, audited, measured, and removable without leaking into unrelated consumers?                                                   |
| Determinism and drift         | Do identical accepted inputs produce identical meaningful outputs, and are stale or hand-edited derivatives detected?                                                                             |
| Documentation and support     | Are setup, use, limitations, compatibility, migration, security reporting, maintenance owner, and unsupported claims visible?                                                                     |
| Removal and recovery          | Can the proof or artifact be removed, deprecated, rolled back, or replaced without corrupting source authority or hiding consumer impact?                                                         |

## Repository baseline

Every implemented candidate passes, from a clean checkout and committed lockfile:

- formatting, lint, typecheck, unit tests, and all production builds through `pnpm check`;
- affected focused suites without cache-only reliance;
- `git diff --check` and a clean generated-output or drift check;
- dependency graph, lockfile, license, notice, install-script, vulnerability, and secret review;
- side-effect-free imports and explicit Custom Element registration where runtime modules apply;
- documentation links and production build for every changed public contract; and
- cleanup checks proving that temporary dependencies, exports, credentials, outputs, and prototypes
  are absent after a reject or guidance-only disposition.

Browser-facing candidates run the complete applicable Playwright matrix in current stable Chromium,
Firefox, and WebKit. A charter may add environments but may not silently remove an existing
supported engine. Browser updates that reveal a defect block the affected claim until corrected or
explicitly rescoped through a reviewed compatibility decision.

## Tier-specific matrices

### Foundation runtime

Foundation changes affect `core`, `tokens`, `themes`, or `elements` and therefore receive the
strictest existing runtime matrix.

Required evidence includes:

- identical domain-neutral semantics and ownership in at least two independently implemented domain
  contexts when adding public behavior;
- public type, token, CSS, element, registration, fallback, attribute, property, slot, part, method,
  and event contract tests as applicable;
- side-effect-free import plus duplicate-safe explicit registration;
- current Chromium, Firefox, and WebKit behavior for supported interactions and rendering;
- Vanilla and typed React parity for every wrapped behavior;
- dark and light themes, supported densities, phone, desktop, wall, 200% text, long content, RTL,
  forced colors, grayscale, reduced motion, keyboard, pointer, and touch evidence proportional to
  the surface;
- maximum reference fixtures and meaningful mutation with stable focus, selection, reading and
  scroll context, semantics, and containment;
- Axe scans plus production visual review in high-risk states; and
- VoiceOver/Safari and NVDA/Firefox task evidence before a public desktop screen-reader claim, plus
  VoiceOver/iOS Safari before a mobile assistive-technology claim.

The synchronized foundation family is packed and consumer-tested together even when only one package
changes materially.

### Optional runtime

An optional runtime artifact proves that consumers who do not import it receive no new dependency,
bundle, registration, global behavior, browser requirement, or support claim.

Required evidence includes:

- one credible complete task and a reason the capability does not belong in foundation runtime;
- direct import, explicit registration when relevant, removal, lazy-load, and duplicate-instance
  behavior;
- standalone installed and bundled cost, tree and transitive dependency audit, and comparison with
  the accepted baseline;
- accessibility, equivalence, browser, responsive, localization, performance, memory, and failure
  evidence proportional to its visual or interactive behavior;
- compatibility with its minimum and current supported foundation versions; and
- a clean consumer proving that foundation-only use contains none of the optional artifact.

Rich visualization additionally requires exact-value and relationship access without vision or
pointer precision, keyboard inspection when direct exploration exists, useful textual or tabular
equivalence, threshold and annotation semantics, and bounded behavior at the chartered multi-series
data envelope.

### Framework binding

A framework binding adapts framework-neutral behavior; it does not own new component behavior.

Required evidence includes:

- a named consumer and a demonstrated gap in direct Custom Element use;
- parity for properties, attributes, Boolean and complex values, native and typed events, refs,
  methods, slots or children, forms, focus, themes, registration, and fallback content;
- package and type tests at the minimum and current supported framework and TypeScript versions;
- client rendering, development strictness or equivalent repeated lifecycle, production build, and
  supported server-rendering or client-only fallback behavior;
- hydration tests only for modes the binding claims to support, with mismatch and pre-upgrade
  behavior documented;
- peer dependency, duplicate runtime, bundle, tree-shaking, and side-effect inspection; and
- equivalent task and accessibility results against direct Vanilla use and the React baseline.

If direct use is sufficient, framework documentation is the passing guidance-only outcome.

### Integration

An integration translates an external provider boundary into application-owned truth. It does not
create a universal Wayglass record schema or infer provider guarantees.

Required deterministic evidence includes:

- versioned representative contract fixtures for valid, partial, stale, conflicting, unavailable,
  malformed, unauthorized, rate-limited, disconnected, and recovered provider behavior;
- mapping of external values, availability, time, source, commands, and acknowledgements without
  conflating condition, knowledge, activity, request, or confirmed effect;
- credential redaction, browser-bundle exclusion, least privilege, input validation, origin and
  transport policy, reconnect and backoff, rate behavior, and bounded logging;
- cancellation, retry, deduplication, ordering, partial response, version mismatch, and safe
  removal;
- zero live network or secret requirement for ordinary repository checks; and
- package isolation proving foundation and unrelated consumers do not install provider code.

Before a provider compatibility claim, a separately approved live smoke record names the provider
environment and version, account and permission class, data set, network context, credential owner,
mutation boundaries, cleanup, date, observed behavior, and exact limitations. A mock-only result
cannot pass that gate.

### Build and validation tooling

Tooling proves semantic preservation and useful failure behavior without becoming an application
runtime dependency.

Required evidence includes:

- at least two real outputs or workflows that need the same semantics and ownership;
- clean execution at the minimum and current supported Node and package-manager versions;
- identical meaningful output from identical normalized input, independent of working directory,
  locale, time zone, path separator, file ordering, and wall clock where applicable;
- schema, type, CLI, configuration, diagnostics, exit code, dry-run, overwrite, interruption,
  partial-output, and rollback behavior;
- golden or structural comparisons that distinguish meaningful drift from harmless serialization;
- output license, notice, source attribution, version linkage, and reproducible manifest;
- installed size, execution time, memory, dependency, install-script, and supply-chain audit; and
- proof that generated runtime artifacts do not require the tool or its dependencies at runtime.

`@wayglass/testing` helpers additionally satisfy the
[application-validation boundary](../governance/application-validation-boundary.md): two independent
consumers, documented public Wayglass behavior, framework-neutral semantics, no private Shadow DOM,
and no conversion of automated checks into human support claims.

### Design artifact

A design artifact proves that designer-facing output preserves code-owned semantics without making
the design tool a second source of truth.

Required evidence includes:

- one named source authority, stable identity mapping, version linkage, and generated or auditable
  transformation;
- token alias, mode, theme, typography, density, motion, component-state, and deprecation mapping
  without semantic role inversion;
- deterministic export or a documented controlled manual step with reviewer attribution;
- drift detection for source changes, target changes, missing objects, renamed identities, detached
  aliases, and unsupported target versions;
- inspection in the minimum and current supported target-tool versions;
- light, dark, brand, density, long text, RTL intent, forced-color intent, focus, and non-color
  state review where the target can represent them;
- contribution, review, access, backup, recovery, and removal ownership; and
- no secret, personal data, private customer asset, or unreviewed external library in distributed
  design files.

Visual similarity alone is not semantic fidelity. Design-tool screenshots supplement rather than
replace mapping and drift evidence.

### Example, guidance, Storybook, and documentation

Examples and guidance teach a concrete task while clearly separating supported API from illustrative
application policy.

Required evidence includes:

- production-package consumption with no private package internals or cross-application domain
  imports;
- exact commands, routes, scenarios, versions, synthetic-data labeling, support status, and
  unsupported claims;
- successful static builds, internal and external link checks, code sample validation, and secret or
  sensitive-content review;
- responsive, keyboard, automated accessibility, production visual, and named manual review
  proportional to interactive content;
- one semantic tree per route and no whole-application Storybook copy presented as deployment
  evidence;
- route, base-path, asset, 404, header, cache, preview, direct-entry, browser-history, and rollback
  checks when admitted to the Cloudflare deployment; and
- source commit and artifact manifest agreement across documentation, Storybook, and walkthroughs.

The
[Cloudflare delivery decision](../architecture/adr/0032-unified-cloudflare-documentation-delivery.md)
remains the deployment authority. A successful local build is not admission or launch approval.

## Cross-cutting accessibility procedure

For any new interactive or meaning-bearing runtime surface, the charter selects applicable tasks
from this procedure:

1. identify purpose, name, role, current value or state, knowledge, activity, and available action;
2. navigate in DOM-aligned reading order without duplicate semantic owners;
3. complete the task with keyboard and without pointer precision;
4. preserve useful meaning with color and optional icons absent;
5. inspect exact data, relationships, annotations, media alternatives, or generated meaning through
   a non-visual equivalent;
6. experience loading, partial, stale, unavailable, denied, pending, failed, recovered, and updated
   states without fabricated truth;
7. retain focus and reading context through meaningful updates and responsive changes;
8. receive at most one deliberate announcement with a durable visible owner; and
9. recover, cancel, return, or remove the artifact according to its documented boundary.

The evidence record names AT, browser, OS, versions, input method, fixture, expected and observed
results, limitation, and corrective change. Representative people perform formative first-glance or
task review before any broad usability claim.

## Performance, capacity, and bundle records

Each charter chooses an envelope and thresholds before measurement. Reuse the existing
100-millisecond synchronous-task threshold only when the task and measurement boundary match the
accepted operational runtime contract; it is not a universal generator, provider, network, or design
tool threshold.

A performance record includes:

- source commit, clean or cached build status, hardware, OS, runtime or browser, and versions;
- fixture or artifact size, series or record count, dependency graph, and input provenance;
- warm-up count, measured iterations, median, largest relevant result, variance, and raw artifact;
- construction, meaningful update, memory, packed, installed, transferred, parsed, generation, or
  provider timing selected for the task;
- committed semantics, focus, containment, output integrity, and error behavior alongside timing;
  and
- comparison with the platform, current Wayglass, no-dependency, or prior-version baseline.

A faster result that loses meaning, accessibility, determinism, or recovery fails.

## Security, privacy, and external-system gates

Any artifact that parses untrusted input, executes code, reads files, calls a network, uses a
credential, shares a design file, or deploys externally records:

- threat and trust boundaries, data classification, sources, destinations, retention, and deletion;
- least-privilege identity, secret creation, storage, rotation, redaction, revocation, and incident
  owner;
- validation, escaping, path handling, archive handling, dependency scripts, and resource bounds;
- denied, expired, revoked, malformed, replayed, rate-limited, partial, and offline behavior;
- log and screenshot review proving secrets and private data are absent; and
- cleanup of external mutations, tokens, test records, deployments, and access grants.

Live execution requires a separate approval naming the exact environment and allowed effects. A
charter is revised before work continues if data sensitivity, credentials, network destinations, or
external mutations expand.

## Release-candidate validation

Before any artifact becomes publish approved, the release unit passes the tier matrix plus:

1. clean build and test from the approved commit with caches disabled;
2. exact public API or artifact diff, changelog, migration, deprecation, support, and limitation
   review;
3. package or distributed-file inventory, license, notice, dependency, vulnerability,
   install-script, secret, source-map, and unexpected-file inspection;
4. deterministic tarball or artifact hashes and reproducible manifest;
5. no `workspace:*`, filesystem, private registry, unpublished package, or local-path dependency in
   the distributable result;
6. clean consumer install, import, typecheck, build, task, and removal smoke without workspace
   links;
7. minimum and current compatible peer, runtime, framework, provider, or design-tool checks;
8. explicit import side-effect and Custom Element registration checks;
9. manual gates complete or the affected surface excluded from release scope;
10. provenance, staging or deployment, partial-failure, rollback, deprecation, and recovery
    rehearsal; and
11. documentation for the exact version built and verified before the release is announced.

Foundation packages are tested as one synchronized family. Independent artifacts are tested against
their declared compatible foundation range. Publication and deployment remain separate approval
events.

## Failure, exceptions, and carried gates

- A failed required row blocks the claimed lifecycle transition.
- A flaky result is a failure until its cause, reproducibility, and disposition are recorded.
- A skipped environment names why it was unavailable, who owns completion, the review trigger, and
  the exact claim or release it blocks.
- Reducing a fixture, threshold, environment, or supported version to obtain a pass requires charter
  revision and review.
- An upstream defect includes a minimal reproduction, affected versions, mitigation, and support
  impact; attribution does not make the Wayglass claim pass.
- A carried human or provider gate may allow private implementation to close, but not the public
  support claim it controls.
- Rejecting an artifact triggers the cleanup and retained-evidence rules in the exploration record.

## Phase 5A exit and carried decisions

This plan completes the required Phase 5A architecture and governance set. The following remain
explicit later decisions rather than missing Phase 5A work:

- repository visibility and the public-source prerequisite for npm provenance;
- initial public package inventory, versions, publish approval, and npm bootstrap execution;
- completion or release-scope exclusion of representative assistive-technology gates;
- Cloudflare account connection, tooling dependency, walkthrough admission, preview deployment,
  custom-domain attachment, production promotion policy, and launch;
- live provider credentials and Home Assistant environment for Phase 5E;
- supported target design tool and access model for Phase 5D;
- a demand-backed framework and maintainer for Phase 5F; and
- acceptance, guidance-only, defer, revise, or reject dispositions for Phases 5B–5F.

These gates have named controlling records and exact future milestones. They do not block a bounded
private Phase 5B exploration whose charter stays within this plan.

## Exit rule

A Phase 5 exploration may be dispositioned only when every planned evidence row has an actual result
or an accepted omission, adverse evidence is retained, cleanup is verified, and the conclusion is no
broader than the tested environments. An artifact candidate advances only through its separate
implementation and release gates.

Phase 5 closes when every started exploration has an accepted disposition, every retained artifact
passes its tier matrix, optional artifacts remain isolated, cross-artifact compatibility is
verified, and publication, deployment, support, and unresolved external evidence are explicit.
