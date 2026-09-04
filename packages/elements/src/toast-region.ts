import { css, html } from 'lit';

import { defineElement } from './registration.js';
import {
  defineWgToast,
  type ToastDismissReason,
  WgToast,
  type WgToastDismissDetail,
} from './toast.js';
import { WayglassElement } from './wayglass-element.js';

export const wgToastRegionTagName = 'wg-toast-region';

export const toastRegionPlacements = [
  'block-start-end',
  'block-start-start',
  'block-end-end',
  'block-end-start',
] as const;
export type ToastRegionPlacement = (typeof toastRegionPlacements)[number];

interface ToastRecord {
  toast: WgToast;
  configuredDuration: number;
  remaining: number;
  startedAt: number;
  timer: number | undefined;
  visible: boolean;
  announceOnPromotion: boolean;
  suppressAnnouncement: boolean;
}

function isToastRegionPlacement(value: unknown): value is ToastRegionPlacement {
  return (
    typeof value === 'string' && toastRegionPlacements.some((placement) => placement === value)
  );
}

function isUsableFocusTarget(value: Element | null): value is HTMLElement {
  return (
    value instanceof HTMLElement &&
    value.isConnected &&
    !value.matches(':disabled, [aria-disabled="true"], [hidden]')
  );
}

export class WgToastRegion extends WayglassElement {
  static override properties = {
    placement: { type: String, reflect: true },
    maxVisible: { type: Number, attribute: 'max-visible', reflect: true },
    paused: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      position: fixed;
      z-index: var(--wg-z-index-overlay);
      display: block;
      max-inline-size: calc(100vw - 2 * var(--wg-component-toast-space-viewport));
      pointer-events: none;
    }

    :host([placement='block-start-end']) {
      inset-block-start: var(--wg-component-toast-space-viewport);
      inset-inline-end: var(--wg-component-toast-space-viewport);
    }

    :host([placement='block-start-start']) {
      inset-block-start: var(--wg-component-toast-space-viewport);
      inset-inline-start: var(--wg-component-toast-space-viewport);
    }

    :host([placement='block-end-end']) {
      inset-block-end: var(--wg-component-toast-space-viewport);
      inset-inline-end: var(--wg-component-toast-space-viewport);
    }

    :host([placement='block-end-start']) {
      inset-block-end: var(--wg-component-toast-space-viewport);
      inset-inline-start: var(--wg-component-toast-space-viewport);
    }

    [part='stack'] {
      display: flex;
      inline-size: min(
        var(--wg-component-toast-size-inline-maximum),
        calc(100vw - 2 * var(--wg-component-toast-space-viewport))
      );
      max-block-size: calc(100dvh - 2 * var(--wg-component-toast-space-viewport));
      flex-direction: column;
      gap: var(--wg-component-toast-space-viewport);
      overflow: auto;
      overscroll-behavior: contain;
      pointer-events: none;
    }

    :host([placement^='block-end']) [part='stack'] {
      flex-direction: column-reverse;
    }

    [part$='announcer'] {
      position: fixed;
      inline-size: 1px;
      block-size: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
    }

