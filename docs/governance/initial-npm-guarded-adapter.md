# Initial staging: guarded adapter core and approval format

Status: second implementation slice for review. This adds approval validation, owned archive
materialization, gate rechecks, and journal/checkpoint sequencing around the
[transport-free protocol](./initial-npm-staging-protocol.md). It does **not** implement live
GitHub/npm observation, remote journal retention, npm subprocess transport, credential handling, or
workflow wiring. No CLI entry point is added. No registry operation or credential creation is
authorized by merging this change.

## Separate execution record

Private `staging-approval.ts` accepts only its exact, flat execution schema. It rejects the existing
planning JSON, missing or extra keys, unknown purpose, wrong owner, unconfirmed tag, and scope
expansion. No approved execution record is created in this change; tests use explicitly fictional
authority and observations. The committed initial-release proposal keeps its null approver/commit,
pending artifact acceptance, and all execution authorizations false.

The proposed future record binds:

- schema version `1`, purpose `initial-six-package-stage-upload`, owner `Actesis`, and a unique
  canonical UUID approval ID;
- explicit UTC approval/expiry times, an exact final release commit, GitHub run ID, and positive
  integer attempt number;
- the retained review ZIP SHA-256 and the separately approved advisory SHA-256;
- explicit `next` confirmation and authority for exactly the six protocol uploads, npm-generated
  placeholders, and immutable public transparency-log writes; and
- `directPublicationAuthorized: false` and `humanPromotionAuthorized: false`.

The fixed ZIP and protocol together pin all six names, versions, sizes, and hashes. No arbitrary
command, package set, registry, scope, path, or dist-tag is admitted. Release tags and GitHub
release creation remain outside this adapter. Renewed authority or a different attempt requires a
separately reviewed record and state inspection, not editing a journal or reusing a prior approval.

New conservative guard defaults proposed for this implementation review are: a maximum 24-hour
approval window, no future-dated approval, observations no older than 60 seconds, and approval
expiry no later than advisory expiry. These are technical freshness limits, not permission to extend
any existing approval or advisory. They are rechecked before every upload and again after checkpoint
latency. An expiry stops the run; it never triggers a capture or automatic retry.

**Record validation is not owner authentication.** Writing `owner: Actesis` or copying `true` flags
does not prove approval. The future live wrapper must authenticate the exact owner approval and its
record digest against the actual invocation and independently read the native environment approval.
The final execution commit is chosen only after implementation review/merge; it is not silently
advanced to this branch or inferred from a fixture. No workflow accepts this record yet.

## Adapter and trusted-port boundary

`runGuardedStagingAdapter` rejects known release credential variables in its declared environment,
snapshots and validates every input archive, validates the execution record, and creates only a new
canonical OS-temporary output directory outside the repository. Existing output is never resumed or
overwritten. Archives and journal are private to the owned directory. It does not receive, store,
forward, or create an npm token. This is not proof that arbitrary caller-supplied closures are safe;
the future wrapper must supply only reviewed ports and explicit child-environment allowlists.

Three required ports are injected; none has a live implementation in this change:

- `observe`: independently authenticate current public `Actesis/Wayglass`, protected `main`,
  required quality result, GitHub-hosted manual invocation, exact workflow, `npm-release`, owner
  environment approval, final commit/run/attempt, account/recovery readiness, accepted current
  advisory digest/disposition, and permission to create the current package. It must inspect both
  published and staged state and return no existing versions for this initial bootstrap. An
  authentication error or ambiguous 404 must never become “absent.” The adapter validates the
  observation's binding and freshness; typed booleans are not a substitute for those live checks.
- `checkpoint`: durably retain the exact journal outside the ephemeral runner, independently read it
  back, and verify the supplied SHA-256 before resolving. A fake/no-op callback does not provide
  durability. Tests simulate retention to prove ordering, not a real remote store. A later reviewed
  retention implementation is required before any live upload. It must enforce create-only
  approval-ID/run binding and reject reuse; UUID syntax validation alone is not replay protection.
- `upload`: the future restricted npm transport, receiving only a fixed protocol intent and the
  owned root. It must verify pinned npm before injecting any credential, use an isolated
  configuration and environment, run only the approved tarball stage command without shell
  interpolation, bound output/time, disable retries, and never build/install/test under the token.
  It cannot infer execution authority merely because this callback was invoked.

