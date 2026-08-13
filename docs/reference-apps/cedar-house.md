# Cedar House reference application

**Status:** Phase 4B foundations proposed on August 12, 2026. Household composition and browser
validation remain subsequent Phase 4B slices.

Cedar House is the private smart-home application defined by the accepted
[Phase 4 reference-application contract](./phase-4-reference-applications.md). It tests household
awareness, identifying media, routine control, and consequential action without introducing public
device, room, capability, or service APIs.

## Foundation boundary

The initial application foundation provides:

- a private `@wayglass/example-smart-home` React/Vite workspace;
- typed overview, function, and HVAC asset routes using URL, History, and `popstate`;
- one app-owned household state and pure transition owner;
- deterministic shared and Cedar-specific scenario presets;
- narrow porch-light and secure-house ports with an injected clock and scheduler; and
- unit tests for routing, retained truth, requested-versus-confirmed value, partial completion, and
  deterministic effects.

The scaffold deliberately does not establish the final visual composition, connect to a service,
publish a package, add a dependency, or promote a domain abstraction.

## Local use

Run `pnpm example:smart-home`, then open the local Vite URL. Human-readable paths include `/`,
`/functions/access`, and `/assets/hvac-air-handler`. Query parameters may select `scenario`,
`theme`, `density`, and `dir` without replacing route identity.

## Next slices

1. Build the whole-home overview and focused function composition from the app-owned state.
2. Implement routine porch-light control and the secure-house confirmation/result workflow.
3. Implement HVAC asset detail, identifying image, maintenance history, and media inspection.
4. Complete the accepted browser, responsive, visual, performance, and assistive-technology record.
