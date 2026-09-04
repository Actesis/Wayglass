# Phase 2F media-viewer contract

**Status:** Accepted, implemented, and cross-browser validated with framework-neutral and typed
React delivery plus a production-backed story for Phase 2F as of August 3, 2026. The architecture is
recorded in [ADR 0023](../architecture/adr/0023-native-modal-content-and-media-inspection.md) and
preserves the native media ownership accepted in
[ADR 0013](../architecture/adr/0013-native-media-ownership.md). Representative assistive-technology
review remains a public-release gate. Field-level v1 reconciliation was completed for project-owner
review on September 3, 2026.

This contract defines `wg-media-viewer`, a focused modal inspector for one consumer-authored image
or picture. It supplies consistent modality, close and focus-return behavior, fitting, actual-size
inspection, bounded zoom, and native scrolling without taking ownership of media sources or asset
workflows.

The framework-neutral element uses the side-effect-free `@wayglass/elements/media-viewer` module.
Consumers using a nested image inside `<picture>` also load `@wayglass/elements/media-viewer.css`
and apply `wg-media-viewer-asset` to the final `<img>`. The stylesheet also keeps an unupgraded
viewer hidden for the accepted client-only fallback.

## Design invariants

- The application authors exactly one native `<img>` or `<picture>` and retains its complete source,
  alternative-text, request-policy, authorization, and lifecycle API.
- The viewer owns exactly one native modal dialog. It does not open `wg-dialog` inside itself or
  turn `wg-media` into an implicit trigger.
- The action that opens inspection is explicit and names the subject. Clicking the image is not the
  only invocation path.
- The image remains supplemental. Identity, state, instructions, warnings, and actions remain
  available outside the viewer.
- Fit is the safe initial view. Actual size means one intrinsic image pixel per CSS pixel and never
  enlarges beyond the image's intrinsic resolution.
- Zoom is bounded between the fitted scale and actual size. Panning uses a native scroll container;
  wheel and browser pinch-zoom gestures are not captured for custom zoom.
- Loading and unavailable presentation are neutral and never imply system condition.
- Closing preserves the underlying task and returns focus to the inspection control or explicit
  fallback.

## Relationship to `wg-media`

`wg-media` remains the in-page presentation boundary. Its `inspection` slot can contain the button
or link that calls `wg-media-viewer.show()`. Neither component discovers or controls the other, and
the viewer does not move or clone the in-page image.

The application authors the native media inside the viewer. It may use the same source selection as
the in-page image or a separately authorized higher-resolution source. This deliberate second native
element avoids reparenting visible content, changing the in-page accessibility tree, guessing at
credentials, or copying an incomplete image API.

## Public API

### Attributes and properties

- `viewer-id: string`; required nonempty identity unique among `wg-media-viewer` instances in the
  document.
- `open: boolean`; requests modal presentation after upgrade and reflects actual native lifetime.
- `state: 'ready' | 'loading' | 'unavailable'`; default `ready`; application-coordinated media
  presentation state.
- `initial-view: 'fit' | 'actual-size'`; default `fit`.
- `close-label: string`; required localized visible close label.
- `zoom-in-label: string`; required localized visible zoom-in label.
- `zoom-out-label: string`; required localized visible zoom-out label.
- `fit-label: string`; required localized visible fit label.
- `actual-size-label: string`; required localized visible actual-size label.

`state` describes only this media resource. Wayglass does not infer it from native image events,
retry requests, or translate it into function condition, knowledge, or activity.

`initial-view="actual-size"` is honored only after intrinsic dimensions are available. While
loading, the viewer retains its stable viewport and disables scale controls. Unavailable media keeps
the heading, contextual text, and close path visible.

### Slots

- `heading`: required visible heading naming the inspected subject.
- default: exactly one native `<img>` or `<picture>` whose final child is an `<img>`.
- `caption`: optional visible caption, provenance, orientation, or date.
- `context`: optional concise task context or identification that remains useful without the image.
- `loading`: optional stable loading presentation shown for `state="loading"`.
- `unavailable`: required useful fallback for `state="unavailable"`.

The final image owns `alt`. Caption and context do not replace alternative text. The viewer does not
generate a figure role, infer a caption, expose filenames, or announce loading automatically.

### Methods

- `show(options?: { invoker?: HTMLElement; fallbackFocus?: HTMLElement }): boolean`; requests modal
  presentation and reports whether it was accepted.
