import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const mediaAspects = ['auto', 'square', 'landscape', 'portrait', 'wide'] as const;
export type MediaAspect = (typeof mediaAspects)[number];

export const mediaFits = ['contain', 'cover'] as const;
export type MediaFit = (typeof mediaFits)[number];

export const mediaStates = ['ready', 'loading', 'unavailable'] as const;
export type MediaState = (typeof mediaStates)[number];

export const mediaBoundaries = ['none', 'subtle', 'strong'] as const;
export type MediaBoundary = (typeof mediaBoundaries)[number];

export const wgMediaTagName = 'wg-media';

export function isMediaAspect(value: unknown): value is MediaAspect {
  return typeof value === 'string' && mediaAspects.some((aspect) => aspect === value);
}

export function isMediaFit(value: unknown): value is MediaFit {
  return typeof value === 'string' && mediaFits.some((fit) => fit === value);
}

export function isMediaState(value: unknown): value is MediaState {
  return typeof value === 'string' && mediaStates.some((state) => state === value);
}

export function isMediaBoundary(value: unknown): value is MediaBoundary {
  return typeof value === 'string' && mediaBoundaries.some((boundary) => boundary === value);
}

export class WgMedia extends WayglassElement {
  static override properties = {
    aspect: { type: String, reflect: true },
    fit: { type: String, reflect: true },
    state: { type: String, reflect: true },
    boundary: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-media-aspect-ratio: auto;
      --wg-media-object-fit: contain;
      --wg-media-object-position: center;
      --wg-media-color-background: var(--wg-component-media-color-background);
      --wg-media-color-border: var(--wg-component-media-color-border);
      --wg-media-border-size: var(--wg-component-media-border-size-subtle);
      --wg-media-radius: var(--wg-component-media-radius);
      --wg-media-min-block-size: var(--wg-component-media-min-block-size);
      --wg-media-state-space: var(--wg-component-media-state-space);

      display: block;
      min-inline-size: 0;
    }

    :host([aspect='square']) {
      --wg-media-aspect-ratio: 1 / 1;
    }

    :host([aspect='landscape']) {
      --wg-media-aspect-ratio: 4 / 3;
    }

    :host([aspect='portrait']) {
      --wg-media-aspect-ratio: 3 / 4;
    }

    :host([aspect='wide']) {
      --wg-media-aspect-ratio: 16 / 9;
    }

    :host([fit='cover']) {
      --wg-media-object-fit: cover;
    }

    :host([boundary='none']) {
      --wg-media-border-size: 0;
    }

    :host([boundary='strong']) {
      --wg-media-color-border: var(--wg-component-media-color-border-strong);
      --wg-media-border-size: var(--wg-component-media-border-size-strong);
    }

    [part='base'] {
      min-inline-size: 0;
    }

    [part='viewport'] {
      position: relative;
      display: grid;
      min-inline-size: 0;
      overflow: hidden;
      aspect-ratio: var(--wg-media-aspect-ratio);
      border: var(--wg-media-border-size) solid var(--wg-media-color-border);
      border-radius: var(--wg-media-radius);
      background: var(--wg-media-color-background);
      isolation: isolate;
    }

    :host([aspect='auto'][state='loading']) [part='viewport'],
    :host([aspect='auto'][state='unavailable']) [part='viewport'] {
      min-block-size: var(--wg-media-min-block-size);
    }

    [part='asset'] {
      display: block;
      min-inline-size: 0;
      grid-area: 1 / 1;
    }

    slot:not([name]) {
      display: contents;
    }

    ::slotted(img),
    ::slotted(picture) {
      display: block;
      inline-size: 100%;
      block-size: 100%;
      min-inline-size: 0;
      max-inline-size: 100%;
    }

    ::slotted(img) {
      object-fit: var(--wg-media-object-fit);
      object-position: var(--wg-media-object-position);
    }

    :host([state='unavailable']) [part='asset'] {
      visibility: hidden;
    }

    [part='state'] {
      z-index: 1;
      display: none;
      min-inline-size: 0;
      box-sizing: border-box;
      grid-area: 1 / 1;
      place-items: center;
      align-content: center;
      gap: var(--wg-space-reference-2);
      padding: var(--wg-media-state-space);
      color: var(--wg-color-semantic-text-primary);
      background: var(--wg-media-color-background);
      text-align: center;
    }

    :host([state='loading']) [part='state-loading'],
    :host([state='unavailable']) [part='state-unavailable'] {
      display: grid;
    }

    :host([state='loading']) [part='state-loading'] {
      background: color-mix(in srgb, var(--wg-media-color-background) 84%, transparent);
    }

    [part='inspection'] {
      position: absolute;
      z-index: 2;
      inset-block-end: var(--wg-media-state-space);
      inset-inline-end: var(--wg-media-state-space);
      max-inline-size: calc(100% - 2 * var(--wg-media-state-space));
    }

    ::slotted([slot='inspection']) {
      overflow-wrap: anywhere;
    }

    @media (forced-colors: active) {
      [part='viewport'] {
        border-color: CanvasText;
        background: Canvas;
      }

      [part='state'] {
        color: CanvasText;
        background: Canvas;
      }
    }
  `;

  declare aspect: MediaAspect;
  declare fit: MediaFit;
  declare state: MediaState;
  declare boundary: MediaBoundary;

  constructor() {
    super();
    this.aspect = 'auto';
    this.fit = 'contain';
    this.state = 'ready';
    this.boundary = 'subtle';
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'aspect' && !isMediaAspect(value)) {
      if (value !== 'auto') this.setAttribute('aspect', 'auto');
      return;
    }
    if (name === 'fit' && !isMediaFit(value)) {
      if (value !== 'contain') this.setAttribute('fit', 'contain');
      return;
    }
    if (name === 'state' && !isMediaState(value)) {
      if (value !== 'ready') this.setAttribute('state', 'ready');
      return;
    }
    if (name === 'boundary' && !isMediaBoundary(value)) {
      if (value !== 'subtle') this.setAttribute('boundary', 'subtle');
      return;
    }
    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    return html`
      <div part="base">
        <div part="viewport">
          <div part="asset"><slot></slot></div>
          <div part="state state-loading"><slot name="loading"></slot></div>
          <div part="state state-unavailable"><slot name="unavailable"></slot></div>
          <div part="inspection"><slot name="inspection"></slot></div>
        </div>
      </div>
    `;
  }
}

export function defineWgMedia(registry: CustomElementRegistry = customElements): void {
  defineElement(wgMediaTagName, WgMedia, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-media': WgMedia;
  }
}
