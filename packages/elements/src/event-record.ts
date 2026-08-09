import { isActivity, isCondition, isKnowledge } from '@wayglass/core';
import type { Activity, Condition, Knowledge } from '@wayglass/core';
import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { activityLabels, conditionLabels, knowledgeLabels } from './state-presentation.js';
import { WayglassElement } from './wayglass-element.js';

export const wgEventRecordTagName = 'wg-event-record';

export class WgEventRecord extends WayglassElement {
  static override properties = {
    label: { type: String, reflect: true },
    condition: { type: String, reflect: true },
    knowledge: { type: String, reflect: true },
    activity: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-event-record-color-background: var(--wg-component-event-record-color-background);
      --wg-event-record-color-border: var(--wg-component-event-record-color-border);
      --wg-event-record-color-summary: var(--wg-component-event-record-color-summary);
      --wg-event-record-color-detail: var(--wg-component-event-record-color-detail);
      --wg-event-record-color-state: var(--wg-component-event-record-color-state);
      --wg-event-record-color-condition: var(--wg-component-event-record-color-condition);
      --wg-event-record-color-signal-border: var(--wg-component-event-record-color-signal-border);
      --wg-event-record-radius: var(--wg-component-event-record-radius);
      --wg-event-record-radius-signal: var(--wg-component-event-record-radius-signal);
      --wg-event-record-space: var(--wg-component-event-record-space);
      --wg-event-record-space-related: var(--wg-component-event-record-space-related);
      --wg-event-record-size-signal: var(--wg-component-event-record-size-signal);
      --_wg-event-record-condition-color: var(--wg-event-record-color-condition);
      --_wg-event-record-condition-text: var(--wg-event-record-color-state);
      --_wg-event-record-activity-color: var(--wg-color-semantic-activity-idle);

      display: block;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
      container-name: wg-event-record;
      container-type: inline-size;
    }

    :host([condition='informational']) {
      --_wg-event-record-condition-color: var(--wg-color-semantic-condition-informational);
    }

    :host([condition='positive']) {
      --_wg-event-record-condition-color: var(--wg-color-semantic-condition-positive);
      --_wg-event-record-condition-text: var(--wg-color-semantic-condition-positive);
    }

    :host([condition='caution']) {
      --_wg-event-record-condition-color: var(--wg-color-semantic-condition-caution);
      --_wg-event-record-condition-text: var(--wg-color-semantic-condition-caution);
    }

    :host([condition='critical']) {
      --_wg-event-record-condition-color: var(--wg-color-semantic-condition-critical);
      --_wg-event-record-condition-text: var(--wg-color-semantic-condition-critical);
    }

    :host([activity='pending']) {
      --_wg-event-record-activity-color: var(--wg-color-semantic-activity-pending);
    }

    [part='base'] {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: start;
      min-inline-size: 0;
      box-sizing: border-box;
      gap: var(--wg-event-record-space);
      padding: var(--wg-event-record-space);
      border: var(--wg-border-width-standard) solid var(--wg-event-record-color-border);
      border-radius: var(--wg-event-record-radius);
      background: var(--wg-event-record-color-background);
    }

    [part='signal'] {
      inline-size: var(--wg-event-record-size-signal);
      block-size: var(--wg-event-record-size-signal);
      box-sizing: border-box;
      margin-block-start: var(--wg-event-record-space-related);
      border: var(--wg-border-width-standard) solid var(--wg-event-record-color-signal-border);
      border-radius: var(--wg-event-record-radius-signal);
      background: var(--_wg-event-record-condition-color);
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
      box-shadow: 0 0 0 var(--wg-border-width-strong) var(--_wg-event-record-activity-color);
    }

    [part='content'] {
      display: grid;
      grid-template-columns: minmax(7rem, auto) minmax(0, 1fr);
      min-inline-size: 0;
      gap: var(--wg-event-record-space-related) var(--wg-event-record-space);
    }

    [part='time'],
    [part='summary'],
    [part='received-time'],
    [part='source'],
    [part='category'],
    [part='reference'],
    [part='metadata'],
    [part='details'],
    [part='actions'],
    [part='condition'],
    [part='knowledge'],
    [part='activity'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    [part='time'] {
      grid-column: 1;
      color: var(--wg-event-record-color-detail);
      font-size: var(--wg-typography-size-label);
      font-weight: var(--wg-typography-weight-medium);
    }

    [part='summary'] {
      grid-column: 2;
      color: var(--wg-event-record-color-summary);
      font-size: var(--wg-typography-size-body);
      font-weight: var(--wg-typography-weight-emphasis);
    }

    [part='state'] {
      display: flex;
      grid-column: 1 / -1;
      flex-wrap: wrap;
      gap: var(--wg-event-record-space-related);
      color: var(--wg-event-record-color-state);
      font-size: var(--wg-typography-size-label);
    }

    [part='condition'] {
      color: var(--_wg-event-record-condition-text);
      font-weight: var(--wg-typography-weight-medium);
    }

    [part='knowledge'],
    [part='activity'] {
      color: var(--wg-event-record-color-state);
    }

    [part='received-time'],
    [part='source'],
    [part='category'],
    [part='reference'],
    [part='metadata'],
    [part='details'] {
      color: var(--wg-event-record-color-detail);
      font-size: var(--wg-typography-size-label);
    }

    .fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      grid-column: 1 / -1;
      min-inline-size: 0;
      gap: var(--wg-event-record-space-related) var(--wg-event-record-space);
    }

