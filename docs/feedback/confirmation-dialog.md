# Phase 2E-D confirmation-dialog contract

**Status:** Accepted, implemented, and automatically validated for Phase 2E-D on August 2, 2026.
Representative assistive-technology review remains tracked in the
[Phase 2E-D validation record](../accessibility/phase-2e-confirmation-dialog-validation.md) and is
carried as a public-release gate in the
[Phase 2 ledger](../accessibility/phase-2-assistive-technology-gates.md). The architecture is
recorded in [ADR 0021](../architecture/adr/0021-native-confirmation-and-proportional-friction.md).
Shared persistence, interruption, modality, condition, and state ownership follow the accepted
[feedback-state contract](./feedback-state.md) and
[ADR 0020](../architecture/adr/0020-feedback-delivery-and-lifetime.md).

This milestone defines `wg-confirmation-dialog`, a deliberately narrow decision surface for a
consequential action that must not begin until a person explicitly confirms it. It coordinates one
native modal dialog, clear action and target wording, focus entry, cancellation, confirmed action
intent, close reason, and focus return.

It is not a general overlay, an alert with stronger styling, or a substitute for authorization,
pending state, error recovery, typed verification, reauthentication, approval, or consent.

## Design invariants

- Confirmation is selected from the action's consequence and recovery model, never from a red color,
  icon, command name, or button appearance.
- Ordinary reversible actions happen directly and expose their durable result or recovery path.
  Repetition teaches people to approve dialogs without reading them and is not harmless friction.
- The component owns exactly one native `<dialog>` opened with `showModal()`. It does not recreate
  modal semantics with a generic container, ARIA, a focus-trap library, or a document portal.
- A visible heading names the action and target. A concise description states the material
  consequence and, when relevant, whether recovery is possible.
- Cancel is always visibly available. Escape means cancel. Clicking the backdrop does not decide or
  dismiss the dialog.
- The default initial focus is the cancel control. Applications may deliberately choose the action
  control or static heading only when the content and consequence justify it.
- The native dialog is the only modal and semantic owner. The custom-element host is not a second
  dialog or focus stop.
- Hue, iconography, motion, action order, and physical button position are redundant. Visible labels
  communicate the decision without them.
- Confirming emits application intent and closes the presentation. It does not claim the operation
  succeeded, place the dialog into a request state, or keep the dialog open while work proceeds.
- Only one Wayglass confirmation dialog may be open in a document. A second invocation is rejected
  rather than stacked.

## Proportional friction

Applications choose the least interruptive pattern that still prevents a plausible costly mistake.
The choice considers the combination of:

- **consequence:** the effect on people, data, money, access, privacy, or system operation;
- **scope:** one local object, many objects, another person, or a shared system;
- **reversibility:** whether the exact prior state can be restored, and at what cost or delay;
- **immediacy:** whether the effect occurs now or can be reviewed before it takes effect;
- **ambiguity:** whether the control and target can be mistaken in the current context;
- **frequency:** whether confirmation would become routine ritual in a repeated workflow; and
- **authority:** whether a decision also requires identity, permission, or another person's review.

No single factor selects a tier. A technically reversible action can still warrant confirmation when
recovery is slow, expensive, incomplete, or affects other people.

### Friction ladder

| Tier                | Use when                                                                                                                                          | Pattern                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Direct action       | The effect is expected, bounded, readily reversible, and already clear from the control and context                                               | Perform it, show durable changed state, and provide recovery where the product supports it                                                   |
| Inline decision     | The action is locally consequential or easy to trigger accidentally, but leaving the current function would add more interruption than protection | Reveal a nearby explicit choice without blocking unrelated functions                                                                         |
| Modal confirmation  | A significant, immediate or difficult-to-recover consequence requires an explicit decision before the action begins                               | Use `wg-confirmation-dialog` with the action, target, consequence, and safe cancel path                                                      |
| Strong verification | The action is irreversible or high-impact and requires evidence beyond an ordinary yes/no decision                                                | Use an application-owned flow such as typed verification, reauthentication, permission elevation, dual approval, or legally reviewed consent |

