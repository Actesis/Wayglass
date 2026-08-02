# Phase 2E-C transient-feedback contracts

**Status:** Accepted and implemented for Phase 2E-C on August 2, 2026; final validation remains
open. Typed React wrappers and production-backed stories use the same coordinator. Shared
persistence, interruption, modality, condition, and state ownership follow the accepted
[feedback-state contract](./feedback-state.md) and
[ADR 0020](../architecture/adr/0020-feedback-delivery-and-lifetime.md).

This milestone defines `wg-toast` and `wg-toast-region`. A toast is a brief acknowledgement whose
durable result or recovery path is already visible or discoverable elsewhere. The region is the one
framework-neutral coordinator for ordering, visible queue bounds, deduplication, announcements,
expiry, pausing, and dismissal.

Toasts do not replace persistent outcomes, validation messages, pending state, degraded knowledge or
availability, destructive consequences, or instructions required to complete a task.

## Design invariants

- One region coordinates one document-level toast channel. Independent feature timers are invalid.
- A toast appearing never moves focus. Dismissal never restores focus to the control that originally
  caused the toast. When a person explicitly enters the toast stack and uses its close control, the
  region returns focus to the element that held focus immediately before stack entry when that
  element remains usable.
- Visible condition and announcement priority are independent. Critical styling does not imply an
  assertive announcement.
- The visible toast is not itself a live region. The coordinator sends message text through one
  private polite or assertive announcement path and excludes controls from that text.
- Static initial markup is not announced. Only a toast opened after the region is ready enters the
  announcement path.
- Expiry pauses while the toast or region has pointer hover, contains focus, the document is hidden,
  or reduced-motion review tooling explicitly pauses presentation.
- A timed toast resumes with its remaining duration; pause and resume never restart the full timer.
- Dismissal changes presentation lifetime, not application outcome state.
- Actions retain their own native events and pending behavior. The region never assumes that an
  action succeeded and does not dismiss merely because an action was invoked.
- Visible text carries meaning. Hue, iconography, motion, placement, and sound are never required.

## Ownership and DOM model

`wg-toast-region` coordinates direct `wg-toast` children. Applications append a newly requested
toast or render it with `open`; the region owns its visible position, queue state, announcement, and
remaining presentation lifetime. When the region dismisses a toast, it removes `open` and emits a
dismissal event. The application may then remove the element or its corresponding framework state.

The application continues to own the outcome record, durable destination, message wording,
condition, announcement priority, deduplication identity, and any action side effect. Recreating a
dismissed toast does not restore its previous timer. Reusing a `toast-id` while the old request
still exists is invalid.

Direct children are required so ordering and ownership remain inspectable in ordinary DOM. A region
does not discover toasts across shadow roots, subscribe to a global event bus, portal arbitrary
content, or synchronize other documents or browser tabs.

## `wg-toast-region`

### Purpose and semantics

The region presents a logical stack at a viewport edge without becoming a modal overlay. It limits
simultaneously visible toasts and keeps later requests queued in insertion order. The region itself
has no landmark, log, status, or alert role. Its private announcement nodes are not containers for
the visible toast DOM.

Exactly one document-level region should serve the ordinary channel. A separately scoped embedded
application may own another region only when its lifetime and reading context are genuinely
independent. Duplicate ordinary regions emit a development diagnostic but do not merge private
queues.

The default visible limit is three. Queued toasts do not consume expiry time and are not announced
until promoted. Closing one visible toast promotes the oldest eligible queued toast. A focused toast
is never displaced by queue pressure.

### Public API

Attributes and properties:

- `placement: 'block-start-end' | 'block-start-start' | 'block-end-end' | 'block-end-start'`;
  default `block-end-end`. Values are logical and follow writing direction.
- `max-visible: number`; integer from 1 through 5, default `3`.
- `paused: boolean`; explicit presentation pause for application suspension, testing, or user
  preference. Automatic hover, focus, and document-visibility pauses do not reflect this property.

Slots:

- default: direct `wg-toast` children only.

CSS parts:

