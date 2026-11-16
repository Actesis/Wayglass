# Defer hosted staging journal storage

Decision: defer hosted journal storage and automated staging for the first Wayglass release. The
owner will operate npm staging and promotion interactively and retain a local release record. There
is no storage provider to provision, and npm consumers are unaffected.

## Owner-operated first release

1. Before any upload, approve the exact retained tarballs, current advisory, release commit, release
   notes, public placeholder exception, and explicit `next` tag. Verify npm account, namespace
   authority, 2FA readiness, and package/stage collisions separately.
2. Review provenance separately. The local session must not impersonate the historical build or
   silently omit required provenance. Before execution, approve a supported signing-only process for
   the exact retained bytes and verify the resulting bundles and their signer.
   [Signing-only design proposal](./initial-npm-signing-only-proposal.md)
3. Use a dedicated owner-operated npm session with the reviewed CLI, not a hosted staging token. npm
   documents that
   [session tokens support staging](https://docs.npmjs.com/cli/v11/commands/npm-stage/#token-behavior).
   Retain a local record outside temporary storage: archive hashes, intended tag, each upload intent
   before sending, and the returned stage ID and observed registry effects afterward. Keep
   credentials and raw authentication output out of that record.
4. If a response is missing or an operation is interrupted, stop. Inspect the staging queue and
   registry using the authenticated owner account before considering any retry. If state cannot be
   reconciled, do not retry or promote. Review the complete set of exact downloaded stages,
   metadata, tags, and attestations before separate interactive 2FA promotion.
5. Verify public bytes and clean registry installs before announcing the release.

This decision does not authorize execution, advisory capture, signing, credential changes, public
placeholders, or publication. The hosted preflight stays verification-only.

## First staging handoff: outstanding owner checks

The retained release tarball ZIP, signed provenance ZIP, and refreshed advisory snapshot matched
their recorded SHA-256 values at readback. The approved advisory expires at `2026-11-17T02:27:17Z`
(November 16 at 8:27 p.m. Central). Recheck freshness and all digests at execution. Do not point the
hosted preflight at the old advisory and treat its outcome as approval.

An unauthenticated npm read on November 15 Central returned HTTP 404 for the six scoped names: core,
tokens, themes, elements, icons, and react. This only establishes that those package names were not
publicly visible to the check. The maintainer must still check authenticated scope access, 2FA,
private versions, and pending stages in the dedicated npm session before any upload.

Final approval must cover these exact six `0.1.0` tarballs and matching provenance, the explicit
`next` dist-tag, the public `0.0.0-stage` placeholder effect for new packages, release notes and
support boundaries, the release commit and tag target, and the partial-failure policy above. Staging
and later interactive promotion are separate approvals. This handoff records no new execution
authority.

## Revisit when automating

The existing automated adapter still requires create-only durable checkpoints before upload. Do not
replace them with a no-op or a local temporary file. Revisit a durable provider when unattended
staging or multiple release operators need shared coordination. S3 was evaluated, not selected; no
account, bucket, policy, or credential was created.
