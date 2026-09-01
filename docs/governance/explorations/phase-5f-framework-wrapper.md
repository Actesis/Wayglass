# Phase 5F exploration: additional framework wrapper

## Record control

| Field              | Value                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Record ID          | `P5F-FRAMEWORK-WRAPPER-001`                                                                                                                                                                                                                                                                                                             |
| Roadmap track      | Phase 5F — Additional framework wrapper evaluation                                                                                                                                                                                                                                                                                      |
| Lifecycle state    | `dispositioned`                                                                                                                                                                                                                                                                                                                         |
| Revision           | `2`                                                                                                                                                                                                                                                                                                                                     |
| Owner              | Wayglass maintainers                                                                                                                                                                                                                                                                                                                    |
| Evidence reviewers | Project owner and a Wayglass maintainer                                                                                                                                                                                                                                                                                                 |
| Created            | 2026-09-01                                                                                                                                                                                                                                                                                                                              |
| Last reviewed      | 2026-09-01                                                                                                                                                                                                                                                                                                                              |
| Target decision    | Deferred until the accepted objective restart triggers are met                                                                                                                                                                                                                                                                          |
| Related records    | [Phase 5 roadmap](../../phase-5.md), [ecosystem-exploration contract](../ecosystem-exploration-record.md), [ADR 0003](../../architecture/adr/0003-documentation-surfaces.md), [ADR 0031](../../architecture/adr/0031-ecosystem-artifact-architecture.md), and [Phase 5 validation plan](../../accessibility/phase-5-validation-plan.md) |

### Decision question

Should Wayglass evaluate or own one additional framework binding now, and if so, which named
consumer task demonstrates that direct Custom Element use is insufficient?

### Revision history

| Revision | Date       | Change                                                                  | Evidence still valid    | Approval      |
| -------- | ---------- | ----------------------------------------------------------------------- | ----------------------- | ------------- |
| 1        | 2026-09-01 | Initial demand audit and proposal to defer before selecting a framework | None                    | Project owner |
| 2        | 2026-09-01 | Defer disposition accepted; no framework or proof selected              | All revision 1 evidence | Project owner |

## User, task, and consequence

- **Credible user or maintainer:** no qualifying additional-framework consumer is currently named.
  The repository contains React applications and a private VitePress documentation application, but
  no authored Vue, Svelte, Angular, Solid, Preact, or other non-React application.
- **Complete task:** when a consumer exists, integrate the production Wayglass Custom Elements with
  that framework while preserving typed properties, events, element references, methods, native form
  and focus behavior, slots or children, explicit registration, fallback content, and the consumer's
  actual rendering mode.
- **Observed evidence:** package manifests name React as the only application framework. The docs
  app has VitePress as a development dependency but contains no authored `.vue` file, Vue import,
  `@wayglass/elements` runtime import, or production component fixture. ADR 0003 makes Vue a docs
  implementation detail and requires interactive fixtures to remain in Storybook.
- **Current path:** React consumers use `@wayglass/react`. Any future framework can consume the
  standards-based Custom Elements directly, explicitly register only the elements it uses, and add
  application-local framework typing or event glue if a real gap appears.
- **Gap and consequence:** no observed complete task currently fails. Selecting a framework by
  popularity would invent a consumer, compatibility range, dependency, package, and maintainer
  obligation without evidence that a wrapper improves on direct use.
- **Current truth and policy owners:** `@wayglass/elements` owns framework-neutral behavior and
  Custom Element contracts. The consuming framework owns rendering and lifecycle behavior. The
  application owns composition, state, routes, forms, authorization, and server-rendering policy. A
  future binding may own only typed adaptation at that seam.
- **Domain context:** framework component, directive, action, ref, event modifier, JSX transform,
  compiler, hydration, and server-rendering vocabulary remain framework-specific and must not enter
  foundation packages.

## Boundary and artifact hypothesis

- **Provisional tier:** framework binding under ADR 0031, if a future charter revision names a
  qualifying consumer and proof.
- **Proposed Wayglass ownership:** none in revision 1. A future candidate could adapt public
  framework-neutral contracts without duplicating behavior.
- **Application ownership:** framework selection, rendering mode, state, composition, native form
  relationships, routes, persistence, and client/server boundaries.
- **External ownership:** the selected framework owns lifecycle, event syntax, refs, rendering,
  hydration, compiler behavior, and version compatibility.
