import { isActivity, isCondition, isKnowledge } from '@wayglass/core';
import type { Activity, Condition, Knowledge } from '@wayglass/core';
import { css, html, nothing } from 'lit';

import { defineElement } from './registration.js';
import {
  activityLabels,
  conditionLabels,
  knowledgeLabels,
  knownStateSegments,
} from './state-presentation.js';
import { WayglassElement } from './wayglass-element.js';

export const trendDirections = ['rising', 'falling', 'steady', 'mixed', 'none'] as const;
export type TrendDirection = (typeof trendDirections)[number];

export const wgTrendIndicatorTagName = 'wg-trend-indicator';

export function isTrendDirection(value: unknown): value is TrendDirection {
  return typeof value === 'string' && trendDirections.some((direction) => direction === value);
}

const directionLabels = {
  rising: 'Rising',
  falling: 'Falling',
  steady: 'Steady',
  mixed: 'Mixed',
  none: 'No direction',
} as const satisfies Readonly<Record<TrendDirection, string>>;

export class WgTrendIndicator extends WayglassElement {
  static override properties = {
    label: { type: String, reflect: true },
    direction: { type: String, reflect: true },
    condition: { type: String, reflect: true },
    knowledge: { type: String, reflect: true },
    activity: { type: String, reflect: true },
    loading: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-trend-indicator-color-signal: var(--wg-component-trend-indicator-color-signal);
      --wg-trend-indicator-color-text: var(--wg-component-trend-indicator-color-text);
      --wg-trend-indicator-color-state: var(--wg-component-trend-indicator-color-state);
      --wg-trend-indicator-size-signal: var(--wg-component-trend-indicator-size-signal);
      --wg-trend-indicator-width-signal: var(--wg-component-trend-indicator-width-signal);
      --wg-trend-indicator-space: var(--wg-component-trend-indicator-space);
      --_wg-trend-condition-color: var(--wg-trend-indicator-color-state);

      display: inline-block;
      min-inline-size: 0;
      color: var(--wg-trend-indicator-color-text);
      font-family: var(--wg-typography-family-body);
    }

    :host([condition='informational']) {
      --_wg-trend-condition-color: var(--wg-color-semantic-condition-informational);
    }
    :host([condition='positive']) {
      --_wg-trend-condition-color: var(--wg-color-semantic-condition-positive);
    }
    :host([condition='caution']) {
      --_wg-trend-condition-color: var(--wg-color-semantic-condition-caution);
    }
    :host([condition='critical']) {
      --_wg-trend-condition-color: var(--wg-color-semantic-condition-critical);
    }

    [part='base'] {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      min-inline-size: 0;
      gap: var(--wg-trend-indicator-space);
      font-size: var(--wg-typography-size-label);
    }

    [part='signal'] {
      position: relative;
      flex: 0 0 var(--wg-trend-indicator-size-signal);
      inline-size: var(--wg-trend-indicator-size-signal);
      block-size: var(--wg-trend-indicator-size-signal);
      color: var(--wg-trend-indicator-color-signal);
    }

    [part='signal']::before,
    [part='signal']::after {
      position: absolute;
      inset-block-start: calc(50% - var(--wg-trend-indicator-width-signal) / 2);
      inset-inline-start: 0;
      inline-size: 100%;
      block-size: var(--wg-trend-indicator-width-signal);
      background: currentColor;
      content: '';
      transform-origin: center;
    }

    :host([direction='rising']) [part='signal']::before {
      transform: rotate(-35deg);
    }
    :host([direction='falling']) [part='signal']::before {
      transform: rotate(35deg);
    }
    :host([direction='mixed']) [part='signal']::before {
      inline-size: 58%;
      transform: rotate(-35deg);
    }
    :host([direction='mixed']) [part='signal']::after {
      inset-inline-start: 45%;
      inline-size: 58%;
      transform: rotate(35deg);
    }
    :host(:not([direction='mixed'])) [part='signal']::after {
      display: none;
    }

