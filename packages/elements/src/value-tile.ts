import { css, html, nothing } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const valueTileEmphases = ['standard', 'prominent'] as const;
export type ValueTileEmphasis = (typeof valueTileEmphases)[number];

export const wgValueTileTagName = 'wg-value-tile';

export function isValueTileEmphasis(value: unknown): value is ValueTileEmphasis {
  return typeof value === 'string' && valueTileEmphases.some((emphasis) => emphasis === value);
}

export class WgValueTile extends WayglassElement {
  static override properties = {
    label: {
      type: String,
      reflect: true,
    },
    emphasis: {
      type: String,
      reflect: true,
    },
    busy: {
      type: Boolean,
      reflect: true,
    },
  };

  static override styles = css`
    :host {
      --wg-value-tile-color-background: var(--wg-component-value-tile-color-background);
      --wg-value-tile-color-border: var(--wg-component-value-tile-color-border);
      --wg-value-tile-radius: var(--wg-component-value-tile-radius);
      --wg-value-tile-space: var(--wg-component-value-tile-space);
      --wg-value-tile-space-section: var(--wg-component-value-tile-space-section);
      --_wg-value-tile-boundary-width: var(--wg-border-semantic-section);

      display: block;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
      container-name: wg-value-tile;
      container-type: inline-size;
    }

    :host([emphasis='prominent']) {
      --_wg-value-tile-boundary-width: var(--wg-border-semantic-function);
    }

    [part='base'] {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      min-inline-size: 0;
      box-sizing: border-box;
      gap: var(--wg-value-tile-space-section) var(--wg-value-tile-space);
      padding: var(--wg-value-tile-space);
      border: var(--_wg-value-tile-boundary-width) solid var(--wg-value-tile-color-border);
      border-radius: var(--wg-value-tile-radius);
      background: var(--wg-value-tile-color-background);
    }

    :host([emphasis='prominent']) [part='base'] {
      box-shadow: var(--wg-elevation-panel);
    }

    [part='header'] {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-value-tile-space-section);
    }

    [part='heading'] {
      min-inline-size: 0;
      font-size: var(--wg-typography-size-section);
      font-weight: var(--wg-typography-weight-emphasis);
      overflow-wrap: anywhere;
    }

    [part='status'] {
      grid-column: 2;
      grid-row: 1;
      min-inline-size: 0;
    }

    [part='value'] {
      grid-column: 1 / -1;
      min-inline-size: 0;
    }

    [part='content'],
    [part='metadata'] {
      grid-column: 1;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-secondary);
      font-size: var(--wg-typography-size-body);
    }

    [part='metadata'] {
      font-size: var(--wg-typography-size-label);
    }

    [part='actions'] {
      grid-column: 2;
      grid-row: 3 / span 2;
      min-inline-size: 0;
    }

    [part='progress'] {
      grid-column: 1 / -1;
      color: var(--wg-color-semantic-text-secondary);
      font-size: var(--wg-typography-size-label);
      font-weight: var(--wg-typography-weight-medium);
    }

    [hidden] {
      display: none;
    }

    slot {
      display: contents;
    }

    slot[name='heading']::slotted(*),
    slot[name='metadata']::slotted(*),
    slot[name='progress']::slotted(*) {
      margin-block: 0;
      color: inherit;
      font: inherit;
    }

    /*
     * CSS custom properties cannot be used in container conditions. This
     * implementation constant mirrors the locked breakpoint.phone.wide token.
     */
    @container wg-value-tile (inline-size < 40rem) {
      [part='base'] {
        grid-template-columns: minmax(0, 1fr);
      }

      [part='header'],
      [part='status'],
      [part='value'],
      [part='content'],
      [part='metadata'],
      [part='actions'],
      [part='progress'] {
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
  declare emphasis: ValueTileEmphasis;
  declare busy: boolean;

  constructor() {
    super();
    this.label = '';
    this.emphasis = 'standard';
    this.busy = false;
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'emphasis' && !isValueTileEmphasis(value)) {
      if (value !== 'standard') {
        this.setAttribute('emphasis', 'standard');
      }
      return;
    }

    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    const headingText = this.#namedSlotText('heading');
    const accessibleLabel = headingText || this.label.trim();
    const hasHeading = headingText.length > 0;
    const hasValue = this.#hasNamedSlot('value');
    const hasStatus = this.#hasNamedSlot('status');
    const hasContent = this.#hasDefaultSlot();
    const hasMetadata = this.#hasNamedSlot('metadata');
    const hasActions = this.#hasNamedSlot('actions');
    const hasProgress = this.busy && this.#hasNamedSlot('progress');

    return html`
      <section
        part="base"
        role=${accessibleLabel ? 'region' : nothing}
        aria-label=${accessibleLabel || nothing}
        aria-busy=${this.busy ? 'true' : nothing}
      >
        <header part="header" ?hidden=${!hasHeading}>
          <div part="heading">
            <slot name="heading" @slotchange=${this.#handleSlotChange}></slot>
          </div>
        </header>
        <div part="status" ?hidden=${!hasStatus}>
          <slot name="status" @slotchange=${this.#handleSlotChange}></slot>
        </div>
        <div part="value" ?hidden=${!hasValue}>
          <slot name="value" @slotchange=${this.#handleSlotChange}></slot>
        </div>
        <div part="content" ?hidden=${!hasContent}>
          <slot @slotchange=${this.#handleSlotChange}></slot>
        </div>
        <div part="metadata" ?hidden=${!hasMetadata}>
          <slot name="metadata" @slotchange=${this.#handleSlotChange}></slot>
        </div>
        <div part="actions" ?hidden=${!hasActions}>
          <slot name="actions" @slotchange=${this.#handleSlotChange}></slot>
        </div>
        <div part="progress" ?hidden=${!hasProgress} aria-live="polite">
          <slot name="progress" @slotchange=${this.#handleSlotChange}></slot>
        </div>
      </section>
    `;
  }

  readonly #handleSlotChange = (): void => {
    this.requestUpdate();
  };

  #hasNamedSlot(name: string): boolean {
    return Array.from(this.children).some((child) => child.getAttribute('slot') === name);
  }

  #namedSlotText(name: string): string {
    return Array.from(this.children)
      .filter((child) => child.getAttribute('slot') === name)
      .map((child) => child.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ');
  }

  #hasDefaultSlot(): boolean {
    return Array.from(this.childNodes).some((node) => {
      if (node instanceof Element) {
        return !node.hasAttribute('slot');
      }

      return (node.textContent?.trim().length ?? 0) > 0;
    });
  }
}

export function defineWgValueTile(registry: CustomElementRegistry = customElements): void {
  defineElement(wgValueTileTagName, WgValueTile, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-value-tile': WgValueTile;
  }
}
