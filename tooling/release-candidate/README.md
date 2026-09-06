# Private release-candidate tooling

This directory implements the private Phase 6C release-candidate proof defined by ADR 0036. It is
not a workspace package, npm artifact, public API, or production dependency.

The write-free core owns the exact six-package inventory, deterministic manifest projection,
dependency-range validation, packed-file allowlist and source-map inspection, SHA-256 evidence, and
repeated-build comparison. The separate effect adapter owns authenticated detached worktrees,
offline frozen installation, uncached builds, temporary staging, script-disabled local packing,
unpacked verification, retained evidence, and cleanup.

Run the retained checks from the repository root:

```sh
pnpm release-candidate:core:check
pnpm release-candidate:check -- --source <accepted-full-sha>
pnpm release-candidate:build -- --source <accepted-full-sha> --output <absolute-new-temp-directory>
pnpm release-candidate:verify -- --evidence <absolute-path>
```

The build command refuses an existing path or any path outside the operating-system temporary root.
It rejects recognized release credentials before running a command, uses the repository's existing
pnpm content-addressed store in offline mode, and never removes `private: true`. It runs two
complete fresh assemblies and retains tarballs only when their projected contents and tarball bytes
agree.

These commands do not publish, contact npm, create a tag or release, change repository visibility,
or authorize the resulting candidates. Source packages remain frozen at the commit recorded in the
accepted Phase 6B freeze.

Phase 6C-D consumer tooling adds a pure six-scenario compatibility contract and a separately
effectful temporary-project harness. The harness accepts only verified local candidate evidence,
vendors scenario-specific tarballs, resolves and installs offline with scripts disabled, and removes
the owned project on every exit. Vanilla and React behavior fixtures are added only in their
separately reviewed D2 and D3 slices.
