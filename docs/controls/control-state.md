# Phase 2D-A control-state contract

**Status:** Accepted for Phase 2D-A on July 31, 2026. Controlled operational requests are recorded
in [ADR 0014](../architecture/adr/0014-controlled-operational-requests.md). Native form ownership is
recorded in [ADR 0015](../architecture/adr/0015-native-form-control-ownership.md).

This contract defines how Wayglass controls distinguish confirmed state, user intent, asynchronous
request progress, request failure, target availability, local selection, and form editing. It does
not define the final public API of every Phase 2D component.

## Control categories

The word control covers several interaction models that must not share misleading state semantics.

| Category                  | Examples                                      | Source of truth                             |
| ------------------------- | --------------------------------------------- | ------------------------------------------- |
| Immediate command         | Button, icon button, command item             | The application handling the emitted intent |
| Operational value request | Toggle                                        | Confirmed domain state from the application |
| Local selection           | Tabs, segmented control, navigation rail      | The selecting component or application      |
| Form editing              | Text, number, select, checkbox, radio, slider | The consumer-authored native form control   |
| Popup coordination        | Menu                                          | The menu coordinator and invoking control   |

An immediate command does not have a persistent selected or asserted value. A local selection can
change synchronously because it selects interface content, not remote domain truth. A form edit is a
draft value until submission. An operational control requests a domain change and must preserve the
confirmed value until the application supplies a new confirmation.

## Operational request model

Operational controls use independent concepts rather than one overloaded `state` property.

| Concept         | Values                        | Meaning                                                       |
| --------------- | ----------------------------- | ------------------------------------------------------------- |
| Confirmed value | Domain-specific               | Last value the application is willing to present as confirmed |
| Requested value | Domain-specific or absent     | Value most recently requested by the user                     |
| Request status  | `idle`, `pending`, `rejected` | Lifecycle of that request                                     |
| Availability    | `available`, `unavailable`    | Whether the target can currently accept a request             |
| Permission      | enabled or disabled           | Whether product policy currently permits activation           |

The shared vocabulary may later be expressed in `@wayglass/core`, but the domain-specific values
remain consumer-owned. It does not add a requested value to `KnownState`.

### Invariants

1. User activation emits intent; it does not mutate the confirmed value.
2. `pending` requires an explicit requested value. The confirmed value remains visible and
   semantically current until confirmation arrives.
3. Confirmation is an application update to the confirmed value, followed by an `idle` request
   status and removal of the requested value.
4. `rejected` preserves the confirmed value and identifies the rejected requested value in useful
   feedback. It does not turn the requested value into truth.
5. `unavailable` never coerces an unknown or last-known value to a Boolean false, empty string, or
   default selection.
6. Disabled policy and unavailable target state are different. Both suppress activation, but an
   unavailable target requires a useful reason when that reason is not already obvious.
7. Request failure is not form invalidity and must not use `aria-invalid` unless the authored form
   value itself is invalid.
8. The initial components do not provide an optimistic mode. Applications may present an immediately
   requested value, but must label it as requested until it is confirmed.

### State transitions

```text
idle(confirmed A)
  -- user requests B --> pending(confirmed A, requested B)
  -- confirmation B --> idle(confirmed B)
  -- rejection ------> rejected(confirmed A, requested B)

rejected(confirmed A, requested B)
  -- retry ----------> pending(confirmed A, requested B)
  -- dismiss --------> idle(confirmed A)
  -- new request C --> pending(confirmed A, requested C)
```

Target unavailability can occur beside any non-confirming state. If confirmation arrives while the
target is unavailable, the confirmed value may still update; availability answers whether a new
request can be accepted, not whether incoming truth can change.

## Component behavior

### Immediate commands

Buttons, icon buttons, and command items emit one native or typed activation intent. Pending
suppresses accidental repeat activation and retains focus unless the application deliberately moves
it. A command has no selected state and does not infer success from activation.

### Operational toggles

A toggle exposes the confirmed Boolean value through switch semantics. Activation proposes the
opposite value in a typed request event. It does not change its confirmed checked state.

While pending:

- the confirmed signal remains unchanged;
- the requested value and pending activity are available as text;
- repeat activation is suppressed by default;
- focus remains on the toggle;
- an adjacent status message may announce the asynchronous transition once.

