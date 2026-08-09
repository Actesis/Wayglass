# Phase 3G data-table contract

**Status:** Accepted for Phase 3G on August 9, 2026. This contract defines the public boundary for
`wg-data-table`, and its required public token vocabulary is locked. Framework-neutral and React
implementation, reference stories, and validation remain to be completed.

The contract follows the accepted [operational-data ownership contract](./operational-data.md),
[Phase 3 validation plan](../accessibility/phase-3-validation-plan.md),
[layout contracts](../layout/layout-contracts.md), and
[ADR 0024](../architecture/adr/0024-operational-data-ownership-and-updates.md). Its architecture is
recorded in accepted
[ADR 0028](../architecture/adr/0028-native-data-table-and-contained-overflow.md).

## Purpose

`wg-data-table` presents a consumer-authored native table inside a stable Wayglass boundary and
reuses the accepted `wg-scroll-region` for contained inline overflow. It gives operational tables a
consistent visual surface, responsive containment, optional context and feedback placement, and a
typed framework entry point without becoming a spreadsheet grid or data engine.

The table remains native HTML. Captions, headers, rows, cells, sorting controls, row actions, and
compound cell content remain consumer-authored light DOM and retain useful semantics before Custom
Element registration.

## When to use

Use `wg-data-table` when people need to compare repeated records across stable named fields, such
as:

- operational inventory and status records;
- task, request, or review queues;
- audit-like event summaries where column comparison is more important than narrative chronology;
- sparse or dense reference data with row-specific actions; and
- wide data whose column relationships must remain intact at narrow widths.

Use a status list when each record is primarily a named state summary. Use a timeline or event log
when temporal sequence is the dominant relationship. Use key-value or metric groups when the values
do not form repeated records.

## When not to use

Do not use `wg-data-table` for:

- page layout or alignment of unrelated content;
- a card collection silently reshaped to look tabular;
- a spreadsheet, tree grid, pivot table, or generic editable grid;
- package-owned querying, sorting, filtering, grouping, aggregation, or data transport;
- package-owned selection meaning, pagination, virtualization, column persistence, or export; or
- a record set whose important relationships cannot be expressed with native table headers.

Inline editing, frozen columns, column resizing or reordering, drag-and-drop rows, hierarchical
rows, and cell-range interaction require separate evidence and review.

## Anatomy

One `wg-data-table` contains:

1. an optional `context` slot for a visible result count, scope, freshness statement, or concise
   interaction instruction;
2. exactly one direct consumer-authored `wg-scroll-region` with `axis="inline"` in the default slot;
3. exactly one direct native `<table>` inside that scroll region; and
4. an optional `feedback` slot after the scroll region for application-authored loading, empty,
   stale, partial, unavailable, failure, or recovery context.

The native table contains its own visible `<caption>`, header cells, row groups, rows, data cells,
and any authored controls. `wg-data-table` does not generate, clone, move, or repair those nodes.

The scroll region's required `label` names the overflow boundary when it becomes scrollable. The
native caption names the table. Applications normally use closely aligned wording for both, but
neither component copies the caption into Shadow DOM or makes an ID reference cross a shadow
boundary.

Unsupported default or named-slot content remains visible and produces one stable development
diagnostic. Diagnostics never turn the component into a table validator or hide authored content.

## Native table structure

Every table requires a visible caption that identifies its record set and scope. Use native
structure directly:

- `<caption>` for table identity and concise scope;
- `<thead>`, `<tbody>`, and `<tfoot>` when those row groups clarify structure;
- `<th scope="col">` for ordinary column headers;
- `<th scope="row">` for a record's stable row header;
- `scope="colgroup"` or `scope="rowgroup"` for straightforward grouped headers; and
- explicit `id` and `headers` relationships when irregular or multi-level structure cannot be
  represented accurately with `scope` alone.

Do not add ARIA table, row, or cell roles to ordinary native table elements. CSS layout must not
change the visual sequence away from DOM and accessibility-tree order. `display: grid`,
`display: contents`, flex ordering, and card transforms are not part of the supported table pattern.

