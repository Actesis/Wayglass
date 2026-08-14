# Cedar House reference application

**Status:** Phase 4B accepted on August 12, 2026. Automated, production visual, responsive,
performance-bound, and supported-browser validation are complete. Representative manual
assistive-technology gates remain carried with explicit public-release impact in the
[Phase 4B validation record](../accessibility/phase-4b-cedar-house-validation.md).

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

## Asset media and maintenance

The HVAC asset route composes the accepted native-media and focused-viewer contracts with
Cedar-owned maintenance content:

- a synthetic, unbranded 1600 by 1200 identifying photograph shows the full air-handler cabinet and
  its lower return-filter slot without using embedded labels as interface content;
- native alternative text, visible location and access facts, written replacement steps, equipment
  condition, and maintenance actions remain outside the image;
- loading and unavailable media preserve the same asset identity, written instructions, and record
  action without implying an equipment failure;
- an explicit inspection button opens one authored image in `wg-media-viewer`, with fit, bounded
  actual-size inspection, native scrolling, Escape/close behavior, and focus return;
- recent work uses a native ordered history inside an informational panel so evidence is not
  mislabeled as operational condition; and
- recording a replacement clears the due item and appends resident evidence only after confirmation.
  The durable result explicitly says that no sensor verified the physical work.

The application owns the same-origin image source, alternative text, dimensions, lifecycle,
maintenance records, confirmation policy, and evidence meaning. Wayglass components neither fetch
the image nor infer asset or maintenance truth. The source fixture was generated for this synthetic
reference application without a person, logo, serial number, or third-party brand.

## Local use

Run `pnpm example:smart-home`, then open the local Vite URL. Human-readable paths include `/`,
`/functions/access`, and `/assets/hvac-air-handler`. Query parameters may select `scenario`,
`theme`, `density`, and `dir` without replacing route identity.

## Phase 4 disposition

The [Phase 4 roadmap disposition](../phase-4-roadmap-disposition.md) accepts Cedar House as the
household-domain proof. Its records, routes, adapters, controls, media, maintenance workflow, and
brand layer remain application-owned; no device, room, or service abstraction is promoted.
