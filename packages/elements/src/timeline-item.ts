import { isActivity, isCondition, isKnowledge } from '@wayglass/core';
import type { Activity, Condition, Knowledge } from '@wayglass/core';
import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { activityLabels, conditionLabels, knowledgeLabels } from './state-presentation.js';
import { WayglassElement } from './wayglass-element.js';

export const timelineItemKinds = ['milestone', 'interval'] as const;
export type TimelineItemKind = (typeof timelineItemKinds)[number];

export function isTimelineItemKind(value: unknown): value is TimelineItemKind {
  return timelineItemKinds.some((kind) => kind === value);
}

export const wgTimelineItemTagName = 'wg-timeline-item';

export class WgTimelineItem extends WayglassElement {
  static override properties = {
    label: { type: String, reflect: true },
    kind: { type: String, reflect: true },
    condition: { type: String, reflect: true },
    knowledge: { type: String, reflect: true },
    activity: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-timeline-item-color-heading: var(--wg-component-timeline-item-color-heading);
      --wg-timeline-item-color-detail: var(--wg-component-timeline-item-color-detail);
      --wg-timeline-item-color-state: var(--wg-component-timeline-item-color-state);
      --wg-timeline-item-color-condition: var(--wg-component-timeline-item-color-condition);
      --wg-timeline-item-color-sequence: var(--wg-component-timeline-item-color-sequence);
      --wg-timeline-item-color-signal-border: var(--wg-component-timeline-item-color-signal-border);
      --wg-timeline-item-radius-signal: var(--wg-component-timeline-item-radius-signal);
      --wg-timeline-item-space: var(--wg-component-timeline-item-space);
      --wg-timeline-item-space-related: var(--wg-component-timeline-item-space-related);
      --wg-timeline-item-size-signal: var(--wg-component-timeline-item-size-signal);
      --wg-timeline-item-width-sequence: var(--wg-component-timeline-item-width-sequence);
      --_wg-timeline-item-gap: var(--wg-timeline-item-space);
      --_wg-timeline-item-condition-color: var(--wg-timeline-item-color-condition);
      --_wg-timeline-item-condition-text: var(--wg-timeline-item-color-state);
      --_wg-timeline-item-activity-color: var(--wg-color-semantic-activity-idle);

      display: block;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
      container-name: wg-timeline-item;
      container-type: inline-size;
    }

    :host([condition='informational']) {
      --_wg-timeline-item-condition-color: var(--wg-color-semantic-condition-informational);
    }

    :host([condition='positive']) {
      --_wg-timeline-item-condition-color: var(--wg-color-semantic-condition-positive);
      --_wg-timeline-item-condition-text: var(--wg-color-semantic-condition-positive);
    }

    :host([condition='caution']) {
      --_wg-timeline-item-condition-color: var(--wg-color-semantic-condition-caution);
      --_wg-timeline-item-condition-text: var(--wg-color-semantic-condition-caution);
    }

    :host([condition='critical']) {
      --_wg-timeline-item-condition-color: var(--wg-color-semantic-condition-critical);
      --_wg-timeline-item-condition-text: var(--wg-color-semantic-condition-critical);
    }

    :host([activity='pending']) {
      --_wg-timeline-item-activity-color: var(--wg-color-semantic-activity-pending);
    }

    [part='base'] {
      position: relative;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: start;
      min-inline-size: 0;
      box-sizing: border-box;
      gap: var(--wg-timeline-item-space);
    }

    [part='sequence'] {
      position: absolute;
      z-index: 0;
      inset-block-start: calc(var(--wg-timeline-item-size-signal) / 2);
      inset-block-end: calc(
        -1 * (var(--_wg-timeline-item-gap) + var(--wg-timeline-item-size-signal) / 2)
      );
      inset-inline-start: calc(
        var(--wg-timeline-item-size-signal) / 2 - var(--wg-timeline-item-width-sequence) / 2
      );
      inline-size: var(--wg-timeline-item-width-sequence);
      background: var(--wg-timeline-item-color-sequence);
      pointer-events: none;
    }

    :host(:last-of-type) [part='sequence'] {
      display: none;
    }

    [part='signal'] {
      position: relative;
      z-index: 1;
      inline-size: var(--wg-timeline-item-size-signal);
      block-size: var(--wg-timeline-item-size-signal);
      box-sizing: border-box;
      margin-block-start: var(--wg-timeline-item-space-related);
      border: var(--wg-border-width-standard) solid var(--wg-timeline-item-color-signal-border);
      border-radius: var(--wg-timeline-item-radius-signal);
      background: var(--_wg-timeline-item-condition-color);
    }

