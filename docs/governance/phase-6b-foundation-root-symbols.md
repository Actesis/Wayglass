# Phase 6B foundation and icon root-symbol freeze

**Status:** Proposed on September 2, 2026. This record freezes the exact root symbols for four v1
packages. It changes no package version, privacy, registry, or deployment state.

## Accepted candidate surface proposed for freeze

| Package                                      | Runtime exports                                                                                                                                                                                                                                                                                                                                                       | Type-only exports                                                                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@wayglass/core`                             | `activities`, `booleanRequests`, `booleanValueStates`, `conditions`, `controlAvailabilities`, `defaultKnownState`, `isActivity`, `isBooleanRequest`, `isBooleanValueState`, `isCondition`, `isControlAvailability`, `isKnowledge`, `isKnownState`, `isRequestState`, `isSectionPurpose`, `knowledgeStates`, `requestStates`, `sectionPurposes`, `toBooleanValueState` | `Activity`, `BooleanRequest`, `BooleanValueState`, `Condition`, `ControlAvailability`, `Knowledge`, `KnownState`, `RequestState`, `SectionPurpose` |
| `@wayglass/tokens`                           | `createCss`, `createJson`, `tokenNameToCssCustomProperty`, `tokenTypes`, `tokens`, `validateTokens`                                                                                                                                                                                                                                                                   | `TokenDefinition`, `TokenName`, `TokenPrimitive`, `TokenType`                                                                                      |
| `@wayglass/themes`                           | `createThemeCss`, `densityNames`, `densityTokenOverrides`, `isDensityName`, `isThemeName`, `isThemeSelectionName`, `resolveSystemTheme`, `themeNames`, `themeSelectionNames`, `themeTokenOverrides`                                                                                                                                                                   | `DensityName`, `ThemeName`, `ThemeSelection`, `ThemeSelectionName`                                                                                 |
| `@wayglass/icons` and `@wayglass/icons/icon` | `WgIcon`, `defineWgIcon`, `iconDirections`, `iconNames`, `iconSizes`, `isIconDirection`, `isIconName`, `isIconSize`, `wgIconTagName`                                                                                                                                                                                                                                  | `IconDirection`, `IconName`, `IconSize`                                                                                                            |

The runtime tests assert the exact export-name sets. The icon test also proves that root and
component specifiers expose the same class and registration function. Existing TypeScript builds and
consuming declarations exercise the named type-only exports; the final packed-candidate audit must
verify them in emitted declarations.

## Boundary decisions

- Core exports only domain-neutral semantic vocabularies, guards, and Boolean conversion. It owns no
  application records, stores, commands, routing, or provider logic.
- Tokens exposes authored definitions and the previously accepted pure generation helpers. Private
  normalized exchange and filesystem tooling remains absent.
- Themes exposes only implemented dark/light themes and compact/comfortable densities. Planned
  themes are documentation, not selectable names or package symbols.
- Icons exposes one optional Custom Element and its reviewed local catalog types. Imports remain
  side-effect free and registration remains explicit.
- Adding a runtime or type symbol before final scope freeze requires updating this record, the
  relevant contract, tests, documentation, and migration assessment in one review.
- Removing or renaming a symbol follows the same review and must explain why the pre-v1 correction
  is necessary.

## Remaining freeze work

This slice does not freeze:

- the much larger `@wayglass/elements` and `@wayglass/react` root symbol sets;
- inner component attributes, properties, events, methods, slots, parts, and CSS variables;
- the 528 token identities and official override values;
- the implemented theme/density value sets beyond their exported names;
- the four-icon catalog identities and SVG data; or
- versions, dependency ranges, support claims, or packed contents.

Those remain explicit Phase 6B/6C gates rather than being inferred from this approval.

## Validation

- Exact runtime export tests for core, tokens, themes, and both icon specifiers.
- Existing semantic, token generation, contrast, icon behavior, package-boundary, and TypeScript
  tests remain unchanged and must pass with the surface assertions.
- No new dependency or extraction tool is introduced.

## Project-owner decision requested

Approve the exact runtime and type-only symbol sets above. Approval freezes these four package roots
for the remaining Phase 6B work and activates the elements/React symbol audit. It does not choose
versions or authorize publication.
