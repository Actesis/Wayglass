# Application-validation recipe boundary

**Status:** Accepted for Phase 5A on August 15, 2026. This decision classifies the reusable
validation practices found in the Phase 4 reference applications. It adds no package API,
dependency, deployment, or publication authority.

The boundary follows [ADR 0030](../architecture/adr/0030-isolated-reference-applications.md): a test
helper may enter `@wayglass/testing` only when it tests public Wayglass behavior rather than
application policy. It also follows
[ADR 0031](../architecture/adr/0031-ecosystem-artifact-architecture.md): build and validation tools
need independent ownership, compatibility, determinism, and promotion evidence.

## Decision

The Phase 4 method is reusable, but most implementation machinery is not.

| Destination               | What belongs there                                                                                                                                                                                                   | Phase 5A decision                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Documentation             | Task-loop method, independent state axes, requested-versus-confirmed truth, deterministic scenario meanings, responsive and accessibility matrices, measurement method, and review record fields                     | Publish as application-author guidance and recipes                   |
| Application-local harness | Domain records, reducers, selectors, routes, clocks, schedulers, adapters, scenario transitions, maximum fixtures, mutation functions, measurement hooks, screenshot maps, focus continuation, and announcement copy | Keep beside the application that owns their meaning                  |
| `@wayglass/testing`       | Small framework-neutral utilities or constants that directly test documented public Wayglass behavior with identical semantics across independent consumers                                                          | Retain the existing viewport constants; add nothing from Phase 4 now |

No generic scenario engine, application fixture schema, router harness, adapter mock, performance
runner, state assertion library, or announcement manager is promoted from the reference apps.

## Documentation recipes

The following are methods an application author can reproduce without importing Wayglass test code:

- model orientation, awareness, investigation, action, confirmation, failure, recovery, and
  continuity as one task loop;
- exercise initial loading, retained refresh, stale, partial, unavailable, denied, pending, failed,
  recovered, and meaningful-update conditions without redefining their lifecycle meaning;
- assert one truth across scalar, Boolean, status, temporal, table, media, control, and feedback
  projections;
- check that ordinary mutation retains focus, reading position, authored selection, scroll context,
  and stable identity;
- provide one durable result and at most one announcement owner;
- review phone, desktop, wall, long content, 200% text, RTL, forced colors, grayscale, reduced
  motion, keyboard, and touch behavior according to supported scope;
- run complete workflows in supported browsers and named assistive-technology environments; and
- record fixture, environment, warm-up, iteration, timing, semantic, focus, overflow, limitation,
  and corrective-change evidence.

These recipes describe outcomes and evidence. They do not prescribe a framework, test runner,
query-parameter format, data schema, or implementation architecture.

## Application-local harnesses

The Cedar, Northline, and Harbor harnesses remain local because their similar mechanics carry
different ownership and failure guarantees.

- Scenario reducers encode different records, permissions, partial outcomes, and recovery rules.
- Deterministic clocks and schedulers coordinate application-specific requests and histories.
- Adapters define what “accepted,” “failed,” “cancelled,” or “confirmed” means for the domain.
- Maximum fixtures represent different credible densities and relationships.
- Mutation hooks select different meaningful changes and continuation behavior.
- Route restoration, focus fallback, and announcements use application information architecture and
  language.
- Performance instrumentation separates application work according to each renderer and workflow.

Keeping these harnesses local makes domain assumptions visible. Extracting their shared syntax would
reduce lines while hiding who owns truth, policy, and recovery.

## Current `@wayglass/testing` surface

`@wayglass/testing` currently exports the frozen `wayglassViewports` constants for phone, tablet,
desktop, and wall test environments. The constants are framework-neutral, contain no domain policy,
and identify shared Wayglass inspection sizes. They remain a narrow candidate surface.

This decision does not make the package publish-ready. The constants still require the package
metadata, compatibility, support, tests, documentation, packing evidence, and explicit release
approval defined by release governance. Applications may use additional local viewport sizes when
their tasks demand them.

## Promotion gate for a future helper

A helper may be proposed for `@wayglass/testing` only when all of these are true:

1. At least two independently implemented consumers need it with identical semantics and ownership.
2. It tests a documented public Wayglass contract rather than an application record, route,
   workflow, policy, copy string, or private Shadow DOM detail.
3. The platform and existing test tools cannot express the assertion clearly enough through a small
   local helper.
4. Its API is framework-neutral or its framework-specific boundary is explicit and separately
   justified.
5. It is deterministic, side-effect-free unless the effect is its documented purpose, and usable
   without network access, credentials, wall-clock delays, or global mutable state.
6. It does not register Custom Elements, reach into private component internals, manufacture domain
   state, or make automated accessibility evidence look like a manual support claim.
7. Tests cover success, misuse, failure messages, versions, types, ESM consumption, and removal or
   replacement behavior.
8. Documentation states the public contract being tested, unsupported uses, and consumer-owned
   assertions that remain necessary.
9. The extraction reduces meaningful maintenance cost, not line count alone.
10. A reviewed exploration record and tooling validation plan accept the permanent package surface.

Examples of potentially eligible categories are public event assertions, explicit-registration
checks, public semantic-state matchers, or deterministic generated-artifact comparisons. These are
illustrations, not approved APIs; each still needs real repeated demand and its own exploration.

## Rejected promotion candidates

The following remain outside `@wayglass/testing`:

- a universal operational record, scenario, request, adapter, or fixture schema;
- application reducers, selectors, route types, history models, schedulers, or controlled promises;
- generic “healthy,” “safe,” “approved,” or “complete” inference from component attributes;
- automatic live-region creation or announcement selection;
- screenshot baselines, app-specific query parsing, viewport-to-layout policy, or hosted-browser
  orchestration;
- universal performance thresholds detached from fixture, environment, and task;
- wrappers around Playwright, Vitest, Axe, or browser APIs that only rename their existing behavior;
- helpers that inspect unexposed Shadow DOM implementation; and
- utilities whose primary purpose is testing a provider, framework, design tool, or application
  rather than Wayglass public behavior.

## Placement questions

Use these questions when reviewing a validation utility:

1. Would the assertion still make sense if every domain noun changed?
2. Does it test a Wayglass public contract or a consuming application's decision?
3. Do two independent consumers need the same behavior, not merely similar code?
4. Can ordinary platform or test-runner APIs express it locally without hiding meaning?
5. Would package ownership make failure, accessibility, and compatibility responsibilities clearer?

If the answer points to a method, document it. If it points to application truth or policy, keep it
local. Only a repeated, public-contract behavior should begin an exploration for
`@wayglass/testing`.

## Consequences

- Application authors gain one coherent method without inheriting a Wayglass application framework.
- Reference applications remain honest evidence instead of becoming disguised package fixtures.
- `@wayglass/testing` avoids domain vocabulary, policy engines, test-runner wrappers, and premature
  dependencies.
- Some small harness code remains duplicated so semantic differences stay reviewable.
- A future narrow helper has a high but concrete promotion path based on real consumers and public
  behavior.
