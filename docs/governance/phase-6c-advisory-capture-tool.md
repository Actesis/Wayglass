# Phase 6C-E5A advisory capture tool

**Status:** Proposed for project-owner acceptance on September 7, 2026. This record covers the
capture implementation and offline injected-response validation authorized by the accepted Phase
6C-E5 plan. It does not invoke the live command, retrieve advisory data, approve a snapshot, run the
authoritative candidate, contact npm during validation, use credentials, publish packages, change
package privacy, create a tag or release, upload an artifact, deploy, or begin external-application
work.

## Explicit command and isolation

The separately networked command is:

```sh
pnpm release-candidate:capture-advisory -- --source <accepted-full-sha> --output <absolute-new-temporary-file>
```

It is not called by `pnpm check`, any build or test script, the candidate assembler, or the retained
orchestrator. Importing package or release-candidate core modules cannot invoke it. Its live
transport exists only behind this explicit CLI command, and merging the implementation does not
authorize invocation.

The command accepts only the frozen source and one new absolute output file under the
operating-system temporary root. Before assembly, the shared environment guard rejects recognized
npm, GitHub, Cloudflare, registry, publish, and release credentials. The audited candidate build
then authenticates clean tooling and the frozen commit, tree, and lockfile; installs and packs only
from the local offline pnpm store with lifecycle scripts disabled; and cleans its detached
worktrees.

## Exact request

The pure request builder validates the complete E2 dependency audit before reading its production
graph. The current accepted graph must contain exactly seven sorted, unique external nodes and no
Wayglass release unit. It produces canonical JSON whose only properties are those seven public
package names and whose only values are one-element arrays containing their exact installed
versions.

The effect adapter sends those bytes once to the fixed HTTPS origin and path
`registry.npmjs.org/-/npm/v1/security/advisories/bulk`. The request method is `POST` because that is
the registry's query protocol. Headers are limited to JSON acceptance, JSON content type, and the
exact byte length, in addition to protocol-required host metadata added by Node. No authorization
header, cookie, token, configurable registry, repository identity, Wayglass package name, path,
username, or environment value is supplied.

Node's HTTPS client does not follow redirects. Any status other than 200, timeout, connection
failure, empty body, unsupported declared content encoding, or raw or decoded body over one MiB
fails closed. There is one request construction and no retry, redirect handling, quick-audit
fallback, alternate registry, or package-metadata lookup.

## Response normalization

The exact raw response bytes are SHA-256 hashed before decompression, UTF-8 decoding, or JSON
parsing. Raw bytes remain in memory only and are never written to disk or copied into evidence. A
declared gzip response is decompressed within the same one-MiB decoded limit. Gzip magic bytes are
also recognized when the provider omits its content-encoding header; that omission is retained as a
dependency-security warning. An absent or non-JSON media type is likewise retained as a warning only
when the decoded bytes still pass strict UTF-8, JSON, and response-schema validation. HTML,
malformed JSON, invalid gzip, unsupported encodings, and oversized decoded bodies still fail closed.

The pure normalizer requires a JSON object keyed only by submitted package names. Every value must
be an array; every advisory must have a valid provider identifier, accepted severity, vulnerable
range, and matching package name when one is present.

Every returned advisory becomes one E3 finding bound to the submitted exact package version. A
provider `patched_versions` string is retained; an absent or null field becomes an explicit `null`
rather than an invented remediation. Provider order is not trusted: normalized findings are sorted
by package, version, and advisory identifier. Unknown package keys, mismatched names, malformed
fields, invalid UTF-8 or JSON, and duplicate findings fail closed. Provider-only title, URL, CWE,
and CVSS fields remain authenticated by the raw-response hash but do not broaden the accepted E3
schema.

The final snapshot binds the frozen lockfile hash, canonical dependency-audit hash, production-only
scope, exact raw-response hash, capture time, and findings. Its validity deadline is exactly 24
hours after its whole-second UTC capture time. The accepted E3 serializer independently validates
the graph binding, time window, shape, finding identities, order, and canonical bytes.

## Transaction and cleanup

The snapshot is first written into a uniquely owned sibling staging directory. A hard link creates
the finished path atomically and fails rather than overwriting a path created after validation. The
staged name is then removed, and the finished file is reread, byte-compared, parsed, validated, and
canonically reserialized before success is reported.

The candidate output, detached worktrees, staging directory, and any owned failed output are removed
on every failure. A concurrently created output belongs to its creator and is left byte-for-byte
untouched. Transport, parsing, serialization, linking, or final verification errors expose only
normalized `WG_RC_*` failures rather than raw provider or operating-system error text.

## Validation

The release-candidate tooling passes 126 focused tests across 22 files. E5A fixtures prove the exact
seven-node canonical request, absence of Wayglass names, deterministic provider-order normalization,
patched and unpatched findings, raw-response and dependency hashes, a 24-hour window, canonical
output, and one build plus one transport call.

Adverse fixtures cover malformed JSON and HTML, an unknown package, duplicate advisories,
non-success status, unsupported encoding, oversized raw and decoded responses, build failure,
transport failure, credential exposure, cleanup, and concurrent output creation without overwrite. A
mislabeled gzip fixture proves exact raw-byte hashing, bounded decoding, strict response validation,
and retained media-type and undeclared-compression warnings. Tests inject every response; they never
invoke the live HTTPS transport or contact a registry.

TypeScript, ESLint, formatting, documentation tests, the documentation build, and the complete
repository quality gate must pass before this proposal is presented for acceptance.

## Acceptance effect

Acceptance completes Phase 6C-E5A and authorizes asking the project owner for the separate E5B dated
advisory-capture authority. It does not itself authorize command invocation, network access, an
advisory retry, snapshot approval, the E5C authoritative run, candidate acceptance, artifact upload,
registry publication, package privacy or version changes, repository visibility changes, tags,
releases, documentation deployment, Phase 6D, Phase 6E, or the separate SpaceTraders client.