Inline confirmation is a composition pattern, not a smaller modal and not a hidden second-click
gesture. It exposes clearly labeled confirm and cancel controls in context, preserves ordinary page
interaction, and returns to the original control after cancellation. Its detailed implementation is
deferred until a production use case establishes a reusable contract.

Strong verification may precede or follow an ordinary confirmation, but Wayglass does not compose
those steps automatically. Applications own the policy, credentials, authorization evidence, expiry,
attempts, audit record, and recovery.

### Examples

- Changing a reversible display preference is direct. A confirmation would add no material safety.
- Removing one item from a draft can be direct when an immediate, durable restore path exists.
- Disconnecting a shared data source may use modal confirmation when it stops current updates for
  other operators; the description names the source and that consequence.
- Permanently deleting 24 archived reports may require modal confirmation or stronger verification
  depending on retention, recovery, and authorization policy.
- Rotating a production credential generally requires application-owned reauthentication or
  approval. A generic confirmation dialog alone is not sufficient evidence.

## Ownership and native-dialog model

`wg-confirmation-dialog` renders one native `<dialog>` in its shadow root and opens it only with
`showModal()`. The dialog contains slotted visible content and component-owned native action and
cancel buttons. The internal dialog owns top-layer placement, outside-page inertness, modal focus
containment, native cancellation, and its platform accessibility mapping.

The component owns:

- modal presentation lifetime and reflected `open` state;
- association of the visible heading and description with the native dialog;
- initial-focus selection;
- the explicit cancel and action controls;
- Escape cancellation and suppression of backdrop dismissal;
- one-at-a-time Wayglass invocation;
- confirmed action and close-reason events; and
- return to the invoker or an explicit fallback when either remains usable.

The application owns:

- whether any confirmation or stronger verification is appropriate;
- the action identity, target, consequence, and localized wording;
- authorization, policy, side effects, analytics, and audit records;
- pending, success, failure, retry, and durable outcome state;
- sequencing when several decisions are required; and
- a logical focus fallback when the action removes or disables the invoker.

Consumer content remains in light DOM, but the interactive modal behavior is client-only. Before
custom-element upgrade, applications must not expose an apparently operative confirmation surface.
Server-rendered applications may omit it until hydration or keep it hidden and inert. A future SSR
contract may improve this fallback without changing the native-dialog ownership decision.

## Content and semantics

The `heading` slot is required and must contain a concise visible heading. Prefer a question or
action phrase that names the target, such as “Disconnect Northwind records?” Avoid generic headings
such as “Are you sure?”

The default slot is required and contains a short description of the material consequence. It does
not repeat the heading, hide the target behind a pronoun, or use alarmist prose. If recovery is
unavailable or materially limited, say so directly.

The component associates the heading with the native dialog through `aria-labelledby`. It associates
the description through `aria-describedby` only while the slotted description is a short, simple
text unit. Lists, tables, form fields, rich legal text, or several semantic sections require an
application-owned dialog or workflow whose reading order and focus policy can be tested as a whole.

The default semantic mode is an ordinary modal `dialog`. `attention="interruptive"` explicitly
changes the native element to `role="alertdialog"` only when a newly occurring situation requires
immediate acknowledgement or decision. Critical consequences and critical action styling do not
select this mode automatically. Interruptive mode still does not create a separate live region.

The action label starts with the specific verb and includes the target when the heading alone would
not keep it unambiguous, such as “Disconnect Northwind records” or “Delete 24 reports.” Cancel uses
a localized application-provided label. “Yes” and “No” are invalid defaults because they force a
person to reread the question to identify the action.

## Public API

### Attributes and properties

- `dialog-id: string`; required nonempty identity unique among confirmation dialogs in the document.
- `open: boolean`; requests modal presentation after upgrade and reflects actual presentation
  lifetime. The component removes it on every close.
- `action-label: string`; required visible label for the confirmed action control.
- `cancel-label: string`; required visible label for the cancel control. Wayglass does not hard-code
  an English default.
