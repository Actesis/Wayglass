import { css, html, nothing } from 'lit';
import type { PropertyValues } from 'lit';

import { defineWgCommandItem, WgCommandItem, wgCommandItemTagName } from './command-item.js';
import type { WgCommandDetail } from './command-item.js';
import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const menuPlacements = [
  'block-end-start',
  'block-end-end',
  'block-start-start',
  'block-start-end',
] as const;
export type MenuPlacement = (typeof menuPlacements)[number];
export type MenuFocusTarget = 'first' | 'last' | 'none';
export type MenuToggleReason =
  'trigger' | 'keyboard' | 'command' | 'escape' | 'tab' | 'outside' | 'programmatic';

export interface MenuShowOptions {
  readonly focus?: MenuFocusTarget;
}

export interface MenuHideOptions {
  readonly restoreFocus?: boolean;
}

export interface WgMenuToggleDetail {
  readonly open: boolean;
  readonly reason: MenuToggleReason;
}

export const wgMenuTagName = 'wg-menu';

let menuInstanceSequence = 0;

export function isMenuPlacement(value: unknown): value is MenuPlacement {
  return typeof value === 'string' && menuPlacements.some((placement) => placement === value);
}

export class WgMenu extends WayglassElement {
  static override properties = {
    label: { type: String },
    disabled: { type: Boolean, reflect: true },
    placement: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-menu-color-trigger-background: var(--wg-component-menu-color-trigger-background);
      --wg-menu-color-trigger-background-hover: var(
        --wg-component-menu-color-trigger-background-hover
      );
      --wg-menu-color-popup-background: var(--wg-component-menu-color-popup-background);
      --wg-menu-color-border: var(--wg-component-menu-color-border);
      --wg-menu-color-text: var(--wg-component-menu-color-text);
      --wg-menu-color-detail: var(--wg-component-menu-color-detail);
      --wg-menu-item-color-background-hover: var(--wg-component-menu-color-item-background-hover);
      --wg-menu-trigger-radius: var(--wg-component-menu-radius-trigger);
      --wg-menu-popup-radius: var(--wg-component-menu-radius-popup);
      --wg-menu-space: var(--wg-component-menu-space);
      --wg-menu-item-size-minimum: var(--wg-component-menu-size-item-minimum);
      display: inline-block;
      max-inline-size: 100%;
      color: var(--wg-menu-color-text);
      font-family: var(--wg-typography-family-body);
      vertical-align: middle;
    }

