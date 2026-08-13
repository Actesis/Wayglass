# Northline Cold Storage reference application

**Status:** Phase 4C foundation active on August 12, 2026. Production composition, operational
workflows, and the accepted validation matrix remain ahead.

Northline Cold Storage is the private operations-console application defined by the accepted
[Phase 4 reference-application contract](./phase-4-reference-applications.md). It tests whether a
shift coordinator can understand whether outbound loads may leave within temperature and schedule
limits without turning Wayglass into a warehouse-management system.

## Foundation boundary

The initial application foundation provides:

- a private `@wayglass/example-operations-console` React/Vite workspace;
- typed overview, Dispatch-function, and `NL-2048` load routes using URL, History, and `popstate`;
- application-owned load, exception, throughput, capacity, and bounded-retention truth;
- deterministic shared and Northline-specific scenario presets;
- independent condition, knowledge, activity, confirmed-release, and requested-release state;
- a narrow dispatch-hold port with an injected clock and scheduler; and
- unit tests for routing, authored filtering, maximum bounds, retained truth, request identity, and
  deterministic effects.

The small orientation surface proves that the application consumes production Wayglass packages. It
is not the finished console. The next slices add the dense multi-function overview and focused
Dispatch composition, investigation controls and temporal detail, the confirmed hold workflow, and
the complete responsive, accessibility, failure, recovery, performance, and browser validation.

## Application ownership

Northline owns load and exception identities, queries, sorting, acknowledgement, dispatch commands,
authorization, audit meaning, and the 250-event retention boundary. A stale or unavailable trailer
temperature never becomes evidence that a load is safe or unsafe. A pending, denied, or failed hold
request never changes the confirmed release state.

No service connection, package publication, domain component, data-grid dependency, chart package,
or release-hold reversal is part of this foundation.

## Local use

Run `pnpm example:operations-console`, then open the local Vite URL. Human-readable paths include
`/`, `/functions/dispatch`, and `/loads/NL-2048`. Query parameters may select `scenario`, `theme`,
`density`, `dir`, and `fixture` without replacing route identity.
