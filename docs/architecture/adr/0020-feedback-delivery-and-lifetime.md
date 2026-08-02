# ADR 0020: Keep durable state separate from feedback delivery and lifetime

- Status: accepted
- Date: 2026-08-01

## Context

Phase 2E adds persistent alerts, compact badges, progress, loading placeholders, empty and degraded
states, transient toasts, and modal confirmation. These surfaces can describe the same application
event, but they have different persistence, announcement, focus, and interaction responsibilities.

A single severity enum cannot choose the correct channel. A critical condition may need a durable
inline presentation without interrupting focus. A neutral completion may warrant a polite temporary
acknowledgement. Offline describes availability, stale describes knowledge, and pending describes
activity; none is inherently a warning color or an assertive announcement.

Transient UI is especially easy to misuse as the only record of an error or outcome. Live regions
can duplicate output when several surfaces announce the same state. Modal confirmation can also
become ritual friction if visual importance automatically triggers a dialog.

References:

- [WAI-ARIA alert role](https://w3c.github.io/aria/#alert)
- [WAI-ARIA status role](https://w3c.github.io/aria/#status)
- [WAI-ARIA progressbar role](https://w3c.github.io/aria/#progressbar)
- [HTML dialog element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element)
- [WAI-ARIA alert dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG 2.2 Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)

## Decision

Treat persistence, interruption, modality, condition, activity, knowledge, and availability as
independent inputs. Component appearance may represent applicable semantic axes, but it does not
infer delivery behavior across them.

Durable in-context feedback is authoritative whenever information may be needed for understanding,
recovery, or later action. A temporary toast may acknowledge the same outcome only when its durable
effect or recovery path is available elsewhere. Modal confirmation is reserved for a consequential
decision that must precede an action; it is not the high-emphasis tier of an alert.

Use explicit announcement policy. Persistent components have no implicit live-region behavior.
Dynamic feedback may opt into polite or assertive delivery through the component-specific contract,
with polite as the ordinary status-message path. Assertion requires immediate-awareness need rather
than critical styling alone. Coordinators prevent one toast queue or dialog from producing competing
announcements, timers, or focus transitions.

Keep domain and request state application-owned. Wayglass components may own bounded presentation
lifetime—toast ordering and expiry, dialog open and close state, visual skeleton animation—but they
do not become the application outcome log, connection monitor, staleness calculator, authorization
layer, or request state machine.

Prefer native platform semantics when one element can own the complete behavior. The progress
contract must prototype a consumer-authored native `progress` element before custom range semantics.
The confirmation contract must use one native `dialog` opened with `showModal()` unless supported
browser and assistive-technology evidence demonstrates a blocker. Toasts have no native primitive,
so one framework-neutral region coordinator owns their queue and lifetime.

Do not build a general overlay service. Menu popovers remain private to `wg-menu`; confirmation uses
native modal-dialog behavior; toast placement belongs to its region. Tooltips, comboboxes, viewers,
drawers, and arbitrary modal workflows require their own ownership decisions.

## Consequences

Applications can show a persistent outcome, optionally announce its change, and optionally add a
brief toast without those surfaces disagreeing about underlying state. Offline, stale, pending, and
critical remain composable rather than collapsing into one overloaded visual status.

The API must ask authors to choose delivery deliberately. That is more explicit than deriving roles
from variants, but it avoids unexpected initial announcements and condition-to-interruption
coupling. Documentation and diagnostics must make misuse visible without silently changing author
intent.

Toast and dialog coordinators introduce genuine framework-neutral behavior and therefore require
cross-browser, timer, focus, and representative assistive-technology validation. Badge, alert,
loading, absence, and degraded-state components remain presentation-oriented unless their later
contracts identify a complete behavior they must own.

Native `progress` and `dialog` behavior can differ slightly across engines. Wayglass accepts
platform variation where semantics and interaction remain correct, and adds styling or bounded
coordination rather than recreating the native control.

## Alternatives considered

- **One global severity level selects color, live-region priority, persistence, and modality:**
  rejected because these concerns are independent and produce false urgency or hidden state when
  coupled.
- **Make every alert assertive:** rejected because static content and nonurgent dynamic feedback can
  interrupt or duplicate announcements.
- **Use toasts as the universal outcome surface:** rejected because expiration makes errors,
  recovery, and current state undiscoverable.
- **Put all feedback into a global notification center:** rejected because feedback separated from
  its function or action loses context and creates unnecessary navigation.
- **Build custom progress and dialog semantics for complete visual control:** rejected until native
  primitives fail the supported validation matrix; platform ownership reduces duplicated behavior.
- **Adopt one universal overlay and portal layer:** rejected because menus, toasts, confirmation,
  viewers, and arbitrary dialogs have different focus, dismissal, placement, and lifetime models.
- **Let React wrappers own queues and modal state:** rejected because vanilla and other frameworks
  must receive the same behavior without duplicate implementations.
