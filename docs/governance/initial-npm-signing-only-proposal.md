# Signing-only release proposal

Status: a default-off signing mode is implemented for review. No live signing, log submission,
staging, or registry write is authorized.

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

The manual `initial-release-signing.yml` workflow supports the unsigned handoff and two isolated,
opt-in probes. The unsigned jobs compare the rebuilt bytes, pass the immutable artifact ID and
digest between jobs, verify GitHub metadata and ZIP bytes, and stream the seven expected entries
without extracting archive paths. The opt-in signing job and the isolated probes have job-scoped
OIDC permission. The workflow has no npm write credential.

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

### Signing-run review boundary

The `signing-commit` mode is off by default and mutually exclusive with both probe modes. It binds
dispatch to one exact reviewed `main` SHA and GitHub attempt 1, with separate owner approval of the
signing job after the successful current-run build and verified handoff. The signing job must
revalidate the artifact ID, ZIP digest and contents; the prior unsigned run and the certificate
probe are not inputs to the signing job.

Before any outbound signing request, derive and validate all six statements and recheck the live
OIDC identity. Require a signer that can expose its Fulcio certificate for verification before
submitting artifact signatures. Review the exact bundled signer, Rekor endpoint and entry type,
timestamp behavior, and payload format before wiring the workflow: the high-level Sigstore `attest`
call can combine issuance and log submission, so do not assume it provides a certificate-policy gate
before the public log write.

