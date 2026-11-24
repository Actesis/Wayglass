# Changelog

All notable public Wayglass changes will be recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) without adding a release dependency, and
versions follow Semantic Versioning under the accepted release-governance contract.

## Unreleased

No changes yet.

## Foundation 0.1.1 — 2026-11-23

`@wayglass/core`, `@wayglass/tokens`, `@wayglass/themes`, and `@wayglass/elements` 0.1.1, released
under the
[0.1.1 release proposal](https://github.com/Actesis/Wayglass/blob/main/docs/governance/release-0.1.1-proposal.md).
Only `@wayglass/elements` changes materially; the other three move with the synchronized foundation
family. `@wayglass/icons` and `@wayglass/react` stay at 0.1.0, and React's `@wayglass/elements`
`^0.1.0` range accepts 0.1.1. See the
[0.1.1 release notes](https://wayglass.hoagsoftworks.com/maintenance/release-0.1.1).

### Fixed

- Text in `@wayglass/elements` wraps between words. Components no longer use
  `overflow-wrap: anywhere`, which let tables and other content-sized layouts squeeze them to one
  letter wide and break words mid-letter. A word now breaks only when it is longer than its line.
- Data tables keep each column at least one word wide and scroll inside their `wg-scroll-region`
  when they cannot fit, as documented, without an authored table width.
- `wg-button`, `wg-status-indicator`, `wg-badge`, `wg-metric`, and `wg-stale-data-marker` report
  their longest word as their minimum width, so they keep whole words in table cells. Each still
  breaks a single over-long word to stay inside a narrow container. `wg-status-indicator` and
  `wg-metric` now also cap their width at their container's, as the other three already did.
- The `wg-menu` trigger caps its width at its container's and wraps its label itself, instead of
  relying on wrapping inherited from where it is placed.
- In containers narrower than 36rem, `wg-command-bar` lets its stacked commands shrink to the bar's
  width, so a command label longer than the bar wraps instead of widening the page.
- A consumer can keep a `wg-button` label on one line in a table by setting `white-space: nowrap` on
  its `label` part.

### Changed

- A consumer-authored grid or flex container with a `1fr` or `auto` track now sees the real minimum
  width of Wayglass content inside it, where it previously saw a one-letter minimum. If such a
  container holds a data table, give its tracks `minmax(0, 1fr)` or its items `min-inline-size: 0`
  so the table scrolls inside its scroll region instead of widening the page. Wayglass layout
  primitives already do this.

## 0.1.0 — 2026-11-15

The first public npm release, for integration and feedback, made under the
[initial release proposal](https://github.com/Actesis/Wayglass/blob/main/docs/governance/initial-npm-release-proposal.md).
See the [0.1.0 release notes](https://wayglass.hoagsoftworks.com/maintenance/release-0.1.0).

### Added

- The foundation family `@wayglass/core`, `@wayglass/tokens`, `@wayglass/themes`, and
  `@wayglass/elements` at 0.1.0, with the independently versioned `@wayglass/icons` and
  `@wayglass/react` at 0.1.0. The `latest` and `next` dist-tags both point to 0.1.0.
