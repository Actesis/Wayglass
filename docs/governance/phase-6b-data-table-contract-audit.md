# Phase 6B data-table contract audit

**Status:** Accepted by the project owner on September 4, 2026. This record reconciles
`wg-data-table` and its explicit native-table stylesheet against the implementation, architecture
decisions, documentation, React binding, stories, and browser evidence. It changes no package
version, privacy, registry, or deployment state.

## Scope

The audit covers the intentionally empty field surface; slots; CSS parts and custom properties;
native-table and scroll-region ownership; caption and header relationships; styling scope; sorting
and actions; feedback placement; diagnostics; responsive overflow; explicit registration; and React
adaptation.

Schemas, records, formatting, sorting, selection, editing, persistence, pagination, virtualization,
sticky-header policy, announcements, and application data remain consumer-owned.

## Result

The component remains aligned with ADRs 0024 and 0028. It is a small presentation boundary around
one direct `wg-scroll-region[axis="inline"]`, which in turn contains one direct consumer-authored
native table. The table remains the sole tabular semantic owner, while the accepted scroll primitive
alone owns overflow measurement, conditional focus, and region semantics.

No implementation field or behavior drift required a component change. Public documentation now
records completed sticky-header fixture evidence in present tense and replaces its deferred section
with current automated coverage and continuing application-owned boundaries.

Executable field-level tests freeze the element and explicit stylesheet surfaces. The focused narrow
browser check now also proves that context, the scroll boundary, and feedback retain their
documented flattened order at 320 CSS pixels and 200% text.

## Frozen contract

- `wg-data-table` exposes no attributes or reactive properties, three slots, three CSS parts, and
  thirteen intentional custom properties. It does not mirror the scroll-region label or axis and
  owns no rows, columns, schema, state, sorting, selection, editing, paging, virtualization, sticky
  behavior, or data operation.
- The default slot accepts exactly one direct `wg-scroll-region[axis="inline"]` containing exactly
  one direct native table. `context` precedes that boundary and `feedback` follows it. Unsupported
  anatomy is preserved and receives only a deduplicated diagnostic.
- Native caption, row groups, headers, rows, cells, controls, events, ARIA state, identity, and
  mutation remain authored light DOM. The wrapper adds no grid semantics, focus stop, live region,
  aggregate event, observer, or responsive representation.
- The opt-in `data-table.css` stylesheet is scoped to the direct accepted anatomy, uses the same
  thirteen token-backed hooks, and does not change the semantic display roles of native table
  descendants.
- The module remains side-effect free and explicitly registers only `wg-data-table`. React registers
  the production class but not the separately composed scroll region and adds no fields, events,
  table behavior, or responsive policy.

## Validation

The reconciled contract passes the relevant local quality gates:

- 182 documentation and governance checks, including the new data-table field-level contract suite;
- ESLint plus element, documentation, and both React typechecks;
- 17 React wrapper unit tests and a production documentation build; and
- 99 scheduled Chromium, Firefox, and WebKit browser cases: 97 applicable passes and two intentional
  non-Chromium timing-envelope skips.

Browser coverage includes fallback and separate explicit registration, native table semantics,
caption and header relationships, scoped opt-in styles, sorting and stable rows, state and actions,
unsupported-anatomy diagnostics, the new narrow flattened-order assertion, consequential
confirmation, authored sticky headers, 20-row replacement, the 200-by-20 relationship and
performance envelope, touch targets, themes, density, RTL, forced colors, reduced motion, 320
CSS-pixel width, 200% text, React adaptation, Axe, and page containment.

## Remaining release evidence

VoiceOver/Safari and NVDA with Firefox on Windows remain open pre-public-release evidence for table
caption and header relationships, grouped and explicit headers, the named scroll region, sorting and
row actions, state and feedback, quiet row replacement, contained traversal, responsive text, and
React parity. The Windows item remains consistent with the existing deferred Windows-access
decision.

## Project-owner decision

Accepted on September 4, 2026. The listed data-table contract is frozen for v1; later changes
require explicit compatibility review. This acceptance does not authorize package publication.
