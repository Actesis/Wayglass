# Wayglass

Wayglass is a design language for operational awareness. It helps people understand what a system is
doing, what changed, what needs attention, and what they can do next.

The Phase 0 repository, architecture, semantic, and visual foundations are complete. Phase 1 is
underway with a domain-neutral reference composition, initial component contracts, and locked
development tokens. Wayglass is a working name, all packages are private, and no software license
has been selected yet.

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
- [`docs/examples/operations-overview.md`](./docs/examples/operations-overview.md) defines the Phase
  1 reference composition.

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
pnpm storybook
pnpm test:browser
```

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the development workflow and
[`ROADMAP.md`](./ROADMAP.md) for current scope.
