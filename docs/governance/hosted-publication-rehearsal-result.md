# Hosted public archive and consumer rehearsal result

Status: successful review-only rehearsal, independently verified November 7, 2026. Not final
artifact acceptance or npm publication approval.

## Run and owner approval

[Run 42412111878](https://github.com/Actesis/Wayglass/actions/runs/42412111878), attempt `1`,
completed successfully on `Actesis/Wayglass`, `refs/heads/main`, through `workflow_dispatch` of
`.github/workflows/publication-rehearsal.yml`. GitHub's approval history records `Actesis` approving
the `npm-release` environment. No agent approval or administrator bypass was used. The job ran on
GitHub-hosted `ubuntu-24.04` from `2026-11-07T20:40:27Z` to `2026-11-07T20:46:55Z` (6m28s).

Authenticated identities:

- Frozen package source: `ce400e89930a047c6af1c6992c64cfe422a1eeee`.
- Frozen source tree: `da2550b5aa2636d0896ae61e08c340f405fe1412`.
- Frozen lockfile SHA-256: `bdb6b4e916bd5fa2330fc3dd3f272814c6940ec04dab78b437b7007be386a525`.
- Assembly and consumer tooling: `7e48e4800405ff0d9f6103ba4021e62b2f89a28b`.
- Tooling tree: `37373c5dd9565741beb4123a348579a163a8cb22`.

Both tooling and frozen-source quality gates ran without restored build caches. Fresh external
dependency/browser preparation remained separate from the offline proofs. Two independent offline,
frozen-source assembly passes produced byte-identical archives and complete file inventories. All
six public projections retain only reviewed consumer metadata and `private: false` in isolated
staging; source manifests and accepted private artifacts remain unchanged.

## Exact review artifact

GitHub artifact ID `13589981847` is named
`public-review-7e48e4800405ff0d9f6103ba4021e62b2f89a28b-1`, size `772966` bytes. It expires
`2026-11-14T20:46:51Z` after seven-day review retention. The downloaded ZIP's SHA-256 was
independently computed and matches GitHub's reported archive digest:
`4e4420000766bd883b87f3e38c0cfef637988475922dd8d0d18c8e4fe1e98dc9`.

The artifact is publicly downloadable from the public repository. It contains the assembly, the
exact tested archive copy, preparation lockfiles, twelve actual graph snapshots / 48 files, consumer
proof, and hosted-run receipt. The local verified download remains under OS temporary run
`wayglass-hosted-public-review.gpNcVxjI`. Neither temporary local storage nor the seven-day artifact
is indefinite release retention. Preserve the exact approved bytes through a separately reviewed
durable release-retention step before relying on them for publication.

All package versions are `0.1.0`. These are compressed-archive hashes for this hosted environment:

| Package              | Bytes  | Tarball SHA-256                                                    |
| -------------------- | ------ | ------------------------------------------------------------------ |
| `@wayglass/core`     | 7815   | `a04bc68be7e7503eaa0be77845dd933762b4b522d1bb2c9f97d6fdc13ad709c3` |
| `@wayglass/tokens`   | 46510  | `3aa088c67b9585eee8dffca83dd5a9985846f4e2f7892dc765e0f67db1b123e6` |
| `@wayglass/themes`   | 18140  | `8b56c019e791a9a499dc2f4424e8a9b1651818e12b58f6fea9d54a63b47f7288` |
| `@wayglass/elements` | 139017 | `eb4b48a8c9457562765c7e121a5a1c60d52b2013cc9c9b4418e9446756dbd278` |
| `@wayglass/icons`    | 11086  | `1adab11ea9f60142e74b7067438c9f23e5922981910547342a9bc93f9ddcd862` |
| `@wayglass/react`    | 26010  | `d3a88664ab7a48b9ce8f88f36e531beb27dc8c180c55b748ad5adfbb31243c31` |

Evidence hashes:

- `assembly/publication-evidence.json` and the byte-identical tested candidate copy:
  `17a5a59f5b12d90f8582f8c946055feabf17757addd09cd546bf4062db3d5b9a`.
- `proof/consumer-proof.json`: `5729d7b4378bb60df98dce1766e3b11399e3f77b054ed098a17030a5bd4024e6`.
- `hosted-run.json`: `ef7822fc69be20047b10fcc3d484dda12e98a8f730df3b8c46ea78cf1ce13331`.
- Sorted portable graph-file inventory, using the existing `hashFileInventory` format:
  `4d43775a29d435ab71a9771a7b959031554a7e5826ea207aa3544a7533a4937e`.

## Consumer and independent verification results

The Linux x64 host used Node `v26.8.1`, pnpm `11.9.0`, and npm `11.19.0`. The two Vanilla and four
React scenarios covered TypeScript `5.9.3` / `6.0.3` and React `19.0.0` / `19.2.8`. Both initial and
removal/rebuild stages passed in all three engines: 36 browser cases total. Observed engine versions
were Chromium `151.0.7922.34`, Firefox `153.0`, and WebKit `26.5`.

Every case passed the existing runtime/semantics assertions, with zero automated axe violations and
zero page errors. The production probes also passed declaration, CSS, production-build,
registration, known-state, React parity/event/client-fallback, tree-shaking, and removal checks. The
exact resolved and installed graph files were retained for all twelve stages, rather than
substituting the standalone provisioning locks.

After download, both `verify-publication` and `verify-publication-consumers` passed independently.
The latter rehashed all 48 graph files and the tested archives, checked complete matrix coverage,
and compared packed public manifests against authenticated frozen Git source. Additional review
matched the receipt's repository, ref, workflow/event, run ID/attempt, source, tooling SHA/tree, and
proof hash with GitHub metadata and approval history. Assembly and tested evidence bytes and all six
corresponding archive copies were identical.

Every hosted manifest and complete file inventory matches the earlier local public-review set. All
six compressed hashes differ from macOS, but each **complete decompressed tar stream** is
byte-identical, including tar metadata. This is a gzip-encoding difference, not a package-content
change. Reproducibility is proven within the recorded hosted environment, not universal compressed
byte reproducibility across platforms. Do not replace these exact hosted hashes with local ones.

The proof deliberately retains `hostedRunAuthenticated: false`; the separate run/approval/artifact
inspection above provides the hosted evidence binding. No proof field was edited to manufacture that
conclusion. The receipt is not provenance or an independent signature.

## Remaining gates

This result closes the hosted archive/consumer rehearsal gap. It does not accept the archives for
publication, choose a dist-tag, renew an advisory snapshot, or authorize credentials, tags, package
creation, npm upload, registry mutation, release announcements, or documentation deployment. No npm
publication occurred and no advisory capture or retry was made.

Automated browser and axe evidence does not establish human assistive-technology support, native
Safari behavior, Windows/NVDA, mobile, or real-provider compatibility. Existing limitations remain.
The earlier transitive license-file disposition is unchanged.

Next prepare the exact initial-release proposal: approve artifact identities and durable retention,
explicit dist-tag, release notes/support limits, recovery readiness, and partial-failure handling;
recheck advisory freshness; and review current first-package authentication/provenance requirements
before implementing a credential-isolated publisher. Registry hash/provenance/clean-install
verification must still precede any release announcement. These remain the separate gates in the
[initial npm preparation](./initial-npm-release.md).
