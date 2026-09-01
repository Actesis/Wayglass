# Phase 5E Home Assistant integration proof

This private experiment tests the accepted
[Phase 5E charter](../../docs/governance/explorations/phase-5e-home-assistant.md). It is not a
workspace package, Home Assistant client, public adapter, browser integration, or compatibility
claim.

Run its fixed repository gate with:

```sh
pnpm experiment:phase5e:check
```

Stage 1 contains a closed projection of the provider state and `state_changed` fields required by
the proof, four synthetic application bindings, immutable validation, and a pure reducer. Provider
`off` remains an uninterpreted reported value. `unknown`, `unavailable`, and disconnection affect
knowledge rather than becoming Boolean false or condition. A request stays pending after provider
acknowledgement and changes to confirmed only after a newer matching state update.

Stage 2 adds closed authentication-outcome, command, result, and event envelopes plus a
deterministic fake port. The port bootstraps a snapshot and `state_changed` subscription after
successful fake authentication, blocks after an unauthorized outcome, and reconnects through logical
100, 200, and 400 millisecond backoff steps. It deduplicates request identities, result identities,
and repeated events. Cancellation ends local response correlation; it does not claim to recall a
command that may already have reached the provider. A disconnected service request fails explicitly
and is never retried automatically because execution may have occurred before the connection was
lost.

The fake authentication seam accepts provider outcomes but deliberately defines no
credential-bearing client message. Adding credential input, serialization, storage, or logging
remains behind the charter's separate live-environment approval.

The fixtures are original synthetic records shaped from the public Home Assistant API documentation.
They contain no real endpoint, entity, account, token, personal data, or device command. Source
imports do not connect, read environment credentials, register elements, or mutate global state. A
future live smoke requires a separately approved environment and credential record.

The proof deliberately validates only the projected provider fields and bounded wire envelopes it
uses. It does not claim that the projection accepts every field in a complete live Home Assistant
message. Stage 3 owns capacity, runtime, dependency, bundle, secret, comparison, and removal
evidence before disposition; a live smoke remains separately gated.
