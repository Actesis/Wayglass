# ADR 0028: Preserve one native table inside the accepted scroll boundary

- Status: accepted
- Date: 2026-08-09

## Context

Phase 3G must present sparse, dense, wide, dynamic, and actionable operational records while
retaining correct caption, header, row, and cell relationships. It must remain useful at 320 CSS
pixels and 200% text without turning rows into cards, duplicating semantics, or pulling application
schemas and data operations into Wayglass.

Native HTML already supplies the required table, caption, row group, row, header, and cell model.
Replacing it with ARIA grid semantics would make Wayglass responsible for two-dimensional keyboard
navigation, focus, selection, editing, and virtualized relationship maintenance. Rendering rows from
structured input would also make the package own schemas, identity, reconciliation, formatting, and
application controls.

Wide native tables still need a contained and keyboard-discoverable responsive boundary. Phase 2C
already accepted `wg-scroll-region`, including overflow measurement, conditional focusability,
region labeling, focus treatment, forced-colors behavior, and dynamic content synchronization.
Duplicating that behavior in a data-table component would create competing implementations.

Finally, a Shadow DOM wrapper cannot style the descendant caption, headers, rows, and cells of a
slotted native table. Either table content must be cloned into private markup, presentation must be
left entirely to every application, or Wayglass must provide a narrow explicit document stylesheet
similar to its accepted native-form presentation layer.

## Decision

### Keep the native table in consumer-authored light DOM

`wg-data-table` will contain exactly one direct consumer-authored `wg-scroll-region` in its default
slot, and that region will contain exactly one direct native `<table>`. The table's visible caption,
column and row headers, row groups, rows, cells, and interactive descendants remain
consumer-authored light DOM.

The component does not accept row or column arrays, generate header IDs, infer header scope, clone
content, add ARIA table roles, or reconcile application records. Useful native structure and text
remain available before upgrade. Applications preserve durable record identity by retaining keyed
row nodes where practical, consistent with ADR 0024.

### Compose `wg-scroll-region` rather than reimplement overflow

The consumer will author one direct `wg-scroll-region` with `axis="inline"` and its own required
nonempty `label`. The data-table component neither mirrors the label nor changes the primitive's
public state.

The scroll region remains nonsemantic and absent from the Tab order while content fits. When inline
overflow exists, the existing primitive becomes one named region and focus stop, exposes visible
focus, and supports native keyboard scrolling. `wg-data-table` adds no second resize observer,
mutation observer, overflow state, region, or focus stop.

The two elements retain separate explicit registration. `defineWgDataTable()` does not register the
consumer-authored scroll region, and module imports remain side-effect free. This also avoids nested
slot forwarding whose content mutations would not belong to the scroll primitive's direct light-DOM
observer.

### Preserve one representation across widths

Responsive behavior uses contained inline overflow. The table remains the same DOM and semantic
representation on phone, tablet, desktop, kiosk, and wall displays. The package does not:

- set native table descendants to grid, flex, block, or contents to simulate cards;
- generate data labels from headers for a second mobile presentation;
- duplicate hidden desktop and mobile tables;
- reorder columns visually away from DOM order; or
- hide columns based on package breakpoints.

Applications may deliberately choose a different focused view or hide a nonessential column, but
that is an application information-architecture decision with its own accessible context.

### Keep data operations and task policy application-owned

Applications own schema, data access, filtering, sorting, grouping, selection meaning, editing,
pagination, virtualization, column persistence, export, and server interaction.

Sorting controls remain authored buttons or accepted command controls inside native headers. The
current direction remains on the applicable `th[aria-sort]`. Existing click or typed command events
report intent; the data-table element emits no aggregate sort or command event and never reorders
rows.

Row actions remain authored controls. Consequential actions reuse the accepted confirmation and
proportional-friction policy. Applications own focus recovery before removing a focused row because
the component cannot infer the next valid task target.

### Keep state and announcements authored

