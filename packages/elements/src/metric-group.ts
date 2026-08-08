import { css, html, nothing } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgMetricGroupTagName = 'wg-metric-group';

export class WgMetricGroup extends WayglassElement {
  static override properties = {
    label: { type: String, reflect: true },
    busy: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-metric-group-color-background: var(--wg-component-metric-group-color-background);
      --wg-metric-group-color-border: var(--wg-component-metric-group-color-border);
      --wg-metric-group-color-heading: var(--wg-component-metric-group-color-heading);
      --wg-metric-group-color-description: var(--wg-component-metric-group-color-description);
      --wg-metric-group-radius: var(--wg-component-metric-group-radius);
      --wg-metric-group-space: var(--wg-component-metric-group-space);
      --wg-metric-group-space-item: var(--wg-component-metric-group-space-item);
      --wg-metric-group-size-item-minimum: var(--wg-component-metric-group-size-item-minimum);

      display: block;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
      container-name: wg-metric-group;
      container-type: inline-size;
    }

    [part='base'] {
      display: grid;
      min-inline-size: 0;
      box-sizing: border-box;
      gap: var(--wg-metric-group-space);
      padding: var(--wg-metric-group-space);
      border: var(--wg-border-semantic-section) solid var(--wg-metric-group-color-border);
      border-radius: var(--wg-metric-group-radius);
      background: var(--wg-metric-group-color-background);
    }

    [part='header'] {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      min-inline-size: 0;
      gap: var(--wg-metric-group-space-item);
    }

    [part='heading'] {
      min-inline-size: 0;
      color: var(--wg-metric-group-color-heading);
      font-size: var(--wg-typography-size-section);
      font-weight: var(--wg-typography-weight-emphasis);
      overflow-wrap: anywhere;
    }

    [part='description'] {
      grid-column: 1;
      min-inline-size: 0;
      color: var(--wg-metric-group-color-description);
      font-size: var(--wg-typography-size-body);
    }

    [part='actions'] {
      grid-column: 2;
      grid-row: 1 / span 2;
      min-inline-size: 0;
    }

    [part='content'] {
      display: grid;
      grid-template-columns: repeat(
        auto-fit,
        minmax(min(100%, var(--wg-metric-group-size-item-minimum)), 1fr)
      );
      min-inline-size: 0;
      gap: var(--wg-metric-group-space-item);
    }

    [part='content'] > slot {
      display: contents;
    }

    [hidden] {
      display: none;
    }

    slot[name='heading']::slotted(*),
    slot[name='description']::slotted(*) {
      margin-block: 0;
      color: inherit;
      font: inherit;
    }

    @container wg-metric-group (inline-size < 40rem) {
      [part='header'] {
        grid-template-columns: minmax(0, 1fr);
      }

      [part='description'],
      [part='actions'] {
        grid-column: 1;
        grid-row: auto;
      }
    }

    @media (forced-colors: active) {
      [part='base'] {
        border-color: CanvasText;
      }
    }
  `;

  declare label: string;
  declare busy: boolean;

  constructor() {
    super();
    this.label = '';
    this.busy = false;
  }

  protected override render() {
    const heading = this.#namedSlotText('heading') || this.label.trim();
    const hasDescription = this.#hasNamedSlot('description');
    const hasActions = this.#hasNamedSlot('actions');

    return html`
      <section
        part="base"
        role="group"
        aria-label=${heading || 'Unlabelled metric group'}
        aria-busy=${this.busy ? 'true' : nothing}
      >
        <header part="header">
          <div part="heading">
            <slot name="heading" @slotchange=${this.#handleSlotChange}>${this.label}</slot>
          </div>
          <div part="description" ?hidden=${!hasDescription}>
            <slot name="description" @slotchange=${this.#handleSlotChange}></slot>
          </div>
          <div part="actions" ?hidden=${!hasActions}>
            <slot name="actions" @slotchange=${this.#handleSlotChange}></slot>
          </div>
        </header>
        <div part="content"><slot></slot></div>
      </section>
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

export function defineWgMetricGroup(registry: CustomElementRegistry = customElements): void {
  defineElement(wgMetricGroupTagName, WgMetricGroup, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-metric-group': WgMetricGroup;
  }
}