At least one stable identifying column should use row headers when row actions or repeated values
make record context otherwise difficult to recover. A row header is not a package identity key;
applications still own durable data identity and keyed DOM continuity.

## Cell content

Cells may contain concise text, native time, accepted state and scalar components, links, details,
buttons, or one flat command menu when that content remains understandable in both row and column
context.

Cell content must:

- keep condition, knowledge, activity, and domain value independent;
- include visible text for state rather than relying on color, shape, or an icon alone;
- wrap where wrapping does not destroy comparison;
- preserve the full value through visible text or deliberate disclosure when truncation is accepted;
- avoid nested tables unless a separately reviewed information structure requires them; and
- avoid turning every cell into an interactive stop.

Numeric columns may use tabular numerals and logical end alignment. Alignment never becomes the only
indication of value type or meaning.

## Sorting

Sorting remains application-owned. A sortable column places an authored native button or accepted
Wayglass command control inside its column header. Activating that control emits its existing native
or typed intent; `wg-data-table` emits no aggregate sort event and does not reorder rows.

The currently sorted header uses `aria-sort="ascending"`, `aria-sort="descending"`, or `other` when
that value is accurate. Omit `aria-sort` from headers that do not currently define the table order;
do not place `aria-sort="none"` on every sortable column. Visible wording or a non-color visual cue
must make the current direction and next available action understandable.

After an accepted sort, the application reorders the existing keyed row nodes where practical,
updates the relevant `aria-sort` owner, and writes any deliberate result summary. It preserves focus
on the activated sort control. Programmatic sorting emits no user-intent event and does not move
focus or scroll.

## Row actions

Row actions remain native controls or accepted Wayglass command components authored in a column with
a meaningful visible header such as “Actions.” Every action name includes the action, owning record,
and consequential target scope when the row header does not provide reliable standalone context.

Primary actions remain visible when the task requires them. A flat overflow menu contains only
commands that remain secondary at every supported width; responsive changes do not duplicate or
migrate commands. Consequential actions continue to use the accepted proportional-friction and
confirmation contracts.

Removing a focused row is application-owned. Before removal, the application moves focus to a
documented continuation target such as the next retained row action, the previous retained row
action, the relevant sort control, or a result-level recovery action. `wg-data-table` does not infer
that task decision.

## Loading, empty, stale, and unavailable states

State is authored rather than inferred from row count, elapsed time, or network activity.

- **Initial loading:** the application may hide the table and place a clearly scoped progress or
  skeleton composition in `feedback`. The feedback must name the table scope because its caption is
  not visible.
- **Refresh with retained data:** keep the table and focusable descendants visible, set
  `aria-busy="true"` on the smallest stable owner, and place durable retained-data wording in
  `feedback`. Busy state does not make the table a live region.
- **Empty:** retain the caption and header structure with an empty `<tbody>`, then place the empty
  explanation and recovery action in `feedback`. Do not fabricate a data row solely to hold an
  empty-state message.
- **Stale or partial:** retain valid rows and state what remains current, incomplete, or uncertain.
  State is not inferred from cell color.
- **Unavailable or failed:** state what could not be loaded, whether retained data remains valid,
  and the available retry or alternate path.
- **Recovery:** restore or update the existing table without moving unrelated focus or forcing the
  scroll position.

The wrapper, scroll region, and table create no implicit `aria-live`, `role="status"`, or
`role="alert"`. Applications use one deliberate result or feedback owner when an update warrants an
announcement.

## Responsive and overflow behavior

The table retains one native tabular representation at every width. Narrow layouts use contained
inline scrolling; they do not transform rows into cards, hide columns without an explicit
application decision, duplicate a second mobile table, or create a visually reordered reading
sequence.

