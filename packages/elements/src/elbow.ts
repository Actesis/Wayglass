import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const elbowPlacements = ['start', 'end'] as const;
export type ElbowPlacement = (typeof elbowPlacements)[number];

export const elbowWeights = ['standard', 'strong'] as const;
export type ElbowWeight = (typeof elbowWeights)[number];

export const wgElbowTagName = 'wg-elbow';

export function isElbowPlacement(value: unknown): value is ElbowPlacement {
  return typeof value === 'string' && elbowPlacements.some((placement) => placement === value);
}

export function isElbowWeight(value: unknown): value is ElbowWeight {
  return typeof value === 'string' && elbowWeights.some((weight) => weight === value);
}

export class WgElbow extends WayglassElement {
  static override properties = {
    placement: {
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
      --wg-elbow-color-background: var(--wg-component-elbow-color-background);
      --wg-elbow-color-text: var(--wg-component-elbow-color-text);
      --wg-elbow-size-band: var(--wg-component-elbow-size-band);
      --wg-elbow-radius: var(--wg-component-elbow-radius);
      --wg-elbow-space-inline: var(--wg-component-elbow-space-inline);
      --_wg-elbow-border-width: var(--wg-border-width-standard);

      display: block;
      min-inline-size: 0;
      color: var(--wg-elbow-color-text);
      font-family: var(--wg-typography-family-body);
      container-name: wg-elbow;
      container-type: inline-size;
    }

    :host([weight='strong']) {
      --_wg-elbow-border-width: var(--wg-border-width-strong);
    }

    [part='base'] {
      display: flex;
      align-items: stretch;
      min-inline-size: 0;
    }

    :host([placement='end']) [part='base'] {
      flex-direction: row-reverse;
    }

    [part='label'] {
      min-inline-size: 0;
      padding-block: var(--wg-space-reference-2);
      padding-inline: var(--wg-elbow-space-inline);
      border: var(--_wg-elbow-border-width) solid var(--wg-color-semantic-border-strong);
      border-start-start-radius: var(--wg-elbow-radius);
      border-start-end-radius: var(--wg-elbow-radius);
      color: var(--wg-elbow-color-text);
      background: var(--wg-elbow-color-background);
      font-size: var(--wg-typography-size-section-title);
      font-weight: var(--wg-typography-weight-emphasis);
      overflow-wrap: anywhere;
    }

    [part='join'] {
      flex: 1 1 auto;
      align-self: end;
      min-inline-size: var(--wg-elbow-size-band);
      block-size: var(--wg-elbow-size-band);
      border-end-end-radius: var(--wg-elbow-radius);
      background: var(--wg-color-semantic-structure-band);
    }

    slot::slotted(*) {
      margin-block: 0;
      color: inherit;
      font: inherit;
    }

    :host([placement='end']) [part='join'] {
      border-end-end-radius: 0;
      border-end-start-radius: var(--wg-elbow-radius);
    }

    /*
     * CSS custom properties cannot be used in container conditions. This
     * implementation constant mirrors the locked breakpoint.phone.wide token.
     */
    @container wg-elbow (inline-size < 40rem) {
      [part='base'] {
        display: block;
      }

      [part='label'] {
        border-end-start-radius: 0;
        border-end-end-radius: 0;
      }

      [part='join'] {
        inline-size: 100%;
        min-inline-size: 0;
      }
    }

    @media (forced-colors: active) {
      [part='label'] {
        border-color: CanvasText;
      }

      [part='join'] {
        background: CanvasText;
        forced-color-adjust: auto;
      }
    }
  `;

  declare placement: ElbowPlacement;
  declare weight: ElbowWeight;

  constructor() {
    super();
    this.placement = 'start';
    this.weight = 'standard';
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'placement' && !isElbowPlacement(value)) {
      if (value !== 'start') {
        this.setAttribute('placement', 'start');
      }
      return;
    }

    if (name === 'weight' && !isElbowWeight(value)) {
      if (value !== 'standard') {
        this.setAttribute('weight', 'standard');
      }
      return;
    }

    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    return html`
      <div part="base">
        <div part="label"><slot></slot></div>
        <div part="join" aria-hidden="true"></div>
      </div>
    `;
  }
}

export function defineWgElbow(registry: CustomElementRegistry = customElements): void {
  defineElement(wgElbowTagName, WgElbow, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-elbow': WgElbow;
  }
}
