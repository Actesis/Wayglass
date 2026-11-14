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
   [npm provenance requirements](https://docs.npmjs.com/generating-provenance-statements/)
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

## Revisit when automating

The existing automated adapter still requires create-only durable checkpoints before upload. Do not
replace them with a no-op or a local temporary file. Revisit a durable provider when unattended
staging or multiple release operators need shared coordination. S3 was evaluated, not selected; no
account, bucket, policy, or credential was created.
