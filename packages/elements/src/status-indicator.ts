import { isActivity, isCondition, isKnowledge } from '@wayglass/core';
import type { Activity, Condition, Knowledge } from '@wayglass/core';
import { css, html } from 'lit';

import { defineElement } from './registration.js';
import {
  activityLabels,
  conditionLabels,
  knowledgeLabels,
  knownStateSegments,
} from './state-presentation.js';
import { WayglassElement } from './wayglass-element.js';

export const statusIndicatorSizes = ['compact', 'prominent'] as const;
export type StatusIndicatorSize = (typeof statusIndicatorSizes)[number];

export const wgStatusIndicatorTagName = 'wg-status-indicator';

export function isStatusIndicatorSize(value: unknown): value is StatusIndicatorSize {
  return typeof value === 'string' && statusIndicatorSizes.some((size) => size === value);
}

export class WgStatusIndicator extends WayglassElement {
  static override properties = {
    label: {
      type: String,
      reflect: true,
    },
    condition: {
      type: String,
      reflect: true,
    },
    knowledge: {
      type: String,
      reflect: true,
    },
    activity: {
      type: String,
      reflect: true,
    },
    size: {
      type: String,
      reflect: true,
    },
  };

  static override styles = css`
    :host {
      --wg-status-indicator-color-condition: var(--wg-component-status-indicator-color-condition);
      --wg-status-indicator-color-border: var(--wg-component-status-indicator-color-border);
      --wg-status-indicator-size-compact: var(--wg-component-status-indicator-size-compact);
      --wg-status-indicator-size-prominent: var(--wg-component-status-indicator-size-prominent);
      --wg-status-indicator-radius: var(--wg-component-status-indicator-radius);
      --wg-status-indicator-space: var(--wg-component-status-indicator-space);
      --_wg-status-indicator-size: var(--wg-status-indicator-size-compact);
      --_wg-status-indicator-activity-color: var(--wg-color-semantic-activity-idle);
      --_wg-status-indicator-condition-text: var(--wg-color-semantic-text-secondary);

      display: inline-block;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
    }

    :host([condition='informational']) {
      --wg-status-indicator-color-condition: var(--wg-color-semantic-condition-informational);
      --_wg-status-indicator-condition-text: var(--wg-color-semantic-condition-informational);
    }

    :host([condition='positive']) {
      --wg-status-indicator-color-condition: var(--wg-color-semantic-condition-positive);
      --_wg-status-indicator-condition-text: var(--wg-color-semantic-condition-positive);
    }

    :host([condition='caution']) {
      --wg-status-indicator-color-condition: var(--wg-color-semantic-condition-caution);
      --_wg-status-indicator-condition-text: var(--wg-color-semantic-condition-caution);
    }

    :host([condition='critical']) {
      --wg-status-indicator-color-condition: var(--wg-color-semantic-condition-critical);
      --_wg-status-indicator-condition-text: var(--wg-color-semantic-condition-critical);
    }

    :host([activity='pending']) {
      --_wg-status-indicator-activity-color: var(--wg-color-semantic-activity-pending);
    }

    :host([size='prominent']) {
      --_wg-status-indicator-size: var(--wg-status-indicator-size-prominent);
    }

    [part='base'] {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      min-inline-size: 0;
      gap: var(--wg-status-indicator-space);
    }

    [part='signal'] {
      inline-size: var(--_wg-status-indicator-size);
      block-size: var(--_wg-status-indicator-size);
      box-sizing: border-box;
      border: var(--wg-border-width-standard) solid var(--wg-status-indicator-color-border);
      border-radius: var(--wg-status-indicator-radius);
      background: var(--wg-status-indicator-color-condition);
    }

    :host([knowledge='unknown']) [part='signal'],
    :host([knowledge='unavailable']) [part='signal'] {
      border-style: dashed;
    }

    :host([knowledge='conflicting']) [part='signal'] {
      border-width: var(--wg-border-width-strong);
      border-style: double;
    }

    :host([activity='pending']) [part='signal'] {
      box-shadow: 0 0 0 var(--wg-border-width-strong) var(--_wg-status-indicator-activity-color);
    }

    .content {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-status-indicator-space);
    }

    [part='label'] {
      min-inline-size: 0;
      font-size: var(--wg-typography-size-body);
      font-weight: var(--wg-typography-weight-medium);
      overflow-wrap: anywhere;
    }

    .metadata {
      display: flex;
      flex-wrap: wrap;
      gap: var(--wg-space-reference-2);
      color: var(--wg-color-semantic-text-secondary);
      font-size: var(--wg-typography-size-label);
    }

    .condition {
      color: var(--_wg-status-indicator-condition-text);
      font-weight: var(--wg-typography-weight-medium);
    }

    [part='knowledge'] {
      color: var(--wg-color-semantic-text-secondary);
    }

    [part='activity'] {
      color: var(--wg-color-semantic-text-secondary);
    }

    [part='detail'] {
      grid-column: 1 / -1;
      color: var(--wg-color-semantic-text-secondary);
      font-size: var(--wg-typography-size-label);
    }

    [hidden] {
      display: none;
    }

    slot[name='label']::slotted(*),
    slot[name='detail']::slotted(*) {
      margin-block: 0;
      color: inherit;
      font: inherit;
    }

    @media (forced-colors: active) {
      [part='signal'] {
        border-color: CanvasText;
        background: Canvas;
        forced-color-adjust: auto;
      }

      :host([condition='critical']) [part='signal'],
      :host([activity='pending']) [part='signal'] {
        background: Highlight;
      }
    }
  `;

