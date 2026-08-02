import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const fieldMessageKinds = ['help', 'error'] as const;
export type FieldMessageKind = (typeof fieldMessageKinds)[number];

export const wgFieldMessageTagName = 'wg-field-message';

export function isFieldMessageKind(value: unknown): value is FieldMessageKind {
  return typeof value === 'string' && fieldMessageKinds.some((kind) => kind === value);
}

export class WgFieldMessage extends WayglassElement {
  static override properties = {
    kind: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-field-message-color: var(--wg-component-form-color-help);
      --wg-field-message-signal-color: transparent;
      --wg-field-message-space: var(--wg-component-form-space-message);
      --wg-field-message-signal-size: var(--wg-component-form-size-error-signal);

      display: block;
      min-inline-size: 0;
      color: var(--wg-field-message-color);
      font-family: var(--wg-typography-family-body);
      font-size: var(--wg-typography-size-metadata);
      line-height: var(--wg-typography-line-height-body);
    }

    :host([kind='error']) {
      --wg-field-message-color: var(--wg-component-form-color-error);
      --wg-field-message-signal-color: var(--wg-component-form-color-error);
    }

    :host([hidden]) {
      display: none !important;
    }

    [part='message'] {
      display: grid;
      min-inline-size: 0;
      grid-template-columns: var(--wg-field-message-signal-size) minmax(0, 1fr);
      align-items: start;
      gap: var(--wg-field-message-space);
    }

    [part='signal'] {
      align-self: stretch;
      min-block-size: 1lh;
      border-radius: var(--wg-shape-radius-signal);
      background: var(--wg-field-message-signal-color);
    }

    [part='text'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    @media (forced-colors: active) {
      :host {
        color: CanvasText;
      }

      :host([kind='error']) [part='message'] {
        border-inline-start: var(--wg-border-width-strong) solid Mark;
        padding-inline-start: var(--wg-field-message-space);
      }

      [part='signal'] {
        background: transparent;
      }
    }
  `;

  declare kind: FieldMessageKind;

  constructor() {
    super();
    this.kind = 'help';
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'kind' && !isFieldMessageKind(value)) {
      if (value !== 'help') this.setAttribute('kind', 'help');
      return;
    }
    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    return html`<span part="message">
      <span part="signal" aria-hidden="true"></span>
      <span part="text"><slot></slot></span>
    </span>`;
  }
}

export function defineWgFieldMessage(registry: CustomElementRegistry = customElements): void {
  defineElement(wgFieldMessageTagName, WgFieldMessage, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-field-message': WgFieldMessage;
  }
}
