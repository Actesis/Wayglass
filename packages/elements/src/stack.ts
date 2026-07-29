import { css, html } from 'lit';

import {
  isLayoutAlignment,
  isLayoutSpace,
  type LayoutAlignment,
  type LayoutSpace,
} from './layout-values.js';
import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export {
  isLayoutAlignment,
  isLayoutSpace,
  layoutAlignments,
  layoutSpaces,
} from './layout-values.js';
export type { LayoutAlignment, LayoutSpace } from './layout-values.js';

export const wgStackTagName = 'wg-stack';

export class WgStack extends WayglassElement {
  static override properties = {
    space: { type: String, reflect: true },
    align: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-stack-space: var(--wg-component-layout-space-section);

      display: block;
      min-inline-size: 0;
    }

    :host([space='none']) {
      --wg-stack-space: 0;
    }

    :host([space='related']) {
      --wg-stack-space: var(--wg-component-layout-space-related);
    }

    :host([space='function']) {
      --wg-stack-space: var(--wg-component-layout-space-function);
    }

    [part='base'] {
      display: flex;
      min-inline-size: 0;
      flex-direction: column;
      align-items: stretch;
      gap: var(--wg-stack-space);
    }

    :host([align='start']) [part='base'] {
      align-items: flex-start;
    }

    :host([align='center']) [part='base'] {
      align-items: center;
    }

    :host([align='end']) [part='base'] {
      align-items: flex-end;
    }

    slot {
      display: contents;
    }
  `;

  declare space: LayoutSpace;
  declare align: LayoutAlignment;

  constructor() {
    super();
    this.space = 'section';
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

export function defineWgStack(registry: CustomElementRegistry = customElements): void {
  defineElement(wgStackTagName, WgStack, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-stack': WgStack;
  }
}
