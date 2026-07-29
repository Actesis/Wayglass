# Framework examples

Wayglass includes two runnable integrations that demonstrate the Operations Overview and the generic
tabs selection foundation. Both consume production workspace packages, preserve the same semantic
and responsive contracts, and keep application state outside the components.

## Vanilla Custom Elements

Run:

```bash
pnpm example:vanilla
```

The source in `examples/vanilla`:

- imports the generated token and theme styles;
- imports and calls each element's individual registration function;
- composes the screen with platform HTML;
- listens for the native button click;
- listens for the typed `wg-tab-change` Custom Event;
- updates the button and panel through their public properties;
- reflects tab selection through application-owned state;
- retains the confirmed `Connected` value while exposing a pending retry request.

This is the reference for framework-neutral consumption. It does not depend on React, Storybook, or
a second component implementation.

## React

Run:

```bash
pnpm example:react
```

The source in `examples/react`:

- composes the same production Custom Elements through `@wayglass/react`;
- uses typed Boolean and closed-vocabulary props;
- uses standard `slot` props for Web Component composition;
- keeps retry state in React with `useState`;
- keeps selected tab state in React with `useState`;
- receives `wg-tab-change` through the typed `onWgTabChange` prop;
- receives native button clicks through React event props.

The wrappers register their elements on the client. Server-rendered applications may emit the
markup, but the current implementation uses client-only upgrade as the supported fallback.

## Shared contract

Both examples:

- contain accessible Access, Communications, and Processing regions;
- distinguish information, monitoring, and control sections;
- recompose into one ordered column below the phone breakpoint;
- follow the operating-system theme through `wg-theme-provider`;
- preserve domain value independently from condition, knowledge, and activity;
- compose the same domain-neutral Workspace views model from `examples/shared/tabs-example.ts`;
- keep useful hidden-view summaries visible in the tab selectors;
- reflect pointer and keyboard selection without duplicating the production interaction model;
- pass automated accessibility checks in Chromium, Firefox, and WebKit.

The examples share their model and reference styles with Storybook. Storybook's `Components/Tabs`
stories cover dark and light themes, automatic and manual activation, horizontal and vertical
orientation, narrow layout, and a disabled selector. Application code remains separate so each
example demonstrates its real consumer API rather than importing a Storybook-only renderer.
