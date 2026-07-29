import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgTabPanelTagName = 'wg-tab-panel';

export class WgTabPanel extends WayglassElement {
  static override properties = {
    value: {
      type: String,
      reflect: true,
    },
  };

  static override styles = css`
    :host {
      --wg-tab-panel-color-background: var(--wg-component-tab-panel-color-background);
      --wg-tab-panel-color-border: var(--wg-component-tab-panel-color-border);
      --wg-tab-panel-radius: var(--wg-component-tab-panel-radius);
      --wg-tab-panel-space: var(--wg-component-tab-panel-space);

      display: block;
      min-inline-size: 0;
      box-sizing: border-box;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
      outline: none;
    }

    :host([hidden]) {
      display: none;
    }

    :host(:focus-visible) {
      outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
      outline-offset: var(--wg-focus-offset);
    }

    [part='panel'] {
      min-inline-size: 0;
      box-sizing: border-box;
      padding: var(--wg-tab-panel-space);
      border: var(--wg-border-width-standard) solid var(--wg-tab-panel-color-border);
      border-radius: var(--wg-tab-panel-radius);
      background: var(--wg-tab-panel-color-background);
    }

    @media (forced-colors: active) {
      :host(:focus-visible) {
        outline-color: Highlight;
      }

      [part='panel'] {
        border-color: CanvasText;
        background: Canvas;
        forced-color-adjust: auto;
      }
    }
  `;

  declare value: string;

  constructor() {
    super();
    this.value = '';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'tabpanel');

    if (!this.hasAttribute('tabindex')) {
      this.tabIndex = 0;
    }
  }

  protected override render() {
    return html`<div part="panel"><slot></slot></div>`;
  }
}

export function defineWgTabPanel(registry: CustomElementRegistry = customElements): void {
  defineElement(wgTabPanelTagName, WgTabPanel, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-tab-panel': WgTabPanel;
  }
}
