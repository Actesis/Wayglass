# Phase 6C-E integrated candidate record plan

**Status:** Proposed on September 6, 2026 after acceptance of the all-green Phase 6C-D5 rehearsal.
This plan decomposes the final Phase 6C stage already authorized by the accepted release-candidate
proof contract and ADR 0036. It does not run or accept a candidate, contact npm or another registry,
fetch advisory data, use credentials, change package privacy, create a tag or release, change
repository visibility, deploy, or begin external-application work.

## Objective

Phase 6C-E must produce one integrity-protected private evidence bundle for frozen source
`ce400e89930a047c6af1c6992c64cfe422a1eeee`. The bundle must prove two complete clean candidate runs,
not merely the two assembly passes already performed inside one candidate build. Each run must
assemble the same six private tarballs and pass the accepted two-Vanilla, four-React,
36-browser-case matrix. The final record must also normalize every audit and limitation required by
the accepted Phase 6C evidence schema.

The D5 rehearsal establishes that this matrix can pass in the current environment. Its console
summary is not authoritative candidate evidence and is not promoted into the retained bundle.

## Fixed boundaries

- Candidate source, tree, lockfile, package names, versions, order, consumer scenarios, browser
  engines, and support claims remain exactly those in the accepted Phase 6C contract.
- Candidate manifests remain `private: true`; Phase 6C artifacts cannot be published.
- The runner remains hard-offline and rejects release, npm, GitHub, and Cloudflare credentials.
- No implementation step may edit the frozen source, replace a failed result, silently retry, omit a
  scenario, or convert unavailable evidence into a pass.
- Tooling changes invalidate the tooling identity and require both authoritative runs again.
- Generated records contain no username, repository path, temporary path, credential, arbitrary
  environment dump, or nondeterministic value inside an artifact-hash comparison.
- The retained output is a new explicit directory outside the repository. It is accepted by hashes,
  not by trusting local filesystem immutability. Partial output is removed on failure.

## Evidence bundle

The final bundle contains:

1. a canonical machine-readable integrated record with a distinct schema version;
2. the six candidate tarballs from the accepted run, each reverified against its recorded SHA-256;
3. normalized run, command, environment, audit, consumer, browser, limitation, and retry records;
4. an inventory and SHA-256 for every retained file; and
5. a small verification command that reads the finished bundle without mutating or accepting it.

The record identifies both authoritative runs and proves their candidate projections, packed file
inventories, tarball bytes, and result matrices are equal. Time and environment observations remain
recorded evidence but are excluded from deterministic artifact equality.

Raw logs may be retained only when their allowlisted, normalized form is proven free of absolute
paths, usernames, credentials, and arbitrary environment content. A normalized failure ledger is
required even when raw logs are omitted.

## Audit model

The integrated record must cover the accepted evidence categories without inventing package-manager
or registry authority:

| Category          | Required proof                                                                                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package contents  | Projected manifest, exports, packed paths, sizes, hashes, license and notice hashes, side effects, lifecycle-script absence, private-file rejection, and source-map findings             |
| Dependencies      | Exact production graph, internal dependency order and ranges, peer ranges, external production versions, and absence of workspace, filesystem, URL, Git, or lifecycle dependencies       |
| Compatibility     | TypeScript and React scenario identities plus complete Vanilla, React, build, removal, and browser outcomes                                                                              |
| Quality gates     | Exact uncached repository command, exit result, and normalized category results required by the frozen scope                                                                             |
| Environment       | OS, architecture, Node, pnpm, npm, TypeScript, React, Playwright, and normalized browser versions used by the proof                                                                      |
| Provenance inputs | Source commit/tree/lockfile, tooling commit/tree, clean-worktree result, command identity, package order, and expected future workflow inputs; no claim of published npm provenance      |
| Advisories        | A separately supplied, dated, read-only snapshot with source identity and SHA-256; unavailable or stale input is a named limitation or blocker, never permission for the runner to fetch |
| History           | Every attempt, correction, warning, unsupported claim, skipped path, and final disposition, without overwriting failures after a successful rerun                                        |

License conclusions come from the actual production graph and packed package files. They do not
infer transitive license compatibility from a package name alone. Advisory findings are reported as
observations against the exact dependency versions and snapshot date, not as a timeless security
claim.

## Implementation sequence

### 6C-E1 — integrated schema and verification core

Define the canonical integrated evidence types, serializers, validators, deterministic equality
surface, retained-file inventory, and adverse fixtures. Keep these functions pure and preserve
verification of the existing assembly evidence format.

**Review gate:** malformed identities, counts, hashes, paths, duplicate records, partial matrices,
unknown fields, nondeterministic equality input, and incomplete history fail closed.

### 6C-E2 — package and dependency audits

Implement pure collectors and validators for packed manifests and paths, dependency graph and
ranges, licenses, notices, lifecycle scripts, side effects, source maps, sizes, and provenance
inputs. Reuse existing inspection output rather than unpacking through an unrelated tool path.

**Review gate:** all six exact package audits pass adverse fixtures, and no audit reads workspace
source as a substitute for packed bytes.

### 6C-E3 — environment and advisory inputs

Normalize allowed tool and browser versions, uncached command results, limitations, warnings, and
attempt history. Define an explicit advisory-snapshot input contract and validator. The candidate
runner reads an already approved local snapshot; it has no fetch mode and no registry fallback.

**Review gate:** secrets, absolute paths, usernames, arbitrary environment keys, stale or malformed
advisory input, and erased failure history are rejected or recorded with the exact contract-defined
limitation.

### 6C-E4 — retained two-run orchestrator

Add one explicit command accepting only the frozen source, one new absolute output directory, and
the validated advisory snapshot. It performs two fresh complete runs. Each run executes candidate
assembly and the full consumer/browser matrix; the orchestrator then compares deterministic
surfaces, writes one bundle transactionally, verifies it, and removes every temporary path. It does
not retry automatically.

**Review gate:** exact 2/2 run, 6-package, 2-Vanilla, 4-React, and 36-browser counts pass; injected
failure at every boundary leaves no partial retained bundle; a changed byte or result fails
equality.

### 6C-E5 — authoritative execution and disposition

Obtain separate authority for any dated read-only advisory retrieval, create the validated snapshot,
run the authoritative command once, verify the retained bundle independently, and propose the exact
record and hashes for project-owner review. Record all attempts and clean temporary residue.

The detailed [Phase 6C-E5 execution plan](./phase-6c-authoritative-execution-plan.md) resolves the
dependency-audit/advisory ordering boundary and separates capture-tool implementation, one dated
bulk advisory query, one authoritative retained run, and project-owner disposition. Each live
external action retains its own explicit authority gate and append-only attempt record.

**Review gate:** the project owner either accepts the exact integrated evidence and completes Phase
6C, narrows the release-unit proposal, or records a no-candidate disposition. Success does not by
itself authorize Phase 6D deployment work or Phase 6E npm release work.

## Acceptance effect

Accepting this plan completes no 6C-E implementation or candidate gate. It authorizes 6C-E1 schema
and verification-core implementation only. Every later substage remains a separate reviewable
change, and 6C-E5 retains the Phase 6C project-owner exit decision. No publication-adjacent action
is approved by accepting this plan.
