# Phase 6B media contract audit

**Status:** Proposed on September 3, 2026. This record reconciles `wg-media` and `wg-media-viewer`
against their implementations, opt-in fallback stylesheets, architecture decisions, documentation,
React bindings, stories, and browser evidence. It changes no package version, privacy, registry, or
deployment state.

## Scope

The audit covers native media ownership; fields and defaults; closed vocabularies; slots; CSS parts
and custom properties; progressive enhancement; loading and unavailable presentation; explicit
inspection; native modal ownership; fit, actual size, bounded zoom, and pan; focus and close
reasons; events; explicit registration; and React adaptation.

Asset storage, URLs, authorization, request policy, alternative text, captions, application state,
galleries, editing, recognition, metadata, downloads, and domain-specific imagery remain outside
this family.

## Result

The components remain aligned with ADRs 0013 and 0023. `wg-media` frames one consumer-authored
native image or picture without taking over source or semantic ownership. `wg-media-viewer` accepts
a separately authored native image or picture and adds only bounded modal inspection. Neither
copies, moves, discovers, fetches, authorizes, or transforms the other's source.

Two CSS-part omissions were corrected in the viewer contract: its loading and unavailable nodes
expose `state-loading` and `state-unavailable` in addition to their shared `state` part. The media
contract's stale statements that a package viewer remained deferred were reconciled with the
implemented viewer while preserving explicit, application-owned invocation and authorization.

The viewer's measured inline and block dimensions had public-looking custom-property names even
though they are private controller output written on an internal shadow node. They are now
explicitly private as `--_wg-media-viewer-rendered-inline` and `--_wg-media-viewer-rendered-block`,
with their mechanical role documented in code. `wg-media-viewer` exposes no element-specific CSS
custom properties; `wg-media` retains its nine intentional presentation hooks.

Validation language now distinguishes current automated evidence from product-owned alternative
text, localization, privacy, source policy, authorization, and representative assistive-technology
review.

## Frozen contract

- In-page media owns reflected aspect, fit, resource state, and boundary fields with
  auto/contain/ready/subtle defaults. It exposes one native-media slot, loading, unavailable, and
  inspection slots; seven CSS parts; nine intentional styling hooks; and no methods or events.
- The viewer owns reflected viewer ID, open state, resource state, and initial view plus five
  required localized control labels. It exposes one native-media slot and heading, caption, context,
  loading, and unavailable slots; eighteen CSS parts; and no element-specific CSS custom properties.
- Viewer methods remain `show`, `close`, `fit`, `actualSize`, `zoomIn`, and `zoomOut`. Open, close,
  and view-change events report presentation identity, close reason, current view, and numeric scale
  without becoming durable application state.
- Fit never enlarges past intrinsic size. Actual size remains one intrinsic pixel per CSS pixel.
  Intermediate zoom stays between those bounds, and pan remains a labeled native scroll region
  without captured browser zoom, wheel, pinch, or drag-only interaction.
- Both opt-in stylesheets preserve the accepted client-only fallback and nested-picture treatment.
  Both modules remain side-effect free. React registers the production classes, maps viewer events,
  and adds no source, request, modal, or scale behavior.

## Validation

The field-level documentation suite passes all 130 checks. ESLint, element, documentation, and React
typechecks, the production documentation build, and all 17 React tests pass. The combined media
browser matrix passes all 81 cases across Chromium, Firefox, and WebKit, including progressive
fallback, native semantics, fit and bounded zoom, native pan, modal coordination, loading and
unavailable states, both themes, Axe scans, forced colors, reduced motion, and constrained reflow.

## Remaining release evidence

Final application alternatives, localization, privacy and request policy, authorization, and
responsive source selection remain consumer validation. VoiceOver/Safari and NVDA with Firefox on
Windows remain open pre-public-release evidence for modal entry, native image navigation, scale
controls and output, scroll-region context, dismissal, conflict rejection, and focus return. The
Windows item remains consistent with the existing deferred Windows-access decision; this audit makes
no unsupported screen-reader claim.

## Decision requested

Accept the media contract audit and proceed to scalar-data reconciliation. This would freeze the
listed contract for v1; later changes would require explicit compatibility review. It would not
authorize package publication.
