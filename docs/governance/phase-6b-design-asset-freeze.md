# Phase 6B design-asset freeze

**Status:** Accepted by the project owner on September 4, 2026. This record freezes the exact v1
token, theme/density, and generated icon semantic payloads. It changes no package version, privacy,
registry, repository visibility, compatibility or support claim, packed artifact, or deployment
state.

## Decision

Freeze three canonical public design-asset payloads:

| Payload              | Included public meaning                                                                                         |                     Count | Canonical JSON bytes | SHA-256                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------: | -------------------: | ------------------------------------------------------------------ |
| Tokens               | `tokenTypes` plus every token name, value, type, and description                                                |                528 tokens |               76,615 | `dcca8f326e7da8c3edf3596d100846c784f84f759dc4b8eef167e4329c132260` |
| Themes and densities | Theme, density, and selection names plus every theme and density override target/source pair                    | 4 modes and 197 overrides |               11,365 | `fd13ec329824a320e4191bc62c79b707297409cb5603f23eb5a4cfccbb0f366f` |
| Icons                | Generated catalog names, direction metadata, primitive geometry and paint plus public size and direction values |  4 icons and 6 primitives |                1,725 | `fa7559c60ed65fe581cba35305d30dcd44df01725784564eb3733208a3fa9243` |

Canonical JSON recursively sorts object keys, preserves authored array order, omits whitespace, and
hashes the resulting UTF-8 bytes. The executable test contains the same algorithm and fixed hashes.
This makes the human-readable sources authoritative while providing a compact whole-surface drift
guard.

## Exact value sets

- Themes: `wayglass-dark`, `wayglass-light`.
- Theme selections: `system`, `wayglass-dark`, `wayglass-light`.
- Densities: `compact`, `comfortable`.
- Icons: `close`, `menu`, `more`, `refresh`.
- Icon sizes: `compact`, `standard`, `prominent`.
- Icon direction requests: `auto`, `ltr`, `rtl`.
- Catalog directions currently use only `neutral`; `mirrors-in-rtl` remains a supported catalog type
  but is not assigned to a v1 icon.

The exact 528 token definitions and 197 override pairs remain readable in
`packages/tokens/src/definitions.ts` and `packages/themes/src/definitions.ts`. The exact generated
icon records remain readable in `packages/icons/src/generated/catalog.ts` and authenticated by the
private icon pipeline. Repeating hundreds of definitions in this record would create a competing
source of truth.

## Boundaries

- The token hash includes descriptions because they explain public semantic intent. Editorial
  changes therefore receive the same compatibility review as value changes.
- Theme and density hashes include ordered public name arrays and complete override maps. Adding a
  planned theme to documentation does not add it to this payload or make it selectable.
- The icon hash includes exact geometry, paint, catalog direction, size values, and direction
  requests. It does not make the private source format, generator, manifests, or review page public.
- Pure token/theme generation helpers and both icon entry points retain their separately accepted
  contracts. This record freezes their public input data, not their implementations.
- Generated CSS, JSON, JavaScript, declarations, and source maps must derive from these payloads and
  are verified as candidate artifacts during Phase 6C. This record does not freeze incidental
  compiler formatting as semantic API.

## Change policy

Before the exact v1 scope-freeze commit, a payload may change only through a reviewed correction
that updates its source, fixed fingerprint, affected documentation and tests, compatibility impact,
and generated-output evidence together. After scope freeze, any change follows the accepted SemVer
and deprecation policy; a new name is not automatically nonbreaking when it changes unions, theme
selection, output size, visual meaning, or exhaustive consumer logic.

Private tooling may evolve without changing these public hashes only when it generates equivalent
authenticated output. A mismatch is a stop condition, not an instruction to refresh the expected
hash automatically.

## Validation

Validated locally on September 4, 2026:

- all 192 documentation/governance tests passed, including the four fixed-fingerprint assertions;
- all 40 focused token, theme, density, and icon package tests passed, covering reference integrity,
  contrast, runtime behavior, and the absence of history-bearing theme names;
- token interchange verified 528 tokens, 197 overrides, three web artifacts, and seven exchange
  files;
- the icon pipeline verified four icons and four generated artifacts;
- token, theme, icon, and documentation TypeScript checks passed;
- token, theme, and icon package builds passed;
- focused ESLint and Prettier checks passed; and
- the VitePress production documentation build passed.

`git diff --check` also passed before this validation record was finalized. No production source or
semantic payload changed while collecting the evidence.

## Phase 6B effect

This acceptance closes the remaining design-asset portion of correction 3. Entry points, root
symbols, component fields and styling hooks, and these exact semantic assets are now frozen. Emitted
declarations and packed targets remain Phase 6C candidate evidence rather than an unresolved
public-surface decision.

## Project-owner decision

Accepted on September 4, 2026. These three payloads are frozen for the v1 candidate, and Phase 6B
advances to package identity and stewardship. This acceptance does not choose versions, authorize
publication, or begin Phase 6C.
