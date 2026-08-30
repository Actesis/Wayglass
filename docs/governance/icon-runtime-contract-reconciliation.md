# `@wayglass/icons` runtime-contract reconciliation

**Status:** Accepted on August 29, 2026 by the project owner.  
**Decision scope:** Reconcile the accepted `wg-icon` foundation contract with the current private
runtime implementation before a permanent icon-tooling contract or architecture decision is
written.  
**Baseline:** `main` at merge commit `4824868`; `@wayglass/icons` remains private at `0.0.0`.

## Decision

The accepted [Phase 2C foundation contract](../foundations/foundation-contracts.md), interpreted
with [ADR 0011](../architecture/adr/0011-foundation-delivery-model.md) and `SPEC.md`, remains the
authoritative runtime contract. The current `@wayglass/icons` source is an incomplete implementation
of that contract; it is not a competing specification.

This decision does not change production code. The next implementation contract and architecture
decision must preserve the reconciled surface below and define how the accepted private tooling
produces it.

**Implementation progress:** Stage 4 completed on August 30, 2026. The root and `/icon` exports
share one side-effect-free implementation over generated inert data, and the accepted name, label,
size, direction, styling, registration, missing-name, and interaction behavior now has unit,
package-boundary, supported-browser, automated accessibility, visual, Storybook, and packed-output
coverage. Exact results and carried manual gates are recorded in the
[Phase 5D icon-runtime validation](../accessibility/phase-5d-icon-runtime-validation.md). Stage 5
repository-validation integration also passed on August 30, 2026, as recorded in the
[icon-tooling validation matrix](/accessibility/phase-5d-icon-tooling-validation). Stage 6 proof
cleanup remains next; the runtime contract is unchanged.

## Reconciled surface

| Surface           | Accepted decision                                                                                                                                                         | Current state and implementation consequence                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Package tier      | `@wayglass/icons` remains an independently versioned optional runtime.                                                                                                    | No foundation package may import or re-export it.                                                                                             |
| Entry points      | `@wayglass/icons/icon` is the component-specific entry. The package root may re-export the same public symbols as a side-effect-free convenience barrel.                  | The root exists; `/icon` must be added without creating a second implementation. Existing private root consumers may remain valid.            |
| Registration      | Imports are side-effect free; `defineWgIcon()` performs explicit, duplicate-safe registration.                                                                            | Preserve the implemented behavior. Generated data and build tooling must not register the element.                                            |
| `name`            | A reviewed catalog identifier is required to render a glyph. Missing or unknown names render nothing.                                                                     | Remove the current implicit `more` glyph default. Preserve the typed name guard.                                                              |
| `label`           | The optional string is the icon's accessible name. A non-empty label exposes one non-focusable image; an absent or empty label makes the icon decorative.                 | Replace unconditional decorative behavior with the accepted labeled/decorative modes. Required control names still belong to owning controls. |
| `size`            | `compact`, `standard`, or `prominent`; default `standard`.                                                                                                                | Use the already accepted component icon-size tokens. Do not preserve untyped inherited `1em` as the attribute default.                        |
| `direction`       | `auto`, `ltr`, or `rtl`; default `auto`. Resolve `auto` from the element's computed writing direction and mirror only catalog records explicitly marked `mirrors-in-rtl`. | Add the property and consume authored direction metadata. Geometry alone must never infer direction.                                          |
| Styling           | Expose the `svg` part and `--wg-icon-color` and `--wg-icon-size`; default color is `currentColor`. Preserve system text color in forced colors.                           | The current SVG is not a public part and does not consume the accepted custom properties. The permanent implementation must correct both.     |
| Interaction       | No focus, events, methods, or slots.                                                                                                                                      | Preserve the inert runtime boundary.                                                                                                          |
| Catalog           | Retain only the reviewed `close`, `menu`, `more`, and `refresh` production names in this work.                                                                            | The proof-only `arrow-inline-start` remains synthetic and cannot enter production through reconciliation.                                     |
| Content safety    | Accept reviewed local catalog records only; reject remote URLs, arbitrary SVG, icon fonts, active content, and externally referenced content.                             | Preserve the current closed catalog and apply the accepted validator before generated output can replace inline geometry.                     |
| Meaning ownership | Icons remain optional reinforcement and cannot be the only source of state, value, action, instructions, or a control name.                                               | Existing owning-control examples remain valid. Applications retain selection, visible text, control names, domain catalogs, and meaning.      |

## Why the contract wins

- `SPEC.md` requires the icon package to support both accessible labeling and decorative usage.
  Removing `label` would violate a governing requirement rather than simplify an optional feature.
- Compact, standard, and prominent icon tokens already exist in the accepted token system. The
  current `1em` behavior bypasses that deliberate size contract.
- Explicit direction is required by Wayglass's logical-layout and RTL rules. Inferring mirroring
  from path geometry would make author intent unreviewable and unsafe.
- A missing `name` must not silently display `more`; a fallback glyph could communicate an action or
  state the application did not request.
- The package is still private at `0.0.0`, so correcting the implementation before release creates
  no public migration obligation.

## Compatibility and implementation limits

The current four glyphs, their visible geometry, explicit registration, Lit dependency, local-only
catalog, and icon-optional consumer behavior remain compatible inputs. The implementation contract
may reorganize source and generated files, but it may not silently add catalog names, widen the SVG
language, add runtime dependencies, register on import, or move application meaning into the icon
package.

The accepted Phase 5D-A proof supplies evidence for structured source, validation, deterministic
generation, drift reporting, and static review. It does not become production merely because this
runtime decision now exists. Proof-only benchmark, synthetic-capacity, browser-measurement, attack,
and removal harnesses remain outside the permanent tooling boundary.

## Deferred and blocked claims

- Permanent tooling and runtime migration are governed by the accepted
  [implementation contract](./icon-tooling-implementation-contract.md) and
  [ADR 0034](../architecture/adr/0034-private-icon-pipeline-architecture.md). Their minimum-
  environment prerequisite passed on Node 22.13/Linux on August 29, 2026, as recorded in the
  [retained evidence](https://github.com/Actesis/Wayglass/blob/main/experiments/phase-5d-icon-tooling/evidence/node-22-linux-validation.md).
- Permanent implementation acceptance still requires every later validation stage in the accepted
  implementation contract; satisfying the prerequisite does not approve the finished tool.
- A public contribution workflow requires an independent contributor task.
- Phase 5D-B design-library work is deferred by the project owner. It may restart only with a named
  Figma workspace, access model, exact supported versions, reviewer, backup policy, version linkage,
  and drift plan.
- Package publication remains governed by the separate release decision.

This reconciliation authorizes no production source change, package publication, Figma work, or new
support claim.
