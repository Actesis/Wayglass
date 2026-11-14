# Signing-only release proposal

Status: signing remains a design only. The separate unsigned reproducibility workflow is implemented
for review. No signing or registry write is authorized.

The manual `initial-release-reproduction.yml` check uses the pinned toolchain on hosted Ubuntu,
verifies the retained ZIP digest, and compares all six compressed archives with `cmp`. A difference
stops the job before its evidence upload. The job retains only assembly metadata, not replacement
tarballs or signed provenance. It is not the eventual build-and-sign invocation and does not
substitute for that invocation. Dispatch requires separate approval.

Keep the owner-operated first release and retain npm provenance. Use a separately approved hosted
build-and-sign run with no npm write credential. A later signing-only run that merely downloads the
old tarballs must not describe itself as having built them. The earlier rehearsal remains historical
evidence, not a signed attestation.

## Recommended route

### Unsigned hosted handoff result

[Run 43615735437](https://github.com/Actesis/Wayglass/actions/runs/43615735437), attempt 1, passed
after Actesis approved the environment. The two jobs ran at
`6e6b153c0c21a443ed64c5116718b95983920f05`. All six compressed rebuilds matched; the second job
verified the handoff and emitted unsigned subjects only.

- Build inputs artifact `14121849241`, ZIP SHA-256
  `b23e10964831b3e04c16049a4f3e4cb278da715c86851d5fb2b56f2397055a58`.
- Unsigned subjects artifact `14122661788`, independently downloaded and verified ZIP SHA-256
  `0a0ac96cf91e571978539e4284b128259205661210d09a0634a38ed7fa87d681`.
- Parsed assembly evidence JSON SHA-256
  `2cbdced3b78b798331611f04ec25bc91554265b513de34d41ad21cd5f6c2ffaf`.

Independent readback checked all six subject names, byte counts, SHA-256 and SHA-512 values against
the retained tarballs. Both authorization flags remained false. This result verifies the unsigned
boundary; it is not reusable as the build invocation for a later signing run.

### Implementation plan

The manual `initial-release-signing.yml` workflow currently exercises only the unsigned handoff. It
compares the rebuilt bytes, passes the immutable artifact ID and digest between jobs, verifies
GitHub metadata and ZIP bytes, and streams the seven expected entries without extracting archive
paths. It has no signing job, OIDC permission, or npm credentials.

1. Separately authorize an exact-source reproducibility run with the recorded Linux assembly
   toolchain. Compare all six compressed tarballs byte-for-byte against the retained set. Stop on
   any difference; do not sign a substitute, amend the accepted hashes, or fall back to an unsigned
   release. This is a proposed new evidence run before final approval, not a rebuild during
   publication.
2. In the same hosted workflow invocation, hand only digest-verified build outputs to an isolated
   signing job. Build and test jobs have no signing permission. Only the signing job may request
   GitHub OIDC, behind explicit owner approval. Do not provision npm trust for this workflow. No
   stage, publish, tag, or promotion command is part of the signing workflow.
3. Review the exact signer implementation, tool pins, certificate identity, and public
   transparency-log payload before authorizing that job. Record the actual build invocation and
   frozen source as distinct identities without overriding GitHub identity variables. Require an
   npm-compatible bundle with a single package URL and SHA-512 subject per tarball.
4. Independently verify each bundle's signature, signer, workflow invocation, transparency evidence,
   and subject. Retain the verified bundles and their digests. The owner can then attach them in the
   separately authorized local staging session; no hosted journal is needed.

[npm's provenance guidance](https://docs.npmjs.com/generating-provenance-statements/) describes the
hosted build requirement and public transparency ledger. The
[pinned npm verifier](https://github.com/npm/cli/blob/1c66798c9def37e12509ccebb5b08cddf247c2e8/workspaces/libnpmpublish/lib/provenance.js)
checks the supplied bundle and subject; that alone does not replace independent signer-policy
verification. Compatibility of the eventual signer and approved predicate must be demonstrated, not
inferred from a generic GitHub artifact attestation.

## Stop conditions

The unsigned input helper under `tooling/release-candidate/src/signing-inputs.ts` binds exact
reviewed bytes and assembly metadata to the same declared run and attempt and prepares SHA-512
subjects. Its tests use fictional run context. It authenticates neither runtime identity nor
artifact origin, so the future wrapper must independently verify the build-job handoff and signer.
It does not construct a signed statement, request OIDC, or call any service.

The unwired artifact handoff verifier compares the successful build job's expected artifact ID and
digest with GitHub's
[artifact metadata](https://docs.github.com/en/rest/actions/artifacts#get-an-artifact) and verifies
the downloaded ZIP bytes before extraction. The artifact name binds the attempt because the
metadata's workflow run object does not expose it. The wrapper must obtain those outputs from the
actual successful build job, fetch metadata independently, bound the download, and validate the
extracted inventory before preparing subjects. No signer identity is verified by this helper.

The original compressed bytes may not reproduce on a newer runner image. If so, bring the evidence
back for an explicit decision: separately requalify new artifacts or reconsider the provenance
requirement. No silent fallback is authorized. Refresh the expired advisory only under separate
approval, close to release. Workflow implementation, signing and public transparency-log submission,
and npm execution are distinct approval boundaries.
