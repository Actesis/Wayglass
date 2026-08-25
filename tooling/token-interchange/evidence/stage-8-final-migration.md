# Token-tooling Stage 8 final migration

- Date: 2026-08-24
- Contract stage: 8 of 8
- Reviewer: project owner
- Result: pass

## Change boundary

Stage 8 removes only generation and proof paths made obsolete by the permanent private tool:

- package-local filesystem writers at `packages/tokens/scripts/build.mjs` and
  `packages/themes/scripts/build.mjs`;
- executable proof source, tests, configurations, commands, and ignored cache under
  `experiments/phase-5b-token-interchange/`; and
- root `experiment:phase5b:*` scripts.

The root `check` command now invokes `token-tooling:core:check` directly. The permanent web writer
remains the single build path for the three tracked token/theme artifacts.

Exported pure helpers `createCss`, `createJson`, and `createThemeCss` remain in their existing
packages. They are public compatibility surfaces used by applications and exact-parity tests, not
filesystem writers. Removing them would be a separate public foundation change and is outside this
migration.

## Coverage and retained evidence

The accepted [Stage 7 matrix](./stage-7-validation-matrix.md) established permanent coverage for
normalization, web and exchange transforms, exact artifact parity, failure handling, recovery,
fingerprinting, capacity measurement, supported runtimes, package isolation, browser behavior, and
documentation. Permanent tests contain the former capacity and authenticated-fingerprint coverage.

Historical proof results are retained under [`phase-5b-proof/`](./phase-5b-proof/), while executable
duplicates are removed. Repository history remains the rollback source for both old writer scripts
and proof code. No generated exchange output, dependency, package export, lockfile change, or public
compatibility claim is introduced.

## Validation

The final migration passed these local gates on Node 26.4.0 with pnpm 11.9.0:

- `pnpm token-tooling:check`: 528 tokens, 197 overrides, three web artifacts, and seven exchange
  files verified against the checked-out source revision;
- `pnpm token-tooling:core:check`: typecheck plus 91 tests across 14 files;
- `TURBO_FORCE=true pnpm check`: formatting, lint, permanent token-tooling checks, 20 cache-bypassed
  typecheck tasks, 20 cache-bypassed test tasks, exact no-op web generation, and 14 cache-bypassed
  build tasks passed;
- `pnpm docs:build`: VitePress links and pages built successfully; and
- `git diff --check`: no whitespace errors.

The first full build correctly rejected a repository-relative evidence link from a
VitePress-included ADR. The link was changed to the retained GitHub path, the documentation build
passed, and the full cache-bypassed check then passed from the beginning. This Stage 8 diff changes
no tracked generated web artifact or dependency lockfile.
