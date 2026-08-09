# Phase 3D status-list contracts

**Status:** Accepted for Phase 3D on August 9, 2026. These contracts define `wg-status-list` and
`wg-status-entry`. Their required public tokens are locked; production implementation remains next.
They follow the accepted [operational-data ownership contract](./operational-data.md) and
[ADR 0024](../architecture/adr/0024-operational-data-ownership-and-updates.md).

Status lists present a scan-efficient set of independently meaningful current summaries. They do not
become an application record model, event history, selection widget, command surface, or alerting
system.

## Shared requirements

Both Phase 3D elements:

- import without registration side effects and expose explicit registration functions;
- preserve consumer-authored light DOM, native controls, event handling, and stable framework keys;
- keep domain value, condition, knowledge, and activity independent;
- expose visible state meaning without depending on color, icons, animation, or hover;
- never infer ordering, grouping, identity, loading, emptiness, severity, or actionability from
  authored content;
- have no implicit live-region role and do not move focus or scroll after programmatic updates;
- remain useful as authored text before client-only upgrade;
- provide typed React wrappers over the same framework-neutral elements; and
- remain coherent in dark and light themes, compact and comfortable density, forced colors, reduced
  motion, grayscale, 320 CSS-pixel width, 200% text, desktop, and wall displays.

## Collection and grouping architecture

One `wg-status-list` is one named, ordered collection. Its light-DOM `wg-status-entry` children are
the application-owned records. The application inserts, removes, and reorders those actual nodes;
the list does not accept a structured records property or reconcile copies of them.

Optional grouping uses multiple named `wg-status-list` elements inside an application-authored
section, panel, stack, or Function Deck composition. Phase 3D does not add `wg-status-group` or a
group attribute on entries. This keeps each group a complete list with an explicit visible name,
keeps DOM order authoritative, and avoids inferred or visually reordered groups.

```html
<section aria-labelledby="source-status-heading">
  <h2 id="source-status-heading">Source status</h2>

  <wg-status-list label="Active sources">
    <!-- Active entries -->
  </wg-status-list>

  <wg-status-list label="Unavailable sources">
    <!-- Unavailable entries -->
  </wg-status-list>
</section>
```

Applications may instead author one flat list when grouping would not help recognition. Moving an
entry between groups means moving the same stable node when the represented subject is unchanged.

## `wg-status-list`

### Purpose

`wg-status-list` presents a visible, accessibly named collection of current status entries. It owns
the collection boundary, list semantics, responsive entry spacing, and optional collection context.

### When to use

Use it for independently meaningful subjects that people need to scan, compare, or act on, such as
services, facilities, accounts, assets, processes, or agents. Each entry must still make sense when
read on its own with the list name.

### When not to use

Do not use it for event history, a curated timeline, tabular relationships, a menu, selectable
options, a form, or unrelated dashboard fragments. Use Phase 2 layout primitives when the children
are not members of one named collection.

### Anatomy

The component contains a visible heading, optional description, optional collection actions, an
optional authored feedback area, and one ordered list of status entries.

### States

`busy` marks bounded initial loading, refresh, or replacement activity on the list. It exposes
`aria-busy` without hiding retained entries, changing their state, adding a live region, or
inferring why work is pending.

Initial loading, empty, filtered-empty, partial, offline, unavailable, and failed states are
application-authored with the accepted Phase 2 feedback components in the `status` slot. The list
does not infer a state from child count. During refresh, applications retain still-valid entries and
place the refresh explanation in `status` when it is useful.

### Behavior

The default slot remains consumer-owned. The component does not clone, sort, filter, group,
normalize, select, expand, or reconcile entries. It does not aggregate child condition into a list
condition. Programmatic insertion, removal, reordering, and state updates emit no event.

Only direct `wg-status-entry` children participate in the supported list anatomy. Development
diagnostics may report unsupported direct children, but production rendering must not remove,
rewrite, or hide authored content.

### Keyboard interaction

The list is not focusable and defines no keyboard interaction. Links and controls inside entries
follow ordinary DOM order and retain native or component-defined behavior.

### Accessibility

The entry container exposes `role="list"` and is named by the visible heading or required `label`
fallback. Each upgraded `wg-status-entry` exposes `role="listitem"`. The heading and description
remain outside the list so collection actions and feedback do not become list items.

The list has no `aria-live`, `role="status"`, or `role="alert"`. Applications provide one deliberate
announcement owner elsewhere when a change warrants speech. `busy` alone does not announce every
mutation.

DOM and accessibility-tree order are authoritative. CSS layout must not create a conflicting visual
sequence. Item counts, positions, selection, and set size are not synthesized beyond native list
semantics.

### Responsive behavior

Entries remain in one logical block flow. The list does not create page-level horizontal overflow,
truncate essential text, or switch to a visually reordered grid. Heading actions may wrap after the
heading, and entry actions may stack after entry content in narrow containers.

