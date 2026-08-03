export interface NativeModalOpenOptions {
  readonly invoker?: HTMLElement;
  readonly fallbackFocus?: HTMLElement;
}

interface ActiveModal {
  readonly owner: HTMLElement;
  readonly label: string;
}

const activeModals = new WeakMap<Document, ActiveModal>();

export function deepActiveElement(root: Document | ShadowRoot): HTMLElement | null {
  let active: Element | null = root.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active instanceof HTMLElement ? active : null;
}

export function isUsableFocusTarget(value: HTMLElement | null): value is HTMLElement {
  return Boolean(
    value?.isConnected &&
    !value.matches(':disabled, [aria-disabled="true"], [hidden], [inert]') &&
    value.getClientRects().length > 0,
  );
}

export function isSequentialFocusTarget(value: HTMLElement): boolean {
  return isUsableFocusTarget(value) && value.tabIndex >= 0;
}

export class NativeModalController {
  readonly #owner: HTMLElement;
  #invoker: HTMLElement | null = null;
  #fallbackFocus: HTMLElement | null = null;
  #claimed = false;

  constructor(owner: HTMLElement) {
    this.#owner = owner;
  }

  open(
    dialog: HTMLDialogElement,
    label: string,
    options: NativeModalOpenOptions = {},
  ): string | null {
    if (this.#claimed && dialog.open) return null;

    const documentOwner = this.#owner.ownerDocument;
    const active = activeModals.get(documentOwner);
    if (active && active.owner !== this.#owner) {
      return `cannot open while Wayglass modal "${active.label}" is active`;
    }
    if (documentOwner.querySelector('dialog:modal')) {
      return 'cannot open while another native modal dialog is active';
    }

    this.#invoker = options.invoker ?? deepActiveElement(documentOwner);
    this.#fallbackFocus = options.fallbackFocus ?? null;
    activeModals.set(documentOwner, { owner: this.#owner, label });
    this.#claimed = true;

    try {
      dialog.showModal();
      return null;
    } catch {
      this.release();
      return 'native showModal() rejected the invocation';
    }
  }

  restoreFocus(warn: (message: string) => void): void {
    if (isUsableFocusTarget(this.#invoker)) {
      this.#invoker.focus({ preventScroll: true });
      return;
    }
    if (isUsableFocusTarget(this.#fallbackFocus)) {
      this.#fallbackFocus.focus({ preventScroll: true });
      return;
    }
    warn('closed without a usable invoker or fallback focus target');
  }

  release(): void {
    const documentOwner = this.#owner.ownerDocument;
    if (activeModals.get(documentOwner)?.owner === this.#owner) activeModals.delete(documentOwner);
    this.#invoker = null;
    this.#fallbackFocus = null;
    this.#claimed = false;
  }
}
