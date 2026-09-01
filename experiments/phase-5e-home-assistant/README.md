# Phase 5E Home Assistant integration proof

This private experiment tests the accepted
[Phase 5E charter](../../docs/governance/explorations/phase-5e-home-assistant.md). It is not a
workspace package, Home Assistant client, public adapter, browser integration, or compatibility
claim.

Run its fixed repository gate with:

```sh
pnpm experiment:phase5e:check
```

Stage 3 adds reproducible post-build isolation, capacity, and comparison commands:

```sh
pnpm experiment:phase5e:audit
pnpm experiment:phase5e:measure --output /tmp/phase5e-capacity.json --revision working-tree --pnpm 11.9.0
pnpm experiment:phase5e:compare --output /tmp/phase5e-comparison.json --revision working-tree
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

Stage 3 validates the same semantics over 100 bindings and 1,000 ordered and adverse messages,
compares the candidate with a direct application-owned implementation, and audits source, built
outputs, dependencies, secrets, endpoints, imports, and an executable removal plan. The retained
evidence covers Node 22.13/Linux and the current maintainer runtime. The direct implementation is
smaller for one application; the candidate is materially larger but centralizes validation,
ordering, knowledge, and acknowledgement/effect safety.

The proof deliberately validates only the projected provider fields and bounded wire envelopes it
uses. It does not claim that the projection accepts every field in a complete live Home Assistant
message. A live smoke, provider compatibility claim, permanent artifact, and security update policy
remain separately gated by disposition and a revised implementation contract.

Retained stage records:

- [Stage 1 provider model](./evidence/stage-1-provider-model.md)
- [Stage 2 fake port](./evidence/stage-2-fake-port.md)
- [Stage 3 scale and isolation](./evidence/stage-3-scale-and-isolation.md)
- [Stage 4 proposed disposition](./evidence/stage-4-proposed-disposition.md)
