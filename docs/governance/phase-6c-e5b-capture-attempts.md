# Phase 6C-E5B advisory-capture attempt record

**Status:** Accepted on September 8, 2026. The project owner explicitly approved attempt 5's exact
canonical zero-finding snapshot, including its `WG_RC_ADVISORY_MEDIA_TYPE` warning, and separately
authorized E5C attempts 1 and 2; attempt 2 passed. Attempts 1 through 3 stopped before transport;
attempt 4 made one npm bulk-advisory request and rejected its response; attempt 5 made one
separately authorized request and retained the approved result described below. This acceptance does
not accept a release candidate, publish packages, use credentials, create tags or releases, deploy,
or begin external-application work.

## Append-only capture ledger

The execution environment did not preserve whole-second command-start times for the first two
attempts. Inventing them would create false evidence, so `recordedAt` is the whole-second UTC time
at which both already-observed outcomes were entered into this repository record. Future capture
attempts must record their actual command-start time at invocation.

| Sequence | Recorded at            | Outcome | Code                          | Safe summary                                                                 |
| -------- | ---------------------- | ------- | ----------------------------- | ---------------------------------------------------------------------------- |
| 1        | `2026-09-07T22:52:57Z` | failed  | `WG_RC_OUTPUT_TEMP`           | The selected output was not below the operating-system temporary root.       |
| 2        | `2026-09-07T22:52:57Z` | failed  | `WG_RC_COMMAND_START`         | The pinned pnpm JavaScript launcher existed but was not directly executable. |
| 3        | `2026-09-07T23:01:24Z` | failed  | `WG_RC_DEPENDENCY_AUDIT`      | One dependency declared a license but retained no license or notice file.    |
| 4        | `2026-09-08T00:38:35Z` | failed  | `WG_RC_ADVISORY_TRANSPORT`    | The status-200 provider response did not advertise an accepted JSON type.    |
| 5        | `2026-09-08T03:18:41Z` | passed  | `WG_RC_ADVISORY_CAPTURE_PASS` | One canonical zero-finding snapshot was retained for owner review.           |

Attempts 1 and 2 both failed before candidate assembly and before construction or transmission of
the advisory request. Neither attempt contacted npm, received provider bytes, created a snapshot,
changed the frozen source, or left candidate output. Attempt 2 used the corrected temporary-root
location from attempt 1; it did not overwrite or relabel attempt 1. Attempt 3 completed candidate
assembly before the dependency audit stopped it, but it also occurred before request construction or
transmission. None of the first three attempts contacted npm, received provider bytes, or created a
snapshot.

## Attempt 2 diagnosis

The repository-pinned pnpm selection exposes a real absolute `npm_execpath`, but the selected
shebang-bearing `pnpm.cjs` store file has mode `0644`. The assembler authenticated that the path was
absolute and existed, then passed it directly to the process launcher. Direct spawning therefore
failed with `EACCES`. The same path was also symlinked as the nested-worktree `pnpm` command, so the
later install and build boundaries would have inherited the defect.

The correction keeps the exact pinned launcher and does not select a global or alternate pnpm. When
the authenticated launcher is executable, behavior is unchanged. When it is not executable, direct
commands invoke it through the current absolute Node executable, and the owned nested-command
directory receives an executable shell shim that does the same. Arguments remain an explicit argv
array and are forwarded without evaluation. The shim is removed with its assembly-pass temporary
root.

Regression validation uses a real non-executable JavaScript fixture for both direct invocation and
the generated nested shim. Existing executable-launcher behavior remains covered.

## Attempt 3 diagnosis

The exact installed `@lit-labs/ssr-dom-shim@1.6.0` package manifest declares `BSD-3-Clause`, but the
published package contains no package-root license, licence, copying, or notice file. The other six
nodes in the exact production graph retain legal files. The collector correctly reported the real
package contents; its accepted contract and synthetic fixture incorrectly required every dependency
to embed separate legal-file bytes.

The correction continues to require the installed manifest's non-empty license declaration and to
hash the exact manifest bytes. It hashes every recognized package-root legal file that is present.
When none is present, it retains `licenseFiles: []` as explicit evidence requiring project-owner
disposition; it does not invent legal text, retrieve substitute repository bytes, infer a license
from package identity, or turn the absence into a clean legal-review conclusion. A missing or empty
manifest declaration still fails closed.

