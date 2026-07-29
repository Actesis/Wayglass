# ADR 0011: Match each foundation to the smallest semantic delivery mechanism

- Status: proposed
- Date: 2026-07-29

## Context

Phase 2C adds typography, icons, visually hidden content, focus rings, surfaces, and dividers. The
component roadmap names these as foundations, but turning every item into a Custom Element would add
hosts to the accessibility tree and make native text or focus semantics harder to express. Making
everything a global CSS utility would avoid extra elements but leave rendered surfaces, separators,
and SVG icon behavior without typed declarative contracts.

The split must preserve framework-neutral use, client-only fallback, native semantics, theme
adaptation, Shadow DOM boundaries, and Wayglass's rule that icons cannot become required meaning.

## Decision

Use the smallest delivery mechanism that owns the required behavior:

- publish typography, visually hidden content, and consumer focus rings as opt-in classes in
  `@wayglass/elements/foundations.css`;
- implement neutral containment and separators as inert `wg-surface` and `wg-divider` Custom
  Elements in `@wayglass/elements`;
- implement `wg-icon` and the official local SVG catalog in the optional `@wayglass/icons` package;
- keep native document semantics, layout ownership, focusability, and application state outside
  these foundations.

The utility stylesheet sets no roles, DOM order, focusability, margins, or application state. Custom
Element modules remain side-effect free until their explicit registration functions are called. The
icon component accepts reviewed local catalog names, not remote URLs or arbitrary SVG markup, and
defaults to decorative accessibility behavior.

The detailed APIs and anti-use rules are defined in `docs/foundations/foundation-contracts.md`.

## Consequences

Native headings, paragraphs, labels, skip links, and controls retain their platform behavior.
Consumers can apply Wayglass typography and focus treatment without wrapping content in invented
elements. Surface and divider behavior remains typed, themeable, testable, and consistent across
frameworks. Icons stay optional and separately installable.

The repository gains one public CSS export, two `@wayglass/elements` components, and a future
`@wayglass/icons` package. React wrappers are required for the two elements in `@wayglass/elements`;
the icon package may provide its own typed React integration later if direct Custom Element
consumption proves insufficient.

Utility classes cannot style inside another component's Shadow DOM. Components must continue to
consume the shared tokens internally. Consumers must deliberately import the foundations stylesheet.
An unupgraded surface preserves its light-DOM content, while dividers and icons are allowed to be
visually absent only because they cannot own essential meaning.

## Alternatives considered

- **A Custom Element for every foundation:** rejected because `wg-text`, `wg-visually-hidden`, and
  `wg-focus-ring` hosts would obscure native semantics without owning meaningful behavior.
- **CSS utilities for every foundation:** rejected because surface variants, separator semantics,
  and labeled versus decorative SVG behavior benefit from typed declarative APIs.
- **One generic `wg-box` or `wg-primitive`:** rejected because a prop-heavy abstraction would blur
  containment, layout, and semantic responsibilities.
- **Bundle icons into `@wayglass/elements`:** rejected because icons are optional, catalog growth is
  independent, and `SPEC.md` assigns them a separate package.
- **Allow remote or arbitrary icon sources:** rejected because it complicates security, fallback,
  consistency, and accessibility review.
- **Make icons the primary state vocabulary:** rejected because icons are not universal and Wayglass
  must remain understandable without them.