- **Consumers and support environment:** none named beyond the existing React baseline. VitePress
  1.6.4 is a private documentation tool, not evidence of a Vue application consumer.
- **Potential public surface:** none in revision 1. A future accepted candidate would use a separate
  `@wayglass/<framework>` package and independent compatibility range.
- **Dependency direction and isolation:** no dependency is added. A future binding may depend on
  public `@wayglass/elements` surfaces and declare its framework peer; foundation packages must not
  import it.
- **Registration and global behavior:** imports must remain safe without a browser. Element
  registration stays explicit, guarded, and duplicate-safe; a wrapper must not connect, install
  globals, or reproduce component behavior on import.
- **Version and compatibility unit:** a future framework binding versions independently from the
  synchronized foundation family and declares both Wayglass and framework peer ranges.
- **Non-goals:** choosing a framework by popularity, producing wrappers for several frameworks,
  changing foundation behavior, creating a universal wrapper generator, reproducing Storybook in
  VitePress, claiming unsupported SSR or hydration, publishing a package, or changing React.
- **Removal path:** revision 1 creates no prototype, dependency, package, export, generated file, or
  runtime code. A future private proof must define its own exact cleanup.

## Gap analysis and comparison baseline

### Existing options

| Approach                                   | Capability and task fit                                                                                   | Accessibility                                                        | Security and privacy                                     | Performance and dependency cost                                  | Maintenance and compatibility                                                      | Why it may be sufficient                                                                   |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Do nothing                                 | No current additional-framework task is left incomplete                                                   | Existing framework-neutral and React evidence remains unchanged      | Adds no new trust surface                                | Zero install, bundle, or type cost                               | No unsupported framework range                                                     | Sufficient while no consumer exists                                                        |
| Publish direct-use guidance when requested | Can document registration, properties, events, refs, slots, forms, and client-only boundaries             | Uses the production element semantics                                | No wrapper runtime or supply-chain surface               | Documentation-only cost                                          | Consumer owns its exact framework/compiler range                                   | Likely sufficient if the framework already handles Custom Elements well                    |
| Direct Custom Element use                  | Standards markup and DOM APIs can complete many framework tasks                                           | Preserves the same production element, focus, and form behavior      | No extra package                                         | Small application-local adaptation where needed                  | Framework and application own integration details                                  | Required comparison baseline for any future proof                                          |
| Handwritten framework binding              | Could type framework-specific properties, events, refs, children, methods, and lifecycle where gaps exist | Must remain behaviorally equivalent to direct use and React baseline | Adds framework peer and compatibility/update ownership   | Separate package, types, tests, bundle audit, and support matrix | Wayglass would own minimum/current framework, TypeScript, browser, and SSR support | Justified only by a named repeated task and measured direct-use gap                        |
| Generated wrappers                         | Could reduce repetitive surface mapping for a large accepted element catalog                              | Generation does not prove semantic or interaction parity             | Adds generator integrity and supply-chain considerations | Generator, generated output, drift checks, and consumer cost     | Compiler/version drift and generated review become permanent obligations           | Consider only if a named consumer proves handwritten/direct adaptation is disproportionate |

### Gap statement

No Wayglass-owned framework gap is currently established. VitePress's transitive Vue runtime does
not create one: the docs application authors no Vue component consumer and is intentionally not a
second interactive component catalog. Until a named application demonstrates a concrete failure or
disproportionate repeated cost in direct Custom Element use, platform composition is sufficient.

## Dependency proposal

Revision 1 proposes no dependency and authorizes none.

| Field                                             | Finding                                                                                                   |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Package and version policy                        | None                                                                                                      |
| Placement                                         | Not applicable                                                                                            |
| Missing existing capability                       | None demonstrated                                                                                         |
| License and notices                               | No dependency or new notice                                                                               |
| Health, security, and update owner                | No external surface accepted; a future proposal must name both framework and Wayglass compatibility owner |
| Installed, packed, bundled, and type cost         | Zero in revision 1                                                                                        |
| Runtime and browser implications                  | None                                                                                                      |
| Network, telemetry, scripts, globals, transitives | None                                                                                                      |
| Replacement and removal                           | No artifact to replace or remove                                                                          |
| Proof-only approval                               | Not requested                                                                                             |

## Bounded proof

