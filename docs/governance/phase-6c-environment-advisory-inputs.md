# Phase 6C-E3 environment and advisory input implementation

**Status:** Proposed for project-owner acceptance on September 7, 2026. This record covers the pure
environment, quality-gate, provenance, notice, attempt-history, and advisory-snapshot schemas,
validators, collectors, and canonical serializers authorized by the accepted Phase 6C-E plan. It
does not observe the current machine, execute a quality gate, retrieve an advisory snapshot, run or
retain a candidate, contact npm or another registry, use credentials, change package privacy, create
a tag or release, deploy, or begin external-application work.

## Allowlisted environment evidence

Environment evidence contains an exact allowlist rather than a copy of `process.env`:

- operating-system platform and version plus architecture;
- exact Node, npm, and pinned pnpm `11.9.0` versions;
- the accepted TypeScript `5.9.3` and `6.0.3`, Vite `8.1.5`, React version lines, and Playwright
  `1.62.0` matrix;
- ordered exact Chromium, Firefox, and WebKit versions;
- one canonical whole-second UTC observation time; and
- semantic controls stating that registry access, lifecycle scripts, and update checks were disabled
  and Turbo caches were bypassed.

Unknown keys, arbitrary environment variables, unsupported Node versions, tool-version drift,
partial or reordered browsers, noncanonical timestamps, and unsupported platform or architecture
values fail closed. Accepting a normalized platform value records what ran; it does not broaden the
separately accepted environment-support claim or close the deferred Windows observation.

## Quality-gate evidence

The quality section records only the repository-root `pnpm check` command with offline execution,
lifecycle scripts disabled, and caches bypassed. It requires exit code zero and the exact ordered
categories implemented by that command: formatting, lint, builds, icon tooling, token tooling,
release-candidate core, the retained Phase 5C experiment, typechecking, and tests. Every category
must carry a literal pass. Canonical UTC start and completion times are required and cannot be
reversed.

The complete Vanilla, React, and 36-case browser consumer results remain full records inside both
authoritative runs rather than being reduced to quality-section booleans. The quality section also
does not manufacture a fresh full-product Playwright run that the accepted Phase 6C-E orchestrator
does not execute.

## Provenance evidence

Provenance binds the frozen source commit, tree, and lockfile hash; full lowercase tooling commit
and tree; clean-worktree result; six-package order; future integrated command identity; and the
SHA-256 of the approved advisory input. Machine paths are replaced by three exact symbolic input
identities: frozen source commit, new absolute output directory, and approved local advisory file.
The later E4 runner must validate the real paths before emitting these normalized identities.

No field claims published npm provenance. The record describes local candidate inputs only.

## Notices and attempt history

Warnings and limitations use exact kind, normalized `WG_RC_*` code, affected-claim vocabulary, and
single-line summary fields. They are unique and sorted. Summaries reject control characters,
absolute local or file paths, recognized release-credential names and assignments, and explicit
username assignments. Evidence sections therefore cannot add arbitrary log output as a notice.

The shared attempt-history verifier preserves contiguous one-based failures followed by a final pass
and now applies the same text-safety rules inside the integrated envelope. A pure serialized schema
cannot prove that an operator omitted an event that occurred outside the process. E4 must construct
history from its in-process append-only attempt ledger, never accept replacement history, and never
retry automatically. This is the exact boundary already identified by E1.

## Approved advisory snapshot contract

An accepted advisory section must identify `npm-security-advisories` as its source and
`approved-read-only-snapshot` as its capture method. It records the upstream snapshot SHA-256,
canonical UTC capture and validity times, the frozen lockfile hash, exact canonical dependency-audit
hash, and `productionOnly: true`.

Freshness is evaluated against an explicit reference time supplied by the later runner, never the
ambient clock. The capture cannot be future-dated, the reference must fall within the validity
window, and the window cannot exceed seven days. An unavailable, stale, malformed, or future-dated
snapshot blocks the dependency-security claim; the validator has no fetch or registry fallback.

Findings contain only exact package/version, advisory identifier, severity, affected range, and
patched-version range or `null`. They must be unique, sorted, and refer to an exact node supplied
from the validated production graph. Unknown fields, a development-only package, an invented
version, invalid severity or range, wrong source identity, wrong lockfile or dependency hash, and a
notice affecting any claim other than dependency security fail closed.

The upstream source hash establishes the approved snapshot input identity; it does not claim that
the normalized finding list can reconstruct proprietary or provider-specific raw response bytes. E4
must hash-bind the canonical advisory section into the integrated envelope and bind the approved
input hash through provenance. E5 remains the only stage that may seek separate authority to obtain
the dated read-only snapshot.

## Pure boundary and validation

All E3 collectors and validators are pure. They perform no filesystem access, subprocess, network
request, environment read, environment mutation, clock read, retry, or process exit. Their four
section serializers reuse the recursive canonical JSON implementation from E1 and E2.

The release-candidate core passes 101 focused tests across 19 files. Adverse fixtures cover
arbitrary environment keys, unsupported Node and drifted tool versions, browser reordering, absolute
paths, credential and username text, incomplete or cached quality results, dirty provenance, altered
package order and hashes, incomplete or unfinished attempt histories, stale, future-dated, overlong,
wrong-scope, malformed, duplicate, reordered, unknown, and non-production advisory findings, and
canonical object-key insertion order.

TypeScript, ESLint, formatting, documentation tests, the documentation build, and the complete
repository quality gate also pass.

## Acceptance effect

Acceptance completes Phase 6C-E3 and authorizes Phase 6C-E4 retained two-run orchestrator
implementation only. It does not approve advisory retrieval, accept a candidate or evidence bundle,
authorize an authoritative run, contact a registry, change release state, or begin Phase 6D, Phase
6E, deployment, or external-application work.
