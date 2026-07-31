import { css, html, nothing } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const iconButtonAppearances = ['quiet', 'secondary'] as const;
export type IconButtonAppearance = (typeof iconButtonAppearances)[number];
export const wgIconButtonTagName = 'wg-icon-button';

export function isIconButtonAppearance(value: unknown): value is IconButtonAppearance {
  return (
    typeof value === 'string' && iconButtonAppearances.some((appearance) => appearance === value)
  );
}

export class WgIconButton extends WayglassElement {
  static override properties = {
    label: { type: String },
    appearance: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    pending: { type: Boolean, reflect: true },
    pendingLabel: { type: String, attribute: 'pending-label' },
  };

  static override styles = css`
    :host {
      --wg-icon-button-color-background: var(--wg-component-icon-button-color-background);
      --wg-icon-button-color-background-hover: var(
        --wg-component-icon-button-color-background-hover
      );
      --wg-icon-button-color-border: transparent;
      --wg-icon-button-color-text: var(--wg-component-icon-button-color-text);
      --wg-icon-button-radius: var(--wg-component-icon-button-radius);
      --wg-icon-button-size: var(--wg-component-icon-button-size);
      display: inline-block;
      font-family: var(--wg-typography-family-body);
      vertical-align: middle;
    }

    :host([appearance='secondary']) {
      --wg-icon-button-color-border: var(--wg-component-icon-button-color-border);
    }

    [part='button'] {
      display: inline-grid;
      place-items: center;
      inline-size: var(--wg-icon-button-size);
      min-inline-size: var(--wg-icon-button-size);
      block-size: var(--wg-icon-button-size);
      box-sizing: border-box;
      padding: var(--wg-space-reference-2);
      border: var(--wg-border-width-standard) solid var(--wg-icon-button-color-border);
      border-radius: var(--wg-icon-button-radius);
      color: var(--wg-icon-button-color-text);
      background: var(--wg-icon-button-color-background);
      font: inherit;
      cursor: pointer;
    }

    [part='button']:hover:not(:disabled, [aria-disabled='true']) {
      background: var(--wg-icon-button-color-background-hover);
    }

    [part='button']:focus-visible {
      outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
      outline-offset: var(--wg-focus-offset);
    }

    [part='button']:disabled,
    [part='button'][aria-disabled='true'] {
      cursor: not-allowed;
    }

    [part='icon'],
    [part='pending'] {
      grid-area: 1 / 1;
      display: inline-flex;
      font-size: 1.25rem;
    }

    [part='pending'] {
      opacity: 0;
    }

    .visually-hidden {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    :host([pending]) [part='icon'] {
      opacity: 0;
    }

    :host([pending]) [part='pending'] {
      opacity: 1;
    }

    @media (forced-colors: active) {
      [part='button'] {
        border-color: ButtonText;
        color: ButtonText;
        background: ButtonFace;
      }
    }
  `;

  declare label: string;
  declare appearance: IconButtonAppearance;
  declare disabled: boolean;
  declare pending: boolean;
  declare pendingLabel: string;

  constructor() {
    super();
    this.label = '';
    this.appearance = 'quiet';
    this.disabled = false;
    this.pending = false;
    this.pendingLabel = '';
  }

  override attributeChangedCallback(name: string, oldValue: string | null, value: string | null) {
    if (name === 'appearance' && !isIconButtonAppearance(value)) {
      if (value !== 'quiet') this.setAttribute('appearance', 'quiet');
      return;
    }
    super.attributeChangedCallback(name, oldValue, value);
  }

  override focus(options?: FocusOptions): void {
    this.#button?.focus(options);
  }

  override click(): void {
    if (!this.disabled && !this.pending) this.#button?.click();
  }

  protected override render() {
    const pendingLabel = this.pendingLabel || `Working on ${this.label}`;
    return html`<button
      part="button"
      type="button"
      aria-label=${this.label}
      ?disabled=${this.disabled}
      aria-disabled=${this.pending ? 'true' : nothing}
      aria-busy=${this.pending ? 'true' : nothing}
      @click=${this.#handleClick}
    >
      <span part="icon"><slot></slot></span>
      <span part="pending" aria-hidden=${this.pending ? nothing : 'true'}>
        <slot name="pending"></slot>
      </span>
      <span class="visually-hidden">${this.pending ? pendingLabel : nothing}</span>
    </button>`;
  }

  get #button(): HTMLButtonElement | null {
    return this.renderRoot.querySelector('button');
  }

  readonly #handleClick = (event: MouseEvent): void => {
    if (this.pending) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
}

export function defineWgIconButton(registry: CustomElementRegistry = customElements): void {
  defineElement(wgIconButtonTagName, WgIconButton, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-icon-button': WgIconButton;
  }
}
