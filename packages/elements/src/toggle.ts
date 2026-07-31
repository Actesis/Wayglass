import { isBooleanRequest, isControlAvailability, isRequestState } from '@wayglass/core';
import type { BooleanRequest, ControlAvailability, RequestState } from '@wayglass/core';
import { css, html, nothing } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export type ToggleRequestTrigger = 'keyboard' | 'pointer';
export interface WgToggleRequestDetail {
  readonly requestedAsserted: boolean;
  readonly confirmedAsserted: boolean;
  readonly trigger: ToggleRequestTrigger;
}

export const wgToggleTagName = 'wg-toggle';

export class WgToggle extends WayglassElement {
  static override properties = {
    label: { type: String },
    asserted: { type: Boolean, reflect: true },
    assertedLabel: { type: String, attribute: 'asserted-label' },
    notAssertedLabel: { type: String, attribute: 'not-asserted-label' },
    requested: { type: String, reflect: true },
    requestState: { type: String, reflect: true, attribute: 'request-state' },
    availability: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-toggle-color-background: var(--wg-component-toggle-color-background);
      --wg-toggle-color-border: var(--wg-component-toggle-color-border);
      --wg-toggle-color-text: var(--wg-component-toggle-color-text);
      --wg-toggle-color-asserted: var(--wg-component-toggle-color-asserted);
      --wg-toggle-color-not-asserted: var(--wg-component-toggle-color-not-asserted);
      --wg-toggle-radius: var(--wg-component-toggle-radius);
      --wg-toggle-size-signal: var(--wg-component-toggle-size-signal);
      --wg-toggle-space: var(--wg-component-toggle-space);
      display: block;
      color: var(--wg-toggle-color-text);
      font-family: var(--wg-typography-family-body);
    }

    [part='button'] {
      display: grid;
      grid-template-columns: var(--wg-toggle-size-signal) minmax(0, 1fr) auto;
      align-items: center;
      inline-size: 100%;
      min-block-size: var(--wg-size-touch-minimum);
      box-sizing: border-box;
      gap: var(--wg-toggle-space);
      padding: var(--wg-toggle-space);
      border: var(--wg-border-width-standard) solid var(--wg-toggle-color-border);
      border-radius: var(--wg-toggle-radius);
      color: inherit;
      background: var(--wg-toggle-color-background);
      font: inherit;
      text-align: start;
      cursor: pointer;
    }

    [part='button']:focus-visible {
      outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
      outline-offset: var(--wg-focus-offset);
    }

    [part='button'][aria-disabled='true'],
    [part='button']:disabled {
      cursor: not-allowed;
    }

    [part='signal'] {
      inline-size: var(--wg-toggle-size-signal);
      block-size: calc(var(--wg-toggle-size-signal) * 0.42);
      box-sizing: border-box;
      border: var(--wg-border-width-standard) solid var(--wg-toggle-color-not-asserted);
      border-radius: var(--wg-shape-radius-signal);
      background: transparent;
      box-shadow: inset 0 0 0 var(--wg-border-width-standard) var(--wg-toggle-color-background);
    }

    :host([asserted]) [part='signal'] {
      border-color: var(--wg-toggle-color-asserted);
      background: var(--wg-toggle-color-asserted);
    }

    [part='label'] {
      display: grid;
      gap: var(--wg-space-reference-1);
      min-inline-size: 0;
      font-weight: var(--wg-typography-weight-medium);
    }

    [part='detail'],
    [part='feedback'],
    [part='request'] {
      color: var(--wg-color-semantic-text-secondary);
      font-size: var(--wg-typography-size-metadata);
      font-weight: var(--wg-typography-weight-regular);
    }

    [part='confirmed-value'] {
      font-weight: var(--wg-typography-weight-medium);
    }

    [part='request'],
    [part='feedback'] {
      grid-column: 2 / -1;
    }

    [hidden] {
      display: none;
    }

    @media (forced-colors: active) {
      [part='button'] {
        border-color: ButtonText;
        color: ButtonText;
        background: ButtonFace;
      }
      :host([asserted]) [part='signal'] {
        background: Highlight;
      }
    }
  `;

  declare label: string;
  declare asserted: boolean;
  declare assertedLabel: string;
  declare notAssertedLabel: string;
  declare requested: BooleanRequest;
  declare requestState: RequestState;
  declare availability: ControlAvailability;
  declare disabled: boolean;

  constructor() {
    super();
    this.label = '';
    this.asserted = false;
    this.assertedLabel = '';
    this.notAssertedLabel = '';
    this.requested = 'none';
    this.requestState = 'idle';
    this.availability = 'available';
    this.disabled = false;
  }

  override attributeChangedCallback(name: string, oldValue: string | null, value: string | null) {
    const fallback =
      name === 'requested'
        ? !isBooleanRequest(value) && 'none'
        : name === 'request-state'
          ? !isRequestState(value) && 'idle'
          : name === 'availability'
            ? !isControlAvailability(value) && 'available'
            : false;
    if (fallback) {
      if (value !== fallback) this.setAttribute(name, fallback);
      return;
    }
    super.attributeChangedCallback(name, oldValue, value);
  }

  override focus(options?: FocusOptions): void {
    this.#button?.focus(options);
  }

  override click(): void {
    if (this.#allowsRequest) this.#button?.click();
  }

  protected override render() {
    const unavailable = this.availability === 'unavailable';
    const pending = this.requestState === 'pending' && this.requested !== 'none';
    const requestedLabel =
      this.requested === 'asserted'
        ? this.assertedLabel
        : this.requested === 'not-asserted'
          ? this.notAssertedLabel
          : '';
    return html`<button
      part="button"
      type="button"
      role="switch"
      aria-label=${this.label}
      aria-checked=${String(this.asserted)}
      aria-disabled=${pending || unavailable ? 'true' : nothing}
      aria-busy=${pending ? 'true' : nothing}
      ?disabled=${this.disabled}
      @click=${this.#handleClick}
    >
      <span part="signal" aria-hidden="true"></span>
      <span part="label">
        <slot name="label">${this.label}</slot>
        <span part="detail"><slot name="detail"></slot></span>
      </span>
      <span part="confirmed-value"
        >${this.asserted ? this.assertedLabel : this.notAssertedLabel}</span
      >
      <span part="request" ?hidden=${this.requested === 'none'}>
        ${this.requestState === 'rejected' ? 'Not changed' : 'Requested'}: ${requestedLabel}
      </span>
      <span part="feedback"><slot name="feedback"></slot></span>
    </button>`;
  }

  get #button(): HTMLButtonElement | null {
    return this.renderRoot.querySelector('button');
  }

  get #allowsRequest(): boolean {
    return !this.disabled && this.availability === 'available' && this.requestState !== 'pending';
  }

  readonly #handleClick = (event: MouseEvent): void => {
    if (!this.#allowsRequest) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.dispatchEvent(
      new CustomEvent<WgToggleRequestDetail>('wg-toggle-request', {
        bubbles: true,
        composed: true,
        detail: {
          requestedAsserted: !this.asserted,
          confirmedAsserted: this.asserted,
          trigger: event.detail === 0 ? 'keyboard' : 'pointer',
        },
      }),
    );
  };
}

export function defineWgToggle(registry: CustomElementRegistry = customElements): void {
  defineElement(wgToggleTagName, WgToggle, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-toggle': WgToggle;
  }
}