Revision 1 proposes no implementation proof because the prerequisite consumer and task do not exist.
If the objective restart triggers are met, revise this charter before any dependency, prototype,
package, example application, or public surface is created.

- **Single proof question:** pending a named consumer; it must compare that consumer's exact task
  through direct Custom Elements and one narrow binding candidate.
- **Minimum implementation:** not authorized. A future revision must list the exact element subset
  and framework seams under test.
- **Private location:** not authorized; a future proof belongs outside `packages/` until
  disposition.
- **Inputs and deterministic fixtures:** pending the consumer's real composition and representative
  state/event/form cases.
- **Comparison and measurements:** direct framework use and the existing React implementation are
  mandatory baselines.
- **Test envelope:** pending exact framework, TypeScript, rendering mode, browser, and consumer
  versions.
- **External effects:** none authorized; no network, analytics, credentials, publication, or
  external mutation.
- **Retained evidence:** this record and repository demand audit.
- **Cleanup targets:** none in revision 1.
- **Bound:** no proof work before charter revision and acceptance.
- **Quality gates:** documentation build and repository checks for this proposal only.

## Criteria fixed before work

These criteria constrain a future revised proof; they do not authorize it.

### Success

1. A named real consumer completes one exact task that direct Custom Element use cannot complete
   safely or proportionately with a small documented application-local adaptation.
2. The candidate preserves production properties, attributes, Boolean and complex values, native and
   typed events, element refs, methods, slots or children, forms, focus, themes, registration, and
   useful fallback content without owning new behavior.
3. Minimum and current framework and TypeScript versions pass client development and production
   builds plus only the SSR, hydration, or client-only modes the candidate explicitly claims.
4. The binding is materially better than direct use for the same task after package, peer,
   duplicate-runtime, bundle, type, browser, accessibility, support, and removal cost are measured.
5. A named maintainer accepts the proposed framework compatibility and security-update range.

Meeting these criteria would start disposition review; it would not approve implementation or
publication.

### Stop early

1. Stop if direct Custom Element use or a small application-local typing declaration completes the
   task with equivalent semantics and lower permanent cost.
2. Stop if the wrapper must reproduce element behavior, infer application state, register elements
   as an unguarded import side effect, or alter foundation packages for framework convenience.
3. Stop if no named maintainer accepts the tested framework and TypeScript range.

### Reject

1. Reject a wrapper artifact if no independent application consumer exists or its task is
   hypothetical.
2. Reject if direct use meets the same task without a material accessibility, typing, lifecycle,
   form, event, ref, or rendering gap.
3. Reject if compatibility, package, bundle, generated-output, or maintenance cost is
   disproportionate to the adaptation.

### Defer

| Missing evidence or prerequisite              | Owner                              | Decision impact                                  | Objective review trigger                                                                                                                 | Earliest review                          |
| --------------------------------------------- | ---------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Named non-React application and complete task | Project owner or application owner | Blocks framework selection and proof             | A real application identifies its framework/version/rendering mode, exact Wayglass element subset, and integration task                  | When the application reaches integration |
| Demonstrated direct Custom Element gap        | Application owner                  | Blocks a Wayglass ownership hypothesis           | A reproducible minimal consumer records the failing or disproportionate property, event, ref, form, slot, lifecycle, SSR, or typing seam | With the named consumer                  |
| Framework-range maintenance owner             | Wayglass maintainers               | Blocks artifact acceptance and support           | A named maintainer accepts minimum/current framework and TypeScript testing plus updates                                                 | Before charter acceptance                |
| Exact dependency and support proposal         | Proposed maintainer                | Blocks dependency approval and proof environment | Exact framework/tool versions, peers, license, health, bundle/type cost plan, browser matrix, and removal path are reviewed              | Before any install or prototype          |

### Revise charter when

Revise when a framework, consumer, task, element subset, rendering mode, version range, dependency,
proof location, maintainer, public surface, support claim, success threshold, or comparison baseline
is proposed. Any prototype, package, generated wrapper, external example, or publication also
requires revision and acceptance first.

## Evidence plan and results