- `base`
- `stack`
- `polite-announcer`
- `assertive-announcer`

Methods:

- `dismiss(toastId: string, reason?: 'programmatic'): boolean`; closes a current or queued toast and
  reports whether that ID was present.
- `dismissAll(reason?: 'programmatic'): void`; closes unfocused toasts. A toast containing focus is
  deferred until focus leaves unless its own close control initiated dismissal.
- `pause(): void` and `resume(): void`; equivalent to changing the explicit `paused` property.

Events: none. Individual toast dismissal events bubble through the region.

## `wg-toast`

### Purpose and anatomy

`wg-toast` presents one concise temporary acknowledgement. Its required message names what happened
and, when ambiguity is possible, the affected object or function. Optional detail remains brief.
Optional actions are conveniences whose durable equivalents remain available elsewhere.

The visible composition contains a redundant condition marker, message, optional detail, optional
actions, and an optional close control. The toast host is not focusable and has no implicit alert or
status role. Consumer-authored actions and the component-owned close button are the only possible
focus stops.

### Public API

Attributes and properties:

- `toast-id: string`; required nonempty identity unique within the region while present.
- `open: boolean`; requests queue participation. The region removes it on dismissal.
- `condition: 'neutral' | 'positive' | 'caution' | 'critical'`; default `neutral`.
- `announcement: 'off' | 'polite' | 'assertive'`; default `polite`.
- `dedupe-key: string`; optional application-owned equivalence identity.
- `duration: number`; automatic open duration in milliseconds, clamped from 5,000 through 60,000;
  default `8,000`. A value of `0` selects manual dismissal.
- `dismissible: boolean`; shows the component-owned close control; default `true`.
- `close-label: string`; required accessible name when `dismissible` is true. Wayglass does not
  hard-code an English control name.

If the `actions` slot contains an interactive element and the consumer did not explicitly author a
duration, the effective duration is `0`. An author may opt an action-bearing toast into timed
expiry, but its durable alternative remains required. A manual toast must remain dismissible by
either its close control or an application call.

Slots:

- default: required concise message.
- `detail`: optional supporting text.
- `actions`: optional consumer-authored controls.
- `icon`: optional decorative or redundant icon; never the only condition or message.

CSS parts:

- `base`
- `marker`
- `icon`
- `message`
- `detail`
- `actions`
- `close-button`

Methods:

- `close(reason?: 'programmatic'): boolean`; delegates to the owning region and reports whether the
  toast was open or queued.

Events:

- `wg-toast-dismiss`: bubbles and crosses shadow boundaries; not cancelable. Detail is
  `{ toastId: string; reason: 'timeout' | 'close' | 'programmatic' | 'replaced' }`.

The close button produces `reason: 'close'`. Expiry produces `timeout`. An application or public
method produces `programmatic`. Deduplication produces `replaced`. The event records presentation
closure only and is not an outcome, undo, or analytics event.

## Deduplication and queue behavior

Distinct toasts remain distinct by default, even when their visible text matches. Applications add
the same nonempty `dedupe-key` only when two requests represent the same acknowledgement.

When a new open toast has the same key as an existing visible or queued toast, the region:

1. dismisses the older toast with `reason: 'replaced'`;
2. preserves the older toast's queue position for the replacement;
3. uses the replacement's complete visible content, condition, priority, and duration; and
4. announces the replacement only when its normalized message text changed or its priority became
   assertive.

The region does not infer counters, combine prose, or compare application objects. Repeated events
that need a summary such as “5 files uploaded” require application-authored summary text and a
stable deduplication key.

To prevent invisible unbounded work, a region retains at most 50 open direct children across visible
and queued states. If an application exceeds that diagnostic ceiling, additional requests remain in
the DOM but are not admitted or announced until pressure falls; development builds warn. The region
does not silently discard an admitted acknowledgement or evict a focused toast.

## Announcement behavior

The region owns one atomic polite status node and one atomic assertive alert node. It copies only
the toast's normalized message and detail text into the selected node when the toast becomes
visible. Icon alternative text, action labels, and the close label are excluded.
`announcement="off"` uses neither node.

