import { css, html } from 'lit';
import type { PropertyValues } from 'lit';

import {
  isSequentialFocusTarget,
  isUsableFocusTarget,
  NativeModalController,
} from './native-modal-controller.js';
import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const dialogInitialFocuses = ['heading', 'close', 'first-interactive'] as const;
export type DialogInitialFocus = (typeof dialogInitialFocuses)[number];

export const dialogSizes = ['compact', 'standard', 'wide'] as const;
export type DialogSize = (typeof dialogSizes)[number];

export const dialogCloseReasons = ['close-control', 'escape', 'programmatic'] as const;
export type DialogCloseReason = (typeof dialogCloseReasons)[number];

export interface DialogShowOptions {
  readonly invoker?: HTMLElement;
  readonly fallbackFocus?: HTMLElement;
  readonly initialFocus?: HTMLElement;
}

export interface WgDialogDetail {
  readonly dialogId: string;
}

export interface WgDialogCloseDetail extends WgDialogDetail {
  readonly reason: DialogCloseReason;
}

export const wgDialogTagName = 'wg-dialog';

let dialogInstanceSequence = 0;

export function isDialogInitialFocus(value: unknown): value is DialogInitialFocus {
  return (
    typeof value === 'string' && dialogInitialFocuses.some((initialFocus) => initialFocus === value)
  );
}

export function isDialogSize(value: unknown): value is DialogSize {
  return typeof value === 'string' && dialogSizes.some((size) => size === value);
}

const sequentialFocusSelector = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  '[contenteditable="true"]',
  '[tabindex]',
].join(',');

export class WgDialog extends WayglassElement {
  static override properties = {
    dialogId: { type: String, attribute: 'dialog-id', reflect: true },
    open: { type: Boolean, reflect: true },
    closeLabel: { type: String, attribute: 'close-label' },
    initialFocus: { type: String, attribute: 'initial-focus', reflect: true },
    size: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      color: var(--wg-component-dialog-color-text);
      font-family: var(--wg-typography-family-body);
    }

    [part='dialog'] {
      /* Private selector between locked size tokens; not a consumer theming hook. */
      --_wg-dialog-inline-maximum: var(--wg-component-dialog-size-inline-maximum-standard);

      inline-size: min(
        var(--_wg-dialog-inline-maximum),
        calc(100vw - 2 * var(--wg-component-dialog-space-viewport))
      );
      min-inline-size: 0;
      max-inline-size: none;
      max-block-size: calc(100dvh - 2 * var(--wg-component-dialog-space-viewport));
      box-sizing: border-box;
      padding: 0;
      overflow: visible;
      border: 0;
      color: inherit;
      background: transparent;
    }

    :host([size='compact']) [part='dialog'] {
      --_wg-dialog-inline-maximum: var(--wg-component-dialog-size-inline-maximum-compact);
    }

    :host([size='wide']) [part='dialog'] {
      --_wg-dialog-inline-maximum: var(--wg-component-dialog-size-inline-maximum-wide);
    }

    [part='dialog']::backdrop {
      background: var(--wg-component-dialog-color-backdrop);
    }

    [part='surface'] {
      display: grid;
      max-block-size: calc(100dvh - 2 * var(--wg-component-dialog-space-viewport));
      box-sizing: border-box;
      grid-template-rows: auto minmax(0, 1fr) auto;
      overflow: hidden;
      border: var(--wg-border-width-strong) solid var(--wg-component-dialog-color-border);
      border-radius: var(--wg-component-dialog-radius);
      color: var(--wg-component-dialog-color-text);
      background: var(--wg-component-dialog-color-background);
      box-shadow: var(--wg-component-dialog-elevation);
    }

