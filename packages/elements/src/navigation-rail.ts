import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const navigationRailOrientations = ['vertical', 'horizontal'] as const;
export type NavigationRailOrientation = (typeof navigationRailOrientations)[number];
export const wgNavigationRailTagName = 'wg-navigation-rail';

export function isNavigationRailOrientation(value: unknown): value is NavigationRailOrientation {
  return (
    typeof value === 'string' &&
    navigationRailOrientations.some((orientation) => orientation === value)
  );
}

export class WgNavigationRail extends WayglassElement {
  static override properties = {
    orientation: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-navigation-rail-color-background: var(--wg-component-navigation-rail-color-background);
      --wg-navigation-rail-color-border: var(--wg-component-navigation-rail-color-border);
      --wg-navigation-rail-color-current: var(--wg-component-navigation-rail-color-current);
      --wg-navigation-rail-color-text: var(--wg-component-navigation-rail-color-text);
      --wg-navigation-rail-radius: var(--wg-component-navigation-rail-radius);
      --wg-navigation-rail-space: var(--wg-component-navigation-rail-space);
      --wg-navigation-rail-link-size-minimum: var(--wg-component-navigation-rail-link-size-minimum);
      display: block;
      min-inline-size: 0;
      font-family: var(--wg-typography-family-body);
    }
    [part='rail'] {
      display: flex;
      flex-direction: column;
      min-inline-size: 0;
      gap: var(--wg-navigation-rail-space);
      padding: var(--wg-navigation-rail-space);
      border: var(--wg-border-width-standard) solid var(--wg-navigation-rail-color-border);
      border-radius: var(--wg-navigation-rail-radius);
      background: var(--wg-navigation-rail-color-background);
    }
    :host([orientation='horizontal']) [part='rail'] {
      flex-direction: row;
      overflow-x: auto;
    }
    ::slotted(a) {
      display: flex;
      align-items: center;
      min-block-size: var(--wg-navigation-rail-link-size-minimum);
      box-sizing: border-box;
      padding: var(--wg-space-reference-2) var(--wg-space-reference-3);
      border-inline-start: var(--wg-border-width-band) solid transparent;
      border-radius: calc(var(--wg-navigation-rail-radius) * 0.65);
      color: var(--wg-navigation-rail-color-text);
      text-decoration: none;
      white-space: nowrap;
    }
    ::slotted(a[aria-current='page']) {
      border-inline-start-color: var(--wg-navigation-rail-color-current);
      background: var(--wg-color-semantic-surface-raised);
      font-weight: var(--wg-typography-weight-medium);
    }
    ::slotted(a:focus-visible) {
      outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
      outline-offset: var(--wg-focus-offset);
    }
    @media (forced-colors: active) {
      [part='rail'] {
        border-color: CanvasText;
        background: Canvas;
      }
      ::slotted(a) {
        color: LinkText;
      }
      ::slotted(a[aria-current='page']) {
        border-inline-start-color: Highlight;
      }
    }
  `;

  declare orientation: NavigationRailOrientation;

  constructor() {
    super();
    this.orientation = 'vertical';
  }

  override attributeChangedCallback(name: string, oldValue: string | null, value: string | null) {
    if (name === 'orientation' && !isNavigationRailOrientation(value)) {
      if (value !== 'vertical') this.setAttribute('orientation', 'vertical');
      return;
    }
    super.attributeChangedCallback(name, oldValue, value);
  }

  protected override render() {
    return html`<div part="rail"><slot></slot></div>`;
  }
}

export function defineWgNavigationRail(registry: CustomElementRegistry = customElements): void {
  defineElement(wgNavigationRailTagName, WgNavigationRail, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-navigation-rail': WgNavigationRail;
  }
}
