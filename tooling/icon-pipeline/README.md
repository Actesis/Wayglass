# Private icon pipeline

This directory owns Wayglass's private, repository-only icon source and generation path. It is not a
workspace package, public API, arbitrary SVG parser, or application icon service.

Stages 1 and 2 contain the reviewed four-glyph catalog, closed source types, strict immutable
validation, deterministic in-memory generation, manifest verification, drift comparison, explicit
commands, and the transactional filesystem boundary. The tool adds no package, dependency, runtime
import, or public API. Committing generated production output and migrating the runtime require
later staged reviews under the accepted
[implementation contract](../../docs/governance/icon-tooling-implementation-contract.md).

The fixed repository commands are:

```sh
pnpm icon-tooling:check
pnpm icon-tooling:generate
```

`check` validates and renders in memory, reads only the four assigned paths, and fails with targeted
drift without writing. `generate` accepts no destination and writes only those paths. It acquires
the exclusive `.wayglass-icon-tooling.lock`, journals prior-file presence, stages and verifies all
changed bytes, replaces the output manifest last, and restores the previous set after ordinary
failure. Stage 3 will create and review the first committed output set; until then, a repository
check correctly reports the four outputs as missing.

An interrupted process can leave the lock and exact owner-suffixed stages or backups. Preserve them
for review. After confirming the PID recorded in the regular-file lock is absent, run:

```sh
node --experimental-strip-types tooling/icon-pipeline/src/cli.ts recover
```

Recovery touches only exact paths journaled by that lock, rejects symlinks, restores the prior set,
verifies its manifests and hashes, and only then removes the lock. It refuses live or unverifiable
processes and unverifiable committed output. Do not manually delete the lock, backups, or stages
unless the recovery implementation itself is under maintainer repair.

Run the focused implementation checks with:

```sh
pnpm exec tsc --noEmit -p tooling/icon-pipeline/tsconfig.json
pnpm exec vitest run --root tooling/icon-pipeline --config vitest.config.ts
```

`src/catalog.ts` is the only official geometry and metadata authority. Applications continue to own
icon selection, text, accessible names, state, and domain meaning. The synthetic directional fixture
under `test/` exists only to exercise logical-direction review behavior.
