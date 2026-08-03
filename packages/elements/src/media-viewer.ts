import { css, html } from 'lit';
import type { PropertyValues } from 'lit';

import { NativeModalController } from './native-modal-controller.js';
import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const mediaViewerStates = ['ready', 'loading', 'unavailable'] as const;
export type MediaViewerState = (typeof mediaViewerStates)[number];

export const mediaViewerInitialViews = ['fit', 'actual-size'] as const;
export type MediaViewerInitialView = (typeof mediaViewerInitialViews)[number];

export const mediaViewerViews = ['fit', 'actual-size', 'zoomed'] as const;
export type MediaViewerView = (typeof mediaViewerViews)[number];

export const mediaViewerCloseReasons = ['close-control', 'escape', 'programmatic'] as const;
export type MediaViewerCloseReason = (typeof mediaViewerCloseReasons)[number];

export interface MediaViewerShowOptions {
  readonly invoker?: HTMLElement;
  readonly fallbackFocus?: HTMLElement;
}

export interface WgMediaViewerDetail {
  readonly viewerId: string;
}

export interface WgMediaViewerCloseDetail extends WgMediaViewerDetail {
  readonly reason: MediaViewerCloseReason;
}

export interface WgMediaViewChangeDetail extends WgMediaViewerDetail {
  readonly view: MediaViewerView;
  readonly scale: number;
}

export const wgMediaViewerTagName = 'wg-media-viewer';

const zoomFactor = 1.5;
const scaleTolerance = 0.0005;
let mediaViewerInstanceSequence = 0;

export function isMediaViewerState(value: unknown): value is MediaViewerState {
  return typeof value === 'string' && mediaViewerStates.some((state) => state === value);
}

export function isMediaViewerInitialView(value: unknown): value is MediaViewerInitialView {
  return typeof value === 'string' && mediaViewerInitialViews.some((view) => view === value);
}

export class WgMediaViewer extends WayglassElement {
  static override properties = {
    viewerId: { type: String, attribute: 'viewer-id', reflect: true },
    open: { type: Boolean, reflect: true },
    state: { type: String, reflect: true },
    initialView: { type: String, attribute: 'initial-view', reflect: true },
    closeLabel: { type: String, attribute: 'close-label' },
    zoomInLabel: { type: String, attribute: 'zoom-in-label' },
    zoomOutLabel: { type: String, attribute: 'zoom-out-label' },
    fitLabel: { type: String, attribute: 'fit-label' },
    actualSizeLabel: { type: String, attribute: 'actual-size-label' },
  };

