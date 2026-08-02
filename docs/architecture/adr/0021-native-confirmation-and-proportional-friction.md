# ADR 0021: Use native modal confirmation with explicit proportional friction

- Status: accepted
- Date: 2026-08-02

## Context

Phase 2E-D adds confirmation for consequential actions. Confirmation is useful only when the
interruption prevents a plausible costly mistake. If every unusual, critical-looking, or destructive
verb opens a dialog, the repeated interruption becomes ritual and people learn to approve without
reading. At the other extreme, a direct action is insufficient when its target is ambiguous, its
scope is broad, or recovery is impossible or materially expensive.

The shared feedback architecture already reserves modality for a decision required before an action.
It also requires one native `dialog` opened with `showModal()` unless supported-platform evidence
demonstrates a blocker. Phase 2E-D must now decide how an application selects that modal surface,
which behavior belongs to the framework-neutral component, how it interoperates with native focus
and dismissal, and how stronger verification remains distinct.

Confirmation also crosses architectural boundaries:

- risk depends on domain consequence and recovery policy, which a design-system component cannot
  infer;
- modal focus, cancellation, and focus return must be consistent in vanilla and React use;
- arbitrary slotted controls make close reasons and safe initial focus difficult to guarantee;
- native dialogs already own top-layer placement, outside-page inertness, focus containment, Escape
  behavior, and platform accessibility mapping;
- several open dialogs create confusing nesting and uncertain focus return; and
- the confirmed operation can outlive the dialog and must not move request state into temporary UI.

References:

