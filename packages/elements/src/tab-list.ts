import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgTabListTagName = 'wg-tab-list';

export class WgTabList extends WayglassElement {
  static override styles = css`
    :host {
      --wg-tab-list-gap: var(--wg-component-tab-list-space);

      display: block;
      min-inline-size: 0;
      font-family: var(--wg-typography-family-body);
    }

    [part='list'] {
      display: flex;
      min-inline-size: 0;
      gap: var(--wg-tab-list-gap);
    }

    :host(:not([aria-orientation='vertical'])) [part='list'] {
      align-items: end;
      overflow-x: auto;
      overflow-y: hidden;
    }

    :host([aria-orientation='vertical']) [part='list'] {
      flex-direction: column;
      align-items: stretch;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'tablist');
    this.setAttribute('aria-orientation', this.getAttribute('aria-orientation') ?? 'horizontal');
  }

  protected override render() {
    return html`<div part="list"><slot></slot></div>`;
  }
}

export function defineWgTabList(registry: CustomElementRegistry = customElements): void {
  defineElement(wgTabListTagName, WgTabList, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-tab-list': WgTabList;
  }
}
