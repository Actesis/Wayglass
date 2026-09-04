# Phase 6B form-controls contract audit

**Status:** Proposed on September 3, 2026. This record reconciles `wg-text-field`,
`wg-number-field`, `wg-select`, `wg-checkbox`, `wg-radio`, and `wg-slider` against their
implementation, architecture decisions, documentation, React bindings, stories, and browser
evidence. It changes no package version, privacy, registry, or deployment state.

## Scope

The audit covers native control ownership, accepted direct anatomy, development diagnostics, fields,
slots, CSS parts and custom properties, form and event behavior, invalid-state styling, native
appearance, explicit registration, and React adaptation.

Schema management, validation timing, relationship generation, feedback delivery, appearance-
replacing controls, and specialized or compound inputs remain outside these inert shells.

## Result

The runtime remains aligned with ADRs 0015, 0018, and 0019. All six elements are property-free,
event-free presentation shells around consumer-authored native controls. Native inputs, textarea,
select, labels, options, groups, and output retain form data, focus, state, accessibility, input
methods, validation, and ordinary framework events.

The canonical text-field example incorrectly used a nonexistent `requirement` attribute on
`wg-field-label`; it now uses the accepted `requirement` slot. The authoritative document also now
names all sixteen existing CSS custom properties: ten shared by text field, number field, and
select; four shared by checkbox and radio; and two for slider.

The diagnostic contract was narrowed to what the runtime actually checks. Single-control shells
count compatible direct controls. Choice shells check their direct typed input, direct native label,
and explicit association. The runtime does not claim to detect every nested or interactive authoring
problem and never repairs consumer markup.

Validation and excluded behavior now appear as present-tense evidence and continuing v1 boundaries.
The existing browser import proof already loads all six modules and confirms that no import
registers an element or disrupts the native fallback control.

The consolidated evidence ledger also exposed overstatements in the preceding menu and
form-foundation audit records. Those records now correctly keep VoiceOver/Safari, Windows
NVDA/Firefox, real-profile autofill, and password-manager work open wherever the underlying ledger
still carries it.

## Frozen contract

- All six shells own no reactive properties, values, methods, Custom Events, form participation, or
  semantics. They inherit one default slot and one `container` part from the shared inert shell.
- Text field accepts exactly one direct textarea or input of type text, search, email, tel, URL, or
  password. Number field, select, and slider respectively accept one direct native number input,
  select, or range input.
- Checkbox and radio each require one direct native input of the matching type and one directly
  associated native label.
- The field, choice, and slider style sets expose exactly sixteen family-specific CSS custom
  properties while preserving native glyphs, popup, steppers, track, thumb, focus, and events.
- Anatomy checks report warnings only when their scoped direct-child rules fail. Unsupported markup
  remains visible and native behavior is neither intercepted nor repaired.
- Element module imports remain side-effect free. React wrappers register the production classes and
  add no event translation or form behavior.

## Remaining release evidence

VoiceOver/Safari, NVDA with Firefox on Windows, representative real-profile autofill, and
password-manager review remain open pre-public-release evidence items. The Windows item remains
consistent with the existing deferred Windows-access decision; this audit makes no unsupported
screen-reader, autofill, or password-manager claim.

## Decision requested

Accept form controls as field-level reconciled and proceed to the persistent feedback and loading
family. Acceptance freezes the listed contract for v1; later changes require explicit compatibility
review. It does not authorize package publication.
