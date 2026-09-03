# Phase 6B component-contract ownership map

**Status:** Accepted by the project owner on September 2, 2026. This record maps every v1 element
and React wrapper to an authoritative contract before field-level reconciliation. It changes no
package version, privacy, registry, or deployment state.

## Decision

Keep the existing documentation architecture: focused Phase 1 component files plus grouped contracts
for later component families. Do not create 64 duplicative component pages merely to match package
subpaths.

The executable ownership map covers every non-CSS `@wayglass/elements` subpath exactly once:

| Contract family             | Authoritative document                             | Elements                                                                                                |
| --------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Phase 1 primitives          | Individual files under `docs/components/`          | button, Boolean value, canvas, elbow, metric, panel, rail, status indicator, theme provider, value tile |
| Tabs                        | `docs/components/tabs.md`                          | tabs, tab list, tab, tab panel                                                                          |
| Foundations                 | `docs/foundations/foundation-contracts.md`         | divider, surface                                                                                        |
| Layout                      | `docs/layout/layout-contracts.md`                  | cluster, frame, grid, scroll region, split, stack                                                       |
| Core controls               | `docs/controls/core-controls.md`                   | icon button, navigation rail, segment, segmented control, toggle                                        |
| Menus and commands          | `docs/controls/menus-and-commands.md`              | command item, menu                                                                                      |
| Form foundation             | `docs/forms/form-foundation.md`                    | field label, field message, form group                                                                  |
| Form controls               | `docs/forms/form-controls.md`                      | checkbox, number field, radio, select, slider, text field                                               |
| Persistent feedback/loading | `docs/feedback/persistent-feedback-and-loading.md` | alert, badge, empty state, offline state, progress, skeleton, stale marker                              |
| Transient feedback          | `docs/feedback/transient-feedback.md`              | toast, toast region                                                                                     |
| Modal feedback              | Confirmation and content-dialog contracts          | confirmation dialog, dialog                                                                             |
| Media                       | Media-content and media-viewer contracts           | media, media viewer                                                                                     |
| Scalar data                 | `docs/data/metrics-and-key-values.md`              | key value, metric group, trend indicator                                                                |
| Telemetry                   | `docs/data/telemetry-strip.md`                     | telemetry strip                                                                                         |
| Status collections          | `docs/data/status-list.md`                         | status entry, status list                                                                               |
| Temporal collections        | `docs/data/temporal-collections.md`                | event log/record, timeline/item                                                                         |
| Filtering and commands      | `docs/data/filter-and-command-patterns.md`         | command bar, filter bar                                                                                 |
| Tables                      | `docs/data/data-table.md`                          | data table                                                                                              |

`docs/frameworks/react.md` owns adaptation rules only. Each React wrapper inherits the mapped
element's semantics, interaction, accessibility, and state contract and cannot create a competing
component contract.

## Enforcement

The documentation test derives the complete element-module set from the package manifest and
requires:

1. every module appears exactly once in the ownership map;
2. every mapped document exists and names the corresponding `wg-*` element;
3. additions or removals fail until ownership is reviewed; and
4. the React contract continues to describe a thin adaptation over Custom Elements.

CSS entry points are already frozen separately and are not components. `wg-icon` remains governed by
the foundation contract and optional icons package rather than the elements manifest.

## Audit result and next work

All current v1 elements have an authoritative contract location. This establishes ownership, not
field-level completeness. Reconciliation now proceeds family by family, comparing implementation,
element declarations, React props/events, documentation, tests, and Storybook for:

- attributes and reflected values;
- properties and defaults;
- events and typed details;
- methods;
- slots and fallback content;
- CSS parts and custom properties;
- keyboard, focus, form, responsive, failure, and accessibility behavior; and
- explicit registration and client-only behavior.

Any mismatch is corrected at the smallest responsible surface before that family is frozen.

## Project-owner decision

On September 2, 2026, the project owner approved and directed the merge of the complete ownership
map and family-by-family reconciliation method. That approval freezes where each component contract
lives and activates the first field-level family audit. It does not freeze component fields, choose
versions, or authorize publication.