- `action-appearance: 'primary' | 'critical'`; default `primary`. `critical` represents a genuinely
  harmful confirmed consequence; it does not change semantics, attention, or friction tier.
- `attention: 'ordinary' | 'interruptive'`; default `ordinary`. Only `interruptive` selects
  `alertdialog` semantics.
- `initial-focus: 'cancel' | 'action' | 'heading'`; default `cancel`.

Setting `open` before upgrade requests `showModal()` once the component is ready. If required labels
or content are absent, another Wayglass confirmation is open, or native modal opening fails, the
component removes `open`, stays closed, and emits a development diagnostic. It never falls back to a
nonmodal `open` attribute on the native dialog.

`initial-focus="heading"` temporarily makes the visible heading programmatically focusable with
`tabindex="-1"`; it does not add the heading to the ordinary Tab sequence. This option is for cases
where reading the consequence before reaching either choice is materially helpful. Positive
`tabindex` values are never introduced.

### Slots

- `heading`: required concise visible heading.
- default: required concise description.
- `icon`: optional decorative or redundant icon; never the only warning, target, or consequence.

The component deliberately does not expose arbitrary action, form, or footer slots. Its two
component-owned native buttons keep decision order, focus policy, cancellation, and action intent
consistent. Workflows needing extra actions or fields are outside this component.

### Methods

- `show(options?: { invoker?: HTMLElement; fallbackFocus?: HTMLElement }): boolean`; requests modal
  presentation, remembers the explicit invoker or current active element, and reports whether the
  request was accepted.
- `cancel(): boolean`; closes an open dialog with `reason: 'cancel'` and reports whether it was
  open.
- `close(reason?: 'programmatic'): boolean`; closes an open dialog without confirming and reports
  whether it was open.
- `focus(options?: FocusOptions): void`; moves focus to the currently configured initial-focus
  target while open and does nothing while closed.

Setting `open = true` is equivalent to `show()` without explicit options. `show()` on the already
open instance is idempotent and does not replace its remembered invoker. Calling it while another
Wayglass confirmation is open returns `false` and leaves both instances otherwise unchanged.

### Events

- `wg-confirmation-action`: bubbles and crosses shadow boundaries; not cancelable. Detail is
  `{ dialogId: string }`. It is emitted once after the native dialog has closed with confirmed
  intent. It is not success, submission, authorization, or analytics evidence.
- `wg-confirmation-close`: bubbles and crosses shadow boundaries; not cancelable. Detail is
  `{ dialogId: string; reason: 'action' | 'cancel' | 'escape' | 'programmatic' }`.

For a confirmed action, `wg-confirmation-close` is emitted before `wg-confirmation-action`. This
allows the presentation and focus return to settle before application work changes the source UI.
Applications may handle the action event synchronously or schedule work, but they do not reopen the
same dialog merely to display pending or failure state.

### CSS parts

- `dialog`
- `surface`
- `marker`
- `icon`
- `heading`
- `description`
- `actions`
- `cancel-button`
- `action-button`

The marker and optional icon are redundant presentation. `action-appearance="critical"` may apply
critical action tokens to the action control, but it does not recolor the whole dialog into a status
light or make cancel visually disappear.

## Invocation, dismissal, and focus

### Opening and initial focus

An accepted invocation records the explicit `invoker`, or the deep active element when no invoker is
supplied, immediately before calling `showModal()`. The component then focuses:

1. the configured target;
2. the cancel control when that target is unavailable; or
3. the action control only if cancel is unexpectedly unavailable because of an implementation
   defect.

Neither opening nor closing scrolls the invoker into view. The dialog surface remains fully visible
at 320 CSS pixels and 200% text size through internal scrolling when necessary; the document behind
it does not become the dialog's scroll container.

### Cancellation and close reasons

