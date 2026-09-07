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
pnpm release-candidate:capture-advisory -- --source <accepted-full-sha> --output <absolute-new-temp-file>
pnpm release-candidate:integrated -- --source <accepted-full-sha> --output <absolute-new-directory> --advisory-snapshot <approved-absolute-file>
pnpm release-candidate:verify-integrated -- --bundle <absolute-directory>
```

The build command refuses an existing path or any path outside the operating-system temporary root.
It rejects recognized release credentials before running a command, uses the repository's existing
pnpm content-addressed store in offline mode, and never removes `private: true`. It runs two
complete fresh assemblies and retains tarballs only when their projected contents and tarball bytes
agree.

These commands do not publish, contact npm, create a tag or release, change repository visibility,
or authorize the resulting candidates. Source packages remain frozen at the commit recorded in the
accepted Phase 6B freeze.

The integrated command is the Phase 6C-E4 transactional orchestrator. It requires an already
approved local advisory snapshot, runs the uncached quality gate and two complete candidate plus
consumer/browser runs, and retains the first run's six tarballs with canonical package, dependency,
environment, quality, provenance, and advisory evidence. It never fetches advisories, retries a
failed run, or retains partial output. The separate integrated verifier checks exact files, hashes,
canonical schemas, deterministic equality, and cross-section bindings without rerunning the build.

The E5 advisory-capture command is a separate, deliberately networked read operation. It first
reproduces the exact audited production graph offline, then makes one credential-free request to the
fixed npm bulk-advisory endpoint. It sends only the seven public dependency names and exact
versions, rejects redirects and fallback, hashes the exact response bytes, and atomically writes one
canonical 24-hour snapshot. The command is never run by `pnpm check`, build, test, or the integrated
command; invoking it live requires the separately recorded E5B authority.

Phase 6C-D consumer tooling adds a pure six-scenario compatibility contract and a separately
effectful temporary-project harness. The harness accepts only verified local candidate evidence,
vendors scenario-specific tarballs, resolves and installs offline with scripts disabled, and removes
the owned project on every exit. Vanilla and React behavior fixtures are added only in their
separately reviewed D2 and D3 slices.

After an ephemeral candidate has been assembled, the two Vanilla compiler probes can be invoked with
`pnpm release-candidate:probe:vanilla -- --evidence <absolute-path> --store <absolute-path>`. The
command remains offline, rejects recognized credentials, uses only the supplied candidate tarballs
and content-addressed store, and deletes both generated consumer projects.

The four React/TypeScript cross-product probes use the equivalent
`pnpm release-candidate:probe:react -- --evidence <absolute-path> --store <absolute-path>` command.
They retain only the selected toggle wrapper, verify the client-only fallback fixture, and rebuild
with direct elements after removing the binding, React runtime, and React type packages.
