# Framework examples

Wayglass includes two runnable Operations Overview integrations. Both consume production workspace
packages, preserve the same semantic and responsive contract, and keep application state outside the
components.

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
- updates the button and panel through their public properties;
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
- receives native button clicks through React event props.

The wrappers register their elements on the client. Server-rendered applications may emit the
markup, but Phase 1 uses client-only upgrade as the supported fallback.

## Shared contract

Both examples:

- contain accessible Access, Communications, and Processing regions;
- distinguish information, monitoring, and control sections;
- recompose into one ordered column below the phone breakpoint;
- follow the operating-system theme through `wg-theme-provider`;
- preserve domain value independently from condition, knowledge, and activity;
- pass automated accessibility checks in Chromium, Firefox, and WebKit.

The examples share the reference composition stylesheet with Storybook. Their application code is
intentionally separate so each demonstrates its real consumer API rather than importing a
Storybook-only renderer.
