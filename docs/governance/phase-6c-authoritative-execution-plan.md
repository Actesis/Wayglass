# Phase 6C-E5 authoritative execution and disposition plan

**Status:** Proposed for project-owner acceptance on September 7, 2026, after acceptance and merge
of the Phase 6C-E4 retained orchestrator. This plan closes the dependency-audit/advisory ordering
gap and decomposes E5 into separately reviewable preparation, retrieval, execution, and disposition
steps. It does not retrieve advisory data, run the authoritative candidate, contact npm or another
registry, use credentials, publish packages, change package privacy, create a tag or release,
deploy, or begin external-application work.

## Why E5 needs a preparation boundary

The accepted advisory schema binds a snapshot to the SHA-256 of the canonical dependency audit. That
audit includes hashes of the actual installed production manifests and legal files, so it does not
exist until the frozen candidate has been assembled and inspected. The retained orchestrator
correctly requires the approved snapshot before its authoritative run and cannot fetch one itself.

E5 therefore cannot begin with a generic `pnpm audit` invocation or a hand-authored snapshot. It
must first reproduce the exact audit material offline, then submit only that audited graph through a
separate, explicitly authorized read-only query. The authoritative run independently rebuilds the
graph and rejects the snapshot if any audit byte changed between preparation and execution.

## Fixed authority boundaries

E5 is divided into four gates. Authority does not flow implicitly from one gate to the next.

### 6C-E5A — capture-tool implementation

Implement and review a separate advisory-capture command. Tests use an injected response adapter and
must not make a network request. The command:

1. authenticates the frozen source and clean tooling revision;
2. performs one audited candidate build offline to obtain the canonical dependency section;
3. constructs an exact request containing only the sorted seven-node public production graph;
4. requires a new absolute output file under the operating-system temporary root;
5. rejects recognized npm, GitHub, Cloudflare, and release credentials;
6. performs at most one request through an injected or explicitly enabled transport;
7. hashes the exact response bytes before parsing;
8. validates and losslessly normalizes every returned advisory that applies to the submitted graph;
9. writes one canonical E3 advisory snapshot transactionally with a 24-hour validity window,
   retaining any provider media-type or undeclared-compression warning; and
10. removes its candidate work, raw response, staging file, and output on any failure.

The implementation PR exercises malformed responses, unknown packages, duplicate or reordered
findings, changed dependency hashes, unavailable transport, partial writes, cleanup, and exact
single-call behavior. Merging it does not authorize its live transport.

### 6C-E5B — dated advisory capture

After explicit project-owner authority, invoke the reviewed command once against the public npm bulk
advisory endpoint. The request contains only the names and exact versions of the seven public
production dependencies; it excludes Wayglass package names, repository identity, source paths,
environment variables, usernames, and credentials.

Current pnpm documentation states that pnpm 11 and later query
[`/-/npm/v1/security/advisories/bulk`](https://pnpm.io/cli/audit) and that `--json` and `--prod`
produce machine-readable production-only results. npm documents the bulk request as a map of package
names to versions, but also documents a CLI fallback to the broader quick-audit endpoint when bulk
lookup fails. The Wayglass capture adapter therefore calls the bulk endpoint directly and fails
closed on any non-success or malformed response; it does not invoke the CLI fallback.

HTTP `POST` is the endpoint's query mechanism, not publication authority, but it still discloses the
seven public dependency identities to npm and therefore remains a separately approved network
action. It sends no authorization header, cookie, npm token, or write-capable credential. Redirects
are rejected rather than followed to an unreviewed host.

The exact canonical snapshot, its SHA-256, capture time, validity deadline, dependency-audit hash,
raw-response SHA-256, finding count, and normalized findings are presented to the project owner. Raw
provider bytes remain temporary and are deleted after their hash is established. A failed,
unavailable, incomplete, stale, or ambiguous response produces no approved snapshot and is never
silently retried.

### 6C-E5C — one authoritative retained run

The advisory snapshot must still be inside its 24-hour validity window. After separate explicit
project-owner authority, run exactly once:

```sh
pnpm release-candidate:integrated -- --source ce400e89930a047c6af1c6992c64cfe422a1eeee --output <new-absolute-temporary-directory> --advisory-snapshot <approved-absolute-file>
```

No source, tooling, dependency, advisory, or environment correction may be made during that attempt.
A failure is preserved as an E5 attempt outcome and returns to owner review; it is not replaced by
an automatic retry. Any correction requires a reviewed change and new authority for a new attempt. A
changed dependency audit invalidates the snapshot and returns to E5B.

On success, invoke the independent verifier against the finished bundle. Record the integrated
evidence SHA-256, bundle-inventory SHA-256, six tarball hashes, package- and dependency-audit
hashes, advisory hash and validity, exact run and matrix counts, warnings, limitations, and verifier
result. The retained output is not temporary residue: it remains untouched through owner
disposition. No copy to GitHub, npm, Cloudflare, or another durable artifact service is implied.

### 6C-E5D — project-owner disposition

Commit a disposition proposal that references the exact hashes rather than embedding tarballs or
machine paths. It records every E5 capture and run attempt in order and offers three outcomes:

- **accept candidate:** accept the exact bundle and complete Phase 6C;
- **narrow or refreeze:** change the proposed release units or source through a new reviewed Phase
  6B freeze, invalidating this bundle; or
- **no candidate:** retain the reason and close Phase 6C without an accepted candidate.

Any advisory finding requires explicit owner disposition; a technically successful capture does not
turn a finding into a pass. High or critical findings default to refreeze or no-candidate unless the
owner accepts a documented non-applicability rationale. Lower-severity findings still require a
recorded rationale, remediation decision, or no-candidate outcome. Endpoint unavailability or an
invalid snapshot blocks the dependency-security claim rather than becoming a clean result.

Only the project owner's acceptance of the exact disposition completes Phase 6C. After disposition,
the local bundle is removed only if the outcome is no-candidate or after a separately approved
durable private retention location has been verified. E5 does not choose or write that external
location.

## Evidence and retry ledger

Repository records must distinguish capture attempts from authoritative candidate attempts. Each
entry has a contiguous sequence, whole-second UTC time, outcome, normalized code, and safe summary.
Provider responses, command logs, absolute paths, usernames, credentials, and arbitrary error text
are excluded. There is no automatic retry in either ledger.

A fresh owner instruction is required after any live failure. Repeating an unchanged command is
still a new external attempt and receives a new ledger entry; it cannot overwrite or relabel the
earlier result. Development tests and offline E5A fixtures are not authoritative attempts.

The [E5B capture-attempt record](./phase-6c-e5b-capture-attempts.md) preserves the first two
pre-transport failures and the reviewed launcher correction. Neither failure contacted npm or
created a snapshot, and neither authorizes a retry.

## Review gates

E5A is acceptable only when its pure normalization and effect adapter prove exact request scope,
single-call behavior, transactional output, no credentials, no redirects or fallback, and cleanup.
E5B is acceptable only when the owner approves the dated canonical snapshot and every finding. E5C
is acceptable only when one complete run and independent verification succeed without altered
inputs. E5D is complete only when the owner selects one disposition against exact hashes.

## Acceptance effect

Accepting this plan authorizes Phase 6C-E5A capture-tool implementation and tests only. It does not
authorize a live advisory request, authoritative candidate run, retry, candidate acceptance,
artifact upload, registry contact beyond a later approved advisory query, publication, package
privacy or version changes, repository visibility changes, tags, releases, documentation deployment,
Phase 6D, Phase 6E, or the separate SpaceTraders client.
