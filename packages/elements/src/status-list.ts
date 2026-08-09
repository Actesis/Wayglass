import { css, html, nothing } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgStatusListTagName = 'wg-status-list';

export class WgStatusList extends WayglassElement {
  static override properties = {
    label: { type: String, reflect: true },
    busy: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-status-list-color-background: var(--wg-component-status-list-color-background);
      --wg-status-list-color-border: var(--wg-component-status-list-color-border);
      --wg-status-list-color-heading: var(--wg-component-status-list-color-heading);
      --wg-status-list-color-context: var(--wg-component-status-list-color-context);
      --wg-status-list-radius: var(--wg-component-status-list-radius);
      --wg-status-list-space: var(--wg-component-status-list-space);
      --wg-status-list-space-entry: var(--wg-component-status-list-space-entry);

      display: block;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
      container-name: wg-status-list;
      container-type: inline-size;
    }

    [part='base'] {
      display: grid;
      min-inline-size: 0;
      box-sizing: border-box;
      gap: var(--wg-status-list-space);
      padding: var(--wg-status-list-space);
      border: var(--wg-border-semantic-section) solid var(--wg-status-list-color-border);
      border-radius: var(--wg-status-list-radius);
      background: var(--wg-status-list-color-background);
    }

    [part='header'] {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      min-inline-size: 0;
      gap: var(--wg-status-list-space-entry) var(--wg-status-list-space);
    }

    [part='heading'],
    [part='description'],
    [part='status'],
    [part='actions'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    [part='heading'] {
      color: var(--wg-status-list-color-heading);
      font-size: var(--wg-typography-size-section);
      font-weight: var(--wg-typography-weight-emphasis);
    }

    [part='description'],
    [part='status'] {
      color: var(--wg-status-list-color-context);
      font-size: var(--wg-typography-size-body);
    }

    [part='description'] {
      grid-column: 1;
    }

    [part='actions'] {
      grid-column: 2;
      grid-row: 1 / span 2;
    }

    [part='list'] {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-status-list-space-entry);
    }

    [part='list'] > slot {
      display: contents;
    }

    [hidden] {
      display: none;
    }

    slot[name='heading']::slotted(*),
    slot[name='description']::slotted(*),
    slot[name='status']::slotted(*) {
      margin-block: 0;
      color: inherit;
      font: inherit;
    }

    @container wg-status-list (inline-size < 36rem) {
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
        background: Canvas;
      }
    }
  `;

  declare label: string;
  declare busy: boolean;

  #lastDiagnostic = '';

  constructor() {
    super();
    this.label = '';
    this.busy = false;
  }

  protected override updated(): void {
    const diagnostic = this.#validateChildren();
    if (diagnostic && diagnostic !== this.#lastDiagnostic) {
      console.warn(`[wg-status-list] ${diagnostic}`);
    }
    this.#lastDiagnostic = diagnostic ?? '';
  }

  protected override render() {
    const heading = this.#namedSlotText('heading') || this.label.trim();
    const hasDescription = this.#hasNamedSlot('description');
    const hasActions = this.#hasNamedSlot('actions');
    const hasStatus = this.#hasNamedSlot('status');

    return html`
      <section part="base">
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
        <div part="status" ?hidden=${!hasStatus}>
          <slot name="status" @slotchange=${this.#handleSlotChange}></slot>
        </div>
        <div
          part="list"
          role="list"
          aria-label=${heading || 'Unlabelled status list'}
          aria-busy=${this.busy ? 'true' : nothing}
        >
          <slot @slotchange=${this.#handleSlotChange}></slot>
        </div>
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

  #validateChildren(): string | undefined {
    const unsupported = Array.from(this.children).filter(
      (child) => !child.hasAttribute('slot') && child.localName !== 'wg-status-entry',
    );
    if (unsupported.length === 0) return undefined;

    const names = [...new Set(unsupported.map((child) => child.localName))].join(', ');
    return `Default content should contain direct wg-status-entry children; preserving unsupported: ${names}.`;
  }
}

export function defineWgStatusList(registry: CustomElementRegistry = customElements): void {
  defineElement(wgStatusListTagName, WgStatusList, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-status-list': WgStatusList;
  }
}
