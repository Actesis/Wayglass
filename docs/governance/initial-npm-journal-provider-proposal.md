# Durable staging journal provider proposal

Status: proposed for owner review. No provider is configured or verified live.

Recommend a dedicated private Amazon S3 bucket. The journal requires an atomic claim shared across
workflow runs, independent exact readback, and retention after the runner disappears.

- [S3 conditional writes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html)
  provide create-if-absent with `If-None-Match: *`. Conflicts and uncertain outcomes stop execution.
- [Actions artifacts](https://github.com/actions/toolkit/blob/main/packages/artifact/README.md) can
  retain supplemental evidence, but run-scoped name conflicts are not a global claim.
- [Git references](https://docs.github.com/en/rest/git/refs#create-a-reference) could anchor a
  shared claim, but would introduce repository write authority into the release job.

## Proposed controls

Use a dedicated role limited to the journal prefix, with only conditional object creation and
exact-key readback. Enforce the condition in bucket policy; grant no delete, listing, lifecycle,
policy, or retention override access. Block public access and verify the expected account, bucket,
and region. Keep storage credentials out of the npm child. Preserve the same claim namespace across
attempts and runner replacements.

Propose no automatic expiry until an owner-reviewed disposition. The policy must prevent delete
markers from making a claim appear absent.
[Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock-managing.html)
protects versions but does not itself prevent delete markers. If administrator-proof retention is
required, choose a mode and term explicitly before provisioning.

## Verification before wiring

After separate approval of account, region, cost boundary, and retention policy, test with fictional
bytes and isolated keys: verify independent exact readback, exactly one winner for concurrent
creates, and rejection of unconditional overwrites and deletes. A fresh process must reject an
already claimed ID. An uncertain acknowledgment stops execution without a retry. Record the retained
test objects and evidence; use no npm credentials.

This proposal authorizes no provisioning and verifies no live storage. Provider implementation and
acceptance, namespace authority, signing, and current advisory evidence remain separate from owner
execution approval.
