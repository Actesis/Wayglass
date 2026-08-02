import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgFormGroupTagName = 'wg-form-group';

export class WgFormGroup extends WayglassElement {
  static override styles = css`
    :host {
      --wg-form-group-space: var(--wg-component-form-space-group);

      display: block;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
    }

    [part='group'] {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-form-group-space);
    }

    ::slotted(*) {
      min-inline-size: 0;
      max-inline-size: 100%;
      margin-block: 0;
    }
  `;

  protected override render() {
    return html`<div part="group"><slot></slot></div>`;
  }
}

export function defineWgFormGroup(registry: CustomElementRegistry = customElements): void {
  defineElement(wgFormGroupTagName, WgFormGroup, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-form-group': WgFormGroup;
  }
}
