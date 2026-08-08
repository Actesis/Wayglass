# Phase 3B metrics and key-values contracts

**Status:** Proposed for Phase 3B review on August 8, 2026. These contracts define
`wg-metric-group`, `wg-trend-indicator`, `wg-key-value`, and one compatible `wg-metric` slot
extension before tokens or implementation are locked.

The components follow the accepted [operational-data ownership contract](./operational-data.md) and
[ADR 0024](../architecture/adr/0024-operational-data-ownership-and-updates.md). Applications own
values, units, formatting, comparisons, thresholds, timestamps, ordering, and state. Wayglass owns
the documented presentation and semantics.

## Shared requirements

All Phase 3B scalar components:

- import without registration side effects and expose explicit registration functions;
- use preformatted human-readable values rather than applying locale, precision, unit-conversion,
  comparison, or threshold policy;
- keep domain value, trend direction, condition, knowledge, and activity independent;
- expose visible text for every value and state meaning without requiring color, an icon, or motion;
- remain display-only and emit no events for programmatic data updates;
- preserve consumer-authored native content and DOM continuity where slots are provided;
- have no implicit live-region role and never move focus or scroll when values change;
- support useful client-only fallback content, typed React wrappers over the same elements, and the
  Phase 3 validation envelope; and
- remain coherent in dark and light themes, compact and comfortable density, forced colors, reduced
  motion, grayscale, 320 CSS-pixel width, 200% text, desktop, and wall displays.

## `wg-metric-group`

### Purpose

`wg-metric-group` presents a named set of related scalar readings as one scan-efficient monitoring
group. Use it when the relationship among multiple metrics or key values matters, such as capacity,
quality, and throughput for one function.

### When to use

Use it for two or more peer `wg-metric` or `wg-key-value` elements that share one subject, interval,
or comparison context. The group may appear directly in a monitor section or inside a larger
application-authored composition.

### When not to use

Do not use it as a generic grid, a value tile, a function boundary, a chart, a form group, or a
container for unrelated dashboard statistics. Do not repeat a condition on the group merely because
one child has that condition.

### Anatomy

The component contains a visible heading, optional description, a responsive scalar-value area, and
optional local actions. The heading or `label` names one internal `group`. Each child value owns its
own label, value, unit, and known state.

### Variants

There is one auto-flow layout. It uses a container-responsive grid that preserves DOM order and
adapts column count to available inline size. Consumers needing a deliberate non-peer layout compose
the scalar elements with Phase 2 layout primitives instead.

### States

`busy` identifies authored refresh or replacement activity for the bounded group. It preserves
still-valid children and exposes `aria-busy`; it does not infer loading, hide values, announce, or
add pending state to children.

Initial loading, empty, filtered-empty, unavailable, offline, and failure presentation is
consumer-authored with the accepted Phase 2 feedback components. The group does not infer those
states from its child count.

### Behavior

The default slot remains consumer-owned light DOM. The component does not clone, sort, filter,
normalize, or reconcile children. Programmatic insertion, removal, and reordering does not emit an
event or move focus. Applications retain stable child nodes and keys during live updates.

### Keyboard interaction

The group is not focusable and defines no keyboard interaction. Slotted links and controls follow
ordinary DOM order after scalar content and keep their native behavior.

### Accessibility

The internal content area uses `role="group"` with the visible heading text or `label` as its
accessible name. The heading remains visibly rendered even when supplied only through the `label`
attribute. Nested metrics and key values keep their own semantics; the group does not synthesize an
aggregate state or duplicate child text into its name.

At 24 values, reading order follows DOM order. CSS placement must not create a visual sequence that
conflicts with the accessibility tree.

### Responsive behavior

The auto-flow grid reduces columns as its own container narrows. It never creates page-level
horizontal overflow. Long values wrap within their item when necessary; the group does not truncate
essential value, unit, state, or label text. Actions move after the value area at narrow widths.

### Content guidance

Use a heading that states the shared subject or interval, not “Metrics.” Child labels remain concise
and mutually distinguishable. Put shared observation or comparison context in the description rather
than repeating it in every child when the relationship remains unambiguous.

### API

#### Attributes and properties