  static override styles = css`
    :host {
      color: var(--wg-component-media-viewer-color-text);
      font-family: var(--wg-typography-family-body);
    }

    [part='dialog'] {
      inline-size: min(
        var(--wg-component-media-viewer-size-inline-maximum),
        calc(100vw - 2 * var(--wg-component-media-viewer-space-viewport))
      );
      min-inline-size: 0;
      max-inline-size: none;
      block-size: calc(100dvh - 2 * var(--wg-component-media-viewer-space-viewport));
      max-block-size: none;
      box-sizing: border-box;
      padding: 0;
      overflow: visible;
      border: 0;
      color: inherit;
      background: transparent;
    }

    [part='dialog']::backdrop {
      background: var(--wg-component-media-viewer-color-backdrop);
    }

    [part='surface'] {
      display: grid;
      min-inline-size: 0;
      block-size: 100%;
      min-block-size: 0;
      box-sizing: border-box;
      grid-template-rows:
        auto auto minmax(min(var(--wg-component-media-viewer-size-viewport-minimum), 40dvh), 1fr)
        auto auto;
      overflow: auto;
      border: var(--wg-border-width-strong) solid var(--wg-component-media-viewer-color-border);
      border-radius: var(--wg-component-media-viewer-radius);
      color: var(--wg-component-media-viewer-color-text);
      background: var(--wg-component-media-viewer-color-background);
      box-shadow: var(--wg-component-media-viewer-elevation);
    }

    [part='header'] {
      display: flex;
      min-inline-size: 0;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--wg-component-media-viewer-space-related);
      padding: var(--wg-component-media-viewer-space);
      border-block-end: var(--wg-border-width-standard) solid
        var(--wg-component-media-viewer-color-border);
    }

    [part='heading'] {
      min-inline-size: 0;
      color: var(--wg-component-media-viewer-color-text);
      font-size: var(--wg-typography-size-section);
      font-weight: var(--wg-typography-weight-emphasis);
      line-height: var(--wg-typography-line-height-compact);
      overflow-wrap: anywhere;
    }

    [part='heading']:focus-visible,
    [part='viewport']:focus-visible,
    [part$='button']:focus-visible {
      outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
      outline-offset: var(--wg-focus-offset);
    }

    [part$='button'] {
      display: inline-flex;
      min-inline-size: var(--wg-component-media-viewer-size-control-minimum);
      min-block-size: var(--wg-component-media-viewer-size-control-minimum);
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding-block: var(--wg-component-button-space-block);
      padding-inline: var(--wg-component-button-space-inline);
      border: var(--wg-border-width-standard) solid var(--wg-component-media-viewer-color-border);
      border-radius: var(--wg-component-button-radius);
      color: var(--wg-component-media-viewer-color-text);
      background: var(--wg-component-media-viewer-color-control-background);
      font: inherit;
      font-weight: var(--wg-typography-weight-medium);
      line-height: 1.2;
      cursor: pointer;
    }

    [part$='button']:hover:not(:disabled) {
      background: var(--wg-component-media-viewer-color-control-background-hover);
    }

    [part$='button']:disabled {
      cursor: not-allowed;
      opacity: var(--wg-opacity-disabled);
    }

    [part$='button'][aria-pressed='true'] {
      border-color: var(--wg-component-media-viewer-color-control-selected);
      box-shadow: inset 0 calc(-1 * var(--wg-border-width-band))
        var(--wg-component-media-viewer-color-control-selected);
    }

    [part='close-button'] {
      flex: none;
    }

    [part='context'],
    [part='caption'] {
      padding-inline: var(--wg-component-media-viewer-space);
      color: var(--wg-component-media-viewer-color-detail);
      font-size: var(--wg-typography-size-body);
      line-height: var(--wg-typography-line-height-body);
      overflow-wrap: anywhere;
    }

    [part='context'] {
      padding-block: var(--wg-component-media-viewer-space-related);
    }

    [part='context'][hidden],
    [part='caption'][hidden] {
      display: none;
    }

    [part='viewport'] {
      position: relative;
      min-inline-size: 0;
      min-block-size: 0;
      overflow: hidden;
      overscroll-behavior: contain;
      border-block: var(--wg-border-width-standard) solid
        var(--wg-component-media-viewer-color-border);
      background: var(--wg-component-media-viewer-color-viewport);
      scrollbar-gutter: stable;
    }

    [part='viewport'][data-overflow] {
      overflow: auto;
    }

    [part='media'] {
      display: grid;
      inline-size: max(100%, var(--wg-media-viewer-rendered-inline, 0px));
      min-inline-size: 100%;
      block-size: max(100%, var(--wg-media-viewer-rendered-block, 0px));
      min-block-size: 100%;
      place-items: center;
    }

    slot:not([name]) {
      display: contents;
    }

    ::slotted(img),
    ::slotted(picture) {
      display: block;
      inline-size: var(--wg-media-viewer-rendered-inline, auto);
      block-size: var(--wg-media-viewer-rendered-block, auto);
      min-inline-size: 0;
      max-inline-size: none;
      max-block-size: none;
      object-fit: contain;
    }

    :host([state='unavailable']) [part='media'] {
      visibility: hidden;
    }

    [part='state'] {
      position: absolute;
      z-index: 1;
      display: none;
      box-sizing: border-box;
      inset: 0;
      place-items: center;
      align-content: center;
      padding: var(--wg-component-media-viewer-space);
      color: var(--wg-component-media-viewer-color-text);
      background: var(--wg-component-media-viewer-color-viewport);
      text-align: center;
      overflow-wrap: anywhere;
    }

    :host([state='loading']) [part='state-loading'],
    :host([state='unavailable']) [part='state-unavailable'] {
      display: grid;
    }

    :host([state='loading']) [part='state-loading'] {
      background: color-mix(
        in srgb,
        var(--wg-component-media-viewer-color-viewport) 84%,
        transparent
      );
    }

    [part='caption'] {
      padding-block-start: var(--wg-component-media-viewer-space-related);
    }

    [part='controls'] {
      display: flex;
      min-inline-size: 0;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: var(--wg-component-media-viewer-space-related);
      padding: var(--wg-component-media-viewer-space);
    }

    [part='scale-readout'] {
      min-inline-size: 4ch;
      color: var(--wg-component-media-viewer-color-detail);
      font-variant-numeric: tabular-nums;
      text-align: end;
    }

    [part='dialog'][open] [part='surface'] {
      animation: wg-media-viewer-enter var(--wg-component-media-viewer-motion)
        var(--wg-motion-easing-standard);
    }

    ::slotted(img),
    ::slotted(picture) {
      transition:
        inline-size var(--wg-component-media-viewer-motion) var(--wg-motion-easing-standard),
        block-size var(--wg-component-media-viewer-motion) var(--wg-motion-easing-standard);
    }

    @keyframes wg-media-viewer-enter {
      from {
        opacity: 0;
        transform: translateY(var(--wg-component-media-viewer-motion-distance));
      }
    }

    @media (max-width: 30rem) {
      [part='dialog'] {
        inline-size: calc(100vw - 2 * var(--wg-component-media-viewer-space-viewport));
      }

      [part='controls'] {
        justify-content: stretch;
      }

      [part='fit-button'],
      [part='actual-size-button'] {
        flex: 1 1 auto;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [part='dialog'][open] [part='surface'] {
        animation: none;
      }

      ::slotted(img),
      ::slotted(picture) {
        transition: none;
      }
    }

    @media (forced-colors: active) {
      [part='dialog']::backdrop {
        background: Canvas;
        opacity: 0.75;
      }

      [part='surface'],
      [part='viewport'],
      [part$='button'] {
        border-color: ButtonText;
        color: ButtonText;
        background: Canvas;
        box-shadow: none;
        forced-color-adjust: auto;
      }

      [part$='button'][aria-pressed='true'] {
        border-color: Highlight;
        box-shadow: inset 0 calc(-1 * var(--wg-border-width-band)) Highlight;
      }
    }
  `;

