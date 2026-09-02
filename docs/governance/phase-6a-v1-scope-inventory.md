# Phase 6A proposed v1 scope inventory

**Status:** Accepted by the project owner on September 2, 2026. This inventory completes the Phase
6A package-disposition decision and activates Phase 6B stabilization. It does not change a package
version or privacy field, publish to npm, create a tag or workflow, change repository visibility,
deploy documentation, or claim support beyond completed evidence.

## Recommendation

Release six packages as Wayglass v1:

1. the synchronized foundation family: `@wayglass/core`, `@wayglass/tokens`, `@wayglass/themes`, and
   `@wayglass/elements`;
2. the independently versioned `@wayglass/icons` optional runtime; and
3. the independently versioned `@wayglass/react` framework binding.

Keep `@wayglass/testing` private for v1. Its complete surface is four frozen viewport constants and
one derived type. The application-validation boundary found no additional helper ready for
promotion, and an independent supported package would add more maintenance and compatibility surface
than consumer value.

This is a scope proposal, not a version proposal. Initial SemVer values and dist-tags are selected
after Phase 6B closes the blockers below.

## Package dispositions

| Package                   | Tier and release unit                     | V1 proposal | Current public intent                                                                                   | Required Phase 6B work                                                                                                        |
| ------------------------- | ----------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `@wayglass/core`          | Foundation family                         | Include     | State-axis, section-purpose, Boolean-value, and control-request vocabularies, guards, and types         | Metadata, README, explicit side-effect decision, supported-environment record                                                 |
| `@wayglass/tokens`        | Foundation family                         | Include     | Authored token definitions plus CSS, JSON, TypeScript, validation, and compiler exports                 | Confirm compiler stability; metadata, README, side effects, artifact authority and compatibility record                       |
| `@wayglass/themes`        | Foundation family                         | Include     | Theme/density definitions, selection helpers, CSS generation, and official theme stylesheet             | Reconcile `phase1` names before v1; metadata, README, compatibility and side-effect record                                    |
| `@wayglass/elements`      | Foundation family                         | Include     | Production Custom Elements, explicit registration functions, types, stylesheets, and component subpaths | Public-symbol freeze, metadata, README, manual AT gates or narrower claims, lifecycle scripts, peer/dependency ranges         |
| `@wayglass/icons`         | Optional runtime, independent             | Include     | Accessible `wg-icon`, typed built-in names, icon definitions, and explicit registration                 | Exact foundation relationship, catalog/compatibility record, metadata, README, source/license notice decision                 |
| `@wayglass/react`         | Framework binding, independent            | Include     | Typed wrappers, props, custom-event callbacks, refs, and component subpaths over elements               | Constrain React support to tested 19.x; client-only/SSR-safe-import record, metadata, README, peer ranges and parity evidence |
| `@wayglass/testing`       | Build and validation tooling, independent | Exclude     | Private `wayglassViewports` and `WayglassViewport` only                                                 | Remain private until at least two consumers demonstrate a supported public-helper need                                        |
| `@wayglass/eslint-config` | Repository build tooling                  | Exclude     | Repository lint policy                                                                                  | Remain private until separately chartered; no consumer contract exists                                                        |

## Exact package entry-point baseline

The following package-manifest exports are the Phase 6A baseline. Phase 6B may remove or rename an
entry only through a reviewed correction and migration note.

### `@wayglass/core`

```text
.
```

The root exports condition, knowledge, activity, known-state, section-purpose, Boolean-value,
control-availability, request-state, and Boolean-request constants, guards, converters, and types.

### `@wayglass/tokens`

```text
.
./tokens.css
./tokens.json
```

The root exports token definitions and types plus `createCss`, `createJson`,
`tokenNameToCssCustomProperty`, and `validateTokens`. Phase 6B must decide whether those compiler
helpers are stable runtime API or should move before the first release.

### `@wayglass/themes`

```text
.
./themes.css
```

The root exports official theme and density names, overrides, guards, system-theme resolution,
types, and `createThemeCss`. Names containing `phase1` are implementation history in a proposed
public API and must be corrected or explicitly justified before scope freeze.

### `@wayglass/elements`

