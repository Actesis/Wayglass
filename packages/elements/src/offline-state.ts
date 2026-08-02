import { css, html } from 'lit';

import { feedbackCompositionStyles, feedbackHostStyles } from './feedback-styles.js';
import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgOfflineStateTagName = 'wg-offline-state';

export class WgOfflineState extends WayglassElement {
  static override properties = {
    label: { type: String, reflect: true },
  };

  static override styles = [
    feedbackHostStyles,
    feedbackCompositionStyles,
    css`
      :host {
        --_wg-feedback-marker-color: var(--wg-component-feedback-color-offline);
      }

      [part='marker'] {
        background: repeating-linear-gradient(
          135deg,
          var(--_wg-feedback-marker-color) 0,
          var(--_wg-feedback-marker-color) var(--wg-border-width-strong),
          transparent var(--wg-border-width-strong),
          transparent calc(var(--wg-border-width-strong) + var(--wg-border-width-strong))
        );
      }
    `,
  ];

  declare label: string;

  constructor() {
    super();
    this.label = '';
  }

  protected override render() {
    return html`<div part="base" role="group" aria-label=${this.label}>
      <span part="marker" aria-hidden="true"></span>
      <div part="heading"><slot name="heading"></slot></div>
      <div part="content"><slot></slot></div>
      <div part="last-known"><slot name="last-known"></slot></div>
      <div part="actions"><slot name="actions"></slot></div>
    </div>`;
  }
}

export function defineWgOfflineState(registry: CustomElementRegistry = customElements): void {
  defineElement(wgOfflineStateTagName, WgOfflineState, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-offline-state': WgOfflineState;
  }
}
