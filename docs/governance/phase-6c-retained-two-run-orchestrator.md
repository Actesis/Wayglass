# Phase 6C-E4 retained two-run orchestrator

**Status:** Proposed for project-owner acceptance on September 7, 2026. This record covers the
effectful, transactional retained-candidate orchestrator authorized by the accepted Phase 6C-E plan.
It does not retrieve an advisory snapshot, run the authoritative E5 candidate, contact npm or
another registry, publish a package, use release credentials, change package privacy, create a tag
or release, deploy, or begin external-application work.

## One explicit command

The retained workflow is exposed only as:

```sh
pnpm release-candidate:integrated -- --source <accepted-full-sha> --output <absolute-new-directory> --advisory-snapshot <approved-absolute-file>
```

It accepts exactly the frozen source commit, a new absolute output directory, and an existing
absolute regular non-symlink advisory file. The existing offline environment guard rejects
recognized release credentials. Repository identity, clean tooling state, frozen commit and tree,
the local pnpm content-addressed store, and all consumer material are authenticated before work
begins. The command has no advisory fetch mode, registry fallback, publication mode, or automatic
retry. There is no automatic retry at any later boundary either.

## Exact execution sequence

The orchestrator runs the repository-root `pnpm check` gate with caches bypassed, then performs two
complete fresh candidate runs. Each candidate build already contains two independent assembly
passes, so one retained execution contains four underlying assembly passes. Both candidate runs then
execute the exact 2-Vanilla, 4-React, and 36-browser consumer matrix. Missing or additional results
fail closed before retention.

The first candidate assembly supplies the retained tarballs and package audit from the same exact
unpacked byte arrays inspected by the assembler. While that authenticated detached worktree still
exists, the effect adapter walks the actual installed production roots and reachable dependency
graph. Every resolved package must remain inside the frozen worktree; its actual `package.json` and
top-level license, copying, and notice bytes feed the accepted pure E2 collector. Workspace source,
lockfile inference, package-name inference, and registry metadata are not substitutes for those
bytes.

After both runs pass, the orchestrator observes allowlisted operating-system, runtime,
package-manager, Playwright, and browser versions. It validates the already approved advisory input
against that explicit observation time, the exact canonical dependency-audit hash, and every
production graph identity. Noncanonical, stale, future-dated, wrong-scope, or graph-mismatched input
blocks retention without attempting a fetch.

The two full run records must have identical deterministic surfaces. A changed candidate byte,
manifest identity, consumer result, or environment result fails reproducibility. Successful command
output is not retained as a log. Known Lit, Node, and Storybook warnings are reduced to fixed safe
codes, and any other warning-shaped successful output adds a generic owner-review notice. Automated
browsers and the still-deferred Windows observation remain explicit limitations.

## Transactional retained bundle

The command writes only to a uniquely owned sibling staging directory and renames that directory to
the requested output after every expected file exists. Any failure removes the temporary run
directory and sibling staging directory. If the final independent verification fails after rename,
the completed output is also removed. The command never retries a failed boundary.

One successful bundle contains exactly:

- `integrated-evidence.json`;
- six first-run tarballs under `packages/`;
- canonical package and dependency sections under `audits/`; and
- canonical environment, quality-gate, provenance, and advisory sections under `observations/`.

The integrated record carries every retained file's relative path, byte count, and SHA-256 plus an
inventory hash. No temporary worktree, package-manager store, raw command output, machine path,
credential, or second-run tarball is retained.

## Independent verification

An operator can recheck a finished bundle without running assembly or consumer commands:

```sh
pnpm release-candidate:verify-integrated -- --bundle <absolute-directory>
```

The verifier rejects symlinks, non-regular files, missing files, and unexpected files. It recomputes
every byte count, file hash, bundle inventory hash, deterministic run hash, section schema, and
canonical serialization. It also cross-binds the package audit to the first candidate's exact
manifest and unpacked inventory; the advisory to the dependency graph and observation time;
provenance to the advisory bytes and tooling identity; and both candidates to the observed runner.
Changed retained bytes and internally valid but cross-bound audit drift therefore fail
independently.

This verifier authenticates the retained tarball bytes against the identities established by the
candidate assembler and its same-path unpacked inspection. It does not unpack and execute tarballs
again; the two complete run records and first-path audit binding are the retained evidence for that
effectful work.

## Validation

The release-candidate tooling passes 115 focused tests across 21 files. E4 coverage includes a
successful retained bundle and independent recheck; actual installed-graph traversal and worktree
containment; exact matrix counts; deterministic byte drift; changed and additional retained files;
post-write cross-binding failure; and a one-shot injected failure at preparation, quality gate,
first build, first consumer matrix, second build, second consumer matrix, and environment
observation. Every adverse run proves that no output or sibling partial bundle remains and that no
boundary is retried.

TypeScript, ESLint, formatting, documentation tests, the documentation build, and the complete
repository quality gate must pass before this proposal is presented for acceptance.

## Acceptance effect

Acceptance completes Phase 6C-E4 and authorizes Phase 6C-E5 authoritative execution and disposition
planning only. E5 still requires separate authority for any dated read-only advisory retrieval and
for the exact authoritative run. Acceptance does not accept a candidate, authorize advisory
retrieval by itself, contact a registry, publish packages, change release state, authorize Phase 6D
deployment or Phase 6E npm release work, or begin the separate SpaceTraders client.