The unwired local signing helper rechecks the six package inputs, derives the statements, and
requires the pinned Fulcio certificate gate to accept the key and run identity before creating any
envelopes. It implements the fixed in-toto media type and
[DSSE pre-authentication encoding](https://github.com/dsse-lf/dsse/blob/master/protocol.md) with
Node's built-in crypto. Its output is not a Sigstore bundle: there is no issuance, log, timestamp,
or workflow wiring in the helper.

The offline Rekor adapter targets the
[v1 DSSE 0.0.1 schema](https://github.com/sigstore/rekor/blob/main/pkg/types/dsse/v0.0.1/dsse_v0_0_1_schema.json)
at `https://rekor.sigstore.dev/api/v1/log/entries`. The request includes the full signed statement
inside the DSSE envelope and one PEM leaf, not artifact bytes. The canonical body in the existing
npm `sigstore@4.0.0` bundle contains envelope and payload hashes, a signature, and the verifier
certificate rather than the raw statement. This is not a confidentiality promise: the service
receives the whole statement. No fallback to an `intoto` or v2 entry is authorized.

The assembled v0.3 bundle must match the exact submitted envelope and leaf, including the
certificate in the canonicalized log body, and contain one DSSE proof with a signed checkpoint. The
pinned verifier then authenticates the proof, entry, signature, and expected statement. The existing
public bundle passed this check.

The unwired transport makes one fixed POST, refuses redirects and non-201 responses, and bounds the
response before normalizing exactly one
[Rekor v1 receipt](https://github.com/sigstore/rekor/blob/main/openapi.yaml). Preserve the global
log index separately from the shard-local proof index. The receipt map key is an untrusted
reconciliation hint, not signed bundle metadata. A signed entry timestamp and checkpoint are both
required. An existing public receipt read by GET normalized into a bundle that passed the pinned
verifier. POST behavior was exercised only with mocks. Any failure after POST begins requires
reconciliation, not retry.

The batch adapter composes the certificate gate with that transport. It prepares all six envelopes
before any POST, then submits and verifies them in order. It reports only the package filename and
attempt outcome, stops on the first unverified response, and returns the six bundles and their
SHA-256 digests only after full success. This avoids a partial bundle handoff, but cannot undo
entries accepted by Rekor. The signing job downloads the current build artifact again via a
read-only GitHub token, verifies metadata and ZIP digest, and rederives the exact six subjects
before OIDC. It uses checksum-verified runtime tooling and a fresh key. It uploads the six verified
bundles and digest manifest only after full success. Independent readback and a pinned npm
provenance-reader compatibility check remain required before any staging decision.

Wayglass explicitly forwards `ctLogThreshold: 1` at the Sigstore `4.1.1` bundle boundary. The
lower-level certificate-only verifier still uses `ctlogThreshold: 1`. Before the correction the
bundle verifier relied on Sigstore's default of one SCT; the correction does not relax policy.

Authorize at most one submission per reviewed package. The review must disclose the workflow,
commit, run/attempt, package name and version, artifact and statement digests, certificate and
signature metadata, and whether the selected entry type stores the statement itself. Do not submit
tarball bytes, tokens, or private keys. Any error, timeout, duplicate, or unverified response stops
remaining submissions; earlier public log entries cannot be undone. Record the known outcome per
package and reconcile ambiguous writes before considering a new authorization. No automatic retry or
GitHub rerun.

Before releasing any bundle for owner review, independently verify its signature, certificate
claims, inclusion proof and exact statement. Require all six verified bundles and a digest manifest
for the handoff; a partial set is not stageable. Verify compatibility with the pinned npm provenance
reader locally. This is neither a staging nor publishing approval.

## Stop conditions

### Signer claim preflight

The intended job is a direct, GitHub-hosted job in the manual `initial-release-signing.yml` workflow
on `main`, in the same run and attempt as the build. Do not move signing into a reusable workflow
without reviewing the SAN and workflow-digest policy.
[GitHub's OIDC reference](https://docs.github.com/en/actions/reference/security/oidc) describes the
workflow and invocation claims, and
[Fulcio's claim mapping](https://github.com/sigstore/fulcio/blob/main/docs/oid-info.md) maps the
trigger commit to `.13`, the initiating workflow commit to `.19`, and the run and attempt to `.21`.
Both digests must match the reviewed workflow invocation commit, not the separately frozen package
source. Fulcio's [live issuer configuration](https://fulcio.sigstore.dev/api/v2/configuration)
advertises the GitHub issuer with the `sigstore` audience. It does not attest which extensions a
particular request will receive, and the existing public npm examples demonstrate that those
extensions must not be assumed.

The proposed next preflight is an **OIDC-only** probe, separately reviewed and authorized. It would
compare the GitHub-issued token's issuer, audience, repository and workflow identity, both commit
claims, and run/attempt with the independently derived values for the protected job. Retain only
pass/fail results by claim; never upload or print the token. A mismatch or missing claim fails
closed. Limit `id-token: write` to that job; give it no npm credential or npm trust and no code path
that contacts Fulcio, Rekor, or npm. The manual workflow has a separate `oidc-claims-only` input,
off by default. When selected, the protected `npm-release` job checks the direct GitHub HTTPS
response and the unsigned rebuild and handoff are skipped. The default run still does not request a
token. Do not dispatch the probe without explicit approval.

[Attempt 1](https://github.com/Actesis/Wayglass/actions/runs/43727050895) passed 15 of 16 token
assertions, including workflow identity, both commits, and the run and attempt. It failed closed on
`server_url`, which is not advertised in
[GitHub's OIDC discovery metadata](https://token.actions.githubusercontent.com/.well-known/openid-configuration).
The probe now requires `GITHUB_SERVER_URL=https://github.com` in the runner before requesting a
token. This correction does not change the certificate policy or authorize a second run.

[The second OIDC-only probe](https://github.com/Actesis/Wayglass/actions/runs/43728109425), GitHub
run attempt 1 at `ab7d092ece20d8688765af0e4c5f4ca9e90444d5`, passed all 15 claims after the runner
context check. Both unsigned jobs were skipped. This proves what the GitHub job received, not what
Fulcio will put into a certificate. Do not reuse the probe token or treat this run as a release
build.

### Fulcio certificate-only evidence

[The certificate-only probe](https://github.com/Actesis/Wayglass/actions/runs/43729683163) passed on
GitHub attempt 1 at `9a91b1f7b8a8c07115b6f96d37b7c49c94301073`. The job passed the OIDC policy,
requested one certificate, and passed ephemeral-key, chain, SCT and exact claim verification.
Rebuild, handoff, and the standalone OIDC job were skipped. No release artifact, Rekor entry, or npm
operation was part of the run. The result confirms claim availability for that invocation, not
approval or proof for a future signing run.

The separate `certificate-probe-commit` dispatch input defaults to empty. The protected job requires
the input to equal the exact `main` commit and rejects GitHub reruns. It verifies the official Linux
Node distribution archive against a reviewed SHA-256 before using its bundled npm libraries; it does
not run npm. Trust metadata is fetched via pinned Sigstore TUF in an empty temporary cache before
requesting the OIDC token.

The default-off mode is restricted to the protected `npm-release` environment on `main`, with
job-scoped OIDC permission. It must be mutually exclusive with the claims-only and unsigned build
modes. No certificate request is permitted until the exact workflow revision and one issuance
attempt are explicitly authorized.

1. Repeat the live OIDC checks for the new run and attempt before contacting Fulcio. Generate an
   ephemeral key in the job and use it only for
   [Fulcio's proof-of-possession challenge](https://github.com/sigstore/fulcio/blob/main/docs/how-certificate-issuing-works.md).
   Make one issuance request to public Fulcio, with no retry or redirect. Never log or persist the
   token or private key.
2. Check that the returned leaf matches the ephemeral public key, chains to an independently trusted
   Fulcio root, is currently valid, and has valid certificate-transparency evidence. Check the exact
   workflow SAN, GitHub issuer, both required commit extensions and the invocation URI for this run
   and attempt using the same DER expectations as the bundle verifier. Fail on a missing or
   mismatched claim. Retain only the run reference and pass/fail results.
3. Do not build, read, or sign release artifacts, construct DSSE provenance, submit to Rekor, or
   contact npm. A pass would qualify certificate claim availability only, not release provenance or
   npm compatibility. An ambiguous request outcome is not permission to retry.

**Public effect:**
[Fulcio's certificate-transparency log](https://github.com/sigstore/fulcio/blob/main/docs/ctlog.md)
can retain an immutable public record of the test certificate, including the GitHub workflow
identity and any commit or run metadata Fulcio embeds. This is distinct from an artifact entry in
Rekor. Approval must explicitly cover the certificate record; a later signing run, Rekor submission,
and npm execution remain separate decisions.

The pinned npm CLI's automatic generator emits only one resolved dependency; it cannot replace the
reviewed two-material statement or serve as a certificate-only test.

The offline policy preparation derives certificate expectations from the protected runner context,
independently of a returned token or certificate. The certificate-only check can reuse the bundle
verifier's SAN, issuer, DER extension, and CT threshold settings without inheriting its artifact-log
requirement. The unwired offline adapter compares the DER leaf with the expected public key and uses
the pinned npm distribution's `@sigstore/core` 3.2.1 and `@sigstore/verify` 3.1.1 to check the chain
at the supplied clock time, an embedded SCT, and the exact certificate policy. The wrapper must
independently authenticate the npm distribution and obtain the trust root through Sigstore TUF;
never take CA or CT keys from the issuance response. The live wrapper must use the runner clock, not
a timestamp supplied by the certificate.

An offline check used the public npm `sigstore@4.0.0` fixture's leaf at a time within its original
validity window, with public TUF trust material and the fixture's published public key. It rejected
a different key, an expired leaf, a different run attempt, and trust material lacking either a CA or
a CT log key. This does not prove possession of the fixture's private key or authorize Wayglass
issuance.

### Existing verification evidence

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

The unwired statement policy prepares one unsigned SLSA statement per tarball, with the workflow
commit and frozen source as separate materials. It compares an independently verified payload and
normalized certificate claims against the expected issuer, workflow identity, commit, and run
attempt. It does not verify a signature or log inclusion itself. The pinned signer, cryptographic
verifier, certificate claim extraction, and npm compatibility for this statement remain to be
demonstrated before enabling the signing job.

The verifier adapter loads only Sigstore `4.1.1` from an explicitly supplied npm installation.
Sigstore supplies DSSE, trust-root, certificate and transparency-log validation that Node's crypto
primitives alone do not provide. No workspace dependency is added; the eventual wrapper must
independently verify the npm distribution before loading its bundled verifier. The adapter requires
workflow SAN, issuer, commit digests, and invocation URI using Sigstore policy, then compares the
authenticated payload. Automated unit tests simulate the cryptographic call; workflow wiring remains
open.

A read-only compatibility check used the
[published `sigstore@4.1.1` SLSA bundle](https://registry.npmjs.org/-/npm/v1/attestations/sigstore@4.1.1)
from `sigstore/sigstore-js` run `26312671957`, attempt `1`. The installed npm-bundled Sigstore
`4.1.1` verified the signature with the expected issuer and workflow SAN, a transparency-log
threshold of one, and a certificate-transparency threshold of one. The stricter Wayglass options
rejected the bundle. Its Fulcio certificate has extension `.10` (build signer digest), but not
`.13`, `.19`, or `.21` (the required source digest, build configuration digest, and run invocation
URI). A separate probe rejected `.10` as plain text and accepted it with a DER UTF8String wrapper.
The adapter now uses that
[documented Fulcio encoding](https://github.com/sigstore/fulcio/blob/main/docs/oid-info.md) for all
three required claims.

The corrected adapter accepted the existing
[npm `sigstore@4.0.0` SLSA bundle](https://registry.npmjs.org/-/npm/v1/attestations/sigstore@4.0.0)
from `sigstore/sigstore-js` run `16609504990`, attempt `1`, with the corresponding public workflow,
commit, run URI and expected statement. It rejected the same bundle when the expected attempt,
commit, or subject was changed. This demonstrates compatibility with a genuine npm bundle whose
certificate contains the required claims. It does not qualify the installed npm distribution or show
that the intended Wayglass signer will receive the same claims. Keep the full policy and fail closed
if any claim is absent. No signing, log submission, or npm writes were needed.

The original compressed bytes may not reproduce on a newer runner image. If so, bring the evidence
back for an explicit decision: separately requalify new artifacts or reconsider the provenance
requirement. No silent fallback is authorized. Refresh the expired advisory only under separate
approval, close to release. Workflow implementation, signing and public transparency-log submission,
and npm execution are distinct approval boundaries.
