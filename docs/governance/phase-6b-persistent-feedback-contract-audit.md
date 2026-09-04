# Phase 6B persistent-feedback contract audit

**Status:** Accepted by the project owner on September 3, 2026. This record reconciles `wg-alert`,
`wg-badge`, `wg-empty-state`, `wg-offline-state`, `wg-progress`, `wg-skeleton`, and
`wg-stale-data-marker` against their implementation, architecture decision, documentation, React
bindings, stories, and browser evidence. It changes no package version, privacy, registry, or
deployment state.

## Scope

The audit covers the separation of condition, knowledge, activity, and availability; fields and
defaults; slots; CSS parts and custom properties; persistent and announcement semantics; native
progress ownership; skeleton normalization; diagnostics; explicit registration; and React
adaptation.

Transient feedback, modal decisions, application retry policy, staleness calculation, connectivity
evidence, and domain-specific artwork remain outside this family.

## Result

The runtime remains aligned with ADR 0020 and the feedback-state contract. The seven components
continue to report or present application-owned state without inventing outcomes, moving focus,
starting work, dismissing themselves, or conflating condition, knowledge, activity, and
availability.

Two CSS-part mismatches were corrected in the authoritative document: `wg-progress` renders only the
inherited `container` part, not a `base` part, while `wg-empty-state` renders a `marker` part that
was previously omitted. The document now also records the eight implemented shared element-level
feedback styling hooks and explicitly records that the other four elements expose no
element-specific CSS custom properties in v1.

The diagnostic contract was narrowed to the runtime. `wg-progress` checks its direct native progress
count and accessible name. Alert, badge, and skeleton normalize closed values. Empty, offline, and
stale-data elements do not perform the previously claimed content, action, or label audits. No
component repairs consumer markup.

Validation and excluded behavior now appear as present-tense evidence and continuing v1 boundaries.
The browser import proof already loads all seven modules and confirms that imports neither register
elements nor hide useful fallback content.

## Frozen contract

- Badge owns reflected `condition`, one slot, and three parts. Alert owns reflected `condition`,
  `announcement`, and `label`; three slots; six parts; and message-only opt-in live semantics.
- Empty state and offline state each own only a required `label` with an empty runtime default,
  consumer-authored content slots, group semantics, and respectively six parts. Offline state owns
  the additional `last-known` slot; neither infers application state.
- Progress owns no host state or events. It wraps one explicitly named direct native progress
  element through one default slot and one `container` part, leaving value and accessibility to the
  native element.
- Skeleton owns reflected `shape`, `lines`, and `motion`, renders no slot, exposes three parts, and
  remains `aria-hidden`. Shape, line count, motion, and reduced-motion behavior are closed.
- Stale-data marker owns no properties or events. It exposes one default slot and three parts and
  qualifies knowledge without changing condition.
- Alert, empty state, and offline state share exactly eight element-level CSS custom properties.
  Badge, progress, skeleton, and stale marker expose no element-specific CSS hooks in v1.
- All modules remain side-effect free. React wrappers register the production classes and add no
  events or behavior.

## Remaining release evidence

VoiceOver/Safari and NVDA with Firefox on Windows remain open pre-public-release evidence items. The
Windows item remains consistent with the existing deferred Windows-access decision; this audit makes
no unsupported screen-reader claim.

## Project-owner decision

On September 3, 2026, the project owner accepted the persistent-feedback contract audit and directed
its merge and continuation to transient feedback. This freezes the listed contract for v1; later
changes require explicit compatibility review. It does not authorize package publication.
