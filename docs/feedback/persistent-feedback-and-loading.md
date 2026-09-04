# Phase 2E-B persistent-feedback and loading contracts

**Status:** Accepted and implemented for Phase 2E-B on August 1, 2026. Automated cross-browser and
visual evidence is recorded in the
[Phase 2E-B validation record](../accessibility/phase-2e-persistent-feedback-validation.md);
representative assistive-technology review is carried as a public-release gate in the
[Phase 2 ledger](../accessibility/phase-2-assistive-technology-gates.md). Shared delivery,
announcement, lifetime, and state ownership follow the accepted
[feedback-state contract](./feedback-state.md) and
[ADR 0020](../architecture/adr/0020-feedback-delivery-and-lifetime.md).

This contract defines `wg-badge`, `wg-alert`, `wg-progress`, `wg-skeleton`, `wg-empty-state`,
`wg-offline-state`, and `wg-stale-data-marker`. These components present persistent context and
current activity without creating a notification center, inventing application state, or turning
every unusual condition into an error.

## Shared requirements

Every Phase 2E-B component:

- imports without registering itself and exposes an explicit registration function;
- works in light and dark themes, forced colors, grayscale, reduced motion, narrow containers, and
  at 200% text size without losing visible meaning;
- uses visible text as the primary meaning and treats icons, hue, animation, and placement as
  redundant presentation;
- leaves condition, activity, knowledge, availability, timing thresholds, connectivity evidence,
  progress values, and outcome history application-owned;
- preserves useful light-DOM content before upgrade and when JavaScript is unavailable;
- adds no focus stop unless consumer-authored slotted content is independently interactive;
- does not move focus, dispatch outcome events, start requests, retry work, or dismiss itself; and
- uses the same production element through typed React wrappers without moving behavior into React.

Condition, activity, knowledge, and availability remain separate. A stale marker cannot recolor a
positive value into caution. An offline state cannot claim that last-known data is unknown. A
progress indicator cannot claim success merely because it reaches its maximum.

## `wg-badge`

### Purpose

`wg-badge` presents a short category, count, qualifier, or compact state label beside the content it
modifies. Examples include “Beta,” “3 queued,” “Internal,” and “Requires review.”

Do not use a badge as the only accessible name, as a replacement for `wg-status-indicator` or
`wg-boolean-value`, or as a hidden notification count whose meaning exists only in color.

### Anatomy and semantics

The default slot contains concise visible text. The host adds no role or live-region behavior. Its
text remains part of the surrounding reading order. A condition changes redundant presentation but
does not change persistence, announcement, or the semantics of nearby content.

Counts are consumer-formatted visible text. Wayglass does not abbreviate, cap, localize, or infer
singular/plural labels. A consumer may include visually hidden clarification in the default slot.

### Public API

Attributes and properties:

- `condition: 'neutral' | 'positive' | 'caution' | 'critical'`; default `neutral`.

Missing or unsupported conditions normalize to `neutral`.

Slots:

- default: required concise visible label.

CSS parts:

- `base`
- `content`
- `marker`: optional redundant visual band or dot; never the only meaning.

Events and methods: none.

### Example

```html
<span id="review-label">Supplier verification</span>
<wg-badge condition="caution">Requires review</wg-badge>
```

## `wg-alert`

### Purpose

`wg-alert` presents persistent, in-context feedback with a concise heading or message, optional
supporting detail, and optional recovery actions. It can describe neutral information, successful
completion, caution, or a critical problem.

The component is not automatically a live alert. Static page content and ordinary persistent
messages use `announcement="off"`. A dynamically inserted or meaningfully updated message may use an
explicit polite or assertive announcement after the application has checked that another surface
will not announce the same change.

### Anatomy and semantics

The visual container has a condition band plus message and action areas. Condition remains visible
through text and boundary treatment in addition to hue. The message announcement node excludes the
actions slot so interactive controls are not repeatedly spoken as status content.

`announcement="polite"` maps the message node to status semantics. `announcement="assertive"` maps
it to alert semantics. `announcement="off"` adds no live role. Changing announcement from `off`
after content is already rendered is not a supported technique for forcing speech; applications
insert or update the intended message once within the chosen announcement path.