The consumer-authored `wg-scroll-region` uses `axis="inline"` and owns overflow measurement,
conditional focusability, region labeling, focus treatment, scrollbar containment, and dynamic
resynchronization. The data-table wrapper does not add an observer, overflow state, region, or focus
stop. Keeping the primitive explicit also avoids hidden registration and nested slot-forwarding
behavior.

At 320 CSS pixels and 200% text:

- the page itself must not overflow because of the table;
- the caption, context, and feedback wrap without truncation;
- the scroll boundary and current inline position remain discoverable;
- native table relationships and authored control order remain unchanged; and
- primary row or table actions remain reachable without relying on hover.

Direction changes logical alignment and the inline scroll origin, not column order or semantic
priority. Touch, pointer, keyboard, browser zoom, and assistive-technology navigation retain their
native responsibilities.

## Sticky headers

The initial package does not add a `sticky-header` attribute or package-owned sticky behavior.
Native sticky positioning depends on single- versus multi-row headers, border models, scroll
container geometry, zoom, forced colors, and application chrome. Shadow CSS also cannot safely style
consumer-authored descendant header cells without an opt-in document stylesheet.

An application may author ordinary sticky CSS for a known table. Phase 3G fixtures will verify one
representative authored sticky header inside the accepted scroll boundary, but that evidence does
not create a public component API. A future package option requires repeated deployment evidence and
a contract for grouped headers, offsets, boundaries, and adaptive modes.

## Styling and the explicit native-table stylesheet

The component's Shadow DOM styles only its own base, context, scroll, and feedback layout. Native
caption, header, row, and cell presentation requires an explicitly imported companion stylesheet:

```css
@import '@wayglass/elements/data-table.css';
```

This follows the existing native-form stylesheet precedent. A document stylesheet is necessary
because Shadow DOM deliberately cannot reach through the slotted `<table>` to style its descendant
caption, headers, rows, and cells. The stylesheet remains opt-in, token-backed, limited to direct
native table descendants of `wg-data-table`, and never changes semantic display roles.

The locked public CSS custom properties are:

- `--wg-data-table-color-background`
- `--wg-data-table-color-table-background`
- `--wg-data-table-color-border`
- `--wg-data-table-color-row-separator`
- `--wg-data-table-color-caption`
- `--wg-data-table-color-header`
- `--wg-data-table-color-text`
- `--wg-data-table-color-context`
- `--wg-data-table-radius`
- `--wg-data-table-space`
- `--wg-data-table-space-group`
- `--wg-data-table-space-cell-block`
- `--wg-data-table-space-cell-inline`

Background, table surface, structural boundaries, and text roles resolve through existing semantic
color tokens. Edge, group, and logical cell spacing respond to the inherited compact or comfortable
density. Focus and overflow presentation continue to use the existing scroll-region tokens. Private
mechanical constants are allowed only for intrinsic table-layout details that do not express theme
or brand intent.

## Accessibility and keyboard interaction

The native table owns table navigation and browse-mode relationships. `wg-data-table` adds no grid
keyboard model, roving focus, cell selection, arrow-key navigation, or application shortcut.

When inline overflow exists, the authored `wg-scroll-region` becomes one named focus stop. Arrow
keys and platform scrolling commands scroll that region while it owns focus. Tab then follows
authored interactive descendants in DOM order. When a sort button, row action, link, select, or menu
owns focus, its existing keyboard model applies unchanged.

Required validation includes:

- visible caption and named overflow region;
- column, row, grouped, and explicit complex-header relationships;
- sparse, dense, wide, and compound cell content;
- ordinary and sorted tables with stable focus;
- row actions and consequential confirmation;
- empty, initial loading, retained refresh, stale, partial, unavailable, failed, and recovered data;
- replacement of 20 rows while an unaffected authored action remains focused;
- one 200-row by 20-column reference envelope;
- dark and light themes, compact and comfortable density, 320 CSS pixels, 200% text, RTL, forced
  colors, grayscale, reduced motion, touch, and supported browser engines;
- Axe scans and explicit absence of implicit live regions; and
- representative VoiceOver/Safari and NVDA/Firefox review before public release.

## API

