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
does not claim complete interchange or DTCG conformance.

Run the focused gates from the repository root:

```sh
pnpm experiment:phase5b:check
```
