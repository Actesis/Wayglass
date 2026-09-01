# Phase 5E Home Assistant integration evidence

This directory retains the historical evidence for the completed
[Phase 5E exploration](../../docs/governance/explorations/phase-5e-home-assistant.md). The project
owner accepted a **guidance-only** disposition on August 31, 2026. The executable experiment was
then removed; this directory is not a runnable integration, workspace package, Home Assistant
client, public adapter, or compatibility claim.

The durable result is the
[external-state integration guide](../../docs/guides/external-state-integrations.md), including its
bounded Home Assistant application recipe. A consuming application still owns provider transport,
credentials, entity selection, domain mapping, authorization, persistence, and user experience.

Retained stage records:

- [Stage 1 provider model](./evidence/stage-1-provider-model.md)
- [Stage 2 fake port](./evidence/stage-2-fake-port.md)
- [Stage 3 scale and isolation](./evidence/stage-3-scale-and-isolation.md)
- [Stage 4 proposed disposition](./evidence/stage-4-proposed-disposition.md)
- [Stage 4 accepted disposition and cleanup](./evidence/stage-4-accepted-disposition-and-cleanup.md)

Raw Stage 3 measurements remain under [`evidence/`](./evidence/) so the accepted decision can be
audited. They do not establish live Home Assistant compatibility.
