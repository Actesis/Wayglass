# Phase 6C-E1 integrated evidence schema implementation

**Status:** Proposed for project-owner acceptance on September 7, 2026. This record covers the pure
schema and verification core authorized by the accepted Phase 6C-E plan. It does not collect an
audit, read an advisory snapshot, run or retain a candidate, add an effectful command, authorize
Phase 6C-E2, contact npm or another registry, use credentials, change package privacy, create a tag
or release, change repository visibility, deploy, or begin external-application work.

## Versioned envelope

The integrated record uses schema version `2`, distinct from the existing version `1` assembly
evidence embedded by each authoritative run. The version `2` envelope contains exactly:

- the accepted frozen source commit, tree, and lockfile hash;
- the full tooling commit and tree;
- an exact two-run reproducibility result;
- ordered `run-1` and `run-2` records;
- exact references to six future audit and observation sections;
- one retained payload inventory; and
- a contiguous normalized attempt history ending in a pass.

Unknown or missing fields fail at every implemented envelope level. The existing assembly evidence
format and filesystem verifier remain available and unchanged.

## Embedded authoritative runs

Each run embeds one complete assembly evidence record and the exact accepted result matrices:

- six ordered private `0.1.0` package records;
- two ordered Vanilla results;
- four ordered React results; and
- 36 browser results in scenario, primary/removal stage, and Chromium/Firefox/WebKit order.

Every result flag must be literal `true`; a count alone is insufficient. Package identities,
filenames, hashes, sizes, inspected paths, and inspected-file inventory hashes are revalidated.
Unsafe or unsorted paths, duplicate paths, altered source or tooling identity, invented scenarios,
reordered browsers, partial matrices, and unknown result fields fail closed.

## Deterministic equality surface

The deterministic surface consists of the six complete package records and all consumer/browser
results. The run label and observed assembly environment are deliberately outside equality: they
identify an execution but must not alter candidate bytes or outcomes. Object keys are sorted
recursively for canonical hashing and serialization; array order remains contractual.

Both run surfaces must produce the same SHA-256, and the envelope must record that exact digest with
`runs: 2` and `byteIdentical: true`. A changed tarball hash, inspected file, package order, consumer
result, or browser result fails `WG_RC_INTEGRATED_REPRODUCIBILITY`.

Canonical evidence serialization uses recursively sorted object keys, two-space JSON, and one final
newline. The evidence record does not contain its own digest because that would be circular. The
later retained runner reports the canonical record's externally computed SHA-256 alongside the
bundle inventory root.

## Hash-bound section slots

Schema version `2` reserves exact references for:

| Section           | Retained path                     | Implemented payload stage |
| ----------------- | --------------------------------- | ------------------------- |
| Package audit     | `audits/packages.json`            | 6C-E2                     |
| Dependency audit  | `audits/dependencies.json`        | 6C-E2                     |
| Environment       | `observations/environment.json`   | 6C-E3                     |
| Quality gates     | `observations/quality-gates.json` | 6C-E3                     |
| Provenance inputs | `observations/provenance.json`    | 6C-E3                     |
| Advisories        | `observations/advisories.json`    | 6C-E3                     |

Each reference already fixes its path, section schema version, byte count, and SHA-256. It must
match one entry in the retained payload inventory. E2 and E3 can therefore define and validate their
payload schemas without adding fields to or weakening the version `2` envelope.

The bundle inventory uses normalized relative paths sorted bytewise, positive byte counts, and
lowercase SHA-256 values. It must include the six tarballs with the exact first-run sizes and hashes
plus all six section payloads. Its total byte count and inventory digest are recomputed. The
canonical record itself is excluded from its internal payload inventory and receives the separate
external digest described above.

## Attempt history boundary

History is nonempty, uses contiguous one-based sequence numbers, accepts only normalized `WG_RC_*`
codes and single-line summaries, and must end with a successful attempt. Earlier failures remain
ordered before the pass. This structural rule cannot prove that an operator disclosed an unknown
external attempt; E3 and E4 remain responsible for creating history only through the effectful
runner and for rejecting erased in-process failures.

## Retained validation

The private core exports pure validation, canonical serialization, deterministic run hashing, and
bundle-inventory hashing functions. Importing them performs no filesystem access, subprocess,
network request, environment mutation, or process exit.

Focused validation passes 82 assertions across 17 files. Adverse fixtures cover source and tooling
identity, package inventory hashes, environment exclusion from deterministic equality, unknown
fields, nondeterministic fields placed inside a run, partial and reordered matrices, changed run
bytes, unsafe and missing bundle paths, mismatched section references, and empty or unfinished
history. TypeScript, ESLint, formatting, documentation tests, and the documentation build also pass.

## Acceptance effect

Acceptance completes Phase 6C-E1 and authorizes Phase 6C-E2 package and dependency audit
implementation only. It does not accept a candidate or evidence bundle, authorize advisory retrieval
or the retained runner, contact a registry, change release state, or begin a later Phase 6 stage.
