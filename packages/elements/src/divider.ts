import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const dividerOrientations = ['horizontal', 'vertical'] as const;
export type DividerOrientation = (typeof dividerOrientations)[number];

export const dividerWeights = ['standard', 'strong'] as const;
export type DividerWeight = (typeof dividerWeights)[number];

export const wgDividerTagName = 'wg-divider';

export function isDividerOrientation(value: unknown): value is DividerOrientation {
  return (
    typeof value === 'string' && dividerOrientations.some((orientation) => orientation === value)
  );
}

export function isDividerWeight(value: unknown): value is DividerWeight {
  return typeof value === 'string' && dividerWeights.some((weight) => weight === value);
}

export class WgDivider extends WayglassElement {
  static override properties = {
    orientation: {
      type: String,
      reflect: true,
    },
    weight: {
      type: String,
      reflect: true,
    },
    decorative: {
      type: Boolean,
      reflect: true,
    },
  };

  static override styles = css`
    :host {
      --wg-divider-color: var(--wg-component-divider-color);
      --wg-divider-size: var(--wg-component-divider-size-standard);

      display: block;
      align-self: stretch;
      inline-size: 100%;
      block-size: var(--wg-divider-size);
      min-inline-size: 0;
      min-block-size: var(--wg-divider-size);
    }

    :host([weight='strong']) {
      --wg-divider-size: var(--wg-component-divider-size-strong);
    }

    :host([orientation='vertical']) {
      inline-size: var(--wg-divider-size);
      block-size: 100%;
      min-inline-size: var(--wg-divider-size);
    }

    [part='line'] {
      inline-size: 100%;
      block-size: 100%;
      background: var(--wg-divider-color);
    }

    @media (forced-colors: active) {
      [part='line'] {
        background: CanvasText;
        forced-color-adjust: auto;
      }
    }
  `;

  declare orientation: DividerOrientation;
  declare weight: DividerWeight;
  declare decorative: boolean;

  constructor() {
    super();
    this.orientation = 'horizontal';
    this.weight = 'standard';
    this.decorative = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#syncSemantics();
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'orientation' && !isDividerOrientation(value)) {
      if (value !== 'horizontal') {
        this.setAttribute('orientation', 'horizontal');
      }
      return;
    }

    if (name === 'weight' && !isDividerWeight(value)) {
      if (value !== 'standard') {
        this.setAttribute('weight', 'standard');
      }
      return;
    }

    super.attributeChangedCallback(name, previous, value);

    if (this.isConnected) {
      this.#syncSemantics();
    }
  }

  #syncSemantics(): void {
    if (this.hasAttribute('decorative')) {
      this.removeAttribute('role');
      this.removeAttribute('aria-orientation');
      this.setAttribute('aria-hidden', 'true');
      return;
    }

    this.removeAttribute('aria-hidden');
    this.setAttribute('role', 'separator');
    this.setAttribute(
      'aria-orientation',
      this.getAttribute('orientation') === 'vertical' ? 'vertical' : 'horizontal',
    );
  }

  protected override render() {
    return html`<div part="line" aria-hidden="true"></div>`;
  }
}

export function defineWgDivider(registry: CustomElementRegistry = customElements): void {
  defineElement(wgDividerTagName, WgDivider, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-divider': WgDivider;
  }
}