    [part='metadata'],
    [part='details'] {
      grid-column: 1 / -1;
    }

    [part='actions'] {
      align-self: center;
    }

    [hidden] {
      display: none;
    }

    slot[name='time']::slotted(*),
    slot[name='summary']::slotted(*),
    slot[name='received-time']::slotted(*),
    slot[name='source']::slotted(*),
    slot[name='category']::slotted(*),
    slot[name='reference']::slotted(*),
    slot[name='metadata']::slotted(*),
    slot[name='details']::slotted(*) {
      margin-block: 0;
      color: inherit;
      font: inherit;
    }

    @container wg-event-record (inline-size < 32rem) {
      [part='base'] {
        grid-template-columns: auto minmax(0, 1fr);
      }

      [part='content'] {
        grid-template-columns: minmax(0, 1fr);
      }

      .fields {
        grid-template-columns: minmax(0, 1fr);
      }

      [part='content'] > * {
        grid-column: 1;
      }

      [part='actions'] {
        grid-column: 2;
        grid-row: auto;
      }
    }

    @media (forced-colors: active) {
      [part='base'] {
        border-color: CanvasText;
        background: Canvas;
      }

      [part='signal'] {
        border-color: CanvasText;
        background: Canvas;
        forced-color-adjust: auto;
      }

      :host([condition='critical']) [part='signal'],
      :host([activity='pending']) [part='signal'] {
        background: Highlight;
      }

      [part='state'],
      [part='state'] * {
        color: CanvasText;
      }
    }
  `;

  declare label: string;
  declare condition: Condition;
  declare knowledge: Knowledge;
  declare activity: Activity;

  constructor() {
    super();
    this.label = '';
    this.condition = 'neutral';
    this.knowledge = 'confirmed';
    this.activity = 'idle';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'listitem');
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
    const hasReceivedTime = this.#hasNamedSlot('received-time');
    const hasSource = this.#hasNamedSlot('source');
    const hasCategory = this.#hasNamedSlot('category');
    const hasReference = this.#hasNamedSlot('reference');
    const hasMetadata = this.#hasNamedSlot('metadata');
    const hasFields = hasReceivedTime || hasSource || hasCategory || hasReference || hasMetadata;
    const hasDetails = this.#hasNamedSlot('details');
    const hasActions = this.#hasNamedSlot('actions');

    return html`
      <div part="base">
        <span part="signal" aria-hidden="true"></span>
        <div part="content">
          <div part="time">
            <slot name="time" @slotchange=${this.#handleSlotChange}></slot>
          </div>
          <div part="summary">
            <slot name="summary" @slotchange=${this.#handleSlotChange}>${this.label}</slot>
          </div>
          <div part="state">
            <span part="condition">${conditionLabels[this.condition]}</span>
            <span part="knowledge" ?hidden=${this.knowledge === 'confirmed'}
              >${knowledgeLabels[this.knowledge]}</span
            >
            <span part="activity" ?hidden=${this.activity === 'idle'}
              >${activityLabels[this.activity]}</span
            >
          </div>
          <div class="fields" ?hidden=${!hasFields}>
            <div part="received-time" ?hidden=${!hasReceivedTime}>
              <slot name="received-time" @slotchange=${this.#handleSlotChange}></slot>
            </div>
            <div part="source" ?hidden=${!hasSource}>
              <slot name="source" @slotchange=${this.#handleSlotChange}></slot>
            </div>
            <div part="category" ?hidden=${!hasCategory}>
              <slot name="category" @slotchange=${this.#handleSlotChange}></slot>
            </div>
            <div part="reference" ?hidden=${!hasReference}>
              <slot name="reference" @slotchange=${this.#handleSlotChange}></slot>
            </div>
            <div part="metadata" ?hidden=${!hasMetadata}>
              <slot name="metadata" @slotchange=${this.#handleSlotChange}></slot>
            </div>
          </div>
          <div part="details" ?hidden=${!hasDetails}>
            <slot name="details" @slotchange=${this.#handleSlotChange}></slot>
          </div>
        </div>
        <div part="actions" ?hidden=${!hasActions}>
          <slot name="actions" @slotchange=${this.#handleSlotChange}></slot>
        </div>
      </div>
    `;
  }

  readonly #handleSlotChange = (): void => this.requestUpdate();

  #hasNamedSlot(name: string): boolean {
    return Array.from(this.children).some((child) => child.getAttribute('slot') === name);
  }
}

export function defineWgEventRecord(registry: CustomElementRegistry = customElements): void {
  defineElement(wgEventRecordTagName, WgEventRecord, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-event-record': WgEventRecord;
  }
}
