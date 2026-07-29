import { css, html } from 'lit';

import {
  isLayoutAlignment,
  isLayoutMinimum,
  isLayoutSpace,
  type LayoutAlignment,
  type LayoutMinimum,
  type LayoutSpace,
} from './layout-values.js';
import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export {
  isLayoutAlignment,
  isLayoutMinimum,
  isLayoutSpace,
  layoutAlignments,
  layoutMinimums,
  layoutSpaces,
} from './layout-values.js';
export type { LayoutAlignment, LayoutMinimum, LayoutSpace } from './layout-values.js';

export const splitRatios = ['equal', 'primary', 'secondary'] as const;
export type SplitRatio = (typeof splitRatios)[number];

export const wgSplitTagName = 'wg-split';

export function isSplitRatio(value: unknown): value is SplitRatio {
  return typeof value === 'string' && splitRatios.some((ratio) => ratio === value);
}

export class WgSplit extends WayglassElement {
  static override properties = {
    space: { type: String, reflect: true },
    ratio: { type: String, reflect: true },
    minimum: { type: String, reflect: true },
    align: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-split-space: var(--wg-component-layout-space-section);
      --wg-split-region-minimum: var(--wg-component-split-region-minimum-standard);
      --wg-split-primary-ratio: var(--wg-component-split-ratio-equal);
      --wg-split-secondary-ratio: var(--wg-component-split-ratio-equal);

      display: block;
      min-inline-size: 0;
      container-name: wg-split;
      container-type: inline-size;
    }

    :host([space='none']) {
      --wg-split-space: 0;
    }

    :host([space='related']) {
      --wg-split-space: var(--wg-component-layout-space-related);
    }

    :host([space='function']) {
      --wg-split-space: var(--wg-component-layout-space-function);
    }

    :host([minimum='compact']) {
      --wg-split-region-minimum: var(--wg-component-split-region-minimum-compact);
    }

    :host([minimum='wide']) {
      --wg-split-region-minimum: var(--wg-component-split-region-minimum-wide);
    }

    :host([ratio='primary']) {
      --wg-split-primary-ratio: var(--wg-component-split-ratio-emphasized);
    }

    :host([ratio='secondary']) {
      --wg-split-secondary-ratio: var(--wg-component-split-ratio-emphasized);
    }

    [part='base'] {
      display: grid;
      min-inline-size: 0;
      grid-template-columns: minmax(0, 1fr);
      align-items: stretch;
      gap: var(--wg-split-space);
    }

    [part='primary'],
    [part='secondary'] {
      min-inline-size: 0;
    }

    :host([align='start']) [part='base'] {
      align-items: start;
    }

    :host([align='center']) [part='base'] {
      align-items: center;
    }

    :host([align='end']) [part='base'] {
      align-items: end;
    }

    /*
     * CSS custom properties cannot be used in container conditions. These
     * constants mirror component.split.breakpoint.compact|standard|wide.
     */
    @container wg-split (inline-size >= 26rem) {
      :host([minimum='compact']) [part='base'] {
        grid-template-columns:
          minmax(var(--wg-split-region-minimum), var(--wg-split-primary-ratio))
          minmax(var(--wg-split-region-minimum), var(--wg-split-secondary-ratio));
      }
    }

    @container wg-split (inline-size >= 38rem) {
      :host(:not([minimum='compact']):not([minimum='wide'])) [part='base'] {
        grid-template-columns:
          minmax(var(--wg-split-region-minimum), var(--wg-split-primary-ratio))
          minmax(var(--wg-split-region-minimum), var(--wg-split-secondary-ratio));
      }
    }

    @container wg-split (inline-size >= 50rem) {
      :host([minimum='wide']) [part='base'] {
        grid-template-columns:
          minmax(var(--wg-split-region-minimum), var(--wg-split-primary-ratio))
          minmax(var(--wg-split-region-minimum), var(--wg-split-secondary-ratio));
      }
    }
  `;

  declare space: LayoutSpace;
  declare ratio: SplitRatio;
  declare minimum: LayoutMinimum;
  declare align: LayoutAlignment;

  constructor() {
    super();
    this.space = 'section';
    this.ratio = 'equal';
    this.minimum = 'standard';
    this.align = 'stretch';
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'space' && !isLayoutSpace(value)) {
      if (value !== 'section') this.setAttribute('space', 'section');
      return;
    }
    if (name === 'ratio' && !isSplitRatio(value)) {
      if (value !== 'equal') this.setAttribute('ratio', 'equal');
      return;
    }
    if (name === 'minimum' && !isLayoutMinimum(value)) {
      if (value !== 'standard') this.setAttribute('minimum', 'standard');
      return;
    }
    if (name === 'align' && !isLayoutAlignment(value)) {
      if (value !== 'stretch') this.setAttribute('align', 'stretch');
      return;
    }
    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    return html`
      <div part="base">
        <div part="primary"><slot name="primary"></slot></div>
        <div part="secondary"><slot name="secondary"></slot></div>
      </div>
    `;
  }
}

export function defineWgSplit(registry: CustomElementRegistry = customElements): void {
  defineElement(wgSplitTagName, WgSplit, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-split': WgSplit;
  }
}
