# ADR 0015: Keep form controls consumer-authored and native in light DOM

- Status: accepted
- Date: 2026-07-31

## Context

Phase 2D must provide branded text, number, select, checkbox, radio, and slider presentations while
preserving form ownership, labels, submission, reset, constraint validation, input methods,
selection APIs, autofill, password managers, browser restoration, and assistive technology.

The HTML Standard defines form-associated custom elements through `ElementInternals`, including
submission values, validity, labels, and form lifecycle callbacks. Current engines implement the
foundation. Interoperability is not complete enough to justify replacing native controls: WebKit
still tracks an unresolved accessibility defect where labels associated with form-associated custom
elements are not announced by VoiceOver.

An internal native input inside Shadow DOM does not become a successful control of an external form
merely because it is visually inside a Custom Element. Reproducing the platform through mirrored
attributes and `ElementInternals` would also make Wayglass responsible for a large and changing set
of input-type, autofill, validation, restoration, and accessibility behavior.

References:

- [HTML Standard: creating a form-associated custom element](https://html.spec.whatwg.org/dev/custom-elements.html#creating-a-form-associated-custom-element)
- [WebKit: ElementInternals and form-associated custom elements](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/)
- [WebKit bug 259124: associated labels are not read by VoiceOver](https://bugs.webkit.org/show_bug.cgi?id=259124)

## Decision

The initial Wayglass form architecture keeps the successful native form control consumer-authored in
light DOM. Phase 2D field components provide presentation, layout, state styling, guidance, and
diagnostics around exactly one compatible native `input`, `select`, or other accepted control. They
do not copy the native control API onto Custom Element attributes and do not mirror a Shadow DOM
input into a form value.

Native markup owns:

- `name`, `value`, `checked`, `type`, `required`, `disabled`, `readonly`, `min`, `max`, `step`, and
  pattern constraints;
- form association, submission, reset, and constraint validation;
- `autocomplete`, `inputmode`, `enterkeyhint`, selection, and native input/change events;
- explicit native `label` association and described-by/error relationships;
- browser autofill, password-manager, history-restoration, and mobile-keyboard behavior.

Wayglass wrappers own only accepted presentation and composition. They remain non-focusable and add
no duplicate form-control role. Native content stays usable before upgrade. Invalid child anatomy
may produce a development diagnostic but must not replace, clone, or hide the native control in
production.

`wg-field-label` will not pretend that an autonomous Custom Element is a native `label`. Its Phase
2D-D contract must compose with consumer-authored `<label>` markup. `wg-field-message` and
`wg-form-group` similarly enhance presentation without inventing label, description, or group
relationships that cannot be inspected in native markup.

The existing `wg-button` remains an immediate command with an internal native
`<button type="button">`. It will not gain submit or reset behavior through a partial proxy. Form
submission and reset use consumer-authored native buttons with Wayglass presentation. The Phase 2D-D
contract will decide whether that presentation is a public class, a light-DOM wrapper, or both,
without changing `wg-button`'s command semantics.

Wayglass may reconsider form-associated custom elements after the supported browser and
assistive-technology matrix demonstrates reliable labels, submission, reset, validation, autofill,
and restoration. The light-DOM architecture does not prevent a future opt-in component, but no
initial API depends on it.

## Consequences

Applications retain the full native form platform and ordinary framework event handling. Server
rendering and failed upgrades preserve useful, submittable form markup. Accessibility relationships
remain visible in the same document tree.

Consumers author more native markup than they would with a monolithic `wg-text-field` API. Typed
React wrappers type the Wayglass presentation shell but native input props remain ordinary React
props. Wayglass must document accepted child anatomy and provide precise examples.

Shadow DOM styling of slotted controls is intentionally limited. The implementation may use
`::slotted`, public classes, CSS custom properties, and light-DOM state selectors. It must not move
the native control into Shadow DOM or require JavaScript for basic form correctness.

Because `wg-button` stays command-only, form submit and reset presentation must be specified
explicitly rather than inferred from its current API.

## Alternatives considered

- **Form-associated custom elements for every field:** deferred because the platform model is
  appropriate but supported assistive-technology interoperability remains insufficient for the
  initial contract.
- **Shadow DOM native controls with mirrored attributes:** rejected because the internal control is
  not the external form's successful control and API mirroring would be incomplete.
- **Hidden light-DOM proxy inputs:** rejected because duplicated value, validity, focus, autofill,
  reset, and event state can diverge.
- **Customized built-in elements:** rejected because Wayglass requires dependable autonomous Custom
  Element and framework behavior across supported browsers.
- **Extend `wg-button` with `type="submit"` by calling `requestSubmit()`:** rejected because a proxy
  call does not make the Custom Element a native submitter with complete name, value, validation,
  and submitter semantics.
