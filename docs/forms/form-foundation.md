# Phase 2D-D form-foundation contracts

**Status:** Accepted and implemented for Phase 2D-D on July 31, 2026. Native control ownership is
accepted in [ADR 0015](../architecture/adr/0015-native-form-control-ownership.md). Explicit
relationship and validation ownership is accepted in
[ADR 0018](../architecture/adr/0018-explicit-form-relationships-and-validation.md). Automated and
visual evidence is recorded in the
[Phase 2D-D validation record](../accessibility/phase-2d-form-foundation-validation.md);
representative screen-reader and autofill acceptance is consolidated with the complete form
composition and carried in the
[Phase 2 ledger](../accessibility/phase-2-assistive-technology-gates.md).

This contract defines the presentation and association substrate around consumer-authored native
form controls. It does not replace the form platform. The text, number, select, checkbox, radio, and
range presentations are owned by the separate form-control contract.

## Goals

The form foundation must:

- preserve native labels, focus, submission, reset, constraint validation, autofill, restoration,
  mobile keyboards, password managers, and ordinary framework events;
- keep useful labels, controls, instructions, and errors in light DOM before upgrade or when
  JavaScript fails;
- give visible label, requirement, help, error, and grouping content a consistent Wayglass hierarchy
  without inventing semantic relationships;
- make invalid state textual and programmatic without relying on color, an icon, or a disappearing
  browser bubble;
- distinguish required, disabled, read-only, invalid, pending server work, and rejected submission;
- let an application choose appropriate validation timing without a component guessing whether a
  field is touched or a form has been submitted; and
- remain compatible with the native-control presentations and typed framework bindings.

## Non-goals

The form foundation does not provide:

- a schema, form controller, state store, data binding, serializer, or server-error mapper;
- a form-associated custom element or a Shadow DOM proxy for a native control;
- automatic ID generation or mutation of `for`, `aria-describedby`, `aria-errormessage`,
  `aria-invalid`, `required`, `disabled`, or `readonly`;
- automatic validation on input, blur, or submission;
- an error summary, toast, confirmation flow, or asynchronous request protocol;
- branded text, number, select, checkbox, radio, or range-control anatomy; or
- a submit/reset mode on `wg-button`.

## Shared ownership

Consumer-authored native HTML owns truth and interaction:

- `<form>` owns submission and reset;
- `<label>` owns an individual control's native label relationship;
- `<fieldset>` and its first `<legend>` own a related-control group;
- `<input>`, `<select>`, and `<textarea>` own value, focus, native events, constraints, form
  association, autofill, and restoration;
- native `<button type="submit">` and `<button type="reset">` own submitter and reset behavior;
- application code owns domain validation, validation timing, server responses, and focus after a
  rejected submission; and
- the author owns explicit IDs and every accessible description or error relationship.

Wayglass form-foundation elements are inert presentation helpers. They do not add form-control,
label, group, alert, or status roles. They do not become successful controls and do not intercept
keyboard, input, change, invalid, submit, formdata, or reset events.

## Canonical single-field composition

```html
<wg-form-group>
  <label for="profile-email">
    <wg-field-label>
      Email address
      <span slot="requirement">Required</span>
    </wg-field-label>
  </label>

  <input
    id="profile-email"
    name="email"
    type="email"
    autocomplete="email"
    required
    aria-describedby="profile-email-help"
  />

  <wg-field-message id="profile-email-help" kind="help">
    Used for account notices. We will not publish it.
  </wg-field-message>
</wg-form-group>
```

The visible `Required` term reinforces the native `required` attribute; it does not create it. A
form may instead explain once that every field is required unless marked optional, provided the rule
is visible and unambiguous.

## Canonical invalid-field composition

```html
<wg-form-group>
  <label for="profile-email">
    <wg-field-label>
      Email address
      <span slot="requirement">Required</span>
    </wg-field-label>
  </label>

  <input
    id="profile-email"
    name="email"
    type="email"
    value="matt@example"
    required
    aria-invalid="true"
    aria-describedby="profile-email-help profile-email-error"
  />

  <wg-field-message id="profile-email-help" kind="help">
    Used for account notices. We will not publish it.
  </wg-field-message>
  <wg-field-message id="profile-email-error" kind="error">
    Enter a complete email address, such as name@example.com.
  </wg-field-message>
</wg-form-group>
```

The error identifies what is wrong and, when known, how to correct it. Existing help remains
available unless it has become irrelevant. `aria-errormessage="profile-email-error"` may reinforce
the error relationship after the supported assistive-technology matrix confirms it, but it must not
be the only relationship in the v1 contract; the error remains in `aria-describedby`.

## Related-control group composition

