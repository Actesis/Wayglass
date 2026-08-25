# Phase 5B token-interchange proof

> Historical record: this guide describes the bounded experiment before Stage 8 removed its
> executable code and commands. Use the [permanent tooling guide](../../README.md) for current
> commands. The referenced implementation remains recoverable through version control.

This directory retains the bounded proof and disposition evidence accepted in
[`P5B-TOKEN-INTERCHANGE-001`](../../../../docs/governance/explorations/phase-5b-token-interchange.md).
The accepted pure graph, identity, transform, comparison, and focused-test core now lives in
[`tooling/token-interchange/`](../../). At the time of validation, the remaining experiment code
exercised capacity and authenticated fingerprints against that permanent core. Neither location was
a workspace package, production export, interchange conformance claim, or release candidate.

The permanent core normalizes the reviewed `@wayglass/tokens` and `@wayglass/themes` sources into a
deterministic graph and applies the existing web transform. The retained proof establishes:

- reversible Wayglass identity and nested exchange paths;
- DTCG `$root` placement for tokens that also own child paths;
- explicit reference, semantic, and component layers;
- preserved token types, descriptions, values, aliases, themes, and densities;
- failure before output work for invalid identities, collisions, or missing override references;
- byte-for-byte parity with the production base-token and theme/density CSS compilers; and
- an explicit boundary between portable token data and web-only selector, `color-scheme`, and
  forced-colors policy.

The transforms return strings in memory and do not replace production output. The second transform
produces nested DTCG 2025.10 token and mode documents, an orthogonal theme/density resolver, and a
Wayglass manifest. The manifest labels the result a partial candidate and accounts for four omitted
tokens: DTCG dimensions allow only `px` and `rem`, while the current web system intentionally uses
`ch` for one intrinsic measure, an alias to that measure, and `fr` for two grid ratios. The proof
does not claim complete interchange or DTCG conformance. The manifest also records a caller-supplied
source commit, the pinned schema version, every reversible identity, and SHA-256 plus UTF-8 byte
measurements for each non-manifest artifact. Pure in-memory verification and comparison helpers
detect inventory changes, content tampering, and targeted artifact drift before any future
filesystem replacement is authorized.

The accepted writer and its failure fixtures now live in the permanent tooling directory. It adds
the single-writer lock and conservative stale-lock recovery that were intentionally absent from the
proof. This directory retains the original validation record, including the proof's narrower
concurrency and durability limitations, as historical evidence rather than duplicate executable
code.

The capacity harness constructs the reviewed corpus and an exact 10× token/override replica, then
measures normalization plus both in-memory transforms without imposing a threshold. The retained
[Node 26/macOS](./capacity-node-26-macos.md) and [Node 22.13/macOS](./capacity-node-22-13-macos.md)
results cover the current and minimum supported runtimes for `P5B-E08`. The earlier
[Node 22.12/macOS](./capacity-node-22-macos.md) run remains historical adverse evidence: the
transforms execute there, but pinned pnpm 11.9.0 does not.

The retained [transformer-candidate comparison](./transformer-candidate-comparison.md) qualifies
Style Dictionary 5.5.1 for a possible future isolated prototype but does not add or approve a
dependency. `@tokens-studio/sd-transforms` remains conditional on a later decision to use Tokens
Studio as an authorized source.

## Candidate output contract

The in-memory DTCG candidate contains exactly seven files:

```text
tokens.json
modes/density/comfortable.json
modes/density/compact.json
modes/theme/wayglass-dark.json
modes/theme/wayglass-light.json
resolver.json
wayglass-manifest.json
```

The manifest labels the set `partial-dtcg-2025.10-candidate`, retains the source revision and all
reversible identities, measures every non-manifest artifact, and accounts for all omissions. This is
an executable test contract, not a checked-in generated release or supported public artifact. The
[documentation and cleanup validation](./documentation-and-cleanup-validation.md) records the
retained and removed proof inventory.

## Historical commands

These commands were used by the bounded proof and were removed in Stage 8:

```sh
pnpm experiment:phase5b:check
```

The informational measurement is separate from normal gates and requires an exact clean commit:

```sh
WAYGLASS_SOURCE_REVISION=<full-checked-out-commit> pnpm experiment:phase5b:measure
```

The formal determinism fingerprint is also separate. It authenticates an exact clean commit and
prints stable web and exchange hashes for comparison across supported runtimes, locales, time zones,
and launch directories:

```sh
WAYGLASS_SOURCE_REVISION=<full-checked-out-commit> pnpm experiment:phase5b:fingerprint
```
