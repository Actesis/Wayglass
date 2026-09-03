# Phase 6B elements and React root-symbol freeze

**Status:** Proposed on September 2, 2026. This record freezes root symbol names for the elements
and React v1 candidates. It changes no version, privacy, registry, or deployment state.

## Decision

Freeze the complete symbol-name sets authored by:

```text
packages/elements/src/index.ts
packages/react/src/index.ts
```

| Package              | Source symbols including type-only names | Runtime symbols | Source-name SHA-256                                                | Runtime-name SHA-256                                               |
| -------------------- | ---------------------------------------: | --------------: | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `@wayglass/elements` |                                      387 |             302 | `b5672f175c0e456a1030b0cb77cffe15e39f7e14dfd744d2dd476cb69275e809` | `d60b6e6d9e8806c0c2cd10aed77c982d7f5489add444ee63834adeb8c61e068a` |
| `@wayglass/react`    |                                      144 |              64 | `e7379f3c2ed4a378c191f8ced6ee8095bc123517adf44f74fba29045690b21a5` | `48b628073f3d38bf1392699cf6e777379476ab9f29e9b77c143c33cdcf8bd79e` |

The authored index files remain the human-readable exact lists. The fingerprints are compact drift
guards, not substitutes for review. When a guard changes, review must inspect the named export diff,
update the relevant component contract and type tests, explain migration impact, and deliberately
accept a new baseline.

## Parity boundary

- Every public Custom Element module retains a matching React component subpath and wrapper.
- React exposes wrapper values and typed props/events; it does not re-export element implementation
  constants, registration functions, tag names, or application semantics.
- Elements owns classes, explicit registration, tag names, component values/guards, and event/detail
  types.
- React wrappers remain thin adaptations over those elements and must not duplicate interaction,
  state, focus, form, accessibility, or rendering behavior.
- Importing either root remains safe without registering Custom Elements as a side effect.

The unequal symbol counts are intentional. Elements exposes detailed framework-neutral contracts;
React presents the smaller idiomatic binding surface.

## Enforcement

The existing package-surface suite now:

1. asks the TypeScript checker for every authored root export name, including type-only names;
2. fingerprints the sorted names for each package;
3. imports each root and fingerprints its runtime keys;
4. retains component-subpath, source-module, declaration-target, and elements/React pairing checks;
   and
5. fails on an unreviewed addition, removal, or rename.

No API-extraction dependency, generated public manifest, runtime code, or packed file is added.

## Remaining component-contract work

This slice freezes names only. Phase 6B must still reconcile each component's attributes,
properties, events, methods, slots, parts, CSS custom properties, values, defaults, form behavior,
registration, React props/events/refs, and documentation. It must also verify emitted declarations
and both root/subpath imports in packed consumers during Phase 6C.

## Project-owner decision requested

Approve the exact elements and React root symbol-name sets and drift policy above. Approval closes
the root-symbol inventory and activates component-contract reconciliation. It does not choose
versions or authorize publication.