```html
<wg-form-group>
  <fieldset aria-describedby="contact-method-help">
    <legend>
      <wg-field-label>
        Preferred contact method
        <span slot="requirement">Required</span>
      </wg-field-label>
    </legend>

    <label><input type="radio" name="contact" value="email" required /> Email</label>
    <label><input type="radio" name="contact" value="phone" /> Phone</label>
  </fieldset>

  <wg-field-message id="contact-method-help" kind="help">
    Choose the route you check most often.
  </wg-field-message>
</wg-form-group>
```

`wg-form-group` does not replace `fieldset` or `legend`. A collection that is only visually related
must not receive group semantics merely because it uses the wrapper.

## `wg-field-label`

### Purpose and semantics

`wg-field-label` gives visible label or legend content a stable typographic hierarchy. It is placed
inside a consumer-authored native `<label>` or `<legend>` and adds no role or click behavior of its
own.

It must not be used as a substitute for a native label, as a placeholder, or as the only indicator
that a field is required.

### Slots

- default: required visible label text;
- `requirement`: optional visible `Required` or `Optional` text; and
- `detail`: optional concise qualifier that belongs with the visible label.

### API

The element has no state attributes, methods, or events. In particular, it does not expose `for`,
`required`, `disabled`, or `readonly`, because it cannot own those native relationships or states.

CSS parts:

- `label`;
- `text`;
- `requirement`; and
- `detail`.

CSS custom properties:

- `--wg-field-label-color`;
- `--wg-field-label-requirement-color`;
- `--wg-field-label-detail-color`; and
- `--wg-field-label-space`.

## `wg-field-message`

### Purpose and semantics

`wg-field-message` presents persistent help or a current textual error. Its light-DOM host may be
the target of `aria-describedby` and, when additionally supported, `aria-errormessage`.

The element adds no live-region role. A message already present when a control receives focus is
available through its explicit description relationship. If an application inserts or changes an
error while focus remains in the field, the application may deliberately use `role="status"` or
`role="alert"` on an appropriate light-DOM message or summary after testing for duplicate
announcements.

### Attributes and properties

- `kind: 'help' | 'error'`; default `help`.

`kind="error"` changes presentation only. It does not set `aria-invalid`, validate a control, show
or hide itself, or announce automatically. The application renders an error only when its chosen
validation policy says that error is current. Missing or unsupported `kind` values normalize to
`help`.

### Slots and API

- default: required visible message text.

The element has no methods or events.

CSS parts:

- `message`;
- `signal`; and
- `text`.

CSS custom properties:

- `--wg-field-message-color`;
- `--wg-field-message-signal-color`;
- `--wg-field-message-space`; and
- `--wg-field-message-signal-size`.

The error signal must remain recognizable in forced colors and grayscale and without an icon. It
uses condition-critical treatment because the message describes an actual input error; help remains
neutral and must not borrow condition color.

## `wg-form-group`

### Purpose and semantics

`wg-form-group` arranges one field or one consumer-authored semantic group as a coherent visual
unit. It keeps label, control, help, and error content local while separating neighboring fields.

The host is non-focusable and has no implicit role. It does not generate a label, group, region, or
error relationship. A semantic set of controls uses a native `<fieldset>` and first `<legend>`
inside the wrapper.

### Accepted content

The default slot accepts either:

- one native label, one compatible native control, and associated `wg-field-message` elements; or
- one native `fieldset` with its first `legend`, plus messages related to that fieldset or its
  controls.

Compatible control anatomy is defined by the separate form-control contract. Multiple ungrouped
controls, missing native labels, duplicate IDs, and unresolved authored ID references remain
authoring errors. The inert wrapper does not validate or repair them by generating or rewriting
markup.

### API

The element has no state attributes, methods, or events. Native state stays on the native control or
fieldset.

CSS parts:

- `group`.

CSS custom properties:

- `--wg-form-group-space`.

## Native submit and reset actions

Form submission and reset use native buttons:

```css
@import '@wayglass/elements/forms.css';
```

```html
<button class="wg-form-action" type="submit">Save profile</button>
<button class="wg-form-action wg-form-action--quiet" type="reset">Reset changes</button>
```

The `forms.css` entry provides a public `wg-form-action` class rather than a Custom Element proxy.
The native button remains the submitter, retains `name` and `value`, participates in constraint
validation, and works before JavaScript. The class provides ordinary Wayglass button presentation
and focus treatment; `wg-form-action--quiet` is the only v1 modifier. Consequential submit labels
name the outcome, not merely “Submit.”

`wg-button` remains an immediate `type="button"` command and must not be used to simulate submit or
reset by forwarding a click or calling `requestSubmit()`.

## Validation and lifecycle contract

### Initial and editing state

Native constraints may make a pristine required field match `:invalid` immediately. Wayglass does
not equate that platform state with an error that should already be shown. Initial help and
requirements are visible; error messages appear only after the application intentionally validates.

Applications choose timing appropriate to risk and task. The recommended baseline is:

