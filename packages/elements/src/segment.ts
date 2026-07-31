import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgSegmentTagName = 'wg-segment';

export class WgSegment extends WayglassElement {
  static override properties = {
    value: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: inline-grid;
      min-inline-size: var(--wg-segmented-size-minimum);
      min-block-size: var(--wg-segmented-size-minimum);
      box-sizing: border-box;
      color: var(--wg-segmented-color-text);
      font-family: var(--wg-typography-family-body);
      cursor: pointer;
      outline: none;
    }
    :host([disabled]) {
      cursor: not-allowed;
      opacity: var(--wg-opacity-disabled);
    }
    :host(:focus-visible) {
      outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
      outline-offset: var(--wg-focus-offset);
      z-index: 1;
    }
    [part='segment'] {
      display: grid;
      align-content: center;
      min-inline-size: 0;
      padding: var(--wg-segmented-space);
      border: var(--wg-border-width-standard) solid var(--wg-segmented-color-border);
      border-radius: calc(var(--wg-segmented-radius) * 0.65);
      background: transparent;
      text-align: center;
    }
    :host([aria-checked='true']) [part='segment'] {
      color: var(--wg-segmented-color-text);
      background: var(--wg-color-semantic-surface-raised);
      box-shadow: inset 0 calc(-1 * var(--wg-border-width-band)) 0
        var(--wg-segmented-color-selected);
    }
    [part='label'] {
      font-weight: var(--wg-typography-weight-medium);
    }
    [part='detail'] {
      color: var(--wg-color-semantic-text-secondary);
      font-size: var(--wg-typography-size-metadata);
    }
    @media (forced-colors: active) {
      [part='segment'] {
        border-color: ButtonText;
        color: ButtonText;
        background: ButtonFace;
      }
      :host([aria-checked='true']) [part='segment'] {
        color: CanvasText;
        background: Canvas;
        box-shadow: inset 0 calc(-1 * var(--wg-border-width-band)) 0 Highlight;
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
    this.setAttribute('role', 'radio');
    this.setAttribute('aria-checked', this.getAttribute('aria-checked') ?? 'false');
    if (!this.hasAttribute('tabindex')) this.tabIndex = -1;
  }

  protected override render() {
    return html`<span part="segment">
      <span part="label"><slot></slot></span>
      <span part="detail"><slot name="detail"></slot></span>
    </span>`;
  }
}

export function defineWgSegment(registry: CustomElementRegistry = customElements): void {
  defineElement(wgSegmentTagName, WgSegment, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-segment': WgSegment;
  }
}