Regression validation models the exact installed shim without a legal file, proves that its declared
license and empty legal-file list survive canonical serialization, proves that the other six nodes
retain their legal-file hashes, and continues to reject a missing manifest license. The complete
repository quality gate passed, including 126 release-candidate tests across 22 files, 286
documentation assertions across 42 files, and the documentation build.

A separate hard-offline audited assembly against implementation commit `6246992` then completed both
deterministic frozen-source passes and retained the exact seven-node graph. It observed
`@lit-labs/ssr-dom-shim@1.6.0` with declared license `BSD-3-Clause` and zero legal files. That local
validation had no advisory transport, created no snapshot, and its disposable candidate output was
removed.

## Attempt 4 diagnosis

Attempt 4 completed the corrected audited assembly and made its one authorized credential-free
request to the fixed npm bulk-advisory endpoint. The endpoint returned status 200, but the response
did not advertise the required JSON media type, so the adapter rejected it before hashing or parsing
and removed all owned output. It did not redirect, fall back, retry, retain provider bytes, or
create a snapshot.

npm's API documentation describes a JSON success response, while an npm CLI issue reported in July
2026 documents the same bulk endpoint returning gzip bytes without the required content-encoding
header. Because attempt 4 intentionally did not retain raw response bytes, this record does not
claim that its body was gzip or valid JSON. It records only the observed status and validation
failure.

The correction hashes the exact raw response before any decoding. It accepts declared gzip or gzip
magic bytes, bounds decompressed output to one MiB, and then requires strict UTF-8, JSON, and exact
bulk-response schema validation. Missing JSON media type and gzip without a declaration become
explicit dependency-security warnings in an otherwise valid snapshot. Unsupported encodings, invalid
gzip, HTML, malformed JSON, unknown packages, invalid findings, and oversized decoded output still
fail closed. No broader endpoint, fallback, redirect, credential, or retry is introduced.

## Attempt 5 retained snapshot

Attempt 5 ran from clean merged tooling commit `d16727ab51140c349dd1c4695650aa96337bb593` against
frozen source `ce400e89930a047c6af1c6992c64cfe422a1eeee`. It completed offline audited assembly
before making its one separately authorized credential-free request to the fixed npm bulk endpoint.
It did not redirect, fall back, retry, contact another registry route, or use a release credential.

The retained result approved by the project owner is:

| Evidence                     | Exact value                                                        |
| ---------------------------- | ------------------------------------------------------------------ |
| Snapshot SHA-256             | `c67751865ce3fe05e294fc173246abefb0f875fe5f5afd6dc6f5f09a239ed3f9` |
| Exact raw-response SHA-256   | `44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` |
| Dependency-audit SHA-256     | `45178532da0e24286d7e4fa9a4ed4cd6cef630d31e7341c3e6817d705ce3178f` |
| Frozen lockfile SHA-256      | `bdb6b4e916bd5fa2330fc3dd3f272814c6940ec04dab78b437b7007be386a525` |
| Captured at                  | `2026-09-08T03:21:31Z`                                             |
| Valid through                | `2026-09-09T03:21:31Z`                                             |
| Findings                     | `0`                                                                |
| Snapshot bytes               | `801`                                                              |
| Dependency-security warnings | `WG_RC_ADVISORY_MEDIA_TYPE`                                        |

The warning states that the provider did not advertise a JSON media type; the exact decoded bytes
nevertheless passed strict UTF-8, JSON, graph-bound response-schema, snapshot-schema, and canonical
serialization validation. No undeclared-gzip warning was produced. The raw provider bytes were
hashed before decoding and then discarded as required; only the canonical snapshot remains.

A separate read-only verification recomputed the snapshot SHA-256, validated its exact seven-node
dependency context, confirmed zero findings and the single warning, reproduced the canonical bytes,
and confirmed an exact 24-hour validity interval. The repository and Git worktree inventory were
clean after capture.

## Acceptance and next authority boundary

The project owner approved the exact attempt-5 snapshot, including its zero findings and media-type
warning, and separately authorized E5C attempts 1 and 2. That approval completes E5B for this
snapshot. The [E5C run-attempt record](./phase-6c-e5c-run-attempts.md) preserves both authorized
attempts and their outcomes. Attempt 2 consumed the approved snapshot while valid and passed; no
additional E5C attempt is authorized or required. The next authority boundary is E5D project-owner
disposition against the exact retained candidate hashes.