- The visible cancel control closes with `cancel`.
- Native Escape cancellation closes with `escape`.
- `cancel()` closes with `cancel`.
- `close()` or `open = false` closes with `programmatic`.
- The confirmed action control closes with `action`, then emits confirmed action intent.
- Pointer interaction with the backdrop does nothing. It is not converted to Escape or cancel.

Escape remains available even when the application considers the action urgent. A flow that cannot
allow cancellation is not a confirmation decision and does not use this component.

The component suppresses repeated action activation once native closure begins. It does not add a
pending state because the action has not begun until the decision is complete and the dialog has
closed.

### Focus return

After native close, the component confirms that focus returned to the remembered invoker when it is
still connected, visible, enabled, and focusable. If not, it focuses the explicit `fallbackFocus`
when usable. If neither is usable, it leaves focus at the browser's valid destination and emits a
development diagnostic; it does not guess at a domain-specific next control.

Applications supply a fallback when confirmation may remove, disable, or replace the invoker. The
fallback is the next logical workflow location, such as the heading of the retained collection or
the control following a removed row. It is not automatically the document body, first navigation
item, or first control in the page.

## One-at-a-time and nested invocation

A document has at most one open Wayglass confirmation. The coordinator is document-local and exists
only to enforce that invariant; it is not a global overlay service or queue.

When another invocation occurs while one is open:

- the new request returns `false` and remains closed;
- the current dialog and its invoker are unchanged;
- no request is queued or automatically reopened later; and
- a development diagnostic identifies both `dialog-id` values.

Applications sequence dependent decisions in their own workflow. They do not open a second modal
from inside the first, place confirmation inside a menu or another modal, or use repeated dialogs as
a substitute for a review screen. Validation must include reentrant pointer and keyboard activation,
two instances requesting open in the same task, and invocation while another native modal is open.

## Application integration

The application renders all wording from current domain state immediately before invocation. It does
not keep an old dialog instance as the durable source of a target count, name, price, or permission.
If the material consequence changes while the dialog is open, the application closes it and requires
a fresh decision rather than silently replacing the terms beneath focus.

On `wg-confirmation-action`, the application begins or schedules the operation and presents pending
state at the originating function. Success changes durable state. Failure remains available beside
the affected action or object with its recovery path. A toast may provide a redundant
acknowledgement under the transient-feedback contract, but neither the closed dialog nor a toast is
the only record of the result.

If authorization changes before the action begins, the application rejects the operation and shows
the durable reason. The dialog does not cache permission or make the earlier decision authoritative.

## Validation requirements

Implementation and wrappers must cover:

- native `showModal()` ownership and absence of nonmodal fallback;
- heading, description, ordinary dialog, and explicit alert-dialog accessibility mappings;
- initial focus on cancel, action, and static heading;
- Tab and Shift+Tab containment using native modal behavior;
- cancel control, Escape, programmatic close, action, and ignored backdrop interaction;
- exact close-reason and action-event order without duplicate activation;
- focus return to invoker, explicit fallback, removed invoker, and shadow-DOM invoker;
- rejected nested, simultaneous, reentrant, and foreign-native-dialog invocation;
- stale-content closure when the material consequence changes;
- keyboard, pointer, and touch operation without position-dependent meaning;
- 320 CSS-pixel reflow, 200% text size, internal overflow, zoom, forced colors, grayscale, dark and
  light themes, and reduced motion; and
- supported browsers and representative screen-reader combinations with both vanilla elements and
  typed React wrappers using the same coordinator.

## Deferred decisions

- General modal dialogs, drawers, lightboxes, teaching overlays, command palettes, and universal
  overlay positioning require separate ownership decisions.
- Inline confirmation implementation remains a composition pattern until repeated production use
  establishes a stable reusable contract.
- Undo and restoration require a durable command contract and are not implied by confirmation.
- Typed-name verification, reauthentication, permission elevation, multi-person approval, legal
  consent, and audit policy remain application-owned.
- Unsaved-navigation handling, browser `beforeunload`, operating-system prompts, and native app
  confirmation are outside this Web Component contract.
- SSR-compatible modal fallback may be added later without replacing native `dialog` after upgrade.
