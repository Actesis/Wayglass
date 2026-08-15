# Phase 5B token-interchange proof

This private experiment implements only the bounded proof accepted in
[`P5B-TOKEN-INTERCHANGE-001`](../../docs/governance/explorations/phase-5b-token-interchange.md). It
is not a workspace package, production export, interchange conformance claim, or release candidate.

The first slice normalizes the reviewed `@wayglass/tokens` and `@wayglass/themes` sources into a
deterministic graph. It establishes:

- reversible Wayglass identity and nested exchange paths;
- DTCG `$root` placement for tokens that also own child paths;
- explicit reference, semantic, and component layers;
- preserved token types, descriptions, values, aliases, themes, and densities; and
- failure before output work for invalid identities, collisions, or missing override references.

It intentionally emits no CSS or DTCG document yet. Those are separate proof slices over this graph.

Run the focused gates from the repository root:

```sh
pnpm experiment:phase5b:check
```
