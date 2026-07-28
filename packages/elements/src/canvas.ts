import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const canvasWidths = ['contained', 'full'] as const;
export type CanvasWidth = (typeof canvasWidths)[number];

export const wgCanvasTagName = 'wg-canvas';

export function isCanvasWidth(value: unknown): value is CanvasWidth {
  return typeof value === 'string' && canvasWidths.some((width) => width === value);
}

export class WgCanvas extends WayglassElement {
  static override properties = {
    width: {
      type: String,
      reflect: true,
    },
  };

  static override styles = css`
    :host {
      --wg-canvas-color-background: var(--wg-component-canvas-color-background);
      --wg-canvas-size-content: var(--wg-component-canvas-size-content);
      --wg-canvas-space-block: var(--wg-component-canvas-space-block);
      --wg-canvas-space-inline: var(--wg-component-canvas-space-inline);

      display: block;
      color: var(--wg-color-semantic-text-primary);
      background: var(--wg-canvas-color-background);
      font-family: var(--wg-typography-family-body);
      container-name: wg-canvas;
      container-type: inline-size;
    }

    [part='base'] {
      min-block-size: 100%;
      box-sizing: border-box;
      padding-block: var(--wg-canvas-space-block);
      padding-inline: var(--wg-canvas-space-inline);
    }

    [part='content'] {
      display: grid;
      inline-size: 100%;
      max-inline-size: var(--wg-canvas-size-content);
      box-sizing: border-box;
      gap: var(--wg-space-semantic-section-comfortable);
      margin-inline: auto;
    }

    :host([width='full']) [part='content'] {
      max-inline-size: none;
    }

    slot {
      display: contents;
    }

    /*
     * CSS custom properties cannot be used in container conditions. This
     * implementation constant mirrors the locked breakpoint.phone.wide token.
     */
    @container wg-canvas (inline-size < 40rem) {
      [part='base'] {
        padding-block: var(--wg-space-semantic-page-compact);
        padding-inline: var(--wg-space-semantic-page-compact);
      }
    }
  `;

  declare width: CanvasWidth;

  constructor() {
    super();
    this.width = 'contained';
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'width' && !isCanvasWidth(value)) {
      if (value !== 'contained') {
        this.setAttribute('width', 'contained');
      }
      return;
    }

    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    return html`
      <div part="base">
        <div part="content">
          <slot name="header"></slot>
          <slot></slot>
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}

export function defineWgCanvas(registry: CustomElementRegistry = customElements): void {
  defineElement(wgCanvasTagName, WgCanvas, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-canvas': WgCanvas;
  }
}
