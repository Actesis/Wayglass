import { css, html, nothing } from 'lit';
import type { PropertyValues } from 'lit';

import { defineElement } from './registration.js';
import { NativeModalController } from './native-modal-controller.js';
import { WayglassElement } from './wayglass-element.js';

export const confirmationActionAppearances = ['primary', 'critical'] as const;
export type ConfirmationActionAppearance = (typeof confirmationActionAppearances)[number];

export const confirmationAttentions = ['ordinary', 'interruptive'] as const;
export type ConfirmationAttention = (typeof confirmationAttentions)[number];

export const confirmationInitialFocuses = ['cancel', 'action', 'heading'] as const;
export type ConfirmationInitialFocus = (typeof confirmationInitialFocuses)[number];

export const confirmationCloseReasons = ['action', 'cancel', 'escape', 'programmatic'] as const;
export type ConfirmationCloseReason = (typeof confirmationCloseReasons)[number];

export interface ConfirmationShowOptions {
  readonly invoker?: HTMLElement;
  readonly fallbackFocus?: HTMLElement;
}

export interface WgConfirmationActionDetail {
  readonly dialogId: string;
}

export interface WgConfirmationCloseDetail extends WgConfirmationActionDetail {
  readonly reason: ConfirmationCloseReason;
}

export const wgConfirmationDialogTagName = 'wg-confirmation-dialog';

let confirmationInstanceSequence = 0;

export function isConfirmationActionAppearance(
  value: unknown,
): value is ConfirmationActionAppearance {
  return (
    typeof value === 'string' &&
    confirmationActionAppearances.some((appearance) => appearance === value)
  );
}

export function isConfirmationAttention(value: unknown): value is ConfirmationAttention {
  return (
    typeof value === 'string' && confirmationAttentions.some((attention) => attention === value)
  );
}

export function isConfirmationInitialFocus(value: unknown): value is ConfirmationInitialFocus {
  return (
    typeof value === 'string' &&
    confirmationInitialFocuses.some((initialFocus) => initialFocus === value)
  );
}

export class WgConfirmationDialog extends WayglassElement {
  static override properties = {
    dialogId: { type: String, attribute: 'dialog-id', reflect: true },
    open: { type: Boolean, reflect: true },
    actionLabel: { type: String, attribute: 'action-label' },
    cancelLabel: { type: String, attribute: 'cancel-label' },
    actionAppearance: { type: String, attribute: 'action-appearance', reflect: true },
    attention: { type: String, reflect: true },
    initialFocus: { type: String, attribute: 'initial-focus', reflect: true },
  };

  static override styles = css`
    :host {
      color: var(--wg-component-confirmation-color-text);
      font-family: var(--wg-typography-family-body);
    }

    [part='dialog'] {
      inline-size: min(
        var(--wg-component-confirmation-size-inline-maximum),
        calc(100vw - 2 * var(--wg-component-confirmation-space-viewport))
      );
      min-inline-size: 0;
      max-inline-size: none;
      max-block-size: calc(100dvh - 2 * var(--wg-component-confirmation-space-viewport));
      box-sizing: border-box;
      padding: 0;
      overflow: visible;
      border: 0;
      color: inherit;
      background: transparent;
    }

    [part='dialog']::backdrop {
      background: var(--wg-component-confirmation-color-backdrop);
    }

    [part='surface'] {
      position: relative;
      display: grid;
      max-block-size: calc(100dvh - 2 * var(--wg-component-confirmation-space-viewport));
      box-sizing: border-box;
      grid-template-columns: var(--wg-component-confirmation-size-marker) minmax(0, 1fr);
      overflow: auto;
      overscroll-behavior: contain;
      border: var(--wg-border-width-strong) solid var(--wg-component-confirmation-color-border);
      border-radius: var(--wg-component-confirmation-radius);
      color: var(--wg-component-confirmation-color-text);
      background: var(--wg-component-confirmation-color-background);
      box-shadow: var(--wg-component-confirmation-elevation);
    }

    [part='marker'] {
      grid-row: 1 / -1;
      background: var(--wg-component-confirmation-color-marker);
    }

    [part='content'] {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-component-confirmation-space-related);
      padding: var(--wg-component-confirmation-space);
    }

    [part='icon']:empty {
      display: none;
    }

    [part='heading'] {
      margin: 0;
      color: var(--wg-component-confirmation-color-text);
      font-size: var(--wg-typography-size-section);
      font-weight: var(--wg-typography-weight-emphasis);
      line-height: var(--wg-typography-line-height-compact);
      overflow-wrap: anywhere;
    }

    [part='heading']:focus-visible {
      outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
      outline-offset: var(--wg-focus-offset);
    }

    [part='description'] {
      color: var(--wg-component-confirmation-color-detail);
      font-size: var(--wg-typography-size-body);
      line-height: var(--wg-typography-line-height-body);
      overflow-wrap: anywhere;
    }

    [part='actions'] {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--wg-component-confirmation-space-related);
      margin-block-start: var(--wg-component-confirmation-space-related);
    }

    [part$='button'] {
      display: inline-flex;
      min-inline-size: var(--wg-component-confirmation-size-control-minimum);
      min-block-size: var(--wg-component-confirmation-size-control-minimum);
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding-block: var(--wg-component-button-space-block);
      padding-inline: var(--wg-component-button-space-inline);
      border: var(--wg-border-width-standard) solid var(--wg-component-confirmation-color-border);
      border-radius: var(--wg-component-button-radius);
      font: inherit;
      font-weight: var(--wg-typography-weight-medium);
      line-height: 1.2;
      text-align: center;
      overflow-wrap: anywhere;
      cursor: pointer;
    }

    [part$='button']:focus-visible {
      outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
      outline-offset: var(--wg-focus-offset);
    }

    [part='cancel-button'] {
      color: var(--wg-component-confirmation-color-text);
      background: var(--wg-component-confirmation-color-cancel-background);
    }

    [part='cancel-button']:hover {
      background: var(--wg-component-confirmation-color-cancel-background-hover);
    }

    [part='action-button'] {
      border-color: var(--wg-component-confirmation-color-action);
      color: var(--wg-component-confirmation-color-action-text);
      background: var(--wg-component-confirmation-color-action);
    }

    [part='action-button']:hover {
      background: var(--wg-component-confirmation-color-action-hover);
    }

    :host([action-appearance='critical']) [part='action-button'] {
      border-color: var(--wg-component-confirmation-color-action-critical);
      color: var(--wg-component-confirmation-color-action-critical-text);
      background: var(--wg-component-confirmation-color-action-critical);
    }

    :host([action-appearance='critical']) [part='action-button']:hover {
      background: var(--wg-component-confirmation-color-action-critical-hover);
    }

    [part='dialog'][open] [part='surface'] {
      animation: wg-confirmation-enter var(--wg-component-confirmation-motion)
        var(--wg-motion-easing-standard);
    }

    @keyframes wg-confirmation-enter {
      from {
        opacity: 0;
        transform: translateY(var(--wg-component-confirmation-motion-distance));
      }
    }

    @media (max-width: 24rem) {
      [part='actions'] {
        align-items: stretch;
        flex-direction: column;
      }

      [part$='button'] {
        inline-size: 100%;
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
      [part$='button'] {
        border-color: ButtonText;
        color: ButtonText;
        background: Canvas;
        box-shadow: none;
        forced-color-adjust: auto;
      }

      [part='marker'],
      [part='action-button'],
      :host([action-appearance='critical']) [part='action-button'] {
        border-color: ButtonText;
        color: ButtonFace;
        background: ButtonText;
      }
    }
  `;

