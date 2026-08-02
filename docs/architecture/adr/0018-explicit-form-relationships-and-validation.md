# ADR 0018: Keep form relationships explicit and validation policy application-owned

- Status: accepted
- Date: 2026-07-31

## Context

ADR 0015 keeps successful native controls in light DOM, but Phase 2D-D still needs to decide how
Wayglass presentation helpers relate labels, help, errors, native groups, submission, and reset.

A wrapper could inspect descendants, generate IDs, mutate label and ARIA references, infer validity
from `ValidityState`, listen for input and invalid events, and decide when errors become visible.
That convenience would make a presentation component the hidden owner of relationships and
validation state that are otherwise explicit in native markup and application logic.

That ownership is unreliable and incomplete:

- a pristine required native control can be invalid before the person has interacted with it;
- domain and server validation do not necessarily map to native constraints;
- `invalid` does not bubble and can also result from programmatic validity checks;
- native reset restores control defaults but cannot reset application-owned touched, submitted, or
  server-error state;
- generated IDs and rewritten relationships complicate server rendering, hydration, repeated
  components, testing, and framework ownership; and
- automatic live regions can duplicate announcements when focus also moves to an invalid control.

Native HTML provides label, fieldset/legend, form, submitter, reset, and constraint-validation
semantics. WCAG 2.2 requires visible labels or instructions and textual identification and
suggestions for detected errors, but it does not mandate one validation schedule or one error
presentation. Native validation bubbles can assist, but persistent application-authored errors are
more adaptable to zoom, multiple simultaneous errors, localization, and domain-specific guidance.

References:

- [HTML forms and native validation](https://html.spec.whatwg.org/multipage/forms.html)
- [HTML constraint-validation model](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraint-validation)
- [WAI form labeling guidance](https://www.w3.org/WAI/tutorials/forms/labels/)
- [WAI form grouping guidance](https://www.w3.org/WAI/tutorials/forms/grouping/)
- [WCAG 2.2 error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [WCAG 2.2 labels or instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)

## Decision

Keep every required form relationship consumer-authored and visible in light DOM.

- Native `<label>` and `for` own individual-control labeling.
- Native `<fieldset>` and its first `<legend>` own related-control grouping.
- Authored IDs plus `aria-describedby` own help and initial error descriptions.
- `aria-invalid="true"` appears only when application policy has exposed a current error.
- `aria-errormessage` may reinforce, but does not replace, `aria-describedby` until the supported
  assistive-technology matrix proves it reliable.

`wg-field-label`, `wg-field-message`, and `wg-form-group` remain inert presentation elements. They
do not generate IDs, inspect or rewrite semantic references, infer touched/submitted state, validate
controls, toggle messages, or install automatic live regions. They may report authoring diagnostics
without repairing markup.

Validation timing and domain validation remain application-owned. The recommended baseline is
submission-first: avoid errors before a reasonable opportunity for input, expose all current errors
on a submission attempt, and then update exposed fields while the person corrects them. Applications
may choose blur or earlier validation when task risk and user benefit justify it.

Submission and reset remain native. Wayglass provides a public `wg-form-action` CSS class for native
submit and reset buttons instead of extending or proxying `wg-button`. The wrappers do not prevent,
synthesize, or translate native input, change, invalid, submit, formdata, or reset events.

When application-authored validation rejects submission, errors remain persistent text near their
controls and explicitly described by them. Focus moves deliberately to a useful error summary or the
first invalid control. Live announcement is opt-in and context-specific to avoid duplicates.

## Consequences

The complete form contract remains inspectable in HTML, compatible with server rendering, and usable
before Custom Element upgrade. Native labels retain their expanded click target. Form libraries and
frameworks keep ownership of their ordinary control props, events, validation state, and IDs.

Consumers write more explicit markup and must coordinate `aria-invalid`, descriptions, error
visibility, and application state. Wayglass documentation and diagnostics must make that wiring easy
to verify. Typed wrappers cannot promise relationships that their native siblings do not actually
contain.

The default avoids premature errors and noisy announcements without imposing one workflow on every
form. Applications with higher-risk or specialized validation can choose stricter timing while
retaining the same presentational primitives.

A public native-button class adds a small global CSS surface. It is preferable to a proxy because
the native element remains the real submitter and resetter. Specific native-control presentation
classes and components remain a Phase 2D-E decision.

## Alternatives considered

- **Generate IDs and wire relationships automatically:** rejected because ownership becomes hidden,
  hydration and framework coordination become fragile, and no wrapper can infer every intended
  description or group.
- **Infer errors directly from `:invalid` or `ValidityState`:** rejected because pristine required
  fields can appear erroneous and domain/server validation is outside native validity.
- **Validate automatically on blur:** rejected as a universal rule because validation timing depends
  on task, risk, control type, and whether partial input can be meaningfully assessed.
- **Always use `role="alert"` for errors:** rejected because focus changes and description updates
  can already announce the same content, producing disruptive duplication.
- **Use only `aria-errormessage`:** deferred as the sole association until representative supported
  assistive technology demonstrates dependable output.
- **Put group semantics on `wg-form-group`:** rejected because visual grouping does not imply a
  related-control group and native fieldset/legend provides stronger built-in behavior.
- **Add submit and reset modes to `wg-button`:** rejected under ADR 0015 because forwarding behavior
  does not make its host or internal button the external form's complete native submitter.