Announcements are serialized per priority. Assertive delivery may interrupt polite delivery but does
not reorder the visible queue. A polite replacement waits behind an already pending polite message.
The coordinator clears and updates an announcer across animation frames so identical text can be
spoken again only when it represents a distinct, non-deduplicated request.

The contract does not promise exact spoken timing or interruption across assistive technologies.
Representative validation must tune the delivery implementation without moving live roles onto the
visible interactive toast.

## Timing, interaction, and focus

The timer begins when a toast becomes visible, not when it enters the DOM. It pauses for:

- pointer hover over the region;
- focus anywhere inside a visible toast;
- `document.visibilityState !== 'visible'`; and
- an explicit region pause.

Pointer leave or focus leave resumes only after checking that no other pause reason remains. On
focus entry, the region remembers the previously focused element without changing focus. Closing a
toast from its own close control returns focus there when it is still connected, visible, enabled,
and focusable. Otherwise focus moves to the first control in the next visible toast, then to the
document body only when removing the close control would otherwise leave focus on a detached node.
The region does not jump to the action that originally caused the toast.

Hover and focus do not stop visual dismissal transitions after the user explicitly closes a toast.
Escape is not a global or toast-local dismissal shortcut because focus may be elsewhere and the key
belongs to the active control or an overlay opened by a slotted action. The labeled close control is
the explicit keyboard dismissal path.

## Responsive and visual behavior

The region uses viewport-safe insets and logical placement. Its stack never blocks the entire inline
axis, and at narrow widths each toast fits within the available viewport without horizontal page
overflow. Toasts stack without covering one another and do not force layout shifts in the underlying
document.

Condition presentation follows the existing feedback tokens: neutral structure is quiet, positive
uses the accepted good-state treatment, caution and critical use redundant text/boundary treatment,
and none selects announcement priority. Entry and exit motion is optional, short, and removed under
reduced motion. Forced colors preserve boundary, focus, close control, and action distinctions.

## Examples

```html
<wg-toast-region>
  <wg-toast
    toast-id="preferences-saved-42"
    dedupe-key="preferences-saved"
    condition="positive"
    announcement="polite"
    close-label="Dismiss saved-preferences notification"
    open
  >
    Contact preferences saved.
  </wg-toast>
</wg-toast-region>
```

```html
<wg-toast
  toast-id="upload-complete-17"
  condition="neutral"
  duration="0"
  close-label="Dismiss upload notification"
  open
>
  Three documents uploaded.
  <span slot="detail">They are available in Project records.</span>
  <wg-button slot="actions" appearance="secondary">View records</wg-button>
</wg-toast>
```

## Validation requirements

Implementation cannot be accepted until tests cover:

- static initial versus dynamically opened content and polite, assertive, and off announcements;
- FIFO promotion, configurable visible bounds, explicit deduplication, and replacement ordering;
- timer start, remaining-time pause and resume, manual lifetime, and document visibility;
- pointer, touch, keyboard, and focus behavior without focus movement on insertion or dismissal;
- action-bearing defaults, consumer action ownership, close reasons, and programmatic dismissal;
- rapid duplicate requests and prevention of competing or repeated announcements;
- light and dark themes, grayscale, forced colors, reduced motion, 200% text, and 320 CSS-pixel
  reflow;
- Chromium, Firefox, WebKit, VoiceOver with Safari, and NVDA with Firefox; and
- production Web Components and typed React wrappers using the same region coordinator.

## Deferred decisions

- Notification centers, durable history, operating-system notifications, audio, haptics, service
  workers, and cross-tab queues remain outside Wayglass Phase 2.
- Undo semantics, undo lifetime, and transactional rollback require a durable command contract; an
  arbitrary toast action does not create them.
- Arbitrary HTML portals and a general overlay/z-index service remain out of scope.
- Application analytics derive from application outcomes. Toast dismissal events do not become an
  analytics schema.
- Multiple named priority channels are deferred until a real deployment demonstrates that one
  ordinary document region is insufficient.
