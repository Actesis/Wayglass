import { css, html } from 'lit';

import {
  feedbackConditions,
  isFeedbackCondition,
  type FeedbackCondition,
} from './feedback-values.js';
import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgBadgeTagName = 'wg-badge';

export class WgBadge extends WayglassElement {
  static override properties = {
    condition: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --_wg-badge-condition: var(--wg-color-semantic-condition-neutral);

      display: inline-block;
      max-inline-size: 100%;
      color: var(--wg-component-feedback-color-text);
      font-family: var(--wg-typography-family-body);
      font-size: var(--wg-typography-size-metadata);
      font-weight: var(--wg-typography-weight-medium);
      line-height: var(--wg-typography-line-height-compact);
    }

    :host([condition='positive']) {
      --_wg-badge-condition: var(--wg-color-semantic-condition-positive);
    }

    :host([condition='caution']) {
      --_wg-badge-condition: var(--wg-color-semantic-condition-caution);
    }

    :host([condition='critical']) {
      --_wg-badge-condition: var(--wg-color-semantic-condition-critical);
    }

    :host([hidden]) {
      display: none !important;
    }

    [part='base'] {
      display: inline-grid;
      max-inline-size: 100%;
      grid-template-columns: var(--wg-component-feedback-size-marker) minmax(0, 1fr);
      align-items: stretch;
      gap: var(--wg-component-feedback-space-related);
      box-sizing: border-box;
      border: var(--wg-border-width-standard) solid var(--wg-component-feedback-color-border);
      border-radius: var(--wg-component-feedback-radius-compact);
      background: var(--wg-component-feedback-color-background);
      padding: var(--wg-space-reference-1) var(--wg-space-reference-2);
    }

    [part='marker'] {
      border-radius: var(--wg-shape-radius-signal);
      background: var(--_wg-badge-condition);
    }

    [part='content'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    @media (forced-colors: active) {
      [part='base'] {
        border-color: CanvasText;
        background: Canvas;
        color: CanvasText;
      }

      [part='marker'] {
        border: var(--wg-border-width-standard) solid CanvasText;
        background: CanvasText;
      }
    }
  `;

  declare condition: FeedbackCondition;

  constructor() {
    super();
    this.condition = 'neutral';
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'condition' && !isFeedbackCondition(value)) {
      if (value !== 'neutral') this.setAttribute('condition', 'neutral');
      return;
    }
    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    return html`<span part="base">
      <span part="marker" aria-hidden="true"></span>
      <span part="content"><slot></slot></span>
    </span>`;
  }
}

export function defineWgBadge(registry: CustomElementRegistry = customElements): void {
  defineElement(wgBadgeTagName, WgBadge, registry);
}

export { feedbackConditions };

declare global {
  interface HTMLElementTagNameMap {
    'wg-badge': WgBadge;
  }
}
