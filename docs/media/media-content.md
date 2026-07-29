# Phase 2C media-content contract

**Status:** Proposed for Phase 2C review on July 29, 2026. The ownership and delivery model is
recorded in [ADR 0013](../architecture/adr/0013-native-media-ownership.md).

This contract adds domain-neutral image presentation without turning Wayglass into an asset store,
placing media URLs in shared function state, or making an image the only carrier of state,
instructions, or action meaning.

The initial primitive is `wg-media`. It frames exactly one consumer-authored `<img>` or `<picture>`
and coordinates stable sizing, deliberate cropping, loading and unavailable presentation, and an
optional inspection action. The application retains ownership of the actual media element, source
selection, alternative text, caption, request policy, authorization, and lifecycle.

## Why the native media remains consumer-authored

An image URL is application data, not shared Wayglass state. Native `<img>` and `<picture>` already
support:

- `alt`, intrinsic `width` and `height`, `srcset`, `sizes`, and art-directed `<source>` elements;
- `loading`, `decoding`, `fetchpriority`, `crossorigin`, and `referrerpolicy`;
- browser image decoding, caching, responsive selection, printing, and assistive technology;
- application-specific authenticated, proxied, generated, or local media sources.

Copying those capabilities into component attributes would create an incomplete parallel API and
make privacy, security, and framework behavior harder to reason about. `wg-media` therefore has no
`src`, `srcset`, `alt`, caption, or authentication properties and performs no network request.

## `wg-media`

### Purpose

`wg-media` provides a stable, themeable presentation boundary for one image-bearing piece of
content. It is suitable for:

- an asset or product photograph that helps a person identify the physical item;
- a diagram, map, screenshot, or annotated reference image;
- a camera still or other application-owned visual observation;
- an image that supplements maintenance, status, account, inventory, or instructional content.

Do not use it for icons, decorative surface texture, charts with their own semantic contract, video,
galleries, or arbitrary remote HTML.

### Module and registration

The side-effect-free module will ship from `@wayglass/elements/media`:

```ts
import { defineWgMedia } from '@wayglass/elements/media';
import '@wayglass/elements/media.css';

defineWgMedia();
```

Importing the module does not register the element. `@wayglass/react/media` will provide a typed
wrapper backed by the same element class. The opt-in stylesheet provides pre-upgrade state-slot
visibility and the public `wg-media-asset` treatment needed by an `<img>` nested inside `<picture>`.
A direct slotted `<img>` receives the same treatment from the component.

### Attributes and properties

- `aspect: auto | square | landscape | portrait | wide`; default `auto`.
- `fit: contain | cover`; default `contain`.
- `state: ready | loading | unavailable`; default `ready`.
- `boundary: none | subtle | strong`; default `subtle`.

Aspect values are content-capacity roles:

| Value       | Reserved ratio | Intended use                                                          |
| ----------- | -------------- | --------------------------------------------------------------------- |
| `auto`      | intrinsic      | The native media dimensions establish the ratio                       |
| `square`    | 1 / 1          | Square reference or identity imagery                                  |
| `landscape` | 4 / 3          | General horizontal photographs, diagrams, and screenshots             |
| `portrait`  | 3 / 4          | General vertical photographs and documents                            |
| `wide`      | 16 / 9         | Wide contextual imagery where the crop remains useful at that measure |

The ratios are not device classes. Applications may override `--wg-media-aspect-ratio` for a
deliberate domain requirement.

`contain` is the safe default because it preserves the complete image. `cover` is opt-in and may
crop content. A cover crop is acceptable only when no identifying detail, annotation, warning,
instruction, text, face, control, or other essential content can be lost. The focal point may be
tuned through `--wg-media-object-position`.

`state` describes this media resource's presentation, not the surrounding function's condition,
knowledge, activity, or domain value:

- `ready` displays the media normally;
- `loading` reserves the same geometry and displays the supplied loading presentation; a retained
  previously loaded image may remain visible beneath it;
- `unavailable` displays the supplied unavailable presentation instead of a broken or misleading
  image.

Applications update `state` from their own request lifecycle or native image `load` and `error`
events. Wayglass does not infer application truth, retry requests, or translate native events into
component events.

### Slots

- default: exactly one `<img>` or one `<picture>` whose final child is an `<img>`.
- `loading`: visible while `state="loading"`; concise text or a stable neutral placeholder.
- `unavailable`: visible while `state="unavailable"`; useful text that does not depend on the
  missing image.
- `inspection`: an optional consumer-authored native link or button for viewing the image at a
  larger size.

