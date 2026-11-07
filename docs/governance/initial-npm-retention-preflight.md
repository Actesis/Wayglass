# Retained archive and initial release preflight

Status: implementation for review. No registry writer is implemented or enabled. The merged
[release proposal](./initial-npm-release-proposal.md) authorized the next bounded retention and
credential-free implementation step; it did not approve credentials, staging, public placeholders,
tags, provenance, promotion, or npm publication.

## Exact retention

The existing hosted ZIP is mechanically copied, not rebuilt or repacked, to
`docs/governance/evidence/initial-npm-public-0.1.0.zip`. Both source and destination hashes are
`4e4420000766bd883b87f3e38c0cfef637988475922dd8d0d18c8e4fe1e98dc9`; size is exactly 772966 bytes.
This is the already public artifact `13589981847` from owner-approved run `42412111878`, not a new
candidate or source freeze. The
[independent hosted review](./hosted-publication-rehearsal-result.md) records its exact
package/evidence hashes and provenance limitations.

This one-time approximately 0.77 MB addition becomes retained public Git history when merged. Its
bytes then no longer depend on the November 14 Actions-artifact expiry or local temporary storage. A
branch review copy is not yet protected-main release retention, and retention is not final artifact
acceptance. Future releases need a separately reviewed retention policy rather than automatically
accumulating binary archives in Git. Package allowlists are unchanged; this ZIP does not become part
of any npm tarball.

## Credential-free validation

```sh
pnpm release-candidate:publication-preflight -- --output <new-absolute-temporary-directory>
```

The command accepts only `--output`, authenticates clean committed tooling, and reads the fixed
retained ZIP and execution-disabled review record. It has no alternate registry, archive, action, or
publication mode. Credential variables are rejected before effects. A mutated approval-shaped
planning record is rejected instead of enabling a writer.

Before extraction, it requires the reviewed ZIP's exact length and SHA-256 and exactly 77 unique
portable paths. It checks the digest-verified snapshot in a new owned OS temporary directory,
extracts only that snapshot, and rechecks the complete regular-file inventory. This is not an
extractor for arbitrary caller-supplied ZIP files. Existing Node built-ins and the platform's
`unzip`, `tar`, and Git suffice; no archive library dependency is added. `unzip` is present in the
[GitHub Ubuntu 24.04 image inventory](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md).

The existing public archive and consumer-proof verifiers then rehash both candidate copies, all 48
graph files, frozen projected manifests, and matrix coverage. Preflight additionally matches all six
expected package sizes/hashes, byte-identical assembly/tested evidence and archives, historical
tooling tree, receipt identity, and pinned proof/evidence hashes against the committed review
record. It does not replay browsers or contact GitHub to reauthenticate the historical run; the
original independent admission remains the linked record above.

The exact accepted advisory snapshot is rehashed and its bound lockfile/expiry checked at the
observation time. Its media-type warning and finding count are carried forward. Expiry is an
explicit blocker, never an implicit capture, retry, security pass, or extension. Current evidence is
still rechecked before any future registry action.

On success, only `publication-preflight.json` is retained in the new output directory; extracted
files are removed. Failure removes only owned temporary/output paths, not the source ZIP, existing
owner output, or earlier evidence. The report always states:

- `mode: verification-only`;
- `publicationAuthorized: false`, `registryActionsAuthorized: false`, `readyToStage: false`;
- `historicalHostedRunReauthenticated: false` and `provenanceGenerated: false`; and
- outstanding final artifact/commit/tag decisions, publisher/provenance review, current protected
  main/checks, account/2FA/collision checks, registry execution authority, and any expired advisory.

A green structural result is not a green publishing gate. Registry checks are not faked as passed,
and a current advisory does not remove the separate approval blockers. No npm command, package
build, install, lifecycle script, registry request, OIDC request, or credential path exists in this
preflight. The report is review evidence, not an executable instruction list.

## Hosted wrapper and next boundary

`.github/workflows/npm-initial-release.yml` currently implements **Initial npm release preflight (no
registry writes)** only. It is manual, main-only, owner-environment-gated, read-only, uses the
existing full-SHA action pins and exact Node/pnpm, and restores no caches. Tooling installation and
quality checks are credential-free; no secret or OIDC permission is referenced. It uploads only the
preflight report for seven days. It does not upgrade npm, stage, create placeholders, sign
provenance, create tags, approve stages, or publish. A fresh owner UI approval is required for its
first hosted run after review/merge; the agent must not approve that gate through the API.

The registry-writing phase remains separate reviewed work. The retained JSON keeps every execution
authorization false and the final release commit/approver null. Owner `next` confirmation and exact
artifact acceptance, reviewed writer code, stage-only credential setup, truthful provenance, live
registry collision checks, fresh advisory input, final execution authorization, and owner 2FA
promotion remain required. No npm trust configuration or bootstrap credential is created here.
