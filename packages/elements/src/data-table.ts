import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgDataTableTagName = 'wg-data-table';

export class WgDataTable extends WayglassElement {
  static override styles = css`
    :host {
      --wg-data-table-color-background: var(--wg-component-data-table-color-background);
      --wg-data-table-color-table-background: var(--wg-component-data-table-color-table-background);
      --wg-data-table-color-border: var(--wg-component-data-table-color-border);
      --wg-data-table-color-row-separator: var(--wg-component-data-table-color-row-separator);
      --wg-data-table-color-caption: var(--wg-component-data-table-color-caption);
      --wg-data-table-color-header: var(--wg-component-data-table-color-header);
      --wg-data-table-color-text: var(--wg-component-data-table-color-text);
      --wg-data-table-color-context: var(--wg-component-data-table-color-context);
      --wg-data-table-radius: var(--wg-component-data-table-radius);
      --wg-data-table-space: var(--wg-component-data-table-space);
      --wg-data-table-space-group: var(--wg-component-data-table-space-group);
      --wg-data-table-space-cell-block: var(--wg-component-data-table-space-cell-block);
      --wg-data-table-space-cell-inline: var(--wg-component-data-table-space-cell-inline);

      display: block;
      min-inline-size: 0;
      color: var(--wg-data-table-color-text);
      font-family: var(--wg-typography-family-body);
    }

    [part='base'] {
      display: grid;
      min-inline-size: 0;
      box-sizing: border-box;
      gap: var(--wg-data-table-space-group);
      padding: var(--wg-data-table-space);
      border-radius: var(--wg-data-table-radius);
      background: var(--wg-data-table-color-background);
    }

    [part='context'],
    [part='feedback'] {
      min-inline-size: 0;
      color: var(--wg-data-table-color-context);
      font-size: var(--wg-typography-size-body);
      overflow-wrap: anywhere;
    }

    [hidden] {
      display: none;
    }

    slot[name='context']::slotted(*),
    slot[name='feedback']::slotted(*) {
      margin-block: 0;
      color: inherit;
      font: inherit;
    }

    slot:not([name])::slotted(wg-scroll-region) {
      min-inline-size: 0;
      --wg-scroll-region-color-border: var(--wg-data-table-color-border);
    }

    .unsupported {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-data-table-space-group);
    }

    @media (forced-colors: active) {
      [part='base'] {
        background: Canvas;
      }

      [part='context'],
      [part='feedback'] {
        color: CanvasText;
      }
    }
  `;

  #lastDiagnostic = '';

  protected override updated(): void {
    const diagnostic = this.#validateAnatomy();
    if (diagnostic && diagnostic !== this.#lastDiagnostic) {
      console.warn(`[wg-data-table] ${diagnostic}`);
    }
    this.#lastDiagnostic = diagnostic ?? '';
  }

  protected override render() {
    const hasContext = this.#hasNamedSlot('context');
    const hasFeedback = this.#hasNamedSlot('feedback');
    const unknownSlots = this.#unknownSlots();

    return html`
      <div part="base">
        <div part="context" ?hidden=${!hasContext}>
          <slot name="context" @slotchange=${this.#handleSlotChange}></slot>
        </div>
        <slot @slotchange=${this.#handleSlotChange}></slot>
        <div part="feedback" ?hidden=${!hasFeedback}>
          <slot name="feedback" @slotchange=${this.#handleSlotChange}></slot>
        </div>
        <div class="unsupported" ?hidden=${unknownSlots.length === 0}>
          ${unknownSlots.map(
            (name) => html`<slot name=${name} @slotchange=${this.#handleSlotChange}></slot>`,
          )}
        </div>
      </div>
    `;
  }

  readonly #handleSlotChange = (): void => this.requestUpdate();

  #hasNamedSlot(name: string): boolean {
    return Array.from(this.children).some((child) => child.getAttribute('slot') === name);
  }

  #unknownSlots(): string[] {
    return [
      ...new Set(
        Array.from(this.children)
          .map((child) => child.getAttribute('slot'))
          .filter(
            (slot): slot is string => slot !== null && !['context', 'feedback'].includes(slot),
          ),
      ),
    ];
  }

  #validateAnatomy(): string | undefined {
    const defaultChildren = Array.from(this.children).filter(
      (child) => !child.hasAttribute('slot'),
    );
    const scrollRegion = defaultChildren[0];
    const unknownSlots = this.#unknownSlots();
    const problems: string[] = [];

    if (defaultChildren.length !== 1 || scrollRegion?.localName !== 'wg-scroll-region') {
      problems.push('default content must be exactly one direct wg-scroll-region');
    } else {
      if (scrollRegion.getAttribute('axis') !== 'inline') {
        problems.push('the direct wg-scroll-region must use axis="inline"');
      }
      const tableChildren = Array.from(scrollRegion.children);
      if (tableChildren.length !== 1 || tableChildren[0]?.localName !== 'table') {
        problems.push('the direct wg-scroll-region must contain exactly one direct table');
      }
    }
    if (unknownSlots.length > 0) {
      problems.push(`unsupported named slots are preserved: ${unknownSlots.join(', ')}`);
    }

    return problems.length > 0 ? `${problems.join('; ')}.` : undefined;
  }
}

export function defineWgDataTable(registry: CustomElementRegistry = customElements): void {
  defineElement(wgDataTableTagName, WgDataTable, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-data-table': WgDataTable;
  }
}
