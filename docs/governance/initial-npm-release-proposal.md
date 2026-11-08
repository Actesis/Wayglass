# Initial npm 0.1.0 release proposal

Status: draft for owner review. **No registry action or publication is authorized.** Merging this
planning change does not accept artifacts, create placeholders/tokens/tags, stage packages, approve
stages, or publish a GitHub release. No publisher is implemented here. The accompanying
[JSON review record](./initial-npm-release-proposal.json) is non-executable planning data, not an
input accepted by any publishing command.

## Proposed release set and owner choices

Adopt the exact six Linux archives in the
[independently verified hosted result](./hosted-publication-rehearsal-result.md), not the earlier
private or macOS tarballs. The JSON repeats every exact name, version, byte count, and SHA-256 in
dependency order: core, tokens, themes, elements, icons, React. All are `0.1.0`, public on npm's
official registry, under Apache-2.0. Foundation remains one synchronized release unit; icons and
React retain their independent versioning policy. The frozen source and hosted assembly/consumer
tooling identities remain distinct. No source refreeze is proposed.

The owner selected **staged bootstrap for the plan** and confirmed recovery readiness on November
7, 2026. No recovery material was requested or retained. The short answer “1” to the tag question is
provisionally interpreted as **`next`**, and must be confirmed in exact final release approval. No
`latest` movement is inferred. `0.1.0` is pre-1.0 feedback scope, not a promise of 1.0 maturity.

Review the [draft release notes](./initial-0.1.0-release-notes.md) and
[support policy](../../SUPPORT.md). Neither activates released support. No external consumer
application is implemented in this work; the intended SpaceTraders client remains a separate
project.

## Durable bytes before credentials

Implemented for review under the merged plan: preserve the **existing** 772966-byte hosted review
ZIP at `docs/governance/evidence/initial-npm-public-0.1.0.zip`, without unpack/repack or rebuilding.
Its SHA-256 must remain `4e4420000766bd883b87f3e38c0cfef637988475922dd8d0d18c8e4fe1e98dc9`. This
adds approximately 0.77 MB once to public Git history; it is not a scalable policy for every future
release. The ZIP already consists of public review artifacts, with no credentials, stores, or
browser binaries. The exact ZIP is now copied byte-for-byte into the retention/preflight review
change; source and destination hashes match. This becomes protected-main retention after that change
merges, not final artifact acceptance. Merge and verified retention are required before credential
setup; the original seven-day artifact expires `2026-11-14T20:46:51Z`. Do not replace an
expired/missing archive with a rebuild under old approval.

A future credential-free preflight must verify the retained ZIP digest, exact assembly/tested
archive equality, frozen manifests, complete consumer coverage and 48 graph-file hashes, and all
approved source/tooling identities. It must require protected main, the approved release commit, and
current checks. Choose that release commit only after the retention and publisher changes have been
reviewed/merged; it is currently null. All three protected annotated release tags must point to that
one approved commit. Neither historical source nor build SHA automatically becomes a tag target. No
tag is created here, and protected tags must never be moved to correct a mistake.

## Bootstrap correction and narrow placeholder exception

