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

The fixtures are original synthetic records shaped from the public Home Assistant API documentation.
They contain no real endpoint, entity, account, token, personal data, or device command. Source
imports do not connect, read environment credentials, register elements, or mutate global state. A
future live smoke requires a separately approved environment and credential record.

This stage deliberately validates only the projected provider fields used by the pure model. It does
not claim that the projection accepts a complete live Home Assistant message. The later fake port
stage must own WebSocket envelopes, authentication outcomes, command IDs, and reconnect behavior
before any live-smoke proposal.
