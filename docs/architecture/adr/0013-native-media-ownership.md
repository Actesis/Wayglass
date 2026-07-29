# ADR 0013: Keep media sources and semantics in consumer-authored native elements

- Status: proposed
- Date: 2026-07-29

## Context

Phase 2C needs image-bearing interfaces for asset identification, diagrams, screenshots, camera
stills, and other domain-neutral visual references. Those images must participate in Wayglass
layout, theming, loading, unavailable presentation, and optional full-size inspection without making
media the only source of state or instructions.

Native `<img>` and `<picture>` already expose a large, security-sensitive API for sources,
responsive selection, alternatives, request policy, decoding, loading, intrinsic sizing, and browser
behavior. Reproducing those fields on a Custom Element would be incomplete and would encourage the
shared function model to absorb application URLs, credentials, or asset metadata.

A visual wrapper still has useful responsibilities: stable aspect geometry, contained or deliberate
cover fit, a neutral boundary, coordinated loading and unavailable presentation, and consistent
placement for an inspection action.

## Decision

Implement `wg-media` as a small presentation Custom Element in `@wayglass/elements`.

The application authors exactly one native `<img>` or `<picture>` in light DOM. That native content
owns its `src`, `srcset`, `sizes`, `alt`, dimensions, request policy, loading, decoding, and events.
Native `<figure>` and `<figcaption>` remain outside the component when a caption is needed.

`wg-media` owns only:

- a closed aspect vocabulary and stable viewport geometry;
- safe `contain` or deliberate `cover` fit;
- neutral background, boundary, radius, and fallback placement;
- explicit `ready`, `loading`, and `unavailable` presentation;
- slots for application-authored loading, unavailable, and inspection content.

The component performs no fetch, retry, prefetch, proxying, transformation, recognition, telemetry,
or metadata extraction. It emits no translated media events and adds no image, figure, landmark, or
live-region semantics. The shared function state model does not gain media URL fields.

The component remains side-effect free until explicit registration and receives a typed React
wrapper. A small opt-in fallback stylesheet will reproduce named state-slot visibility before
upgrade; the native image and surrounding content remain visible and usable without component
enhancement.

Full-size inspection remains a consumer-authored native link or application-owned button. An
official modal viewer is deferred until Wayglass has accepted dialog, overlay, and focus-management
contracts.

## Consequences

Applications retain the complete native image platform and can use local, authenticated, proxied,
generated, or third-party sources without Wayglass becoming an asset transport. Alternative text and
captions remain inspectable native markup. Client-only rendering preserves meaningful source order,
and a failed component upgrade cannot erase the actual image or its surrounding task context.

Consumers must coordinate the component's presentation state with their native request lifecycle.
They also remain responsible for privacy, authorization, CSP, request metadata, responsive source
sizes, useful alternatives, and secure upload processing.

Shadow DOM cannot style descendants inside a slotted `<picture>`. Implementation must therefore
publish and document a minimal media-asset class for the final nested `<img>`, or use an equivalent
standards-based mechanism verified across supported browsers. Direct slotted `<img>` content may be
styled through `::slotted`.

Stateful named slots need correct visibility before upgrade. Applications using them must load the
fallback stylesheet or author equivalent state selectors. This is a presentation dependency, not a
semantic dependency: the native image, alt, inspection action, and surrounding text remain in light
DOM.

## Alternatives considered

- **Copy the native image API onto `wg-media`:** rejected because it creates an incomplete parallel
  platform, obscures request policy, and couples Wayglass to application URLs.
- **Add media fields to the shared function state model:** rejected because functions may have zero,
  one, or many application-specific assets and URL ownership is unrelated to the shared value,
  condition, knowledge, and activity axes.
- **Use CSS background images:** rejected because they lack native alternative text, responsive
  source selection, intrinsic dimensions, printing behavior, and ordinary image events.
- **Publish only a loose CSS example:** rejected because aspect, fit, fallback, parts, tokens, React
  typing, and cross-browser state behavior would drift between applications.
- **Make captions or filenames generate alternative text:** rejected because a useful alternative
  depends on purpose and context and must not be guessed.
- **Automatically open an internal lightbox:** rejected because modal semantics, focus return,
  zooming, source authorization, and history behavior need a separate contract.
- **Automatically infer loading and failure:** rejected because applications may retain prior
  pixels, use authenticated refresh, or distinguish transport failure from intentionally absent
  media.
