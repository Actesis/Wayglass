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

The transform returns strings in memory and does not replace production output. The experiment does
not emit a DTCG document yet.

Run the focused gates from the repository root:

```sh
pnpm experiment:phase5b:check
```
