# Private icon pipeline

This directory owns Wayglass's private, repository-only icon source and pure generation logic. It is
not a workspace package, public API, arbitrary SVG parser, or application icon service.

Stage 1 contains the reviewed four-glyph catalog, closed source types, strict immutable validation,
deterministic in-memory generation, drift comparison, and focused tests. It deliberately has no
filesystem writer, command, lock, generated production output, package dependency, or runtime
integration. Those effects and migrations require their later staged reviews under the accepted
[implementation contract](../../docs/governance/icon-tooling-implementation-contract.md).

Run the current focused checks with:

```sh
pnpm exec tsc --noEmit -p tooling/icon-pipeline/tsconfig.json
pnpm exec vitest run --root tooling/icon-pipeline --config vitest.config.ts
```

`src/catalog.ts` is the only official geometry and metadata authority. Applications continue to own
icon selection, text, accessible names, state, and domain meaning. The synthetic directional fixture
under `test/` exists only to exercise logical-direction review behavior.
