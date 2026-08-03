# Phase 2 system

Phase 2 turns the initial domain-neutral slice into a usable core system. It preserves the original
semantic model—domain value, condition, knowledge, activity, and section purpose remain independent—
while adding the selection, layout, media, controls, forms, and feedback needed to build complete
operational interfaces.

Status: Phase 2A–F are complete. Their implementation, typed React wrappers, production-backed
examples, and automated cross-browser validation are complete. Representative assistive-technology
gates remain explicit release obligations rather than being implied by automation.

## Delivered system

| Area                | Delivered contracts and patterns                                                                                                                                   | Production evidence                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Selection           | [Tabs](./components/tabs.md) with native focus, automatic or manual activation, orientation, mutation recovery, and one selection owner                            | `Components/Tabs`; vanilla and React examples                  |
| Composition         | [Function Deck](./patterns/function-deck.md) as a focused alternative to the simultaneous Operations Overview                                                      | `Examples/Function Deck`; phone, desktop, and wall fixtures    |
| Foundations         | [Typography, icons, visually hidden content, focus rings, surfaces, and dividers](./foundations/foundation-contracts.md)                                           | `Foundations/Foundation Primitives`                            |
| Layout              | [Frame, stack, cluster, grid, split, and scroll region](./layout/layout-contracts.md), responsive to their own containers                                          | `Layout/Layout Primitives`                                     |
| Media               | [Consumer-owned image, picture, and figure presentation](./media/media-content.md), including missing and unavailable states                                       | `Media/Media Content` with production image and diagram assets |
| Controls            | [Confirmed/requested state](./controls/control-state.md), [core controls](./controls/core-controls.md), and [menus and commands](./controls/menus-and-commands.md) | `Controls/Core controls`; `Controls/Menus and commands`        |
| Forms               | [Explicit relationships and validation](./forms/form-foundation.md) around [styled native controls](./forms/form-controls.md)                                      | `Forms/Form foundation`; `Forms/Native controls`               |
| Persistent feedback | [Badges, alerts, progress, skeletons, absence, offline availability, and stale knowledge](./feedback/persistent-feedback-and-loading.md)                           | `Feedback/Persistent and loading`                              |
| Transient feedback  | [Document-level toast queue, announcement, lifetime, pause, and dismissal](./feedback/transient-feedback.md)                                                       | `Feedback/Transient`                                           |
| Confirmation        | [Native modal confirmation and proportional friction](./feedback/confirmation-dialog.md) without turning every critical-looking action into a dialog               | `Feedback/Confirmation and friction`                           |
| Modal content       | [General content dialogs](./feedback/content-dialog.md) and [single-media inspection](./media/media-viewer.md) on shared private native-modal infrastructure       | `Feedback/Modal content and media inspection`                  |

## Phase 2F modal content and inspection

The accepted [content-dialog contract](./feedback/content-dialog.md) and
[media-viewer contract](./media/media-viewer.md) share private native-modal lifecycle infrastructure
without creating a public universal overlay.
[ADR 0023](./architecture/adr/0023-native-modal-content-and-media-inspection.md) records the
accepted architecture, and the required dialog and media-viewer token groups are locked before
implementation. Framework-neutral elements, typed React wrappers, production-backed stories, and
cross-browser validation are complete.

Every production component is exported from `@wayglass/elements` through an explicit registration
function. Typed wrappers in `@wayglass/react` use those same Custom Element classes and
coordinators; they do not duplicate interaction behavior. Tokens and themes remain in
`@wayglass/tokens` and `@wayglass/themes`.

## Production-backed examples

Run Storybook locally:

```bash
pnpm storybook
```

The stories listed above import production package exports. They are the interactive and visual
fixtures used during implementation review; no documentation-only component replicas are permitted.
Together, the stories and their corresponding browser fixtures cover dark and light themes, compact
and comfortable density, phone reflow, desktop composition, wall-display scale, required edge
states, forced colors, reduced motion, and image-bearing informational content.

The two runnable consumer applications exercise real package boundaries:

```bash
pnpm example:vanilla
pnpm example:react
```

Both render the same Operations Overview and tabs-backed workspace model. The vanilla application
demonstrates individual Custom Element registration and typed Custom Events. The React application
demonstrates typed props, refs, event callbacks, authored slots, and the current client-only upgrade
fallback. See the [framework-example contract](./examples/framework-examples.md) for the shared
behavior.

## Composition safeguards

- Overview and focused compositions are both supported; neither becomes the universal layout.
- Function identity and state remain application-owned when a composition changes.
- Hidden functions retain explicit consequential summaries, and a critical response path remains
  discoverable outside a focused selector when necessary.
- Information, monitoring, control, and feedback are visually separated without treating every
  section as operational status.
- Images remain consumer-authored context. Missing media never removes state, instructions, or
  actions.
- Native controls, forms, dialogs, and platform semantics retain their ownership wherever the
  platform already provides the required behavior.
- Color, icons, motion, and physical position are redundant; visible text and structure carry the
  decision and state meaning.

## Validation and remaining gates

The [Phase 2 validation matrix](./accessibility/phase-2-validation-matrix.md) and focused
[Phase 2F validation record](./accessibility/phase-2f-modal-content-media-validation.md) consolidate
the phase-specific records covering keyboard and focus behavior, accessible relationships,
responsive reflow, touch targets, forced colors, reduced motion, dark and light themes, framework
parity, and Chromium, Firefox, and WebKit. It preserves the detailed records rather than replacing
them.

Automated accessibility trees and Axe cannot prove spoken timing, virtual-cursor context, platform
focus recovery, password-manager behavior, or mobile screen-reader interaction. The
[representative assistive-technology gate ledger](./accessibility/phase-2-assistive-technology-gates.md)
records completed evidence and carries every remaining VoiceOver/Safari, NVDA/Firefox, mobile, and
password-manager check with explicit scope and release impact.

## Deliberate boundaries

Phase 2F adds a narrow general content dialog and single-media viewer without adding a universal
overlay system, application data store, authorization policy, media-asset service, workflow engine,
or server-rendered interaction implementation. Inline confirmation, undo, richer workflow dialogs,
galleries, annotation and editing, and stronger verification remain application-owned or deferred
until real deployment evidence establishes reusable contracts. These boundaries prevent the
follow-up from widening Phase 3.
