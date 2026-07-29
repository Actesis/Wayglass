# Function Deck

**Status:** Production composition contract accepted and validated for Phase 2B on July 29, 2026,
together with [ADR 0010](../architecture/adr/0010-function-deck-composition.md). Validation evidence
is recorded in the
[Phase 2B Function Deck validation record](../accessibility/phase-2b-function-deck-validation.md).

Function Deck is a pattern name, not a Custom Element. Its public selection API is the accepted
[tabs contract](../components/tabs.md).

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

The reference focused composition uses a plain repeated function heading inside the working surface.
Placing an elbow immediately beneath a folder-like selected tab creates a second selector-shaped
layer even when the elbow is technically inert.

## Production composition API

The production API is a declarative composition of the tabs compound elements. It introduces no
`wg-function-deck` element, selected property, or change event:

```html
<section aria-labelledby="focused-functions-heading">
  <h1 id="focused-functions-heading">Focused functions</h1>

  <wg-tabs value="access" activation="automatic">
    <wg-tab-list aria-label="Operational functions">
      <wg-tab value="access">Access</wg-tab>
      <wg-tab value="communications">
        Communications
        <span slot="summary"> Caution · Data stale · Backup unavailable · Retry available </span>
      </wg-tab>
      <wg-tab value="processing">
        Processing
        <span slot="summary">Critical · Pause pending</span>
      </wg-tab>
    </wg-tab-list>

    <wg-tab-panel value="access">
      <section aria-labelledby="focused-access-heading">
        <h2 id="focused-access-heading">Access</h2>
        <!-- Information, monitor, and control sections for Access -->
      </section>
    </wg-tab-panel>

    <wg-tab-panel value="communications">
      <section aria-labelledby="focused-communications-heading">
        <h2 id="focused-communications-heading">Communications</h2>
        <!-- Information, monitor, and control sections for Communications -->
      </section>
    </wg-tab-panel>

    <wg-tab-panel value="processing">
      <section aria-labelledby="focused-processing-heading">
        <h2 id="focused-processing-heading">Processing</h2>
        <!-- Information, monitor, and control sections for Processing -->
      </section>
    </wg-tab-panel>
  </wg-tabs>
</section>
```

The composition uses the `wg-tabs` properties, methods, and `wg-tab-change` event without proxying
them. Application code owns the selected value and one stable function order. The reference
composition uses automatic activation because every panel is present locally; delayed or fetched
content uses manual activation or is preloaded as required by the tabs contract.

The application-owned function model must provide, at minimum:

- one stable, non-empty value;
- one concise visible label;
- consumer-authored selector summary content when hidden state is consequential;
- one panel whose heading repeats function identity;
- the function's information, monitor, and control content;
- any critical-response path required while the function is hidden.

This is a content contract, not a library-owned TypeScript model. Phase 2B fixtures define one
domain-neutral reference model and render it into both overview and focused compositions. That
fixture model is test data, not an additional public selection API.

### Composition ownership

| Concern                            | Owner                                      |
| ---------------------------------- | ------------------------------------------ |
| Selection and roving focus         | `wg-tabs`                                  |
| Selector and panel relationships   | `wg-tabs`, `wg-tab`, and `wg-tab-panel`    |
| Function order and selected value  | Application function model                 |
| Condition, knowledge, and activity | Application state model and content        |
| Selector summary language          | Application content                        |
| Critical-response policy           | Application composition                    |
| Internal function structure        | Existing Wayglass structural components    |
| React typing                       | Existing typed wrappers for composed parts |

Viewport size does not change ownership, reorder functions, or select a different value.

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

A critical selector summary must name the critical state and either name the response cue or make
the directly associated panel unambiguous. If selecting the function is not a sufficient or timely
path, the composition must add a named persistent summary or action outside the tablist. It must not
place a button or link inside `wg-tab`.

When an external persistent action opens a function, it sets the existing `wg-tabs.value` and may
call `focusSelected()` so the user's explicit navigation action has a predictable destination. It
does not synthesize `wg-tab-change`; the external action is already the user-intent event.

The reference deck applies this safeguard to Processing intake. A named critical-response panel
remains visible while Access or Communications is selected, states that the pause request is pending
while the confirmed gate remains open, and provides an “Open Processing response” action. That
action selects and focuses the existing Processing tab; it does not duplicate the pending control or
create another selection owner.

## Interaction and accessibility

The Function Deck composes the Phase 2 tabs primitive and follows the established tabs pattern:

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

The production-backed phone, desktop, and wall-display compositions are implemented from `wg-tabs`
and existing function surfaces. Overview and focused fixtures consume one ordered domain-neutral
function model for stable values, visible labels, selector summaries, and content rendering. The
model is fixture data, not a public Wayglass schema, and deliberately does not prescribe fields such
as media URLs.

Browser coverage confirms that both compositions retain the same function identity and order, tabs
remain the only selection owner, and the focused surface does not introduce a nested elbow-shaped
selector layer. Hidden peer selectors retain explicit caution, critical, stale, unavailable, and
pending language while their panels are not visible. The persistent Processing response path remains
available without becoming a second selection owner. Phone keeps the selectors in one horizontally
scrollable tab strip without page overflow, desktop uses compact density, and wall-display fixtures
use comfortable density with prominent semantic signals. Composition-level browser coverage
validates keyboard and pointer selection, stable focus during peer updates, retained per-function
context, touch targets, reduced motion, forced colors, 200% zoom-equivalent reflow, and Axe-clean
dark and light themes.

Phase 2 will:

1. reuse the same domain-neutral function fixtures in overview and focused modes;
2. compose the production deck directly from tabs;
3. preserve all required hidden-state summaries and a critical-response path;
4. add phone, desktop, and wall-panel stories;
5. validate keyboard use, screen readers, zoom, forced colors, reduced motion, focus stability, and
   supported browser engines.

No Phase 1 structural component gains selector behavior in anticipation of this work.
