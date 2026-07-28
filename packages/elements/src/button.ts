import { css, html, nothing } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const buttonAppearances = ['primary', 'secondary', 'critical'] as const;
export type ButtonAppearance = (typeof buttonAppearances)[number];

export const wgButtonTagName = 'wg-button';

export function isButtonAppearance(value: unknown): value is ButtonAppearance {
  return typeof value === 'string' && buttonAppearances.some((appearance) => appearance === value);
}

export class WgButton extends WayglassElement {
  static override properties = {
    appearance: {
      type: String,
      reflect: true,
    },
    disabled: {
      type: Boolean,
      reflect: true,
    },
    pending: {
      type: Boolean,
      reflect: true,
    },
  };

  static override styles = css`
    :host {
      --wg-button-color-background: var(--wg-component-button-color-background);
      --wg-button-color-background-hover: var(--wg-component-button-color-background-hover);
      --wg-button-color-text: var(--wg-component-button-color-text);
      --wg-button-color-border: var(--wg-component-button-color-background);
      --wg-button-radius: var(--wg-component-button-radius);
      --wg-button-space-block: var(--wg-component-button-space-block);
      --wg-button-space-inline: var(--wg-component-button-space-inline);
      --wg-button-size-minimum: var(--wg-component-button-size-minimum);

      display: inline-block;
      max-inline-size: 100%;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
      vertical-align: middle;
    }

    :host([appearance='secondary']) {
      --wg-button-color-background: var(--wg-color-semantic-surface-inset);
      --wg-button-color-background-hover: var(--wg-color-semantic-surface-raised);
      --wg-button-color-text: var(--wg-color-semantic-text-primary);
      --wg-button-color-border: var(--wg-component-button-color-border);
    }

    :host([appearance='critical']) {
      --wg-button-color-background: var(--wg-component-button-color-critical);
      --wg-button-color-background-hover: var(--wg-component-button-color-critical);
      --wg-button-color-text: var(--wg-color-semantic-text-inverse);
      --wg-button-color-border: var(--wg-component-button-color-critical);
    }

    [part='button'] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      max-inline-size: 100%;
      min-inline-size: var(--wg-button-size-minimum);
      min-block-size: var(--wg-button-size-minimum);
      box-sizing: border-box;
      gap: var(--wg-space-reference-2);
      padding-block: var(--wg-button-space-block);
      padding-inline: var(--wg-button-space-inline);
      border: var(--wg-border-width-standard) solid var(--wg-button-color-border);
      border-radius: var(--wg-button-radius);
      color: var(--wg-button-color-text);
      background: var(--wg-button-color-background);
      font: inherit;
      font-weight: var(--wg-typography-weight-medium);
      line-height: 1.2;
      text-align: center;
      cursor: pointer;
      transition:
        background-color var(--wg-motion-duration-fast) var(--wg-motion-easing-standard),
        border-color var(--wg-motion-duration-fast) var(--wg-motion-easing-standard);
    }

    [part='button']:hover:not(:disabled, [aria-disabled='true']) {
      background: var(--wg-button-color-background-hover);
    }

    :host([appearance='critical']) [part='button']:hover:not(:disabled, [aria-disabled='true']) {
      box-shadow: inset 0 0 0 var(--wg-border-width-standard) var(--wg-button-color-text);
    }

    [part='button']:active:not(:disabled, [aria-disabled='true']) {
      border-color: var(--wg-color-semantic-action-active);
    }

    [part='button']:focus-visible {
      outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
      outline-offset: var(--wg-focus-offset);
    }

    [part='button']:disabled,
    [part='button'][aria-disabled='true'] {
      cursor: not-allowed;
    }

    [part='button']:disabled {
      opacity: var(--wg-opacity-disabled);
    }

    [part='core'] {
      display: grid;
      min-inline-size: 0;
    }

    [part='label'],
    [part='pending'] {
      grid-area: 1 / 1;
      min-inline-size: 0;
      overflow-wrap: anywhere;
      transition: opacity var(--wg-motion-duration-fast) var(--wg-motion-easing-standard);
    }

    [part='pending'] {
      visibility: hidden;
      opacity: 0;
    }

    [hidden] {
      display: none;
    }

    :host([pending]) [part='label'] {
      opacity: 0;
    }

    :host([pending]) [part='pending'] {
      visibility: visible;
      opacity: 1;
    }

    @media (prefers-reduced-motion: reduce) {
      [part='button'],
      [part='label'],
      [part='pending'] {
        transition-duration: var(--wg-motion-duration-instant);
      }
    }

    @media (forced-colors: active) {
      [part='button'] {
        border-color: ButtonText;
        color: ButtonText;
        background: ButtonFace;
        forced-color-adjust: auto;
      }

      [part='button']:focus-visible {
        outline-color: Highlight;
      }
    }
  `;

  declare appearance: ButtonAppearance;
  declare disabled: boolean;
  declare pending: boolean;

  constructor() {
    super();
    this.appearance = 'secondary';
    this.disabled = false;
    this.pending = false;
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'appearance' && !isButtonAppearance(value)) {
      if (value !== 'secondary') {
        this.setAttribute('appearance', 'secondary');
      }
      return;
    }

    super.attributeChangedCallback(name, previous, value);
  }

  override focus(options?: FocusOptions): void {
    this.#button?.focus(options);
  }

  override click(): void {
    if (!this.disabled && !this.pending) {
      this.#button?.click();
    }
  }

  protected override render() {
    return html`
      <button
        part="button"
        type="button"
        ?disabled=${this.disabled}
        aria-disabled=${this.pending ? 'true' : nothing}
        aria-busy=${this.pending ? 'true' : nothing}
        @click=${this.#handleClick}
      >
        <span part="leading" ?hidden=${!this.#hasNamedSlot('leading')}>
          <slot name="leading" @slotchange=${this.#handleSlotChange}></slot>
        </span>
        <span part="core">
          <span part="label"><slot @slotchange=${this.#handleSlotChange}></slot></span>
          <span
            part="pending"
            role=${this.pending ? 'status' : nothing}
            aria-hidden=${this.pending ? nothing : 'true'}
          >
            <slot name="pending-label">Working</slot>
          </span>
        </span>
        <span part="trailing" ?hidden=${!this.#hasNamedSlot('trailing')}>
          <slot name="trailing" @slotchange=${this.#handleSlotChange}></slot>
        </span>
      </button>
    `;
  }

  get #button(): HTMLButtonElement | null {
    return this.renderRoot.querySelector<HTMLButtonElement>('button');
  }

  readonly #handleClick = (event: MouseEvent): void => {
    if (this.pending) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  readonly #handleSlotChange = (): void => {
    this.requestUpdate();
  };

  #hasNamedSlot(name: string): boolean {
    return Array.from(this.children).some((child) => child.getAttribute('slot') === name);
  }
}

export function defineWgButton(registry: CustomElementRegistry = customElements): void {
  defineElement(wgButtonTagName, WgButton, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-button': WgButton;
  }
}