```text
.
./alert
./badge
./boolean-value
./button
./canvas
./checkbox
./cluster
./command-bar
./command-item
./confirmation-dialog
./data-table
./data-table.css
./dialog
./divider
./elbow
./empty-state
./event-log
./event-record
./field-label
./field-message
./filter-bar
./form-group
./forms.css
./foundations.css
./frame
./grid
./icon-button
./key-value
./media
./media.css
./media-viewer
./media-viewer.css
./menu
./metric
./metric-group
./navigation-rail
./number-field
./offline-state
./panel
./progress
./radio
./rail
./scroll-region
./segment
./segmented-control
./select
./skeleton
./slider
./split
./stack
./stale-data-marker
./status-entry
./status-indicator
./status-list
./surface
./tab
./tab-list
./tab-panel
./tabs
./telemetry-strip
./text-field
./theme-provider
./timeline
./timeline-item
./toast
./toast-region
./toggle
./trend-indicator
./value-tile
```

Each component entry exposes its element class, tag name, explicit `defineWg*` registration
function, applicable values and guards, and documented public types. The root also exposes
`defineElement`. CSS entry points are intentional style side effects; JavaScript imports must remain
registration-side-effect free.

### `@wayglass/icons`

```text
.
./icon
```

Both entry points expose the accepted icon element contract, explicit registration, catalog names
and definitions, guards, and types. Phase 6B must decide whether the duplicate entry points are both
necessary public API.

### `@wayglass/react`

```text
.
./alert
./badge
./boolean-value
./button
./canvas
./checkbox
./cluster
./command-bar
./command-item
./confirmation-dialog
./data-table
./dialog
./divider
./elbow
./empty-state
./event-log
./event-record
./field-label
./field-message
./filter-bar
./form-group
./frame
./grid
./icon-button
./key-value
./media
./media-viewer
./menu
./metric
./metric-group
./navigation-rail
./number-field
./offline-state
./panel
./progress
./radio
./rail
./scroll-region
./segment
./segmented-control
./select
./skeleton
./slider
./split
./stack
./stale-data-marker
./status-entry
./status-indicator
./status-list
./surface
./tab
./tab-list
./tab-panel
./tabs
./telemetry-strip
./text-field
./theme-provider
./timeline
./timeline-item
./toast
./toast-region
./toggle
./trend-indicator
./value-tile
```

Each component subpath exposes the wrapper and typed props, plus typed event aliases where the
component emits public custom events. The root also exposes `WayglassCustomEvent` and
`WayglassEventHandler`. React wrappers do not own component behavior.

## Component-family disposition

All currently implemented element and matching React-wrapper families are proposed for v1 because
they have accepted contracts, documentation, Storybook or application fixtures, unit/component
coverage, and integrated cross-engine evidence:

| Family                   | Included elements                                                                                                                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundations and layout   | canvas, cluster, divider, elbow, frame, grid, panel, rail, scroll region, split, stack, surface, theme provider                                                                              |
| State and feedback       | alert, badge, Boolean value, empty state, offline state, progress, skeleton, stale-data marker, status indicator, toast, toast region                                                        |
| Controls and forms       | button, checkbox, confirmation dialog, dialog, field label, field message, form group, icon button, menu, number field, radio, segmented control/segment, select, slider, text field, toggle |
| Selection and navigation | navigation rail, tabs, tab list, tab, tab panel                                                                                                                                              |
| Operational data         | command bar/item, data table, event log/record, filter bar, key value, metric/group, status list/entry, telemetry strip, timeline/item, trend indicator, value tile                          |
| Media                    | media and media viewer                                                                                                                                                                       |

This proposal does not imply that every component has identical browser, assistive-technology, or
form-association support. Phase 6B must make limitations visible rather than silently widening a
family claim.

## Evidence basis

- Phase 1 through Phase 4 contracts and validations cover the semantic model, layout, controls,
  forms, feedback, media, operational data, React adaptation, reference compositions, responsive
  behavior, and accessibility procedures.
- Phase 5G's clean matrix built every production package and ran 1,506 browser cases across
  Chromium, Firefox, and WebKit: 1,458 passed, 48 documented Chromium-only cases were intentionally
  skipped in Firefox/WebKit, and none failed.
- Phase 5G inspected all seven candidate tarballs and confirmed that declared export targets and
  types were present, imports did not register elements, no lifecycle install hooks existed, and no
  private tooling or provider runtime entered production packages.
- Phase 5D validated the icon runtime and generated catalog boundary; icon tooling remains private.
- React remains the accepted first-class binding. The repository contains no evidence supporting an
  additional framework binding.

These results support candidate selection. They are not the clean, exact-version release evidence
required by Phase 6C.

## Proposed compatibility and support scope

