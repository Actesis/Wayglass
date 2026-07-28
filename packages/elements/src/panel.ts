import { isSectionPurpose } from '@wayglass/core';
import type { SectionPurpose } from '@wayglass/core';
import { css, html, nothing } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const panelEmphases = ['standard', 'strong'] as const;
export type PanelEmphasis = (typeof panelEmphases)[number];

export const wgPanelTagName = 'wg-panel';

export function isPanelEmphasis(value: unknown): value is PanelEmphasis {
  return typeof value === 'string' && panelEmphases.some((emphasis) => emphasis === value);
}

export class WgPanel extends WayglassElement {
  static override properties = {
    purpose: {
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
    disabled: {
      type: Boolean,
      reflect: true,
    },
    label: {
      type: String,
      reflect: true,
    },
  };

  static override styles = css`
    :host {
      --wg-panel-color-background: var(--wg-component-panel-color-background);
      --wg-panel-color-border: var(--wg-component-panel-color-border);
      --wg-panel-color-text: var(--wg-component-panel-color-text);
      --wg-panel-radius: var(--wg-component-panel-radius);
      --wg-panel-space: var(--wg-component-panel-space);
      --wg-panel-space-section: var(--wg-component-panel-space-section);
      --_wg-panel-purpose-color: var(--wg-component-panel-color-information);
      --_wg-panel-boundary-width: var(--wg-border-semantic-section);

      display: block;
      min-inline-size: 0;
      color: var(--wg-panel-color-text);
      font-family: var(--wg-typography-family-body);
      container-name: wg-panel;
      container-type: inline-size;
    }

    :host([purpose='monitor']) {
      --_wg-panel-purpose-color: var(--wg-component-panel-color-monitor);
    }

    :host([purpose='control']) {
      --_wg-panel-purpose-color: var(--wg-component-panel-color-control);
    }

    :host([emphasis='strong']) {
      --_wg-panel-boundary-width: var(--wg-border-semantic-function);
    }

    [part='base'] {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      min-inline-size: 0;
      box-sizing: border-box;
      gap: var(--wg-panel-space-section);
      padding: var(--wg-panel-space);
      border: var(--_wg-panel-boundary-width) solid var(--wg-panel-color-border);
      border-inline-start: var(--wg-border-width-band) solid var(--_wg-panel-purpose-color);
      border-radius: var(--wg-panel-radius);
      color: var(--wg-panel-color-text);
      background: var(--wg-panel-color-background);
    }

    :host([emphasis='strong']) [part='base'] {
      box-shadow: var(--wg-elevation-panel);
    }

    :host([disabled]) [part='base'] {
      opacity: var(--wg-opacity-disabled);
    }

    [part='header'] {
      display: grid;
      align-items: start;
      gap: var(--wg-panel-space-section);
      min-inline-size: 0;
    }

    [part='heading'] {
      min-inline-size: 0;
      font-size: var(--wg-typography-size-section-title);
      font-weight: var(--wg-typography-weight-emphasis);
      overflow-wrap: anywhere;
    }

    [part='description'] {
      color: var(--wg-color-semantic-text-secondary);
      font-size: var(--wg-typography-size-body);
    }

    [part='content'] {
      grid-column: 1 / -1;
      min-inline-size: 0;
    }

    [part='actions'] {
      grid-column: 2;
      grid-row: 1;
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

    slot[name='description']::slotted(*),
    slot[name='progress']::slotted(*) {
      margin-block: 0;
      color: var(--wg-color-semantic-text-secondary);
    }

    slot[name='heading']::slotted(*) {
      margin-block: 0;
      color: inherit;
      font: inherit;
    }

    /*
     * CSS custom properties cannot be used in container conditions. This
     * implementation constant mirrors the locked breakpoint.phone.wide token.
     */
    @container wg-panel (inline-size < 40rem) {
      [part='base'] {
        grid-template-columns: minmax(0, 1fr);
      }

      [part='header'],
      [part='content'],
      [part='actions'] {
        grid-column: 1;
      }

      [part='actions'] {
        grid-row: auto;
      }
    }

    @media (forced-colors: active) {
      [part='base'] {
        border-color: CanvasText;
        border-inline-start-color: CanvasText;
      }
    }
  `;

  declare purpose: SectionPurpose;
  declare emphasis: PanelEmphasis;
  declare busy: boolean;
  declare disabled: boolean;
  declare label: string;

  constructor() {
    super();
    this.purpose = 'information';
    this.emphasis = 'standard';
    this.busy = false;
    this.disabled = false;
    this.label = '';
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'purpose' && !isSectionPurpose(value)) {
      if (value !== 'information') {
        this.setAttribute('purpose', 'information');
      }
      return;
    }

    if (name === 'emphasis' && !isPanelEmphasis(value)) {
      if (value !== 'standard') {
        this.setAttribute('emphasis', 'standard');
      }
      return;
    }

    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    const headingText = this.#namedSlotText('heading');
    const hasHeading = headingText.length > 0;
    const hasDescription = this.#hasNamedSlot('description');
    const hasContent = this.#hasDefaultSlot();
    const hasActions = this.#hasNamedSlot('actions');
    const hasProgress = this.busy && this.#hasNamedSlot('progress');
    const accessibleLabel = headingText || this.label.trim();
    const exposesRegion = accessibleLabel.length > 0;

    return html`
      <section
        part="base"
        role=${exposesRegion ? 'region' : nothing}
        aria-label=${accessibleLabel || nothing}
        aria-busy=${this.busy ? 'true' : nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
      >
        <header part="header" ?hidden=${!hasHeading && !hasDescription}>
          <div id="heading" part="heading" ?hidden=${!hasHeading}>
            <slot name="heading" @slotchange=${this.#handleSlotChange}></slot>
          </div>
          <div part="description" ?hidden=${!hasDescription}>
            <slot name="description" @slotchange=${this.#handleSlotChange}></slot>
          </div>
        </header>
        <div part="content" ?hidden=${!hasContent}>
          <slot @slotchange=${this.#handleSlotChange}></slot>
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

  #hasNamedSlot(name: string, requiresText = false): boolean {
    return Array.from(this.children).some((child) => {
      if (child.getAttribute('slot') !== name) {
        return false;
      }

      return !requiresText || (child.textContent?.trim().length ?? 0) > 0;
    });
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

export function defineWgPanel(registry: CustomElementRegistry = customElements): void {
  defineElement(wgPanelTagName, WgPanel, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-panel': WgPanel;
  }
}