The August governance assumption that staging required an existing package is obsolete. npm now
documents staging for absent packages and automatic publication of a public `0.0.0-stage`
placeholder, while the submitted payload remains non-public until human 2FA approval.
[Current staging guidance](https://docs.npmjs.com/staged-publishing/)

Proposed exception: permit **only npm-generated `0.0.0-stage` placeholders** under the six exact
names above, caused solely by explicitly approved staging of their reviewed `0.1.0` archives. This
is not permission to reserve names, manually publish empty packages, use a test scope, or create any
seventh package. Plan selection is not permission to perform these public mutations. Final execution
approval must explicitly cover placeholder creation and the chosen tag. Record the placeholder's
actual versions/tags/content as a registry side effect, not a usable Wayglass release; do not assume
it is invisible or automatically cleaned up.

Use a short-expiry **stage-only** granular token for initial bootstrap, with 2FA bypass disabled,
only the `@wayglass` package/scope permissions needed to create these six packages, and no
organization-settings permissions. Organization-management access alone is not package access.
Choose the shortest supported expiry (the documented minimum is one day), and revoke the token
immediately once the intended staging operations finish, including failure cleanup. Do not select
all-account package access. The owner creates/inserts it directly into the protected environment;
never pass it in chat, command arguments, logs, artifact files, or source.
[Token configuration](https://docs.npmjs.com/creating-and-viewing-access-tokens/)

Stage-only is **not a general-purpose security boundary**: such tokens retain other writes such as
deprecation and dist-tag changes. The future driver must allow only the six approved stage uploads,
with no general shell or arbitrary registry action under the credential. The bootstrap token is not
a permanent automation credential. Direct token publishing is also scheduled for deprecation; do not
automatically fall back to the historical direct-publish path.
[Token capabilities](https://docs.npmjs.com/about-access-tokens/)

## Publisher architecture to implement next

Proposed new workflow filename: `npm-initial-release.yml`, manual and main-only on a GitHub-hosted
runner, protected by `npm-release`. Existing rehearsal workflows remain publication-disabled. This
is a contract for separately reviewed registry-writing implementation. The separately reviewed
[retention/preflight implementation](./initial-npm-retention-preflight.md) supplies only a
credential-free verification workflow at that filename. `workflowImplemented: false` continues to
mean that the registry-writing publisher does not exist; preflight readiness is a separate flag.

The first [transport-free staging protocol](./initial-npm-staging-protocol.md) implementation slice
validates fixed upload intents and simulated receipts without subprocess/network access. It is not a
live publisher or an execution path for this planning record; credential isolation, final approval,
live state checks, provenance verification, and workflow wiring remain separate reviewed work.

1. Run credential-free verification of the retained exact artifacts and approved release record. No
   credentials may be present for installs, builds, tests, or candidate tools. Do not rebuild after
   approval or reproject manifests during publication.
2. Install/verify publisher-only npm `11.21.2` before injecting credentials. This exact official
   release was verified at implementation review; it includes the newer stage-only-token and
   provenance-file handling support. The assembler remains on recorded npm `11.19.0`; no global or
   repository tool upgrade occurs here, and approved tarball bytes do not change.
   [Official CLI release](https://github.com/npm/cli/releases/tag/v11.21.2)
3. Require a fresh owner GitHub environment approval. Download only digest-pinned approved inputs
   into the credential-bearing job, rehash them with minimal built-in verification, and grant no
   repository write permission. Setup credentials only for the stage-upload step. No pnpm install,
   build, test suite, package lifecycle hook, or arbitrary repository script runs under the token.
4. Stage each **precomputed `.tgz` file**, never a workspace directory, with explicit public access,
   fixed npm registry, selected `next` tag, disabled scripts, and reviewed provenance behavior.
   Record returned stage IDs against approved archive hashes. The staged tag is immutable; choose it
   before staging. A tag correction requires explicit reject/re-stage review, not a quiet edit.
   [Stage command contract](https://docs.npmjs.com/cli/v11/commands/npm-stage/)
5. Revoke the bootstrap token. The maintainer uses a separate interactive session to view/download
   every stage and compare exact hashes, metadata, tag, and attestations. Review the whole set
   before making any real version public. The owner, not automation or OIDC, promotes correct stages
   with 2FA, in dependency order. Never request OTPs or recovery codes in chat.
6. After all packages are live, verify public registry bytes and metadata, provenance, dependency
   availability, signatures where applicable, and independent clean registry-installed consumer
   behavior before announcing. The existing local-tarball matrix is not registry-install proof.

Native npm trust configuration still requires an existing package; staging does not establish OIDC
trust by itself. Once package settings exist, configure and read back one exact stage-only trusted
publisher per package: `Actesis/Wayglass`, reviewed workflow filename, `npm-release`. No direct
`npm publish` or dist-tag authority is requested for later automation. Require 2FA and disallow
traditional publish tokens when transition prerequisites are verified. npm's guide and CLI reference
disagree on publisher cardinality; this plan needs one and relies on readback, not an assumed limit.
Newly configured trust has a short first-use window, so configure it only when the approved
operation is ready; do not manufacture a release to validate it.
[Trust prerequisites](https://docs.npmjs.com/cli/v11/commands/npm-trust/),
[OIDC policy](https://docs.npmjs.com/trusted-publishers/)

## Provenance is an explicit validation gate

The rehearsal receipt is not signed npm provenance. A later upload workflow's npm provenance
identifies **that promotion workflow's invocation and commit**, not retroactively the historical
build run. Retain the chain to frozen source and original build evidence; never spoof GitHub
environment variables to impersonate the earlier invocation. The reviewed publisher must confirm the
actual attestation subject digest matches each approved tarball and accurately discloses the
promotion/build relationship. Stop before human promotion if provenance is missing, mismatched, or
misleading; do not disable it as a convenience fallback. Review the transparency-log notice before
opting into its immutable public records.
[Provenance prerequisites and limitations](https://docs.npmjs.com/generating-provenance-statements/)

## Partial failure and stop rules

- A failed upload does not authorize a blind retry. Read stage/registry state first; retain IDs,
  version/tag/integrity, and the exact last completed operation. Reject unapproved collisions.
- If only some stages exist, approve none. Revoke the token; resume only the missing exact stages
  with separate owner authority, or explicitly reject incorrect stages using human 2FA. Registry
  rules decide whether a version can be restaged; never assume a rejected version is reusable.
- If public promotion stops partway, announce nothing. Complete only the remaining exact accepted
  archives under renewed owner direction; otherwise follow the foundation-family corrective-version
  and deprecation policy. Do not unpublish, move tags, or substitute bytes automatically.
- Placeholder side effects may remain after failure; report them. No automatic deletion,
  deprecation, or dist-tag cleanup is authorized. A stage-only token still requires incident review
  if exposed, and all publication pauses on a security incident.

## Final owner execution approval still required

Require exact artifact acceptance and durable retained bytes; the final release commit and tag
targets; confirmed `next`; this narrow placeholder exception; approved release notes/support and
partial-failure policy; fresh npm ownership/2FA and recovery readiness; reviewed/pinned publisher
code and least-privilege credential setup; stage/registry absence/collision checks; truthful
provenance; and a current approved advisory snapshot. Current snapshot validity ends
`2026-11-08T16:04:23Z` (November 8 at 10:04:23 AM CST). Recheck immediately before authorized
execution; a new capture requires separate authorization and review. No capture or expiry extension
is made here. A planning PR merge, checked checkbox, or successful rehearsal cannot substitute for
this final approval or the owner's later npm 2FA promotion.