The optional `label` names the feedback container when it needs a distinct group name. It does not
replace the visible heading or message. Slotted actions retain their own semantics, events, pending
state, and focus order.

### Public API

Attributes and properties:

- `condition: 'neutral' | 'positive' | 'caution' | 'critical'`; default `neutral`.
- `announcement: 'off' | 'polite' | 'assertive'`; default `off`.
- `label: string`; default empty, optional accessible group label.

Missing or unsupported condition and announcement values normalize to `neutral` and `off`
respectively.

Slots:

- `heading`: recommended visible heading.
- default: required concise message and optional supporting detail.
- `actions`: optional consumer-authored controls.

CSS parts:

- `base`
- `marker`
- `message`
- `heading`
- `content`
- `actions`

Events and methods: none.

### Examples

```html
<wg-alert condition="caution" label="Import result">
  <h3 slot="heading">Three records need review</h3>
  <p>The other 124 records were imported and remain available.</p>
  <wg-button slot="actions" appearance="secondary">Review records</wg-button>
</wg-alert>
```

```html
<!-- Inserted only after the save completes; the durable value also updates in context. -->
<wg-alert condition="positive" announcement="polite">
  <p>Contact preferences saved.</p>
</wg-alert>
```

## `wg-progress`

### Purpose and ownership

`wg-progress` is an inert presentation shell around exactly one direct consumer-authored native
`<progress>` element. The native element owns determinate versus indeterminate state, current value,
maximum, accessibility mapping, and label relationships.

Consumers omit the native `value` attribute for indeterminate progress. They do not use a fabricated
percentage, `aria-valuenow`, or an animation to imply measurable completion. A determinate value is
within the native range from zero through `max`; the browser remains authoritative when markup is
invalid.

### Anatomy and semantics

The direct light-DOM anatomy contains:

- a persistent native `label` explicitly associated with the progress element, or an equivalent
  explicit accessible-name relationship;
- exactly one native `progress` element; and
- optional visible value and supporting-message nodes.

The shell adds no `progressbar`, status, or live-region role and does not mirror native attributes.
Applications decide whether starting or completing work also warrants a separate, nonduplicative
status announcement. Completion produces a visible outcome rather than only removing the element.

Known previous content remains visible during refresh when it is still valid. The owning container
may expose `aria-busy="true"`; `wg-progress` does not search for or mutate that owner.

### Public API

Host attributes, value-bearing properties, events, and methods: none.

Slots:

- default: required direct native label/progress anatomy and optional context.

CSS parts:

- `container`

The slotted native progress element remains light DOM and cannot receive a CSS part. The implemented
`::slotted(progress)` presentation preserves the accepted native behavior without publishing a
native-node class.

### Examples

```html
<wg-progress>
  <label for="catalog-import">Importing catalog</label>
  <progress id="catalog-import" value="64" max="100">64%</progress>
  <output for="catalog-import">64%</output>
</wg-progress>
```

```html
<wg-progress>
  <label for="availability-refresh">Refreshing availability</label>
  <progress id="availability-refresh"></progress>
  <span>Last-known values remain visible while the source responds.</span>
</wg-progress>
```

## `wg-skeleton`

### Purpose

`wg-skeleton` supplies optional visual scaffolding before content geometry is known. It is a
presentation placeholder, not a value, label, image alternative, progress estimate, or loading
announcement.

Do not replace valid previous content with a skeleton during background refresh. Do not use a
skeleton where a stable empty surface and visible loading message would be clearer.

### Anatomy and semantics

The component generates no text and accepts no semantic child content. It is always hidden from the
accessibility tree. The owning consumer supplies a visible loading message or an explicitly named
busy region; the skeleton does not set `aria-busy` on an ancestor.

Text skeletons generate a bounded number of visual lines. Block and circle shapes generate one
placeholder. Optional pulse motion is subtle, pauses under reduced motion, and never encodes
progress. Static presentation is the default.

### Public API

Attributes and properties:

