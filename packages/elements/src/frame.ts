import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const frameBoundaries = ['standard', 'strong'] as const;
export type FrameBoundary = (typeof frameBoundaries)[number];

export const framePaddings = ['none', 'compact', 'comfortable'] as const;
export type FramePadding = (typeof framePaddings)[number];

export const wgFrameTagName = 'wg-frame';

export function isFrameBoundary(value: unknown): value is FrameBoundary {
  return typeof value === 'string' && frameBoundaries.some((boundary) => boundary === value);
}

export function isFramePadding(value: unknown): value is FramePadding {
  return typeof value === 'string' && framePaddings.some((padding) => padding === value);
}

export class WgFrame extends WayglassElement {
  static override properties = {
    boundary: { type: String, reflect: true },
    padding: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-frame-color-background: var(--wg-component-frame-color-background);
      --wg-frame-color-border: var(--wg-component-frame-color-border);
      --wg-frame-border-size: var(--wg-component-frame-border-size-standard);
      --wg-frame-radius: var(--wg-component-frame-radius);
      --wg-frame-padding: var(--wg-component-frame-space-comfortable);

      display: block;
      min-inline-size: 0;
      block-size: 100%;
      container-name: wg-frame;
      container-type: inline-size;
    }

    :host([boundary='strong']) {
      --wg-frame-border-size: var(--wg-component-frame-border-size-strong);
    }

    :host([padding='none']) {
      --wg-frame-padding: 0;
    }

    :host([padding='compact']) {
      --wg-frame-padding: var(--wg-component-frame-space-compact);
    }

    [part='base'] {
      min-inline-size: 0;
      block-size: 100%;
      box-sizing: border-box;
      padding: var(--wg-frame-padding);
      border: var(--wg-frame-border-size) solid var(--wg-frame-color-border);
      border-radius: var(--wg-frame-radius);
      color: inherit;
      background: var(--wg-frame-color-background);
    }

    @media (forced-colors: active) {
      [part='base'] {
        border-color: CanvasText;
        background: Canvas;
      }
    }
  `;

  declare boundary: FrameBoundary;
  declare padding: FramePadding;

  constructor() {
    super();
    this.boundary = 'standard';
    this.padding = 'comfortable';
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'boundary' && !isFrameBoundary(value)) {
      if (value !== 'standard') this.setAttribute('boundary', 'standard');
      return;
    }
    if (name === 'padding' && !isFramePadding(value)) {
      if (value !== 'comfortable') this.setAttribute('padding', 'comfortable');
      return;
    }
    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    return html`<div part="base"><slot></slot></div>`;
  }
}

export function defineWgFrame(registry: CustomElementRegistry = customElements): void {
  defineElement(wgFrameTagName, WgFrame, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-frame': WgFrame;
  }
}
