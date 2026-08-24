# Private token-interchange tooling

This directory is the permanent private build-and-validation location accepted by the
[token-tooling implementation contract](../../docs/governance/token-tooling-implementation-contract.md)
and [ADR 0033](../../docs/architecture/adr/0033-private-token-tooling-architecture.md). It is not a
workspace package, npm package, public API, supported schema, or DTCG conformance surface.

## Current implementation stage

Stages 1 and 2 now provide the proven pure core and the private command contract:

- canonical-source adapters;
- reversible identity mapping;
- normalized graph construction and semantic validation;
- byte-compatible token and theme CSS transforms;
- partial DTCG 2025.10 value and exchange projection;
- manifest verification and artifact comparison; and
- explicit parsing for the five accepted command shapes;
- stable success (`0`), validation/integrity (`1`), and invocation/environment (`2`) exit classes;
- redacted, code-prefixed diagnostics;
- help dispatch that invokes no source-loading or command handler; and
- exact source-revision and clean-tracked-checkout authentication for generation and measurement
  handlers.

The reviewed TypeScript definitions under `packages/tokens/src/` and `packages/themes/src/` remain
the only authoring authority. Modules in `src/` return data or strings and perform no import-time
writes, network access, registration, telemetry, environment mutation, or process exit.

Command effects remain injected: this stage establishes and tests the boundary without exposing a
partially implemented root launcher. Production package generators and outputs are unchanged. The
remaining [`experiments/phase-5b-token-interchange/`](../../experiments/phase-5b-token-interchange/)
code owns only transitional capacity measurement, filesystem-writer proof, authenticated
fingerprinting, and retained disposition evidence; it imports this permanent core rather than
carrying a duplicate.

## Local validation

From the repository root:

```sh
pnpm token-tooling:core:check
```

The ordinary Phase 5B check runs the permanent core and the remaining proof boundary:

```sh
pnpm experiment:phase5b:check
```

These commands write no accepted token or exchange output. The implementation contract's root
launcher, command effects, generation, verification, measurement, locking, and recovery behavior
belong to later parity-gated stages.

## Blocked claims

This stage does not authorize or provide:

- generation of production package files through the new core;
- a runnable root command or filesystem/process adapter;
- legacy flat `tokens.json` parity;
- a permanent filesystem writer or concurrent-writer lock;
- checked-in or published exchange output;
- a public package, CLI, module, schema, or compatibility promise;
- DTCG conformance, design-tool import, non-web platform support, or bidirectional editing; or
- a new dependency, deployment, credential, network request, or publication path.

Those boundaries may change only through the accepted contract's later implementation stages and
their required evidence.
