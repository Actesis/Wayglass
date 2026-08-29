# Phase 5D-A current icon contract and source inventory

**Recorded:** 2026-08-28  
**Source revision:** merge commit `554fb79`  
**Scope:** current baseline for `P5D-A-E01` and input to `P5D-A-E02`  
**Disposition:** inventory complete; production reconciliation and artifact disposition remain
separate

## Runtime and package inventory

`@wayglass/icons` is a private, independently versioned optional-runtime package at `0.0.0`. Its
only runtime dependency is the already accepted `lit@3.3.3`. The manifest exports the package root,
marks the package side-effect-free, and contains no `/icon` subpath.

The 73-line runtime source owns:

- the exact names `close`, `menu`, `more`, and `refresh`;
- one `IconName` union and runtime name guard;
- inline SVG geometry inside the component render method;
- one reflected `name` property with `more` as the default;
- unconditional decorative `aria-hidden="true"` behavior on connection;
- current-color, 24-by-24, non-focusable SVG presentation; and
- explicit duplicate-safe `defineWgIcon` registration with no import-time registration.

The 16-line test source fixes the four-name inventory, rejects one domain-specific example, and
verifies that importing the element class does not register it. Storybook uses `more` and `refresh`
inside owning controls whose accessible names remain outside the icon.

## Accepted contract comparison

| Surface               | Accepted foundation contract                       | Current implementation                | Decision impact                                                                |
| --------------------- | -------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| Package entry         | `@wayglass/icons/icon`                             | Root export only                      | Must be reconciled before production generation or release                     |
| Name                  | Reviewed local catalog name                        | Implemented as `name`                 | Valid comparison input                                                         |
| Label and named image | Optional `label`; named image after upgrade        | Not implemented; always decorative    | Runtime API decision, not tooling-proof authority                              |
| Size                  | `compact`, `standard`, or `prominent`              | Inherits `1em`; no typed property     | Runtime API and token decision remains open                                    |
| Direction             | `auto`, `ltr`, or `rtl`; only marked icons mirror  | No direction property or metadata     | The private source proof may model metadata but cannot change runtime behavior |
| Arbitrary/remote SVG  | Rejected                                           | Not accepted                          | Preserve                                                                       |
| Required meaning      | Icons cannot own required meaning or control names | Current Storybook controls own labels | Preserve and validate in later proof slices                                    |
| Registration          | Explicit and duplicate-safe                        | Implemented                           | Preserve                                                                       |

The contract and implementation are both reviewed project artifacts, but they are not currently the
same API. This inventory does not choose one, widen either, or describe the mismatch as a tooling
defect. A separate owner review must reconcile the public runtime contract before any accepted tool
can generate production source.

## Source-model implication

The private proof starts from structured commands and primitives rather than raw SVG. Active
content, event attributes, external references, embedded styles, text, foreign objects, and unknown
elements are therefore outside the input language rather than removed after parsing. The model
records direction and reinforcement-only use without deriving either from geometry.

The five positive records account for the current four runtime names plus synthetic
`arrow-inline-start`, which is marked `mirrors-in-rtl`. It is proof data, not a proposed production
catalog addition. Domain neutrality remains a human review claim; validation cannot determine that a
syntactically valid name belongs in the generic catalog.

## Reproduction

```sh
wc -l packages/icons/src/index.ts packages/icons/test/icons.test.ts
git ls-files packages/icons
pnpm --filter @wayglass/icons typecheck
pnpm --filter @wayglass/icons test
pnpm experiment:phase5d:check
```

No command changes `@wayglass/icons`, installs a dependency, connects a design tool, or generates a
production artifact.
