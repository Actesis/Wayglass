import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const skeletonShapes = ['text', 'block', 'circle'] as const;
export type SkeletonShape = (typeof skeletonShapes)[number];
export const skeletonMotions = ['static', 'pulse'] as const;
export type SkeletonMotion = (typeof skeletonMotions)[number];
export const wgSkeletonTagName = 'wg-skeleton';

export function isSkeletonShape(value: unknown): value is SkeletonShape {
  return typeof value === 'string' && skeletonShapes.some((shape) => shape === value);
}

export function isSkeletonMotion(value: unknown): value is SkeletonMotion {
  return typeof value === 'string' && skeletonMotions.some((motion) => motion === value);
}

export class WgSkeleton extends WayglassElement {
  static override properties = {
    shape: { type: String, reflect: true },
    lines: { type: Number, reflect: true },
    motion: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      display: block;
      min-inline-size: 0;
      --_wg-skeleton-color: var(--wg-component-feedback-color-skeleton);
    }

    :host([hidden]) {
      display: none !important;
    }

    [part='base'] {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-component-feedback-space-related);
    }

    [part='line'],
    [part='shape'] {
      display: block;
      background: var(--_wg-skeleton-color);
    }

    [part='line'] {
      inline-size: 100%;
      block-size: var(--wg-component-feedback-size-skeleton-line);
      border-radius: var(--wg-component-feedback-radius-compact);
    }

    [part='line']:last-child:not(:first-child) {
      inline-size: 68%;
    }

    :host([shape='block']) [part='shape'] {
      min-block-size: 8rem;
      border-radius: var(--wg-component-feedback-radius);
    }

    :host([shape='circle']) [part='shape'] {
      inline-size: 3rem;
      block-size: 3rem;
      border-radius: 50%;
    }

    :host([motion='pulse']) [part='line'],
    :host([motion='pulse']) [part='shape'] {
      animation: wg-skeleton-pulse var(--wg-component-feedback-motion-skeleton)
        var(--wg-motion-easing-standard) infinite alternate;
    }

    @keyframes wg-skeleton-pulse {
      to {
        opacity: 0.45;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host([motion='pulse']) [part='line'],
      :host([motion='pulse']) [part='shape'] {
        animation: none;
      }
    }

    @media (forced-colors: active) {
      [part='line'],
      [part='shape'] {
        border: var(--wg-border-width-standard) solid CanvasText;
        background: Canvas;
      }
    }
  `;

  declare shape: SkeletonShape;
  declare lines: number;
  declare motion: SkeletonMotion;

  constructor() {
    super();
    this.shape = 'text';
    this.lines = 1;
    this.motion = 'static';
    this.setAttribute('aria-hidden', 'true');
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'shape' && !isSkeletonShape(value)) {
      if (value !== 'text') this.setAttribute('shape', 'text');
      return;
    }
    if (name === 'motion' && !isSkeletonMotion(value)) {
      if (value !== 'static') this.setAttribute('motion', 'static');
      return;
    }
    if (name === 'lines') {
      const parsed = Number(value);
      const normalized = Number.isInteger(parsed) ? Math.min(8, Math.max(1, parsed)) : 1;
      if (value !== String(normalized)) this.setAttribute('lines', String(normalized));
      return;
    }
    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    if (this.shape !== 'text') return html`<span part="base"><span part="shape"></span></span>`;
    return html`<span part="base">
      ${Array.from({ length: this.lines }, () => html`<span part="line"></span>`)}
    </span>`;
  }
}

export function defineWgSkeleton(registry: CustomElementRegistry = customElements): void {
  defineElement(wgSkeletonTagName, WgSkeleton, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-skeleton': WgSkeleton;
  }
}