After rejection, the confirmed signal remains unchanged, the failed target is stated, and a retry or
alternative action remains explicit. Red or critical styling describes request failure only when
accompanied by words; it does not redefine the confirmed domain value as unhealthy.

When confirmed knowledge is unknown or unavailable, the toggle must not display false as a fallback.
It is unavailable for ordinary activation unless the application can safely expose an explicit
idempotent command whose consequence does not depend on knowing the current value.

### Local selection

Tabs, segmented controls, and navigation rails select interface content. Their selected value may
change synchronously after user activation because selection is local composition state. Selected
does not mean asserted, confirmed, positive, available, or operationally active.

When selection would trigger noticeable loading, the interaction model preserves focus and labels
the panel activity separately. It does not turn selection itself into a pending operational request.

Segmented controls in Phase 2D-B are limited to local single selection. Consequential finite-domain
changes use a form choice followed by an explicit action or a future operational finite-value
contract; they are not silently mapped onto local selection.

### Form editing

Form controls own draft values, dirty state, constraint validity, and native input/change events.
Draft values are not requested operational values. Submission is an explicit command that may then
start a separate asynchronous application request.

Form invalidity answers whether a value satisfies authored constraints. Request rejection answers
whether an external operation succeeded. The two states may coexist and must not share one error
flag or message.

## Events and application ownership

Every operational request event identifies:

- the proposed value;
- the currently confirmed value;
- the user trigger when it affects behavior.

The event reports intent only. The application owns authorization, transport, correlation,
deduplication, cancellation, timeout, retry, confirmation, and rejection. Components do not generate
request IDs or assume that event delivery means remote acceptance.

The default operational control suppresses another request while one is pending. Applications that
need queueing, cancellation, or last-write-wins behavior expose that policy through explicit
controls and correlate responses outside the component.

Programmatic confirmed-value updates do not emit request events or move focus. Remote updates may
arrive at any time and must not be mistaken for local activation.

## Accessibility and presentation

- Checked, selected, pressed, expanded, busy, disabled, unavailable, and invalid are distinct
  semantics and are exposed only when applicable.
- A toggle's checked state follows confirmed value, including while another value is pending.
- Pending uses activity language and may use `aria-busy`; it does not change `aria-checked`.
- Pending controls remain focusable when repeat activation can be suppressed without native
  `disabled`. Truly unavailable or policy-disabled controls follow the component's accepted native
  pattern.
- Rejection feedback is associated with the owning control and identifies what failed, what remains
  true, and what can happen next.
- No control state depends only on hue, icons, animation, hover, or spatial position.
- Touch targets remain at least 44 by 44 CSS pixels, and state text survives 200% and 400% zoom.
- Consequential controls repeat the owning function and target in their visible or accessible name.

## Domain-neutral examples

### Boolean request

```text
Confirmed: Notifications off
Requested: Notifications on
Request status: Pending
Visible feedback: Enabling notifications; confirmed state remains Off.
```

### Rejected request

```text
Confirmed: Intake open
Rejected request: Close intake
Visible feedback: Intake was not closed. It remains Open. Retry or review authorization.
```

### Unavailable target

```text
Last confirmed: External link connected
Availability: Unavailable
Visible feedback: New requests are unavailable while the control service reconnects.
```

## Validation requirements

Phase 2D implementations must cover:

- controlled confirmation, pending, rejection, retry, dismissal, and remote updates;
- pending responses that arrive out of order or after the owning view changes;
- unknown and unavailable confirmed knowledge without false fallback values;
- disabled policy independently from target unavailability;
- no optimistic mutation or duplicate request emission;
- stable focus and accessible feedback across asynchronous transitions;
- local selection that remains separate from operational state;
- form invalidity that remains separate from request rejection;
- keyboard, pointer, touch, screen-reader, forced-colors, reduced-motion, zoom, and text
  enlargement;
- client-only fallback, typed React wrappers, and Chromium, Firefox, and WebKit.

## Deferred decisions

- Cancellation, queued writes, undo, optimistic reconciliation, and conflict resolution remain
  application or future pattern responsibilities.
- A finite-domain operational request control is not inferred from segmented selection.
- Confirmation dialogs and destructive-action policy remain in Phase 2E.
- Exact component attributes, events, parts, and tokens are specified in their implementation
  milestones after this contract is accepted.
