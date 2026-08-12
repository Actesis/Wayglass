# ADR 0030: Keep Phase 4 reference applications isolated and application-owned

- Status: proposed
- Date: 2026-08-12

## Context

Phase 4 must build three credible reference applications for Cedar House, Northline Cold Storage,
and Harbor Lab. Each needs routes, domain records, asynchronous request lifecycles, deterministic
failure scenarios, responsive compositions, and meaningful brand adaptation. The applications must
exercise production Wayglass components and typed React wrappers without turning Wayglass into an
application framework.

The accepted
[Phase 4 reference-application contract](../../reference-apps/phase-4-reference-applications.md)
defines different users, workflows, state, actions, and failure envelopes. ADR 0024 keeps data,
identity, transport, reconciliation, filtering, and announcement policy consumer-owned. ADR 0029
keeps Operational Activity example-owned and warns against promoting a fixture store, renderer, or
record schema into package API.

Without a stronger Phase 4 boundary, apparent similarity could produce a shared domain model,
generic adapter, reference-app framework, copied component implementation, or one application shell
that disguises three themed demos. Conversely, implementing the same application in several
frameworks would spend Phase 4 effort reproving binding parity instead of testing real domain
pressure.

## Decision

### Build three independent private React applications

Phase 4 will add these private workspace applications:

```text
examples/
├── smart-home/
├── operations-console/
└── agent-supervision/
```

Each application has its own package manifest, TypeScript configuration, Vite entry point, source
tree, styles, tests, and build output. Package names use the private
`@wayglass/example-<application>` pattern. They are not published packages, templates, or framework
starters.

React is selected because Phase 4 needs one production application renderer and `@wayglass/react` is
the accepted first-class binding already present in the workspace. The wrappers keep behavior in the
production Custom Elements while providing typed properties, events, refs, and stable React keys.
Framework-neutral use was proven independently in Phases 1 and 3; Phase 4 does not duplicate every
application in Vanilla or another framework.

Applications import only the wrapper entry points they render where practical. Wrapper-managed,
guarded client registration remains the accepted React contract. Direct `@wayglass/elements` imports
remain side-effect free and use explicit `defineWg*` registration when an application needs a direct
element rather than its React wrapper.

### Give each application one independent truth and transition owner

Each application defines its own domain types, stable identifiers, initial-state factory, reducer or
equivalent pure transition owner, derived selectors, scenario presets, and request lifecycle. These
modules stay inside that application and are not exported from a production package.

All scalar, Boolean, status, temporal, tabular, media, and control projections derive from that
application state. Components report user intent; the application transitions state and renders the
new projections. Applications never infer domain truth by inspecting rendered components or by
listening for programmatic presentation updates.

Confirmed values, requested values, activity, permission, and outcomes remain separately modeled.
Stable application keys preserve DOM and interaction identity. Removing focused authored content
requires an application-defined continuation target.

React Context may distribute an application-owned state and dispatch function within one app when
prop threading obscures ownership. It does not become a shared store abstraction. No additional
state-management dependency is introduced.

### Put external behavior behind app-local ports

Each application may define narrow app-local ports for the external effects its accepted workflow
needs, such as a household control request, dispatch-hold request, or merge-approval request. Port
names, inputs, outputs, error meanings, authorization, and cancellation guarantees remain domain-
specific. There is no shared `DataSource`, `CommandService`, `Repository`, or request envelope.

The initial implementation supplies a local deterministic adapter for each port. Adapters use
synthetic data, an injected clock, and injected scheduling or explicitly controlled promises. They
perform no network access, persistence, authentication, or secret handling. Automated fixtures do
not depend on random values, wall-clock time, or races. An interactive local demo may use fixed
scripted latency through the same injected scheduler, while tests resolve each transition directly.

Scenario presets select initial and adapter behavior for steady, loading, retained refresh, stale,
partial, unavailable, permission-denied, failed request, recovery, and meaningful update states.
Domain-specific scenarios extend rather than reinterpret the shared vocabulary.

### Keep routing native, small, and application-owned

Each application owns a typed route descriptor and a minimal browser-history adapter built on URL,
History, and `popstate`. No routing dependency or shared router package is added initially.

Routes represent meaningful application places such as overview, focused function, asset, load, or
task detail. Navigation uses native links when a destination has a URL and buttons only for actions.
The current application and place remain visible in page title, heading, and navigation context.

One semantic composition mounts per route. Phone, desktop, and wall presentation recompose that
route through CSS and accepted layout patterns; they do not mount parallel interactive trees. Query
parameters may select deterministic scenario, theme, density, direction, and validation viewport,
but do not replace the human-readable route identity.

