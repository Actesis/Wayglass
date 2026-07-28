import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const railOrientations = ['block', 'inline'] as const;
export type RailOrientation = (typeof railOrientations)[number];

export const railWeights = ['standard', 'strong'] as const;
export type RailWeight = (typeof railWeights)[number];

export const wgRailTagName = 'wg-rail';

export function isRailOrientation(value: unknown): value is RailOrientation {
  return typeof value === 'string' && railOrientations.some((orientation) => orientation === value);
}

export function isRailWeight(value: unknown): value is RailWeight {
  return typeof value === 'string' && railWeights.some((weight) => weight === value);
}

export class WgRail extends WayglassElement {
  static override properties = {
    orientation: {
      type: String,
      reflect: true,
    },
    weight: {
      type: String,
      reflect: true,
    },
  };

  static override styles = css`
    :host {
      --wg-rail-color: var(--wg-component-rail-color);
      --wg-rail-size-standard: var(--wg-component-rail-size-standard);
      --wg-rail-size-strong: var(--wg-component-rail-size-strong);
      --wg-rail-radius: var(--wg-component-rail-radius);
      --_wg-rail-size: var(--wg-rail-size-standard);

      display: block;
      align-self: stretch;
      inline-size: var(--_wg-rail-size);
      min-block-size: var(--_wg-rail-size);
    }

    :host([weight='strong']) {
      --_wg-rail-size: var(--wg-rail-size-strong);
    }

    :host([orientation='inline']) {
      inline-size: 100%;
      block-size: var(--_wg-rail-size);
      min-block-size: 0;
    }

    [part='band'] {
      inline-size: 100%;
      block-size: 100%;
      border-radius: var(--wg-rail-radius);
      background: var(--wg-rail-color);
    }

    @media (forced-colors: active) {
      [part='band'] {
        background: CanvasText;
        forced-color-adjust: auto;
      }
    }
  `;

  declare orientation: RailOrientation;
  declare weight: RailWeight;

  constructor() {
    super();
    this.orientation = 'block';
    this.weight = 'standard';
    this.setAttribute('aria-hidden', 'true');
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'orientation' && !isRailOrientation(value)) {
      if (value !== 'block') {
        this.setAttribute('orientation', 'block');
      }
      return;
    }

    if (name === 'weight' && !isRailWeight(value)) {
      if (value !== 'standard') {
        this.setAttribute('weight', 'standard');
      }
      return;
    }

    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    return html`<div part="band"></div>`;
  }
}

export function defineWgRail(registry: CustomElementRegistry = customElements): void {
  defineElement(wgRailTagName, WgRail, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-rail': WgRail;
  }
}
