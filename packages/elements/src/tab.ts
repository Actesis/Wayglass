import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgTabTagName = 'wg-tab';

export class WgTab extends WayglassElement {
  static override properties = {
    value: {
      type: String,
      reflect: true,
    },
    disabled: {
      type: Boolean,
      reflect: true,
    },
  };

  static override styles = css`
    :host {
      --wg-tab-color-background: var(--wg-component-tab-color-background);
      --wg-tab-color-background-selected: var(--wg-component-tab-color-background-selected);
      --wg-tab-color-border: var(--wg-component-tab-color-border);
      --wg-tab-color-text: var(--wg-component-tab-color-text);
      --wg-tab-color-text-selected: var(--wg-component-tab-color-text-selected);
      --wg-tab-color-selection: var(--wg-component-tab-color-selection);
      --wg-tab-radius: var(--wg-component-tab-radius);
      --wg-tab-space-block: var(--wg-component-tab-space-block);
      --wg-tab-space-inline: var(--wg-component-tab-space-inline);
      --wg-tab-size-minimum: var(--wg-component-tab-size-minimum);
      --wg-tab-size-selection: var(--wg-component-tab-size-selection);

      position: relative;
      display: inline-grid;
      min-inline-size: var(--wg-tab-size-minimum);
      min-block-size: var(--wg-tab-size-minimum);
      box-sizing: border-box;
      color: var(--wg-tab-color-text);
      font-family: var(--wg-typography-family-body);
      cursor: pointer;
      outline: none;
    }

    :host([aria-selected='true']) {
      z-index: 1;
      color: var(--wg-tab-color-text-selected);
    }

    :host([disabled]) {
      cursor: not-allowed;
      opacity: var(--wg-opacity-disabled);
    }

    :host([hidden]) {
      display: none;
    }

    :host(:focus-visible) {
      outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
      outline-offset: var(--wg-focus-offset);
    }

    [part='tab'] {
      position: relative;
      display: grid;
      min-inline-size: 0;
      align-content: center;
      gap: var(--wg-space-reference-1);
      box-sizing: border-box;
      padding-block: var(--wg-tab-space-block);
      padding-inline: var(--wg-tab-space-inline);
      border: var(--wg-border-width-standard) solid var(--wg-tab-color-border);
      border-radius: var(--wg-tab-radius);
      background: var(--wg-tab-color-background);
      transition:
        background-color var(--wg-motion-duration-fast) var(--wg-motion-easing-standard),
        border-color var(--wg-motion-duration-fast) var(--wg-motion-easing-standard),
        color var(--wg-motion-duration-fast) var(--wg-motion-easing-standard);
    }

    :host([aria-selected='true']) [part='tab'] {
      border-block-end-color: var(--wg-tab-color-background-selected);
      border-end-start-radius: 0;
      border-end-end-radius: 0;
      background: var(--wg-tab-color-background-selected);
    }

    [part='selection'] {
      position: absolute;
      inset-block-start: 0;
      inset-inline: 0;
      block-size: var(--wg-tab-size-selection);
      border-start-start-radius: var(--wg-tab-radius);
      border-start-end-radius: var(--wg-tab-radius);
      background: transparent;
      pointer-events: none;
    }

    :host([aria-selected='true']) [part='selection'] {
      background: var(--wg-tab-color-selection);
    }

    [part='label'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
      font-weight: var(--wg-typography-weight-medium);
      line-height: var(--wg-typography-line-height-compact);
    }

    [part='summary'] {
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-secondary);
      font-size: var(--wg-typography-size-metadata);
      line-height: var(--wg-typography-line-height-body);
      overflow-wrap: anywhere;
    }

    @media (prefers-reduced-motion: reduce) {
      [part='tab'] {
        transition-duration: var(--wg-motion-duration-instant);
      }
    }

    @media (forced-colors: active) {
      :host {
        color: CanvasText;
      }

      :host(:focus-visible) {
        outline-color: Highlight;
      }

      [part='tab'] {
        border-color: CanvasText;
        background: Canvas;
        forced-color-adjust: auto;
      }

      :host([aria-selected='true']) [part='selection'] {
        background: Highlight;
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
    this.setAttribute('role', 'tab');
    this.setAttribute('aria-selected', this.getAttribute('aria-selected') ?? 'false');

    if (!this.hasAttribute('tabindex')) {
      this.tabIndex = -1;
    }
  }

  protected override render() {
    return html`
      <span part="tab">
        <span part="selection" aria-hidden="true"></span>
        <span part="label"><slot></slot></span>
        <span part="summary"><slot name="summary"></slot></span>
      </span>
    `;
  }
}

export function defineWgTab(registry: CustomElementRegistry = customElements): void {
  defineElement(wgTabTagName, WgTab, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-tab': WgTab;
  }
}