Density is inherited from the active Wayglass theme. The list does not add a density attribute or
change density from viewport size.

### Content guidance

Name the represented set, not the component type: “Active sources,” not “Status list.” Use multiple
lists only when group names change how entries are understood or found. Keep explanatory copy in the
description or authored feedback rather than repeating it in every entry.

### API

#### Attributes and properties

- `label: string`: required visible and accessible fallback heading.
- `busy: boolean`: authored bounded loading, refresh, or replacement activity; default `false`.

#### Slots

- `heading`: optional visible heading; overrides visible `label` text while `label` remains the
  accessible fallback.
- `description`: optional collection context.
- `actions`: optional collection-level native or Wayglass controls.
- `status`: optional Phase 2 loading, empty, partial, offline, unavailable, failure, or refresh
  feedback outside the list semantics.
- default: direct `wg-status-entry` children in authored reading order.

#### Events

None. Slotted controls retain their native or documented events.

#### Methods

None.

#### CSS custom properties

- `--wg-status-list-color-background`
- `--wg-status-list-color-border`
- `--wg-status-list-color-heading`
- `--wg-status-list-color-context`
- `--wg-status-list-radius`
- `--wg-status-list-space`
- `--wg-status-list-space-entry`

#### CSS parts

- `base`
- `header`
- `heading`
- `description`
- `actions`
- `status`
- `list`

## `wg-status-entry`

### Purpose

`wg-status-entry` presents one stable subject, its current summary, and state scoped to that named
subject or an explicitly named aspect of it. It provides a quick visual condition cue with complete
visible text and a predictable place for optional value, time, metadata, and actions.

### When to use

Use it as a direct child of `wg-status-list` when the subject has a current operational summary that
must remain recognizable during updates and reordering.

### When not to use

Do not use it as a historical event, selectable row, disclosure widget, generic card, notification,
or whole-row command. Do not copy a nested value's state onto the entry unless that state genuinely
describes the named entry subject.

### Anatomy

The component contains a compact rounded-square condition signal, visible condition text, required
primary heading, optional secondary description, optional value, optional time, optional metadata,
non-default knowledge and activity text, and optional authored actions.

The signal mechanics and state labels reuse the same shared state-presentation source as
`wg-status-indicator`. The entry does not nest a second status indicator because that would
duplicate the subject label and semantic grouping. This is a denser composition of the existing
status language, not a new enum or condition system.

### States

The entry accepts the shared axes with defaults of `condition="neutral"`, `knowledge="confirmed"`,
and `activity="idle"`.

- Condition always has a visible word and redundant geometric or color emphasis.
- Non-default knowledge and activity add persistent visible text without replacing condition.
- Pending activity does not optimistically change the subject's confirmed value or condition.
- Unknown, stale, conflicting, or unavailable knowledge does not fabricate an absent value.

The state axes qualify the entry subject named by `label` or `heading`. A slotted `wg-metric`,
`wg-key-value`, `wg-boolean-value`, badge, or other nested presentation retains its own more
narrowly scoped meaning.

### Behavior

The entry is display-only. Attribute updates replace state presentation without animation by
default, focus movement, announcement, or events. It does not format values or time, calculate
condition, invoke actions, or make its whole surface clickable.

Applications retain the same entry node for the same subject. Ordinary `id` values and framework
keys may express application identity, but `wg-status-entry` does not add a record-key attribute or
generate a durable identifier.

### Keyboard interaction

The entry is not focusable and defines no row keyboard behavior. Authored links, buttons, menu
triggers, and other controls keep their own tab order and interaction. A primary link may appear in
the heading slot, but clicking elsewhere on the entry does not activate it.

### Accessibility

The host exposes `role="listitem"`. Its internal content preserves this reading sequence: primary
heading, condition and other applicable state, secondary description, value, time, metadata, then
actions. Purely visual signal geometry is hidden from the accessibility tree because the visible
condition word supplies its text equivalent.

The entry has no live-region role and does not place state into its accessible name. Native controls
must have names that identify both action and target, such as “Retry North source,” rather than
relying on nearby layout alone.

### Responsive behavior

The condition cue and primary content remain visually associated. Optional fields wrap without
clipping, and actions move after the informational content when inline space is insufficient. The
component does not truncate the primary heading, condition, knowledge, activity, or sole value.

Compact and comfortable density change spacing and type roles through theme tokens; they do not
remove content or controls. Prominent distance-reading status remains the responsibility of
`wg-status-indicator`, not an entry variant.

### Content guidance

Use a concise subject name as the primary heading and one sentence or fragment for the current
summary. Supply a native `<time datetime="…">` whose visible text includes enough context for the
application. Put identifiers, sources, owners, or categories in metadata only when they aid
recognition or action.

Omit unused regions. Do not fill every entry with placeholder dashes, repeat the list name, or use
an icon as the only expression of subject, state, or action.

### API

#### Attributes and properties

