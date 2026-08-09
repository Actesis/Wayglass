import { isActivity, isCondition, isKnowledge } from '@wayglass/core';
import type { Activity, Condition, Knowledge } from '@wayglass/core';
import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { activityLabels, conditionLabels, knowledgeLabels } from './state-presentation.js';
import { WayglassElement } from './wayglass-element.js';

export const wgStatusEntryTagName = 'wg-status-entry';

export class WgStatusEntry extends WayglassElement {
  static override properties = {
    label: { type: String, reflect: true },
    condition: { type: String, reflect: true },
    knowledge: { type: String, reflect: true },
    activity: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-status-entry-color-background: var(--wg-component-status-entry-color-background);
      --wg-status-entry-color-border: var(--wg-component-status-entry-color-border);
      --wg-status-entry-color-heading: var(--wg-component-status-entry-color-heading);
      --wg-status-entry-color-detail: var(--wg-component-status-entry-color-detail);
      --wg-status-entry-color-state: var(--wg-component-status-entry-color-state);
      --wg-status-entry-color-condition: var(--wg-component-status-entry-color-condition);
      --wg-status-entry-color-signal-border: var(--wg-component-status-entry-color-signal-border);
      --wg-status-entry-radius: var(--wg-component-status-entry-radius);
      --wg-status-entry-radius-signal: var(--wg-component-status-entry-radius-signal);
      --wg-status-entry-space: var(--wg-component-status-entry-space);
      --wg-status-entry-space-related: var(--wg-component-status-entry-space-related);
      --wg-status-entry-size-signal: var(--wg-component-status-entry-size-signal);
      --_wg-status-entry-condition-color: var(--wg-status-entry-color-condition);
      --_wg-status-entry-condition-text: var(--wg-status-entry-color-state);
      --_wg-status-entry-activity-color: var(--wg-color-semantic-activity-idle);

      display: block;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
      container-name: wg-status-entry;
      container-type: inline-size;
    }

    :host([condition='informational']) {
      --_wg-status-entry-condition-color: var(--wg-color-semantic-condition-informational);
    }
    :host([condition='positive']) {
      --_wg-status-entry-condition-color: var(--wg-color-semantic-condition-positive);
      --_wg-status-entry-condition-text: var(--wg-color-semantic-condition-positive);
    }
    :host([condition='caution']) {
      --_wg-status-entry-condition-color: var(--wg-color-semantic-condition-caution);
      --_wg-status-entry-condition-text: var(--wg-color-semantic-condition-caution);
    }
    :host([condition='critical']) {
      --_wg-status-entry-condition-color: var(--wg-color-semantic-condition-critical);
      --_wg-status-entry-condition-text: var(--wg-color-semantic-condition-critical);
    }

    :host([activity='pending']) {
      --_wg-status-entry-activity-color: var(--wg-color-semantic-activity-pending);
    }

    [part='base'] {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: start;
      min-inline-size: 0;
      box-sizing: border-box;
      gap: var(--wg-status-entry-space);
      padding: var(--wg-status-entry-space);
      border: var(--wg-border-width-standard) solid var(--wg-status-entry-color-border);
      border-radius: var(--wg-status-entry-radius);
      background: var(--wg-status-entry-color-background);
    }

    [part='signal'] {
      inline-size: var(--wg-status-entry-size-signal);
      block-size: var(--wg-status-entry-size-signal);
      box-sizing: border-box;
      margin-block-start: var(--wg-status-entry-space-related);
      border: var(--wg-border-width-standard) solid var(--wg-status-entry-color-signal-border);
      border-radius: var(--wg-status-entry-radius-signal);
      background: var(--_wg-status-entry-condition-color);
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
      box-shadow: 0 0 0 var(--wg-border-width-strong) var(--_wg-status-entry-activity-color);
    }

    [part='content'] {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-status-entry-space-related);
    }

    [part='heading'],
    [part='description'],
    [part='value'],
    [part='time'],
    [part='metadata'],
    [part='actions'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    [part='heading'] {
      color: var(--wg-status-entry-color-heading);
      font-size: var(--wg-typography-size-body);
      font-weight: var(--wg-typography-weight-emphasis);
    }

    [part='state'] {
      display: flex;
      flex-wrap: wrap;
      gap: var(--wg-status-entry-space-related);
      color: var(--wg-status-entry-color-state);
      font-size: var(--wg-typography-size-label);
    }

    [part='condition'] {
      color: var(--_wg-status-entry-condition-text);
      font-weight: var(--wg-typography-weight-medium);
    }

    [part='knowledge'] {
      color: var(--wg-status-entry-color-state);
    }

    [part='activity'] {
      color: var(--wg-status-entry-color-state);
    }

    [part='description'],
    [part='time'],
    [part='metadata'] {
      color: var(--wg-status-entry-color-detail);
      font-size: var(--wg-typography-size-label);
    }

    [part='value'] {
      color: var(--wg-color-semantic-text-primary);
      font-size: var(--wg-typography-size-body);
    }

    [part='actions'] {
      align-self: center;
    }

    [hidden] {
      display: none;
    }

    slot[name='heading']::slotted(*),
    slot[name='description']::slotted(*),
    slot[name='value']::slotted(*),
    slot[name='time']::slotted(*),
    slot[name='metadata']::slotted(*) {
      margin-block: 0;
      color: inherit;
      font: inherit;
    }

    @container wg-status-entry (inline-size < 32rem) {
      [part='base'] {
        grid-template-columns: auto minmax(0, 1fr);
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
    const hasDescription = this.#hasNamedSlot('description');
    const hasValue = this.#hasNamedSlot('value');
    const hasTime = this.#hasNamedSlot('time');
    const hasMetadata = this.#hasNamedSlot('metadata');
    const hasActions = this.#hasNamedSlot('actions');

    return html`
      <div part="base">
        <span part="signal" aria-hidden="true"></span>
        <div part="content">
          <div part="heading">
            <slot name="heading" @slotchange=${this.#handleSlotChange}>${this.label}</slot>
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
          <div part="description" ?hidden=${!hasDescription}>
            <slot name="description" @slotchange=${this.#handleSlotChange}></slot>
          </div>
          <div part="value" ?hidden=${!hasValue}>
            <slot name="value" @slotchange=${this.#handleSlotChange}></slot>
          </div>
          <div part="time" ?hidden=${!hasTime}>
            <slot name="time" @slotchange=${this.#handleSlotChange}></slot>
          </div>
          <div part="metadata" ?hidden=${!hasMetadata}>
            <slot name="metadata" @slotchange=${this.#handleSlotChange}></slot>
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

export function defineWgStatusEntry(registry: CustomElementRegistry = customElements): void {
  defineElement(wgStatusEntryTagName, WgStatusEntry, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-status-entry': WgStatusEntry;
  }
}
