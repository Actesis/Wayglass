# Northline Cold Storage reference application

**Status:** Phase 4C accepted on August 13, 2026. Automated, production visual, responsive,
performance-bound, and supported-browser validation are complete; representative manual
assistive-technology gates remain explicit public-release requirements.

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

The Phase 4E cross-domain audit aligns the displayed dispatch-hold value with the accepted Boolean
contract: `Applied` and `Not applied` are application-authored labels over confirmed Northline
state, not health colors or a new public load schema.

No service connection, package publication, domain component, data-grid dependency, chart package,
or release-hold reversal is part of this foundation.

## Operational composition

The first production composition provides:

- a simultaneous overview with strongly separated Receiving, Cold storage, Order preparation, and
  Dispatch functions;
- one outbound-readiness summary that names the uncertain load without treating stale evidence as a
  confirmed safe or unsafe result;
- focused function routes whose folder-like selector band retains concise peer summaries and keeps
  the Dispatch consequence visible from every function;
- scalar, status, and tabular projections derived from the same application-owned load records;
- a contained native Dispatch table with stable row identity and a useful `NL-2048` detail route;
- explicit loading, retained-refresh, partial, unavailable, stale, and recovered presentation; and
- dark, light, compact, comfortable, phone, desktop, and RTL-compatible browser fixtures.

The application directly depends on `@wayglass/elements` only for the accepted native-table light
DOM stylesheet; React wrappers do not and should not duplicate consumer-authored table CSS. No new
third-party dependency or schema-driven data grid is introduced.

The overview and focused routes are canonical application fixtures. They are not duplicated in
Storybook, and their records, summaries, sorting, and retention policy remain Northline-owned.

## Dispatch investigation

The Dispatch workspace now adds the accepted primary investigation path:

- application-owned load filtering and authored order use labeled native selects inside the
  production filter-bar composition;
- the native cutoff header is an equivalent authored sort control, and both controls preserve all
  retained records rather than changing operational truth;
- `NL-2048` remains a stable keyed row while the operator filters, sorts, enters detail, and
  returns;
- the detail route uses a production timeline whose current temperature entry is derived directly
  from the same load observation shown in scalar, status, and table projections;
- acknowledgement is a routine ownership record, not a claim that temperature was verified or the
  release state changed; and
- a deterministic inserted exception preserves filter, sort, focus, investigation ownership, reading
  position, and the intentionally silent live region.

These choices remain application policy. Wayglass does not own load queries, sort order, exception
identity, investigation meaning, or follow-latest behavior.

## Consequential dispatch hold

The focused `NL-2048` workflow composes the accepted confirmation and feedback surfaces around the
application-owned dispatch port:

- the initiating control repeats the Dispatch function and `NL-2048` target, and confirmation names
  the confirmed current release state, schedule-and-custody consequence, and absent release path;
- confirming closes the native modal before a correlated request begins; cancellation returns focus
  to the initiating control without changing application state;
- pending presentation retains `Scheduled` as confirmed truth while showing the requested `Held`
  effect as activity rather than completion;
- success alone changes the confirmed release state to `Held`; permission denial and request failure
  retain `Scheduled`, explain what remains true, and keep a confirmation-protected retry available;
- one application-owned polite live region announces the durable result while the inline alert
  remains authoritative and does not announce independently; and
- a stale response cannot resolve a newer request, and no hold-release control is exposed without
  the authorization, fresh evidence, and audit consequence required by the Phase 4 contract.

The dialog, button, alert, and known-state displays are production Wayglass components. Request
identity, authorization outcome, timing, durable wording, release truth, and recovery remain
Northline policy; no public domain API is introduced.

## Local use

Run `pnpm example:operations-console`, then open the local Vite URL. Human-readable paths include
`/`, `/functions/dispatch`, and `/loads/NL-2048`. Query parameters may select `scenario`, `theme`,
`density`, `dir`, and `fixture` without replacing route identity.

## Next slices

1. Begin Phase 4D planning and implementation for the isolated Harbor Lab agent-supervision
   reference application.
