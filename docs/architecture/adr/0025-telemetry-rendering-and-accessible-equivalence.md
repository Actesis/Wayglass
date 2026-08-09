# ADR 0025: Render compact telemetry as hidden SVG beside authored readable content

- Status: accepted
- Date: 2026-08-09

## Context

Phase 3C needs to render up to 240 irregular telemetry samples in a responsive strip. The component
must show gaps and non-confirmed observations, remain useful in forced colors and at narrow widths,
and update without disturbing focus or announcements. It must also preserve meaningful content
before Custom Element upgrade and when visual geometry is unavailable.

Native HTML has no compact time-series primitive. Structured numeric input is justified because
Wayglass must calculate geometry, but those pixels or paths cannot become the only representation of
the data. A canvas-only solution would require a parallel semantic model. Rendering every point as
accessible SVG would create hundreds of low-value navigation nodes and still would not explain the
operational meaning of the shape. A full chart library would widen the dependency and product scope
before Wayglass has evidence for axes, legends, inspection, or multiple series.

The Phase 3C architecture proof validated this decision before token locking or production
implementation.

## Decision

### Use one internal SVG as non-semantic calculated presentation

`wg-telemetry-strip` will calculate a single-series graphic in an internal SVG with a normalized
`viewBox` and `preserveAspectRatio="none"`. It will use paths and limited point or boundary marks,
not one DOM element per accessible sample. The SVG and all descendants will be `aria-hidden="true"`
and non-focusable.

The SVG will use CSS custom properties, `currentColor`, stroke patterns, and geometry that remain
distinguishable when authored colors collapse. The first version will not animate. It will split
finite-value runs at explicit `null` gaps and will not interpolate across them.

ViewBox geometry will adapt to container size through normal SVG layout. The production component
will not use `ResizeObserver` unless the proof demonstrates that a CSS-sized viewBox cannot satisfy
containment or stroke requirements. It will not use canvas, measure text for geometry, poll, or
downsample according to rendered pixels.

### Keep accessible equivalence visible and consumer-authored

The host will expose one named group containing ordinary visible light-DOM heading, optional current
context, native time labels, a required authored summary, state text, and optional detail. Those
nodes—not the SVG—are the semantic owner.

The summary will describe the meaning needed for the compact overview task, including important
shape, recency, gap, and uncertainty. Wayglass will not calculate prose from samples because it does
not own thresholds, importance, precision, or domain interpretation. When exact sample inspection is
required, the application will provide a native table or list through a separate detail path.

This is functional equivalence, not a literal transcription of every point. The strip is unsuitable
when the task cannot be completed from the summary and current context without inspecting visual
coordinates.

### Accept only narrow property input

The component-local `TelemetrySample` type will contain numeric `observedAt`, numeric-or-null
`value`, and optional shared `Knowledge`. Samples, time-window bounds, and scale bounds will be
property-only calculation inputs. The component will not accept JSON attributes, fetch data, retain
history, aggregate, smooth, interpolate, or subscribe.

Applications will supply nondecreasing observations already bounded to an explicit time and value
window. Invalid input will suppress the graphic, preserve readable content, and generate one
deduplicated development warning. Empty data will not infer loading, failure, or unavailability.

### Treat updates as silent replacement

Assigning `samples` will redraw internal geometry without moving focus or scroll and without
emitting events. The strip will create no live region and will not announce point changes.
Applications own a separate bounded announcement when an update is important.

The supported envelope is one 240-sample strip and 12 strips with 120 samples each in the integrated
workspace. The reference performance gate remains the next-animation-frame usability requirement and
100-millisecond synchronous-task threshold from ADR 0024.

## Acceptance evidence

A disposable, production-independent browser fixture tested the proposed structure:

- pre-upgrade and graphic-removed content remains visible, ordered, and sufficient for the overview;
- upgraded output has one named group, no SVG accessibility-tree duplication, and no implicit live
  region;
- a normalized 240-sample series retains sample geometry and explicit gaps from 320 CSS pixels
  through wall-display width without page overflow or observer churn;
- confirmed and every non-confirmed knowledge state remain distinguishable through non-color
  patterns in normal color, grayscale, and forced colors;
- replacement retains focused authored content and produces no event or announcement;
- invalid, empty, sparse, irregular, repeated-time, and boundary data fail neutrally; and
- Chromium, Firefox, and WebKit pass the functional and automated accessibility fixture.

All 30 cases passed across Chromium, Firefox, and WebKit on August 9, 2026. The proof retained 240
irregular samples in four knowledge-run paths plus explicit gaps, resized from 320 CSS pixels
through wall width without recalculation or overflow, preserved authored focus during silent
replacement, and passed dark and light Axe scans. Forced-color and grayscale checks retained six
distinct stroke patterns. No browser-specific path, `vector-effect`, forced-color, or shadow-DOM
behavior required a change to the decision.

Visual review of dark desktop, dark phone, and light grayscale compositions found the line, authored
summary, time window, and gaps coherent at each width. Rendering a point for every sample was noisy
and unnecessary. Production implementation will use point marks only at non-confirmed run boundaries
and explicit gap boundaries. Full evidence is recorded in the
[Phase 3C architecture proof](../../accessibility/phase-3c-telemetry-architecture-proof.md).

## Consequences

- Telemetry stays lightweight, responsive, themeable, and independent of a chart dependency.
- Consumer-authored text remains useful before upgrade and becomes the single accessible semantic
  owner after upgrade.
- Applications must write an accurate summary and provide an exact-value detail path when their task
  needs one.
- Wayglass can render compact history from narrow structured input without adopting application data
  ownership.
- Individual points are not focusable or inspectable in the first version.
- Multiple series, axes, legends, annotations, thresholds, interactions, and generalized chart
  composition remain future contracts.

## Alternatives considered

### Canvas with a separate accessible description

Not selected for the proof. Canvas would add device-pixel sizing, resize measurement, and a wholly
parallel semantic representation while offering no necessary advantage at 240 samples.

### Accessible SVG points and paths

Rejected. Hundreds of graphic nodes create noisy navigation, coordinate data is not operational
meaning, and browsers and assistive technologies expose SVG semantics inconsistently.

### CSS bars or one HTML element per sample

Rejected. It creates unnecessary DOM volume, makes irregular time positioning and connected runs
awkward, and does not improve the readable equivalent.

### General charting dependency

Rejected for Phase 3C. It introduces axes, plugins, interaction, rendering policy, bundle cost, and
dependency lifecycle beyond the accepted compact-history scope.

### Generated textual summary

Rejected. The component cannot know which change, threshold, gap, recency rule, precision, or domain
meaning matters. Generated prose would look authoritative while silently embedding application
policy.

### Hidden table containing every sample

Rejected as the default. A 240-row hidden duplicate is burdensome, difficult to keep equivalent, and
not a useful overview. Applications provide a visible native table or list when exact inspection is
part of the task.
