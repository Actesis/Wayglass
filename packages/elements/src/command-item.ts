import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export type CommandTrigger = 'keyboard' | 'pointer' | 'programmatic';

export interface WgCommandDetail {
  readonly value: string;
  readonly trigger: CommandTrigger;
}

export const wgCommandItemTagName = 'wg-command-item';

export class WgCommandItem extends WayglassElement {
  static override properties = {
    value: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: block;
      min-inline-size: 0;
      color: var(--wg-menu-color-text, var(--wg-component-menu-color-text));
      font-family: var(--wg-typography-family-body);
      cursor: pointer;
      outline: none;
    }

    :host([disabled]) {
      cursor: not-allowed;
      opacity: var(--wg-opacity-disabled);
    }

    [part='item'] {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      min-block-size: var(--wg-menu-item-size-minimum, var(--wg-component-menu-size-item-minimum));
      box-sizing: border-box;
      gap: var(--wg-menu-space, var(--wg-component-menu-space));
      padding: var(--wg-menu-space, var(--wg-component-menu-space));
      border-radius: var(--wg-menu-trigger-radius, var(--wg-component-menu-radius-trigger));
      background: transparent;
    }

    :host(:hover:not([disabled])) [part='item'],
    :host(:focus-visible) [part='item'] {
      background: var(
        --wg-menu-item-color-background-hover,
        var(--wg-component-menu-color-item-background-hover)
      );
    }

    :host(:focus-visible) {
      outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
      outline-offset: calc(-1 * var(--wg-focus-width));
      border-radius: var(--wg-menu-trigger-radius, var(--wg-component-menu-radius-trigger));
    }

    [part='content'] {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-space-reference-1);
    }

    [part='label'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
      font-weight: var(--wg-typography-weight-medium);
    }

    [part='detail'] {
      min-inline-size: 0;
      color: var(--wg-menu-color-detail, var(--wg-component-menu-color-detail));
      font-size: var(--wg-typography-size-metadata);
      overflow-wrap: anywhere;
    }

    [part='leading'],
    [part='trailing'] {
      display: inline-flex;
      align-items: center;
    }

    @media (forced-colors: active) {
      :host {
        color: ButtonText;
        forced-color-adjust: auto;
      }

      :host(:hover:not([disabled])) [part='item'],
      :host(:focus-visible) [part='item'] {
        color: HighlightText;
        background: Highlight;
      }

      [part='detail'] {
        color: currentColor;
      }
    }
  `;

  declare value: string;
  declare disabled: boolean;

  constructor() {
    super();
    this.value = '';
    this.disabled = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'menuitem');
    this.tabIndex = -1;
    this.#syncDisabled();
    this.addEventListener('click', this.#handleClick);
    this.addEventListener('keydown', this.#handleKeydown);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('click', this.#handleClick);
    this.removeEventListener('keydown', this.#handleKeydown);
    super.disconnectedCallback();
  }

  protected override updated(): void {
    this.#syncDisabled();
  }

  labelText(): string {
    return Array.from(this.childNodes)
      .filter((node) => !(node instanceof Element) || !node.slot)
      .map((node) => node.textContent ?? '')
      .join(' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  #emitCommand(trigger: CommandTrigger): boolean {
    const value = this.value.trim();
    if (this.disabled || !value) return false;

    return this.dispatchEvent(
      new CustomEvent<WgCommandDetail>('wg-command', {
        bubbles: true,
        composed: true,
        detail: { value, trigger },
      }),
    );
  }

  protected override render() {
    return html`<span part="item">
      <span part="leading"><slot name="leading"></slot></span>
      <span part="content">
        <span part="label"><slot></slot></span>
        <span part="detail"><slot name="detail"></slot></span>
      </span>
      <span part="trailing"><slot name="trailing"></slot></span>
    </span>`;
  }

  #syncDisabled(): void {
    if (this.disabled) this.setAttribute('aria-disabled', 'true');
    else this.removeAttribute('aria-disabled');
  }

  readonly #handleClick = (event: MouseEvent): void => {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    const trigger: CommandTrigger = event.isTrusted ? 'pointer' : 'programmatic';
    this.#emitCommand(trigger);
  };

  readonly #handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (!this.disabled) this.#emitCommand('keyboard');
  };
}

export function defineWgCommandItem(registry: CustomElementRegistry = customElements): void {
  defineElement(wgCommandItemTagName, WgCommandItem, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-command-item': WgCommandItem;
  }
}