- `label: string`: required visible and accessible fallback heading.
- `busy: boolean`: authored bounded refresh or replacement state; default `false`.

#### Slots

- `heading`: optional visible heading; overrides visible `label` text while `label` remains the
  accessible fallback.
- `description`: optional shared context.
- default: two or more peer scalar components, normally `wg-metric` or `wg-key-value`.
- `actions`: optional local actions whose visible or accessible names repeat their target.

#### Events

None. Slotted controls retain their native or documented events.

#### Methods

None.

#### CSS custom properties

- `--wg-metric-group-color-background`
- `--wg-metric-group-color-border`
- `--wg-metric-group-color-heading`
- `--wg-metric-group-color-description`
- `--wg-metric-group-radius`
- `--wg-metric-group-space`
- `--wg-metric-group-space-item`
- `--wg-metric-group-size-item-minimum`

#### CSS parts

- `base`
- `header`
- `heading`
- `description`
- `content`
- `actions`

### Example

```html
<wg-metric-group label="Processing activity">
  <p slot="description">Confirmed values from the current 15-minute interval.</p>
  <wg-metric label="Completed" value="1,284" condition="positive"></wg-metric>
  <wg-metric label="Median duration" value="4.8" unit="s"></wg-metric>
  <wg-key-value label="Active policy" value="Standard review"></wg-key-value>
</wg-metric-group>
```

### Testing requirements

Required coverage includes accessible naming, heading-slot fallback, busy semantics without a live
region, mixed scalar children, no child-state aggregation, insertion and reorder with stable focus,
long and localized-looking content, one through 24 values, container reflow, themes, density, forced
colors, reduced motion, 200% text, and no unintended overflow.

### Open questions

None. Runtime child-tag enforcement is intentionally absent so compatible future scalar components
remain composable.

## `wg-trend-indicator`

### Purpose

`wg-trend-indicator` presents one application-authored direction and comparison statement with a
quick visual signal and complete visible text. It answers how a value changed over an authored
interval; it does not decide whether that change is good, bad, current, or important.

### When to use

Use it when a current value has a meaningful comparison such as rising throughput, falling error
count, steady temperature, or mixed recent movement. It may appear in the new `trend` slot of
`wg-metric`, beside a key value, or in another explicitly labeled monitoring composition.

### When not to use

Do not use it for a current value, condition-only status, progress, prediction, arbitrary history,
or a decorative arrow. Omit it when no comparison would improve understanding; absence alone must
not be interpreted as steady.

### Anatomy

The component contains a non-icon geometric direction signal, a visible direction word, required
comparison text, applicable known-state text, and optional detail. The signal and word are
redundant.

### Variants

Directions are:

- `rising`: the application asserts upward change over its stated comparison;
- `falling`: the application asserts downward change;
- `steady`: change remained inside application-owned steady bounds;
- `mixed`: the interval has meaningful movement with no single asserted direction; and
- `none`: no direction is asserted. The required label explains why or what comparison is absent.

`none` is not `steady`, `unknown`, or `unavailable`. Knowledge separately communicates confidence in
the comparison.

### States

The component accepts the shared `condition`, `knowledge`, and `activity` axes. Defaults are
`neutral`, `confirmed`, and `idle`. A non-neutral condition is supplied only when the application
knows the domain meaning of the trend and is rendered as visible text separate from direction.

`loading` means the comparison is not yet available during initial calculation. It exposes a stable
busy label and no fabricated direction. For background recalculation, consumers retain the last
trend, set `activity="pending"`, and adjust knowledge when appropriate rather than blanking it.

### Behavior

The component performs no arithmetic, thresholding, regression, smoothing, forecasting, interval
selection, or condition inference. Attribute and property updates replace presentation without
animation by default, events, focus movement, or announcement.

### Keyboard interaction

None. The component is not focusable.

### Accessibility

One named `group` exposes direction, comparison label, and every non-default state as coherent text.
The geometric signal is hidden from the accessibility tree. The visible direction word remains when
forced colors remove fill or when CSS fails to draw the signal.

The component has no live-region role. Applications author one deliberate update summary elsewhere
when a changed trend warrants announcement.

### Responsive behavior

Signal, direction, and short comparison text may remain inline when space permits. They wrap into
logical reading order in narrow containers without hiding the interval or state. No text is clipped
to preserve a one-line badge shape.

