# Cedar House reference application

**Status:** Phase 4B application foundations and household composition are accepted. Routine and
consequential control workflows are proposed on August 12, 2026. Media and final validation remain
subsequent Phase 4B slices.

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

The foundation deliberately did not connect to a service, publish a package, add a dependency, or
promote a domain abstraction. Those boundaries remain unchanged as the visual composition arrives.

## Household composition

The first production composition provides:

- a whole-home overview with separate Comfort and air, Access and safety, Lighting, Energy, and
  Maintenance function boundaries;
- one evening-readiness summary that identifies the filter as the attention item while retaining
  normal comfort and air-handler availability;
- icon-free Boolean rails and fields for locked/unlocked, closed/open, and on/off values without
  treating either value as condition;
- focused function routes with a selector band that retains concise peer-function summaries;
- app-owned query options preserved through native links and browser history; and
- dark, light, phone, desktop, stale, partial, and RTL-compatible browser fixtures.

The overview and focused routes are canonical application fixtures. They are not duplicated in
Storybook, and their function summaries remain Cedar-owned content rather than production API.

## Household controls

The application composes existing production controls into two distinct workflows:

- the porch-light button makes a routine reversible request while the Boolean display retains its
  last confirmed value until the deterministic controller responds;
- failed porch-light requests retain confirmed truth, explain that nothing changed, provide a retry
  path, and leave one durable result in the Lighting function;
- “Secure Cedar House” opens the accepted confirmation dialog with the house, exterior locks, garage
  door, known controller exceptions, and requested effect named before submission;
- cancellation restores focus to the invoker without changing access state; and
- succeeded, denied, failed, and partial results remain distinct, with partial completion retaining
  per-target truth and the unresolved garage-door path.

The reducer, scenario policy, request identifiers, clock, scheduler, and household ports remain
private to Cedar House. Components report intent and render projections; they do not own or infer
household truth. Completed results receive one deliberate live announcement and remain visibly
available in the owning control section afterward.

## Local use

Run `pnpm example:smart-home`, then open the local Vite URL. Human-readable paths include `/`,
`/functions/access`, and `/assets/hvac-air-handler`. Query parameters may select `scenario`,
`theme`, `density`, and `dir` without replacing route identity.

## Next slices

1. Implement HVAC asset detail, identifying image, maintenance history, and media inspection.
2. Complete the accepted browser, responsive, visual, performance, and assistive-technology record.