| Evidence ID | Category                        | Environment and versions                      | Fixture or data                                           | Method and expected result                                                                                                           | Actual result and artifact                                                                                                                         | Reviewer and date      | Limitation                  | Decision impact                    |
| ----------- | ------------------------------- | --------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------- | ---------------------------------- |
| `P5F-E01`   | Consumer and repository demand  | Repository at `774f847`; Node 26.4; pnpm 11.9 | Workspace manifests and authored source                   | Inventory application frameworks, authored non-React components, docs imports, and accepted architecture boundaries                  | React is the only application framework; zero authored Vue/Svelte components or imports; docs uses no elements runtime; ADR 0003 keeps Vue private | Maintainer, 2026-09-01 | Repository consumers only   | Supports defer recommendation      |
| `P5F-E02`   | Task and direct-use comparison  | Pending named framework and consumer          | Exact consumer task and element subset                    | Complete the same task directly and through the smallest candidate; precommit semantic, type, lifecycle, and cost thresholds         | Not authorized                                                                                                                                     | Pending                | No consumer or task         | Blocks proof and artifact decision |
| `P5F-E03`   | Framework compatibility         | Pending exact minimum/current versions        | Client, development, production, and claimed SSR modes    | Verify properties, events, refs, methods, forms, focus, slots, fallback, registration, lifecycle, build, and hydration as applicable | Not authorized                                                                                                                                     | Pending                | No framework selected       | Blocks compatibility claim         |
| `P5F-E04`   | Isolation, cost, and dependency | Pending exact candidate and direct baseline   | Package, peer graph, types, bundle, imports, removal      | Measure dependency and bundled cost; inspect side effects, duplicate runtime, tree shaking, license, security, and clean removal     | Not authorized                                                                                                                                     | Pending                | No candidate                | Blocks package decision            |
| `P5F-E05`   | Accessibility and equivalence   | Pending current Chromium, Firefox, and WebKit | Named complete consumer task                              | Match direct Vanilla and React keyboard, focus, forms, themes, fallback, Axe, responsive, RTL, text growth, and forced-color results | Not authorized                                                                                                                                     | Pending                | No browser-facing candidate | Blocks artifact acceptance         |
| `P5F-E06`   | Documentation and support       | Pending exact framework and package surface   | Setup, direct-use comparison, support, migration, removal | Make claimed modes, limitations, peer ranges, registration, fallback, maintenance, and replacement visible                           | Not authorized                                                                                                                                     | Pending                | No accepted public surface  | Blocks implementation contract     |

### Evidence category omissions

No runtime, package, dependency, generated output, visual surface, or public API is proposed, so
revision 1 performs no browser, assistive-technology, performance, bundle, compatibility, package,
or publication validation. Those categories are carried gates in `P5F-E02` through `P5F-E06`, not
inherited evidence.

### Deviations and adverse evidence

- The only non-React framework in the dependency graph is Vue through private VitePress tooling.
  Treating that transitive implementation detail as consumer demand would conflict with ADR 0003.
- The docs application deliberately does not reproduce Storybook's interactive fixtures, so adding a
  Vue wrapper merely to demonstrate a wrapper would create the demand it claims to satisfy.

### Claims not supported

This proposal does not establish that direct use is sufficient in every framework, that Vue, Svelte,
Angular, Solid, Preact, or another framework needs no wrapper, that any framework version is
supported, or that Wayglass can claim SSR, hydration, compiler, JSX, event, form, or type parity
outside the accepted React baseline.

## Disposition

The project owner accepted **defer** on September 1, 2026, because no named additional-framework
consumer, failing task, direct-use gap, or compatibility maintainer exists.

- **Outcome:** defer.
- **Decision date and approver:** project owner, 2026-09-01.
- **Reasoning:** the prerequisite demand evidence fails before framework selection. A speculative
  proof cannot establish a Wayglass ownership advantage and would create unsupported package and
  compatibility obligations.
- **Retained ownership and boundaries:** `@wayglass/elements` continues to own framework-neutral
  behavior; `@wayglass/react` remains the only accepted framework binding; other consumers use
  direct Custom Elements or application-local glue unless a revised charter is accepted.
- **Known limitations:** repository demand does not represent every external Wayglass consumer.
- **Follow-up authorized:** none until an objective restart trigger is met and this record is
  revised and accepted. No dependency, prototype, package, generated wrapper, public API, or
  framework support claim is authorized.
- **Remaining approvals and gates:** every objective restart trigger in the defer table, followed by
  a revised charter and project-owner acceptance before implementation authority can be requested.
- **Cleanup completed:** no implementation, dependency, export, output, credential, or external
  effect was created.

This deferred outcome creates no artifact, compatibility promise, or publication authority.
