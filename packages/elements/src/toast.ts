import { css, html, nothing } from 'lit';

import {
  alertAnnouncements,
  feedbackConditions,
  isAlertAnnouncement,
  isFeedbackCondition,
  type AlertAnnouncement,
  type FeedbackCondition,
} from './feedback-values.js';
import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgToastTagName = 'wg-toast';

export const toastDismissReasons = ['timeout', 'close', 'programmatic', 'replaced'] as const;
export type ToastDismissReason = (typeof toastDismissReasons)[number];
export type ToastPresentationState = 'closed' | 'queued' | 'visible';

export interface WgToastDismissDetail {
  readonly toastId: string;
  readonly reason: ToastDismissReason;
}

interface ToastRegionOwner extends HTMLElement {
  dismiss(toastId: string, reason?: ToastDismissReason): boolean;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function isInteractive(element: Element): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false;
  if (element.matches('button, input, select, textarea, a[href], summary, [contenteditable]')) {
    return !element.matches(':disabled, [aria-disabled="true"], [hidden]');
  }
  return element.tabIndex >= 0 && !element.matches('[aria-disabled="true"], [hidden]');
}

export class WgToast extends WayglassElement {
  static override properties = {
    toastId: { type: String, attribute: 'toast-id', reflect: true },
    open: { type: Boolean, reflect: true },
    condition: { type: String, reflect: true },
    announcement: { type: String, reflect: true },
    dedupeKey: { type: String, attribute: 'dedupe-key', reflect: true },
    duration: { type: Number, noAccessor: true },
    dismissible: { type: Boolean, reflect: true },
    closeLabel: { type: String, attribute: 'close-label', reflect: true },
  };

  static override styles = css`
    :host {
      --wg-toast-color-background: var(--wg-component-toast-color-background);
      --wg-toast-color-border: var(--wg-component-toast-color-border);
      --wg-toast-color-text: var(--wg-component-toast-color-text);
      --wg-toast-color-detail: var(--wg-component-toast-color-detail);
      --wg-toast-radius: var(--wg-component-toast-radius);
      --wg-toast-space: var(--wg-component-toast-space);
      --wg-toast-space-related: var(--wg-component-toast-space-related);
      --wg-toast-size-marker: var(--wg-component-toast-size-marker);
      --_wg-toast-marker-color: var(--wg-color-semantic-condition-neutral);

      display: block;
      min-inline-size: 0;
      max-inline-size: 100%;
      color: var(--wg-toast-color-text);
      font-family: var(--wg-typography-family-body);
      line-height: var(--wg-typography-line-height-body);
      pointer-events: auto;
    }

    :host([condition='positive']) {
      --_wg-toast-marker-color: var(--wg-color-semantic-condition-positive);
    }

    :host([condition='caution']) {
      --_wg-toast-marker-color: var(--wg-color-semantic-condition-caution);
    }

    :host([condition='critical']) {
      --_wg-toast-marker-color: var(--wg-color-semantic-condition-critical);
    }

    :host([data-presentation='closed']),
    :host([data-presentation='queued']),
    :host([hidden]) {
      display: none !important;
    }

    [part='base'] {
      display: grid;
      min-inline-size: 0;
      grid-template-columns: var(--wg-toast-size-marker) minmax(0, 1fr) auto;
      gap: var(--wg-toast-space-related) var(--wg-toast-space);
      box-sizing: border-box;
      padding: var(--wg-toast-space);
      border: var(--wg-border-width-strong) solid var(--wg-toast-color-border);
      border-radius: var(--wg-toast-radius);
      background: var(--wg-toast-color-background);
      box-shadow: var(--wg-component-toast-elevation);
    }

    [part='marker'] {
      grid-row: 1 / -1;
      border-radius: var(--wg-shape-radius-signal);
      background: var(--_wg-toast-marker-color);
    }

    [part='message'],
    [part='detail'],
    [part='actions'] {
      grid-column: 2;
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    [part='message'] {
      align-self: center;
      font-weight: var(--wg-typography-weight-emphasis);
    }

    [part='detail'] {
      color: var(--wg-toast-color-detail);
    }

    [part='actions'] {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--wg-toast-space-related);
    }

    [part='icon'] {
      grid-column: 2;
    }

    [hidden] {
      display: none !important;
    }

    [part='close-button'] {
      grid-column: 3;
      grid-row: 1;
      display: inline-grid;
      place-items: center;
      min-inline-size: var(--wg-component-toast-size-control-minimum);
      min-block-size: var(--wg-component-toast-size-control-minimum);
      padding: 0;
      border: var(--wg-border-width-standard) solid transparent;
      border-radius: var(--wg-shape-radius-control);
      color: var(--wg-toast-color-text);
      background: transparent;
      font: inherit;
      font-size: var(--wg-typography-size-section);
      cursor: pointer;
    }

    [part='close-button']:hover {
      border-color: var(--wg-toast-color-border);
    }

    [part='close-button']:focus-visible {
      outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
      outline-offset: var(--wg-focus-offset);
    }

    slot[name='detail']::slotted(*),
    slot[name='actions']::slotted(*),
    slot[name='icon']::slotted(*) {
      margin-block: 0;
    }

    @media (prefers-reduced-motion: no-preference) {
      :host([data-presentation='visible']) [part='base'] {
        animation: wg-toast-enter var(--wg-component-toast-motion) var(--wg-motion-easing-standard);
      }
    }

    @keyframes wg-toast-enter {
      from {
        transform: translateY(0.25rem);
      }
    }

    @media (forced-colors: active) {
      [part='base'] {
        border-color: CanvasText;
        color: CanvasText;
        background: Canvas;
        box-shadow: none;
        forced-color-adjust: auto;
      }

      [part='marker'] {
        border: var(--wg-border-width-strong) solid CanvasText;
        background: CanvasText;
      }

      [part='detail'] {
        color: CanvasText;
      }

      [part='close-button'] {
        border-color: ButtonText;
        color: ButtonText;
        background: ButtonFace;
      }

      [part='close-button']:focus-visible {
        outline-color: Highlight;
      }
    }
  `;

