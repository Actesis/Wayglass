# Phase 2F content-dialog contract

**Status:** Accepted, implemented, and cross-browser validated with framework-neutral and typed
React delivery plus a production-backed story for Phase 2F as of August 3, 2026. Representative
assistive-technology review remains a public-release gate. The architecture is recorded in
[ADR 0023](../architecture/adr/0023-native-modal-content-and-media-inspection.md).

This contract defines `wg-dialog`, a general modal surface for application-authored information and
bounded interactions. It provides dependable native modality, labeling, dismissal, focus entry,
focus return, and responsive containment without becoming a workflow engine or a universal overlay.

Use it when a person must temporarily focus on content or a bounded task while retaining a clear
path back to the invoking context. Do not use it for ordinary progressive disclosure, navigation,
tooltips, menus, drawers, notifications, or decisions served by the narrower
`wg-confirmation-dialog`.

## Design invariants

- One shadow-owned native `<dialog>` opened with `showModal()` is the only modal and semantic owner.
- A visible heading identifies the content or task. The component never relies on an icon, filename,
  or invoker label as its accessible name.
- A component-owned visible close control is always available. Escape closes. Backdrop interaction
  does not dismiss.
- Consumer-authored content and actions remain in light DOM and retain their native semantics.
- The application owns workflow state, validation, submission, authorization, side effects, and
  durable outcomes. The dialog owns only its presentation lifetime.
- At most one Wayglass modal is open in a document. Confirmations, content dialogs, and media
  viewers do not stack, nest, or queue.
- Closing returns focus to a usable invoker or an explicit logical fallback. Wayglass does not guess
  a domain destination.
- The surface remains usable at 320 CSS pixels and 200% text size through internal scrolling.
- Client-only fallback never exposes apparently modal content as an operative unupgraded surface.

## Ownership and anatomy

`wg-dialog` renders one native `<dialog>` in its shadow root. The internal dialog contains a visible
heading region, component-owned close button, slotted body, and optional slotted actions. The host
is not a focus stop and receives no duplicate dialog role.

The component owns:

- native modal presentation and reflected `open` state;
- accessible association with its visible heading;
- responsive surface containment and internal overflow;
- initial focus according to the accepted policy;
- the visible close control, Escape handling, and close reasons;
- shared one-modal-at-a-time coordination; and
- focus return to a recorded invoker or explicit fallback.

The application owns:

- when a modal interruption is appropriate;
- the heading, content, actions, and localized close label;
- form ownership, validation, submission, pending state, and errors;
- application cancellation or save/discard policy;
- authorization, analytics, routing, history, and durable effects; and
- a logical focus fallback when the invoker may disappear.

`wg-dialog` does not inherit from or render `wg-confirmation-dialog`. Both use the same private
modal lifecycle utilities while keeping their public semantics and allowed content distinct.

## Public API

### Attributes and properties

- `dialog-id: string`; required nonempty identity unique among `wg-dialog` instances in the
  document.
- `open: boolean`; requests modal presentation after upgrade and reflects actual native lifetime.
- `close-label: string`; required localized visible label for the close control.
- `initial-focus: 'heading' | 'close' | 'first-interactive'`; default `heading`.
- `size: 'compact' | 'standard' | 'wide'`; default `standard`; a content-capacity role, not a
  viewport breakpoint.

Setting `open` before upgrade requests opening once the component is ready. Missing required
content, a duplicate ID, another active modal, or native opening failure removes `open`, leaves the
component closed, and produces a development diagnostic. The component never falls back to a
nonmodal native `open` attribute.

`initial-focus="heading"` focuses the internal visible heading container with `tabindex="-1"` so a
person encounters the title and reads forward. `close` focuses the visible close control.
`first-interactive` focuses the first usable, sequentially focusable consumer control in flattened
content and falls back to the heading. Positive `tabindex` and elements inside inert or hidden
subtrees are excluded. Consumer `autofocus` is not a second focus policy and is ignored.

### Slots

- `heading`: required concise visible heading.
- default: required application-authored modal content.
- `actions`: optional bounded application-authored actions associated with the content.

The default slot may contain prose, lists, figures, and forms. Rich body content is not assigned to
`aria-describedby`; screen-reader users encounter it in document order after the heading. The
application supplies explicit labels, descriptions, error relationships, field grouping, and live
feedback inside its content.

The actions slot does not give the component workflow semantics. Applications use ordinary buttons
and event handlers, then call `close()` when their workflow permits. Native `formmethod="dialog"`
and consumer-authored direct calls to an internal dialog are unsupported because they bypass the
public close-reason and focus-return contract.

### Methods

- `show(options?: { invoker?: HTMLElement; fallbackFocus?: HTMLElement; initialFocus?: HTMLElement }): boolean`;
  requests modal presentation and reports whether it was accepted. A usable explicit `initialFocus`
  takes precedence over the attribute policy and must be a descendant of the component's flattened
  content.
- `close(reason?: 'programmatic'): boolean`; closes an open dialog and reports whether it was open.
- `focus(options?: FocusOptions): void`; focuses the configured initial target while open.

Setting `open = true` is equivalent to `show()` without explicit options. Reopening the already open
instance is idempotent and does not replace its remembered focus references.

### Events

- `wg-dialog-open`: bubbles and crosses shadow boundaries; not cancelable. Detail is
  `{ dialogId: string }`.
- `wg-dialog-close`: bubbles and crosses shadow boundaries; not cancelable. Detail is
  `{ dialogId: string; reason: 'close-control' | 'escape' | 'programmatic' }`.

These events report presentation lifetime only. They are not cancellation of application work,
submission, success, navigation, or analytics evidence.

### CSS parts

- `dialog`
- `surface`
- `header`
- `heading`
- `close-button`
- `body`
- `actions`

## Dismissal and focus return

The visible close control closes with `close-control`; native Escape closes with `escape`; `close()`
or `open = false` closes with `programmatic`. Pointer interaction with the backdrop does nothing. An
application that needs save/discard negotiation intercepts its own workflow actions before asking
the component to close; it does not disable Escape and transform a content dialog into an
inescapable modal.

On close, focus returns without scrolling to the recorded invoker when it remains connected,
visible, enabled, and focusable. Otherwise the component uses the explicit `fallbackFocus`. If
neither is usable, it leaves focus at the browser's valid destination and produces a development
diagnostic. Removal, disablement, or replacement of the invoker requires the application to supply
the next logical workflow location.

## Explicit boundaries

This component does not provide nonmodal mode, nested dialogs, modal queues, portals, arbitrary
anchored positioning, dragging, resizing, route management, dirty-state interception, or automatic
submission. Drawers, tooltips, teaching overlays, command palettes, and popovers require separate
contracts because their focus, positioning, modality, and dismissal rules differ.
