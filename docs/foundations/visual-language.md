# Visual foundations

Wayglass uses a humanist, compact, and banded visual grammar. The visual language exists to make
structure, value, condition, knowledge, activity, and action understandable at a glance. It must not
depend on decorative science-fiction styling or domain-specific iconography.

All values in the Phase 0 token set remain provisional. The semantic relationships in this document
are the accepted foundation.

## Visual grammar

- **Humanist typography:** readable, approachable type carries hierarchy. Technical or monospaced
  treatment is reserved for values, identifiers, and data that benefit from it.
- **Compact density:** information is presented efficiently without shrinking text, focus
  indicators, or interactive targets below accessibility requirements.
- **Banded geometry:** restrained bands, rails, rounded-square signals, and neutral boundaries
  communicate ownership and grouping. Geometry must not become ornament.

## Functional zoning

A function is an area of product responsibility, such as routing, messaging, safeguards, account
administration, or reporting. Multiple functions may appear on one screen.

Each function must have an obvious identity and boundary. Its scope, state, information, and actions
must remain visually local to it. Consequential actions must repeat the owning function and target
scope. A user should not be able to mistake one function's control for another's.

Neutral boundaries, gutters, headings, and containment separate functions. Stoplight condition
colors must not be used merely to distinguish neighboring functions. A colored rail must not float
at a function boundary without an explicit, stable meaning.

## Section purpose

Function ownership and section purpose are independent. A function may contain any combination of:

| Purpose     | Meaning                                                        | Default treatment                             |
| ----------- | -------------------------------------------------------------- | --------------------------------------------- |
| Information | Explanatory, reference, historical, or contextual content      | Neutral structure; no implied state or action |
| Monitor     | Current or changing state that the user may need to understand | Applicable state signals with explicit labels |
| Control     | Actions that can change a system or value                      | Explicit function, target scope, and feedback |

Status lights and condition color appear only when a section contains actual state to summarize.
Informational sections must not be decorated as healthy merely because they are present.

## Separate domain value from known state

A domain value answers a domain question:

- Is the lamp on?
- Is the door open?
- Is the email address verified?
- Which route is selected?

Known state answers different questions:

- What is the interpreted condition?
- How well is it known?
- Is an action or transition underway?

The value `off` does not mean a lamp has a problem. The value `open` does not universally mean a
door is unsafe. A value can remain `on` while its condition is critical, or be last known as `on`
while its knowledge state is stale.

## Boolean value grammar

Genuinely Boolean values share one presentation contract:

| Boolean role | Visual meaning                       | Health meaning |
| ------------ | ------------------------------------ | -------------- |
| Asserted     | Lit, filled, or otherwise emphasized | None           |
| Not asserted | Unlit, outlined, or subdued          | None           |

Products must show domain language such as `On`/`Off`, `Open`/`Closed`, or `Verified`/`Unverified`;
they must not expose generic `true`/`false` or `yes`/`no` when the domain term is known.

Wayglass supports three scale treatments of the same Boolean grammar:

1. **Value rail:** the compact default for dense interfaces. The rail must be attached to a labeled
   value field.
2. **Value field:** a stronger lit or unlit field for wall displays, prominent tiles, and
   at-a-distance reading.
3. **Value text:** supplementary emphasis only; text treatment must not carry the value by itself.

Icons are optional reinforcement. The grammar must remain understandable without them.

Boolean presentation must not flatten finite values. Moving, obstructed, pending, expired, or
partially open are distinct values when the domain can report them. Unknown is a knowledge state,
not `false`.

## Semantic color

- Green reinforces normal, healthy, or positive **condition**.
- Amber reinforces degraded, delayed, stale, or cautionary state when attention is warranted.
- Red reinforces critical, failed, or urgent **condition**.
- Blue reinforces actions, selection, informational data, pending activity, and asserted values. It
  does not mean healthy.
- Neutral treatment supports informational content, not-asserted values, inactive presentation, and
  structure.

Exact hues may change by theme. Themes must preserve these semantic relationships.

Color never communicates meaning alone. Labels, fill, luminance, position, geometry, and optional
icons provide redundant cues.

## Status lights

Compact status-light clusters may summarize several comparable conditions or knowledge sources. They
must:

- use stoplight colors only for condition or attention meaning;
- include an accessible summary;
- remain attached to the function or monitored value they describe;
- avoid becoming decorative activity lights.

## Accessibility and distance

Wayglass must remain understandable in grayscale, with color-vision deficiency, at enlarged text
sizes, and without icons. Asserted and not-asserted values must differ through fill or luminance in
addition to hue. Critical state must retain text or symbolic reinforcement.

Compact density must never reduce interactive targets below the documented minimum. At wall-display
distance, prominent value fields and status clusters may increase in size without changing their
semantic roles.
