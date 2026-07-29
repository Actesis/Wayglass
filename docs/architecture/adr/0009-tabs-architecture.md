# ADR 0009: Use semantic compound elements for tabs

- Status: proposed
- Date: 2026-07-28

## Context

Phase 2 requires a reusable tabs primitive before the focused Function Deck composition can be
defined. HTML has no native tabs element, so Wayglass must implement the established WAI-ARIA tabs
pattern, including roving focus, selection, tab-panel relationships, and complete keyboard behavior.

The architecture must also satisfy several project constraints:

- public behavior remains framework neutral;
- imports remain side-effect free;
- selectors support rich visible labels and concise hidden-state summaries;
- tab, tablist, and tabpanel relationships remain inspectable and reliable across Shadow DOM,
  browser, and assistive-technology boundaries;
- selection remains separate from domain value, condition, knowledge, and activity;
- the Function Deck composes the primitive rather than changing `wg-elbow`.

Putting a native button inside each tab's Shadow DOM would preserve button activation but split the
required `tablist` ownership and tab-panel ID relationships across component boundaries. Generating
selectors from panel attributes would keep those relationships internal but would reduce author
control over labels and consequential summaries.

## Decision

Implement tabs as four compound Custom Elements:

- `wg-tabs` coordinates selection, pairing, mutation handling, and keyboard behavior;
- `wg-tab-list` is the labeled `tablist`;
- `wg-tab` is the focusable element with `tab` semantics;
- `wg-tab-panel` is the associated `tabpanel`.

The `wg-tab`, `wg-tab-list`, and `wg-tab-panel` hosts carry their roles, ARIA state, IDs, ID
references, and tab indices. They remain in one light-DOM relationship graph. Shadow DOM may
encapsulate presentation and slots inside each element, but it must not contain a second interactive
control or become the boundary across which tab-to-panel semantics depend.

`wg-tabs` pairs tabs and panels by a required, unique `value`, then manages generated IDs where the
author did not supply stable IDs. The selected `value` belongs to `wg-tabs`; managed `selected`,
`hidden`, ARIA, and `tabindex` state on descendants is not an independent author API.

Use roving `tabindex`: one enabled tab participates in the page tab sequence. Every tab panel is
focusable so Tab moves predictably from the selected tab into the active working surface. Disabled
tabs are skipped.

Support both activation models:

- automatic activation is the default for present, immediately rendered content;
- manual activation is required when selection could introduce noticeable latency.

User selection emits one typed, bubbling, composed `wg-tab-change` event. Programmatic selection
updates presentation synchronously without moving focus or emitting a user-action event.

DOM source order is the stable selection order. Keyboard mapping is orientation-aware and
direction-aware. Remote state changes do not move selection or focus. Removal or disabling of the
selected pair uses a deterministic next-then-previous fallback and restores focus only when the
focused pair itself disappears.

Do not implement the Function Deck API until this compound primitive passes automated browser
coverage and a representative assistive-technology review. If that review exposes an unresolved
semantic-host interoperability problem, return this ADR to proposed status and evaluate the native
light-DOM alternative before publishing the API.

## Consequences

The accessible role graph and tab-panel ID references remain visible in ordinary DOM inspection and
do not depend on cross-root ID resolution. Rich tab labels and state summaries remain consumer-owned
slotted content.

Because ARIA supplies semantics rather than browser behavior, Wayglass owns the complete keyboard,
focus, selection, mutation, and disabled-state implementation. This increases test obligations and
makes assistive-technology review a prerequisite to accepting the decision.

Focusable custom-element hosts must reproduce the relevant activation behavior directly; they must
not contain nested native buttons. The React layer only types the compound elements and events.

The generic tabs primitive does not know about operational condition or Function Deck safeguards.
Those remain explicit composition content and policy.

## Alternatives considered

- **Native buttons inside shadow-root tabs:** rejected because the interactive tab, containing
  tablist, and external panel would rely on semantics and ID relationships crossing component
  boundaries.
- **One monolithic element generated from panel metadata:** rejected because attributes are too
  restrictive for branded labels, localization, and visible consequential-state summaries.
- **Consumer-authored native buttons and panels with a behavior-only coordinator:** credible and the
  fallback if semantic custom-element hosts fail assistive-technology review, but not selected
  because it fragments styling, registration, and typed framework use across consumer markup.
- **`aria-activedescendant` on the tablist:** rejected because roving `tabindex` follows the
  established tabs pattern, gives each selector visible focus directly, and works better with touch
  and programmatic focus.
- **Add selection behavior to `wg-elbow`:** rejected because it would collapse static function
  ownership and interactive selection into one misleading component.
