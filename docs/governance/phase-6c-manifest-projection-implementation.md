# Phase 6C-B manifest projection and inspection implementation

**Status:** Proposed for project-owner acceptance on September 5, 2026. This record covers only the
write-free private core authorized by the accepted Phase 6C contract. It does not create a worktree,
install a dependency, stage or pack a file, create a candidate artifact, contact npm, use a
credential, change package source, or authorize Phase 6C-C effects.

## Implemented boundary

`tooling/release-candidate/` is private repository tooling with no package manifest, workspace
membership, runtime export, or added dependency. Its pure modules now provide:

- the exact dependency-ordered candidate inventory: core, tokens, themes, elements, icons, React;
- validation of package identity, `0.1.0`, `private: true`, Apache-2.0, ESM, Node engines, future
  publish metadata, file allowlist, side effects, production dependencies, peers, and absence of
  lifecycle scripts;
- rejection of workspace, filesystem, URL, Git, wrong Wayglass, and frozen-version dependency drift;
- deterministic manifest projection with a fixed top-level order, recursively sorted nested object
  keys, two-space JSON, and one final newline;
- removal of repository scripts, development dependencies, package-manager data, and unknown source
  fields from the projection;
- packed-file path, kind, allowlist, private-segment, authored-source, required-root, export-target,
  projected-manifest, and source-map inspection; and
- SHA-256 byte and canonical file-inventory hashing.

The implementation accepts data values and returns deeply frozen projections and evidence. Importing
it performs no filesystem access, subprocess, network request, write, telemetry, environment
mutation, registration, or process exit. Tests alone read the current source manifests to prove that
the accepted freeze shape projects successfully.

## Exact projection

The projection preserves these fields in order when present:

```text
name, version, private, description, license, author, homepage, repository,
bugs, keywords, publishConfig, type, sideEffects, engines, files, exports,
dependencies, peerDependencies
```

The six current source manifests project without mutation. Unknown fields are omitted rather than
becoming candidate API. Dependency maps are sorted and compared with the accepted package-specific
graph. Nested metadata and exports are recursively key-sorted, so semantically identical source
objects cannot change output bytes through property insertion order.

Phase 6C keeps `private: true`. The tool deliberately rejects a non-private input and cannot produce
the later publish-approved projection.

## Inspection contract

The file inspector accepts an in-memory list of path and byte records. It sorts paths by code-point
order and rejects absolute, traversal, backslash, empty-segment, control-character, duplicate,
symlink, socket, test, fixture, screenshot, cache, coverage, and authored-TypeScript entries.

Only `dist/**`, `README.md`, `LICENSE`, `NOTICE`, and `package.json` can pass. All four root files
and at least one distribution file are required. Every export target must remain under `./dist/` and
exist. The packed manifest bytes must exactly equal the deterministic projection.

Source maps must be UTF-8 JSON with string sources, no `sourcesContent`, and no POSIX, Windows, UNC,
or file-URL absolute source or source-root path. Relative navigation remains allowed because it is
the accepted package map policy and does not include authored source bytes.

## Retained validation

Four test files currently run 30 assertions covering:

- all six real source manifests in reversed input order, immutability, canonical output,
  unknown-field removal, and frozen results;
- wrong identity, version, privacy, license, files, side effects, engine, publish metadata,
  lifecycle scripts, dependency protocols, versions, Wayglass ranges, duplicate packages, and
  missing packages;
- deterministic file order, byte counts, hashes, unsafe paths and file kinds, private files,
  authored source, duplicate or required files, missing exports, exact packed-manifest bytes, and
  unsafe maps;
- the standard SHA-256 `abc` vector and inventory sensitivity; and
- import isolation plus a source guard against effect-capable Node modules, process exit, and fetch.

The root `release-candidate:core:check` command runs the focused typecheck and test suite, and
ordinary `pnpm check` now includes it. No lockfile or installed dependency changed.

The complete `PNPM_CONFIG_OFFLINE=true TURBO_FORCE=true pnpm check` gate then passed with no Turbo
cache hits: formatting and repository ESLint; all 14 scheduled builds; all 20 typecheck tasks; all
20 package/application test tasks; 223 documentation assertions; 58 icon-tooling tests; 93 token-
tooling tests; the then-current 29 release-candidate tests; and 24 retained visualization-proof
tests. The offline setting allowed no registry fallback. The run retained the known successful-build
Storybook large-chunk warning and Node `module.register()` deprecation plus expected Lit
development-mode test messages; none masked a failure or changed the tracked tree.

## Development correction log

1. The first typecheck rejected expression-bodied adverse-test mutators whose tuple inference
   produced implicit recursive return types. They were changed to explicit `void` blocks; production
   behavior was unaffected.
2. The first scoped ESLint run rejected a control-character regular expression used for path
   validation. The implementation now checks Unicode code points directly; the intended rejection is
   retained without suppressing the rule.
3. Final review added case-insensitive Unicode-normalized path-collision rejection and remote URL
   rejection for source maps. The focused suite increased to 30 assertions and passed after the
   hardening. A second complete offline `pnpm check` then passed the final tree; affected docs and
   the 30-test candidate core executed fresh while previously proven unchanged Turbo tasks replayed
   from the immediately preceding uncached run.

Neither correction hid a failed product assertion or required a rerun from a changed candidate
artifact; Phase 6C-B creates no artifacts.

## Remaining boundary

Phase 6C-C still owns the explicit effect adapter: authenticated detached worktrees, offline frozen
installation, uncached builds, safe temporary staging, local packing, repeated-build comparison,
evidence persistence, cleanup, and failure recovery. It must consume this core without adding
filesystem or subprocess behavior to the pure modules.

## Acceptance effect

Acceptance completes Phase 6C-B and authorizes Phase 6C-C isolated assembler implementation only. It
does not accept a tarball, hash, candidate run, consumer result, publication readiness, package
privacy change, npm or registry access, credential, tag, release, repository visibility change,
deployment, or external application work.