### Content guidance

The `label` states the magnitude and comparison context without repeating the built-in direction
word: “12% over the previous hour,” not “Rising 12%.” Use a neutral statement when exact magnitude
is not useful: “Across the last five observations.” Avoid “better” or “worse” unless the application
also supplies the corresponding condition and the domain meaning is certain.

### API

#### Attributes and properties

- `label: string`: required visible comparison or absence statement.
- `direction: rising | falling | steady | mixed | none`; default `none`.
- `condition: Condition`; default `neutral`.
- `knowledge: Knowledge`; default `confirmed`.
- `activity: Activity`; default `idle`.
- `loading: boolean`; default `false`.

#### Slots

- `label`: optional visible comparison content; overrides visible `label` text while `label` remains
  the accessible fallback.
- `detail`: optional persistent context such as an authored `<time>` range or data source.

#### Events

None.

#### Methods

None.

#### CSS custom properties

- `--wg-trend-indicator-color-signal`
- `--wg-trend-indicator-color-text`
- `--wg-trend-indicator-color-state`
- `--wg-trend-indicator-size-signal`
- `--wg-trend-indicator-width-signal`
- `--wg-trend-indicator-space`

Direction does not receive positive, caution, or critical color tokens. The signal color defaults to
a neutral data-change role; condition receives a separate semantic cue when authored.

#### CSS parts

- `base`
- `signal`
- `direction`
- `label`
- `state`
- `knowledge`
- `activity`
- `detail`

### Example

```html
<wg-metric label="Backlog" value="42" knowledge="confirmed">
  <wg-trend-indicator
    slot="trend"
    direction="rising"
    label="12% over the previous hour"
    condition="neutral"
  ></wg-trend-indicator>
</wg-metric>

<wg-metric label="Failed deliveries" value="3">
  <wg-trend-indicator
    slot="trend"
    direction="falling"
    label="Six fewer than the previous hour"
    condition="positive"
  ></wg-trend-indicator>
</wg-metric>
```

The first example is rising without being a warning. The second has positive condition because the
application explicitly knows that fewer failures are favorable.

### Testing requirements

Required coverage includes every direction, every known-state axis, neutral and authored condition,
initial loading versus pending recalculation, visible non-color direction text, slotted label and
native time detail, invalid-value normalization, dynamic updates without events or live semantics,
long comparisons, forced colors, grayscale, reduced motion, narrow containers, and Axe.

### Open questions

The implementation prototype must verify that the chosen non-icon direction geometry remains
recognizable in forced colors and at 200% text without competing with condition signals. Failure
changes the geometry, not the semantic API.

## `wg-key-value`

### Purpose

`wg-key-value` presents one labeled textual or reference value with optional known state and native
consumer-authored value content. It complements `wg-metric` for identifiers, names, versions,
policies, locations, timestamps, and other values where numeric instrumentation hierarchy would be
misleading.

### When to use

Use it for one concise label-value relationship that benefits from Wayglass scalar alignment and
state treatment. Use its value slot when native content such as `<time>`, `<code>`, or a link
carries useful semantics.

### When not to use

Do not use it for quantitative values with units, Boolean signals, conditions without a domain
value, editable fields, paragraphs of content, or arbitrary two-column layout. Use `wg-metric`,
`wg-boolean-value`, `wg-status-indicator`, native form controls, or layout primitives respectively.

### Anatomy

The component contains a visible label, textual or slotted value, applicable known-state text,
optional description, and optional metadata. One internal named `group` communicates the
relationship without turning every pair into a separate definition-list announcement.

### Variants

None. Typography may distinguish ordinary text, code, links, or time through consumer-authored
native elements in the value slot rather than a component variant.

### States

The component accepts independent `condition`, `knowledge`, and `activity` axes with the shared
defaults. It never infers condition from value text.

`loading` shows “Loading” while retaining label context and exposes busy state. Background refresh
retains the previous value with `activity="pending"`; unavailable knowledge keeps the label and
renders the application-authored fallback or the neutral no-value presentation.

### Behavior

