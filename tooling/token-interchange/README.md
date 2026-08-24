# Private token-interchange tooling

This directory is the permanent private build-and-validation location accepted by the
[token-tooling implementation contract](../../docs/governance/token-tooling-implementation-contract.md)
and [ADR 0033](../../docs/architecture/adr/0033-private-token-tooling-architecture.md). It is not a
workspace package, npm package, public API, supported schema, or DTCG conformance surface.

## Current implementation stage

Stages 1 through 4 now provide the proven transform core, private command contract, and permanent
exchange writer:

- canonical-source adapters;
- reversible identity mapping;
- normalized graph construction and semantic validation;
- byte-compatible token CSS, legacy flat token JSON, and theme CSS transforms;
- partial DTCG 2025.10 value and exchange projection;
- manifest verification and artifact comparison; and
- explicit parsing for the five accepted command shapes;
- stable success (`0`), validation/integrity (`1`), and invocation/environment (`2`) exit classes;
- redacted, code-prefixed diagnostics;
- help dispatch that invokes no source-loading or command handler; and
- exact source-revision and clean-tracked-checkout authentication for generation and measurement
  handlers;
- immutable content-addressed exchange releases and atomic pointer replacement;
- a non-replacing single-writer lock with explicit, process-checked stale-lock recovery; and
- accepted-release verification, bounded cleanup, traversal rejection, and symbolic-link rejection
  before recovery changes filesystem state.

The reviewed TypeScript definitions under `packages/tokens/src/` and `packages/themes/src/` remain
the only authoring authority. Pure modules in `src/` return data or strings. The writer performs
filesystem work only when its exported functions are explicitly called. No module performs
import-time writes, network access, registration, telemetry, environment mutation, or process exit.

Command effects remain injected: this stage establishes and tests the boundary without exposing a
partially implemented root launcher. Production package generators and outputs are unchanged. The
remaining [`experiments/phase-5b-token-interchange/`](../../experiments/phase-5b-token-interchange/)
code owns only transitional capacity measurement, authenticated fingerprinting, and retained
disposition evidence; it imports this permanent core rather than carrying a duplicate.

The permanent writer rejects filesystem-root destinations, unsafe artifact paths, symbolic links in
owned paths, corrupt pointers, unverifiable locks, and unverified accepted releases. A live or
unverifiable lock is never removed automatically. Stale-lock recovery is a separate explicit
operation and removes the lock only after the recorded process is confirmed absent. Power-loss
durability, distributed filesystems, concurrent recovery, and multiple hosts remain unsupported.

## Local validation

From the repository root:

```sh
pnpm token-tooling:core:check
```

The ordinary Phase 5B check runs the permanent core and the remaining proof boundary:

```sh
pnpm experiment:phase5b:check
```

These validation commands write only temporary test fixtures and no accepted token or exchange
output. The implementation contract's root launcher, production generation effects, existing-release
verification command, and measurement command belong to later parity-gated stages.

## Blocked claims

This stage does not authorize or provide:

- generation of production package files through the new core;
- a runnable root command or production-package filesystem integration;
- checked-in or published exchange output;
- a public package, CLI, module, schema, or compatibility promise;
- DTCG conformance, design-tool import, non-web platform support, or bidirectional editing; or
- a new dependency, deployment, credential, network request, or publication path.

Those boundaries may change only through the accepted contract's later implementation stages and
their required evidence.
