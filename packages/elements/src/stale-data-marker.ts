import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgStaleDataMarkerTagName = 'wg-stale-data-marker';

export class WgStaleDataMarker extends WayglassElement {
  static override styles = css`
    :host {
      display: inline-block;
      max-inline-size: 100%;
      color: var(--wg-component-feedback-color-detail);
      font-family: var(--wg-typography-family-body);
      font-size: var(--wg-typography-size-metadata);
      font-weight: var(--wg-typography-weight-medium);
      line-height: var(--wg-typography-line-height-compact);
    }

    :host([hidden]) {
      display: none !important;
    }

    [part='base'] {
      display: inline-grid;
      max-inline-size: 100%;
      grid-template-columns: var(--wg-component-feedback-size-marker) minmax(0, 1fr);
      align-items: stretch;
      gap: var(--wg-component-feedback-space-related);
      box-sizing: border-box;
      border: var(--wg-border-width-standard) dashed var(--wg-component-feedback-color-border);
      border-radius: var(--wg-component-feedback-radius-compact);
      padding: var(--wg-space-reference-1) var(--wg-space-reference-2);
    }

    [part='marker'] {
      border-radius: var(--wg-shape-radius-signal);
      background: var(--wg-component-feedback-color-stale);
    }

    [part='content'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    @media (forced-colors: active) {
      :host {
        color: CanvasText;
      }

      [part='base'] {
        border-color: CanvasText;
      }

      [part='marker'] {
        border: var(--wg-border-width-standard) solid CanvasText;
        background: CanvasText;
      }
    }
  `;

  protected override render() {
    return html`<span part="base">
      <span part="marker" aria-hidden="true"></span>
      <span part="content"><slot></slot></span>
    </span>`;
  }
}

export function defineWgStaleDataMarker(registry: CustomElementRegistry = customElements): void {
  defineElement(wgStaleDataMarkerTagName, WgStaleDataMarker, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-stale-data-marker': WgStaleDataMarker;
  }
}