  declare label: string;
  declare condition: Condition;
  declare knowledge: Knowledge;
  declare activity: Activity;
  declare size: StatusIndicatorSize;

  constructor() {
    super();
    this.label = '';
    this.condition = 'neutral';
    this.knowledge = 'confirmed';
    this.activity = 'idle';
    this.size = 'compact';
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    const defaults = {
      condition: 'neutral',
      knowledge: 'confirmed',
      activity: 'idle',
      size: 'compact',
    } as const;

    const invalid =
      (name === 'condition' && !isCondition(value)) ||
      (name === 'knowledge' && !isKnowledge(value)) ||
      (name === 'activity' && !isActivity(value)) ||
      (name === 'size' && !isStatusIndicatorSize(value));

    if (invalid) {
      const fallback = defaults[name as keyof typeof defaults];
      if (fallback && value !== fallback) {
        this.setAttribute(name, fallback);
      }
      return;
    }

    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    const visibleLabel = this.#visibleLabel();
    const hasDetail = this.#hasNamedSlot('detail');
    const summary = [
      visibleLabel,
      ...knownStateSegments(this.condition, this.knowledge, this.activity),
    ]
      .filter(Boolean)
      .join(', ');

    return html`
      <div part="base" role="group" aria-label=${summary || 'Unlabelled status'}>
        <span part="signal" aria-hidden="true"></span>
        <span class="content">
          <span part="label">
            <slot name="label" @slotchange=${this.#handleSlotChange}>${this.label}</slot>
          </span>
          <span class="metadata">
            <span class="condition">${conditionLabels[this.condition]}</span>
            <span part="knowledge" ?hidden=${this.knowledge === 'confirmed'}>
              ${knowledgeLabels[this.knowledge]}
            </span>
            <span part="activity" ?hidden=${this.activity === 'idle'}>
              ${activityLabels[this.activity]}
            </span>
          </span>
        </span>
        <span part="detail" ?hidden=${!hasDetail}>
          <slot name="detail" @slotchange=${this.#handleSlotChange}></slot>
        </span>
      </div>
    `;
  }

  readonly #handleSlotChange = (): void => {
    this.requestUpdate();
  };

  #visibleLabel(): string {
    const slotted = Array.from(this.children)
      .filter((child) => child.getAttribute('slot') === 'label')
      .map((child) => child.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ');

    return slotted || this.label.trim();
  }

  #hasNamedSlot(name: string): boolean {
    return Array.from(this.children).some((child) => child.getAttribute('slot') === name);
  }
}

export function defineWgStatusIndicator(registry: CustomElementRegistry = customElements): void {
  defineElement(wgStatusIndicatorTagName, WgStatusIndicator, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-status-indicator': WgStatusIndicator;
  }
}
