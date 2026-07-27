# Visual foundations

Wayglass uses a **humanist, compact, and banded** visual grammar. The visual language communicates
structure and meaning without depending on decorative science-fiction styling or domain-specific
icons.

## Functional zoning

Functions have obvious identities and neutral boundaries. Their scope, state, information, and
actions remain visually local. Consequential actions repeat the owning function and target scope.

Multiple functions may appear on one screen. Stoplight colors do not distinguish neighboring
functions; they retain condition meaning.

## Section purpose

Function ownership and section purpose are independent:

- **Information** explains or provides reference and context. It remains neutral by default.
- **Monitor** presents current or changing state and uses applicable state signals.
- **Control** offers actions with explicit function, target scope, feedback, and safeguards.

## Value is not condition

`Off`, `closed`, and `unverified` are domain values, not failures. Stoplight colors reinforce
condition:

- green for normal, healthy, or positive;
- amber for degraded, delayed, stale, or cautionary state;
- red for critical, failed, or urgent condition.

Blue reinforces action, selection, informational data, pending activity, and asserted values. It
does not mean healthy.

## Boolean values

All genuinely Boolean values share one visual grammar:

- **Asserted:** lit, filled, or otherwise emphasized.
- **Not asserted:** unlit, outlined, or subdued.

The product still shows domain words such as `On`/`Off`, `Open`/`Closed`, or
`Verified`/`Unverified`. Icons are optional.

The same roles support three scales:

1. a compact value rail attached to a labeled field;
2. a prominent lit or unlit value field;
3. supplementary value-text emphasis.

Unknown remains a knowledge state, not `false`. Multi-valued domain states must not be flattened
into a Boolean.

## Accessibility

Color never communicates meaning alone. Labels, fill, luminance, position, geometry, and optional
icons provide redundant cues. Compact density never reduces accessible interactive targets.