### Element

`wg-data-table`

### Attributes and properties

None. The direct `wg-scroll-region` retains its own required `axis="inline"` and nonempty `label`
API. `wg-data-table` does not mirror or override that ownership.

The element has no `label`, `rows`, `columns`, `schema`, `data`, `sort`, `selection`, `loading`,
`empty`, `busy`, `pagination`, `virtualization`, `sticky`, or `editable` API. Applications may
author native `aria-busy` and other applicable state directly on the smallest stable owner.

### Slots

- default: exactly one direct `wg-scroll-region[axis="inline"]` containing exactly one direct native
  `<table>`;
- `context`: optional visible result scope, count, freshness, or instruction before the scroll
  boundary; and
- `feedback`: optional application-owned loading, empty, retained, stale, partial, unavailable,
  failure, or recovery context after the scroll boundary.

### Events and methods

None. Native clicks, input, change, submit, and existing typed Wayglass command events bubble
unchanged from authored controls. Programmatic content updates remain silent.

### CSS parts

- `base`
- `context`
- `feedback`

The authored scroll region retains its own public parts and tokens. Native table descendants are
styled through the explicit companion stylesheet rather than Shadow Parts.

## Example

```html
<wg-data-table>
  <p slot="context">20 records shown; sorted by most recent update.</p>
  <wg-scroll-region axis="inline" label="Operational review records table">
    <table>
      <caption>
        Operational review records
      </caption>
      <thead>
        <tr>
          <th scope="col" aria-sort="descending">
            <button type="button">Updated, newest first</button>
          </th>
          <th scope="col">Record</th>
          <th scope="col">Condition</th>
          <th scope="col">Knowledge</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><time datetime="2026-08-09T14:24:18-07:00">2:24 PM</time></td>
          <th scope="row">Review WG-1842</th>
          <td>Condition: Caution</td>
          <td>Knowledge: Confirmed</td>
          <td><button type="button">Inspect Review WG-1842</button></td>
        </tr>
      </tbody>
    </table>
  </wg-scroll-region>
  <p slot="feedback">All shown records are current.</p>
</wg-data-table>
```

Consumers explicitly register the data-table element, scroll region, and any authored Wayglass
controls. Importing any module alone has no registration side effect, and `defineWgDataTable()` does
not silently register the authored scroll region.

## Deferred and excluded behavior

The following remain application-owned or separately deferred:

- schemas, fetching, querying, filtering, sorting, grouping, aggregation, and formatting;
- selection meaning, bulk actions, pagination, infinite loading, virtualization, and retention;
- inline editing, validation, undo, optimistic updates, and conflict resolution;
- column hiding, persistence, resizing, reordering, pinning, and frozen columns;
- export, print policy, clipboard integration, keyboard shortcuts, and command palettes;
- tree grids, expandable hierarchical rows, pivot tables, and spreadsheet cell interaction; and
- a package-owned sticky-header option.

These are compatible future capabilities only when production evidence establishes a reusable
semantic, focus, responsive, and ownership contract.

## Accepted decisions

1. Keep one consumer-authored native table as the sole tabular semantic owner.
2. Require an explicit direct `wg-scroll-region` rather than duplicating overflow observers, focus
   behavior, region semantics, registration, or slot forwarding.
3. Keep caption, headers, rows, cells, sorting controls, actions, state, and mutation in light DOM.
4. Keep sorting, selection, paging, virtualization, editing, persistence, and export
   application-owned.
5. Provide context and feedback placement without inferring loading or empty state.
6. Use one explicitly imported, token-backed native-table stylesheet because Shadow DOM cannot style
   slotted descendant cells safely.
7. Preserve native table relationships through responsive overflow; never transform to cards or a
   second mobile representation.
8. Defer package-owned sticky headers until grouped-header and adaptive-mode evidence supports a
   stable option.

This accepted contract authorizes the element, React, story, and validation slices. The API and
required token vocabulary are locked; the remaining slices implement and validate them without
silently widening ownership.
