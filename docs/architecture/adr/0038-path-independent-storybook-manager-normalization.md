# ADR 0038: Normalize Storybook manager bundles before site composition

- Status: accepted
- Date: 2026-10-31

## Context

ADR 0037 requires repeated site builds from one accepted source and environment to produce identical
bytes. The Phase 6D-F baseline rehearsal exposed a narrower condition that the earlier same-checkout
proof did not vary: Storybook 10.5.5 writes addon manager entry modules containing absolute package
paths before bundling them with esbuild. Esbuild then assigns collision-avoidance identifiers partly
from those module identities.

Two builds of the same commit, tree, lockfile, Node version, pnpm version, platform, architecture,
file count, and byte count produced different bytes in only these generated files:

- `storybook/sb-addons/a11y-*/manager-bundle.js`; and
- `storybook/sb-addons/docs-*/manager-bundle.js`.

A stronger post-merge proof then identified the same path dependence in Storybook's shared
`storybook/sb-addons/storybook-core-server-presets-*/common-manager-bundle.js` entry.

Each checkout path reproduced its own result, and rebuilding through the earlier retained path
reproduced the earlier hash. The source content was stable; the generated manager identifiers were
path-dependent. A deployment hash cannot safely admit that artifact.

Node has no JavaScript minifier. Vite does not expose its internal Oxc minifier as a supported API,
and a second esbuild transform did not normalize the accessibility bundle. Rolldown `1.1.5` is
already exact-pinned in the lockfile through Vite and exposes Oxc's whole-file minifier through
`rolldown/utils`.

## Decision

The private `site:build` orchestration runs a closed Storybook manager-normalization step after the
Storybook producer succeeds and before composition inventories either public surface.

The step:

1. enters only the real `apps/storybook/storybook-static/sb-addons` directory;
2. selects only one-level addon files named `manager-bundle.js` or `*-manager-bundle.js`;
3. fails closed if no manager addon bundle exists;
4. parses and minifies each complete generated bundle with the exact-pinned Rolldown/Oxc API using a
   constant virtual filename, compression, and identifier mangling;
5. rejects any reported minifier error;
6. writes a private sibling file, atomically replaces the generated producer file, and normalizes
   its mode; and
7. removes only its own incomplete sibling on failure.

This is producer-output normalization, not composition-time mutation. `site:compose` remains a
byte-for-byte copier and its pre/post inventory checks remain unchanged. Direct callers of
`site:compose` must provide already normalized producer output if they need the `site:build`
reproducibility claim.

The root now declares exact `rolldown@1.1.5` directly because private tooling imports its API. This
adds no package version or package bytes beyond the already reviewed Vite dependency graph, but it
prevents reliance on an undeclared transitive dependency. The platform, Storybook, Vite, and the
existing esbuild pass were insufficient for the normalization above.

Automated coverage creates equivalent manager bundles under distinct absolute repository parents,
normalizes them, composes both complete sites, and requires identical manager bytes, manifests,
inventories, and bundle hashes. Phase 6D-F additionally requires a real two-checkout build proof
before any corrected baseline hash is accepted.

## Consequences

- The composed artifact no longer exposes Storybook's checkout-path-dependent local identifiers.
- Manager JavaScript is smaller and semantically processed twice: first by Storybook/esbuild, then
  by the closed Oxc normalization pass.
- Browser, accessibility, CSP, response, and edge checks remain mandatory; byte equality does not
  substitute for runtime verification.
- A Storybook upgrade that removes, relocates, or changes manager addon output fails closed and
  requires a reviewed update.
- Cross-platform identity remains outside the current claim because the manifest intentionally
  records platform and architecture.

## Alternatives considered

### Accept a fixed checkout path

Rejected because it would preserve path dependence and make reproducibility an operator convention
instead of an artifact property.

### Ignore manager bundles in the site hash

Rejected because they execute in the public Storybook manager and must remain covered by the exact
artifact identity.

### Re-minify with esbuild

Rejected because the experiment normalized the docs addon but retained distinct accessibility-addon
bytes across the two observed path variants.

### Remove Storybook addons or publish preview-only Storybook

Rejected because docs and accessibility inspection are intentional parts of the public Storybook
surface.

## Related records

- [ADR 0037: deterministic site composition](./0037-deterministic-site-composition.md)
- [Phase 6D-F baseline reproducibility audit](../../governance/phase-6d-f-baseline-reproducibility-audit.md)
- [Phase 6D-F execution-readiness audit](../../governance/phase-6d-f-execution-readiness-audit.md)
