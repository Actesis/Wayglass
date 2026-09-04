# Phase 6B temporal-collections contract audit

**Status:** Proposed on September 3, 2026. This record reconciles `wg-timeline`, `wg-timeline-item`,
`wg-event-log`, and `wg-event-record` against their implementations, architecture decisions,
documentation, React bindings, stories, and browser evidence. It changes no package version,
privacy, registry, or deployment state.

## Scope

The audit covers collection chronology; fields and defaults; slots; CSS parts and custom properties;
authored-order list semantics; milestone, interval, and event anatomy; occurrence state; native
time, details, media, and actions; unsupported-child diagnostics; quiet stationary updates;
responsive order; explicit registration; and React adaptation.

Formatting, ordering, grouping, identity, severity, ingestion, retention, filtering, announcement,
unseen state, follow-latest, scroll restoration, pagination, virtualization, and application data
remain consumer-owned.

## Result

The two families remain distinct and aligned with ADRs 0024 and 0026. Timeline is a curated
narrative of milestones and intervals; event log is a dense inspectable occurrence stream. Both use
visible chronology plus authored DOM order, quiet list/list-item semantics, retained light-DOM
records, independent occurrence state, and application-owned details and controls.

No implementation field or behavior drift required a component change. Public documentation now uses
“authored-order list semantics” rather than implying native ordered-list markup. It records the
implemented `ascending` chronology default and the camelCase `chronologyLabel` property with its
`chronology-label` attribute and empty default for both collection types.

The stale statement that implementations, stories, and validation remained future work is removed.
Current automated coverage and continuing application-owned boundaries are stated directly.
Executable field-level tests freeze all four components, and narrow browser checks now verify that
timeline and event-record actions remain after informational content at 320 CSS pixels and 200%
text.

## Frozen contract

- Timeline and event log each expose label, chronology, chronology label, and busy fields; five
  slots; eight CSS parts; and seven family-specific custom properties. Neither sorts, reverses,
  follows, scrolls, announces, or uses the implicitly live `log` role.
- Timeline item exposes label, milestone/interval kind, and three state axes; seven slots; fifteen
  CSS parts; and eleven intentional custom properties. Sequence and signal geometry remain
  decorative.
- Event record exposes label and three state axes; nine slots; sixteen CSS parts; and twelve
  intentional custom properties. Occurrence and received time, source, category, reference,
  metadata, details, and actions remain separately authored.
- Unsupported default children are preserved and receive only a deduplicated diagnostic. Records
  remain stable application-owned nodes and both record surfaces remain non-interactive.
- All modules remain side-effect free and explicitly registered. React registers the production
  classes and adds no fields, events, chronology, record, update, or interaction behavior.

## Validation

The reconciled contract passes the relevant local quality gates:

- 164 documentation and governance checks, including the new four-component field-level contract
  suite;
- ESLint plus element, documentation, and React typechecks;
- 17 React wrapper unit tests and a production documentation build; and
- 96 scheduled Chromium, Firefox, and WebKit browser cases: 92 applicable passes and four
  intentional non-Chromium timing-envelope skips.

Browser coverage includes side-effect-free imports, authored-field preservation, list semantics,
chronology, state-axis independence, malformed-value normalization, unsupported-child diagnostics,
stationary updates, performance envelopes, narrow and RTL reflow, forced colors, reduced motion,
both themes, automated accessibility checks, React adaptation, and the new narrow action-order
assertions.

## Remaining release evidence

VoiceOver/Safari and NVDA with Firefox on Windows remain open pre-public-release evidence for named
collections, chronology and reading order, record counts, occurrence and receipt time, independent
state, native details and media, stationary burst insertion, unseen summaries, jump actions, focus
and scroll preservation, and absence of record-by-record speech. The Windows item remains consistent
with the existing deferred Windows-access decision.

## Project-owner decision

Pending review. Acceptance freezes the listed temporal-collections contract for v1; later changes
require explicit compatibility review. It does not authorize package publication.