- `label: string`: required visible and accessible fallback primary heading.
- `condition: Condition`: default `neutral`.
- `knowledge: Knowledge`: default `confirmed`.
- `activity: Activity`: default `idle`.

#### Slots

- `heading`: optional primary subject content; overrides visible `label` text while `label` remains
  the accessible fallback.
- `description`: optional current summary or supporting text.
- `value`: optional preformatted scalar or domain value, normally plain text or an existing Wayglass
  value component.
- `time`: optional consumer-formatted native `<time>` content.
- `metadata`: optional persistent source, owner, identifier, or category context.
- `actions`: optional native or Wayglass controls whose names identify their target.

#### Events

None. Slotted controls retain their native or documented events.

#### Methods

None.

#### CSS custom properties

- `--wg-status-entry-color-background`
- `--wg-status-entry-color-border`
- `--wg-status-entry-color-heading`
- `--wg-status-entry-color-detail`
- `--wg-status-entry-color-state`
- `--wg-status-entry-color-condition`
- `--wg-status-entry-color-signal-border`
- `--wg-status-entry-radius`
- `--wg-status-entry-radius-signal`
- `--wg-status-entry-space`
- `--wg-status-entry-space-related`
- `--wg-status-entry-size-signal`

Condition-specific signal and text color, knowledge text, and pending activity emphasis use the
shared semantic state tokens. Entry grid tracks, responsive thresholds, and action placement remain
private mechanics.

#### CSS parts

- `base`
- `signal`
- `content`
- `heading`
- `state`
- `condition`
- `knowledge`
- `activity`
- `description`
- `value`
- `time`
- `metadata`
- `actions`

### Example

```html
<wg-status-list label="Delivery sources" busy>
  <p slot="description">Current summaries in application-authored priority order.</p>
  <p slot="status">Refreshing retained values.</p>

  <wg-status-entry
    id="north-source"
    label="North source"
    condition="caution"
    knowledge="stale"
    activity="pending"
  >
    <span slot="description">Delivery is delayed; the last confirmed route remains active.</span>
    <wg-key-value slot="value" label="Queue" value="18"></wg-key-value>
    <time slot="time" datetime="2026-08-09T14:22:00-07:00">Observed at 2:22 PM</time>
    <span slot="metadata">Priority 2</span>
    <button slot="actions" type="button">Inspect North source</button>
  </wg-status-entry>
</wg-status-list>
```

## Mutation and focus contract

Applications preserve a stable entry node and its descendants when the represented subject remains
the same. Updating state, moving an entry within a list, or moving it between named lists must not
cause Wayglass to replace its light-DOM content, move focus, scroll, or announce.

If an application removes the focused entry or a focused descendant, the application moves focus to
the next valid task target before removal. Wayglass cannot infer that target. The surrounding list
remains stably named so an application may choose it as an explicit recovery target, but the list is
not made focusable by default.

New entries appear in authored DOM order and do not auto-scroll or receive focus. Native scroll
anchoring remains enabled. Visual transitions, if later accepted, must respect reduced motion and
cannot be required to understand insertion, removal, or reorder.

## Validation requirements

The implementation slices must cover:

- accessible list and list-item naming, roles, reading order, and authored native action behavior;
- every condition and knowledge value, pending activity, mixed axes, plain text, scalar values,
  Boolean values, badges, native time, metadata, and entries without optional content;
- flat and application-grouped compositions with stable DOM order;
- zero, one, and 100 entries, including in-place update and reorder of all 100 while an unaffected
  descendant retains focus;
- insertion before and after a focused entry, moving the same entry between lists, and documented
  application recovery before focused-entry removal;
- initial loading, refresh with retained entries, empty, filtered-empty, partial, offline,
  unavailable, and failure feedback without implicit announcements;
- long and localized-looking content, long identifiers, multiple actions, and narrow-container
  wrapping without page overflow or semantic reordering;
- dark and light themes, compact and comfortable density, forced colors, grayscale, reduced motion,
  320 CSS-pixel width, 200% text, touch, desktop, and wall-display presentation;
- useful pre-upgrade authored content, explicit registration, typed React wrappers, and equivalent
  framework-neutral and React mutation behavior; and
- Chromium, Firefox, WebKit, and the representative assistive-technology procedures assigned by the
  Phase 3 validation matrix.

At the 100-entry reference envelope, automated evidence must satisfy ADR 0024's interaction,
overflow, observer, and synchronous-task regression thresholds. Package-owned pagination and
virtualization remain out of scope.

## Accepted decisions

1. One named list is the grouping primitive; applications compose multiple lists rather than a new
   status-group element.
2. Entry state uses the shared status-indicator labels and signal mechanics without nesting an
   indicator or introducing another status enum.
3. Rows remain display-only; every action is an authored control with native or existing Wayglass
   behavior.
4. Stable DOM nodes and application keys express identity; no public record-key API is added.
5. Loading and collection feedback are authored through `busy` and the `status` slot, with no
   inferred empty state or implicit live region.
