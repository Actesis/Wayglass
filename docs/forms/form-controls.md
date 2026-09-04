# Phase 2D-E form-control contracts

**Status:** Accepted, implemented, and automatically validated for Phase 2D-E on August 1, 2026;
representative assistive-technology review remains tracked as a public-release gate. Native
ownership remains governed by [ADR 0015](../architecture/adr/0015-native-form-control-ownership.md),
explicit relationships and validation remain governed by
[ADR 0018](../architecture/adr/0018-explicit-form-relationships-and-validation.md), and the accepted
presentation boundary is recorded in
[ADR 0019](../architecture/adr/0019-styled-native-form-controls.md). Automated and visual evidence
is recorded in the
[Phase 2D-E validation record](../accessibility/phase-2d-form-controls-validation.md).

This contract defines `wg-text-field`, `wg-number-field`, `wg-select`, `wg-checkbox`, `wg-radio`,
and `wg-slider` as inert presentation shells around consumer-authored native controls. It does not
replace the form platform, duplicate native APIs, or introduce a form-state manager.

## Shared contract

Each shell:

- accepts the compatible native control in light DOM and leaves it as the only focusable form
  control and successful form value;
- owns presentation and scoped development diagnostics, but no value, checked state, selection,
  validity, label, description, form association, or event translation;
- adds no control role, generated ID, hidden proxy, automatic error state, or live region;
- imports without registering itself and exposes an explicit registration function;
- preserves useful native behavior before upgrade and when JavaScript is unavailable;
- composes with `wg-form-group`, `wg-field-label`, `wg-field-message`, native `label`, and native
  `fieldset`/`legend` without rewriting their relationships;
- retains visible native focus, at least 44 by 44 CSS-pixel interaction targets or equivalent label
  targets, and usable presentation at a 320 CSS-pixel viewport; and
- uses the same production element class through a typed React shell while native control props,
  refs, and events remain ordinary React APIs.

The native control owns `name`, `value`, `checked`, `required`, `disabled`, `readonly`, `min`,
`max`, `step`, `pattern`, `multiple`, `autocomplete`, `inputmode`, `enterkeyhint`, and every other
platform attribute or property. Wayglass does not reflect those values on its host.

Application-authored error presentation uses `aria-invalid="true"` on the native control and an
explicit description relationship to persistent error text. Native `:invalid` may still trigger the
browser's constraint-validation behavior, but Wayglass styling does not expose pristine fields as
errors merely because they currently fail a constraint.

## Styled-native policy

The v1 implementation preserves the control's native interaction appearance where replacing it would
require Wayglass to recreate platform behavior:

- checkbox checks, radio dots, mixed state, select disclosure, number steppers, range tracks and
  thumbs, high-contrast substitutions, and platform-specific input affordances remain native;
- `accent-color`, `color-scheme`, typography, logical sizing, spacing, surrounding surface, and
  explicit invalid/focus treatment provide theme adaptation;
- themes may substantially change the shell, field surface, text, border, radius, spacing, and
  accent while the underlying semantic and interaction contract remains stable; and
- an appearance-replacing variant is out of scope until supported browser and assistive-technology
  evidence shows that it preserves every accepted state and input method.

Native engine differences are expected where they communicate familiar platform behavior. Pixel
identity across engines is not an acceptance requirement.

## `wg-text-field`

### Purpose and anatomy

`wg-text-field` presents exactly one direct native `<input>` with a text-like type or one direct
`<textarea>`. Accepted input types are `text`, `search`, `email`, `tel`, `url`, and `password`;
omitted `type` means `text`.

Use semantic input types and accurate `autocomplete` tokens even when they do not visibly change the
field. A textarea is the multiline form of this contract; there is no separate Phase 2 component.

### Behavior and states

- The native control owns editing, selection, clipboard behavior, composition, spellcheck, mobile
  keyboard selection, history restoration, autofill, password-manager behavior, and `input` and
  `change` events.
- Native `disabled`, `readonly`, `required`, placeholder, and autofill states remain available.
- `readonly` remains focusable and submittable; it must not be styled as disabled.
- Placeholder text is supplemental and never replaces a persistent label.
- Password reveal, clear buttons, masks, prefix/suffix content, character counts, and suggestion
  popups are not part of this v1 contract. Native engine affordances remain permitted.
