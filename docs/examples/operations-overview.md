# Phase 1 reference slice: Operations Overview

## Purpose

Operations Overview is the reference composition for Phase 1. It is intentionally domain-neutral: it
demonstrates operational awareness without assuming a smart home, infrastructure product, fleet, or
fictional control system.

The slice validates the complete loop of orientation, understanding, action, and confirmation. It is
a fixture for component development, responsive behavior, accessibility testing, and visual
review—not a product template.

## Screen contract

The screen answers the Wayglass orientation questions:

1. **Where am I?** The page title identifies Operations Overview and every function repeats its
   scope.
2. **What is happening?** Values, condition, knowledge, and activity remain independently visible.
3. **What should I do next?** Controls remain inside the function they affect and state their
   target.

The desktop and wall-panel compositions show three function zones:

| Function       | Section purposes                  | Representative content                             |
| -------------- | --------------------------------- | -------------------------------------------------- |
| Access         | Information and monitor           | Access policy context; operator verification       |
| Communications | Monitor and control               | Primary-link state and latency; retry connection   |
| Processing     | Information, monitor, and control | Intake policy; queue depth; pause or resume intake |

The functions are examples only. No component API contains these names or encodes their domain
behavior.

## Semantic fixtures

The canonical mixed-attention fixture uses these independent combinations:

| Function       | Domain value | Value role | Condition | Knowledge | Activity | Why it matters                                       |
| -------------- | ------------ | ---------- | --------- | --------- | -------- | ---------------------------------------------------- |
| Access         | Verified     | asserted   | positive  | confirmed | idle     | Baseline Boolean value with healthy condition        |
| Communications | Connected    | asserted   | caution   | stale     | idle     | Asserted does not mean healthy or current            |
| Processing     | Open         | asserted   | critical  | confirmed | pending  | A value may remain asserted while action is underway |

Additional fixtures must cover:

- a not-asserted value with a positive condition;
- an unavailable value whose last known Boolean role is still retained;
- loading before a value is known;
- warning and critical condition without relying on color;
- a failed or rejected action that leaves the confirmed value unchanged;
- a pending action that distinguishes requested state from confirmed state.

Unknown knowledge must never be represented by changing an asserted value to not asserted.

## Functional zoning

Each function has:

- a heading that names the function;
- a strong neutral outer boundary and gutter;
- local information, monitoring, and controls;
- a stable content order;
- an accessible region name;
- no condition-colored boundary used merely for identification.

`wg-rail` and `wg-elbow` provide neutral structural continuity. They do not carry condition or
Boolean-value meaning in Phase 1. Colored signals are rendered by the component that owns and labels
the underlying state.

Consequential controls repeat the function and target in their accessible name. For example, “Retry
Communications primary link” is acceptable; “Retry” by itself is not.

## Responsive composition

The reference widths are test fixtures, not device detection:

| Fixture    | Container width | Composition contract                                         |
| ---------- | --------------- | ------------------------------------------------------------ |
| Phone      | 20rem           | One function per row; heading precedes state and controls    |
| Desktop    | 72rem           | Three visible function zones with stable aligned scan points |
| Wall panel | 120rem          | Same hierarchy with larger signals and reading-distance type |

Responsive changes recompose rather than scale the desktop layout. Phone order is Access,
Communications, then Processing. Critical state and its related action remain visible without
horizontal scrolling. The wall-panel fixture uses prominent value fields while preserving the same
accessible names and semantic roles.

### Relationship to the focused function deck

Operations Overview remains the canonical simultaneous **overview** composition for Phase 1. Its
purpose is to prove that Access, Communications, and Processing can be scanned together without
confusing ownership or section purpose.

The planned [Function Deck](../patterns/function-deck.md) is a compatible focused composition, not a
replacement. It may present the same peer functions through selectors attached to one shared work
surface on phones, desktops, or wall displays. Its selectors must summarize consequential hidden
state, and critical state and its primary response must remain discoverable when another function is
selected.

## Theme and density fixtures

Phase 1 requires:

- Wayglass Dark and Wayglass Light;
- compact and comfortable density;
- system and explicit theme selection;
- reduced motion;
- forced-colors and 200% zoom review.

Theme changes must preserve semantic meaning, functional boundaries, contrast, and asserted versus
not-asserted luminance.

## Interaction contract

- Tab order follows reading order within each function.
- Structural components never enter the tab order.
- Buttons use native button behavior.
- A pending action remains identifiable and does not imply confirmed success.
- Feedback is announced without moving focus.
- No live update reorders functions or moves an available control.
- Reduced motion removes nonessential transitions without delaying state updates.

## Executable fixtures

Storybook exposes the production composition under **Examples / Operations Overview**:

- Desktop Dark and Desktop Light keep all three function zones visible.
- Phone recomposes the same content into a single ordered column.
- Wall Panel enlarges glanceable status and Boolean signals without changing their semantics.
- Required Edge States covers healthy not-asserted, retained unavailable, loading-before-known, and
  rejected-request cases.

The Storybook stories and cross-browser test harness import the same canonical renderer from
`apps/storybook/stories/operations-overview.fixture.ts`. This keeps visual review, responsive tests,
and accessibility checks on the production elements instead of a parallel mock.

The runnable [framework examples](./framework-examples.md) apply the same screen contract through
plain Custom Element registration and the typed React wrappers.

## Implementation boundary

The executable fixture must use production exports from `@wayglass/elements`; the React fixture must
use `@wayglass/react`. Storybook is the canonical interactive and visual fixture. The documentation
site explains the composition and links to the production-backed examples.

No parallel mock implementation is permitted.