The loading and unavailable slots are presentation fallbacks, not substitutes for `alt`. Their text
must remain meaningful in the local context. They do not receive automatic live-region semantics;
applications add announcements only when an asynchronous change warrants interruption.

The inspection slot accepts an application-owned control because inspection may navigate to a source
file, open an existing application dialog, or enter a specialized viewer. `wg-media` does not open a
modal, create a lightbox, move focus, add keyboard shortcuts, or assume that the source can be made
public. The control's accessible name must identify both the action and subject, such as “View
full-size HVAC system image.”

The component does not infer whether inspection remains useful in loading or unavailable states.
Applications keep, hide, or disable that action according to the actual source and authorization
state, with an explicit explanation when it is unavailable.

### CSS parts

- `base`
- `viewport`
- `state`
- `inspection`

### CSS custom properties

- `--wg-media-aspect-ratio`
- `--wg-media-object-fit`
- `--wg-media-object-position`
- `--wg-media-color-background`
- `--wg-media-color-border`
- `--wg-media-border-size`
- `--wg-media-radius`
- `--wg-media-min-block-size`
- `--wg-media-state-space`

### Events and methods

None.

Native events remain on the consumer-authored image and inspection control. Consumers may use a ref
or ordinary DOM query when native image properties such as `complete`, `currentSrc`, or
`naturalWidth` are needed.

## Native semantics and authoring

### Alternative text

The final `<img>` always owns its native `alt`:

- informative images receive a concise alternative that communicates their useful visual content in
  context;
- decorative images use `alt=""`;
- a linked or actionable image still needs an accessible link or button name that describes the
  action;
- filename, URL, asset ID, camera ID, or “image of” boilerplate is not a useful alternative by
  itself.

`wg-media` never copies a caption into `alt`, invents text from a filename, runs image recognition,
or exposes a second image role. An unavailable image still needs surrounding text sufficient to
identify the subject and continue the task.

### Figures and captions

When a caption is useful, the consumer authors native `<figure>` and `<figcaption>` around
`wg-media`:

```html
<figure>
  <wg-media aspect="landscape" fit="contain">
    <picture>
      <source media="(min-width: 48rem)" srcset="/assets/hvac-wide.webp" />
      <img
        class="wg-media-asset"
        src="/assets/hvac.webp"
        width="1200"
        height="900"
        alt="Gray air handler with the filter access panel on its lower right side"
        loading="lazy"
        decoding="async"
      />
    </picture>
    <a slot="inspection" href="/assets/hvac-full.webp"> View full-size HVAC system image </a>
    <p slot="loading">Loading HVAC system image…</p>
    <p slot="unavailable">
      Image unavailable. The filter access panel is below the gray return duct.
    </p>
  </wg-media>
  <figcaption>Air handler in the north utility closet.</figcaption>
</figure>
```

A caption provides provenance, orientation, date, or supporting context. It does not replace
alternative text when the visual content itself matters. `wg-media` adds no `figure`, `group`,
landmark, or accessible-name semantics.

### Meaning outside the image

Media reinforces a function; it does not own the function. The following remain available as text or
semantic components outside the image:

- function and asset identity;
- current value, condition, knowledge, activity, and freshness;
- warnings, instructions, required steps, and action consequences;
- the location or identifying details needed when the image is unavailable;
- the primary action and its target scope.

Text embedded inside a photograph or screenshot is not treated as an accessible substitute for real
interface text.

## Responsive sizing and cropping

- The host fills the available inline size and has `min-inline-size: 0`.
- An explicit aspect reserves geometry before decode and prevents avoidable layout shift.
- `auto` uses native intrinsic dimensions; authors still provide `width` and `height` whenever
  known.
- The media and fallback presentations occupy the same viewport so loading and failure do not move
  surrounding content.
- `contain` may reveal neutral letterboxing; it does not stretch the image.
- `cover` clips only inside the viewport and never changes source, reading, or focus order.
- Phone, desktop, wall display, text enlargement, and zoom use the same markup.
- Layout primitives determine the media's available size. `wg-media` does not expose viewport
  breakpoints, fixed pixel widths, or visual ordering.

Responsive source selection belongs to native `srcset`, `sizes`, and `<picture>`. Applications
should not download wall-display imagery for a phone-sized presentation.

## Loading, retained imagery, and unavailable media

Loading and unavailable treatment is neutral. It must not use green, amber, or red unless a separate
surrounding condition genuinely warrants that meaning.

