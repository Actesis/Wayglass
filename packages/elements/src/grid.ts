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

export const wgGridTagName = 'wg-grid';

export class WgGrid extends WayglassElement {
  static override properties = {
    space: { type: String, reflect: true },
    minimum: { type: String, reflect: true },
    align: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-grid-space: var(--wg-component-layout-space-section);
      --wg-grid-item-minimum: var(--wg-component-grid-item-minimum-standard);

      display: block;
      min-inline-size: 0;
      container-name: wg-grid;
      container-type: inline-size;
    }

    :host([space='none']) {
      --wg-grid-space: 0;
    }

    :host([space='related']) {
      --wg-grid-space: var(--wg-component-layout-space-related);
    }

    :host([space='function']) {
      --wg-grid-space: var(--wg-component-layout-space-function);
    }

    :host([minimum='compact']) {
      --wg-grid-item-minimum: var(--wg-component-grid-item-minimum-compact);
    }

    :host([minimum='wide']) {
      --wg-grid-item-minimum: var(--wg-component-grid-item-minimum-wide);
    }

    [part='base'] {
      display: grid;
      min-inline-size: 0;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--wg-grid-item-minimum)), 1fr));
      align-items: stretch;
      gap: var(--wg-grid-space);
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

    slot {
      display: contents;
    }
  `;

  declare space: LayoutSpace;
  declare minimum: LayoutMinimum;
  declare align: LayoutAlignment;

  constructor() {
    super();
    this.space = 'section';
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
    return html`<div part="base"><slot></slot></div>`;
  }
}

export function defineWgGrid(registry: CustomElementRegistry = customElements): void {
  defineElement(wgGridTagName, WgGrid, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-grid': WgGrid;
  }
}