    :host([kind='interval']) [part='signal'] {
      /* The extra related-space measure distinguishes a span without creating a public geometry API. */
      block-size: calc(var(--wg-timeline-item-size-signal) + var(--wg-timeline-item-space-related));
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
      box-shadow: 0 0 0 var(--wg-border-width-strong) var(--_wg-timeline-item-activity-color);
    }

    [part='content'] {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-timeline-item-space-related);
    }

    [part='time'],
    [part='end-time'],
    [part='heading'],
    [part='description'],
    [part='metadata'],
    [part='details'],
    [part='actions'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    [part='time'],
    [part='end-time'],
    [part='description'],
    [part='metadata'],
    [part='details'] {
      color: var(--wg-timeline-item-color-detail);
      font-size: var(--wg-typography-size-label);
    }

    [part='time'] {
      font-weight: var(--wg-typography-weight-medium);
    }

    [part='heading'] {
      color: var(--wg-timeline-item-color-heading);
      font-size: var(--wg-typography-size-body);
      font-weight: var(--wg-typography-weight-emphasis);
    }

    [part='state'] {
      display: flex;
      flex-wrap: wrap;
      gap: var(--wg-timeline-item-space-related);
      color: var(--wg-timeline-item-color-state);
      font-size: var(--wg-typography-size-label);
    }

    [part='condition'] {
      color: var(--_wg-timeline-item-condition-text);
      font-weight: var(--wg-typography-weight-medium);
    }

    [part='knowledge'],
    [part='activity'] {
      color: var(--wg-timeline-item-color-state);
    }

    [part='actions'] {
      align-self: center;
    }

    [hidden] {
      display: none;
    }

    slot:not([name])::slotted(*),
    slot[name='time']::slotted(*),
    slot[name='end-time']::slotted(*),
    slot[name='heading']::slotted(*),
    slot[name='metadata']::slotted(*),
    slot[name='details']::slotted(*) {
      margin-block: 0;
      color: inherit;
      font: inherit;
    }

    @container wg-timeline-item (inline-size < 32rem) {
      [part='base'] {
        grid-template-columns: auto minmax(0, 1fr);
      }

      [part='actions'] {
        grid-column: 2;
        grid-row: auto;
      }
    }

    @media (forced-colors: active) {
      [part='sequence'],
      [part='signal'] {
        border-color: CanvasText;
        background: CanvasText;
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
  declare kind: TimelineItemKind;
  declare condition: Condition;
  declare knowledge: Knowledge;
  declare activity: Activity;

  constructor() {
    super();
    this.label = '';
    this.kind = 'milestone';
    this.condition = 'neutral';
    this.knowledge = 'confirmed';
    this.activity = 'idle';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'listitem');
  }

  override attributeChangedCallback(name: string, previous: string | null, value: string | null) {
    const defaults = {
      kind: 'milestone',
      condition: 'neutral',
      knowledge: 'confirmed',
      activity: 'idle',
    } as const;
    const invalid =
      (name === 'kind' && !isTimelineItemKind(value)) ||
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
    const hasEndTime = this.#hasNamedSlot('end-time');
    const hasDescription = this.#hasDefaultSlot();
    const hasMetadata = this.#hasNamedSlot('metadata');
    const hasDetails = this.#hasNamedSlot('details');
    const hasActions = this.#hasNamedSlot('actions');

    return html`
      <div part="base">
        <span part="sequence" aria-hidden="true"></span>
        <span part="signal" aria-hidden="true"></span>
        <div part="content">
          <div part="time">
            <slot name="time" @slotchange=${this.#handleSlotChange}></slot>
          </div>
          <div part="end-time" ?hidden=${!hasEndTime}>
            <slot name="end-time" @slotchange=${this.#handleSlotChange}></slot>
          </div>
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
            <slot @slotchange=${this.#handleSlotChange}></slot>
          </div>
          <div part="metadata" ?hidden=${!hasMetadata}>
            <slot name="metadata" @slotchange=${this.#handleSlotChange}></slot>
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

  #hasDefaultSlot(): boolean {
    return Array.from(this.childNodes).some((node) => {
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim());
      return node instanceof Element && !node.hasAttribute('slot');
    });
  }
}

export function defineWgTimelineItem(registry: CustomElementRegistry = customElements): void {
  defineElement(wgTimelineItemTagName, WgTimelineItem, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-timeline-item': WgTimelineItem;
  }
}