- Textareas resize in the block direction by default and cannot cause page-level horizontal
  overflow.

### Example

```html
<wg-form-group>
  <label for="account-email">
    <wg-field-label>
      Email address
      <span slot="requirement">Required</span>
    </wg-field-label>
  </label>
  <wg-text-field>
    <input
      id="account-email"
      name="email"
      type="email"
      autocomplete="email"
      aria-describedby="account-email-help"
      required
    />
  </wg-text-field>
  <wg-field-message id="account-email-help">
    Used for sign-in and account recovery.
  </wg-field-message>
</wg-form-group>
```

## `wg-number-field`

### Purpose and anatomy

`wg-number-field` presents exactly one direct native `<input type="number">`. Use it for a quantity
whose numeric value may be incremented, decremented, constrained, or submitted as a number.

Do not use it for identifiers, postal codes, account numbers, telephone numbers, credit-card
numbers, or other digit strings that are not quantities. Those use a compatible text field with
appropriate `inputmode`, pattern, and autocomplete metadata.

### Behavior and states

- The native control owns numeric parsing, localized entry behavior, `valueAsNumber`, steppers,
  `min`, `max`, `step`, and step mismatch.
- Wayglass does not filter keystrokes, coerce partial input, format on blur, clamp values, or
  replace empty and invalid native editing states with invented numbers.
- Native steppers remain available. An application that needs separate increment and decrement
  commands requires a separate compound contract and must not hide the only native editing route.
- `readonly` remains distinct from disabled and retains native submission behavior.

## `wg-select`

### Purpose and anatomy

`wg-select` presents exactly one direct native `<select>`. Consumer-authored `<option>` and
`<optgroup>` elements remain the source of choices, labels, disabled choices, selected defaults,
submission values, and reset behavior.

### Behavior and states

- The native select owns popup or listbox presentation, typeahead, keyboard navigation, touch
  selection, selection events, and platform accessibility mappings.
- Both ordinary single selection and explicit native `multiple` or `size` listboxes remain usable.
  The shell adapts its containment without pretending that those modes share identical geometry.
- The native disclosure indicator and option popup are not replaced or themed beyond supported
  platform hooks.
- A prompt option may use `value=""`; the application owns whether `required` makes that choice
  invalid. Wayglass does not synthesize placeholder semantics for select.
- Searchable comboboxes, remote options, tokenized multi-select, and custom listbox popups are
  separate patterns and must not be approximated by this shell.

## `wg-checkbox`

### Purpose and anatomy

`wg-checkbox` presents exactly one direct native `<input type="checkbox">` and one explicitly
associated native `<label>`. The input remains the only control. The label supplies the accessible
name and expands the pointer target.

### Behavior and states

- Native `checked`, `defaultChecked`, required, disabled, submission, reset, and `change` behavior
  remain authoritative.
- The native `indeterminate` property is supported as a visual mixed state but is application-owned,
  is not a submitted value, and does not replace the checked value.
- Checked, unchecked, mixed, disabled, invalid, and focused states remain distinguishable without
  relying only on hue.
- A checkbox represents an independent form choice or acknowledgement. Remote operational truth uses
  `wg-toggle`; a mutually exclusive set uses radios.

```html
<wg-form-group>
  <wg-checkbox>
    <input id="account-updates" name="updates" type="checkbox" />
    <label for="account-updates">Send account update email</label>
  </wg-checkbox>
</wg-form-group>
```

## `wg-radio`

### Purpose and anatomy

`wg-radio` presents exactly one direct native `<input type="radio">` and one explicitly associated
native `<label>`. Related radios share their consumer-authored `name` and are grouped by a native
`fieldset` whose first child is a `legend`.

### Behavior and states

- Native checked state, mutual exclusion, arrow-key behavior, focus entry, submission, reset, and
  change events remain authoritative.
- Wayglass does not implement roving focus, selection events, or group registration for radios.
- One radio may be initially checked when the workflow requires a meaningful default. An unselected
  required group retains native constraint behavior.
- Radio groups represent one form value. Local view selection uses tabs or segmented control; remote
  operational changes use the controlled-request model.

## `wg-slider`

### Purpose and anatomy

