# Phase 3C telemetry-strip contract

**Status:** Accepted on August 9, 2026. This contract defines the Phase 3C boundary for
`wg-telemetry-strip`. Its fallback, resize, forced-colors, and high-volume architecture proof
passed, and [ADR 0025](../architecture/adr/0025-telemetry-rendering-and-accessible-equivalence.md)
is accepted. The required public tokens, framework-neutral element, typed React wrapper,
production-backed stories, and automated cross-browser validation are complete. Representative
manual assistive-technology review remains a public-release gate; see the
[Phase 3C validation record](../accessibility/phase-3c-telemetry-validation.md).

`wg-telemetry-strip` presents a compact recent history beside an application-authored readable
summary. It helps a person recognize shape, continuity, and recency at a glance without becoming a
general chart, exact-value explorer, transport consumer, or source of current truth.

The component follows the accepted [operational-data ownership contract](./operational-data.md) and
[ADR 0024](../architecture/adr/0024-operational-data-ownership-and-updates.md). Applications own the
samples, time and value windows, formatting, aggregation, downsampling, interpretation, and update
policy. Wayglass owns bounded rendering, visible structure, state presentation, and accessible
equivalence.

## When to use

Use a telemetry strip when recent history materially improves interpretation of an operational
value, such as whether throughput has been steady, a queue has varied, or observations contain a
gap. It is appropriate for a compact monitor section, metric group, value tile, or status detail.

Use `wg-metric` or `wg-key-value` when only the present value matters. Use an application-authored
table, list, or future chart primitive when people must inspect exact samples, compare several
series, select a range, correlate annotations, or navigate axes.

## Ownership and semantic scope

The application owns:

- sample creation, identity, timestamp source, ordering, retention, and replacement;
- the time window, numeric scale, units, precision, aggregation, and any downsampling;
- whether a missing observation is a deliberate gap, unavailable input, or omitted history;
- the readable label, current-value context, time-window labels, summary, and known-state meaning;
- whether the history is important enough to announce; and
- an exact-value table or detail view when the task requires one.

Wayglass owns:

- mapping valid numeric samples into one bounded visual strip;
- preserving explicit gaps and authored sample knowledge without interpolation;
- responsive geometry that retains every supplied sample within the accepted envelope;
- non-color distinctions for gaps and non-confirmed observations; and
- keeping the visual rendering hidden from the accessibility tree while the readable authored
  equivalent remains ordinary visible content.

The strip does not derive or update a current value from the last sample. It does not infer a trend,
condition, freshness threshold, outage, or forecast from geometry. The application may compose a
`wg-metric`, `wg-key-value`, or native text in the `current` slot when present-value context belongs
beside the history.

## Anatomy

The component contains:

1. a required visible light-DOM heading, with `label` as its accessible fallback;
2. optional application-authored current-value context;
3. one internal, non-semantic telemetry graphic;
4. visible logical-start and logical-end time-window labels;
5. a required visible light-DOM textual summary; and
6. visible condition, knowledge, and activity text when those axes are non-default.

The summary communicates the operational meaning needed for the overview task. It is not generated
from raw samples. For example: “Queue depth varied between 18 and 31, with one five-minute gap; the
latest confirmed observation was 24.” When exact sample values matter, the application provides a
separate native table or list and an authored control or link to reach it.

## Structured sample input

Telemetry is the Phase 3 exception where narrow structured input is justified: the component must
calculate geometry. The component-local type is:

```ts
import type { Knowledge } from '@wayglass/core';

export interface TelemetrySample {
  readonly observedAt: number;
  readonly value: number | null;
  readonly knowledge?: Knowledge;
}
```

- `observedAt` is a finite application-owned numeric instant, normally epoch milliseconds. It is
  calculation input and is never formatted or announced by Wayglass.
- `value` is a finite number or `null`. `null` creates an explicit gap and is never coerced to zero
  or interpolated.
- `knowledge` qualifies that observation and defaults to `confirmed`. It never changes the value or
  supplies condition. Non-confirmed observations receive a non-color visual treatment; their exact
  meaning remains in the authored summary or detail.

Samples must be in nondecreasing `observedAt` order and inside the inclusive authored time window.
Equal timestamps are allowed because separate observations can occupy the same instant. The
component reads but never mutates the assigned array or records. Consumers replace the `samples`
property after changing data; in-place mutation does not trigger rendering.

The component does not generate sample identifiers. Structured samples have no focus, selection,
disclosure, action, or individual accessibility-tree nodes, so durable interaction identity is not
needed inside the strip.

## Time window and scale

The application supplies finite `windowStart`, `windowEnd`, `scaleMinimum`, and `scaleMaximum`
properties. `windowEnd` must be greater than `windowStart`; `scaleMaximum` must be greater than
`scaleMinimum`. The numeric values control geometry only.

Visible `window-start` and `window-end` slots communicate formatted time context and should normally
contain native `<time datetime="…">` elements. Earliest time is placed at logical inline start and
latest time at logical inline end, so the composition follows document direction without reversing
the semantic source order.