    [part='header'] {
      display: flex;
      min-inline-size: 0;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--wg-component-dialog-space-related);
      padding: var(--wg-component-dialog-space);
      border-block-end: var(--wg-border-width-standard) solid
        var(--wg-component-dialog-color-border);
    }

    [part='heading'] {
      min-inline-size: 0;
      color: var(--wg-component-dialog-color-text);
      font-size: var(--wg-typography-size-section);
      font-weight: var(--wg-typography-weight-emphasis);
      line-height: var(--wg-typography-line-height-compact);
      overflow-wrap: anywhere;
    }

    [part='heading']:focus-visible,
    [part='close-button']:focus-visible {
      outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
      outline-offset: var(--wg-focus-offset);
    }

    [part='close-button'] {
      display: inline-flex;
      min-inline-size: var(--wg-component-dialog-size-control-minimum);
      min-block-size: var(--wg-component-dialog-size-control-minimum);
      flex: none;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding-block: var(--wg-component-button-space-block);
      padding-inline: var(--wg-component-button-space-inline);
      border: var(--wg-border-width-standard) solid var(--wg-component-dialog-color-border);
      border-radius: var(--wg-component-button-radius);
      color: var(--wg-component-dialog-color-text);
      background: var(--wg-component-dialog-color-close-background);
      font: inherit;
      font-weight: var(--wg-typography-weight-medium);
      line-height: 1.2;
      cursor: pointer;
    }

    [part='close-button']:hover {
      background: var(--wg-component-dialog-color-close-background-hover);
    }

    [part='body'] {
      min-block-size: 0;
      padding: var(--wg-component-dialog-space);
      overflow: auto;
      overscroll-behavior: contain;
      color: var(--wg-component-dialog-color-detail);
      font-size: var(--wg-typography-size-body);
      line-height: var(--wg-typography-line-height-body);
      overflow-wrap: anywhere;
    }

    [part='actions'] {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--wg-component-dialog-space-related);
      padding: var(--wg-component-dialog-space);
      border-block-start: var(--wg-border-width-standard) solid
        var(--wg-component-dialog-color-border);
    }

    [part='actions'][hidden] {
      display: none;
    }

    [part='dialog'][open] [part='surface'] {
      animation: wg-dialog-enter var(--wg-component-dialog-motion) var(--wg-motion-easing-standard);
    }

    @keyframes wg-dialog-enter {
      from {
        transform: translateY(var(--wg-component-dialog-motion-distance));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [part='dialog'][open] [part='surface'] {
        animation: none;
      }
    }

    @media (forced-colors: active) {
      [part='dialog']::backdrop {
        background: Canvas;
        opacity: 0.75;
      }

      [part='surface'],
      [part='close-button'] {
        border-color: ButtonText;
        color: ButtonText;
        background: Canvas;
        box-shadow: none;
        forced-color-adjust: auto;
      }
    }
  `;

  declare dialogId: string;
  declare open: boolean;
  declare closeLabel: string;
  declare initialFocus: DialogInitialFocus;
  declare size: DialogSize;

  readonly #instanceId = ++dialogInstanceSequence;
  readonly #modalController = new NativeModalController(this);
  #closingReason: DialogCloseReason = 'programmatic';
  #closing = false;
  #pendingOptions: DialogShowOptions = {};
  #explicitInitialFocus: HTMLElement | null = null;
  #hasActions = false;
  #diagnosticSignature = '';

  constructor() {
    super();
    this.dialogId = '';
    this.open = false;
    this.closeLabel = '';
    this.initialFocus = 'heading';
    this.size = 'standard';
  }

  override connectedCallback(): void {
    this.#syncActions();
    super.connectedCallback();
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'initial-focus' && !isDialogInitialFocus(value)) {
      if (value !== 'heading') this.setAttribute('initial-focus', 'heading');
      return;
    }
    if (name === 'size' && !isDialogSize(value)) {
      if (value !== 'standard') this.setAttribute('size', 'standard');
      return;
    }
    super.attributeChangedCallback(name, previous, value);
  }

  override disconnectedCallback(): void {
    this.#modalController.release();
    this.#dialog?.close();
    this.#closing = false;
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    if (this.open) this.#requestOpen(this.#pendingOptions);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (!changed.has('open') || this.#closing) return;
    if (this.open && !this.#dialog?.open) this.#requestOpen(this.#pendingOptions);
    if (!this.open && this.#dialog?.open) this.#closeNative('programmatic');
  }

  protected override render() {
    const headingId = `wg-dialog-heading-${this.#instanceId}`;
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
        <div part="body"><slot @slotchange=${this.#handleContentChange}></slot></div>
        <footer part="actions" ?hidden=${!this.#hasActions}>
          <slot name="actions" @slotchange=${this.#handleActionsChange}></slot>
        </footer>
      </div>
    </dialog>`;
  }

  show(options: DialogShowOptions = {}): boolean {
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

  override focus(options?: FocusOptions): void {
    if (!this.#dialog?.open) return;
    this.#initialFocusTarget?.focus(options);
  }

  get #dialog(): HTMLDialogElement | null {
    return this.renderRoot.querySelector('[part="dialog"]');
  }

  get #heading(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="heading"]');
  }

  get #closeButton(): HTMLButtonElement | null {
    return this.renderRoot.querySelector('[part="close-button"]');
  }

  get #initialFocusTarget(): HTMLElement | null {
    if (isUsableFocusTarget(this.#explicitInitialFocus)) return this.#explicitInitialFocus;
    if (this.initialFocus === 'close') return this.#closeButton ?? this.#heading;
    if (this.initialFocus === 'first-interactive') {
      return this.#firstConsumerInteractive() ?? this.#heading ?? this.#closeButton;
    }
    return this.#heading ?? this.#closeButton;
  }

  #requestOpen(options: DialogShowOptions): boolean {
    const dialog = this.#dialog;
    if (!dialog || !this.isConnected) return this.#rejectOpen('dialog must be connected and ready');
    if (dialog.open) return true;
    const diagnostic = this.#validationDiagnostic(options.initialFocus);
    if (diagnostic) return this.#rejectOpen(diagnostic);

    this.#pendingOptions = {};
    this.#explicitInitialFocus = options.initialFocus ?? null;
    const openDiagnostic = this.#modalController.open(
      dialog,
      `dialog:${this.dialogId || '(missing id)'}`,
      options,
    );
    if (openDiagnostic) return this.#rejectOpen(openDiagnostic);

    this.open = true;
    this.#diagnosticSignature = '';
    this.dispatchEvent(
      new CustomEvent<WgDialogDetail>('wg-dialog-open', {
        bubbles: true,
        composed: true,
        detail: { dialogId: this.dialogId },
      }),
    );
    queueMicrotask(() => {
      if (this.#dialog?.open && !this.#closing) this.focus({ preventScroll: true });
    });
    return true;
  }

  #rejectOpen(message: string): false {
    this.open = false;
    this.#explicitInitialFocus = null;
    this.#warn(message);
    return false;
  }

  #validationDiagnostic(initialFocus?: HTMLElement): string | null {
    if (!(this.dialogId ?? '').trim()) return 'dialog-id is required';
    const duplicates = Array.from(
      this.ownerDocument.querySelectorAll<WgDialog>(wgDialogTagName),
    ).filter((candidate) => candidate.dialogId === this.dialogId);
    if (duplicates.length > 1) return `dialog-id "${this.dialogId}" must be unique`;
    if (!(this.closeLabel ?? '').trim()) return 'close-label is required';
    if (!this.#slotHasContent('heading')) return 'visible heading content is required';
    if (!this.#slotHasContent()) return 'modal body content is required';
    if (initialFocus && !this.#isEligibleExplicitFocus(initialFocus)) {
      return 'explicit initial focus must be a usable descendant of the dialog content';
    }
    return null;
  }

  #slotHasContent(name?: string): boolean {
    const selector = name ? `slot[name="${name}"]` : 'slot:not([name])';
    const slot = this.renderRoot.querySelector<HTMLSlotElement>(selector);
    return (slot?.assignedNodes({ flatten: true }) ?? []).some(
      (node) => node instanceof Element || Boolean(node.textContent?.trim()),
    );
  }

  #firstConsumerInteractive(): HTMLElement | null {
    const slots = Array.from(
      this.renderRoot.querySelectorAll<HTMLSlotElement>('slot:not([name]), slot[name="actions"]'),
    );
    for (const slot of slots) {
      for (const assigned of slot.assignedElements({ flatten: true })) {
        if (assigned instanceof HTMLElement && assigned.matches(sequentialFocusSelector)) {
          if (isSequentialFocusTarget(assigned)) return assigned;
        }
        for (const candidate of assigned.querySelectorAll<HTMLElement>(sequentialFocusSelector)) {
          if (isSequentialFocusTarget(candidate)) return candidate;
        }
      }
    }
    return null;
  }

  #isEligibleExplicitFocus(target: HTMLElement): boolean {
    return Boolean(
      this.contains(target) &&
      target.isConnected &&
      target.tabIndex >= 0 &&
      !target.matches(':disabled, [aria-disabled="true"], [hidden], [inert]') &&
      !target.closest('[hidden], [inert]'),
    );
  }

  #closeNative(reason: DialogCloseReason): void {
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
        new CustomEvent<WgDialogCloseDetail>('wg-dialog-close', {
          bubbles: true,
          composed: true,
          detail: { dialogId: this.dialogId, reason },
        }),
      );
      this.#explicitInitialFocus = null;
      this.#closing = false;
      this.#modalController.release();
    });
  };

  readonly #handleContentChange = (): void => {
    if (this.#dialog?.open && this.#validationDiagnostic()) this.#closeNative('programmatic');
  };

  readonly #handleActionsChange = (): void => {
    this.#syncActions();
  };

  #syncActions(): void {
    const hasActions = Array.from(this.children).some(
      (element) => element.getAttribute('slot') === 'actions',
    );
    if (hasActions === this.#hasActions) return;
    this.#hasActions = hasActions;
    this.requestUpdate();
  }

  #warn(message: string): void {
    if (message === this.#diagnosticSignature) return;
    console.warn(`[wg-dialog] ${message}.`);
    this.#diagnosticSignature = message;
  }
}

export function defineWgDialog(registry: CustomElementRegistry = customElements): void {
  defineElement(wgDialogTagName, WgDialog, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-dialog': WgDialog;
  }
}
