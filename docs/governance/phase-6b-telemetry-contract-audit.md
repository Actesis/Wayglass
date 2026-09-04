# Phase 6B telemetry contract audit

**Status:** Accepted by the project owner on September 3, 2026. This record reconciles
`wg-telemetry-strip` against its implementation, architecture decisions, documentation, React
binding, stories, and browser evidence. It changes no package version, privacy, registry, or
deployment state.

## Scope

The audit covers structured sample input; property-only bounds; defaults; validation and
diagnostics; connected runs, one-observation runs, explicit gaps, and knowledge boundaries; authored
semantic equivalence; state axes; slots; CSS parts and custom properties; responsive SVG rendering;
explicit registration; and React adaptation.

Sample creation, formatting, scale and window choice, aggregation, downsampling, interpretation,
exact-value inspection, announcements, thresholds, current truth, transport, and application state
remain consumer-owned.

## Result

The component remains aligned with ADRs 0024 and 0025. It accepts only narrow structured geometry
input, renders a bounded non-semantic SVG, and leaves one visible application-authored summary as
the accessible owner. It does not fetch, retain, format, infer, announce, focus, or emit events.

One rendering omission was corrected. A valid finite sample with a `null` or absent neighbor on both
sides forms a one-observation run, but the implementation previously produced neither a path nor a
point for it. The production sparse fixture therefore described five finite observations while only
its connected pair appeared in the graphic. One-observation runs now receive a private bounded point
carrying their authored knowledge treatment. This uses the accepted limited-point SVG architecture,
does not expose per-sample semantics or parts, and adds no public field or behavior.

The API now records the implemented `0`, `1`, `0`, and `1` defaults for time-window and scale
bounds. Future-tense proposal language is reconciled with the production implementation and
completed evidence. Current validation and continuing boundaries are stated directly.

## Frozen contract

- The component exposes label, a property-only readonly sample array, four property-only numeric
  bounds, and independent condition, knowledge, and activity fields with their implemented defaults.
- `TelemetrySample` retains only finite application-owned observation time, finite value or explicit
  `null`, and optional shared knowledge. Arrays contain at most 240 nondecreasing in-window samples
  whose finite values remain inside the authored scale.
- Valid geometry retains connected finite runs, one-observation finite runs, explicit gaps, and
  non-confirmed run boundaries. Invalid geometry is suppressed while authored content remains and a
  repeated diagnostic is deduplicated.
- Six slots keep heading, current context, logical time bounds, summary, and detail consumer-owned.
  Eleven CSS parts and thirteen intentional custom properties expose only bounded presentation.
- SVG geometry remains hidden and non-focusable. The host adds no live region, interaction, methods,
  or events and performs no request, resize observation, formatting, inference, or announcement.
- The module remains side-effect free and explicitly registered. React registers the production
  class and adds no sample, rendering, state, or event behavior.

## Validation

The field-level documentation suite passes all 146 checks. ESLint, element, documentation, and React
typechecks, the element build, the production documentation build, and all 17 React tests pass. The
focused telemetry and React browser matrix scheduled 69 cases across Chromium, Firefox, and WebKit:
all 67 applicable cases passed, with the two intentional non-Chromium timing skips. Coverage
includes explicit registration and fallback, property-only inputs, state separation, connected and
one-observation runs, gaps and knowledge boundaries, invalid-input diagnostics, silent replacement
and focus retention, React parity, 240-sample and twelve-by-120 load envelopes, themes, density,
RTL, forced colors, reduced motion, 320 CSS-pixel width, 200% text, Axe, and page containment.

## Remaining release evidence

VoiceOver/Safari and NVDA with Firefox on Windows remain open pre-public-release evidence for group
naming and reading order, authored summary equivalence, exclusion of SVG geometry, state output,
native time labels, silent replacement, and exact-value detail navigation. The Windows item remains
consistent with the existing deferred Windows-access decision.

## Project-owner decision

On September 3, 2026, the project owner accepted the telemetry contract audit and directed its merge
and continuation to status-collection reconciliation. This freezes the listed telemetry contract for
v1; later changes require explicit compatibility review. It does not authorize package publication.
