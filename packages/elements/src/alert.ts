import { css, html, nothing } from 'lit';

import { feedbackCompositionStyles, feedbackHostStyles } from './feedback-styles.js';
import {
  alertAnnouncements,
  feedbackConditions,
  isAlertAnnouncement,
  isFeedbackCondition,
  type AlertAnnouncement,
  type FeedbackCondition,
} from './feedback-values.js';
import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgAlertTagName = 'wg-alert';

export class WgAlert extends WayglassElement {
  static override properties = {
    condition: { type: String, reflect: true },
    announcement: { type: String, reflect: true },
    label: { type: String, reflect: true },
  };

  static override styles = [
    feedbackHostStyles,
    feedbackCompositionStyles,
    css`
      :host {
        --_wg-feedback-marker-color: var(--wg-color-semantic-condition-neutral);
      }

      :host([condition='positive']) {
        --_wg-feedback-marker-color: var(--wg-color-semantic-condition-positive);
      }

      :host([condition='caution']) {
        --_wg-feedback-marker-color: var(--wg-color-semantic-condition-caution);
      }

      :host([condition='critical']) {
        --_wg-feedback-marker-color: var(--wg-color-semantic-condition-critical);
      }
    `,
  ];

  declare condition: FeedbackCondition;
  declare announcement: AlertAnnouncement;
  declare label: string;

  constructor() {
    super();
    this.condition = 'neutral';
    this.announcement = 'off';
    this.label = '';
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
    if (name === 'announcement' && !isAlertAnnouncement(value)) {
      if (value !== 'off') this.setAttribute('announcement', 'off');
      return;
    }
    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    const role =
      this.announcement === 'polite'
        ? 'status'
        : this.announcement === 'assertive'
          ? 'alert'
          : nothing;
    const atomic = role === nothing ? nothing : 'true';

    return html`<div part="base" role="group" aria-label=${this.label || nothing}>
      <span part="marker" aria-hidden="true"></span>
      <div part="message" role=${role} aria-atomic=${atomic}>
        <div part="heading"><slot name="heading"></slot></div>
        <div part="content"><slot></slot></div>
      </div>
      <div part="actions"><slot name="actions"></slot></div>
    </div>`;
  }
}

export function defineWgAlert(registry: CustomElementRegistry = customElements): void {
  defineElement(wgAlertTagName, WgAlert, registry);
}

export { alertAnnouncements, feedbackConditions };

declare global {
  interface HTMLElementTagNameMap {
    'wg-alert': WgAlert;
  }
}