- [HTML dialog element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element)
- [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WAI-ARIA alert dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)
- [WCAG technique H102: Creating modal dialogs with the HTML dialog element](https://www.w3.org/WAI/WCAG22/Techniques/html/H102)
- [Phase 2E feedback-state contract](../../feedback/feedback-state.md)
- [Phase 2E-D confirmation-dialog contract](../../feedback/confirmation-dialog.md)
- [ADR 0020](./0020-feedback-delivery-and-lifetime.md)

## Decision

### Select friction from domain consequences

Applications explicitly choose the least interruptive safe tier: direct action, inline decision,
modal confirmation, or stronger application-owned verification. Selection considers consequence,
scope, reversibility and recovery cost, immediacy, ambiguity, frequency, and authority together.

Wayglass does not derive this choice from condition color, icons, button appearance, action names,
HTTP methods, or a generic severity value. `critical` action appearance remains redundant visual
meaning after the application has chosen the pattern; it does not select modality or interruptive
semantics.

Inline confirmation remains an application composition until repeated production use establishes a
reusable contract. Typed verification, reauthentication, permission elevation, approval, consent,
and audit policy remain application-owned because they require evidence and policy beyond an
ordinary yes/no decision.

### Use one shadow-owned native dialog

`wg-confirmation-dialog` renders exactly one native `dialog` in its shadow root and opens it only
with `showModal()`. The native element is the only modal and semantic owner. The host adds no dialog
role or focus stop, and the implementation does not install a custom focus trap, copy content into a
portal, or fall back to a nonmodal native `open` attribute.

The visible heading and description remain consumer-authored light-DOM slots. Internal labeled
containers give the native dialog stable `aria-labelledby` and, for short simple content,
`aria-describedby` relationships within its shadow tree. The component owns two native buttons—one
cancel and one confirmed action—so it can guarantee an explicit escape path, close reasons, initial
focus, activation suppression, and event order. Applications provide localized labels; Wayglass does
not provide ambiguous “Yes” or “No” defaults.

Arbitrary actions, form fields, rich documents, and multi-step content are excluded. They require a
general application dialog or workflow whose reading order, validation, and focus policy can be
tested as a whole.

### Keep interruption explicit

The native element uses ordinary dialog semantics by default. An explicit `attention="interruptive"`
changes it to `role="alertdialog"` only for a newly occurring situation that requires immediate
acknowledgement or decision. Critical consequence or critical action styling does not make that
choice. The component does not add a separate live region.

### Coordinate bounded modal lifetime

The component owns its modal presentation lifetime and reflects actual lifetime through `open`.
Setting `open`, or calling `show()` with optional invoker and focus-fallback references, requests
`showModal()`. Missing required content, native opening failure, or conflicting modal ownership
rejects the request and removes `open`; the component never degrades silently into nonmodal
presentation.

A document-local coordinator permits at most one open Wayglass confirmation. A second, simultaneous,
reentrant, or nested request returns `false` and is not queued. The coordinator stores no dialog
content, action, or application state and is not a general overlay service. Applications sequence
dependent decisions explicitly.

Invocation records an explicit invoker or the document's deep active element. Initial focus defaults
to cancel. Applications may explicitly select the confirmed action or a programmatically focusable
static heading when that choice better supports the content. Native Tab containment remains
platform-owned.

Cancel is always visible. Escape closes as cancellation. Backdrop interaction does not dismiss or
decide. Programmatic closure and confirmed action remain distinguishable. After close, focus returns
to a still-usable invoker or an application-provided logical fallback. The component does not guess
a destination when neither is valid.

### Emit intent after presentation closes

The confirmed action closes the native dialog first. The component emits its close event and then
one noncancelable confirmed-action intent event. This ordering lets native closure and focus return
settle before application work changes or removes the originating UI.

The event is not evidence of success, authorization, submission, or audit completion. Applications
own side effects, pending state, changed authorization, durable success, failure, retry, recovery,
analytics, and any redundant toast. The dialog does not remain open to become a request-progress or
error surface.

### Accept client-only interactive fallback for now

Interactive confirmation begins only after custom-element upgrade. Server-rendered applications omit
the surface until hydration or keep it hidden and inert so unupgraded slotted prose does not look
operative. A later SSR-compatible fallback may improve delivery without changing native dialog
ownership after upgrade.

## Consequences

The platform owns the behaviors it implements completely: top-layer presentation, outside-page
inertness, modal focus containment, Escape dispatch, and accessibility mapping. Wayglass adds only
bounded coordination and visual treatment instead of maintaining another focus-trap and portal
system across browsers and frameworks.

Applications must make the risk decision explicitly and provide specific wording, localized action
labels, current target data, and a logical fallback when the invoker may disappear. This is more
work than a universal `confirm(message)` helper, but it keeps consequence and recovery policy in the
system that knows them.

Component-owned controls intentionally limit composition. The restriction makes cancel availability,
initial focus, close reasons, and confirmed-intent ordering testable. Workflows that outgrow two
choices must use a different architecture rather than progressively turning confirmation into an
unbounded modal.

Rejecting nested requests avoids ambiguous focus restoration and modal stacks, but applications must
model sequences themselves. Rejected invocation requires a development diagnostic because silently
losing a consequential decision request would be unsafe.

Native dialog behavior can vary slightly across engines. Wayglass accepts platform variation where
semantics and interaction remain correct, then validates supported browsers and representative
assistive technologies before Phase 2 closes. A demonstrated blocker can revise this ADR; visual
preference alone cannot.

The client-only fallback means confirmation is unavailable until upgrade. Applications that require
no-JavaScript consequential operations must supply an application-owned server workflow rather than
depending on this component.

## Alternatives considered

- **Infer confirmation from critical color or button appearance:** rejected because visual condition
  does not describe consequence, scope, recovery, or authority.
- **Confirm every destructive-sounding action:** rejected because language is domain-specific and
  repeated low-value dialogs produce ritual approval.
- **Use `window.confirm()`:** rejected because its content, labeling, visual integration, event
  model, and stronger-verification boundaries are too limited for the Wayglass contract.
- **Build a generic ARIA dialog and custom focus trap:** rejected because native `dialog` owns the
  complete modal behavior in supported browsers and reduces duplicated interaction code.
- **Keep a consumer-authored native dialog in light DOM:** rejected for this constrained component
  because arbitrary anatomy and controls prevent consistent labels, initial focus, cancellation,
  close reasons, and action-event ordering.
- **Expose arbitrary action and footer slots:** rejected because extra choices turn a binary
  confirmation into a general workflow and weaken guaranteed focus and dismissal behavior.
- **Queue or stack confirmation requests:** rejected because queued domain decisions can become
  stale and stacked modals create ambiguous focus and reading context.
- **Keep the dialog open while the operation is pending:** rejected because presentation lifetime
  would become application request state and failures would be trapped in a temporary modal.
- **Make every consequential dialog an alert dialog:** rejected because consequence and immediate
  interruption are independent. Ordinary modal dialog semantics remain the default.
- **Create one universal overlay coordinator:** rejected because confirmation, menus, toasts,
  viewers, drawers, and arbitrary dialogs have different ownership and dismissal models.
