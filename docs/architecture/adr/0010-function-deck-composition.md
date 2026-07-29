# ADR 0010: Define Function Deck as a tabs composition

- Status: proposed
- Date: 2026-07-29

## Context

Phase 2B introduces the Focused Function Deck after the generic tabs primitive has passed automated
browser coverage and a representative VoiceOver and Safari review. The deck needs a production
composition API that preserves function ownership, consequential hidden state, and a discoverable
path to critical responses.

The deck could be implemented as another coordinating Custom Element, a generated component that
accepts function data, or a documented composition of the accepted tabs compound elements.

A second selection coordinator would duplicate `wg-tabs` value, focus, mutation, keyboard, and event
behavior. A generated data-driven component would constrain rich function labels and working
surfaces, couple the library to application content models, and make vanilla and framework use
diverge. A presentation-only wrapper would add a public element without adding semantics or behavior
that the existing compound elements cannot provide.

## Decision

Define Function Deck as a production composition pattern built directly from:

- one application-owned function model;
- one `wg-tabs` coordinator;
- one named `wg-tab-list`;
- one `wg-tab` and `wg-tab-panel` pair per peer function;
- existing structural and semantic components inside each active function surface;
- an optional persistent consequential-state surface outside the tabs role graph.

The deck does not introduce a `wg-function-deck` Custom Element, a second selected value, or a new
change event. The public selection API remains the accepted `wg-tabs` contract. The function model,
content, state interpretation, and response policy remain consumer owned.

Each function uses one stable value across its model record, selector, and panel. The selector
repeats the visible function name. The panel repeats function identity in its heading and keeps
information, monitor, and control sections together when their relationship supports understanding
and action.

When a non-selected function has consequential state, its `summary` slot contains concise explicit
condition, knowledge, or activity words. A critical summary also identifies the response or the
direct path to it. Interactive controls must not be nested inside `wg-tab`; a persistent action,
when required, sits outside the tablist and moves selection through the existing `wg-tabs` API.

Static `wg-elbow` headings remain inert structure inside a function surface. They do not receive
selection, focus, or tab semantics.

## Consequences

Selection behavior, accessibility semantics, and framework bindings remain single sourced in
`wg-tabs`. Vanilla, React, Storybook, and documentation examples can render the same function model
without a framework-specific deck implementation.

The pattern contract, fixtures, and tests become the production definition of the Function Deck.
Applications retain full control over their function content and localization, but must author
honest selector summaries and critical-response paths.

Because there is no wrapper component, deck-specific presentation must use the existing tabs parts,
custom properties, and ordinary consumer layout around the compound component. If implementation
reveals a structural styling need that cannot be satisfied without fragile selectors, a narrowly
scoped presentation primitive may be proposed separately. It must not coordinate selection.

## Alternatives considered

- **Coordinating `wg-function-deck`:** rejected because it would duplicate tabs selection and focus
  behavior or proxy the same public API through another source of truth.
- **Generated data-driven component:** rejected because application function content, summaries,
  localization, and responses are too rich for an attribute or library-owned data schema.
- **Presentation-only wrapper element:** deferred because it currently adds no semantic or
  behavioral value. A later proposal may introduce one only if production fixtures prove a stable
  structural need.
- **Add selector behavior to `wg-elbow`:** rejected by ADR 0009 and the visual language because it
  would blur inert function structure with interactive selection.