The string `value` supplies convenient fallback content. A non-empty `value` slot overrides its
visible presentation and retains the native element and its events in light DOM. The component does
not parse, format, sanitize as HTML, truncate, copy, or make the value interactive.

Programmatic updates emit no events and do not move focus. A slotted link remains an ordinary link;
the surrounding key-value host is not clickable or focusable.

### Keyboard interaction

The component defines none. Interactive slotted value content follows native keyboard behavior and
source order.

### Accessibility

The visible label names one internal `group`. The value and its native semantics remain exposed as
group content. Non-default condition, knowledge, and activity are visible and included in the text
equivalent. Missing value is spoken as “No value,” not inferred as an empty string, false, or zero.

The component is not a live region. A code or internal identifier should be exposed only when the
intended user can recognize or use it.

### Responsive behavior

Label and value align for scanning at ordinary widths and stack in narrow containers. Long values
wrap with `overflow-wrap` rather than forcing page overflow. Consumer-authored code may use a
labeled scroll region only when breaking the identifier would make it unusable.

### Content guidance

Use human labels such as “Active policy” rather than field names such as `policy_name`. Supply one
value, not a sentence that hides several facts. Explain unavailable or partial data in description
or metadata when “Unavailable” alone would not support recovery.

### API

#### Attributes and properties

- `label: string`: required visible label and accessible fallback.
- `value: string`: preformatted fallback value; default empty.
- `condition: Condition`; default `neutral`.
- `knowledge: Knowledge`; default `confirmed`.
- `activity: Activity`; default `idle`.
- `loading: boolean`; default `false`.

#### Slots

- `label`: optional visible label; overrides visible `label` text while `label` remains the
  accessible fallback.
- `value`: optional native or authored value; overrides the visible `value` string.
- `description`: optional persistent explanation.
- `metadata`: optional source, observation time, or supporting state context.

#### Events

None. Slotted interactive content retains its native events.

#### Methods

None.

#### CSS custom properties

- `--wg-key-value-color-label`
- `--wg-key-value-color-value`
- `--wg-key-value-color-state`
- `--wg-key-value-space`
- `--wg-key-value-size-label-minimum`

#### CSS parts

- `base`
- `label`
- `value`
- `state`
- `knowledge`
- `activity`
- `description`
- `metadata`

### Example

```html
<wg-key-value label="Last confirmed">
  <time slot="value" datetime="2026-08-08T19:24:00Z">12:24 PM local time</time>
  <span slot="metadata">Source: Intake coordinator</span>
</wg-key-value>

<wg-key-value label="Assigned reviewer" value="Unavailable" knowledge="unavailable"></wg-key-value>
```

### Testing requirements

Required coverage includes string and slotted values, native time/code/link semantics, missing and
unavailable values, loading versus pending refresh, every known-state axis, no inferred condition,
long identifiers, native events without host duplication, mutation with stable focus, 24-value group
composition, themes, forced colors, reduced motion, narrow containers, 200% text, and Axe.

### Open questions

None. A multi-pair definition list remains consumer-authored native HTML or a future evidence-driven
contract; `wg-key-value` does not introduce a hidden list coordinator.

## Compatible `wg-metric` extension

The existing `wg-metric` contract, value formatting, known-state API, loading behavior, and
registration remain unchanged. Phase 3B adds one named slot:

- `trend`: optional single `wg-trend-indicator` or compatible authored trend presentation placed
  after current value and state and before description and metadata.

`wg-metric` does not receive raw-number, previous-value, delta, interval, threshold, or trend-
direction properties. It does not inspect the slotted trend, copy its state, include it in the
metric’s accessible name, calculate it, or hide it automatically. The application owns whether the
trend remains relevant during loading, stale knowledge, or background refresh.

The slot becomes a public layout and reading-order contract. Runtime tag enforcement is absent, but
documentation and tests use the production `wg-trend-indicator`.

## Phase 3B review decisions

Acceptance confirms:

1. one responsive, non-interactive group rather than grid variants;
2. authored comparison text plus `rising | falling | steady | mixed | none` direction;
3. known state on trend and key-value components without inferring it from data;
4. a slotted native value path for key-value display;
5. only a `trend` slot added to the existing metric; and
6. no shared record, formatter, comparison calculator, live region, or new `@wayglass/core` type.
