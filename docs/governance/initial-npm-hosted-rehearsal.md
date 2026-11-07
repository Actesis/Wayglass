# Initial npm hosted rehearsal result

Status: successful publication-disabled assembly, November 7, 2026. Not publication approval.

[GitHub Actions run 42386180167](https://github.com/Actesis/Wayglass/actions/runs/42386180167)
completed successfully in 3m58s from merged tooling commit
`2b68e42644038e4e9d37aab4743e62769e30a5f1`, tree `bd8833b19f46199697ba7c093d64333829ddbc66`. It
authenticated frozen package source `ce400e89930a047c6af1c6992c64cfe422a1eeee`, tree
`da2550b5aa2636d0896ae61e08c340f405fe1412`, and lockfile SHA-256
`bdb6b4e916bd5fa2330fc3dd3f272814c6940ec04dab78b437b7007be386a525`.

The GitHub-hosted Ubuntu 24.04 x64 runner used Node 26.8.1, pnpm 11.9.0, and npm 11.19.0. Fresh
frozen-lockfile dependency provisioning, the uncached tooling quality gate, two offline
frozen-source assemblies, reproducibility comparison, independent verification, and artifact
retention all passed. All six projected manifests retain `private: true`.

## Exact hosted artifacts

All versions are `0.1.0`. SHA-256 values identify compressed tarball bytes, not merely their
contents.

| Package              | Tarball SHA-256                                                    |
| -------------------- | ------------------------------------------------------------------ |
| `@wayglass/core`     | `45c2f9df0bf537f92e1cb0601b6b83290fe36656ab50483f8143b01cb6fce6f8` |
| `@wayglass/tokens`   | `257a871c2bd036f0a21cf9f9f340be4b069f4dc84424e3001e67c92fd214da3f` |
| `@wayglass/themes`   | `838bd4a0fb51678aee9ceed52938b182f85fff5e8018d38be6e8457de24ddfda` |
| `@wayglass/elements` | `55ea103fed37d42a5e4c6a28e636485b94da6d9f9520271ba79e7d4555bc9f38` |
| `@wayglass/icons`    | `5fcbe7fe59a44b636185b4a0d16b3b34784e76b21b0ef64f8e7e5669995eaa8e` |
| `@wayglass/react`    | `5f0c9b8af407229f483bbd077d52548466b26079c5b25364d2bd7e1054ba9763` |

GitHub artifact `13579637617`, named
`private-candidates-2b68e42644038e4e9d37aab4743e62769e30a5f1-1`, has archive digest
`sha256:a83a9fa1eccf60aad85f65d7b4b9473411d06ae77c4e6eaab7a8d7bc58c50d1f`. The seven-day retention
expires November 14, 2026 at 15:27:47 UTC. This is temporary review retention, not durable release
evidence. The artifact is publicly downloadable from the public repository; the word private
describes the npm guard, not access restrictions.

## Independent review and cross-platform comparison

The hosted artifact was downloaded and the existing independent candidate verifier passed locally.
All six manifest and inventory hashes match the preceding local macOS arm64 rehearsal. The
compressed tarball hashes differ between macOS and Linux, but decompressing every corresponding pair
produced byte-identical complete tar streams, including archive metadata. The difference is
therefore in gzip encoding, not package contents. This establishes reproducibility within the
recorded hosted environment, not universal cross-platform compressed-byte reproducibility.

These hosted hashes supersede no accepted historical Phase 6C evidence. The historical bundle
remains untouched; later publication must bind newly approved publishable bytes and their own
environment. Do not edit these private tarballs in place or reuse their hashes for public artifacts.

## Remaining boundaries

This hosted run did not execute fresh independent consumer/browser probes or capture a current
advisory snapshot. A subsequent local probe against these downloaded hosted tarballs stopped with
`WG_RC_CONSUMER_OFFLINE_MATERIAL`: the isolated consumer install required `postcss@8.5.32`, absent
from the repository-local store. It failed before completing the matrix; no consumer/browser pass is
claimed. No network fallback or store provisioning was performed. Fresh consumer dependency
materialization needs a separately reviewed provisioning step before retrying the offline proof.

The run did not resolve the recorded transitive license-file limitation, broaden accessibility
support, create release tags, configure npm access, request OIDC, use publishing secrets, publish
packages, or deploy documentation. Continue with the remaining checklist in the
[initial release preparation](./initial-npm-release.md); assembly success alone is not readiness.