- `close(reason?: 'programmatic'): boolean`; closes an open viewer.
- `fit(): boolean`; returns to the fitted scale and scroll origin.
- `actualSize(): boolean`; selects one intrinsic pixel per CSS pixel when dimensions are available.
- `zoomIn(): boolean`; advances one bounded step toward actual size.
- `zoomOut(): boolean`; retreats one bounded step toward fit.

Zoom methods return `false` when the viewer is closed, media is not ready, intrinsic dimensions are
unavailable, or the requested bound has already been reached. They do not mutate the native image's
attributes.

### Events

- `wg-media-viewer-open`: bubbles and crosses shadow boundaries; not cancelable. Detail is
  `{ viewerId: string }`.
- `wg-media-viewer-close`: bubbles and crosses shadow boundaries; not cancelable. Detail is
  `{ viewerId: string; reason: 'close-control' | 'escape' | 'programmatic' }`.
- `wg-media-view-change`: bubbles and crosses shadow boundaries; not cancelable. Detail is
  `{ viewerId: string; view: 'fit' | 'actual-size' | 'zoomed'; scale: number }`.

`scale` is the rendered CSS scale relative to intrinsic size: `1` is actual size and a fitted image
is normally less than `1`. The event supports visible readout and testing; it is not application
state and does not request persistence.

### CSS parts

- `dialog`
- `surface`
- `header`
- `heading`
- `close-button`
- `viewport`
- `media`
- `caption`
- `context`
- `state`
- `state-loading`
- `state-unavailable`
- `controls`
- `zoom-out-button`
- `zoom-in-button`
- `fit-button`
- `actual-size-button`
- `scale-readout`

`wg-media-viewer` exposes no element-specific CSS custom properties in v1. Intrinsic measurements
remain private controller output, while themes adapt the locked viewer component tokens. The opt-in
`media-viewer.css` stylesheet and its `wg-media-viewer-asset` class remain the supported
progressive-enhancement treatment for an image nested inside `<picture>`.

## Scale and pan behavior

Fit computes the largest scale no greater than `1` that contains the complete intrinsic image in the
available viewport. Small images remain at actual size and are not interpolated upward. Actual size
uses scale `1`. Intermediate steps form a stable implementation-defined progression between those
bounds; applications do not set arbitrary numeric scale.

The viewport is a labeled, programmatically focusable native scroll region only when overflow
exists. At fit it is removed from the sequential focus order. At larger scales it supports native
scrollbars, touch panning, trackpad scrolling, and keyboard scrolling without a custom drag-only
interaction. Zoom controls preserve the image point nearest the viewport center when practical so a
person does not lose the area under inspection.

The component does not bind Ctrl/Command plus or minus, browser zoom shortcuts, wheel gestures, or
pinch gestures. It does not disable browser page zoom or overscroll globally. Reduced motion removes
animated scale transitions; no understanding depends on animation.

Visible controls expose disabled bounds and a textual percentage readout rounded for display. Hue
and icons may reinforce them but visible or accessible labels carry meaning. Forced-colors mode
retains boundaries, focus, disabled state, and scroll affordances.

## Responsive and failure behavior

- The dialog uses the available visual viewport and safe-area spacing without a fixed device size.
- Header, context, caption, and controls remain visible or reachable without overlapping the media.
- The media viewport absorbs remaining block space and becomes the pan container when needed.
- Orientation change and dialog resize recompute fit without changing actual-size intent.
- A loading or unavailable transition preserves modal identity, close behavior, and useful text.
- A native image error does not automatically close the viewer or claim that the surrounding asset
  is unavailable.

## Privacy and scope boundaries

Applications remain responsible for authorization, signed URL lifetime, CSP, CORS, referrer policy,
cache behavior, telemetry, downloads, and source disclosure. The viewer performs no fetch, retry,
prefetch, proxy, transformation, recognition, metadata extraction, or download.

Phase 2F does not add galleries, next/previous navigation, carousels, comparison, annotations,
editing, cropping, video, camera controls, fullscreen API integration, or asset management. Those
features require distinct source, state, shortcut, focus, and privacy contracts.

## Validation coverage

Automated component, React, and browser tests cover progressive fallback, exact native image
anatomy, labeling, native modal ownership, shared modal conflict rejection, fit, actual size,
bounded zoom, native scroll-region pan, center preservation, loading and unavailable states, event
details, close reasons, focus return, closed-vocabulary normalization, both themes, Axe, forced
colors, reduced motion, 200% text, and 320 CSS-pixel reflow. Representative VoiceOver with Safari
and NVDA with Firefox checks remain explicit public-release evidence gates; automated evidence does
not establish spoken entry, image navigation, scale-control output, scrolling context, or focus
return.
