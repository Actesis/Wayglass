# Phase 6B modal-feedback contract audit

**Status:** Proposed on September 3, 2026. This record reconciles `wg-confirmation-dialog` and
`wg-dialog` against their implementations, shared native-modal controller, architecture decisions,
documentation, React bindings, stories, and browser evidence. It changes no package version,
privacy, registry, or deployment state.

## Scope

The audit covers the separate confirmation and general-content responsibilities; fields and
defaults; closed vocabularies; slots; CSS parts and custom properties; native modal ownership;
one-at-a-time coordination; invocation and initial focus; Escape, close controls, action intent, and
programmatic closure; focus return; events; explicit registration; and React adaptation.

Application workflow, authorization, validation, side effects, durable outcomes, strong
verification, nonmodal surfaces, drawers, arbitrary overlays, and domain-specific focus destinations
remain outside this family.

## Result

The two public components remain intentionally distinct while sharing the private
`NativeModalController`. Confirmation owns one narrow binary decision with component-owned cancel
and action controls; content dialog owns a visible close path around consumer-authored body and
actions. Both use a shadow-owned native `dialog`, `showModal()`, document-local exclusivity, native
Escape and focus containment, and invoker-or-fallback focus return without creating a public overlay
manager.

One CSS-part mismatch was corrected in the confirmation contract: its production anatomy includes a
`content` part in addition to the nine previously listed parts. Both contracts now state that their
elements expose no element-specific CSS custom properties in v1.

The content dialog's internal size selector had the public-looking name
`--wg-dialog-inline-maximum`. It is not a supported instance-level override: `size` selects one of
three locked semantic capacity tokens. The selector is now explicitly private as
`--_wg-dialog-inline-maximum`, with its mechanical role documented in code, so the audit does not
accidentally freeze an unintended styling API.

The confirmation document's stale Phase 2E deferral of general dialogs was reconciled with the
implemented Phase 2F `wg-dialog` contract. Validation language now separates automated browser
evidence from the still-open representative assistive-technology gates.

## Frozen contract

- Confirmation owns dialog ID, open state, localized action and cancel labels, primary or critical
  action appearance, ordinary or interruptive attention, and cancel/action/heading initial focus. It
  exposes heading, description, and redundant-icon content through three slots; ten CSS parts;
  `show`, `cancel`, `close`, and focus methods; and typed close-before-action events.
- Content dialog owns dialog ID, open state, localized close label, heading/close/first-interactive
  initial focus, and compact/standard/wide capacity. It exposes heading, body, and action content
  through three slots; seven CSS parts; `show`, `close`, and focus methods; and typed open and close
  events.
- Both components reject missing anatomy, duplicate family IDs, competing Wayglass modals, and
  light-DOM foreign native modals. They never fall back to nonmodal native `open`, stack, queue,
  portal, or install a custom focus trap.
- Confirmation action, attention, focus, and close reasons remain closed vocabularies. Content
  dialog focus, size, and close reasons remain closed vocabularies. Events report presentation or
  confirmed intent, never application success, authorization, submission, cancellation, or analytics
  evidence.
- The private controller owns only document-local modal claims, deep active-element capture, native
  opening, usable invoker and fallback focus return, and release. It remains absent from package
  exports.
- Both modules remain side-effect free. React registers the production classes, maps their typed
  events, and adds no modal, workflow, or focus behavior.

## Validation

The field-level documentation suite passes all 123 checks. ESLint, element, documentation, and React
typechecks, the production documentation build, and all 17 React tests pass. The combined
modal-feedback browser matrix passes all 102 cases across Chromium, Firefox, and WebKit, including
native modality, focus containment and return, one-at-a-time coordination, event ordering, both
themes, Axe scans, forced colors, reduced motion, 200% text, and 320 CSS-pixel reflow.

## Remaining release evidence

VoiceOver/Safari and NVDA with Firefox on Windows remain open pre-public-release evidence items for
dialog entry, name and reading order, native containment, Escape and visible dismissal, action
intent, modal-conflict rejection, and focus return. The Windows item remains consistent with the
existing deferred Windows-access decision; this audit makes no unsupported screen-reader claim.

## Decision requested

Accept the modal-feedback contract audit and proceed to media reconciliation. This would freeze the
listed contract for v1; later changes would require explicit compatibility review. It would not
authorize package publication.
