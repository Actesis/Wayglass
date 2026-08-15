# Phase 5B token-interchange proof

This private experiment implements only the bounded proof accepted in
[`P5B-TOKEN-INTERCHANGE-001`](../../docs/governance/explorations/phase-5b-token-interchange.md). It
is not a workspace package, production export, interchange conformance claim, or release candidate.

The proof currently normalizes the reviewed `@wayglass/tokens` and `@wayglass/themes` sources into a
deterministic graph and applies the existing web transform. It establishes:

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

The experiment-only writer stores verified artifacts in immutable, content-addressed release
directories and atomically renames `current.json` to accept a release. Replacement is opt-in;
identical writes are idempotent. Ordinary partial-write failures remove their stage, while injected
process-interruption fixtures after staging and after release commit leave the previous pointer
unchanged. Recovery removes only recognized temporary names and unreferenced hexadecimal releases.
The injection models process termination at those boundaries; power-loss durability and operating
systems outside the repository test environment are not claimed. Concurrent writers are also outside
this proof; a permanent implementation would need locking or compare-and-swap semantics.

The capacity harness constructs the reviewed corpus and an exact 10× token/override replica, then
measures normalization plus both in-memory transforms without imposing a threshold. The retained
[Node 26/macOS](./evidence/capacity-node-26-macos.md) and
[Node 22.13/macOS](./evidence/capacity-node-22-13-macos.md) results cover the current and minimum
supported runtimes for `P5B-E08`. The earlier
[Node 22.12/macOS](./evidence/capacity-node-22-macos.md) run remains historical adverse evidence:
the transforms execute there, but pinned pnpm 11.9.0 does not.

The retained [transformer-candidate comparison](./evidence/transformer-candidate-comparison.md)
qualifies Style Dictionary 5.5.1 for a possible future isolated prototype but does not add or
approve a dependency. `@tokens-studio/sd-transforms` remains conditional on a later decision to use
Tokens Studio as an authorized source.

Run the focused gates from the repository root:

```sh
pnpm experiment:phase5b:check
```

The informational measurement is separate from normal gates and requires an exact clean commit:

```sh
WAYGLASS_SOURCE_REVISION=<full-checked-out-commit> pnpm experiment:phase5b:measure
```