The first local Vite delivery uses client rendering under ADR 0004. A future static or public host
must configure path fallback or revise routing in a separate deployment decision. Phase 4 does not
claim server rendering or hydration.

### Make the runnable application the canonical integration surface

Each application route is the canonical production visual and interaction fixture. Unit tests cover
state and transitions; Playwright exercises the built application routes. The docs site explains the
contract and links to local run instructions once implementation exists.

Phase 4 does not reproduce whole application routes in Storybook. Storybook remains the canonical
catalog for production component families and bounded component states. A newly proposed public
component receives its own production story only after separate contract approval.

### Allow app-owned brand layers without semantic drift

Each application may provide one local brand stylesheet loaded after official tokens and themes. It
may adapt documented typography, shape, density, structural surface, action, informational, and
selected roles. It may use app-local layout selectors and private mechanical constants when they are
documented and do not pretend to be reusable tokens.

The brand layer must not:

- rename or invert semantic roles;
- make asserted/not-asserted mean healthy/failing;
- use condition color merely to identify functions;
- remove text or non-color state distinctions;
- weaken focus, text, or non-text contrast;
- reach into unexposed Shadow DOM structure; or
- depend on one official theme remaining active.

Condition, knowledge, activity, value, and control-request meanings remain identical across all
three applications. Cross-domain visual review tests meaningful family resemblance and meaningful
brand difference in both Wayglass Dark and Wayglass Light.

### Share only proven infrastructure

No Phase 4 shared runtime package or `examples/shared` domain layer is created at scaffolding time.
The three applications may repeat small route, state, or fixture mechanics initially so their real
differences remain visible.

Code may be shared later only when all of the following are true:

1. at least two implemented applications require behavior with identical semantics and ownership;
2. the extraction reduces meaningful maintenance cost rather than line count alone;
3. the shared API does not mention a domain record, route, command, or workflow;
4. accessibility, focus, failure, and responsive behavior remain explicit at the call site;
5. production-package placement is rejected unless the behavior is useful to independent Wayglass
   consumers; and
6. the extraction is reviewed in its own pull request with tests and documentation.

Test-only helpers may enter `@wayglass/testing` only when they test public Wayglass behavior rather
than a Phase 4 application policy. Otherwise they remain local to the relevant browser suite.

### Keep dependencies and deployment unchanged

The initial applications use existing workspace versions of React, React DOM, Vite, TypeScript,
Vitest, Playwright, and Wayglass packages. No router, state store, data client, schema library, or
mock-service dependency is added.

All applications remain private, synthetic, client-rendered, and locally built. This decision does
not authorize npm publication, a public demo, deployment provider, live integration, credentials,
analytics, or collection of personal data.

## Consequences

- Each domain can exert honest design pressure without forcing its records and workflows into a
  lowest-common-denominator framework.
- The React bindings receive realistic application use while production behavior remains in Custom
  Elements.
- Independent packages make accidental cross-app imports and production-package leakage visible in
  review and tests.
- Native routing avoids a dependency but requires a small amount of repeated app code and eventual
  host fallback configuration.
- Deterministic adapters prove pending, failure, and recovery without pretending to be live systems.
- Small initial duplication is accepted as evidence gathering; extraction follows demonstrated
  sameness.
- Full application routes become more credible integration fixtures than Storybook copies, though
  Storybook remains essential for isolated production components.
- App branding can vary substantially while semantic review remains enforceable.
- Full SSR, real integration, deployment, and cross-app infrastructure remain later decisions.

## Alternatives considered

### One application shell with three domain modes

Rejected. Shared routing, state, layout, and workflow would make the applications look more alike
than their domains warrant and hide whether Wayglass supports independent product architectures.

### A shared Phase 4 application framework

Rejected. No implemented application evidence establishes a common store, adapter, router, record,
or shell contract. It would contradict the application-owned boundaries accepted in ADR 0024.

### Build every app in both Vanilla and React

Rejected. Framework parity is already covered by production component tests and Operational
Activity. Phase 4 needs depth in three domains rather than six shallow renderers.

### Use Storybook as the only reference-app surface

Rejected. Story parameters are useful deterministic fixtures but do not provide credible routing,
navigation history, application isolation, or end-to-end task continuity.

### Add a router, state store, or mock-service library now

Rejected. Platform history, React state, pure transitions, and injected local adapters cover the
accepted scope. A dependency requires a concrete gap from implementation evidence.

### Share domain-neutral-looking records and command envelopes immediately

Rejected. Similar fields such as `id`, `status`, or `requestedAt` do not establish identical
semantics. Premature sharing would recreate the universal operational record rejected by ADR 0024.

### Connect to live smart-home, logistics, or repository services

Rejected for the initial reference applications. Credentials, authorization, network failure,
privacy, persistence, and real-world safety require separate integration and deployment decisions.
