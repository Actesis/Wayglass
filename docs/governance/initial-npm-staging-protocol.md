# Initial staging publisher: transport-free protocol

Status: first implementation slice for review. No live writer, credential path, execution CLI, OIDC
permission, or workflow wiring is added. The existing hosted workflow remains verification-only.
Merging this change does not authorize registry actions or accept the release archives.

## Hosted preflight observation

[Run 42487252360](https://github.com/Actesis/Wayglass/actions/runs/42487252360), attempt 1,
succeeded after `Actesis` approved `npm-release`. It ran the manual main-only preflight at commit
`74c7b7cd6d007ce6a8a610a8844c414b03bffcc7`, tree `5141ef37301f8a6aeca5746ef31ae284f38e0ccc`. The
GitHub-hosted job ran from `2026-11-08T14:06:11Z` to `2026-11-08T14:08:27Z`. The frozen install,
full uncached quality gate, retained archive verification, and report upload all passed. No registry
write step exists.

Artifact `13620417254`, named
`initial-release-preflight-74c7b7cd6d007ce6a8a610a8844c414b03bffcc7-1`, is 1826 bytes and expires
`2026-11-15T14:08:23Z`. Its independently downloaded ZIP matches GitHub's digest
`c075a344059f8b355d1282abf879b90639d5d06ad5a5726f2f07034da2ca4c57`. Its sole entry,
`publication-preflight.json`, hashes to
`41e6f63d69fa3f093237d19d59b282b196fc7c151761a866a038e5b2b0c00861`.

The report observed `structuralValidationPassed: true` at `2026-11-08T14:08:22.868Z`, but kept
`readyToStage: false`, both execution authorizations false, and all seven release gates open. It
validated the already retained ZIP, not a rebuilt candidate. Advisory findings were zero with the
accepted `WG_RC_ADVISORY_MEDIA_TYPE` warning. Its validity still ends at `2026-11-08T16:04:23Z`;
this historical success cannot renew it. No capture, retry, credential creation, stage, placeholder,
tag, or publication occurred. The report and this observation are not final artifact acceptance.

## Fixed upload protocol

Private `tooling/release-candidate/src/staging-protocol.ts` uses only Node crypto and existing
helpers. No dependency is added. It is deliberately not exported through the pure candidate index,
registered in the CLI, or imported by a workflow. It has no filesystem, subprocess, network, or
credential access. Tests read the real retained archives and simulate CLI responses; they never run
npm.

`createInitialStagingProtocol` checks all six input byte arrays against the exact reviewed Linux
SHA-256 values and sizes before offering an intent. Basenames and order are fixed: core, tokens,
themes, elements, icons, React, all `0.1.0`. A missing, duplicate, reordered, corrupt, substituted,
path-like, or seventh archive fails before the first intent. The module snapshots byte arrays for
hashing and retains immutable identities, not caller-owned arrays or executable paths.

`beginNext` describes one future upload using pinned npm `11.21.2`, a fixed relative `.tgz` path,
official HTTPS registry, public access, proposed `next`, scripts/workspaces disabled, JSON output,
mandatory provenance, and zero HTTP fetch retries. It never executes that description. `next`
remains a proposal requiring final owner confirmation, not a selected live tag. No arbitrary
command, scope, registry, version, path, option, approval, rejection, dist-tag, or cleanup input
exists.

Only one upload can be unresolved. `completeUpload` requires the pinned CLI's single keyed receipt
with exact name/version/ID, filename, byte count, SHA-1, SHA-512 SRI, and a canonical stage UUID.
IDs cannot be reused between packages. SHA-256 admits the reviewed input; independently derived
SHA-1 and SHA-512 bind the CLI receipt to those same bytes. A bounded 2 MiB receipt prevents
unbounded untrusted JSON parsing; it is an internal resource limit, not package API. Errors do not
echo raw responses or preserve token-like content.

`failUpload` and invalid receipts stop permanently. Earlier accepted CLI receipts remain available,
the current package is marked uncertain, and no automatic retry or later upload is offered. A
timeout, missing receipt, or nonzero result cannot prove the server made no mutation. The later
adapter must persist the in-flight identity before sending and journal safe receipts after each
operation so process interruption does not discard the last known state. New protocol construction
is not permission to retry; renewed owner direction and independent state inspection are required.

The snapshot's `confirmed` entries mean **CLI-reported identities only**, not authenticated registry
readback. Every snapshot keeps `registryReadbackVerified: false`, `provenanceVerified: false`,
`readyToPromote: false`, and execution authorizations false. Placeholder state remains `unobserved`;
the adapter must separately record actual versions/tags/content rather than infer them from CLI
success. Six accepted receipts end in `uploads-reported-human-review-required`, never “released.”

## Source verification and remaining adapter work

The implementation was checked against official npm `11.21.2`, tag commit
`1c66798c9def37e12509ccebb5b08cddf247c2e8`, on November 8, 2026:

- [Stage-publish implementation](https://github.com/npm/cli/blob/v11.21.2/lib/commands/stage/publish.js)
  inherits tarball handling from
  [publish](https://github.com/npm/cli/blob/v11.21.2/lib/commands/publish.js).
- [Tar JSON](https://github.com/npm/cli/blob/v11.21.2/lib/utils/tar.js) supplies the package-keyed
  archive fields; stage publish adds the returned stage ID.
- [Registry upload](https://github.com/npm/cli/blob/v11.21.2/workspaces/libnpmpublish/lib/publish.js)
  sends a stage POST and attaches generated provenance. CLI receipt hashes are not signed remote
  readback and do not include the immutable stage tag or verified attestation.
- [Provenance generation](https://github.com/npm/cli/blob/v11.21.2/workspaces/libnpmpublish/lib/provenance.js)
  identifies the actual upload workflow/ref/commit/run. Do not impersonate the historical assembly
  invocation by rewriting GitHub environment values.

The next slice is the separately reviewed live adapter and approval format. It must revalidate exact
bytes immediately before each upload in an owned directory, reject symlink/config/environment
overrides, isolate credentials from installation/build/test activity, require exact final owner
authority, verify current protected main/checks and advisory, perform authenticated collision
checks, and journal safe partial state without command-output/secret leakage. Do not trust npm's
internal packument lookup alone: the pinned CLI catches lookup errors as an empty version set.

Provenance generation and immutable public transparency-log writes require explicit authorization.
The later adapter must preserve truthful links to frozen source and original build evidence, and
verify the actual attestation subject digest, signature/identity, workflow invocation, immutable
stage tag, and downloaded staged bytes before any human promotion. A provenance flag or CLI receipt
alone is insufficient. The bootstrap token must be revoked promptly after success or failure; no
automatic revocation bypass or unreviewed registry cleanup is introduced here.

Only the owner may promote accepted stages with interactive 2FA, after independently reviewing the
whole set. The [initial release proposal](./initial-npm-release-proposal.md) remains the governing
plan; this transport-free slice does not make its planning JSON executable. The repository still
contains no registry-writing publisher, and the hosted verification workflow is unchanged.

The next [guarded adapter core and approval-format slice](./initial-npm-guarded-adapter.md) adds
scope validation, gate rechecks, owned files, and journal/checkpoint sequencing with simulated
ports. It does not connect this protocol to npm, credentials, or a workflow.
