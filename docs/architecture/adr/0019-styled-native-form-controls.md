# ADR 0019: Style native form controls without replacing their platform behavior

- Status: proposed
- Date: 2026-08-01

## Context

ADR 0015 keeps successful native form controls consumer-authored in light DOM. Phase 2D-E must now
decide how Wayglass presents text, number, select, checkbox, radio, and range controls without
quietly taking ownership of the behavior that decision preserved.

Text-like controls accept extensive CSS while retaining their native editing implementation.
Checkboxes, radios, selects, number steppers, and ranges expose less consistent styling surfaces.
Setting `appearance: none` can make them visually uniform, but it also removes familiar platform
indicators and requires Wayglass to recreate every checked, mixed, disclosure, thumb, track,
disabled, invalid, focus, high-contrast, touch, and writing-mode state across engines.

Wrapper-generated proxy controls would create a second interactive representation or move the real
control behind custom behavior. Styling based on mirrored host attributes would also diverge from
native properties such as checkbox `indeterminate`, autofill state, partial number editing, select
mode, and constraint validity.

References:

- [HTML input types](https://html.spec.whatwg.org/multipage/input.html)
- [HTML select element](https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element)
- [CSS UI appearance switching](https://drafts.csswg.org/css-ui/#appearance-switching)
- [WAI form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/)
- [WCAG 2.2 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

## Decision

Implement each Phase 2D-E component as an inert presentation shell around a compatible direct native
control in light DOM. The native control remains the only interactive form control and owns its
complete value, state, events, form participation, accessibility mapping, input methods, autofill,
and restoration behavior.

Retain native interaction appearance for checkbox checks, radio dots, mixed state, select disclosure
and popup, number steppers, range track and thumb, and platform-specific text-input affordances. Use
supported styled-native hooks such as `accent-color`, `color-scheme`, typography, logical sizing,
spacing, surfaces, borders, radii, and explicit `aria-invalid` and `:focus-visible` treatment.
Native engine variation is acceptable where it conveys familiar platform behavior.

Do not style application errors from bare `:invalid`. ADR 0018 keeps validation timing
application-owned, so persistent Wayglass invalid presentation follows explicit
`aria-invalid="true"` on the native control. Native constraints and browser validation UI continue
to function independently.

The shells may inspect direct children only to report development diagnostics. They do not mirror
native attributes or properties, intercept or re-emit native events, generate IDs, add roles, change
focus, repair anatomy, or synchronize label, description, output, or group relationships.

Prototype selectors before locking public CSS. Prefer encapsulated `::slotted()` presentation. If
supported state selectors or choice-label geometry cannot be delivered consistently through that
boundary, publish narrowly named classes for the native control and direct choice label. Those
classes are presentation hooks only and do not move semantic ownership to Wayglass.

Typed React wrappers represent only the presentation shells. Consumers render native React `input`,
`textarea`, `select`, `option`, `label`, `fieldset`, `legend`, and `output` elements as children and
retain their normal props, refs, and synthetic event behavior.

## Consequences

Autofill, password managers, mobile keyboards, composition, selection, native popups, number
editing, checkbox and radio state, slider manipulation, validation, submission, and reset continue
through browser-owned controls. Server rendering and failed upgrade preserve a usable form.

Themes can substantially adapt typography, spacing, surfaces, borders, radii, accent, focus, and
error treatment, but cannot demand pixel-identical native glyphs and popups across operating
systems. This is a deliberate semantic stability boundary rather than an accidental styling gap.

The shell API stays small and durable because it does not duplicate the large native control API.
Consumers author explicit native markup and must use the correct element, type, label, description,
group, and autocomplete metadata.

Wayglass must test native state selectors, autofill, forced colors, touch targets, zoom, and
assistive-technology output in each supported engine. Visual regression alone is insufficient.

## Alternatives considered

- **Use `appearance: none` for every control:** rejected for the initial contract because Wayglass
  would inherit a large cross-engine interaction and high-contrast surface merely to obtain visual
  uniformity.
- **Wrap visually hidden native controls with custom interactive proxies:** rejected because two
  representations can diverge in focus, state, validation, events, target geometry, and assistive
  technology.
- **Mirror native state onto shell attributes:** rejected because the native API is larger than the
  proposed component API and includes important property-only and transient editing state.
- **Expose only global classes with no component shells:** rejected because the shells provide
  bounded composition, diagnostics, theme hooks, explicit registration, and framework parity with
  the rest of Wayglass. Narrow native-node classes remain an implementation fallback.
- **Build one generic `wg-control` shell:** rejected because compatible anatomy, interaction
  geometry, state surfaces, guidance, and diagnostics materially differ across control families.
- **Require pixel-identical controls across engines:** rejected because it conflicts with retaining
  useful platform-native behavior and familiar operating-system conventions.
- **Create form-associated custom elements:** deferred by ADR 0015 until the supported browser and
  assistive-technology matrix demonstrates reliable platform parity.
