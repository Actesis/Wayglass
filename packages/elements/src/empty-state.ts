import { html } from 'lit';

import { feedbackCompositionStyles, feedbackHostStyles } from './feedback-styles.js';
import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgEmptyStateTagName = 'wg-empty-state';

export class WgEmptyState extends WayglassElement {
  static override properties = {
    label: { type: String, reflect: true },
  };

  static override styles = [feedbackHostStyles, feedbackCompositionStyles];

  declare label: string;

  constructor() {
    super();
    this.label = '';
  }

  protected override render() {
    return html`<div part="base" role="group" aria-label=${this.label}>
      <span part="marker" aria-hidden="true"></span>
      <div part="media"><slot name="media"></slot></div>
      <div part="heading"><slot name="heading"></slot></div>
      <div part="content"><slot></slot></div>
      <div part="actions"><slot name="actions"></slot></div>
    </div>`;
  }
}

export function defineWgEmptyState(registry: CustomElementRegistry = customElements): void {
  defineElement(wgEmptyStateTagName, WgEmptyState, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-empty-state': WgEmptyState;
  }
}