  declare viewerId: string;
  declare open: boolean;
  declare state: MediaViewerState;
  declare initialView: MediaViewerInitialView;
  declare closeLabel: string;
  declare zoomInLabel: string;
  declare zoomOutLabel: string;
  declare fitLabel: string;
  declare actualSizeLabel: string;

  readonly #instanceId = ++mediaViewerInstanceSequence;
  readonly #modalController = new NativeModalController(this);
  readonly #resizeObserver = new ResizeObserver(() => this.#measure());
  #closingReason: MediaViewerCloseReason = 'programmatic';
  #closing = false;
  #pendingOptions: MediaViewerShowOptions = {};
  #image: HTMLImageElement | null = null;
  #scale = 1;
  #fitScale = 1;
  #view: MediaViewerView = 'fit';
  #hasContext = false;
  #hasCaption = false;
  #diagnosticSignature = '';

  constructor() {
    super();
    this.viewerId = '';
    this.open = false;
    this.state = 'ready';
    this.initialView = 'fit';
    this.closeLabel = '';
    this.zoomInLabel = '';
    this.zoomOutLabel = '';
    this.fitLabel = '';
    this.actualSizeLabel = '';
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'state' && !isMediaViewerState(value)) {
      if (value !== 'ready') this.setAttribute('state', 'ready');
      return;
    }
    if (name === 'initial-view' && !isMediaViewerInitialView(value)) {
      if (value !== 'fit') this.setAttribute('initial-view', 'fit');
      return;
    }
    super.attributeChangedCallback(name, previous, value);
  }

  override connectedCallback(): void {
    this.#syncOptionalSlots();
    super.connectedCallback();
  }

  override disconnectedCallback(): void {
    this.#resizeObserver.disconnect();
    this.#setImage(null);
    this.#modalController.release();
    this.#dialog?.close();
    this.#closing = false;
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    this.#syncImage();
    if (this.#viewport) this.#resizeObserver.observe(this.#viewport);
    if (this.open) this.#requestOpen(this.#pendingOptions);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('open') && !this.#closing) {
      if (this.open && !this.#dialog?.open) this.#requestOpen(this.#pendingOptions);
      if (!this.open && this.#dialog?.open) this.#closeNative('programmatic');
    }
    if (changed.has('state') && this.#dialog?.open) {
      queueMicrotask(() => {
        if (this.#dialog?.open) this.#measure();
      });
    }
  }

  protected override render() {
    const headingId = `wg-media-viewer-heading-${this.#instanceId}`;
    const controlsDisabled = !this.#canScale;
    const atFit = this.#view === 'fit';
    const atActual = this.#view === 'actual-size';
    const canZoomOut = !controlsDisabled && this.#scale > this.#fitScale + scaleTolerance;
    const canZoomIn = !controlsDisabled && this.#scale < 1 - scaleTolerance;

    return html`<dialog
      part="dialog"
      aria-labelledby=${headingId}
      @cancel=${this.#handleNativeCancel}
      @close=${this.#handleNativeClose}
    >
      <div part="surface">
        <header part="header">
          <div id=${headingId} part="heading" tabindex="-1">
            <slot name="heading" @slotchange=${this.#handleContentChange}></slot>
          </div>
          <button part="close-button" type="button" @click=${this.#handleCloseClick}>
            ${this.closeLabel}
          </button>
        </header>
        <div part="context" ?hidden=${!this.#hasContext}>
          <slot name="context" @slotchange=${this.#handleOptionalSlotChange}></slot>
        </div>
        <div
          part="viewport"
          role="region"
          aria-labelledby=${headingId}
          tabindex=${this.#hasOverflow ? '0' : '-1'}
          ?data-overflow=${this.#hasOverflow}
        >
          <div part="media"><slot @slotchange=${this.#handleMediaSlotChange}></slot></div>
          <div part="state state-loading"><slot name="loading"></slot></div>
          <div part="state state-unavailable"><slot name="unavailable"></slot></div>
        </div>
        <div part="caption" ?hidden=${!this.#hasCaption}>
          <slot name="caption" @slotchange=${this.#handleOptionalSlotChange}></slot>
        </div>
        <div part="controls">
          <button
            part="zoom-out-button"
            type="button"
            ?disabled=${!canZoomOut}
            @click=${this.#handleZoomOut}
          >
            ${this.zoomOutLabel}
          </button>
          <output part="scale-readout">${this.#displayScale}%</output>
          <button
            part="zoom-in-button"
            type="button"
            ?disabled=${!canZoomIn}
            @click=${this.#handleZoomIn}
          >
            ${this.zoomInLabel}
          </button>
          <button
            part="fit-button"
            type="button"
            aria-pressed=${atFit ? 'true' : 'false'}
            ?disabled=${controlsDisabled}
            @click=${this.#handleFit}
          >
            ${this.fitLabel}
          </button>
          <button
            part="actual-size-button"
            type="button"
            aria-pressed=${atActual ? 'true' : 'false'}
            ?disabled=${controlsDisabled}
            @click=${this.#handleActualSize}
          >
            ${this.actualSizeLabel}
          </button>
        </div>
      </div>
    </dialog>`;
  }

  show(options: MediaViewerShowOptions = {}): boolean {
    if (this.#closing) return this.#rejectOpen('cannot reopen during the current close lifecycle');
    if (this.#dialog?.open) return true;
    this.#pendingOptions = options;
    if (!this.hasUpdated) {
      if (!this.isConnected) return false;
      this.open = true;
      return true;
    }
    return this.#requestOpen(options);
  }

  close(reason: 'programmatic' = 'programmatic'): boolean {
    if (!this.#dialog?.open || this.#closing) return false;
    this.#closeNative(reason);
    return true;
  }

  fit(): boolean {
    if (!this.#canScale) return false;
    if (this.#view === 'fit' && Math.abs(this.#scale - this.#fitScale) <= scaleTolerance)
      return false;
    this.#setScale(this.#fitScale, 'fit', false);
    return true;
  }

  actualSize(): boolean {
    if (!this.#canScale || this.#scale >= 1 - scaleTolerance) return false;
    this.#setScale(1, 'actual-size', true);
    return true;
  }

  zoomIn(): boolean {
    if (!this.#canScale || this.#scale >= 1 - scaleTolerance) return false;
    const next = Math.min(1, this.#scale * zoomFactor);
    this.#setScale(next, next >= 1 - scaleTolerance ? 'actual-size' : 'zoomed', true);
    return true;
  }

  zoomOut(): boolean {
    if (!this.#canScale || this.#scale <= this.#fitScale + scaleTolerance) return false;
    const next = Math.max(this.#fitScale, this.#scale / zoomFactor);
    this.#setScale(next, next <= this.#fitScale + scaleTolerance ? 'fit' : 'zoomed', true);
    return true;
  }

  get #dialog(): HTMLDialogElement | null {
    return this.renderRoot.querySelector('[part="dialog"]');
  }

  get #heading(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="heading"]');
  }

  get #viewport(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="viewport"]');
  }

  get #media(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="media"]');
  }

  get #canScale(): boolean {
    return Boolean(
      this.#dialog?.open &&
      this.state === 'ready' &&
      this.#image?.naturalWidth &&
      this.#image.naturalHeight,
    );
  }

  get #hasOverflow(): boolean {
    if (!this.#canScale) return false;
    return this.#scale > this.#fitScale + scaleTolerance;
  }

  get #displayScale(): number {
    return Math.round(this.#scale * 100);
  }

  #requestOpen(options: MediaViewerShowOptions): boolean {
    const dialog = this.#dialog;
    if (!dialog || !this.isConnected) return this.#rejectOpen('viewer must be connected and ready');
    if (dialog.open) return true;
    const diagnostic = this.#validationDiagnostic();
    if (diagnostic) return this.#rejectOpen(diagnostic);

    this.#pendingOptions = {};
    const openDiagnostic = this.#modalController.open(
      dialog,
      `media-viewer:${this.viewerId || '(missing id)'}`,
      options,
    );
    if (openDiagnostic) return this.#rejectOpen(openDiagnostic);

    this.open = true;
    this.#diagnosticSignature = '';
    this.dispatchEvent(
      new CustomEvent<WgMediaViewerDetail>('wg-media-viewer-open', {
        bubbles: true,
        composed: true,
        detail: { viewerId: this.viewerId },
      }),
    );
    requestAnimationFrame(() => {
      if (!this.#dialog?.open || this.#closing) return;
      this.#measure(true);
      this.#heading?.focus({ preventScroll: true });
    });
    return true;
  }

  #rejectOpen(message: string): false {
    this.open = false;
    this.#warn(message);
    return false;
  }

  #validationDiagnostic(): string | null {
    if (!(this.viewerId ?? '').trim()) return 'viewer-id is required';
    const duplicates = Array.from(
      this.ownerDocument.querySelectorAll<WgMediaViewer>(wgMediaViewerTagName),
    ).filter((candidate) => candidate.viewerId === this.viewerId);
    if (duplicates.length > 1) return `viewer-id "${this.viewerId}" must be unique`;
    for (const [value, attribute] of [
      [this.closeLabel, 'close-label'],
      [this.zoomInLabel, 'zoom-in-label'],
      [this.zoomOutLabel, 'zoom-out-label'],
      [this.fitLabel, 'fit-label'],
      [this.actualSizeLabel, 'actual-size-label'],
    ] as const) {
      if (!(value ?? '').trim()) return `${attribute} is required`;
    }
    if (!this.#slotHasContent('heading')) return 'visible heading content is required';
    this.#setImage(this.#resolveImage());
    if (!this.#image) return 'exactly one native img or picture is required';
    if (this.state === 'unavailable' && !this.#slotHasContent('unavailable')) {
      return 'unavailable content is required while state is unavailable';
    }
    return null;
  }

  #slotHasContent(name: string): boolean {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>(`slot[name="${name}"]`);
    return (slot?.assignedNodes({ flatten: true }) ?? []).some(
      (node) => node instanceof Element || Boolean(node.textContent?.trim()),
    );
  }

  #syncImage(): void {
    this.#setImage(this.#resolveImage());
    if (this.#dialog?.open) {
      const diagnostic = this.#validationDiagnostic();
      if (diagnostic) this.#closeNative('programmatic');
      else this.#measure(true);
    }
  }

  #resolveImage(): HTMLImageElement | null {
    const assigned = Array.from(this.children).filter((element) => !element.hasAttribute('slot'));
    let image: HTMLImageElement | null = null;
    if (assigned.length === 1 && assigned[0] instanceof HTMLImageElement) image = assigned[0];
    if (assigned.length === 1 && assigned[0] instanceof HTMLPictureElement) {
      const children = Array.from(assigned[0].children);
      const finalChild = children.at(-1);
      if (finalChild instanceof HTMLImageElement) image = finalChild;
    }
    return image;
  }

  #setImage(image: HTMLImageElement | null): void {
    if (this.#image === image) return;
    this.#image?.removeEventListener('load', this.#handleImageLoad);
    this.#image = image;
    this.#image?.addEventListener('load', this.#handleImageLoad);
  }

  #syncOptionalSlots(): void {
    const hasSlot = (name: string) =>
      Array.from(this.children).some((element) => element.getAttribute('slot') === name);
    const hasContext = hasSlot('context');
    const hasCaption = hasSlot('caption');
    if (hasContext === this.#hasContext && hasCaption === this.#hasCaption) return;
    this.#hasContext = hasContext;
    this.#hasCaption = hasCaption;
    this.requestUpdate();
  }

  #measure(resetToInitial = false): void {
    const viewport = this.#viewport;
    const image = this.#image;
    if (!viewport || !image?.naturalWidth || !image.naturalHeight || !this.#dialog?.open) {
      const changed = this.#fitScale !== 1 || this.#scale !== 1 || this.#view !== 'fit';
      this.#fitScale = 1;
      this.#scale = 1;
      this.#view = 'fit';
      this.#applyRenderedSize();
      if (changed) this.requestUpdate();
      return;
    }

    const previousFitScale = this.#fitScale;
    const previousScale = this.#scale;
    const previousView = this.#view;
    const nextFit = Math.min(
      1,
      viewport.clientWidth / image.naturalWidth,
      viewport.clientHeight / image.naturalHeight,
    );
    this.#fitScale = Math.max(nextFit, Number.EPSILON);

    if (resetToInitial) {
      const actual = this.state === 'ready' && this.initialView === 'actual-size';
      this.#scale = actual ? 1 : this.#fitScale;
      this.#view = actual && this.#fitScale < 1 - scaleTolerance ? 'actual-size' : 'fit';
    } else if (this.#view === 'fit') {
      this.#scale = this.#fitScale;
    } else if (this.#view === 'actual-size') {
      this.#scale = 1;
    } else {
      this.#scale = Math.min(1, Math.max(this.#fitScale, this.#scale));
      if (this.#scale <= this.#fitScale + scaleTolerance) this.#view = 'fit';
    }

    this.#applyRenderedSize();
    if (
      previousFitScale !== this.#fitScale ||
      previousScale !== this.#scale ||
      previousView !== this.#view
    ) {
      this.requestUpdate();
    }
  }

  #setScale(scale: number, view: MediaViewerView, preserveCenter: boolean): void {
    const viewport = this.#viewport;
    const image = this.#image;
    if (!viewport || !image) return;

    const oldWidth = image.naturalWidth * this.#scale;
    const oldHeight = image.naturalHeight * this.#scale;
    const centerX =
      oldWidth > 0 ? (viewport.scrollLeft + viewport.clientWidth / 2) / oldWidth : 0.5;
    const centerY =
      oldHeight > 0 ? (viewport.scrollTop + viewport.clientHeight / 2) / oldHeight : 0.5;

    this.#scale = Math.min(1, Math.max(this.#fitScale, scale));
    this.#view = view;
    this.#applyRenderedSize();
    this.requestUpdate();

    requestAnimationFrame(() => {
      if (!preserveCenter || this.#view === 'fit') {
        viewport.scrollTo({ left: 0, top: 0 });
      } else {
        const newWidth = image.naturalWidth * this.#scale;
        const newHeight = image.naturalHeight * this.#scale;
        viewport.scrollTo({
          left: Math.max(0, centerX * newWidth - viewport.clientWidth / 2),
          top: Math.max(0, centerY * newHeight - viewport.clientHeight / 2),
        });
      }
    });

    this.dispatchEvent(
      new CustomEvent<WgMediaViewChangeDetail>('wg-media-view-change', {
        bubbles: true,
        composed: true,
        detail: { viewerId: this.viewerId, view: this.#view, scale: this.#scale },
      }),
    );
  }

  #applyRenderedSize(): void {
    const media = this.#media;
    const image = this.#image;
    if (!media || !image?.naturalWidth || !image.naturalHeight) {
      media?.style.removeProperty('--wg-media-viewer-rendered-inline');
      media?.style.removeProperty('--wg-media-viewer-rendered-block');
      return;
    }
    media.style.setProperty(
      '--wg-media-viewer-rendered-inline',
      `${image.naturalWidth * this.#scale}px`,
    );
    media.style.setProperty(
      '--wg-media-viewer-rendered-block',
      `${image.naturalHeight * this.#scale}px`,
    );
  }

  #closeNative(reason: MediaViewerCloseReason): void {
    const dialog = this.#dialog;
    if (!dialog?.open || this.#closing) return;
    this.#closing = true;
    this.#closingReason = reason;
    dialog.close(reason);
  }

  readonly #handleCloseClick = (): void => {
    this.#closeNative('close-control');
  };

  readonly #handleNativeCancel = (): void => {
    if (this.#closing) return;
    this.#closing = true;
    this.#closingReason = 'escape';
  };

  readonly #handleNativeClose = (): void => {
    const reason = this.#closingReason;
    this.#closingReason = 'programmatic';
    this.open = false;

    queueMicrotask(() => {
      this.#modalController.restoreFocus((message) => this.#warn(message));
      this.dispatchEvent(
        new CustomEvent<WgMediaViewerCloseDetail>('wg-media-viewer-close', {
          bubbles: true,
          composed: true,
          detail: { viewerId: this.viewerId, reason },
        }),
      );
      this.#closing = false;
      this.#modalController.release();
    });
  };

  readonly #handleImageLoad = (): void => {
    if (this.#dialog?.open) this.#measure(true);
  };

  readonly #handleMediaSlotChange = (): void => {
    this.#syncImage();
  };

  readonly #handleContentChange = (): void => {
    if (this.#dialog?.open && this.#validationDiagnostic()) this.#closeNative('programmatic');
  };

  readonly #handleOptionalSlotChange = (): void => {
    this.#syncOptionalSlots();
  };

  readonly #handleZoomIn = (): void => {
    this.zoomIn();
  };

  readonly #handleZoomOut = (): void => {
    this.zoomOut();
  };

  readonly #handleFit = (): void => {
    this.fit();
  };

  readonly #handleActualSize = (): void => {
    this.actualSize();
  };

  #warn(message: string): void {
    if (message === this.#diagnosticSignature) return;
    console.warn(`[wg-media-viewer] ${message}.`);
    this.#diagnosticSignature = message;
  }
}

export function defineWgMediaViewer(registry: CustomElementRegistry = customElements): void {
  defineElement(wgMediaViewerTagName, WgMediaViewer, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-media-viewer': WgMediaViewer;
  }
}
