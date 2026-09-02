# Phase 6B package entry-point freeze

**Status:** Proposed on September 2, 2026. This is the first exact public-surface freeze slice. It
changes no package version, privacy, registry, repository visibility, or deployment state.

## Decision

Freeze the package subpaths listed in the accepted
[Phase 6A v1 scope inventory](./phase-6a-v1-scope-inventory.md) for the six v1 candidates:

- `@wayglass/core`;
- `@wayglass/tokens`;
- `@wayglass/themes`;
- `@wayglass/elements`;
- `@wayglass/icons`; and
- `@wayglass/react`.

The automated documentation-governance test now compares each manifest with that exact baseline. It
also requires every non-CSS element entry to have a matching React entry and forbids CSS entry
points from appearing in the React binding.

`@wayglass/testing` and `@wayglass/eslint-config` are recorded only as excluded controls. Their
current root entries are not v1 API and do not become release candidates through this test.

## Change policy

Before the v1 scope-freeze commit, an entry may change only through a reviewed correction that
updates the accepted inventory, this test, documentation, migration impact, and affected package
evidence together. After scope freeze, an entry-point change returns to Phase 6A and repeats all
affected validation.

This test deliberately freezes specifiers, not implementation files. Exact root runtime and type
symbols, component attributes/properties/events/slots/parts, tokens, themes, icons, and React props
remain subsequent Phase 6B freeze slices.

## Evidence

- Existing React package-surface tests verify that component entries resolve to matching source and
  declaration targets and that elements and React stay paired.
- Icon package-surface tests verify that root and component imports are the same side-effect-free
  optional runtime.
- Phase 5G pack inspection verified that all declared targets existed in the candidate tarballs.
- This change adds an exact manifest-key baseline without introducing an extraction dependency or
  generating release artifacts.

## Project-owner decision requested

Approve the six-package entry-point baseline and the change policy above. Approval freezes package
specifiers for the remaining Phase 6B work; it does not freeze inner symbols, choose versions, or
authorize publication.
