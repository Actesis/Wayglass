# Wayglass

Wayglass is a design language for operational awareness. It helps people understand what a system is
doing, what changed, what needs attention, and what they can do next.

The project is in Phase 0: repository and architecture foundations. Wayglass is a working name, all
packages are private, and no software license has been selected yet.

## Governing documents

Decisions are governed in this order:

1. [`VISION.md`](./VISION.md)
2. [`DESIGN_PRINCIPLES.md`](./DESIGN_PRINCIPLES.md)
3. [`SPEC.md`](./SPEC.md)

Accessibility, legal, safety, and security requirements override that order where necessary.

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
