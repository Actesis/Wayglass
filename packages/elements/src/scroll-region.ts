import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const scrollRegionAxes = ['block', 'inline', 'both'] as const;
export type ScrollRegionAxis = (typeof scrollRegionAxes)[number];

export const wgScrollRegionTagName = 'wg-scroll-region';

export function isScrollRegionAxis(value: unknown): value is ScrollRegionAxis {
  return typeof value === 'string' && scrollRegionAxes.some((axis) => axis === value);
}

export function isScrollRegionLabel(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export class WgScrollRegion extends WayglassElement {
  static override properties = {
    axis: { type: String, reflect: true },
    label: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-scroll-region-max-block-size: var(--wg-component-scroll-region-max-block-size);
      --wg-scroll-region-max-inline-size: var(--wg-component-scroll-region-max-inline-size);
      --wg-scroll-region-color-border: var(--wg-component-scroll-region-color-border);
      --wg-scroll-region-focus-ring-color: var(--wg-component-scroll-region-focus-ring-color);

      display: block;
      min-inline-size: 0;
      max-block-size: var(--wg-scroll-region-max-block-size);
      box-sizing: border-box;
      overflow: auto;
      border: var(--wg-border-width-standard) solid var(--wg-scroll-region-color-border);
      border-radius: var(--wg-shape-radius-control);
      scrollbar-gutter: stable;
    }

    :host([axis='inline']) {
      max-block-size: none;
      max-inline-size: var(--wg-scroll-region-max-inline-size);
    }

    :host([axis='both']) {
      max-inline-size: var(--wg-scroll-region-max-inline-size);
    }

    :host(:focus-visible) {
      outline: var(--wg-focus-width) solid var(--wg-scroll-region-focus-ring-color);
      outline-offset: var(--wg-focus-offset);
    }

    [part='content'] {
      min-inline-size: 0;
    }

    @media (forced-colors: active) {
      :host {
        border-color: CanvasText;
      }

      :host(:focus-visible) {
        outline-color: Highlight;
      }
    }
  `;

  declare axis: ScrollRegionAxis;
  declare label: string;

  #resizeObserver?: ResizeObserver;
  #mutationObserver?: MutationObserver;
  #managedFocusable = false;
  #overflowFrame: number | undefined;

  constructor() {
    super();
    this.axis = 'block';
    this.label = '';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#resizeObserver = new ResizeObserver(() => this.#scheduleOverflowSync());
    this.#resizeObserver.observe(this);
    this.#mutationObserver = new MutationObserver(() => this.#scheduleOverflowSync());
    this.#mutationObserver.observe(this, { childList: true, characterData: true, subtree: true });
    this.#scheduleOverflowSync();
  }

  override disconnectedCallback(): void {
    this.#resizeObserver?.disconnect();
    this.#mutationObserver?.disconnect();
    if (this.#overflowFrame !== undefined) cancelAnimationFrame(this.#overflowFrame);
    super.disconnectedCallback();
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'axis' && !isScrollRegionAxis(value)) {
      if (value !== 'block') this.setAttribute('axis', 'block');
      return;
    }
    super.attributeChangedCallback(name, previous, value);
    if (this.isConnected) this.#scheduleOverflowSync();
  }

  #scheduleOverflowSync(): void {
    if (this.#overflowFrame !== undefined) cancelAnimationFrame(this.#overflowFrame);
    this.#overflowFrame = requestAnimationFrame(() => {
      this.#overflowFrame = undefined;
      this.#syncOverflow();
    });
  }

  #syncOverflow(): void {
    const blockOverflow = this.scrollHeight > this.clientHeight + 1;
    const inlineOverflow = this.scrollWidth > this.clientWidth + 1;
    const overflows =
      this.axis === 'both'
        ? blockOverflow || inlineOverflow
        : this.axis === 'inline'
          ? inlineOverflow
          : blockOverflow;

    if (overflows) {
      if (!this.hasAttribute('tabindex')) {
        this.tabIndex = 0;
        this.#managedFocusable = true;
      }
      if (isScrollRegionLabel(this.label)) {
        this.setAttribute('role', 'region');
        this.setAttribute('aria-label', this.label.trim());
      } else {
        this.removeAttribute('role');
        this.removeAttribute('aria-label');
      }
      this.toggleAttribute('data-overflowing', true);
      return;
    }

    if (this.#managedFocusable) {
      this.removeAttribute('tabindex');
      this.#managedFocusable = false;
    }
    this.removeAttribute('role');
    this.removeAttribute('aria-label');
    this.removeAttribute('data-overflowing');
  }

  protected override render() {
    return html`<div part="content"><slot></slot></div>`;
  }
}

export function defineWgScrollRegion(registry: CustomElementRegistry = customElements): void {
  defineElement(wgScrollRegionTagName, WgScrollRegion, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-scroll-region': WgScrollRegion;
  }
}