    @media (forced-colors: active) {
      :host {
        forced-color-adjust: auto;
      }
    }
  `;

  declare placement: ToastRegionPlacement;
  declare maxVisible: number;
  declare paused: boolean;

  #records: ToastRecord[] = [];
  #observer: MutationObserver | undefined;
  #ready = false;
  #hoverPaused = false;
  #focusPaused = false;
  #focusReturnTarget: HTMLElement | null = null;
  #lastFocusedToast: WgToast | null = null;
  #syncQueued = false;
  #diagnosticSignature = '';
  #deferredDismissals = new Set<ToastRecord>();
  #announcementQueues: Record<'polite' | 'assertive', string[]> = {
    polite: [],
    assertive: [],
  };
  #announcementTimers: Partial<Record<'polite' | 'assertive', number>> = {};

  constructor() {
    super();
    this.placement = 'block-end-end';
    this.maxVisible = 3;
    this.paused = false;
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'placement' && !isToastRegionPlacement(value)) {
      if (value !== 'block-end-end') this.setAttribute('placement', 'block-end-end');
      return;
    }
    if (name === 'max-visible' && value !== null) {
      const parsed = Number.parseInt(value, 10);
      const normalized = Math.min(5, Math.max(1, parsed || 3));
      if (String(normalized) !== value) {
        this.setAttribute('max-visible', String(normalized));
        return;
      }
    }
    super.attributeChangedCallback(name, previous, value);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('pointerenter', this.#handlePointerEnter);
    this.addEventListener('pointerleave', this.#handlePointerLeave);
    this.addEventListener('focusin', this.#handleFocusIn);
    this.addEventListener('focusout', this.#handleFocusOut);
    this.addEventListener('wg-toast-anatomy-change', this.#scheduleSync);
    document.addEventListener('focusin', this.#handleDocumentFocusIn, true);
    document.addEventListener('visibilitychange', this.#handleVisibilityChange);
    this.#observer = new MutationObserver(this.#scheduleSync);
    this.#observer.observe(this, {
      attributes: true,
      attributeFilter: [
        'open',
        'toast-id',
        'dedupe-key',
        'announcement',
        'duration',
        'dismissible',
        'close-label',
      ],
      childList: true,
      subtree: true,
    });
    this.#synchronize();
    if (document.querySelectorAll(wgToastRegionTagName).length > 1) {
      this.#warn('multiple document-level toast regions require genuinely independent scope');
    }
    queueMicrotask(() => {
      this.#ready = true;
    });
  }

  override disconnectedCallback(): void {
    this.removeEventListener('pointerenter', this.#handlePointerEnter);
    this.removeEventListener('pointerleave', this.#handlePointerLeave);
    this.removeEventListener('focusin', this.#handleFocusIn);
    this.removeEventListener('focusout', this.#handleFocusOut);
    this.removeEventListener('wg-toast-anatomy-change', this.#scheduleSync);
    document.removeEventListener('focusin', this.#handleDocumentFocusIn, true);
    document.removeEventListener('visibilitychange', this.#handleVisibilityChange);
    this.#observer?.disconnect();
    this.#observer = undefined;
    for (const record of this.#records) this.#stopTimer(record, false);
    for (const timer of Object.values(this.#announcementTimers)) {
      if (timer !== undefined) window.clearTimeout(timer);
    }
    this.#announcementTimers = {};
    super.disconnectedCallback();
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has('paused')) this.#updateTimers();
    if (changed.has('maxVisible')) this.#updateVisibility();
  }

  protected override render() {
    return html`<div part="stack"><slot @slotchange=${this.#scheduleSync}></slot></div>
      <div part="polite-announcer" role="status" aria-live="polite" aria-atomic="true"></div>
      <div part="assertive-announcer" role="alert" aria-live="assertive" aria-atomic="true"></div>`;
  }

  dismiss(toastId: string, reason?: 'programmatic'): boolean;
  dismiss(toastId: string, reason: ToastDismissReason = 'programmatic'): boolean {
    const record = this.#records.find((candidate) => candidate.toast.toastId === toastId);
    if (!record) return false;
    this.#dismissRecord(record, reason, true);
    return true;
  }

  dismissAll(reason: 'programmatic' = 'programmatic'): void {
    let changed = false;
    for (const record of [...this.#records]) {
      if (record.toast.containsFocus) {
        this.#deferredDismissals.add(record);
        continue;
      }
      this.#dismissRecord(record, reason, false);
      changed = true;
    }
    if (changed) this.#updateVisibility();
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  readonly #scheduleSync = (): void => {
    if (this.#syncQueued) return;
    this.#syncQueued = true;
    queueMicrotask(() => {
      this.#syncQueued = false;
      this.#synchronize();
    });
  };

  #synchronize(): void {
    const children = Array.from(this.children).filter(
      (child): child is WgToast => child instanceof WgToast,
    );
    const childSet = new Set(children);

    for (const record of [...this.#records]) {
      if (!childSet.has(record.toast)) {
        this.#removeRecord(record);
      } else if (!record.toast.open) {
        this.#dismissRecord(record, 'programmatic', false);
      }
    }

    for (const toast of children) {
      const existing = this.#records.find((record) => record.toast === toast);
      if (existing) {
        const duration = toast.effectiveDuration;
        if (duration !== existing.configuredDuration) {
          this.#stopTimer(existing, false);
          existing.configuredDuration = duration;
          existing.remaining = duration;
        }
        continue;
      }
      if (!toast.open) {
        toast.setPresentationState('closed');
        continue;
      }
      if (!toast.toastId || !toast.announcementText) {
        toast.setPresentationState('queued');
        continue;
      }
      if (this.#records.length >= 50) {
        toast.setPresentationState('queued');
        this.#warn('the open queue exceeds the 50-toast diagnostic ceiling');
        continue;
      }
      if (this.#records.some((record) => record.toast.toastId === toast.toastId)) {
        toast.setPresentationState('queued');
        this.#warn(`toast-id "${toast.toastId}" is already present`);
        continue;
      }

      const duplicate = toast.dedupeKey
        ? this.#records.find((record) => record.toast.dedupeKey === toast.dedupeKey)
        : undefined;
      const record: ToastRecord = {
        toast,
        configuredDuration: toast.effectiveDuration,
        remaining: toast.effectiveDuration,
        startedAt: 0,
        timer: undefined,
        visible: false,
        announceOnPromotion: this.#ready,
        suppressAnnouncement:
          duplicate !== undefined &&
          duplicate.toast.announcementText === toast.announcementText &&
          !(duplicate.toast.announcement !== 'assertive' && toast.announcement === 'assertive'),
      };

      if (duplicate) {
        const index = this.#records.indexOf(duplicate);
        this.#dismissRecord(duplicate, 'replaced', false);
        this.#records.splice(Math.min(index, this.#records.length), 0, record);
      } else {
        this.#records.push(record);
      }
      toast.setPresentationState('queued');
    }

    this.#validateChildren();
    this.#updateVisibility();
  }

  #updateVisibility(): void {
    const visibleRecords = this.#records.slice(0, this.maxVisible);
    for (const [index, record] of this.#records.entries()) {
      record.toast.setPresentationOrder(index);
      const shouldBeVisible = visibleRecords.includes(record);
      if (shouldBeVisible === record.visible) continue;
      record.visible = shouldBeVisible;
      record.toast.setPresentationState(shouldBeVisible ? 'visible' : 'queued');
      if (shouldBeVisible) {
        if (record.announceOnPromotion && !record.suppressAnnouncement) {
          this.#announce(record.toast);
        }
        this.#startTimer(record);
      } else {
        this.#stopTimer(record, true);
      }
    }
    this.#updateTimers();
  }

  #dismissRecord(record: ToastRecord, reason: ToastDismissReason, update: boolean): void {
    const hadFocus = record.toast.containsFocus || this.#lastFocusedToast === record.toast;
    if (hadFocus) this.#restoreFocusAfter(record);
    this.#removeRecord(record);
    record.toast.open = false;
    record.toast.removeAttribute('open');
    record.toast.setPresentationState('closed');
    record.toast.setPresentationOrder(undefined);
    record.toast.dispatchEvent(
      new CustomEvent<WgToastDismissDetail>('wg-toast-dismiss', {
        bubbles: true,
        composed: true,
        detail: { toastId: record.toast.toastId, reason },
      }),
    );
    if (update) this.#updateVisibility();
  }

  #removeRecord(record: ToastRecord): void {
    this.#stopTimer(record, false);
    this.#deferredDismissals.delete(record);
    const index = this.#records.indexOf(record);
    if (index >= 0) this.#records.splice(index, 1);
  }

  #restoreFocusAfter(record: ToastRecord): void {
    if (isUsableFocusTarget(this.#focusReturnTarget)) {
      this.#focusReturnTarget.focus();
      return;
    }
    const next = this.#records.find((candidate) => candidate !== record && candidate.visible);
    if (next?.toast.focusFirstControl()) return;
    document.body.focus();
  }

  #startTimer(record: ToastRecord): void {
    if (!record.visible || record.remaining <= 0 || this.#isPaused || record.timer !== undefined) {
      return;
    }
    record.startedAt = performance.now();
    record.timer = window.setTimeout(() => {
      record.timer = undefined;
      record.remaining = 0;
      this.#dismissRecord(record, 'timeout', true);
    }, record.remaining);
  }

  #stopTimer(record: ToastRecord, preserveRemaining: boolean): void {
    if (record.timer === undefined) return;
    window.clearTimeout(record.timer);
    record.timer = undefined;
    if (preserveRemaining) {
      record.remaining = Math.max(0, record.remaining - (performance.now() - record.startedAt));
    }
  }

  #updateTimers(): void {
    for (const record of this.#records) {
      if (!record.visible || record.remaining <= 0) continue;
      if (this.#isPaused) this.#stopTimer(record, true);
      else this.#startTimer(record);
    }
  }

  get #isPaused(): boolean {
    return this.paused || this.#hoverPaused || this.#focusPaused || document.hidden;
  }

  readonly #handlePointerEnter = (): void => {
    this.#hoverPaused = true;
    this.#updateTimers();
  };

  readonly #handlePointerLeave = (): void => {
    this.#hoverPaused = false;
    this.#updateTimers();
  };

  readonly #handleFocusIn = (event: FocusEvent): void => {
    this.#lastFocusedToast =
      (event.composedPath().find((item) => item instanceof WgToast) as WgToast | undefined) ?? null;
    if (!(event.relatedTarget instanceof Node) || !this.contains(event.relatedTarget)) {
      this.#focusReturnTarget =
        event.relatedTarget instanceof HTMLElement ? event.relatedTarget : this.#focusReturnTarget;
    }
    this.#focusPaused = true;
    this.#updateTimers();
  };

  readonly #handleFocusOut = (): void => {
    queueMicrotask(() => {
      this.#focusPaused = this.#records.some((record) => record.toast.containsFocus);
      let dismissed = false;
      for (const record of [...this.#deferredDismissals]) {
        if (record.toast.containsFocus) continue;
        this.#dismissRecord(record, 'programmatic', false);
        dismissed = true;
      }
      if (dismissed) this.#updateVisibility();
      this.#updateTimers();
    });
  };

  readonly #handleVisibilityChange = (): void => {
    this.#updateTimers();
  };

  readonly #handleDocumentFocusIn = (event: FocusEvent): void => {
    if (!event.composedPath().includes(this) && event.target instanceof HTMLElement) {
      this.#focusReturnTarget = event.target;
      this.#lastFocusedToast = null;
    }
  };

  #announce(toast: WgToast): void {
    if (toast.announcement === 'off' || !toast.announcementText) return;
    this.#announcementQueues[toast.announcement].push(toast.announcementText);
    this.#processAnnouncementQueue(toast.announcement);
  }

  #processAnnouncementQueue(priority: 'polite' | 'assertive'): void {
    if (this.#announcementTimers[priority] !== undefined) return;
    const node = this.renderRoot.querySelector<HTMLElement>(`[part="${priority}-announcer"]`);
    const next = this.#announcementQueues[priority].shift();
    if (!node || !next) return;
    node.textContent = '';
    requestAnimationFrame(() => {
      node.textContent = next;
      this.#announcementTimers[priority] = window.setTimeout(() => {
        delete this.#announcementTimers[priority];
        this.#processAnnouncementQueue(priority);
      }, 150);
    });
  }

  #validateChildren(): void {
    const invalid = Array.from(this.children).filter((child) => !(child instanceof WgToast));
    if (invalid.length > 0) {
      this.#warn('direct children must be wg-toast elements');
    } else if (this.#diagnosticSignature === 'direct children must be wg-toast elements') {
      this.#diagnosticSignature = '';
    }
  }

  #warn(message: string): void {
    if (message === this.#diagnosticSignature) return;
    console.warn(`[wg-toast-region] ${message}.`);
    this.#diagnosticSignature = message;
  }
}

export function defineWgToastRegion(registry: CustomElementRegistry = customElements): void {
  defineWgToast(registry);
  defineElement(wgToastRegionTagName, WgToastRegion, registry);
}

export { isToastRegionPlacement };

declare global {
  interface HTMLElementTagNameMap {
    'wg-toast-region': WgToastRegion;
  }
}
