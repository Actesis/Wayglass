# ADR 0027: Compose filters and commands around their existing interaction owners

- Status: proposed
- Date: 2026-08-09

## Context

Phase 3F adds filter and command patterns around operational collections. Both patterns visually
group controls, but their actual interaction owners are already established and materially
different.

Filters use native form controls. ADR 0015 keeps successful controls in light DOM, and ADR 0018
keeps labels, validation, submission, reset, and errors explicit and application-owned. Commands use
the immediate-button and flat-menu contracts from ADRs 0014 and 0017. ADR 0024 further requires
applications to own filtering, result updates, stable record identity, focus recovery, and
deliberate announcements.

A broad “toolbar” component could obscure those boundaries. It might generate controls from a
schema, aggregate native events, add arrow-key navigation to ordinary buttons, move controls into a
menu at narrow widths, or execute commands. Each convenience would make Wayglass compete with the
native form, existing command controls, framework reconciliation, or application policy.

The [Phase 3F filter and command proposal](../../data/filter-and-command-patterns.md) therefore
requires a narrower decision about composition, responsive priority, overflow, result context, and
focus order.

## Decision

### Keep filter bars presentation-only around one native form

Wayglass will define `wg-filter-bar` as a named layout and semantic boundary around exactly one
direct consumer-authored native form. It will not be form-associated, create controls from data,
mirror native values, serialize filters, or emit a replacement change event.

The light-DOM form retains labels, groups, successful controls, submitter identity, constraint
validation, submission, reset, and native events. The application owns draft values, applied
filters, query calculation or transport, persistence, stale responses, failure, and recovery.

The bar provides slots for visible heading, description, the form, a durable applied-filter summary,
and application-owned status. It does not infer applied state from current control values or result
count. Reset remains native and restores draft defaults; applications explicitly decide whether
those defaults are then applied.

The result collection stays outside the bar. It owns its visible result context, loading and empty
states, and stable records. Filtering does not move focus or announce automatically. One
application-selected visible result owner may deliver a bounded announcement when useful.

### Keep command bars out of the ARIA toolbar pattern

Wayglass will define `wg-command-bar` as a named layout boundary for existing `wg-button`,
`wg-menu`, and other accepted command controls. It will not use `role="toolbar"`, roving focus,
arrow-key movement, a command registry, an aggregate command event, shortcuts, authorization, or
execution.

Each child remains the semantic and event owner. Ordinary Tab order moves through visible controls;
an opened menu uses only its accepted internal menu keyboard model. Confirmation and stronger
verification retain their existing application-selected owners.

The command bar provides separate primary, secondary, explicit overflow, and durable status
composition. Primary and time-sensitive responses remain visible. Pending, rejected, and unavailable
outcomes remain outside a dismissed menu and do not become transient-only feedback.

### Make responsive priority authored and stable

Neither bar visually reorders controls away from its flattened accessibility order. Logical layout
may wrap or stack groups, but it does not change native form sequence, command priority, or focus
order.

The command bar never measures commands and moves them automatically into overflow. Applications
author at most one existing flat menu containing commands that are secondary at every supported
width. They do not render duplicate desktop buttons and mobile menu items for the same command. When
a visible set cannot fit safely, it wraps, stacks, or is reduced by application design rather than
becoming an unlabeled horizontal action scroller.

The filter form similarly recomposes without moving controls between semantic groups. Native
fieldset and legend relationships remain intact. Applied summaries and status stay discoverable at
narrow widths and 200% text.

### Preserve outcomes without inventing shared state

The bars have no universal `busy`, `disabled`, `pending`, `error`, or `results` state. Activity and
availability belong to the smallest authored owner: native controls, an existing command control,
the result collection, or persistent status content.

Programmatic application updates do not emit user-intent events or move focus. A filter result, menu
command, visible button, confirmation dialog, and toast do not independently announce the same
outcome. The application selects one durable outcome and one delivery path under ADR 0020.

Private implementation may share neutral layout helpers between the two bars, but no public generic
action-bar base class, structured child type, overflow controller, or event coordinator is added.

## Consequences

- Native form behavior remains inspectable, server-friendly, useful before upgrade, and compatible
  with ordinary framework form libraries.
- Existing button and menu contracts retain one activation and keyboard owner in vanilla and React
  applications.
- Product teams must explicitly model draft versus applied filters, result context, command
  priority, overflow membership, pending work, and recovery.
- A stable visible command set may consume more space than automatic overflow, but primary and
  critical responses remain discoverable and focus does not jump during resize.
- The command bar's name does not imply ARIA toolbar semantics; documentation must make ordinary Tab
  behavior clear.
- The two public elements can share Wayglass visual rhythm without pretending that forms and
  immediate commands have one state or event model.
- Deployment evidence can later propose saved filters, adaptive overflow, shortcuts, or a true
  toolbar without baking those capabilities into the initial composition.

## Alternatives considered

### One generic action or toolbar element

Rejected. Native form submission and immediate command activation have different owners, states,
events, and failure paths. A shared public coordinator would either become vague presentation or
collapse those distinctions.

### Form-associated custom filter controls or a filter-schema property

Rejected. They would duplicate successful-control, validation, autofill, reset, framework, and
application query behavior already owned by native forms and ADR 0015.

### Aggregate `wg-filter-change` and `wg-command` events on the bars

Rejected. Native form events and existing typed command events already report intent. A second event
would duplicate delivery and imply that the bar owns serialization or execution.

### Automatic apply on every control change

Rejected as a component rule. Immediate filtering is appropriate in some applications, while
expensive, remote, or multi-field queries benefit from explicit submission. The application can
choose either behavior without changing the bar contract.

### Automatic responsive overflow

Rejected. Measuring and moving controls changes flattened ownership, focus order, open-menu state,
framework identity, and discoverability. Duplicating desktop and mobile controls creates competing
IDs, events, and pending state. Explicit stable priority is more predictable.

### ARIA toolbar semantics and arrow-key navigation

Rejected for the initial pattern. The Phase 3F bars may contain native form controls, buttons, and a
menu trigger with established keyboard behavior. Adding a second composite model would surprise
users and widen scope into the deliberately excluded generic toolbar.

### Put result data inside the filter bar

Rejected. A filter form and its result collection have separate naming, loading, empty, focus,
mutation, and performance boundaries. Visible adjacent composition communicates the relationship
without transferring data ownership.

### Hide pending and failed commands inside the menu

Rejected. A dismissed popup cannot be the durable owner of progress, rejection, recovery, or an
important unavailable reason. Function-local persistent feedback remains available after dismissal.
