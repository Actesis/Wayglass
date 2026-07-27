# ADR 0004: Begin with a client-rendered component contract

- Status: accepted
- Date: 2026-07-27

## Context

The initial target environments can load Custom Elements in the browser. Full Lit server rendering
and hydration would add experimental dependencies and constraints before Wayglass has validated its
component APIs.

## Decision

Phase 0 and Phase 1 support safe client-only loading. Registration is explicit, initial rendering
should be deterministic where practical, and browser-global access should be kept out of
framework-neutral logic. Server-rendered applications must load element definitions on the client.

## Consequences

Wayglass does not promise that every package entry point can execute in a DOM-free Node process. The
documentation site may statically render prose while activating examples in the browser. Full SSR
and hydration require a future architecture decision.

## Alternatives considered

- Full Lit SSR immediately: deferred because the implementation remains experimental and is not
  required by the first vertical slice.
- Declaring SSR out of scope permanently: rejected because the architecture should preserve a
  reasonable future path.
