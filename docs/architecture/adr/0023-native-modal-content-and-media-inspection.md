# ADR 0023: Share native modal lifecycle without creating a universal overlay

- Status: proposed
- Date: 2026-08-02

## Context

Phase 2C kept media sources and semantics in consumer-authored native elements and deferred an
official viewer until dialog, overlay, and focus-management contracts existed. Phase 2E-D then
validated one shadow-owned native modal dialog, document-local conflict detection, explicit initial
focus, Escape handling, close reasons, and invoker focus return for confirmation.

Applications should not have to recreate those accessibility and lifecycle mechanics for ordinary
modal content or full-size image inspection. The confirmation component cannot simply become a base
class or accept arbitrary slots: its owned binary controls, safe initial focus, event ordering, and
proportional-friction semantics are deliberately narrower than a general dialog.

At the same time, menus, tooltips, drawers, teaching overlays, anchored popovers, dialogs, and media
viewers differ in modality, focus entry, containment, positioning, dismissal, and state ownership. A
public universal overlay abstraction would either expose an unstable collection of switches or erase
important semantic differences.

## Decision

### Share private modal infrastructure

Extract framework-neutral internal utilities for native modal ownership, document-local
one-at-a-time coordination, deep active-element capture, usable focus-target checks, focus return,
close lifecycle, and development diagnostics.

`wg-confirmation-dialog`, `wg-dialog`, and `wg-media-viewer` use that infrastructure through
composition. They do not inherit one another, render one another, or expose the coordinator as a
public overlay manager. Each renders exactly one shadow-owned native `<dialog>` and uses only
`showModal()`.

The coordinator rejects a request while any Wayglass modal or foreign native `dialog:modal` is
active. It does not queue, stack, replace, or store application content. Applications explicitly
sequence dependent modal work.

### Add a narrow content dialog

Implement `wg-dialog` for application-authored modal content and bounded interactions. The component
owns the native dialog, visible close control, accessible heading association, responsive
containment, initial focus policy, dismissal reasons, and focus return. The application owns body
semantics, controls, form behavior, workflow state, and durable results.

Default initial focus is a programmatically focusable static heading so rich content can be read in
order. Applications may explicitly choose the close control, first usable interactive descendant, or
a concrete descendant passed to `show()`. Backdrop interaction does not dismiss. Escape and a
visible close control remain available.

The component is modal-only. It does not add drawers, nonmodal windows, dirty-state interception,
portals, dragging, resizing, route behavior, or arbitrary anchored positioning.

### Add a dedicated single-media viewer

Implement `wg-media-viewer` directly on the shared private modal infrastructure. The viewer accepts
one consumer-authored native `<img>` or `<picture>` and retains the native media ownership from
ADR 0013. It does not move or clone an image from `wg-media`; consumers author the inspection source
and may choose a separately authorized resolution.

The viewer owns fit, actual-size, bounded zoom controls, percentage feedback, and a native scroll
viewport for pan. Fit never enlarges past intrinsic resolution. Actual size is one intrinsic pixel
per CSS pixel. Intermediate zoom stays between those finite bounds. The component does not capture
wheel, pinch, or browser zoom shortcuts for custom scaling.

The application continues to own URLs, responsive sources, alternative text, captions,
authorization, loading truth, failure policy, downloads, metadata, and galleries. Phase 2F excludes
carousel navigation, comparison, annotation, editing, video, camera, and fullscreen workflows.

### Keep fallback client-only

Interactive modal behavior begins after Custom Element upgrade. Server-rendered applications omit
the surfaces until hydration or keep their slotted content hidden and inert. A future SSR-compatible
delivery contract may improve this without changing native modal ownership after upgrade.

## Consequences

Ordinary content dialogs and media inspection receive the same verified modal exclusivity and focus
return as confirmation without weakening confirmation's binary-decision guarantees. Refactoring the
existing confirmation implementation becomes an internal compatibility task: its public API, events,
semantics, and validation must remain unchanged.

Application-authored content makes `wg-dialog` more flexible but also limits what Wayglass can
guarantee inside it. Applications must validate their own reading order, fields, errors, action
relationships, and workflow transitions. The always-available close path prevents the component from
representing workflows that legitimately require stronger application-owned policy.

Authoring a separate native image inside the viewer may repeat a request or decoded resource, but
browser caching and deliberate responsive sources can mitigate that cost. The alternative—moving,
cloning, or copying the in-page source API—would disturb context or recreate native ownership
incorrectly.

Native scrolling favors established keyboard, touch, pointer, and assistive-technology behavior over
a canvas-like gesture surface. The viewer may feel less like an image editor, which matches its
inspection-only scope.

No general overlay primitive is created. Future overlay families must establish their own evidence
and may reuse lower-level private utilities only where their semantics genuinely match.

## Alternatives considered

- **Expand `wg-confirmation-dialog` with arbitrary content and actions:** rejected because it would
  invalidate binary choice, safe focus, cancellation, and confirmed-intent guarantees.
- **Build the viewer by nesting or subclassing `wg-dialog`:** rejected because dedicated media
  scale, pan, loading, and control semantics should not leak into a general content surface. Shared
  private lifecycle composition provides reuse without public coupling.
- **Publish a universal overlay manager:** rejected because modality, positioning, dismissal, focus,
  and ownership differ materially across overlay families.
- **Move the existing `wg-media` image into the dialog:** rejected because it changes the in-page
  accessibility tree, geometry, and task context while the viewer is open.
- **Copy image attributes into viewer properties:** rejected because it recreates an incomplete and
  security-sensitive native image API.
- **Use transforms and custom drag/pinch gestures for pan:** rejected because a native scroll region
  provides established multimodal operation and does not compete with browser zoom gestures.
- **Let backdrop clicks dismiss by default:** rejected because accidental pointer dismissal should
  not differ from keyboard and touch expectations or discard bounded task context silently.
- **Support modal stacking:** rejected because nested inertness, focus restoration, Escape order,
  and stale decisions become ambiguous.
