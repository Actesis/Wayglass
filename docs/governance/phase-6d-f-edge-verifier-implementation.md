# Phase 6D-F read-only edge verifier implementation

**Status:** Implementation acceptance candidate prepared on October 30, 2026, after project-owner
acceptance and merge of the Phase 6D-F execution contract in PR #274.

## Implemented boundary

The private `tooling/cloudflare-delivery` package now contains a dependency-free, read-only verifier
for one exact immutable Cloudflare Version URL. It does not invoke Wrangler, inspect an
authenticated account, create or alter a Worker, upload an artifact, deploy a version, attach a
route or hostname, or perform rollback. Tests use an in-memory edge double; this implementation task
contacted no Cloudflare endpoint.

The operator supplies all four values explicitly:

```text
pnpm site:edge:check -- \
  --input /absolute/verified/site \
  --url https://<version-prefix>-wayglass-docs.<subdomain>.workers.dev/ \
  --version-id <exact-cloudflare-version-uuid> \
  --output /absolute/os-temporary-directory/evidence.json
```

The tool first independently verifies the local artifact through the accepted response oracle. It
then binds the URL's eight-character hexadecimal version prefix to the supplied lowercase UUID and
the frozen `wayglass-docs` Worker name. HTTP, credentials in the URL, ports, paths, queries,
fragments, the stable `phase-6d-f` alias, the active `workers.dev` root, and another Worker name are
rejected before a request.

Every request is manual-redirect, cache-bypassing, and credential-free. The request header set is
closed and contains no authorization, cookie, referrer, account, or environment value.

## Fail-closed comparison

For GET and HEAD, the verifier compares the same fifteen-route matrix used by the accepted local
Wrangler rehearsal. Status, response bytes, canonical `Location`, and every repository-owned
terminal content, cache, security, framing, and indexing header must match the independent oracle
exactly. Every terminal Version URL response must contain both `noindex` and `nofollow` tokens.

The two retained emulator differences become explicit edge observations:

- repository-owned contract header names found on canonical redirects are recorded without treating
  their presence or absence as an invented contract; and
- POST `/` must return an empty `405`, while a syntactically valid `Allow` value or its absence is
  recorded.

Cloudflare-generated transport and cache headers are deliberately neither copied into the contract
nor retained in evidence. A status, byte, location, terminal-header, indexing, method, or artifact
identity mismatch stops the run before evidence publication.

## Sanitized evidence

Successful verification writes a new JSON file transactionally, with mode `0600`, beneath the real
OS temporary root. The destination must not already exist. The allowlisted schema contains only:

- capture timestamp, public immutable Version URL, exact Worker name, and version ID;
- source, tooling, lockfile, bundle, manifest, surface-content, and build-environment identities
  from the independently verified local manifest;
- route and method comparison counts plus observed redirect contract-header names; and
- rejected-POST status and `Allow` observation.

It contains no local artifact or evidence path, raw response or command log, arbitrary header set,
credential, authorization header, account ID, email address, or environment dump. Failed runs leave
no final evidence file.

## Verification completed in this slice

Focused unit coverage proves:

- all thirty GET/HEAD comparisons plus the rejected POST;
- exact version-ID and immutable-host binding;
- absence of authorization and cookie request headers;
- deterministic, allowlisted evidence without local paths;
- observation of the two known edge differences;
- fail-closed response mismatch behavior with no partial evidence;
- temporary-root-only, new-file evidence output; and
- strict CLI argument parsing.

The focused typecheck and test suite, repository formatting and linting, and the full repository
gate must pass before this candidate is proposed for acceptance.

## Remaining Phase 6D-F work

This verifier does not replace the accepted hydrated Chromium and accessibility matrix. After this
candidate is accepted, the next implementation slice may add a read-only remote browser runner and
its sanitized browser evidence projection. Neither implementation slice authorizes the separate
Cloudflare execution: OAuth use, resource creation, uploads, baseline or candidate deployment,
rollback, restoration, and retained public state remain blocked on the exact authorization in the
accepted execution contract.
