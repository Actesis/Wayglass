import { isKnowledge } from '@wayglass/core';
import type { Knowledge } from '@wayglass/core';
import { css, html, nothing } from 'lit';

import { defineElement } from './registration.js';
import { knowledgeLabels } from './state-presentation.js';
import { WayglassElement } from './wayglass-element.js';

export const booleanValuePresentations = ['rail', 'field'] as const;
export type BooleanValuePresentation = (typeof booleanValuePresentations)[number];

export const wgBooleanValueTagName = 'wg-boolean-value';

export function isBooleanValuePresentation(value: unknown): value is BooleanValuePresentation {
  return (
    typeof value === 'string' &&
    booleanValuePresentations.some((presentation) => presentation === value)
  );
}

export class WgBooleanValue extends WayglassElement {
  static override properties = {
    label: {
      type: String,
      reflect: true,
    },
    asserted: {
      type: Boolean,
      reflect: true,
    },
    assertedLabel: {
      attribute: 'asserted-label',
      type: String,
      reflect: true,
    },
    notAssertedLabel: {
      attribute: 'not-asserted-label',
      type: String,
      reflect: true,
    },
    knowledge: {
      type: String,
      reflect: true,
    },
    presentation: {
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
      --wg-boolean-value-color-asserted: var(--wg-component-boolean-value-color-asserted);
      --wg-boolean-value-color-not-asserted: var(--wg-component-boolean-value-color-not-asserted);
      --wg-boolean-value-color-text: var(--wg-component-boolean-value-color-text);
      --wg-boolean-value-size-rail: var(--wg-component-boolean-value-size-rail);
      --wg-boolean-value-size-field: var(--wg-component-boolean-value-size-field);
      --wg-boolean-value-radius: var(--wg-component-boolean-value-radius);
      --wg-boolean-value-space: var(--wg-component-boolean-value-space);

      display: inline-block;
      min-inline-size: 0;
      color: var(--wg-boolean-value-color-text);
      font-family: var(--wg-typography-family-body);
    }

    [part='base'] {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: stretch;
      min-inline-size: 0;
      gap: var(--wg-boolean-value-space);
    }

    [part='signal'] {
      inline-size: var(--wg-boolean-value-size-rail);
      min-block-size: var(--wg-size-signal-compact);
      box-sizing: border-box;
      border: var(--wg-border-width-standard) solid var(--wg-boolean-value-color-not-asserted);
      border-radius: var(--wg-boolean-value-radius);
      background: transparent;
    }

    :host([asserted]) [part='signal'] {
      border-color: var(--wg-boolean-value-color-asserted);
      background: var(--wg-boolean-value-color-asserted);
      box-shadow: 0 0 0 var(--wg-border-width-standard) var(--wg-boolean-value-color-asserted);
    }

    :host([presentation='field']) [part='signal'] {
      inline-size: var(--wg-boolean-value-size-field);
      min-block-size: var(--wg-boolean-value-size-field);
    }

    :host([loading]) [part='signal'] {
      border-color: var(--wg-color-semantic-knowledge-unknown);
      border-style: dashed;
      background: transparent;
      box-shadow: none;
    }

    .content {
      display: grid;
      align-content: center;
      min-inline-size: 0;
      gap: var(--wg-boolean-value-space);
    }

    [part='label'] {
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-secondary);
      font-size: var(--wg-typography-size-label);
      font-weight: var(--wg-typography-weight-medium);
      overflow-wrap: anywhere;
    }

    [part='value'] {
      min-inline-size: 0;
      color: var(--wg-boolean-value-color-text);
      font-size: var(--wg-typography-size-body);
      font-weight: var(--wg-typography-weight-emphasis);
      overflow-wrap: anywhere;
    }

    [part='knowledge'] {
      color: var(--wg-color-semantic-text-secondary);
      font-size: var(--wg-typography-size-label);
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

      :host([asserted]) [part='signal'] {
        background: Highlight;
      }
    }
  `;

  declare label: string;
  declare asserted: boolean;
  declare assertedLabel: string;
  declare notAssertedLabel: string;
  declare knowledge: Knowledge;
  declare presentation: BooleanValuePresentation;
  declare loading: boolean;

  constructor() {
    super();
    this.label = '';
    this.asserted = false;
    this.assertedLabel = '';
    this.notAssertedLabel = '';
    this.knowledge = 'confirmed';
    this.presentation = 'rail';
    this.loading = false;
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'knowledge' && !isKnowledge(value)) {
      if (value !== 'confirmed') {
        this.setAttribute('knowledge', 'confirmed');
      }
      return;
    }

    if (name === 'presentation' && !isBooleanValuePresentation(value)) {
      if (value !== 'rail') {
        this.setAttribute('presentation', 'rail');
      }
      return;
    }

    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    const visibleLabel = this.#visibleLabel();
    const valueLabel = this.loading
      ? 'Loading'
      : this.asserted
        ? this.assertedLabel.trim() || 'Asserted'
        : this.notAssertedLabel.trim() || 'Not asserted';
    const hasDetail = this.#hasNamedSlot('detail');
    const summary = [
      visibleLabel,
      valueLabel,
      this.knowledge === 'confirmed' ? '' : knowledgeLabels[this.knowledge],
    ]
      .filter(Boolean)
      .join(', ');

    return html`
      <div
        part="base"
        role="group"
        aria-label=${summary || 'Unlabelled Boolean value'}
        aria-busy=${this.loading ? 'true' : nothing}
      >
        <span part="signal" aria-hidden="true"></span>
        <span class="content">
          <span part="label">
            <slot name="label" @slotchange=${this.#handleSlotChange}>${this.label}</slot>
          </span>
          <span part="value">${valueLabel}</span>
          <span part="knowledge" ?hidden=${this.knowledge === 'confirmed'}>
            ${knowledgeLabels[this.knowledge]}
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

export function defineWgBooleanValue(registry: CustomElementRegistry = customElements): void {
  defineElement(wgBooleanValueTagName, WgBooleanValue, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-boolean-value': WgBooleanValue;
  }
}