  declare dialogId: string;
  declare open: boolean;
  declare actionLabel: string;
  declare cancelLabel: string;
  declare actionAppearance: ConfirmationActionAppearance;
  declare attention: ConfirmationAttention;
  declare initialFocus: ConfirmationInitialFocus;

  readonly #instanceId = ++confirmationInstanceSequence;
  readonly #modalController = new NativeModalController(this);
  #closingReason: ConfirmationCloseReason = 'programmatic';
  #closing = false;
  #pendingOptions: ConfirmationShowOptions = {};
  #diagnosticSignature = '';

  constructor() {
    super();
    this.dialogId = '';
    this.open = false;
    this.actionLabel = '';
    this.cancelLabel = '';
    this.actionAppearance = 'primary';
    this.attention = 'ordinary';
    this.initialFocus = 'cancel';
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'action-appearance' && !isConfirmationActionAppearance(value)) {
      if (value !== 'primary') this.setAttribute('action-appearance', 'primary');
      return;
    }
    if (name === 'attention' && !isConfirmationAttention(value)) {
      if (value !== 'ordinary') this.setAttribute('attention', 'ordinary');
      return;
    }
    if (name === 'initial-focus' && !isConfirmationInitialFocus(value)) {
      if (value !== 'cancel') this.setAttribute('initial-focus', 'cancel');
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
    if (!changed.has('open')) return;
    if (this.#closing) return;
    if (this.open && !this.#dialog?.open) this.#requestOpen(this.#pendingOptions);
    if (!this.open && this.#dialog?.open && !this.#closing) this.#closeNative('programmatic');
  }

  protected override render() {
    const headingId = `wg-confirmation-heading-${this.#instanceId}`;
    const descriptionId = `wg-confirmation-description-${this.#instanceId}`;
    return html`<dialog
      part="dialog"
      role=${this.attention === 'interruptive' ? 'alertdialog' : nothing}
      aria-labelledby=${headingId}
      aria-describedby=${descriptionId}
      @cancel=${this.#handleNativeCancel}
      @close=${this.#handleNativeClose}
    >
      <div part="surface">
        <div part="marker" aria-hidden="true"></div>
        <div part="content">
          <span part="icon" aria-hidden="true"><slot name="icon"></slot></span>
          <div
            id=${headingId}
            part="heading"
            tabindex=${this.initialFocus === 'heading' ? '-1' : nothing}
          >
            <slot name="heading" @slotchange=${this.#handleContentChange}></slot>
          </div>
          <div id=${descriptionId} part="description">
            <slot @slotchange=${this.#handleContentChange}></slot>
          </div>
          <div part="actions">
            <button part="cancel-button" type="button" @click=${this.#handleCancelClick}>
              ${this.cancelLabel}
            </button>
            <button part="action-button" type="button" @click=${this.#handleActionClick}>
              ${this.actionLabel}
            </button>
          </div>
        </div>
      </div>
    </dialog>`;
  }

  show(options: ConfirmationShowOptions = {}): boolean {
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

  cancel(): boolean {
    if (!this.#dialog?.open || this.#closing) return false;
    this.#closeNative('cancel');
    return true;
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

  get #cancelButton(): HTMLButtonElement | null {
    return this.renderRoot.querySelector('[part="cancel-button"]');
  }

  get #actionButton(): HTMLButtonElement | null {
    return this.renderRoot.querySelector('[part="action-button"]');
  }

  get #heading(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="heading"]');
  }

  get #initialFocusTarget(): HTMLElement | null {
    if (this.initialFocus === 'heading') return this.#heading ?? this.#cancelButton;
    if (this.initialFocus === 'action') return this.#actionButton ?? this.#cancelButton;
    return this.#cancelButton ?? this.#actionButton;
  }

  #requestOpen(options: ConfirmationShowOptions): boolean {
    const dialog = this.#dialog;
    if (!dialog || !this.isConnected) return this.#rejectOpen('dialog must be connected and ready');
    if (dialog.open) return true;
    const diagnostic = this.#validationDiagnostic();
    if (diagnostic) return this.#rejectOpen(diagnostic);

    this.#pendingOptions = {};
    const openDiagnostic = this.#modalController.open(
      dialog,
      `confirmation:${this.dialogId || '(missing id)'}`,
      options,
    );
    if (openDiagnostic) return this.#rejectOpen(openDiagnostic);

    this.open = true;
    this.#diagnosticSignature = '';
    queueMicrotask(() => this.focus({ preventScroll: true }));
    return true;
  }

