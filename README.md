# Wayglass

Wayglass is a design language for operational awareness. It helps people understand what a system is
doing, what changed, what needs attention, and what they can do next.

The Phase 0 foundations, Phase 1 domain-neutral vertical slice, and Phase 2 selection foundations
are complete. Dark and light theme contexts, the initial structural, action, and semantic display
components, typed React wrappers, compound tabs, and the Function Deck composition are available.
Production-backed overview and focused fixtures cover desktop, phone, wall-display, and edge-state
contexts. Accessibility, responsive behavior, visual states, and supported-browser behavior are
recorded in phase-specific validation matrices. Wayglass is a working name, all packages are
private, and no software license has been selected yet.

## Governing documents

Decisions are governed in this order:

1. [`VISION.md`](./VISION.md)
2. [`DESIGN_PRINCIPLES.md`](./DESIGN_PRINCIPLES.md)
3. [`SPEC.md`](./SPEC.md)

Accessibility, legal, safety, and security requirements override that order where necessary.

Supporting foundations:

- [`docs/foundations/state-model.md`](./docs/foundations/state-model.md) separates domain value,
  condition, knowledge, activity, and section purpose.
- [`docs/foundations/visual-language.md`](./docs/foundations/visual-language.md) defines the
  accepted Phase 0 visual grammar and semantic presentation rules.
- [`docs/foundations/tokens.md`](./docs/foundations/tokens.md) defines the locked Phase 1 token
  layers and change policy.
- [`docs/components/phase-1.md`](./docs/components/phase-1.md) defines the initial public component
  contracts.
- [`docs/frameworks/react.md`](./docs/frameworks/react.md) documents the typed React wrapper
  contract and client-only fallback.
- [`docs/examples/operations-overview.md`](./docs/examples/operations-overview.md) defines the Phase
  1 reference composition.
- [`docs/accessibility/phase-1-validation.md`](./docs/accessibility/phase-1-validation.md) records
  the Phase 1 accessibility, responsive, state, framework, and browser validation evidence.
- [`docs/components/tabs.md`](./docs/components/tabs.md) proposes the Phase 2A tabs contract and
  links its
  [`accessibility architecture decision`](./docs/architecture/adr/0009-tabs-architecture.md).
- [`docs/patterns/function-deck.md`](./docs/patterns/function-deck.md) defines the Phase 2B focused
  composition, with evidence in the
  [`Function Deck validation record`](./docs/accessibility/phase-2b-function-deck-validation.md).
- [`docs/foundations/foundation-contracts.md`](./docs/foundations/foundation-contracts.md) defines
  the accepted Phase 2C foundation APIs and their
  [`delivery-model decision`](./docs/architecture/adr/0011-foundation-delivery-model.md).
  Implementation evidence is recorded in the
  [`foundation substrate validation`](./docs/accessibility/phase-2c-foundations-validation.md).
- [`docs/layout/layout-contracts.md`](./docs/layout/layout-contracts.md) defines the accepted and
  implemented Phase 2C layout APIs and their
  [`container-responsive architecture decision`](./docs/architecture/adr/0012-layout-primitives-and-container-responsiveness.md).
  Implementation evidence is recorded in the
  [`layout-primitives validation`](./docs/accessibility/phase-2c-layout-validation.md).
- [`docs/media/media-content.md`](./docs/media/media-content.md) defines the accepted and
  implemented Phase 2C media-content contract and its
  [`native-media ownership decision`](./docs/architecture/adr/0013-native-media-ownership.md).
  Implementation evidence is recorded in the
  [`media-content validation`](./docs/accessibility/phase-2c-media-validation.md).
- [`docs/controls/control-state.md`](./docs/controls/control-state.md) proposes the Phase 2D-A
  control-state contract, together with the
  [`controlled-request decision`](./docs/architecture/adr/0014-controlled-operational-requests.md)
  and
  [`native form-control ownership decision`](./docs/architecture/adr/0015-native-form-control-ownership.md).
- [`docs/controls/core-controls.md`](./docs/controls/core-controls.md) defines the accepted and
  implemented Phase 2D-B icon button, operational toggle, segmented selection, and navigation-rail
  contracts, together with the
  [`core-control semantics decision`](./docs/architecture/adr/0016-core-control-semantics.md).
  Implementation and validation evidence are recorded in the
  [`core-controls validation`](./docs/accessibility/phase-2d-core-controls-validation.md).
- [`docs/controls/menus-and-commands.md`](./docs/controls/menus-and-commands.md) defines the
  accepted and implemented Phase 2D-C command-menu contract, together with the
  [`menu and command architecture decision`](./docs/architecture/adr/0017-menu-command-architecture.md).
  Implementation and automated evidence are recorded in the
  [`menu and command validation`](./docs/accessibility/phase-2d-menu-command-validation.md).
- [`docs/forms/form-foundation.md`](./docs/forms/form-foundation.md) proposes the Phase 2D-D native
  form-foundation contracts, building on
  [`native form-control ownership`](./docs/architecture/adr/0015-native-form-control-ownership.md)
  and the proposed
  [`explicit form relationships and validation decision`](./docs/architecture/adr/0018-explicit-form-relationships-and-validation.md).

## Local development

Requirements:

- Node.js 22.12 or newer
- pnpm 11.9

```bash
pnpm install
pnpm test:browser:install
pnpm check
```

Useful commands:

```bash
pnpm docs:dev
pnpm example:react
pnpm example:vanilla
pnpm storybook
pnpm test:browser
```

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the development workflow and
[`ROADMAP.md`](./ROADMAP.md) for current scope.