The scale is application-owned and remains stable across related strips when visual comparison is
intended. Wayglass does not automatically widen or narrow it, clamp data, calculate thresholds, or
format bound labels. Values outside the scale make the structured input invalid rather than being
silently clipped.

## Gaps and observation knowledge

Each contiguous run of finite values is drawn separately. A one-observation run is retained as a
bounded point. A `null` sample breaks the run and leaves a deliberate visible gap. Wayglass does not
connect across it or imply a missing value.

Confirmed, inferred, stale, unknown, conflicting, and unavailable observations retain distinct
authored knowledge. Color may support recognition, but line pattern, point treatment, or another
non-color geometry must preserve the distinction in grayscale and forced colors. The component does
not rank knowledge states or combine them into a series-wide result.

The strip-level `knowledge` property qualifies the application-authored history as a whole; sample
knowledge qualifies individual observations. The visible summary must explain any sample-level
uncertainty that matters to the task. The optional strip-level `condition` remains independent and
must be supplied only when the application knows what condition the named history represents.

## Invalid, empty, and updating input

Invalid structured input produces no telemetry path, preserves all authored readable content, and
emits one deduplicated development warning. Invalid input includes non-finite numbers, reversed or
zero-length windows, invalid scales, samples outside the window, descending timestamps, and values
outside the scale.

An empty sample array is not automatically loading, unavailable, or an error. The application sets
the applicable knowledge/activity and writes an accurate summary. Initial loading and failure may
compose Phase 2 feedback; background refresh retains the existing strip and sets
`activity="pending"` rather than erasing known history.

Replacing `samples` updates the graphic without moving focus, scroll, or selection and without
emitting an event. The component creates no live region and performs no polling. Applications author
one bounded announcement elsewhere when a telemetry update warrants interruption.

## Interaction and keyboard behavior

The first telemetry strip is display-only. The host and graphic are not focusable, provide no
tooltip, hover-only disclosure, pointer capture, pan, zoom, cursor, or keyboard commands, and emit
no events. Slotted links or controls retain their native behavior, but the initial contract provides
no dedicated action slot.

Interactive inspection, range selection, crosshairs, exact-value tooltips, and synchronized strips
require a separate proposal with keyboard, touch, screen-reader, focus, and responsive evidence.

## Accessibility

The component exposes one named group containing the visible heading, current context, time labels,
summary, and state text. The internal graphic is `aria-hidden="true"` and `focusable="false"`; SVG
paths, points, and gaps never become a second semantic owner.

The required visible light-DOM summary is the accessible equivalent for the overview task. It must
state the important pattern, time context, gap or uncertainty, and latest observation when those
facts matter. It cannot be replaced with `aria-label`, hidden point text, a tooltip, or color.
Pre-upgrade light-DOM heading, current context, time labels, and summary remain readable.

No implicit `aria-live`, `role="status"`, `role="alert"`, `aria-atomic`, or per-sample announcement
is created. State vocabulary follows the shared condition, knowledge, and activity model and remains
visible when non-default.

## Responsive and visual behavior

The strip fills its container without establishing page-level overflow. A normalized SVG `viewBox`
is the rendering basis, so resizing changes the rendered viewport rather than the data or semantic
content. Every supplied sample is retained up to the 240-sample validation envelope; the component
does not downsample according to pixels or device capabilities.

At narrow widths, current context and summary reflow as text while the graphic retains a bounded
minimum block size. Time labels remain at logical ends and may wrap. Essential text is never
truncated. At 320 CSS pixels and 200% text, the page remains contained and readable.

The first version uses no entry, draw, pulse, or update animation. Reduced motion therefore requires
no alternate data behavior. Forced colors must preserve the path, points, gaps, focusable authored
controls, and observation distinctions using system colors plus geometry or line pattern. Themes may
substantially adapt color, weight, surface, and spacing without changing those meanings.

## API

### Attributes and properties

- `label: string`: required visible and accessible fallback heading.
- `samples: readonly TelemetrySample[]`: property-only structured rendering input; default `[]`.
- `windowStart: number`: property-only numeric start of the inclusive time window; default `0`.
- `windowEnd: number`: property-only numeric end of the inclusive time window; default `1`.
- `scaleMinimum: number`: property-only numeric lower rendering bound; default `0`.
- `scaleMaximum: number`: property-only numeric upper rendering bound; default `1`.
- `condition: Condition`: authored condition of the named history; default `neutral`.
- `knowledge: Knowledge`: authored knowledge of the named history; default `confirmed`.
- `activity: Activity`: authored history-update activity; default `idle`.

Numeric inputs remain property-only to avoid serialized data and ambiguous precision in attributes.
Condition, knowledge, activity, and label reflect to attributes consistently with existing Wayglass
display components.

### Slots

- `heading`: required visible light-DOM heading; `label` remains the accessible and post-upgrade
  fallback.
