# Function Deck

**Status:** Planned for Phase 2. The name describes the pattern and is not yet a public component
name.

## Intent

A Function Deck presents peer functions as restrained, folder-like selectors attached to one shared
working surface. Selecting a function brings its information, state, and actions forward as though
the user had selected a physical folder tab.

The metaphor explains layering and selection. It must not become literal filing-cabinet
skeuomorphism through paper textures, ornamental shadows, or decorative stacking.

## Relationship to overview composition

Overview and focused deck are complementary:

- **Overview** keeps multiple functions visible for rapid scanning, comparison, and wall-panel
  awareness.
- **Focused deck** gives one function more space and attention when work is sequential or the
  available surface is constrained.

Applications may offer both modes over the same function model. Switching composition must not
change the meaning, ownership, or confirmed state of the underlying functions.

The Phase 1 Operations Overview remains an overview. The Function Deck does not replace its
simultaneous-awareness requirement.

## Appropriate use

Use a Function Deck when:

- selectors represent peer functions or peer workspaces;
- one function is the clear working context at a time;
- switching is frequent, inexpensive, and reversible;
- the active function benefits materially from additional space;
- hidden functions can be summarized honestly and concisely.

Do not use it when:

- simultaneous comparison is the primary task;
- hiding a function would conceal essential state or the only available response;
- the selectors represent information, monitor, and control sections that need to remain visible
  together;
- selection would discard unsaved work, focus context, or confirmed state;
- the selector set is too large or unstable for predictable spatial memory.

## Anatomy

A deck contains:

1. a labeled group of peer function selectors;
2. one selected function;
3. one shared working surface associated with the selected function;
4. optional concise summaries attached to non-selected selectors;
5. a persistent path to any hidden consequential state or action.

Selectors may use restrained folder-shoulder geometry. The selected selector visually connects to
the working surface. Static `wg-elbow` headings retain continuous heading-to-rail geometry and must
not be repurposed as selectors.

## State safeguards

Non-selected functions with consequential state must remain glanceable:

- caution and critical condition use explicit state words;
- stale and unavailable knowledge remain distinct from domain value;
- pending activity identifies the request still underway;
- summaries do not rely on color or icons;
- a selector never implies healthy state merely because no summary is shown.

Critical state and its primary response must remain discoverable without cycling through every
selector. Depending on consequence, the application may expose the summary in the selector, a
persistent deck summary, or the surrounding overview.

## Interaction and accessibility

The Function Deck will compose the Phase 2 tabs primitive and follow the established tabs pattern:

- one selector participates in the page tab order;
- arrow keys move among peer selectors;
- Home and End move to the first and last selectors;
- Tab moves into the active working surface;
- selected state is programmatically exposed;
- each working surface is associated with its selector;
- focus does not move merely because remote state changes;
- automatic versus manual activation is chosen deliberately and documented.

Selection must use shape, position, text, and contrast rather than hue alone. Selectors must remain
large enough for touch and legible at wall-display distance.

## Responsive behavior

A Function Deck may be useful on phone, desktop, or wall displays; viewport size alone does not
choose the composition.

- On phones, selectors may recompose or scroll without hiding the selected label or consequential
  summaries.
- On desktops, applications may offer overview and focused modes when both scanning and deep work
  matter.
- On wall displays, overview remains preferred for ambient awareness; a focused deck is appropriate
  as an intentional operator view.

Selection order, accessible names, state summaries, and function ownership remain consistent across
sizes.

## Implementation plan

Phase 2 will:

1. specify and implement the tabs and selection primitives;
2. define the production composition API after those primitives are validated;
3. reuse the same domain-neutral function fixtures in overview and focused modes;
4. add phone, desktop, and wall-panel stories;
5. validate keyboard use, screen readers, zoom, forced colors, reduced motion, focus stability, and
   supported browser engines.

No Phase 1 structural component gains selector behavior in anticipation of this work.