| Area          | Proposed v1 claim                                                                                                                                              | Current limitation or blocker                                                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browsers      | Current stable Chromium, Firefox, and Safari/WebKit at release freeze                                                                                          | Exact versions must be recorded and full candidate matrix repeated                                                                                                                |
| Rendering     | Direct Custom Elements and client-rendered React; browser-safe imports                                                                                         | No SSR rendering or hydration claim; React safe-import behavior must be recorded precisely                                                                                        |
| React         | React 19.x                                                                                                                                                     | Manifest currently says `>=19`, which promises untested future majors                                                                                                             |
| TypeScript    | Generated declarations compatible with the release's recorded supported range                                                                                  | Minimum supported TypeScript version is not yet selected or tested                                                                                                                |
| Node          | No Node runtime required by browser packages; documented Node range for build-time JS APIs                                                                     | Token/theme compiler exports make a build-time Node support decision necessary                                                                                                    |
| Accessibility | WCAG 2.2 AA design and implementation target, automated Axe/cross-engine evidence, keyboard, focus, forced-colors, reduced-motion, RTL, and 200% text coverage | Complete representative VoiceOver/Safari and NVDA/Firefox results are required for broad desktop screen-reader compatibility claims; iOS VoiceOver required for a mobile AT claim |
| Devices       | Responsive contracts and automated phone, tablet, desktop, and wall fixtures                                                                                   | No low-power physical-device performance claim until observed evidence exists                                                                                                     |
| Forms         | Browser-native semantics with documented form participation and limitations                                                                                    | Real-profile autofill/password-manager observation remains incomplete                                                                                                             |

The release can describe tested behavior narrowly; it cannot turn an open manual gate into an
inferred support claim by labeling v1 experimental.

## Excluded artifacts and claims

The following remain private or absent from v1:

- `@wayglass/testing`, `@wayglass/eslint-config`, token interchange tooling, icon pipeline tooling,
  the retained native visualization proof, and all repository scripts;
- VitePress, Storybook, examples, Phase 4 reference applications, fixtures, scenario engines,
  reducers, adapters, routes, clocks, schedulers, and validation harnesses as npm units;
- a chart package or public visualization API;
- Home Assistant or any provider integration/runtime/compatibility claim;
- Figma or another design-tool library;
- Vue, Svelte, Angular, or another framework binding;
- SSR/hydration, PWA, Electron, Tauri, embedded-webview, kiosk, or production-deployment support
  beyond evidence explicitly admitted during Phase 6B;
- public token or icon contribution tooling; and
- any SpaceTraders code, contract, fixture, repository, deployment, or privileged requirement.

Documentation and Storybook are proposed public learning surfaces under Phase 6D/F, never npm
release units.

## Required Phase 6B corrections

1. Replace or justify history-bearing `phase1` theme API names before the first public freeze.
2. Decide whether token compiler helpers and duplicate icon entry points belong in stable v1.
3. Freeze every root symbol, subpath, stylesheet, Custom Element tag, event, slot, part, property,
   attribute, token, theme, icon name, and React prop/event type against authored contracts.
4. Add complete package descriptions, homepage, repository, keywords, author/contributor,
   compatibility/engine, funding decision, publish configuration proposal, README, support,
   security, license, notice, and migration metadata.
5. Add Apache-2.0 `LICENSE` and `NOTICE` to each proposed tarball and decide source-map/source-file
   inclusion deliberately.
6. Replace publish-time `workspace:*` ranges with accepted SemVer ranges and verify the synchronized
   foundation family plus independent icon/React compatibility.
7. Remove repository-only scripts from packed manifests or make every retained package command work
   after installation.
8. Declare side effects explicitly for core and tokens and re-audit all CSS/runtime declarations.
9. Constrain React to tested 19.x and select a TypeScript compatibility range.
10. Complete required VoiceOver/Safari and NVDA/Firefox procedures or narrow the corresponding
    public support language; retain the iOS and physical-device limitations unless observed.
11. Create changelog, migration, deprecation, security-reporting, support, and release-note
    baselines for the exact proposed packages.
12. Run the complete affected automated, browser, manual, visual, package, dependency, license,
    security, and documentation matrix before accepting the scope-freeze commit.

## Project-owner decision

On September 2, 2026, the project owner approved and directed the merge of:

1. the six-package v1 release scope;
2. exclusion of `@wayglass/testing` and all other named private artifacts;
3. React 19.x, current stable browser engines at release freeze, and client-rendered/direct-element
   scope as the proposed compatibility baseline;
4. the rule that missing manual evidence narrows claims or blocks affected surfaces rather than
   being inferred; and
5. the Phase 6B correction list as the only authorized stabilization scope.

That acceptance passes the Phase 6A package-disposition portion of `P6-E01` and activates Phase 6B
planning. It does not yet freeze exact public symbols, approve versions, or authorize publication.
