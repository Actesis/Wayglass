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

export const metricSizes = ['compact', 'prominent'] as const;
export type MetricSize = (typeof metricSizes)[number];

export const wgMetricTagName = 'wg-metric';

export function isMetricSize(value: unknown): value is MetricSize {
  return typeof value === 'string' && metricSizes.some((size) => size === value);
}

export class WgMetric extends WayglassElement {
  static override properties = {
    label: {
      type: String,
      reflect: true,
    },
    value: {
      type: String,
      reflect: true,
    },
    unit: {
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
    loading: {
      type: Boolean,
      reflect: true,
    },
  };

  static override styles = css`
    :host {
      --wg-metric-color-value: var(--wg-component-metric-color-value);
      --wg-metric-color-label: var(--wg-component-metric-color-label);
      --wg-metric-font-size-compact: var(--wg-component-metric-font-size-compact);
      --wg-metric-font-size-prominent: var(--wg-component-metric-font-size-prominent);
      --wg-metric-space: var(--wg-component-metric-space);
      --wg-metric-size-value-minimum: var(--wg-component-metric-size-value-minimum);
      --_wg-metric-font-size: var(--wg-metric-font-size-compact);
      --_wg-metric-condition-color: var(--wg-color-semantic-text-secondary);

      display: inline-block;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
    }

    :host([size='prominent']) {
      --_wg-metric-font-size: var(--wg-metric-font-size-prominent);
    }

    :host([condition='informational']) {
      --_wg-metric-condition-color: var(--wg-color-semantic-condition-informational);
    }

    :host([condition='positive']) {
      --_wg-metric-condition-color: var(--wg-color-semantic-condition-positive);
    }

    :host([condition='caution']) {
      --_wg-metric-condition-color: var(--wg-color-semantic-condition-caution);
    }

    :host([condition='critical']) {
      --_wg-metric-condition-color: var(--wg-color-semantic-condition-critical);
    }

    [part='base'] {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-metric-space);
    }

    [part='label'] {
      min-inline-size: 0;
      color: var(--wg-metric-color-label);
      font-size: var(--wg-typography-size-label);
      font-weight: var(--wg-typography-weight-medium);
      overflow-wrap: anywhere;
    }

    .reading {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      min-inline-size: 0;
      gap: var(--wg-space-reference-2);
    }

    [part='value'] {
      min-inline-size: var(--wg-metric-size-value-minimum);
      color: var(--wg-metric-color-value);
      font-family: var(--wg-typography-family-numeric);
      font-size: var(--_wg-metric-font-size);
      font-variant-numeric: tabular-nums;
      font-weight: var(--wg-typography-weight-emphasis);
      overflow-wrap: anywhere;
    }

    [part='unit'] {
      color: var(--wg-color-semantic-text-secondary);
      font-size: var(--wg-typography-size-body);
      font-weight: var(--wg-typography-weight-medium);
    }

    .state {
      display: flex;
      flex-wrap: wrap;
      gap: var(--wg-space-reference-2);
      color: var(--wg-color-semantic-text-secondary);
      font-size: var(--wg-typography-size-label);
    }

    .condition {
      color: var(--_wg-metric-condition-color);
      font-weight: var(--wg-typography-weight-medium);
    }

    [part='knowledge'] {
      color: var(--wg-color-semantic-text-secondary);
    }

    [part='activity'] {
      color: var(--wg-color-semantic-text-secondary);
    }

    [part='description'],
    [part='metadata'] {
      color: var(--wg-color-semantic-text-secondary);
      font-size: var(--wg-typography-size-label);
    }

    [hidden] {
      display: none;
    }

    slot[name='label']::slotted(*),
    slot[name='trend']::slotted(*),
    slot[name='description']::slotted(*),
    slot[name='metadata']::slotted(*) {
      margin-block: 0;
      color: inherit;
      font: inherit;
    }

    @media (forced-colors: active) {
      .condition,
      [part='knowledge'],
      [part='activity'] {
        color: CanvasText;
      }
    }
  `;

  declare label: string;
  declare value: string;
  declare unit: string;
  declare condition: Condition;
  declare knowledge: Knowledge;
  declare activity: Activity;
  declare size: MetricSize;
  declare loading: boolean;

  constructor() {
    super();
    this.label = '';
    this.value = '';
    this.unit = '';
    this.condition = 'neutral';
    this.knowledge = 'confirmed';
    this.activity = 'idle';
    this.size = 'compact';
    this.loading = false;
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
      (name === 'size' && !isMetricSize(value));

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
    const visibleValue = this.loading ? 'Loading' : this.value.trim() || '—';
    const accessibleValue = this.loading ? 'Loading' : this.value.trim() || 'No value';
    const hasDescription = this.#hasNamedSlot('description');
    const hasMetadata = this.#hasNamedSlot('metadata');
    const hasTrend = this.#hasNamedSlot('trend');
    const stateSegments = knownStateSegments(this.condition, this.knowledge, this.activity);
    const summary = [
      visibleLabel,
      [accessibleValue, this.unit.trim()].filter(Boolean).join(' '),
      ...stateSegments,
    ]
      .filter(Boolean)
      .join(', ');

    return html`
      <div
        part="base"
        role="group"
        aria-label=${summary || 'Unlabelled metric'}
        aria-busy=${this.loading ? 'true' : nothing}
      >
        <span part="label">
          <slot name="label" @slotchange=${this.#handleSlotChange}>${this.label}</slot>
        </span>
        <span class="reading">
          <span part="value">${visibleValue}</span>
          <span part="unit" ?hidden=${!this.unit.trim()}>${this.unit}</span>
        </span>
        <span class="state" ?hidden=${stateSegments.length === 0}>
          <span class="condition" ?hidden=${this.condition === 'neutral'}>
            ${conditionLabels[this.condition]}
          </span>
          <span part="knowledge" ?hidden=${this.knowledge === 'confirmed'}>
            ${knowledgeLabels[this.knowledge]}
          </span>
          <span part="activity" ?hidden=${this.activity === 'idle'}>
            ${activityLabels[this.activity]}
          </span>
        </span>
        <span part="trend" ?hidden=${!hasTrend}>
          <slot name="trend" @slotchange=${this.#handleSlotChange}></slot>
        </span>
        <span part="description" ?hidden=${!hasDescription}>
          <slot name="description" @slotchange=${this.#handleSlotChange}></slot>
        </span>
        <span part="metadata" ?hidden=${!hasMetadata}>
          <slot name="metadata" @slotchange=${this.#handleSlotChange}></slot>
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

export function defineWgMetric(registry: CustomElementRegistry = customElements): void {
  defineElement(wgMetricTagName, WgMetric, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-metric': WgMetric;
  }
}
