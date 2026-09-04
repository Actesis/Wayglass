# Wayglass

Wayglass is a design language for operational awareness. It helps people understand what a system is
doing, what changed, what needs attention, and what they can do next.

The Phase 0 foundations, Phase 1 domain-neutral vertical slice, Phase 2 core system, Phase 3
operational components, Phase 4 reference domains, and Phase 5 ecosystem roadmap are complete.
Framework-neutral Custom Elements, typed React wrappers, and production-backed Storybook fixtures
cover generic layout, selection, controls, forms, feedback, modal media inspection, scalar and
telemetry data, status and temporal collections, filter and command compositions, and native
operational tables. The integrated Operational Activity workspace has equivalent Vanilla and React
routes, while Cedar House, Northline Cold Storage, and Harbor Lab provide isolated domain proofs.
Accessibility, responsive behavior, visual states, performance bounds, and supported-browser
behavior are recorded in phase-specific validation matrices. Wayglass is licensed under Apache-2.0.
The `@wayglass` npm organization and planned documentation origin at
[`wayglass.hoagsoftworks.com`](https://wayglass.hoagsoftworks.com) are confirmed; all packages
remain private until a separate release proposal is approved.

## Governing documents

Decisions are governed in this order:

1. [`VISION.md`](./VISION.md)
2. [`DESIGN_PRINCIPLES.md`](./DESIGN_PRINCIPLES.md)
3. [`SPEC.md`](./SPEC.md)

Accessibility, legal, safety, and security requirements override that order where necessary.

Supporting foundations:

- [`docs/phase-6.md`](./docs/phase-6.md) proposes the real-world application, v1 scope, initial npm
  release, documentation delivery, and feedback sequence without authorizing implementation.
- [`docs/phase-5.md`](./docs/phase-5.md) defines the completed gated ecosystem roadmap for release
  governance, application guidance, token interchange, charts, icon and design tooling, Home
  Assistant, and demand-driven framework wrappers.
- [`docs/phase-5-roadmap-disposition.md`](./docs/phase-5-roadmap-disposition.md) closes Phase 5 with
  private packages, undeployed documentation, and explicit real-world, release, deployment, and
  support gates.
- [`docs/phase-4.md`](./docs/phase-4.md) maps the completed smart-home, operations-console, and
  AI-agent-supervision reference applications to their common acceptance criteria.
- [`docs/phase-4-roadmap-disposition.md`](./docs/phase-4-roadmap-disposition.md) closes Phase 4 and
  records successful compositions, rejected abstractions, evidence candidates, and deferred release
  work.
- [`docs/phase-3.md`](./docs/phase-3.md) maps the completed operational-component system to its
  contracts, production packages, examples, and validation evidence.
- [`docs/phase-3-roadmap-disposition.md`](./docs/phase-3-roadmap-disposition.md) closes Phase 3 and
  classifies its application-owned and evidence-driven follow-up candidates.
- [`docs/phase-2.md`](./docs/phase-2.md) maps the delivered Phase 2 core system to contracts,
  production packages, examples, and validation evidence.
- [`docs/phase-2-roadmap-disposition.md`](./docs/phase-2-roadmap-disposition.md) records the Phase 2
  deferrals and preserves the existing Phase 3 boundary.
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
- [`docs/components/tabs.md`](./docs/components/tabs.md) defines the accepted Phase 2A tabs contract
  and links its
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
- [`docs/controls/control-state.md`](./docs/controls/control-state.md) defines the accepted Phase
  2D-A control-state contract, together with the
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
- [`docs/forms/form-foundation.md`](./docs/forms/form-foundation.md) defines the accepted and
  implemented Phase 2D-D native form-foundation contracts, building on
  [`native form-control ownership`](./docs/architecture/adr/0015-native-form-control-ownership.md)
  and
  [`explicit form relationships and validation decision`](./docs/architecture/adr/0018-explicit-form-relationships-and-validation.md).
  Automated and visual evidence is recorded in the
  [`form-foundation validation`](./docs/accessibility/phase-2d-form-foundation-validation.md).
- [`docs/forms/form-controls.md`](./docs/forms/form-controls.md) defines the accepted and
  implemented Phase 2D-E text, number, select, checkbox, radio, and slider contracts together with
  the
  [`styled-native presentation decision`](./docs/architecture/adr/0019-styled-native-form-controls.md).
  Automated and visual evidence is recorded in the
  [`form-controls validation`](./docs/accessibility/phase-2d-form-controls-validation.md).
- [`docs/feedback/feedback-state.md`](./docs/feedback/feedback-state.md) defines the accepted Phase
  2E feedback-state boundaries and
  [`delivery and lifetime decision`](./docs/architecture/adr/0020-feedback-delivery-and-lifetime.md).
- [`docs/feedback/persistent-feedback-and-loading.md`](./docs/feedback/persistent-feedback-and-loading.md)
  defines the accepted Phase 2E-B badge, alert, native progress, skeleton, empty-state,
  offline-state, and stale-data-marker contracts. Automated and visual evidence is recorded in the
  [`persistent-feedback validation`](./docs/accessibility/phase-2e-persistent-feedback-validation.md).
- [`docs/feedback/transient-feedback.md`](./docs/feedback/transient-feedback.md) defines the
  accepted and implemented Phase 2E-C toast and toast-region queue, announcement, lifetime, pause,
  dismissal, and focus contracts, with evidence in the
  [`transient-feedback validation`](./docs/accessibility/phase-2e-transient-feedback-validation.md).
- [`docs/feedback/confirmation-dialog.md`](./docs/feedback/confirmation-dialog.md) defines the
  accepted and implemented Phase 2E-D native confirmation and proportional-friction contract, with
  evidence in the
  [`confirmation-dialog validation`](./docs/accessibility/phase-2e-confirmation-dialog-validation.md).
- [`docs/feedback/content-dialog.md`](./docs/feedback/content-dialog.md) and
  [`docs/media/media-viewer.md`](./docs/media/media-viewer.md) define the accepted Phase 2F modal
  content and single-media inspection contracts, with shared lifecycle architecture recorded in
  [`ADR 0023`](./docs/architecture/adr/0023-native-modal-content-and-media-inspection.md).

## Local development

Requirements:

- Node.js 22.13 or newer
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

## Maintenance

- [`SUPPORT.md`](./SUPPORT.md) defines the boundary between released support and repository
  evidence.
- [`SECURITY.md`](./SECURITY.md) defines private vulnerability reporting requirements.
- [`CHANGELOG.md`](./CHANGELOG.md), [`MIGRATION.md`](./MIGRATION.md), and
  [`DEPRECATIONS.md`](./DEPRECATIONS.md) provide the shared release-history baseline.

## License

Wayglass is licensed under the [Apache License, Version 2.0](./LICENSE). Attribution notices are in
[`NOTICE`](./NOTICE).
