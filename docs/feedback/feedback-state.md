# Phase 2E feedback-state contract

**Status:** Proposed for Phase 2E-A on August 1, 2026. This contract defines the shared boundaries
that component-specific contracts must preserve. The proposed delivery model is recorded in
[ADR 0020](../architecture/adr/0020-feedback-delivery-and-lifetime.md).

Feedback tells a person what happened, what is happening, what is absent, or what decision is
required. It must not overwrite the durable domain state it describes. A transient message is not a
substitute for a visible outcome, and visual urgency is not permission to interrupt assistive
technology.

## Independent axes

Every feedback composition considers these properties independently:

| Axis         | Values                               | Governs                                                         |
| ------------ | ------------------------------------ | --------------------------------------------------------------- |
| Persistence  | durable, temporary                   | Whether the information remains available at its source         |
| Interruption | none, polite, assertive              | Whether a dynamic change enters a live announcement path        |
| Modality     | nonmodal, modal                      | Whether interaction outside the feedback is temporarily blocked |
| Condition    | neutral, positive, caution, critical | What the information means, when condition applies              |
| Activity     | idle, pending                        | Whether work is currently progressing                           |
| Knowledge    | known, stale, unknown                | How current or trustworthy the represented value is             |
| Availability | available, offline, unavailable      | Whether the source or target can currently participate          |

These axes are not aliases. Critical content can be durable and nonmodal. A successful save can be
temporary and polite. Offline can be an expected availability state rather than an error. Pending
does not imply indeterminate progress when a measurable total exists.

## Delivery channels

### Durable in-context feedback

Alerts, empty states, offline states, stale-data markers, progress, and completed outcomes remain
beside the function, object, field, or action they describe whenever a person may need them later.
They preserve identifying context and the next available action. They do not disappear only because
time elapsed.

Persistent content has no automatic live-region role. The application may request a deliberate
polite or assertive announcement when the content changes dynamically, but its visible source
remains the authoritative representation.

### Temporary nonmodal feedback

Toasts acknowledge short-lived outcomes that do not require immediate action and whose durable
effect is already visible or discoverable elsewhere. A toast does not become the sole carrier of:

- validation errors or correction instructions;
- current critical, offline, unavailable, stale, or pending state;
- destructive consequences;
- an action required to complete a task; or
- information needed after dismissal.

Toast order, deduplication, expiry, pausing, and announcements belong to one region coordinator, not
to independent timers inside individual messages.

### Modal decision feedback

A confirmation dialog pauses interaction only when the application needs an explicit decision before
a consequential action. Modality is not a visual emphasis option. Ordinary acknowledgements,
reversible actions, passive warnings, and information that can remain inline do not use a dialog.

Confirmation uses proportional friction. The requested action, target, consequence, reversibility,
and safer alternative determine whether inline confirmation, a modal choice, or stronger
application-owned verification is appropriate. Wayglass does not infer risk from a red color, an
icon, a button variant, or a command name.

## Component responsibilities

### Badge

A badge is compact supporting metadata such as category, count, or short state text. It has no
implicit live role and is not a replacement for `wg-status-indicator`, `wg-boolean-value`, or a
complete accessible name. Color is redundant to visible text.

### Alert

An alert is persistent, in-context feedback with a heading or concise message and optional detail
and actions. Its visual condition does not automatically select `role="alert"`. Dynamic announcement
policy is explicit so initial page content is not announced unexpectedly.

### Progress

Progress represents current activity. Determinate progress exposes a current value and total;
indeterminate progress exposes a stable accessible label without a fabricated percentage. Existing
content remains available when it is still valid. Progress completion leads to a durable outcome,
not only the disappearance of an indicator.

The component-specific contract must evaluate a consumer-authored native `progress` element before
creating custom range semantics.

### Skeleton

A skeleton is optional visual scaffolding, not semantic content. It is hidden from the accessibility
tree, does not synthesize plausible values, respects reduced motion, and is paired with a labeled
busy owner or visible loading message. It must not replace known previous content merely because a
refresh is pending.

### Empty state

An empty state explains why a bounded collection or function has no content and, when useful, offers
the next action. It distinguishes first use, no results, completed work, filtered absence, and load
failure instead of presenting every absence as an error.

### Offline state

An offline state identifies the affected scope, the last known information when safe, unavailable
actions, and any retry or alternate path. It does not imply that every displayed value is invalid;
knowledge state remains separate from availability.

### Stale-data marker

A stale-data marker qualifies a specific value or bounded region. It includes visible text, can
expose the observation time or age, and never changes the underlying condition to caution or
critical. The application owns staleness thresholds and time formatting.

### Toast and toast region

A toast carries one concise temporary acknowledgement. A toast region coordinates ordering,
deduplication, a bounded visible queue, announcement timing, expiry, pause, and dismissal. It does
not move focus when a toast appears. Any toast action must remain available long enough to operate
and must have a durable alternative when losing it would block recovery.

### Confirmation dialog

A confirmation dialog coordinates one native modal dialog, focus entry, cancellation, action intent,
close reason, and focus return. It names the specific action and target. The application still owns
authorization, side effects, pending state, failure recovery, and any stronger verification policy.

## Announcement rules

- Static initial content is not automatically announced as a live update.
- `polite` is the default for requested dynamic announcements that can wait for current speech.
- `assertive` is reserved for newly occurring information requiring immediate awareness; visual
  critical condition alone is insufficient.
- Loading announcements describe the activity once and announce a meaningful outcome. They do not
  repeatedly speak percentage changes unless the application has a tested reason.
- Removing a node from a live region is not relied upon to communicate completion or recovery.
- One user-visible change must not be announced independently by a control, alert, toast, and page
  title without a deliberate product decision.

## Lifetime and state ownership

Applications own domain state, request state, staleness thresholds, connectivity evidence, outcome
history, and whether a message remains relevant. Wayglass owns only the presentation and interaction
lifetime explicitly assigned to a component, such as toast expiry or dialog closure.

Components do not copy durable application state into private stores. Removing and recreating a
component must not erase the application record of an outcome, retry path, or unresolved condition.

## Validation requirements

Phase 2E implementations must cover:

- initial versus dynamically inserted content and duplicate-announcement prevention;
- persistent recovery paths after transient feedback expires;
- determinate, indeterminate, completed, interrupted, and failed activity;
- stale knowledge independently from caution or critical condition;
- scoped offline and unavailable presentation without hiding last-known context;
- timer pause, dismissal, queue pressure, and reduced motion for temporary feedback;
- modal focus entry, containment, cancellation, close reason, and return under keyboard, pointer,
  touch, and assistive technology;
- 320 CSS-pixel reflow, 200% text size, forced colors, grayscale, dark and light themes; and
- vanilla Web Components and typed React wrappers without duplicated state machines.

## Deferred decisions

- Notification centers, inboxes, operating-system notifications, audio and haptic alerts, and
  cross-tab synchronization are application or later-pattern responsibilities.
- Undo is not implied by a toast action and requires a separate durable command contract.
- Application-specific typed-name confirmation, reauthentication, approval workflows, and legal
  consent are beyond the generic confirmation dialog.
- General tooltips, teaching overlays, drawers, arbitrary modal workflows, and universal overlay
  positioning are not inferred from this milestone.