`wg-slider` presents exactly one direct native `<input type="range">`. Use it when choosing an
approximate value from a bounded numeric range is easier than typing an exact number.

Use `wg-number-field` when exact entry is primary or the range is too broad to manipulate reliably.
Vertical sliders, multiple-thumb ranges, logarithmic scales, and remote operational actuation are
not part of this v1 contract.

### Behavior and states

- The native range input owns value, min/max/step, pointer and keyboard adjustment, orientation,
  focus, events, constraint behavior, and accessibility mappings.
- A persistent visible label is required. The application may provide visible current-value text in
  an explicitly associated output, but Wayglass does not mirror or format the value.
- The native thumb and track remain present in normal and forced-colors modes. The complete
  cross-axis interaction area is at least 44 CSS pixels even when the visual track is thinner.
- Instructions identify units and meaningful endpoints when the raw numeric scale is insufficient.
- Slider edits are local form values. A consequential remote change is submitted or explicitly
  requested separately; moving the thumb does not claim confirmed domain truth.

## Public shell APIs

The six shells expose no value-bearing attributes, custom events, or focus methods. Their v1 public
API consists of:

- a default slot containing the accepted direct native anatomy;
- explicit registration and side-effect-free imports;
- an internal `container` CSS part that does not become a second control; and
- CSS custom properties listed below for field, choice, and slider presentation.

Text field, number field, and select share:

- `--wg-form-control-color-background`;
- `--wg-form-control-color-background-readonly`;
- `--wg-form-control-color-border`;
- `--wg-form-control-color-border-invalid`;
- `--wg-form-control-color-text`;
- `--wg-form-control-color-placeholder`;
- `--wg-form-control-radius`;
- `--wg-form-control-size-minimum`;
- `--wg-form-control-space-block`; and
- `--wg-form-control-space-inline`.

Checkbox and radio share:

- `--wg-form-choice-accent`;
- `--wg-form-choice-gap`;
- `--wg-form-choice-size`; and
- `--wg-form-choice-target`.

Slider exposes:

- `--wg-form-slider-accent`; and
- `--wg-form-slider-size-minimum`.

Native controls and choice labels remain slotted light-DOM nodes, so the shell cannot assign CSS
parts to them. Cross-engine prototyping confirmed that `::slotted()` can deliver the accepted state
and geometry selectors without adding public classes to native nodes.

## Diagnostics and invalid anatomy

Text field, number field, select, and slider diagnose when the number of compatible direct native
controls is not exactly one. Checkbox and radio diagnose their direct native input count, direct
native label count, and explicit label association. These runtime checks do not attempt a complete
accessibility or descendant-interactivity audit. Diagnostics do not repair markup, move nodes,
generate relationships, or disable native behavior.

In production, unsupported children remain visible. The shell must not hide a usable control merely
because anatomy is invalid.

## Validation coverage

The form-control browser suite and Phase 2D-E validation record cover:

- native label activation, fieldset/legend grouping, focus order, events, form data, submission,
  reset, defaults, constraints, and application-authored invalid state;
- ordinary text, textarea, and number editing without shell event translation;
- number parsing and stepping without Wayglass coercion;
- select options, option groups, selection, and native change behavior;
- checkbox label activation, checked and mixed state, submission, and reset behavior;
- radio mutual exclusion, arrow navigation, submission, and reset behavior;
- slider pointer and keyboard adjustment, bounds, step, visible value context, and target size;
- disabled and applicable readonly behavior without treating either as operational condition;
- dark, light, forced colors, reduced motion, 320 CSS-pixel viewport reflow, and supported browser
  engines;
- useful pre-upgrade and failed-upgrade form behavior; and
- typed React wrappers for the six presentation elements while native control props and events stay
  ordinary React APIs.

Open pre-public-release evidence remains VoiceOver/Safari, NVDA/Firefox on Windows, representative
real-profile autofill, and password-manager review.

## Continuing boundaries

- searchable comboboxes, autocomplete popups, tokenized and custom multi-selects;
- date, time, color, file, and other specialized input types;
- input masking, formatting, prefix/suffix actions, password reveal, and clear controls;
- multi-thumb, vertical, logarithmic, or operational sliders;
- schema, cross-field, asynchronous, and server-error management; and
- appearance-replacing checkbox, radio, select, and range variants.