- `current`: optional application-authored present-value context.
- `window-start`: required visible formatted start label, preferably native `<time>`.
- `window-end`: required visible formatted end label, preferably native `<time>`.
- `summary`: required visible light-DOM readable equivalent.
- `detail`: optional concise readable qualification or link to exact sample data.

### Events and methods

None.

### CSS custom properties

- `--wg-telemetry-strip-color-background`
- `--wg-telemetry-strip-color-graphic-background`
- `--wg-telemetry-strip-color-border`
- `--wg-telemetry-strip-color-heading`
- `--wg-telemetry-strip-color-current`
- `--wg-telemetry-strip-color-series`
- `--wg-telemetry-strip-color-context`
- `--wg-telemetry-strip-color-state`
- `--wg-telemetry-strip-radius`
- `--wg-telemetry-strip-space`
- `--wg-telemetry-strip-space-related`
- `--wg-telemetry-strip-size-graphic-block`
- `--wg-telemetry-strip-width-series`

Knowledge-state colors use the shared semantic knowledge tokens. Dash patterns, viewBox geometry,
path grouping, point radius, and gap-mark height remain fixed private mechanics so themes cannot
erase their non-color distinctions or imply an unsupported chart API.

### CSS parts

- `base`
- `header`
- `heading`
- `current`
- `graphic`
- `window`
- `window-start`
- `window-end`
- `summary`
- `state`
- `detail`

Internal per-run paths and individual sample marks are not exposed as stable parts in the first
contract. Applications should not restyle knowledge patterns into a conflicting language.

## Example

```html
<wg-telemetry-strip id="queue-history" label="Queue depth" knowledge="stale">
  <h3 slot="heading">Queue depth</h3>
  <p slot="current">Latest observation: 24</p>
  <time slot="window-start" datetime="2026-08-09T18:00:00Z">11:00</time>
  <time slot="window-end" datetime="2026-08-09T19:00:00Z">12:00</time>
  <p slot="summary">
    Queue depth varied between 18 and 31, with one five-minute gap. Latest confirmed observation:
    24.
  </p>
</wg-telemetry-strip>

<script type="module">
  import { defineWgTelemetryStrip } from '@wayglass/elements/telemetry-strip';

  defineWgTelemetryStrip();
  const strip = document.querySelector('#queue-history');
  strip.windowStart = Date.parse('2026-08-09T18:00:00Z');
  strip.windowEnd = Date.parse('2026-08-09T19:00:00Z');
  strip.scaleMinimum = 0;
  strip.scaleMaximum = 40;
  strip.samples = queueSamples;
</script>
```

## Architecture-proof result

The disposable browser fixture proved:

1. useful visible and accessible content before Custom Element registration and with the internal
   graphic removed;
2. one non-duplicated named group after upgrade, with the SVG excluded from the accessibility tree;
3. resize from phone through wall widths without reprocessing, dropped samples, observer loops, or
   page overflow;
4. confirmed, stale, unavailable, and gap distinctions in normal color, grayscale, and forced colors
   without relying on color alone;
5. 240 samples, irregular intervals, repeated timestamps, multiple gaps, and all supported knowledge
   states within the next-animation-frame and 100-millisecond regression envelope; and
6. stable authored text, focus, and absence of announcements while the series is replaced.

All 30 cases passed across Chromium, Firefox, and WebKit. The fixture and evidence remain in the
[Phase 3C architecture-proof record](../accessibility/phase-3c-telemetry-architecture-proof.md).
Automated accessibility results do not replace the representative VoiceOver/Safari and NVDA/Firefox
gates assigned during production validation.

## Validation coverage

Current automated coverage verifies property-only samples and numeric bounds, all supported sample
knowledge values, independent strip state, connected and one-observation finite runs, explicit gaps,
empty and invalid input, deduplicated diagnostics, authored semantic equivalence, silent array
replacement with stable focus, explicit registration, and React property assignment. The production
fixtures also cover 240 samples, twelve simultaneous 120-sample strips, irregular and repeated
times, themes, density, RTL, forced colors, grayscale, reduced motion, 320 CSS-pixel width, 200%
text, Axe, and page containment.

## Continuing boundaries

Multiple series, arbitrary axes, legends, annotations, thresholds, bands, stacking, forecasting,
interpolation, smoothing, aggregation, component-owned downsampling, streaming transport, retained
history, tooltips, point inspection, range selection, pan, zoom, export, and a reusable chart
package remain outside Phase 3C.

## Decisions resolved by the architecture proof

1. A required authored summary is the accepted equivalence boundary for the compact overview. An
   adjacent native table or list remains necessary when exact sample inspection is part of the task.
2. Observation-level `knowledge` remains in the input type. Distinct path and gap patterns preserved
   its meaning without converting knowledge into condition or series-wide state.
3. Production rendering marks only non-confirmed run boundaries, one-observation finite runs, and
   explicit gap boundaries. Marking every one of 240 samples added noise without improving the
   overview or semantics.
