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

export const wgKeyValueTagName = 'wg-key-value';

export class WgKeyValue extends WayglassElement {
  static override properties = {
    label: { type: String, reflect: true },
    value: { type: String, reflect: true },
    condition: { type: String, reflect: true },
    knowledge: { type: String, reflect: true },
    activity: { type: String, reflect: true },
    loading: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-key-value-color-label: var(--wg-component-key-value-color-label);
      --wg-key-value-color-value: var(--wg-component-key-value-color-value);
      --wg-key-value-color-state: var(--wg-component-key-value-color-state);
      --wg-key-value-space: var(--wg-component-key-value-space);
      --wg-key-value-size-label-minimum: var(--wg-component-key-value-size-label-minimum);
      --_wg-key-value-condition-color: var(--wg-key-value-color-state);

      display: block;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
      container-name: wg-key-value;
      container-type: inline-size;
    }

    :host([condition='informational']) {
      --_wg-key-value-condition-color: var(--wg-color-semantic-condition-informational);
    }
    :host([condition='positive']) {
      --_wg-key-value-condition-color: var(--wg-color-semantic-condition-positive);
    }
    :host([condition='caution']) {
      --_wg-key-value-condition-color: var(--wg-color-semantic-condition-caution);
    }
    :host([condition='critical']) {
      --_wg-key-value-condition-color: var(--wg-color-semantic-condition-critical);
    }

    [part='base'] {
      display: grid;
      grid-template-columns: minmax(var(--wg-key-value-size-label-minimum), auto) minmax(0, 1fr);
      align-items: baseline;
      min-inline-size: 0;
      gap: var(--wg-key-value-space);
    }

    [part='label'] {
      min-inline-size: 0;
      color: var(--wg-key-value-color-label);
      font-size: var(--wg-typography-size-label);
      font-weight: var(--wg-typography-weight-medium);
      overflow-wrap: anywhere;
    }

    [part='value'] {
      min-inline-size: 0;
      color: var(--wg-key-value-color-value);
      font-size: var(--wg-typography-size-body);
      font-weight: var(--wg-typography-weight-emphasis);
      overflow-wrap: anywhere;
    }

    [part='state'] {
      grid-column: 2;
      display: flex;
      flex-wrap: wrap;
      gap: var(--wg-key-value-space);
      color: var(--wg-key-value-color-state);
      font-size: var(--wg-typography-size-label);
    }

    .condition {
      color: var(--_wg-key-value-condition-color);
      font-weight: var(--wg-typography-weight-medium);
    }

    [part='description'],
    [part='metadata'] {
      grid-column: 2;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-secondary);
      font-size: var(--wg-typography-size-label);
    }

    [hidden] {
      display: none;
    }

    slot[name='label']::slotted(*),
    slot[name='description']::slotted(*),
    slot[name='metadata']::slotted(*) {
      margin-block: 0;
      color: inherit;
      font: inherit;
    }

    @container wg-key-value (inline-size < 24rem) {
      [part='base'] {
        grid-template-columns: minmax(0, 1fr);
      }

      [part='state'],
      [part='description'],
      [part='metadata'] {
        grid-column: 1;
      }
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
  declare condition: Condition;
  declare knowledge: Knowledge;
  declare activity: Activity;
  declare loading: boolean;

  constructor() {
    super();
    this.label = '';
    this.value = '';
    this.condition = 'neutral';
    this.knowledge = 'confirmed';
    this.activity = 'idle';
    this.loading = false;
  }

  override attributeChangedCallback(name: string, previous: string | null, value: string | null) {
    const defaults = { condition: 'neutral', knowledge: 'confirmed', activity: 'idle' } as const;
    const invalid =
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
    const hasSlottedValue = this.#namedSlotText('value').length > 0;
    const fallbackValue = this.loading ? 'Loading' : this.value.trim() || '—';
    const stateSegments = knownStateSegments(this.condition, this.knowledge, this.activity);

    return html`
      <div
        part="base"
        role="group"
        aria-label=${visibleLabel || 'Unlabelled key value'}
        aria-busy=${this.loading ? 'true' : nothing}
      >
        <span part="label">
          <slot name="label" @slotchange=${this.#handleSlotChange}>${this.label}</slot>
        </span>
        <span
          part="value"
          aria-label=${!hasSlottedValue && !this.loading && !this.value.trim() ? 'No value' : nothing}
        >
          ${
            this.loading
              ? fallbackValue
              : hasSlottedValue
                ? html`<slot name="value" @slotchange=${this.#handleSlotChange}></slot>`
                : fallbackValue
          }
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
        <span part="description" ?hidden=${!this.#hasNamedSlot('description')}>
          <slot name="description" @slotchange=${this.#handleSlotChange}></slot>
        </span>
        <span part="metadata" ?hidden=${!this.#hasNamedSlot('metadata')}>
          <slot name="metadata" @slotchange=${this.#handleSlotChange}></slot>
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

export function defineWgKeyValue(registry: CustomElementRegistry = customElements): void {
  defineElement(wgKeyValueTagName, WgKeyValue, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-key-value': WgKeyValue;
  }
}
