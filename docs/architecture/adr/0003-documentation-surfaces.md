# ADR 0003: Use Storybook and VitePress for distinct documentation roles

- Status: accepted
- Date: 2026-07-27

## Context

Wayglass needs exhaustive executable component states and an authored site explaining philosophy,
patterns, accessibility, and APIs. One surface optimized for both jobs would compromise at least one
of them.

## Decision

Use Storybook as the component workshop and executable state catalog. Use VitePress as the dedicated
documentation site. Both must consume production workspace packages. Stories are the canonical
interactive fixtures and must not be reimplemented in the documentation site.

## Consequences

The repository contains two development applications. Vue remains an implementation detail of the
documentation application and is not a production package dependency. Shared tokens and examples
must prevent visual drift.

## Alternatives considered

- Storybook alone: insufficient for the intended authored design-language narrative.
- A custom documentation application: unnecessary maintenance during Phase 0.
- Astro: its deprecated official Lit integration weakens its advantage for this repository.