  declare toastId: string;
  declare open: boolean;
  declare condition: FeedbackCondition;
  declare announcement: AlertAnnouncement;
  declare dedupeKey: string;
  declare dismissible: boolean;
  declare closeLabel: string;

  #diagnosticSignature = '';
  #duration = 8_000;
  #durationExplicit = false;

  constructor() {
    super();
    this.toastId = '';
    this.open = false;
    this.condition = 'neutral';
    this.announcement = 'polite';
    this.dedupeKey = '';
    this.dismissible = true;
    this.closeLabel = '';
  }

  get duration(): number {
    return this.#duration;
  }

  set duration(value: number) {
    const previous = this.#duration;
    const wasExplicit = this.#durationExplicit;
    const parsed = Number(value);
    this.#duration = parsed === 0 ? 0 : Math.min(60_000, Math.max(5_000, parsed || 8_000));
    this.#durationExplicit = true;
    this.requestUpdate('duration', wasExplicit ? previous : undefined);
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'condition' && !isFeedbackCondition(value)) {
      if (value !== 'neutral') this.setAttribute('condition', 'neutral');
      return;
    }
    if (name === 'announcement' && !isAlertAnnouncement(value)) {
      if (value !== 'polite') this.setAttribute('announcement', 'polite');
      return;
    }
    if (name === 'duration' && value === null) {
      const previousDuration = this.#duration;
      this.#duration = 8_000;
      this.#durationExplicit = false;
      this.requestUpdate('duration', previousDuration);
      return;
    }
    if (name === 'duration') {
      const parsed = Number(value);
      const normalized = parsed === 0 ? 0 : Math.min(60_000, Math.max(5_000, parsed || 8_000));
      if (String(normalized) !== value) {
        this.setAttribute('duration', String(normalized));
        return;
      }
    }
    super.attributeChangedCallback(name, previous, value);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    queueMicrotask(() => this.#validate());
  }

  close(reason: 'programmatic' = 'programmatic'): boolean {
    return this.#owner?.dismiss(this.toastId, reason) ?? false;
  }

  get effectiveDuration(): number {
    return this.#hasInteractiveAction && !this.#durationExplicit ? 0 : this.duration;
  }

  get announcementText(): string {
    const message = Array.from(this.childNodes)
      .filter(
        (node) =>
          node.nodeType === Node.TEXT_NODE ||
          (node instanceof Element && !node.hasAttribute('slot')),
      )
      .map((node) => node.textContent ?? '')
      .join(' ');
    const detail = Array.from(this.querySelectorAll(':scope > [slot="detail"]'))
      .map((node) => node.textContent ?? '')
      .join(' ');
    return normalizeText(`${message} ${detail}`);
  }