    [part='direction'] {
      font-weight: var(--wg-typography-weight-emphasis);
    }

    [part='label'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    [part='state'] {
      display: flex;
      flex-wrap: wrap;
      gap: var(--wg-trend-indicator-space);
      color: var(--wg-trend-indicator-color-state);
    }

    .condition {
      color: var(--_wg-trend-condition-color);
      font-weight: var(--wg-typography-weight-medium);
    }

    [part='detail'] {
      flex-basis: 100%;
      min-inline-size: 0;
      color: var(--wg-trend-indicator-color-state);
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
      [part='signal'],
      .condition,
      [part='knowledge'],
      [part='activity'] {
        color: CanvasText;
      }
    }
  `;

  declare label: string;
  declare direction: TrendDirection;
  declare condition: Condition;
  declare knowledge: Knowledge;
  declare activity: Activity;
  declare loading: boolean;

  constructor() {
    super();
    this.label = '';
    this.direction = 'none';
    this.condition = 'neutral';
    this.knowledge = 'confirmed';
    this.activity = 'idle';
    this.loading = false;
  }

  override attributeChangedCallback(name: string, previous: string | null, value: string | null) {
    const defaults = {
      direction: 'none',
      condition: 'neutral',
      knowledge: 'confirmed',
      activity: 'idle',
    } as const;
    const invalid =
      (name === 'direction' && !isTrendDirection(value)) ||
      (name === 'condition' && !isCondition(value)) ||
      (name === 'knowledge' && !isKnowledge(value)) ||
      (name === 'activity' && !isActivity(value));
    if (invalid) {
      const fallback = defaults[name as keyof typeof defaults];
      if (fallback && value !== fallback) this.setAttribute(name, fallback);
      return;
    }
    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    const visibleLabel = this.#namedSlotText('label') || this.label.trim();
    const direction = this.loading ? 'Loading' : directionLabels[this.direction];
    const stateSegments = knownStateSegments(this.condition, this.knowledge, this.activity);
    const summary = [direction, visibleLabel, ...stateSegments].filter(Boolean).join(', ');

    return html`
      <div
        part="base"
        role="group"
        aria-label=${summary || 'Unlabelled trend'}
        aria-busy=${this.loading ? 'true' : nothing}
      >
        <span
          part="signal"
          aria-hidden="true"
          ?hidden=${this.loading || this.direction === 'none'}
        ></span>
        <span part="direction">${direction}</span>
        <span part="label">
          <slot name="label" @slotchange=${this.#handleSlotChange}>${this.label}</slot>
        </span>
        <span part="state" ?hidden=${stateSegments.length === 0}>
          <span class="condition" ?hidden=${this.condition === 'neutral'}
            >${conditionLabels[this.condition]}</span
          >
          <span part="knowledge" ?hidden=${this.knowledge === 'confirmed'}
            >${knowledgeLabels[this.knowledge]}</span
          >
          <span part="activity" ?hidden=${this.activity === 'idle'}
            >${activityLabels[this.activity]}</span
          >
        </span>
        <span part="detail" ?hidden=${!this.#hasNamedSlot('detail')}>
          <slot name="detail" @slotchange=${this.#handleSlotChange}></slot>
        </span>
      </div>
    `;
  }

  readonly #handleSlotChange = (): void => this.requestUpdate();

  #namedSlotText(name: string): string {
    return Array.from(this.children)
      .filter((child) => child.getAttribute('slot') === name)
      .map((child) => child.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ');
  }

  #hasNamedSlot(name: string): boolean {
    return Array.from(this.children).some((child) => child.getAttribute('slot') === name);
  }
}

export function defineWgTrendIndicator(registry: CustomElementRegistry = customElements): void {
  defineElement(wgTrendIndicatorTagName, WgTrendIndicator, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-trend-indicator': WgTrendIndicator;
  }
}