Current call order is validate scope and bytes; collect and validate fresh gates; rehash the owned
archive; flush and checkpoint the intent; recheck freshness and bytes; invoke upload once; validate
the receipt; flush and checkpoint acceptance; then proceed to the next package. The protocol's
package order and arguments remain fixed. The current package must still be absent; an existing
placeholder or stage stops this initial path and requires explicit recovery review.

Owned directory and archive symlinks are rejected before transport. The journal is opened
exclusively without following a final symlink, and its named device/inode must continue to match the
open descriptor. Changes during checkpoint latency stop the run. A future live runner must prevent
concurrent untrusted processes from mutating owned paths; these checks are not a sandbox against a
hostile same-user process racing npm's later file open.

## Flushed journal, durable checkpoint, and failure

The local append-only `stage-journal.jsonl` uses numbered JSON lines, exclusive creation,
partial-write handling, and `fsync` after every event. It binds the canonical approval digest/ID and
exact execution commit/run. Each intent binds the exact package identity and current advisory
observation. Accepted CLI receipts retain stage IDs and archive identities; raw stdout, stderr,
errors, credentials, and unvalidated approval fields are never journaled. The local file alone is
not permanent or power-loss-proof remote retention; the required checkpoint port supplies that
separate boundary.

No upload callback is invoked until its intent checkpoint succeeds. A receipt checkpoint failure
prevents the next upload. Failure attempts one safe stopped-state checkpoint, never repeats an
upload, never deletes earlier journal/archive evidence, and returns a sanitized error. Journal
replacement, retention failure, malformed receipt, transport failure, expired gates, corrupt bytes,
or collisions all stop. If even stopped-state retention fails, the earlier checkpoint remains the
last reliable evidence; no successful cleanup is claimed. A torn last line or runner interruption
requires manual inspection of the last durable intent, not automated resume.

The journal distinguishes whether the upload port was invoked from a pre-transport stop. Protocol
uncertainty is conservative; a failed response cannot prove no server mutation. A reported stage ID
is still a CLI receipt, not verified registry state or signed provenance. Every completed simulation
keeps `readyToPromote: false`, `registryReadbackVerified: false`, and `provenanceVerified: false`.
Token revocation remains `owner-action-required` if a real execution ever held a token; neither the
core nor these tests claim to have revoked one.

## Remaining live work

Hosted staging is [deferred for the first release](./initial-npm-journal-provider-proposal.md). The
following requirements still apply if automation is resumed.

The [create-only journal checkpoint port](./initial-npm-journal-retention.md) implements snapshot
binding, replay claims, and exact readback. A reviewed durable provider is still required.

The [read-only npm collision probe](./initial-npm-registry-probe.md) gathers visibility evidence for
review. It does not infer namespace creation permission and is not wired into observation.

The [read-only GitHub verifier](./initial-npm-github-gates.md) implements the GitHub portion of
observation for review. It is not wired and does not supply registry or advisory decisions.

The [restricted npm transport](./initial-npm-restricted-transport.md) supplies the isolated
subprocess implementation for review, but is not wired to this core. It expects provenance from a
separate verified signing step rather than inheriting an OIDC credential in the upload child.

Implement and review the three live ports and credential-isolated hosted wrapper, including exact
owner-record admission and native approvals, clean retained-evidence preflight, pinned npm
installation/identity, authenticated registry collision/ownership checks, remote checkpoint
retention, bounded sanitized subprocess handling, and prompt token revocation arrangements. Review
the actual provenance subject, signature/identity, upload invocation, stage tag, placeholder side
effects, and downloaded staged tarball bytes before human promotion. Promotion itself remains an
owner-operated interactive 2FA step after review of the whole set.

No live run is dispatched here. No npm commands, credentials, placeholders, stages, signatures,
transparency-log entries, release tags, or publications are created. The hosted workflow remains
verification-only. The historical November 8 advisory expiry is unchanged and no fresh capture is
authorized by this implementation. The [initial release proposal](./initial-npm-release-proposal.md)
and its final-owner gates still govern execution.
