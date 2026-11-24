# Wayglass 0.1.1 release notes

Wayglass 0.1.1 is a patch to the foundation family, published to npm on November 23, 2026. It fixes
how text wraps in data tables and other layouts that size themselves to their content. The `latest`
dist-tag now resolves to 0.1.1 for these four packages:

| Package                                                                  | Change in 0.1.1                    |
| ------------------------------------------------------------------------ | ---------------------------------- |
| [`@wayglass/elements`](https://www.npmjs.com/package/@wayglass/elements) | Wrapping and table-layout fixes    |
| [`@wayglass/core`](https://www.npmjs.com/package/@wayglass/core)         | Version only (synchronized family) |
| [`@wayglass/tokens`](https://www.npmjs.com/package/@wayglass/tokens)     | Version only (synchronized family) |
| [`@wayglass/themes`](https://www.npmjs.com/package/@wayglass/themes)     | Version only (synchronized family) |

`@wayglass/icons` and `@wayglass/react` stay at 0.1.0. React's `@wayglass/elements` range (`^0.1.0`)
accepts 0.1.1, so React applications get the fix with a normal update.

## Fixed

- Text wraps between words. A word breaks only when it is longer than its whole line, never to make
  a component narrower.
- Data tables keep each column at least one word wide. A table that cannot fit scrolls inside its
  `wg-scroll-region`, as documented, with no authored table width.
- `wg-button`, `wg-status-indicator`, `wg-badge`, `wg-metric`, `wg-stale-data-marker`, and the
  `wg-menu` trigger keep whole words in table cells. In a narrow container, each still breaks a
  single word that cannot fit.
- In containers narrower than 36rem, `wg-command-bar` lets stacked commands shrink to the bar's
  width instead of widening the page.
- A `wg-button` label can stay on one line in a table:
  `wg-button.single-line::part(label) { white-space: nowrap; }`.

## Check your own layouts

A grid or flex container that your application authors now sees the real minimum width of Wayglass
content inside it, where it used to see one letter. If a data table sits directly in a `1fr` grid
track of your own, use `minmax(0, 1fr)` for that track, or give the item `min-inline-size: 0`. The
table then scrolls inside its region instead of widening the page. Wayglass layout primitives
already do this.

## Verification

The four tarballs on npm match the release plan byte for byte. They were staged with npm provenance
from the [release workflow](/governance/npm-release-workflow) at commit `66c07ea` (tag
`foundation-v0.1.1`), then approved by the project owner. A clean, unversioned install selects
0.1.1, and `npm audit signatures` verifies their registry signatures and attestations. Support and
known limitations are unchanged from [0.1.0](/maintenance/release-0.1.0); see the
[support policy](/maintenance/support).

For feedback, include a minimal reproduction and the exact package, browser, and runtime versions.