  setPresentationState(state: ToastPresentationState): void {
    this.dataset.presentation = state;
  }

  setPresentationOrder(order: number | undefined): void {
    if (order === undefined) this.style.removeProperty('order');
    else this.style.order = String(order);
  }

  focusFirstControl(): boolean {
    const action = this.#actionControls[0];
    if (action) {
      action.focus();
      return true;
    }
    if (this.dismissible && this.closeLabel) {
      this.#closeButton?.focus();
      return true;
    }
    return false;
  }

  get containsFocus(): boolean {
    return (
      this.matches(':focus-within') ||
      document.activeElement === this ||
      (this.shadowRoot?.activeElement ?? null) !== null ||
      (document.activeElement !== null && this.contains(document.activeElement))
    );
  }

  protected override render() {
    const showClose = this.dismissible && Boolean(this.closeLabel);
    return html`<div part="base">
      <span part="marker" aria-hidden="true"></span>
      <span part="icon" aria-hidden="true" ?hidden=${!this.#hasNamedSlot('icon')}
        ><slot name="icon" @slotchange=${this.#handleSlotChange}></slot
      ></span>
      <div part="message"><slot @slotchange=${this.#handleSlotChange}></slot></div>
      <div part="detail" ?hidden=${!this.#hasNamedSlot('detail')}>
        <slot name="detail" @slotchange=${this.#handleSlotChange}></slot>
      </div>
      <div part="actions" ?hidden=${!this.#hasNamedSlot('actions')}>
        <slot name="actions" @slotchange=${this.#handleSlotChange}></slot>
      </div>
      ${
        showClose
          ? html`<button
              part="close-button"
              type="button"
              aria-label=${this.closeLabel}
              @click=${this.#handleClose}
            >
              <span aria-hidden="true">×</span>
            </button>`
          : nothing
      }
    </div>`;
  }

  get #owner(): ToastRegionOwner | undefined {
    const parent = this.parentElement;
    return parent?.tagName === 'WG-TOAST-REGION' &&
      typeof (parent as ToastRegionOwner).dismiss === 'function'
      ? (parent as ToastRegionOwner)
      : undefined;
  }

  get #closeButton(): HTMLButtonElement | null {
    return this.renderRoot.querySelector<HTMLButtonElement>('[part="close-button"]');
  }

  readonly #handleClose = (): void => {
    this.#owner?.dismiss(this.toastId, 'close');
  };

  readonly #handleSlotChange = (): void => {
    this.requestUpdate();
    this.#validate();
    this.dispatchEvent(
      new CustomEvent('wg-toast-anatomy-change', { bubbles: true, composed: true }),
    );
  };

  #validate(): void {
    const problems = [
      !this.toastId && 'a nonempty toast-id is required',
      !this.announcementText && 'visible message text is required',
      this.dismissible && !this.closeLabel && 'close-label is required when dismissible',
      this.effectiveDuration === 0 &&
        !this.dismissible &&
        'manual lifetime requires a close control or application dismissal',
    ].filter(Boolean);
    const signature = problems.join('; ');
    if (signature && signature !== this.#diagnosticSignature) {
      console.warn(`[wg-toast] ${signature}.`);
    }
    this.#diagnosticSignature = signature;
  }

  #hasNamedSlot(name: string): boolean {
    return Array.from(this.children).some((child) => child.getAttribute('slot') === name);
  }

  get #actionControls(): HTMLElement[] {
    return Array.from(this.querySelectorAll(':scope > [slot="actions"]')).flatMap((child) => {
      const controls = Array.from(child.querySelectorAll('*')).filter(isInteractive);
      return isInteractive(child) ? [child, ...controls] : controls;
    });
  }

  get #hasInteractiveAction(): boolean {
    return this.#actionControls.length > 0;
  }
}

export function defineWgToast(registry: CustomElementRegistry = customElements): void {
  defineElement(wgToastTagName, WgToast, registry);
}

export { alertAnnouncements as toastAnnouncements, feedbackConditions as toastConditions };

declare global {
  interface HTMLElementTagNameMap {
    'wg-toast': WgToast;
  }
}