- `shape: 'text' | 'block' | 'circle'`; default `text`.
- `lines: number`; integer from 1 through 8 for `text`, default `1`; ignored by other shapes.
- `motion: 'static' | 'pulse'`; default `static`.

Missing or unsupported shape and motion values normalize to `text` and `static`. Integer line counts
clamp from 1 through 8, with non-integers falling back to `1`.

Slots: none.

CSS parts:

- `base`
- `line`: repeated for text skeletons.
- `shape`: block or circle placeholder.

Events and methods: none.

The host supports component sizing tokens and ordinary author layout. It does not accept generated
sample text or arbitrary HTML dimensions as attributes.

### Example

```html
<section aria-busy="true" aria-labelledby="asset-loading">
  <p id="asset-loading">Loading asset summary</p>
  <wg-skeleton shape="text" lines="3"></wg-skeleton>
</section>
```

## `wg-empty-state`

### Purpose

`wg-empty-state` explains why one bounded collection or function has no content and identifies a
useful next action when one exists. Consumer copy distinguishes first use, no matching results,
filtered absence, completed work, and a genuine load failure.

The element does not infer emptiness, inspect a collection, change filters, fetch content, or choose
whether absence is positive or erroneous.

### Anatomy and semantics

The component is a named group with a visible heading, supporting explanation, optional media, and
optional actions. The required `label` supplies a stable accessible group name and normally matches
or concisely summarizes the visible heading. Media is supporting content and follows the accepted
media-content contract; it never replaces the explanation or next action.

The component has no live-region role. If a filtered result set becomes empty dynamically, the
application may add one deliberate status announcement while keeping this persistent composition
available.

### Public API

Attributes and properties:

- `label: string`; default empty, required accessible group name.

Slots:

- `heading`: required visible heading.
- default: required explanation.
- `media`: optional supporting `wg-media`, native image, or other nonessential visual.
- `actions`: optional consumer-authored actions.

CSS parts:

- `base`
- `marker`
- `media`
- `heading`
- `content`
- `actions`

Events and methods: none.

### Example

```html
<wg-empty-state label="No matching maintenance records">
  <h3 slot="heading">No records match these filters</h3>
  <p>Clear one or more filters to include completed and scheduled work.</p>
  <wg-button slot="actions" appearance="secondary">Clear filters</wg-button>
</wg-empty-state>
```

## `wg-offline-state`

### Purpose

`wg-offline-state` identifies a bounded source, function, or action that cannot currently
communicate. It preserves safe last-known context, identifies what is unavailable, and offers a
retry or alternate route when the application has one.

It does not monitor browser connectivity, infer service health, schedule retries, disable unrelated
controls, or declare last-known values stale or unknown. Applications render it from evidence
appropriate to the affected source rather than `navigator.onLine` alone.

### Anatomy and semantics

The component is a named persistent group. Its visual availability marker is distinct from condition
colors and is redundant to the required visible heading and explanation. Last-known content remains
in a dedicated slot so it is not presented as current without qualification.

The component has no automatic live role. Newly detected loss of availability may warrant one
deliberate announcement, but ongoing offline state remains discoverable in context. Retry controls
use the controlled-request model and keep pending or failed attempts visible.

### Public API

Attributes and properties:

- `label: string`; default empty, required accessible group name.

Slots:

- `heading`: required visible heading naming the affected scope.
- default: required consequence or guidance.
- `last-known`: optional explicitly qualified previous information.
- `actions`: optional retry or alternate-path controls.

CSS parts:

- `base`
- `marker`
- `heading`
- `content`
- `last-known`
- `actions`

Events and methods: none.

### Example

```html
<wg-offline-state label="Inventory source offline">
  <h3 slot="heading">Inventory source is offline</h3>
  <p>New counts and transfers are unavailable.</p>
  <p slot="last-known">
    Last successful update: <time datetime="2026-08-01T14:42:00Z">14:42 UTC</time>
  </p>
  <wg-button slot="actions" appearance="secondary">Retry inventory source</wg-button>
</wg-offline-state>
```

## `wg-stale-data-marker`

### Purpose

