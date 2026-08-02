import { css } from 'lit';

export const fieldShellStyles = css`
  :host {
    --wg-form-control-color-background: var(--wg-component-form-color-control-background);
    --wg-form-control-color-background-readonly: var(
      --wg-component-form-color-control-background-readonly
    );
    --wg-form-control-color-border: var(--wg-component-form-color-control-border);
    --wg-form-control-color-border-invalid: var(--wg-component-form-color-control-border-invalid);
    --wg-form-control-color-text: var(--wg-component-form-color-control-text);
    --wg-form-control-color-placeholder: var(--wg-component-form-color-control-placeholder);
    --wg-form-control-radius: var(--wg-component-form-radius-control);
    --wg-form-control-size-minimum: var(--wg-component-form-size-control-minimum);
    --wg-form-control-space-block: var(--wg-component-form-space-control-block);
    --wg-form-control-space-inline: var(--wg-component-form-space-control-inline);

    display: block;
    min-inline-size: 0;
    color: var(--wg-color-semantic-text-primary);
    font-family: var(--wg-typography-family-body);
  }

  [part='container'] {
    display: block;
    min-inline-size: 0;
  }

  ::slotted(input),
  ::slotted(textarea),
  ::slotted(select) {
    display: block;
    inline-size: 100%;
    min-inline-size: 0;
    min-block-size: var(--wg-form-control-size-minimum);
    box-sizing: border-box;
    padding-block: var(--wg-form-control-space-block);
    padding-inline: var(--wg-form-control-space-inline);
    border: var(--wg-border-width-standard) solid var(--wg-form-control-color-border);
    border-radius: var(--wg-form-control-radius);
    color: var(--wg-form-control-color-text);
    background-color: var(--wg-form-control-color-background);
    font: inherit;
    line-height: var(--wg-typography-line-height-body);
  }

  ::slotted(input::placeholder),
  ::slotted(textarea::placeholder) {
    color: var(--wg-form-control-color-placeholder);
    opacity: 1;
  }

  ::slotted(input:read-only),
  ::slotted(textarea:read-only) {
    background-color: var(--wg-form-control-color-background-readonly);
  }

  ::slotted(input[aria-invalid='true']),
  ::slotted(textarea[aria-invalid='true']),
  ::slotted(select[aria-invalid='true']) {
    border-color: var(--wg-form-control-color-border-invalid);
    box-shadow: inset var(--wg-component-form-size-error-signal) 0 0
      var(--wg-form-control-color-border-invalid);
  }

  ::slotted(input:focus-visible),
  ::slotted(textarea:focus-visible),
  ::slotted(select:focus-visible) {
    outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
    outline-offset: var(--wg-focus-offset);
  }

  ::slotted(input:disabled),
  ::slotted(textarea:disabled),
  ::slotted(select:disabled) {
    cursor: not-allowed;
    opacity: var(--wg-opacity-disabled);
  }

  @media (forced-colors: active) {
    ::slotted(input),
    ::slotted(textarea),
    ::slotted(select) {
      border-color: FieldText;
      color: FieldText;
      background: Field;
      forced-color-adjust: auto;
    }

    ::slotted(input[aria-invalid='true']),
    ::slotted(textarea[aria-invalid='true']),
    ::slotted(select[aria-invalid='true']) {
      border-color: Mark;
      box-shadow: inset var(--wg-component-form-size-error-signal) 0 0 Mark;
    }

    ::slotted(input:focus-visible),
    ::slotted(textarea:focus-visible),
    ::slotted(select:focus-visible) {
      outline-color: Highlight;
    }
  }
`;

export const choiceShellStyles = css`
  :host {
    --wg-form-choice-accent: var(--wg-component-form-color-control-accent);
    --wg-form-choice-gap: var(--wg-component-form-space-choice);
    --wg-form-choice-size: var(--wg-component-form-size-choice);
    --wg-form-choice-target: var(--wg-component-form-size-control-minimum);

    display: block;
    min-inline-size: 0;
    color: var(--wg-color-semantic-text-primary);
    font-family: var(--wg-typography-family-body);
  }

  [part='container'] {
    position: relative;
    min-inline-size: 0;
    min-block-size: var(--wg-form-choice-target);
  }

  ::slotted(input) {
    position: absolute;
    z-index: 1;
    inset-block-start: calc((var(--wg-form-choice-target) - var(--wg-form-choice-size)) / 2);
    inset-inline-start: 0;
    inline-size: var(--wg-form-choice-size);
    block-size: var(--wg-form-choice-size);
    margin: 0;
    accent-color: var(--wg-form-choice-accent);
  }

  ::slotted(label) {
    display: flex;
    min-inline-size: 0;
    min-block-size: var(--wg-form-choice-target);
    box-sizing: border-box;
    align-items: center;
    padding-inline-start: calc(var(--wg-form-choice-size) + var(--wg-form-choice-gap));
    overflow-wrap: anywhere;
    cursor: pointer;
  }

  ::slotted(input:focus-visible) {
    outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
    outline-offset: var(--wg-focus-offset);
  }

  ::slotted(input:disabled) {
    cursor: not-allowed;
    opacity: var(--wg-opacity-disabled);
  }

  :host(:has(> input:disabled)) ::slotted(label) {
    cursor: not-allowed;
    opacity: var(--wg-opacity-disabled);
  }

  ::slotted(input[aria-invalid='true']) {
    outline: var(--wg-border-width-strong) solid
      var(--wg-component-form-color-control-border-invalid);
    outline-offset: var(--wg-focus-offset);
  }

  ::slotted(input[aria-invalid='true']:focus-visible) {
    outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
  }

  @media (forced-colors: active) {
    ::slotted(input) {
      forced-color-adjust: auto;
    }

    ::slotted(input:focus-visible) {
      outline-color: Highlight;
    }

    ::slotted(input[aria-invalid='true']) {
      outline-color: Mark;
    }
  }
`;

export const sliderShellStyles = css`
  :host {
    --wg-form-slider-accent: var(--wg-component-form-color-control-accent);
    --wg-form-slider-size-minimum: var(--wg-component-form-size-control-minimum);

    display: block;
    min-inline-size: 0;
    color: var(--wg-color-semantic-text-primary);
    font-family: var(--wg-typography-family-body);
  }

  [part='container'] {
    display: block;
    min-inline-size: 0;
  }

  ::slotted(input) {
    display: block;
    inline-size: 100%;
    min-inline-size: 0;
    min-block-size: var(--wg-form-slider-size-minimum);
    margin: 0;
    accent-color: var(--wg-form-slider-accent);
  }

  ::slotted(input:focus-visible) {
    outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
    outline-offset: var(--wg-focus-offset);
  }

  ::slotted(input:disabled) {
    cursor: not-allowed;
    opacity: var(--wg-opacity-disabled);
  }

  ::slotted(input[aria-invalid='true']) {
    outline: var(--wg-border-width-strong) solid
      var(--wg-component-form-color-control-border-invalid);
    outline-offset: var(--wg-focus-offset);
  }

  ::slotted(input[aria-invalid='true']:focus-visible) {
    outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
  }

  @media (forced-colors: active) {
    ::slotted(input) {
      forced-color-adjust: auto;
    }

    ::slotted(input:focus-visible) {
      outline-color: Highlight;
    }

    ::slotted(input[aria-invalid='true']) {
      outline-color: Mark;
    }
  }
`;
