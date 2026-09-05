# Phase 6C-C isolated assembler implementation

**Status:** Proposed for project-owner acceptance on September 5, 2026. This record covers the
private isolated assembler authorized by the accepted Phase 6C-B implementation. It does not accept
a candidate artifact, authorize Phase 6C-D consumers, publish or contact npm, remove package
privacy, create a tag or release, change repository visibility, deploy, or work in an external
application.

## Implemented boundary

`tooling/release-candidate/` now separates its write-free projection, inspection, hashing, and
repeated-build comparison from an explicit Node effect adapter. The adapter:

- rejects recognized npm, registry, GitHub, Cloudflare, release, and publication credential names
  before a command runs while not confusing unrelated variables such as `GH_PAGER`;
- resolves the current repository and requires a clean, exact tooling commit;
- accepts only the frozen 40-character source commit, then verifies its commit, tree, lockfile
  SHA-256, six source manifests, and deterministic projections through Git object reads;
- creates each detached worktree below a fresh operating-system temporary directory and verifies its
  clean source identity before materialization;
- installs only from the repository's existing content-addressed pnpm store with
  `--offline --frozen-lockfile --ignore-scripts`;
- runs the complete repository gate with `TURBO_FORCE=true`, then rebuilds the six candidates in
  dependency order;
- copies only `dist/`, `README.md`, `LICENSE`, and `NOTICE`, writes the projected `package.json`,
  and rejects nonregular files or content that fails the Phase 6C-B inspector;
- runs local `npm pack` with offline, no-script, no-audit, no-funding, and no-update controls plus a
  tool-owned temporary npm cache and empty user configuration; pnpm materialization receives the
  same isolated user-configuration override;
- independently extracts and re-inspects every tarball, including exact manifest and file-inventory
  equality;
- repeats the entire worktree, install, gate, build, stage, pack, and inspection pass in a second
  fresh root and requires exact package metadata, contents, and tarball hashes; and
- retains the first matching tarball set and normalized evidence only after both passes agree, then
  removes its worktrees and temporary roots. A build or cleanup failure removes any newly created
  output directory. If Git refuses worktree removal, the owned temporary root remains available for
  explicit recovery rather than being deleted behind stale Git metadata.

Subprocesses receive argument arrays with `shell: false`. The tool never builds a command string,
uses lifecycle scripts, mutates the frozen source manifest, or changes `private: true`.

## Command and path behavior

The accepted private commands are now wired at the repository root:

```text
pnpm release-candidate:check -- --source <full-sha>
pnpm release-candidate:build -- --source <full-sha> --output <abs-dir>
pnpm release-candidate:verify -- --evidence <abs-path>
```

Check authenticates and projects Git objects without writing. Build requires an absolute,
nonexistent output below the real operating-system temporary root and outside the repository. Verify
reads an existing absolute evidence path, validates the frozen identity, exact package order,
two-run result, tooling hashes, and retained tarball hashes. Exit `0` is success, candidate or
evidence failure is `1`, and invalid invocation, unsafe output, credential exposure, or an
unavailable command is `2`.

The retained evidence contains source and tooling commit/tree identities, source lockfile hash,
platform, architecture, Node, pnpm, and npm versions, the exact two-run result, and ordered
per-file, inventory, manifest, unpacked-byte, tarball-byte, and tarball-hash data. It contains no
arbitrary environment dump, credential value, username, or temporary worktree path.

## Retained validation

The focused suite covers credential rejection and false-positive resistance, explicit offline
controls, output containment and preexistence, no-shell argument handling, exact Git source
authentication, safe staging, actual local private-package packing and unpacked inspection,
write-free import isolation, and repeated-build inventory and byte-drift rejection. The local-pack
test uses only current built output and a new temporary npm cache; it neither installs nor contacts
a registry.

The implementation adds no dependency, workspace package, public export, source-package change, or
retained tarball. The full two-pass candidate execution is deliberately reserved for Phase 6C-E's
integrated evidence run; 6C-C proves the adapter and its adverse boundaries without presenting a
temporary development run as accepted release evidence.

The complete `PNPM_CONFIG_OFFLINE=true TURBO_FORCE=true pnpm check` gate passed against the final
implementation with no Turbo cache hits: formatting and repository lint; all 14 scheduled builds;
all 20 typecheck tasks; all 20 package/application test tasks; 227 documentation assertions; 58
icon-tooling tests; 93 token-tooling tests; 41 release-candidate tests; and 24 retained
visualization-proof tests. The run retained only the known successful-build Storybook large-chunk
warning and Node `module.register()` deprecation plus expected Lit development-mode test messages;
none masked a failure or changed package source.

## Remaining boundary

Phase 6C-D still owns independent temporary Vanilla and React consumers, exact local-tarball
installation, minimum/current compiler and React probes, browser behavior, tree shaking, and
removal. Phase 6C-E owns the complete two-pass candidate matrix, current dependency/license/advisory
review, integrated normalized evidence, exact final hashes, limitations, and owner acceptance.

## Acceptance effect

Acceptance completes Phase 6C-C and authorizes Phase 6C-D independent-consumer implementation only.
It does not accept a tarball, hash, evidence run, publication readiness, package privacy change, npm
or registry access, credential use, tag, release, repository visibility change, deployment, or
external application work.
