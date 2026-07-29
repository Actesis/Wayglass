import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const surfaceTones = ['panel', 'inset', 'raised'] as const;
export type SurfaceTone = (typeof surfaceTones)[number];

export const surfaceBoundaries = ['none', 'subtle', 'strong'] as const;
export type SurfaceBoundary = (typeof surfaceBoundaries)[number];

export const surfacePaddings = ['none', 'compact', 'comfortable'] as const;
export type SurfacePadding = (typeof surfacePaddings)[number];

export const wgSurfaceTagName = 'wg-surface';

export function isSurfaceTone(value: unknown): value is SurfaceTone {
  return typeof value === 'string' && surfaceTones.some((tone) => tone === value);
}

export function isSurfaceBoundary(value: unknown): value is SurfaceBoundary {
  return typeof value === 'string' && surfaceBoundaries.some((boundary) => boundary === value);
}

export function isSurfacePadding(value: unknown): value is SurfacePadding {
  return typeof value === 'string' && surfacePaddings.some((padding) => padding === value);
}

export class WgSurface extends WayglassElement {
  static override properties = {
    tone: {
      type: String,
      reflect: true,
    },
    boundary: {
      type: String,
      reflect: true,
    },
    padding: {
      type: String,
      reflect: true,
    },
  };

  static override styles = css`
    :host {
      --wg-surface-color-background: var(--wg-component-surface-color-panel);
      --wg-surface-color-border: var(--wg-component-surface-color-border);
      --wg-surface-radius: var(--wg-component-surface-radius);
      --wg-surface-padding: var(--wg-component-surface-space-comfortable);
      --wg-surface-elevation: none;
      --_wg-surface-border-size: var(--wg-border-width-standard);

      display: block;
      min-inline-size: 0;
    }

    :host([tone='inset']) {
      --wg-surface-color-background: var(--wg-component-surface-color-inset);
    }

    :host([tone='raised']) {
      --wg-surface-color-background: var(--wg-component-surface-color-raised);
      --wg-surface-elevation: var(--wg-component-surface-elevation);
    }

    :host([boundary='none']) {
      --_wg-surface-border-size: 0;
    }

    :host([boundary='strong']) {
      --wg-surface-color-border: var(--wg-component-surface-color-border-strong);
      --_wg-surface-border-size: var(--wg-border-width-strong);
    }

    :host([padding='none']) {
      --wg-surface-padding: 0;
    }

    :host([padding='compact']) {
      --wg-surface-padding: var(--wg-component-surface-space-compact);
    }

    [part='base'] {
      min-inline-size: 0;
      block-size: 100%;
      box-sizing: border-box;
      padding: var(--wg-surface-padding);
      border: var(--_wg-surface-border-size) solid var(--wg-surface-color-border);
      border-radius: var(--wg-surface-radius);
      color: inherit;
      background: var(--wg-surface-color-background);
      box-shadow: var(--wg-surface-elevation);
    }

    @media (forced-colors: active) {
      [part='base'] {
        border-color: CanvasText;
        background: Canvas;
        box-shadow: none;
      }
    }
  `;

  declare tone: SurfaceTone;
  declare boundary: SurfaceBoundary;
  declare padding: SurfacePadding;

  constructor() {
    super();
    this.tone = 'panel';
    this.boundary = 'subtle';
    this.padding = 'comfortable';
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'tone' && !isSurfaceTone(value)) {
      if (value !== 'panel') {
        this.setAttribute('tone', 'panel');
      }
      return;
    }

    if (name === 'boundary' && !isSurfaceBoundary(value)) {
      if (value !== 'subtle') {
        this.setAttribute('boundary', 'subtle');
      }
      return;
    }

    if (name === 'padding' && !isSurfacePadding(value)) {
      if (value !== 'comfortable') {
        this.setAttribute('padding', 'comfortable');
      }
      return;
    }

    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    return html`<div part="base"><slot></slot></div>`;
  }
}

export function defineWgSurface(registry: CustomElementRegistry = customElements): void {
  defineElement(wgSurfaceTagName, WgSurface, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-surface': WgSurface;
  }
}