- Reserve the final geometry before the request begins.
- Prefer native lazy loading for below-the-fold images; do not lazy-load the primary above-the-fold
  image when doing so would harm the experience.
- A retained prior image may remain visible during refresh when it is explicitly identified as
  retained or stale in surrounding text.
- Do not present an old camera still, diagram, or photograph as current merely because its pixels
  remain available.
- Unavailable presentation keeps the subject label, useful nonvisual identification, instructions,
  and actions visible.
- Missing media never collapses an entire information section or function.
- Automatic retry, progressive backoff, offline caching, and authenticated refresh remain
  application responsibilities.

## Full-size inspection

Inspection is optional and must remain an ordinary, discoverable action rather than a hidden image
gesture.

- The visible or accessible label identifies the subject.
- Keyboard, touch, pointer, and screen-reader users reach the same action.
- Opening a new browsing context follows normal link conventions and is communicated when needed.
- A modal viewer must use the application's accessible dialog infrastructure, return focus to the
  invoking control, support Escape, and avoid trapping zoom or pan gestures.
- Inspection never exposes a higher-resolution private source to an unauthorized user.
- The image remains supplemental; closing or failing inspection does not lose surrounding state or
  task context.

An official Wayglass viewer or dialog integration is deferred until the overlay and dialog contracts
exist. This contract remains compatible with that future enhancement without requiring it.

## Privacy and security guidance

Image requests can disclose more than the pixels being shown. Applications must evaluate:

- whether a third-party host receives the user's IP address, referrer, cookies, identifiers, or
  viewing time;
- whether signed or authenticated URLs leak through logs, analytics, copied markup, browser history,
  screenshots, or long-lived caches;
- whether user uploads contain EXIF location, device, timestamp, face, serial-number, barcode, QR
  code, document, or account data;
- whether captions and alternative text reveal sensitive information even when the image itself is
  access-controlled;
- whether content-security policy, proxying, request credentials, CORS, referrer policy, and cache
  lifetime match the application's threat model;
- whether untrusted image formats and metadata are validated, size-limited, decoded safely, and
  stripped where appropriate.

`wg-media` performs no telemetry, prefetch, proxying, metadata extraction, recognition, or
transformation. Applications should prefer same-origin or explicitly trusted sources, minimize
request metadata, and obtain appropriate consent for cameras and personally identifying imagery.

## Client-only fallback

Before upgrade, the native image, picture, text alternatives, inspection control, and surrounding
figure remain in light DOM and source order. Correctness must not depend on cropping, overlays, or
the enhanced boundary.

Stateful loading and unavailable content must not make a false claim before upgrade. Implementation
will provide a small opt-in fallback stylesheet that applies the same `state` visibility rules
without requiring Custom Element registration. Applications that render named state slots must load
that stylesheet before content; otherwise they must author equivalent hiding rules. No fallback rule
may hide the default native image solely because JavaScript has not upgraded the element.

## Validation requirements

Implementation must cover:

- direct `<img>` and art-directed `<picture>` content;
- informative and decorative alternatives without duplicate image roles;
- native figure and caption relationships;
- auto, square, landscape, portrait, and wide aspects;
- contain and deliberately cropped cover presentation;
- loading with and without retained pixels;
- unavailable media with useful nonvisual identification and persistent actions;
- native `load` and `error` ownership without component event translation;
- inspection links and application-owned dialog buttons in keyboard and focus order;
- layout stability before decode and across state changes;
- long alternatives, captions, localization, 200% and 400% zoom, and text enlargement;
- right-to-left content, forced colors, reduced motion, and no color-only state;
- phone, desktop, and wall-display compositions in Chromium, Firefox, and WebKit;
- client-only fallback, side-effect-free registration, and typed React wrappers;
- failure cases where the image source, higher-resolution source, or network is unavailable.

Visual fixtures must include at least one identification photograph, one diagram or screenshot, one
decorative image, one retained/loading image, and one unavailable image. They must demonstrate that
media absence never hides state, instructions, or actions.

## Deferred decisions

- Galleries, carousels, comparison sliders, zoom/pan engines, annotations, and editing are not part
  of the primitive.
- Video, audio, live camera streams, charts, maps, and canvases require their own semantic and
  performance contracts.
- Wayglass does not provide storage, upload, transformation, CDN, authorization, or asset metadata
  schemas.
- A package-owned full-size viewer is deferred until dialog, overlay, and focus-management
  primitives are accepted.
- Media provenance, freshness, and trust may later receive a higher-level pattern; they do not add
  URL fields to the shared function state model.