    [part='trigger'] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-inline-size: var(--wg-component-menu-size-trigger-minimum);
      min-block-size: var(--wg-component-menu-size-trigger-minimum);
      box-sizing: border-box;
      gap: var(--wg-menu-space);
      padding: var(--wg-menu-space);
      border: var(--wg-border-width-standard) solid var(--wg-menu-color-border);
      border-radius: var(--wg-menu-trigger-radius);
      color: var(--wg-menu-color-text);
      background: var(--wg-menu-color-trigger-background);
      font: inherit;
      font-weight: var(--wg-typography-weight-medium);
      cursor: pointer;
    }

    [part='trigger']:hover:not(:disabled) {
      background: var(--wg-menu-color-trigger-background-hover);
    }

    [part='trigger']:focus-visible {
      outline: var(--wg-focus-width) solid var(--wg-color-semantic-focus-ring);
      outline-offset: var(--wg-focus-offset);
    }

    [part='trigger']:disabled {
      cursor: not-allowed;
      opacity: var(--wg-opacity-disabled);
    }

    [part='indicator'] {
      inline-size: 0.45em;
      block-size: 0.45em;
      border-inline-end: var(--wg-border-width-strong) solid currentColor;
      border-block-end: var(--wg-border-width-strong) solid currentColor;
      transform: translateY(-0.12em) rotate(45deg);
    }

    [part~='popup'] {
      position: fixed;
      inset: auto;
      min-inline-size: min(
        var(--wg-component-menu-size-inline-minimum),
        calc(100vw - 2 * var(--wg-component-menu-space-viewport))
      );
      max-inline-size: min(
        var(--wg-component-menu-size-inline-maximum),
        calc(100vw - 2 * var(--wg-component-menu-space-viewport))
      );
      max-block-size: min(
        var(--wg-component-menu-size-block-maximum),
        calc(100dvh - 2 * var(--wg-component-menu-space-viewport))
      );
      box-sizing: border-box;
      margin: 0;
      padding: var(--wg-component-menu-space-popup);
      overflow: auto;
      overscroll-behavior: contain;
      row-gap: var(--wg-component-menu-space-offset);
      scroll-padding: var(--wg-component-menu-space-viewport);
      border: var(--wg-border-width-strong) solid var(--wg-menu-color-border);
      border-radius: var(--wg-menu-popup-radius);
      color: var(--wg-menu-color-text);
      background: var(--wg-menu-color-popup-background);
      box-shadow: var(--wg-component-menu-elevation);
      z-index: var(--wg-z-index-overlay);
    }

    [part~='popup'][hidden] {
      display: none;
    }

    ::slotted(wg-divider) {
      margin-block: var(--wg-component-menu-space-popup);
    }

    @supports (anchor-name: --wg-menu-anchor) and (position-area: block-end) {
      [part='trigger'] {
        anchor-name: --wg-menu-anchor;
      }

      [part~='popup']:not([data-js-positioned]) {
        position-anchor: --wg-menu-anchor;
        position-try-fallbacks:
          flip-block,
          flip-inline,
          flip-block flip-inline;
      }

      :host([placement='block-end-start']) [part~='popup']:not([data-js-positioned]) {
        position-area: block-end span-inline-end;
        margin-block-start: var(--wg-component-menu-space-offset);
      }

      :host([placement='block-end-end']) [part~='popup']:not([data-js-positioned]) {
        position-area: block-end span-inline-start;
        margin-block-start: var(--wg-component-menu-space-offset);
      }

      :host([placement='block-start-start']) [part~='popup']:not([data-js-positioned]) {
        position-area: block-start span-inline-end;
        margin-block-end: var(--wg-component-menu-space-offset);
      }

      :host([placement='block-start-end']) [part~='popup']:not([data-js-positioned]) {
        position-area: block-start span-inline-start;
        margin-block-end: var(--wg-component-menu-space-offset);
      }
    }

    @media (forced-colors: active) {
      [part='trigger'],
      [part~='popup'] {
        border-color: ButtonText;
        color: ButtonText;
        background: ButtonFace;
        box-shadow: none;
        forced-color-adjust: auto;
      }
    }
  `;

  declare label: string;
  declare disabled: boolean;
  declare placement: MenuPlacement;

  readonly #instanceId = ++menuInstanceSequence;
  #isOpen = false;
  #pendingFocus: MenuFocusTarget = 'none';
  #pendingReason: MenuToggleReason = 'programmatic';
  #restoreFocus = false;
  #observer: MutationObserver | undefined;
  #resizeObserver: ResizeObserver | undefined;
  #typeahead = '';
  #typeaheadTimer: number | undefined;
  #diagnosticSignature = '';
  #lastFocusedItem: WgCommandItem | undefined;
  #lastFocusedIndex = -1;

  constructor() {
    super();
    this.label = '';
    this.disabled = false;
    this.placement = 'block-end-end';
  }

  get open(): boolean {
    return this.#isOpen;
  }

  override attributeChangedCallback(name: string, oldValue: string | null, value: string | null) {
    if (name === 'placement' && !isMenuPlacement(value)) {
      if (value !== 'block-end-end') this.setAttribute('placement', 'block-end-end');
      return;
    }
    super.attributeChangedCallback(name, oldValue, value);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this.#handleKeydown);
    this.addEventListener('focusin', this.#handleFocusIn);
    this.addEventListener('wg-command', this.#handleCommand as EventListener);
    this.#observer = new MutationObserver(this.#handleMutations);
    this.#observer.observe(this, {
      attributes: true,
      attributeFilter: ['disabled', 'hidden', 'value'],
      childList: true,
      characterData: true,
      subtree: true,
    });
    queueMicrotask(() => this.#synchronize());
  }

  override disconnectedCallback(): void {
    this.removeEventListener('keydown', this.#handleKeydown);
    this.removeEventListener('focusin', this.#handleFocusIn);
    this.removeEventListener('wg-command', this.#handleCommand as EventListener);
    this.#observer?.disconnect();
    this.#observer = undefined;
    this.#stopOpenObservers();
    if (this.#typeaheadTimer !== undefined) window.clearTimeout(this.#typeaheadTimer);
    super.disconnectedCallback();
  }

  override focus(options?: FocusOptions): void {
    this.#trigger?.focus(options);
  }

  protected override firstUpdated(): void {
    if (!this.#supportsPopoverMarkup()) this.#popup?.removeAttribute('popover');
    this.#synchronize();
  }

  async show(options: MenuShowOptions = {}): Promise<void> {
    if (this.disabled || this.#isOpen) return;
    await this.updateComplete;
    const items = this.#items();
    this.#reportDiagnostics();
    if (items.length === 0) return;

    this.#pendingFocus = options.focus ?? 'none';
    this.#pendingReason = 'programmatic';
    this.#restoreFocus = false;
    const popup = this.#popup;
    if (!popup) return;

    if (this.#supportsPopover(popup)) {
      popup.showPopover();
      this.#setOpen(true);
    } else {
      popup.hidden = false;
      this.#setOpen(true);
    }
  }

  hide(options: MenuHideOptions = {}): void {
    this.#hide('programmatic', options.restoreFocus ?? false);
  }

  toggle(options: MenuShowOptions = {}): void {
    if (this.#isOpen) this.#hide('programmatic', false);
    else void this.show(options);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('disabled') && this.disabled && this.#isOpen) {
      this.#hide('programmatic', true);
    }
    this.#synchronize();
  }

  protected override render() {
    const popupId = `wg-menu-popup-${this.#instanceId}`;
    return html`<button
        part="trigger"
        type="button"
        aria-label=${this.label || nothing}
        aria-haspopup="menu"
        aria-expanded=${String(this.#isOpen)}
        aria-controls=${popupId}
        ?disabled=${this.disabled}
        @click=${this.#handleTriggerClick}
        @keydown=${this.#handleTriggerKeydown}
      >
        <span part="trigger-content"><slot name="trigger"></slot></span>
        <span part="indicator" aria-hidden="true"></span>
      </button>
      <div
        id=${popupId}
        part="popup menu"
        role="menu"
        popover="auto"
        ?hidden=${!this.#supportsPopoverMarkup() && !this.#isOpen}
        @toggle=${this.#handleToggle}
      >
        <slot @slotchange=${this.#handleSlotChange}></slot>
      </div>`;
  }

  get #trigger(): HTMLButtonElement | null {
    return this.renderRoot.querySelector('[part="trigger"]');
  }

  get #popup(): HTMLElement | null {
    return this.renderRoot.querySelector('[part~="popup"]');
  }

  #items(): WgCommandItem[] {
    return Array.from(this.children).filter(
      (child): child is WgCommandItem =>
        child instanceof WgCommandItem && !child.hidden && child.value.trim().length > 0,
    );
  }

  #synchronize(): void {
    const items = this.#items();
    for (const item of items) item.tabIndex = -1;
    this.#reportDiagnostics();
    if (this.#isOpen && items.length === 0) this.#hide('programmatic', true);
    if (this.#isOpen) this.#positionFallback();
  }

  #reportDiagnostics(): void {
    const diagnostics: string[] = [];
    const triggerSlot = this.renderRoot.querySelector<HTMLSlotElement>('slot[name="trigger"]');
    const triggerText = (triggerSlot?.assignedNodes({ flatten: true }) ?? [])
      .map((node) => node.textContent ?? '')
      .join(' ')
      .trim();
    if (!this.label.trim() && !triggerText) diagnostics.push('Menu trigger requires a name.');

    const commands = Array.from(this.children).filter(
      (child): child is WgCommandItem => child instanceof WgCommandItem,
    );
    if (commands.length === 0) diagnostics.push('Menu requires at least one direct command item.');
    for (const command of commands) {
      if (!command.value.trim()) diagnostics.push('Command items require a non-empty value.');
      if (!command.labelText()) diagnostics.push('Command items require a visible label.');
    }
    for (const child of Array.from(this.children)) {
      if (
        child.slot === 'trigger' ||
        child instanceof WgCommandItem ||
        child.localName === 'wg-divider'
      )
        continue;
      diagnostics.push(`Unsupported direct child <${child.localName}>.`);
    }

    const signature = [...new Set(diagnostics)].sort().join('\n');
    if (signature && signature !== this.#diagnosticSignature) {
      console.warn(`[${wgMenuTagName}] Invalid authoring:\n${signature}`);
    }
    this.#diagnosticSignature = signature;
  }

  readonly #handleTriggerClick = (event: MouseEvent): void => {
    if (this.#isOpen) this.#hide('trigger', true);
    else this.#openFromUser(event.detail === 0 ? 'keyboard' : 'trigger', 'first');
  };

  readonly #handleTriggerKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    this.#openFromUser('keyboard', event.key === 'ArrowUp' ? 'last' : 'first');
  };

  #openFromUser(reason: MenuToggleReason, focus: MenuFocusTarget): void {
    if (this.disabled || this.#isOpen) return;
    this.#pendingReason = reason;
    this.#pendingFocus = focus;
    this.#restoreFocus = false;
    const popup = this.#popup;
    if (!popup || this.#items().length === 0) {
      this.#reportDiagnostics();
      return;
    }
    if (this.#supportsPopover(popup)) {
      popup.showPopover();
      this.#setOpen(true);
    } else {
      popup.hidden = false;
      this.#setOpen(true);
    }
  }

  readonly #handleKeydown = (event: KeyboardEvent): void => {
    const item = event
      .composedPath()
      .find((target): target is WgCommandItem => target instanceof WgCommandItem);
    if (!item || item.parentElement !== this || !this.#isOpen) return;

    const items = this.#items();
    const index = items.indexOf(item);
    if (index < 0) return;
    let next: WgCommandItem | undefined;

    if (event.key === 'ArrowDown') next = items[(index + 1) % items.length];
    else if (event.key === 'ArrowUp') next = items[(index - 1 + items.length) % items.length];
    else if (event.key === 'Home') next = items[0];
    else if (event.key === 'End') next = items.at(-1);
    else if (event.key === 'Escape') {
      event.preventDefault();
      this.#hide('escape', true);
      return;
    } else if (event.key === 'Tab') {
      event.preventDefault();
      const backwards = event.shiftKey;
      this.#hide('tab', false);
      if (backwards) this.#trigger?.focus();
      else queueMicrotask(() => this.#focusNextOutside());
      return;
    } else if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey &&
      !event.isComposing
    ) {
      this.#typeahead += event.key.toLocaleLowerCase();
      if (this.#typeaheadTimer !== undefined) window.clearTimeout(this.#typeaheadTimer);
      this.#typeaheadTimer = window.setTimeout(() => (this.#typeahead = ''), 500);
      const search = /^(.)\1+$/.test(this.#typeahead)
        ? (this.#typeahead[0] ?? '')
        : this.#typeahead;
      next = [...items.slice(index + 1), ...items.slice(0, index + 1)].find((candidate) =>
        candidate.labelText().toLocaleLowerCase().startsWith(search),
      );
    }

    if (next) {
      event.preventDefault();
      next.focus();
    }
  };

  readonly #handleCommand = (event: CustomEvent<WgCommandDetail>): void => {
    const item = event
      .composedPath()
      .find((target): target is WgCommandItem => target instanceof WgCommandItem);
    if (!item || item.parentElement !== this || !this.#isOpen) return;
    this.#hide('command', true);
  };

  readonly #handleToggle = (event: Event): void => {
    const toggle = event as ToggleEvent;
    const popup = this.#popup;
    const isOpen =
      popup && this.#supportsPopover(popup)
        ? popup.matches(':popover-open')
        : toggle.newState === 'open';
    this.#setOpen(isOpen);
  };

  readonly #handleSlotChange = (): void => this.#synchronize();

  readonly #handleFocusIn = (event: FocusEvent): void => {
    const item = event
      .composedPath()
      .find((target): target is WgCommandItem => target instanceof WgCommandItem);
    if (item?.parentElement === this) {
      this.#lastFocusedItem = item;
      this.#lastFocusedIndex = this.#items().indexOf(item);
    }
  };

  readonly #handleMutations = (records: readonly MutationRecord[]): void => {
    const focused = this.#lastFocusedItem;
    this.#synchronize();
    if (this.#isOpen && focused && !focused.isConnected) {
      const items = this.#items();
      (
        items[Math.min(Math.max(this.#lastFocusedIndex, 0), items.length - 1)] ?? items.at(-1)
      )?.focus();
    }
    if (records.some((record) => record.type === 'characterData')) this.#typeahead = '';
  };

  #setOpen(open: boolean): void {
    if (this.#isOpen === open) return;
    this.#isOpen = open;
    this.toggleAttribute('open', open);
    this.requestUpdate();

    if (open) {
      this.#startOpenObservers();
      this.#positionFallback();
      const items = this.#items();
      const target = this.#pendingFocus === 'last' ? items.at(-1) : items[0];
      if (this.#pendingFocus !== 'none') queueMicrotask(() => target?.focus());
    } else {
      this.#stopOpenObservers();
      this.#popup?.removeAttribute('data-js-positioned');
      this.#popup?.style.removeProperty('inset-inline-start');
      this.#popup?.style.removeProperty('inset-block-start');
      if (this.#restoreFocus && this.#trigger?.isConnected && !this.disabled) {
        queueMicrotask(() => this.#trigger?.focus());
      }
    }

    this.dispatchEvent(
      new CustomEvent<WgMenuToggleDetail>('wg-menu-toggle', {
        bubbles: true,
        composed: true,
        detail: { open, reason: this.#pendingReason },
      }),
    );
    this.#pendingFocus = 'none';
    this.#restoreFocus = false;
  }

  #hide(reason: MenuToggleReason, restoreFocus: boolean): void {
    if (!this.#isOpen) return;
    this.#pendingReason = reason;
    this.#restoreFocus = restoreFocus;
    const popup = this.#popup;
    if (!popup) return;
    if (this.#supportsPopover(popup)) popup.hidePopover();
    else {
      popup.hidden = true;
    }
    this.#setOpen(false);
  }

  #supportsPopover(popup: HTMLElement): popup is HTMLElement & {
    showPopover(): void;
    hidePopover(): void;
    matches(selectors: ':popover-open'): boolean;
  } {
    return typeof popup.showPopover === 'function' && typeof popup.hidePopover === 'function';
  }

  #supportsPopoverMarkup(): boolean {
    return typeof HTMLElement.prototype.showPopover === 'function';
  }

  #supportsAnchorPositioning(): boolean {
    return (
      typeof CSS !== 'undefined' &&
      CSS.supports('anchor-name: --wg-menu-anchor') &&
      CSS.supports('position-area: block-end') &&
      CSS.supports('position-try-fallbacks: flip-block')
    );
  }

  #startOpenObservers(): void {
    document.addEventListener('pointerdown', this.#handleDocumentPointerDown, true);
    window.addEventListener('resize', this.#positionFallback, { passive: true });
    window.addEventListener('scroll', this.#positionFallback, { capture: true, passive: true });
    window.visualViewport?.addEventListener('resize', this.#positionFallback, { passive: true });
    window.visualViewport?.addEventListener('scroll', this.#positionFallback, { passive: true });
    this.#resizeObserver = new ResizeObserver(this.#positionFallback);
    if (this.#trigger) this.#resizeObserver.observe(this.#trigger);
    if (this.#popup) this.#resizeObserver.observe(this.#popup);
  }

  #stopOpenObservers(): void {
    document.removeEventListener('pointerdown', this.#handleDocumentPointerDown, true);
    window.removeEventListener('resize', this.#positionFallback);
    window.removeEventListener('scroll', this.#positionFallback, true);
    window.visualViewport?.removeEventListener('resize', this.#positionFallback);
    window.visualViewport?.removeEventListener('scroll', this.#positionFallback);
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = undefined;
  }

  readonly #handleDocumentPointerDown = (event: PointerEvent): void => {
    if (!event.composedPath().includes(this)) {
      this.#pendingReason = 'outside';
      this.#restoreFocus = false;
      if (!this.#supportsPopoverMarkup()) this.#hide('outside', false);
    }
  };

  #focusNextOutside(): void {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'summary',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    const elements = Array.from(document.querySelectorAll<HTMLElement>('*'));
    const hostIndex = elements.indexOf(this);

    for (const candidate of elements.slice(hostIndex + 1)) {
      if (this.contains(candidate) || candidate.hidden || candidate.closest('[hidden]')) continue;
      const target = candidate.matches(selector)
        ? candidate
        : candidate.shadowRoot?.querySelector<HTMLElement>(selector);
      if (!target || getComputedStyle(target).visibility === 'hidden') continue;
      target.focus();
      if (document.activeElement === candidate || candidate.shadowRoot?.activeElement === target) {
        return;
      }
    }

    document.body.focus();
  }

  readonly #positionFallback = (): void => {
    const trigger = this.#trigger;
    const popup = this.#popup;
    if (!this.#isOpen || !trigger || !popup || this.#supportsAnchorPositioning()) return;

    popup.setAttribute('data-js-positioned', '');
    const triggerRect = trigger.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const style = getComputedStyle(this);
    const vertical = style.writingMode.startsWith('vertical');
    const rtl = style.direction === 'rtl';
    const blockEnd = vertical
      ? { x: style.writingMode === 'vertical-rl' ? -1 : 1, y: 0 }
      : { x: 0, y: 1 };
    const inlineEnd = vertical ? { x: 0, y: rtl ? -1 : 1 } : { x: rtl ? -1 : 1, y: 0 };
    const preferredBlockEnd = this.placement.startsWith('block-end');
    const preferredInlineStart = this.placement.endsWith('start');
    const viewport = window.visualViewport;
    const viewportLeft = viewport?.offsetLeft ?? 0;
    const viewportTop = viewport?.offsetTop ?? 0;
    const viewportRight = viewportLeft + (viewport?.width ?? window.innerWidth);
    const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
    const popupStyle = getComputedStyle(popup);
    const offset = Number.parseFloat(popupStyle.rowGap) || 0;
    const inset = Number.parseFloat(popupStyle.scrollPaddingTop) || 0;

    const coordinate = (blockAtEnd: boolean, alignStart: boolean) => {
      let x = triggerRect.left;
      let y = triggerRect.top;
      const blockVector = blockAtEnd ? blockEnd : { x: -blockEnd.x, y: -blockEnd.y };
      if (blockVector.y > 0) y = triggerRect.bottom + offset;
      else if (blockVector.y < 0) y = triggerRect.top - popupRect.height - offset;
      else if (blockVector.x > 0) x = triggerRect.right + offset;
      else x = triggerRect.left - popupRect.width - offset;

      if (vertical) {
        const start = inlineEnd.y > 0 ? triggerRect.top : triggerRect.bottom;
        y = alignStart
          ? inlineEnd.y > 0
            ? start
            : start - popupRect.height
          : inlineEnd.y > 0
            ? triggerRect.bottom - popupRect.height
            : triggerRect.top;
      } else {
        const start = inlineEnd.x > 0 ? triggerRect.left : triggerRect.right;
        x = alignStart
          ? inlineEnd.x > 0
            ? start
            : start - popupRect.width
          : inlineEnd.x > 0
            ? triggerRect.right - popupRect.width
            : triggerRect.left;
      }
      return { x, y };
    };

    const overflow = ({ x, y }: { x: number; y: number }) =>
      Math.max(0, viewportLeft + inset - x) +
      Math.max(0, x + popupRect.width - (viewportRight - inset)) +
      Math.max(0, viewportTop + inset - y) +
      Math.max(0, y + popupRect.height - (viewportBottom - inset));
    const candidates = [
      coordinate(preferredBlockEnd, preferredInlineStart),
      coordinate(!preferredBlockEnd, preferredInlineStart),
      coordinate(preferredBlockEnd, !preferredInlineStart),
      coordinate(!preferredBlockEnd, !preferredInlineStart),
    ];
    const best = candidates.reduce((current, candidate) =>
      overflow(candidate) < overflow(current) ? candidate : current,
    );
    popup.style.insetInlineStart = `${Math.min(Math.max(best.x, viewportLeft + inset), viewportRight - inset - popupRect.width)}px`;
    popup.style.insetBlockStart = `${Math.min(Math.max(best.y, viewportTop + inset), viewportBottom - inset - popupRect.height)}px`;
  };
}

export function defineWgMenu(registry: CustomElementRegistry = customElements): void {
  defineWgCommandItem(registry);
  defineElement(wgMenuTagName, WgMenu, registry);
}

export { WgCommandItem, wgCommandItemTagName };
export type { WgCommandDetail };

declare global {
  interface HTMLElementTagNameMap {
    'wg-menu': WgMenu;
  }
}
