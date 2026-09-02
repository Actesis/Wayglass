# Phase 6B utility and icon entry-point review

**Status:** Accepted by the project owner on September 2, 2026. This record resolves the second
correction identified by the accepted Phase 6A scope inventory. It changes no package version,
privacy, registry, or deployment state.

## Decision

Retain the existing pure token and theme generation helpers as v1 public API:

```text
@wayglass/tokens
  createCss
  createJson
  tokenNameToCssCustomProperty
  validateTokens

@wayglass/themes
  createThemeCss
```

Retain both icon entry points:

```text
@wayglass/icons
@wayglass/icons/icon
```

`@wayglass/icons/icon` remains the canonical component-specific import. The package root remains a
side-effect-free convenience barrel that re-exports exactly the same module.

## Token-helper boundary

The retained functions are deterministic, in-memory transforms over authored definitions. They do
not read or write files, inspect Git, acquire locks, access the network, use credentials, register
Custom Elements, or import private tooling.

They support application and build-system use cases that do not require Wayglass's private
repository generator:

- generate CSS or flat JSON from an accepted token-definition record;
- validate references before consuming a token record;
- map a semantic token name to its stable `--wg-` CSS property; and
- generate official theme/density CSS from the current authored definitions.

The private `tooling/token-interchange` system remains the only repository artifact that owns
filesystem output, normalized exchange graphs, manifests, fingerprints, content-addressed releases,
writer locking, source authentication, and DTCG-candidate exchange files. It is not re-exported,
packed, or supported through `@wayglass/tokens` or `@wayglass/themes`.

This line follows ADR 0033 and its completed migration record, which deliberately retained the pure
helpers as compatibility surfaces while removing the superseded package-local writers.

## Icon-entry boundary

Both icon specifiers resolve to the same `WgIcon`, `defineWgIcon`, tag name, catalog values, guards,
and public types. The root contains only:

```ts
export * from './icon.js';
```

Therefore the convenience path adds no second implementation, registration behavior, catalog, global
state, dependency, or accessibility contract. Importing either path remains side-effect free;
registration requires `defineWgIcon()`.

The component-specific entry is preferred in documentation because it communicates intent and
matches the element package's subpath pattern. The root path remains useful for concise imports and
does not prevent tree shaking of the current single-component package.

If the optional runtime later gains materially independent icon modules, the root barrel's bundle
cost must be measured again. V1 does not speculate about such growth.

## Alternatives rejected

### Remove all generation helpers

Rejected. It would contradict the accepted token migration boundary and remove small pure APIs that
support application-owned output without exposing private filesystem machinery.

### Publish private token tooling through the token package

Rejected. It would enlarge the foundation runtime with Node-specific effects, repository policy,
exchange-format support, locking, and maintenance obligations that lack external-consumer evidence.

### Keep only the icon root

Rejected. The component-specific path is the documented canonical import and aligns with other
Wayglass component packages.

### Keep only `@wayglass/icons/icon`

Rejected for v1. The root barrel is already documented, tested, side-effect free, and used by
Storybook. Removing it would provide no present isolation or bundle benefit.

## Contract and validation requirements

Phase 6B and 6C must preserve:

1. token helpers exported from the package root with declarations in the packed artifact;
2. deterministic output and rejection of missing references;
3. exact generated CSS/JSON parity with authenticated repository output;
4. no filesystem, network, environment, telemetry, credential, or registration effect on import or
   invocation;
5. both icon specifiers resolving to the same public symbols and implementation;
6. no automatic `wg-icon` registration from either specifier;
7. explicit documentation that private exchange tooling and formats are not public package API;
8. package-content, side-effect, bundle, type, and clean-consumer checks for the final versions; and
9. a new review if additional icon modules make the root barrel materially broader.

The token tests now consume the helpers through `src/index.ts`, exercising the proposed public root
surface rather than bypassing it through the private source module.

## Release implications

- The helpers and icon paths enter the exact symbol/subpath freeze in the next Phase 6B work.
- Their documentation and README examples must distinguish runtime artifacts, pure transforms, and
  private repository tooling.
- The token/theme helpers need a selected Node and TypeScript compatibility floor when used during a
  consumer build, even though the generated browser artifacts have no Node runtime requirement.
- The icon root and subpath remain one independently versioned optional-runtime release unit.

## Project-owner decision

On September 2, 2026, the project owner approved and directed the merge of the five pure helper
functions and both icon specifiers under the boundaries above. That approval closes Phase 6A
correction item 2 and authorizes their inclusion in the exact v1 public-surface freeze. It does not
approve versions or publication.
