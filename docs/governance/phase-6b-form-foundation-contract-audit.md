# Phase 6B form-foundation contract audit

**Status:** Accepted by the project owner on September 3, 2026. This record reconciles
`wg-field-label`, `wg-field-message`, and `wg-form-group` against their implementation, architecture
decisions, documentation, React bindings, stories, and browser evidence. It changes no package
version, privacy, registry, or deployment state.

## Scope

The audit covers native form ownership, explicit label and description relationships, fields and
defaults, slots, CSS parts and custom properties, message vocabulary, validation boundaries, failure
behavior, native form-action styling, explicit registration, and React adaptation.

The six native control presentations remain in the next form-controls family. Application
validation, form state, feedback delivery, and submission effects remain outside these inert
wrappers.

## Result

The runtime contract remains aligned with ADRs 0015 and 0018. The three elements remain
non-focusable presentation helpers with no implicit form, label, group, live-region, or status role;
they expose no methods or Custom Events and do not inspect, generate, or repair native form
relationships.

The authoritative document now records all nine existing CSS custom properties: four for
`wg-field-label`, four for `wg-field-message`, and one for `wg-form-group`. It also records the
field-message fallback normalization that is already implemented.

Stale phase language now points to the implemented form-control and feedback contracts. The
unsupported promise that invalid form-group anatomy produces development diagnostics was removed;
the runtime deliberately remains inert and does not validate or rewrite consumer markup.
Implementation-gate and deferred-decision sections now describe completed evidence and continuing v1
ownership boundaries.

The existing browser import proof loads all three modules and confirms that imports neither register
elements nor hide fallback text. Browser evidence covers native label and fieldset semantics,
explicit descriptions, submission-first error state, submitter and form-data ownership, native
reset, closed message vocabulary, form-action targets, theme and forced-color accessibility, and
narrow-viewport containment across Chromium, Firefox, and WebKit.

## Frozen contract

- `wg-field-label` owns no properties, methods, events, or semantics. It exposes default,
  `requirement`, and `detail` slots; four CSS parts; and four component styling hooks.
- `wg-field-message` owns only reflected `kind`, closed to `help` and `error` with `help` as the
  default and fallback. It exposes one default slot, three CSS parts, and four component styling
  hooks, with no automatic visibility, validation, association, or announcement behavior.
- `wg-form-group` owns no properties, methods, events, or semantics. It exposes one default slot,
  one `group` part, and `--wg-form-group-space`.
- The separate `forms.css` entry styles native submit and reset buttons through `wg-form-action` and
  its single `wg-form-action--quiet` modifier without proxying native form behavior.
- Element modules remain side-effect free. React wrappers register the production classes and add no
  event adaptation or form behavior.

## Remaining release evidence

The completed VoiceOver/Safari and representative autofill reviews remain valid. NVDA with Firefox
on Windows remains an open pre-public-release evidence item, consistent with the existing deferred
Windows-access decision; this audit makes no unsupported Windows screen-reader claim.

## Project-owner decision

On September 3, 2026, the project owner accepted the form-foundation contract audit and directed its
merge and continuation to the form-controls family. This freezes the listed contract for v1; later
changes require explicit compatibility review. It does not authorize package publication.
