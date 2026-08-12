# Operational Activity framework examples

Wayglass includes equivalent runnable Vanilla Custom Elements and React integrations for the Phase 3
Operational Activity workspace. They consume the production workspace packages and the same
example-owned state model while keeping their rendering implementations independent.

## Run the examples

From the repository root, start either application:

```bash
pnpm example:vanilla
pnpm example:react
```

Both routes accept the same query parameters:

| Parameter     | Accepted values                                                                                                                                 | Default         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `composition` | `overview`, `focused`                                                                                                                           | `overview`      |
| `selected`    | `intake`, `processing`, `delivery`                                                                                                              | `intake`        |
| `scenario`    | `steady`, `initial-loading`, `retained-refresh`, `stale-partial`, `unavailable`, `filtered-empty`, `failed-request`, `recovered`, `live-update` | `steady`        |
| `width`       | `phone`, `desktop`, `wall`                                                                                                                      | `desktop`       |
| `theme`       | `wayglass-dark`, `wayglass-light`                                                                                                               | `wayglass-dark` |
| `density`     | `compact`, `comfortable`                                                                                                                        | `compact`       |

For example, append `?composition=focused&selected=processing&scenario=failed-request&width=phone`
to either local URL. Unknown values fall back to the defaults instead of creating an unsupported
state.

## Shared behavior, separate renderers

`examples/shared/operational-activity-model.ts` owns the deterministic records, stable identifiers,
derived selectors, scenarios, and pure transitions. `examples/shared/operational-activity.css` owns
the reference composition's visual contract. Neither file depends on a rendering framework.

The Vanilla route in `examples/vanilla`:

- explicitly registers every Custom Element it uses;
- renders platform HTML through the framework-neutral keyed renderer;
- handles native events and typed Wayglass Custom Events; and
- preserves element identity while application state changes.

The React route in `examples/react`:

- composes the production elements through typed `@wayglass/react` wrappers;
- owns state with React's reducer integration;
- handles native and typed wrapper event props; and
- uses stable React keys without importing the Vanilla renderer.

## Parity contract

Both examples provide the same semantic content, scenarios, transitions, overview and focused
compositions, and phone, desktop, and wall-display constraints. They preserve domain value,
condition, knowledge, and activity as independent axes. Filters, commands, live-update requests,
selection, and announcements remain application-owned.

Storybook's `Examples/Operational Activity` stories use the same model, scenario vocabulary, visual
contract, and Vanilla renderer. This makes Storybook a production-backed inspection surface rather
than a second example implementation. The framework browser suite verifies semantic parity, retained
node identity, responsive containment, interactions, and automated accessibility in Chromium,
Firefox, and WebKit.
