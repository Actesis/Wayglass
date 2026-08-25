# Private token-interchange tooling

This directory is the permanent private build-and-validation location accepted by the
[token-tooling implementation contract](../../docs/governance/token-tooling-implementation-contract.md)
and [ADR 0033](../../docs/architecture/adr/0033-private-token-tooling-architecture.md). It is not a
workspace package, npm package, public API, supported schema, or DTCG conformance surface.

## Current implementation stage

Stages 1 through 8 provide the proven transform core, private command contract, permanent writers,
write-free repository check, production web-generation integration, retained validation mechanisms,
and final migration away from the proof implementation:

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
  before recovery changes filesystem state; and
- an executable check that validates the authored source, compares all three tracked web artifacts,
  verifies the complete exchange in memory, and reports the exact checked-out revision; and
- one explicit web command that validates and writes token CSS, legacy flat JSON, and theme CSS
  through sibling temporary files and atomic replacement with rollback;
- explicit private exchange generation and verification effects over immutable releases;
- one authenticated, threshold-free capacity measurement for the current and 10× corpora; and
- one complete deterministic fingerprint for cross-environment comparison.

The reviewed TypeScript definitions under `packages/tokens/src/` and `packages/themes/src/` remain
the only authoring authority. Pure modules in `src/` return data or strings. The writer performs
filesystem work only when its exported functions are explicitly called. No module performs
import-time writes, network access, registration, telemetry, environment mutation, or process exit.

The root launcher uses the supported Node runtime's built-in TypeScript stripping rather than a new
loader dependency. Its handlers dynamically import source and effect modules only after command
dispatch, so `--help` does not load the token source. The root build runs web generation once before
Turbo compiles packages in the existing dependency order. Package-local build scripts compile
TypeScript only. The superseded package-local writers and executable proof under
`experiments/phase-5b-token-interchange/` were removed after the Stage 7 matrix established
permanent coverage. Exported pure package helpers remain public compatibility surfaces and
exact-parity oracles; they are not writers and were not removed. The retained
[Stage 7 validation matrix](./evidence/stage-7-validation-matrix.md),
[Stage 8 migration record](./evidence/stage-8-final-migration.md), and
[historical proof evidence](./evidence/phase-5b-proof/) record the results and limitations.

The permanent writer rejects filesystem-root destinations, unsafe artifact paths, symbolic links in
owned paths, corrupt pointers, unverifiable locks, and unverified accepted releases. A live or
unverifiable lock is never removed automatically. Stale-lock recovery is a separate explicit
operation and removes the lock only after the recorded process is confirmed absent. Power-loss
durability, distributed filesystems, concurrent recovery, and multiple hosts remain unsupported.

## Local validation

From the repository root:

```sh
pnpm token-tooling:check
pnpm token-tooling:generate:web
pnpm token-tooling:core:check
pnpm token-tooling:generate:exchange -- --source-revision <full-sha> --output <path>
pnpm token-tooling:verify -- --output <path>
pnpm token-tooling:measure -- --source-revision <full-sha>
WAYGLASS_SOURCE_REVISION=<full-sha> pnpm token-tooling:fingerprint
```

`token-tooling:check` is the ordinary write-free command. It loads the reviewed TypeScript source,
generates token CSS, legacy flat JSON, theme CSS, and the partial exchange in memory, compares the
web family byte for byte with the tracked package artifacts, verifies the exchange manifest and
hashes, and prints a stable summary. It resolves repository inputs from its own module location and
therefore also works when the root script is launched from another directory.

`token-tooling:generate:web` constructs the same validated graph and replaces only the three owned
tracked artifacts. It first stages and verifies every changed file beside its destination. If
staging or replacement fails, it removes its temporary files and restores every destination already
replaced during that operation. Identical generation performs no replacement. The root `build`,
`tokens:build`, and `themes:build` scripts invoke this command before compilation; ordinary package
scripts do not run a second writer.

Private exchange generation accepts only an explicit repository-local or operating-system temporary
directory. It rejects unrelated nonempty directories and canonicalizes existing ancestors so a
symbolic link cannot disguise an out-of-scope destination. Generation authenticates the full source
revision and requires no tracked changes, writes an immutable content-addressed release, and
atomically advances `current.json`. Verification rechecks the accepted inventory, manifest,
revision, byte counts, and SHA-256 hashes without accepting generated data as source.

`token-tooling:measure` authenticates the same clean revision and reports cold work, 30 warm
repetitions, peak resident memory, output size, and the exact current and 10× synthetic corpora. It
is informational and imposes no threshold. `token-tooling:fingerprint` prints all three web and all
seven exchange artifact measurements for comparison across the supported runtime matrix.

The ordinary repository check invokes both the write-free artifact check and the permanent focused
core gates. They may also be run directly:

```sh
pnpm token-tooling:check
pnpm token-tooling:core:check
```

The ordinary check writes nothing. Test commands write only temporary fixtures and no accepted
exchange output. Exchange commands write only to their required explicit output root. No private
exchange release is checked into a package or repository artifact.

## Blocked claims

This stage does not authorize or provide:

- checked-in or published exchange output;
- a public package, CLI, module, schema, or compatibility promise;
- DTCG conformance, design-tool import, non-web platform support, or bidirectional editing; or
- a new dependency, deployment, credential, network request, or publication path.

Those boundaries may change only through the accepted contract's later implementation stages and
their required evidence.
