# Static review and accessibility evidence

- Evidence: `P5D-A-E04` and `P5D-A-E05`
- Date: 2026-08-29
- Engines: Chromium, Firefox, and WebKit through Playwright 1.62.0
- Visual inspection: Codex in-app browser at a 1200 × 900 viewport
- Production effect: none

## Generated review surface

The authenticated artifact set now includes a dependency-free static `review-index.html`. It is
generated from the validated records, contains no script, and uses internal SVG symbols rather than
raw authored markup. The index renders:

- all five proof glyphs in light and dark review regions;
- exact compact, standard, and prominent sizes of 16, 24, and 40 CSS pixels;
- LTR and RTL presentations with mirroring only for the declared directional fixture;
- textual identity, direction, category, and accessible-use metadata;
- one named tooling reference, three visibly named owning controls, and the same three tasks with
  every icon absent; and
- an explicit text-backed missing-preview case.

Automated geometry inspection confirms that every non-empty glyph bound remains inside the authored
`0 0 24 24` view box. Manual full-page inspection found no clipping, ambiguous direction, missing
labels, or unexplained light/dark difference.

## Browser and accessibility result

Nine tests pass: three tasks in each of Chromium, Firefox, and WebKit. They verify the complete
fixture count, exact sizes, bounds, SVG decorative attributes, standalone reference naming,
control-name ownership, missing-preview naming, directional transforms, 320-pixel containment at
200% root text, forced colors, grayscale, reduced motion, and persistent text distinctions.

Axe reports zero violations in the baseline surface in all three engines. The forced-color,
grayscale, and 200% case also reports zero violations with only Axe's color-contrast rule disabled;
forced-color contrast is reviewed through platform colors and visible non-color borders instead.
Decorative geometry is `aria-hidden` and unfocusable, the named reference owns one tooling-only
name, controls receive their names from visible text rather than SVG, and all tasks remain
understandable without icons.

## Adverse finding and correction

The first three-engine run found horizontal overflow in every engine at 320 pixels with 200% root
text. Definition-list margins and min-content sizing in the review grids widened the main track. The
generated layout now resets definition margins, permits long metadata and labels to wrap, and sets
explicit zero minimum inline sizes at nested grid boundaries. Focused Chromium validation and the
repeated full three-engine matrix pass after the correction.

## Limits retained

This is a synthetic tooling review, not a production component or public icon gallery. The named
reference does not change the source model's reinforcement-only application guidance. No manual
screen-reader session, low-vision user study, optical-design sign-off, production runtime migration,
or design-tool compatibility is claimed.
