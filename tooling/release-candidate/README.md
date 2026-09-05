# Private release-candidate tooling

This directory implements the private Phase 6C release-candidate proof defined by ADR 0036. It is
not a workspace package, npm artifact, public API, or production dependency.

Phase 6C-B contains only write-free functions for the exact six-package inventory, deterministic
manifest projection, dependency-range validation, packed-file allowlist and source-map inspection,
and SHA-256 evidence. It does not create worktrees, stage files, pack tarballs, install
dependencies, contact a registry, read credentials, or publish anything.

Run the retained checks from the repository root:

```sh
pnpm release-candidate:core:check
```

The later 6C-C stage will add the separately reviewed effect adapter. Source packages remain frozen
at the commit recorded in the accepted Phase 6B freeze.