`wg-stale-data-marker` visibly qualifies one value or bounded region whose age exceeds an
application-owned freshness threshold. It expresses knowledge quality and never changes the
underlying domain condition.

### Anatomy and semantics

The required default slot contains visible text such as “Stale” plus optional consumer-formatted age
or observation time. Authors may use a native `time` element. Wayglass does not calculate age,
update clocks, choose thresholds, or localize timestamps.

The host has no status or alert role and is not focusable. When it qualifies a control or a value
whose accessible representation would otherwise omit freshness, the consumer gives the marker an ID
and includes it in that owner's explicit description relationship. Removing the marker is not relied
upon to announce refreshed data.

### Public API

Attributes, value-bearing properties, events, and methods: none.

Slots:

- default: required visible freshness text.

CSS parts:

- `base`
- `marker`
- `content`

### Example

```html
<wg-metric label="Queue latency" value="184" unit="ms" aria-describedby="queue-freshness">
</wg-metric>
<wg-stale-data-marker id="queue-freshness">
  Stale · observed <time datetime="2026-08-01T14:42:00Z">18 minutes ago</time>
</wg-stale-data-marker>
```

## Invalid anatomy and diagnostics

`wg-progress` diagnoses a missing or multiple direct native progress element and a progress element
without an explicit accessible name. Closed alert, badge, and skeleton values normalize to their
documented fallbacks rather than emitting diagnostics. The other persistent-feedback elements do not
inspect required visible content, action-slot interactivity, or stable labels at runtime.

Diagnostics do not repair markup, generate IDs, calculate state, add announcement roles, move nodes,
hide usable light-DOM content, or disable consumer-authored controls. Unsupported content remains
visible in production.

## Styling hooks

Alert, empty-state, and offline-state expose these element-level CSS custom properties:

- `--wg-feedback-color-background`;
- `--wg-feedback-color-border`;
- `--wg-feedback-color-text`;
- `--wg-feedback-color-detail`;
- `--wg-feedback-radius`;
- `--wg-feedback-space`;
- `--wg-feedback-space-related`; and
- `--wg-feedback-size-marker`.

Badge, progress, skeleton, and stale-data marker use the accepted semantic and component theme
tokens directly and expose no element-specific CSS custom properties in v1.

Themes may substantially adapt these values while the component anatomy and semantic axes remain
stable. Tokens do not provide a path to make offline look critical or stale look cautionary by
default.

## React contract

Typed React wrappers expose host attributes and ordinary children or named-slot conveniences. They
register and render the same custom elements. The `wg-progress` wrapper leaves the native React
`progress`, `label`, and `output` props, refs, and relationships untouched. Wrappers do not infer
announcement policy, calculate freshness, start timers, inspect connectivity, or translate slotted
action events.

## Validation coverage

The persistent-feedback browser suite and Phase 2E-B validation record cover:

- useful light-DOM fallback, passive focus behavior, and absence of implicit live roles;
- alert announcement modes with actions excluded from the live message node;
- native progress accessible names, determinate and indeterminate mappings, invalid anatomy, and
  useful pre-upgrade behavior;
- static and optional pulse skeletons hidden from the accessibility tree with reduced-motion
  suppression and no synthesized values;
- scoped offline presentation, retained qualified last-known context, and stale knowledge
  independent from condition;
- consumer-authored action focus order and retained native interaction;
- dark and light themes, forced colors, reduced motion, 320 CSS-pixel reflow, and supported browser
  engines; and
- production-backed domain-neutral stories plus typed React wrappers.

VoiceOver/Safari and NVDA/Firefox remain open pre-public-release evidence items.

## Continuing boundaries

- Toasts retain their separate transient-feedback contract.
- Confirmation dialogs retain their separate modal-feedback and proportional-friction contract.
- Error summaries remain application compositions until repeated form evidence justifies a generic
  pattern.
- Notification centers, background synchronization, retry policy, staleness calculations, relative
  time formatting, and connectivity monitoring remain application responsibilities.
- Animated illustrations, charts as loading placeholders, and domain-specific empty-state artwork
  are not part of the component contract.
