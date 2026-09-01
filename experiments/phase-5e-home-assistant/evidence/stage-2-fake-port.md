# Phase 5E Stage 2 fake-port evidence

- Date: 2026-08-31
- Scope: deterministic authentication outcomes, command correlation, failure, cancellation, and
  reconnect behavior
- External effects: none

## Provider contract alignment

The projected envelopes are shaped from the official Home Assistant WebSocket documentation
rechecked on August 31, 2026. The proof uses only:

- `auth_required`, `auth_ok`, and `auth_invalid` provider outcomes;
- positive integer command/result correlation IDs;
- `get_states`, `subscribe_events` for `state_changed`, and one bounded light `call_service` command
  family;
- success or error `result` messages; and
- an `event` envelope containing the Stage 1 projected state-change record.

The proof does not model a credential-bearing authentication command. That omission is intentional:
revision 1 authorizes authentication outcomes but forbids credential input, storage, serialization,
or logging. The envelopes are a closed proof projection, not a claim that complete live messages are
accepted unchanged.

## Result

The deterministic port demonstrates one connection lifecycle with no socket, timer, random source,
environment read, or wall-clock dependency. Successful fake authentication emits snapshot and
subscription commands. The port becomes ready only after both results succeed. Unauthorized
authentication blocks reconnect until an application-owned reset.

One reversible light request produces a correlated `call_service` command while retaining the last
provider-reported value. A successful result acknowledges execution but does not confirm the value.
Only a later ordered matching state event confirms provider effect. Provider rejection,
disconnection, cancellation, duplicate results, inactive subscriptions, repeated events, and
out-of-order state updates cannot overwrite newer truth.

The following safety decisions are explicit:

- request IDs are bounded and deduplicated; reuse with different intent is rejected;
- cancellation stops local correlation but does not claim the provider command was recalled;
- disconnection fails an in-flight mutating request with `connection-lost` and never replays it;
- reconnect attempts use deterministic logical delays of 100, 200, and 400 milliseconds, then stop;
- only connection/bootstrap work is repeated after reconnect;
- retained diagnostics contain bounded event names, timestamps, status, numeric command IDs, bounded
  request IDs, and stable codes—not provider values, entity identities, versions, or error messages;
  and
- result/event deduplication and logs use bounded 256/200-entry retention respectively.

## Validation

The focused TypeScript check and all 34 tests across five files pass. Tests cover closed envelope
validation, handshake order, unauthorized blocking, bootstrap readiness, acknowledgement/effect
separation, provider failure, cancellation, request/result/event deduplication, out-of-order input,
bounded backoff exhaustion, no mutating retry, and bounded safe logs.

Boundary tests confirm that source has no package manifest, dependency, credential read, network
client, real timer, random source, Custom Element registration, or unapproved import. The complete
`pnpm check` repository gate passes, including formatting, lint, builds, tooling checks, the Phase
5C proof, TypeScript, and existing package and reference-application tests. The documentation build
and `git diff --check` also pass. Stage 3 isolation measurements remain separate validation work.

## Claims not supported

Stage 2 does not establish live authentication, credential safety, complete WebSocket compatibility,
actual reconnect timing, provider availability, service idempotence, physical-device truth,
production reliability, browser support, a public adapter, package status, or publication readiness.