The component provides optional `context` and `feedback` slots outside the scroll boundary. It does
not infer loading, empty, stale, partial, unavailable, failure, or recovery state from row count,
time, network events, or missing values.

Applications may retain an empty table's caption and headers while placing an empty explanation in
`feedback`, or temporarily hide the table during initial loading and provide clearly scoped
feedback. Retained refresh keeps valid rows and focused descendants visible. The wrapper and table
create no implicit live region; one deliberate application-owned result or feedback owner announces
only meaningful summaries.

### Use an explicit token-backed stylesheet for native descendants

Wayglass will provide an explicitly imported `@wayglass/elements/data-table.css` stylesheet for
native tables inside the required direct scroll region. It supplies token-backed caption, header,
row, cell, density, boundary, wrapping, and adaptive presentation without changing semantic display
roles.

This stylesheet is necessary because Shadow DOM correctly prevents the component from reaching
through its slot to style nested native table elements. Cloning the table or moving it into Shadow
DOM solely for styling is rejected. The stylesheet remains scoped, optional, and documented like the
accepted native-form stylesheet.

### Do not add package-owned sticky headers initially

The initial component has no `sticky-header` attribute. Sticky positioning depends on the number and
height of header rows, row and column spans, border model, application chrome, scroll offsets, zoom,
direction, and forced-colors presentation. A generic option would either constrain valid native
table structures or behave incorrectly for some accepted structures.

Applications may author native sticky CSS for a known table. Phase 3G validation includes a
representative authored sticky composition to confirm that the Wayglass boundary does not prevent
it. Repeated evidence may propose a later narrow package option.

## Consequences

- Browsers and assistive technologies retain native tabular relationships and navigation.
- Applications keep their existing data and state architecture; Wayglass does not become a headless
  table engine.
- One table remains useful before upgrade and stable during responsive changes.
- Wide data gains an explicit, established, conditionally focusable, named scroll boundary without
  duplicate observer logic or hidden dependency registration.
- The wrapper's public API remains small, but applications must author correct native captions,
  headers, sort state, actions, and feedback.
- An explicit companion stylesheet is required for consistent Wayglass styling of native
  descendants.
- The initial package does not solve spreadsheet interaction, virtualization, or generic sticky
  headers.

## Alternatives considered

### Build an ARIA grid or spreadsheet component

Rejected. A grid requires library-owned two-dimensional focus, arrow-key behavior, selection,
editing, and relationship maintenance. That interaction model is unnecessary for a read-and-act
operational table and materially widens scope.

### Render rows and columns from structured properties

Rejected. A schema and data-array API would make Wayglass own application identity, formatting,
reconciliation, controls, empty state, and framework data. It would also remove useful native
fallback and duplicate React's keyed rendering.

### Use custom row and cell elements

Rejected. Native `tr`, `th`, and `td` already express the required relationships. Custom elements
would add no reusable meaning and could interfere with the browser's table repair and accessibility
algorithms.

### Transform rows into labeled cards at narrow widths

Rejected. Card transformation destroys cross-row comparison, risks a visual and semantic ordering
mismatch, commonly duplicates header labels, and creates a second representation that can drift from
the table.

### Render separate desktop and mobile tables

Rejected. Duplicate semantic owners, controls, IDs, focus targets, and application reconciliation
are incompatible with stable state and responsive continuity.

### Reimplement overflow inside `wg-data-table`

Rejected. Phase 2C already supplies the required conditional region, focus, measurement, dynamic
content, and adaptive behavior. A second implementation would drift and add per-instance observers.

### Leave all table presentation application-owned

Rejected. Native semantics should remain application-authored, but repeated caption, header, cell,
density, boundary, wrapping, and state presentation is a stable design-system concern. The explicit
stylesheet solves that concern without private rendering.

### Add generic sticky headers now

Rejected for the initial contract. A reliable option needs stronger constraints or evidence across
single- and multi-row headers, spans, zoom, forced colors, and application offsets.
