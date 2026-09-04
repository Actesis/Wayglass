# Phase 6B filter-and-command contract audit

**Status:** Proposed on September 3, 2026. This record reconciles `wg-filter-bar` and
`wg-command-bar` against their implementations, architecture decision, documentation, React
bindings, stories, and browser evidence. It changes no package version, privacy, registry, or
deployment state.

## Scope

The audit covers fields and defaults; slots; CSS parts and custom properties; named-region
semantics; native form ownership; immediate-command ownership; explicit priority and overflow;
diagnostics; responsive order; focus, event, and node preservation; explicit registration; and React
adaptation.

Filter schemas, query and result state, persistence, data fetching, command execution,
authorization, confirmation policy, adaptive priority, announcements, and application data remain
consumer-owned.

## Result

The two bars remain separate and aligned with ADR 0027. A filter bar is a named presentation
boundary around exactly one direct native form. A command bar is a named layout boundary around
existing immediate-command controls, not an ARIA toolbar or interaction coordinator. Both preserve
authored light DOM, source order, native events, control identity, and application ownership.

No implementation field or behavior drift required a component change. Public documentation now
states the implemented empty `label` default, replaces its future validation checklist with current
coverage, and removes stale language that treated the completed Phase 3G table, implementations,
stories, and automated validation as future work.

Executable field-level tests freeze both component surfaces. The focused narrow browser check now
also proves the documented flattened filter content-summary-status and command-overflow-status order
at 320 CSS pixels and 200% text.

## Frozen contract

- `wg-filter-bar` exposes only `label`, five slots, seven CSS parts, and seven intentional custom
  properties. Its default slot accepts exactly one direct consumer-authored native form; the bar
  does not inspect controls, associate with the form, mirror values, submit, reset, validate,
  serialize, or emit replacement events.
- `wg-command-bar` exposes only `label`, six slots, eight CSS parts, and seven intentional custom
  properties. Default, `secondary`, and `overflow` slots express stable authored priority;
  `overflow` accepts at most one direct `wg-menu`. The bar does not add toolbar semantics, roving
  focus, keyboard shortcuts, aggregate events, responsive DOM migration, or command execution.
- Both render one named region without adding a focus stop or implicit live region. Optional
  description, summary, and status content remains authored, durable, quiet context.
- Unsupported anatomy is preserved and receives only a deduplicated diagnostic. Neither component
  clones, removes, reorders, hides, disables, or portals consumer controls.
- Both modules remain side-effect free and explicitly registered. React registers the production
  classes and adds no fields, events, form behavior, command behavior, or responsive policy.

## Validation

The reconciled contract passes the relevant local quality gates:

- 173 documentation and governance checks, including the new two-component field-level contract
  suite;
- ESLint plus element, documentation, and both React typechecks;
- 17 React wrapper unit tests and a production documentation build; and
- all 81 focused Chromium, Firefox, and WebKit browser cases.

Browser coverage includes fallback and explicit registration, native form ownership, submitter and
form-data preservation, native reset, named quiet regions, ordinary command Tab order, flat-menu
behavior, stable nodes and events, unsupported-anatomy diagnostics, draft and applied state,
stationary result updates, durable feedback and recovery, explicit overflow, the new narrow
flattened-order assertion, touch targets, themes, density, RTL, forced colors, reduced motion, 320
CSS-pixel width, 200% text, React adaptation, Axe, and page containment.

## Remaining release evidence

VoiceOver/Safari and NVDA with Firefox on Windows remain open pre-public-release evidence for named
regions, native form relationships and validation, submit and reset behavior, ordinary command Tab
order, flat-menu behavior, stable result context, deliberate announcement ownership, pending and
recovery states, responsive order, and React parity. The Windows item remains consistent with the
existing deferred Windows-access decision.

## Project-owner decision

Pending review. Acceptance freezes the listed filter-and-command contract for v1; later changes
require explicit compatibility review. It does not authorize package publication.