1. do not report an error before the person has had a reasonable opportunity to enter a value;
2. validate on a submission attempt;
3. after a submission attempt exposes an error, update that field's error while it is corrected,
   using input or change behavior appropriate to the native control; and
4. use blur-time validation only when leaving the field provides useful, non-disruptive feedback.

Wayglass primitives do not store `touched`, `dirty`, `submitted`, or `validating` state.

### Submission

The wrappers do not prevent or synthesize submission. Native constraint validation fires first.
Application and server validation remain additive and must not be treated as a security boundary.

When submission fails with one or more visible errors, the application:

- retains the person's entered values unless security or correctness requires otherwise;
- renders persistent textual errors beside their fields;
- sets `aria-invalid="true"` only on controls with a current error;
- keeps every error explicitly described by its control;
- moves focus to an error summary when one exists and materially helps, otherwise to the first
  invalid control; and
- never relies only on a toast, color, icon, or transient native validation bubble.

An asynchronous pending submission is form-level activity, not field invalidity. Disabling an entire
form during submission is not a default; it can remove navigation and correction routes. Persistent,
transient, and modal feedback remain owned by their separate feedback contracts.

### Reset

A native reset restores each control's native default state. It does not automatically clear
application-owned server errors, touched/submitted flags, or messages. Applications listening for
reset clear or recompute those states deliberately. Wayglass wrappers neither intercept reset nor
emit a duplicate event.

### Disabled, read-only, and required

- `disabled` belongs on the native control or native `fieldset`. Disabled controls are generally not
  focusable and are not successful form controls; it must not be used merely to express pending
  work.
- `readonly` belongs only on native controls that support it. Read-only content remains focusable
  and submittable and must not be styled or announced as disabled.
- `required` belongs on the native control. A visible word or consistently explained convention
  reinforces it; an asterisk or color alone is insufficient.
- `aria-disabled` and `aria-required` do not replace native `disabled` and `required` where native
  attributes apply.

## Client-only and failure behavior

The native form remains labeled, operable, submittable, resettable, and validatable without Custom
Element upgrade. Form-foundation elements render their light-DOM text before upgrade. No semantic or
form behavior depends on registration.

Registration does not validate or rewrite consumer form structure. Authoring diagnostics supplied by
application tooling must not hide, clone, move, disable, relabel, or otherwise repair native
controls.

## Responsive, theme, and localization requirements

- Source order remains label, control, help, then current error.
- At narrow widths and 400% zoom, fields stack without page overflow and messages wrap without
  clipping.
- Inline field arrangements are opt-in compositions and return to a stack when their container is
  too narrow; semantic order never changes.
- Native target sizes remain at least 44 by 44 CSS pixels where the control is directly actionable.
- Focus, invalid, disabled, and read-only presentation remains distinct in dark, light, forced
  colors, reduced motion, and grayscale.
- Requirement and error text must survive longer translations and bidirectional content.
- Error identification never depends on motion.

## Token roles

The accepted implementation defines semantic aliases for:

- field stack and internal spacing;
- label, requirement, help, and error text;
- native control surface, text, border, hover, focus, disabled, and read-only presentation;
- invalid border and error signal;
- control radius and minimum block size; and
- native form-action surface, text, border, radius, and minimum size.

Condition-critical color is limited to a current error. Required, disabled, read-only, focus, and
ordinary help are not conditions and must use neutral or platform-semantic treatment.

## Validation coverage

The form-foundation browser suite and Phase 2D-D validation record cover:

- useful pre-upgrade native form behavior and side-effect-free module imports;
- exact preservation of native label, fieldset, submission, reset, formdata, constraint,
  autocomplete, and event ownership;
- no duplicate focusable nodes or form-control roles;
- explicit help and error relationships that survive light DOM and framework rendering;
- persistent, textual, non-color-only error presentation;
- correct required, disabled, read-only, invalid, reset, and server-error examples;
- native submitter identity, including `SubmitEvent.submitter`, `name`, and `value`;
- dark, light, forced-colors, reduced-motion, and 320 CSS-pixel viewport review;
- native label activation, constraint validation, submission, reset, and supported-engine tests;
- Axe plus representative VoiceOver/Safari review; NVDA/Firefox remains an open pre-public-release
  evidence item; and
- typed React wrappers for the three presentation elements while native control props and events
  stay ordinary React APIs.

## Continuing boundaries

- Each native-control presentation and its accepted anatomy remain owned by the form-control
  contract.
- Error-summary and asynchronous submission-feedback patterns remain outside these inert wrappers
  and use application-owned validation plus the appropriate feedback contracts.
- Cross-field, remote, and schema validation remain application or form-library concerns.
- Form-associated Custom Elements remain deferred under ADR 0015.
- Automatic ID allocation and relationship mutation remain outside the v1 architecture.