  #rejectOpen(message: string): false {
    this.open = false;
    this.#warn(message);
    return false;
  }

  #validationDiagnostic(): string | null {
    if (!(this.dialogId ?? '').trim()) return 'dialog-id is required';
    const duplicates = Array.from(
      this.ownerDocument.querySelectorAll<WgConfirmationDialog>(wgConfirmationDialogTagName),
    ).filter((candidate) => candidate.dialogId === this.dialogId);
    if (duplicates.length > 1) return `dialog-id "${this.dialogId}" must be unique`;
    if (!(this.actionLabel ?? '').trim()) return 'action-label is required';
    if (!(this.cancelLabel ?? '').trim()) return 'cancel-label is required';
    if (!this.#slotText('heading')) return 'visible heading content is required';
    if (!this.#slotText()) return 'visible description content is required';
    const descriptionSlot = this.renderRoot.querySelector<HTMLSlotElement>('slot:not([name])');
    const complexContent = (descriptionSlot?.assignedElements({ flatten: true }) ?? []).some(
      (element) =>
        element.matches('ul, ol, table, form, fieldset, input, select, textarea, button, [role]') ||
        element.querySelector(
          'ul, ol, table, form, fieldset, input, select, textarea, button, [role]',
        ),
    );
    if (complexContent) return 'description must remain short, simple, and noninteractive';
    return null;
  }

  #slotText(name?: string): string {
    const selector = name ? `slot[name="${name}"]` : 'slot:not([name])';
    const slot = this.renderRoot.querySelector<HTMLSlotElement>(selector);
    return (slot?.assignedNodes({ flatten: true }) ?? [])
      .map((node) => node.textContent ?? '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  #closeNative(reason: ConfirmationCloseReason): void {
    const dialog = this.#dialog;
    if (!dialog?.open || this.#closing) return;
    this.#closing = true;
    this.#closingReason = reason;
    dialog.close(reason);
  }

  readonly #handleCancelClick = (): void => {
    this.cancel();
  };

  readonly #handleActionClick = (): void => {
    this.#closeNative('action');
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
      const detail: WgConfirmationCloseDetail = { dialogId: this.dialogId, reason };
      this.dispatchEvent(
        new CustomEvent<WgConfirmationCloseDetail>('wg-confirmation-close', {
          bubbles: true,
          composed: true,
          detail,
        }),
      );
      if (reason === 'action') {
        this.dispatchEvent(
          new CustomEvent<WgConfirmationActionDetail>('wg-confirmation-action', {
            bubbles: true,
            composed: true,
            detail: { dialogId: this.dialogId },
          }),
        );
      }
      this.#closing = false;
      this.#modalController.release();
    });
  };

  readonly #handleContentChange = (): void => {
    if (this.#dialog?.open && this.#validationDiagnostic()) this.#closeNative('programmatic');
  };

  #warn(message: string): void {
    if (message === this.#diagnosticSignature) return;
    console.warn(`[wg-confirmation-dialog] ${message}.`);
    this.#diagnosticSignature = message;
  }
}

export function defineWgConfirmationDialog(registry: CustomElementRegistry = customElements): void {
  defineElement(wgConfirmationDialogTagName, WgConfirmationDialog, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-confirmation-dialog': WgConfirmationDialog;
  }
}
