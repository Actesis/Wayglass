import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgFilterBarTagName = 'wg-filter-bar';

export class WgFilterBar extends WayglassElement {
  static override properties = {
    label: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-filter-bar-color-background: var(--wg-component-filter-bar-color-background);
      --wg-filter-bar-color-border: var(--wg-component-filter-bar-color-border);
      --wg-filter-bar-color-heading: var(--wg-component-filter-bar-color-heading);
      --wg-filter-bar-color-context: var(--wg-component-filter-bar-color-context);
      --wg-filter-bar-radius: var(--wg-component-filter-bar-radius);
      --wg-filter-bar-space: var(--wg-component-filter-bar-space);
      --wg-filter-bar-space-group: var(--wg-component-filter-bar-space-group);

      display: block;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
      container-name: wg-filter-bar;
      container-type: inline-size;
    }

    [part='base'] {
      display: grid;
      min-inline-size: 0;
      box-sizing: border-box;
      gap: var(--wg-filter-bar-space);
      padding: var(--wg-filter-bar-space);
      border: var(--wg-border-semantic-section) solid var(--wg-filter-bar-color-border);
      border-radius: var(--wg-filter-bar-radius);
      background: var(--wg-filter-bar-color-background);
    }

    [part='header'] {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-filter-bar-space-group);
    }

    [part='heading'],
    [part='description'],
    [part='content'],
    [part='summary'],
    [part='status'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    [part='heading'] {
      color: var(--wg-filter-bar-color-heading);
      font-size: var(--wg-typography-size-section);
      font-weight: var(--wg-typography-weight-emphasis);
    }

    [part='description'],
    [part='summary'],
    [part='status'] {
      color: var(--wg-filter-bar-color-context);
      font-size: var(--wg-typography-size-body);
    }

    [part='content'] > slot {
      display: block;
    }

    [hidden] {
      display: none;
    }

    slot[name='heading']::slotted(*),
    slot[name='description']::slotted(*),
    slot[name='summary']::slotted(*),
    slot[name='status']::slotted(*) {
      margin-block: 0;
      color: inherit;
      font: inherit;
    }

    slot:not([name])::slotted(form) {
      min-inline-size: 0;
      margin-block: 0;
    }

    .unsupported {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-filter-bar-space-group);
    }

    /* Private mechanical threshold: reflow before authored form content creates overflow. */
    @container wg-filter-bar (inline-size < 36rem) {
      [part='base'] {
        gap: var(--wg-filter-bar-space-group);
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

  #lastDiagnostic = '';

  constructor() {
    super();
    this.label = '';
  }

  protected override updated(): void {
    const diagnostic = this.#validateAnatomy();
    if (diagnostic && diagnostic !== this.#lastDiagnostic) {
      console.warn(`[wg-filter-bar] ${diagnostic}`);
    }
    this.#lastDiagnostic = diagnostic ?? '';
  }

  protected override render() {
    const heading = this.#namedSlotText('heading') || this.label.trim();
    const hasDescription = this.#hasNamedSlot('description');
    const hasSummary = this.#hasNamedSlot('summary');
    const hasStatus = this.#hasNamedSlot('status');
    const unknownSlots = this.#unknownSlots();

    return html`
      <section part="base" aria-label=${heading || 'Unlabelled filter area'}>
        <header part="header">
          <div part="heading">
            <slot name="heading" @slotchange=${this.#handleSlotChange}>${this.label}</slot>
          </div>
          <div part="description" ?hidden=${!hasDescription}>
            <slot name="description" @slotchange=${this.#handleSlotChange}></slot>
          </div>
        </header>
        <div part="content"><slot @slotchange=${this.#handleSlotChange}></slot></div>
        <div part="summary" ?hidden=${!hasSummary}>
          <slot name="summary" @slotchange=${this.#handleSlotChange}></slot>
        </div>
        <div part="status" ?hidden=${!hasStatus}>
          <slot name="status" @slotchange=${this.#handleSlotChange}></slot>
        </div>
        <div class="unsupported" ?hidden=${unknownSlots.length === 0}>
          ${unknownSlots.map(
            (name) => html`<slot name=${name} @slotchange=${this.#handleSlotChange}></slot>`,
          )}
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

  #unknownSlots(): string[] {
    return [
      ...new Set(
        Array.from(this.children)
          .map((child) => child.getAttribute('slot'))
          .filter(
            (slot): slot is string =>
              slot !== null && !['heading', 'description', 'summary', 'status'].includes(slot),
          ),
      ),
    ];
  }

  #validateAnatomy(): string | undefined {
    const children = Array.from(this.children);
    const defaultChildren = children.filter((child) => !child.hasAttribute('slot'));
    const unknownSlots = this.#unknownSlots();
    const problems: string[] = [];

    if (!this.label.trim()) problems.push('a non-empty label attribute is required');
    if (defaultChildren.length !== 1 || defaultChildren[0]?.localName !== 'form') {
      problems.push('default content must be exactly one direct form');
    }
    if (unknownSlots.length > 0) {
      problems.push(`unsupported named slots are preserved: ${unknownSlots.join(', ')}`);
    }

    return problems.length > 0 ? `${problems.join('; ')}.` : undefined;
  }
}

export function defineWgFilterBar(registry: CustomElementRegistry = customElements): void {
  defineElement(wgFilterBarTagName, WgFilterBar, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-filter-bar': WgFilterBar;
  }
}
