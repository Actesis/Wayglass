import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgFieldLabelTagName = 'wg-field-label';

export class WgFieldLabel extends WayglassElement {
  static override styles = css`
    :host {
      --wg-field-label-color: var(--wg-component-form-color-label);
      --wg-field-label-requirement-color: var(--wg-component-form-color-requirement);
      --wg-field-label-detail-color: var(--wg-component-form-color-help);
      --wg-field-label-space: var(--wg-component-form-space-label);

      display: block;
      min-inline-size: 0;
      color: var(--wg-field-label-color);
      font-family: var(--wg-typography-family-body);
      font-size: var(--wg-typography-size-label);
      font-weight: var(--wg-typography-weight-medium);
      line-height: var(--wg-typography-line-height-compact);
    }

    [part='label'] {
      display: flex;
      min-inline-size: 0;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--wg-field-label-space);
    }

    [part='text'],
    [part='detail'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    [part='requirement'] {
      color: var(--wg-field-label-requirement-color);
      font-size: var(--wg-typography-size-metadata);
      font-weight: var(--wg-typography-weight-regular);
    }

    [part='detail'] {
      flex-basis: 100%;
      color: var(--wg-field-label-detail-color);
      font-size: var(--wg-typography-size-metadata);
      font-weight: var(--wg-typography-weight-regular);
      line-height: var(--wg-typography-line-height-body);
    }

    @media (forced-colors: active) {
      :host,
      [part='requirement'],
      [part='detail'] {
        color: CanvasText;
      }
    }
  `;

  protected override render() {
    return html`<span part="label">
      <span part="text"><slot></slot></span>
      <span part="requirement"><slot name="requirement"></slot></span>
      <span part="detail"><slot name="detail"></slot></span>
    </span>`;
  }
}

export function defineWgFieldLabel(registry: CustomElementRegistry = customElements): void {
  defineElement(wgFieldLabelTagName, WgFieldLabel, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-field-label': WgFieldLabel;
  }
}
