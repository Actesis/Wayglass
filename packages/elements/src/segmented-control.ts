import { css, html } from 'lit';
import type { PropertyValues } from 'lit';

import { defineElement } from './registration.js';
import { defineWgSegment, WgSegment } from './segment.js';

export { defineWgSegment, WgSegment, wgSegmentTagName } from './segment.js';
import { WayglassElement } from './wayglass-element.js';

export const segmentedOrientations = ['horizontal', 'vertical'] as const;
export type SegmentedOrientation = (typeof segmentedOrientations)[number];
export type SegmentChangeTrigger = 'keyboard' | 'pointer';
export interface WgSegmentChangeDetail {
  readonly value: string;
  readonly previousValue: string;
  readonly trigger: SegmentChangeTrigger;
}
export const wgSegmentedControlTagName = 'wg-segmented-control';

export function isSegmentedOrientation(value: unknown): value is SegmentedOrientation {
  return (
    typeof value === 'string' && segmentedOrientations.some((orientation) => orientation === value)
  );
}

export class WgSegmentedControl extends WayglassElement {
  static override properties = {
    value: { type: String, reflect: true },
    orientation: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-segmented-color-background: var(--wg-component-segmented-color-background);
      --wg-segmented-color-border: var(--wg-component-segmented-color-border);
      --wg-segmented-color-selected: var(--wg-component-segmented-color-selected);
      --wg-segmented-color-text: var(--wg-component-segmented-color-text);
      --wg-segmented-radius: var(--wg-component-segmented-radius);
      --wg-segmented-space: var(--wg-component-segmented-space);
      --wg-segmented-size-minimum: var(--wg-component-segmented-size-minimum);
      display: block;
      min-inline-size: 0;
    }
    [part='group'] {
      display: flex;
      min-inline-size: 0;
      gap: var(--wg-border-width-standard);
      padding: var(--wg-border-width-standard);
      border-radius: var(--wg-segmented-radius);
      background: var(--wg-segmented-color-background);
      overflow-x: auto;
    }
    :host([orientation='vertical']) [part='group'] {
      flex-direction: column;
      overflow-x: visible;
    }
  `;

  declare value: string;
  declare orientation: SegmentedOrientation;
  #observer?: MutationObserver;
  #selectedIndex = -1;
  #lastFocusedSegment: WgSegment | undefined;

  constructor() {
    super();
    this.value = '';
    this.orientation = 'horizontal';
  }

  override attributeChangedCallback(name: string, oldValue: string | null, value: string | null) {
    if (name === 'orientation' && !isSegmentedOrientation(value)) {
      if (value !== 'horizontal') this.setAttribute('orientation', 'horizontal');
      return;
    }
    super.attributeChangedCallback(name, oldValue, value);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    defineWgSegment(this.ownerDocument.defaultView?.customElements ?? customElements);
    this.setAttribute('role', 'radiogroup');
    this.addEventListener('click', this.#handleClick);
    this.addEventListener('keydown', this.#handleKeydown);
    this.addEventListener('focusin', this.#handleFocusIn);
    this.addEventListener('focusout', this.#handleFocusOut);
    this.#observer = new MutationObserver((records) => {
      const focused = this.#lastFocusedSegment;
      const restoreFocus =
        focused !== undefined &&
        (focused.disabled ||
          records.some((record) =>
            Array.from(record.removedNodes).some(
              (node) => node === focused || (node instanceof Element && node.contains(focused)),
            ),
          ));
      this.#synchronize(restoreFocus);
    });
    this.#observer.observe(this, {
      childList: true,
      attributes: true,
      attributeFilter: ['disabled', 'value'],
      subtree: true,
    });
    queueMicrotask(() => this.#synchronize());
  }

  override disconnectedCallback(): void {
    this.removeEventListener('click', this.#handleClick);
    this.removeEventListener('keydown', this.#handleKeydown);
    this.removeEventListener('focusin', this.#handleFocusIn);
    this.removeEventListener('focusout', this.#handleFocusOut);
    this.#observer?.disconnect();
    super.disconnectedCallback();
  }

  focusSelected(options?: FocusOptions): void {
    this.#segments()
      .find((segment) => segment.value === this.value)
      ?.focus(options);
  }

  protected override updated(changes: PropertyValues<this>): void {
    if (changes.has('value') || changes.has('orientation')) this.#synchronize();
  }

  protected override render() {
    return html`<div part="group"><slot @slotchange=${this.#handleSlotChange}></slot></div>`;
  }

  readonly #handleSlotChange = (): void => this.#synchronize();

  readonly #synchronize = (restoreFocus = false): void => {
    const allSegments = this.#segments();
    const segments = this.#validSegments();
    const enabled = segments.filter((segment) => !segment.disabled);
    let selected = enabled.find((segment) => segment.value === this.value);
    if (!selected) {
      const authoredSelection = allSegments.find((segment) => segment.value === this.value);
      const fallbackStart = authoredSelection
        ? allSegments.indexOf(authoredSelection) + 1
        : this.#selectedIndex;
      selected =
        enabled.find((segment) => allSegments.indexOf(segment) >= fallbackStart) ??
        enabled.findLast((segment) => allSegments.indexOf(segment) < fallbackStart) ??
        enabled[0];
    }
    const nextValue = selected?.value ?? '';
    if (this.value !== nextValue) this.value = nextValue;
    this.#selectedIndex = selected ? allSegments.indexOf(selected) : -1;

    for (const segment of this.#segments()) {
      const valid = segments.includes(segment);
      const checked = valid && segment === selected;
      segment.setAttribute('aria-checked', String(checked));
      segment.setAttribute('aria-disabled', String(segment.disabled || !valid));
      segment.tabIndex = checked ? 0 : -1;
    }

    if (restoreFocus) selected?.focus();
  };

  readonly #handleFocusIn = (event: FocusEvent): void => {
    const segment = event
      .composedPath()
      .find((target): target is WgSegment => target instanceof WgSegment);
    if (segment?.parentElement === this) this.#lastFocusedSegment = segment;
  };

  readonly #handleFocusOut = (event: FocusEvent): void => {
    if (event.relatedTarget instanceof Node && !this.contains(event.relatedTarget)) {
      this.#lastFocusedSegment = undefined;
    }
  };

  readonly #handleClick = (event: MouseEvent): void => {
    const segment = this.#eventSegment(event);
    if (segment && this.#validSegments().includes(segment) && !segment.disabled) {
      segment.focus();
      this.#select(segment, 'pointer');
    }
  };

  readonly #handleKeydown = (event: KeyboardEvent): void => {
    const segment = this.#eventSegment(event);
    const enabled = this.#validSegments().filter((candidate) => !candidate.disabled);
    const index = segment ? enabled.indexOf(segment) : -1;
    if (index < 0) return;

    let next: number | undefined;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = enabled.length - 1;
    else if (event.key === 'ArrowDown') next = (index + 1) % enabled.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + enabled.length) % enabled.length;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const rtl = getComputedStyle(this).direction === 'rtl';
      const forward = event.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
      next = (index + (forward ? 1 : -1) + enabled.length) % enabled.length;
    } else if (event.key === ' ') next = index;

    const candidate = next === undefined ? undefined : enabled[next];
    if (candidate) {
      event.preventDefault();
      candidate.focus();
      this.#select(candidate, 'keyboard');
    }
  };

  #select(segment: WgSegment, trigger: SegmentChangeTrigger): void {
    const previousValue = this.value;
    if (segment.value === previousValue) return;
    this.value = segment.value;
    this.#synchronize();
    this.dispatchEvent(
      new CustomEvent<WgSegmentChangeDetail>('wg-segment-change', {
        bubbles: true,
        composed: true,
        detail: { value: this.value, previousValue, trigger },
      }),
    );
  }

  #segments(): WgSegment[] {
    return Array.from(this.children).filter(
      (element): element is WgSegment => element instanceof WgSegment,
    );
  }

  #validSegments(): WgSegment[] {
    const counts = new Map<string, number>();
    for (const segment of this.#segments()) {
      const value = segment.value.trim();
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return this.#segments().filter((segment) => {
      const value = segment.value.trim();
      return value.length > 0 && counts.get(value) === 1;
    });
  }

  #eventSegment(event: Event): WgSegment | undefined {
    return event
      .composedPath()
      .find(
        (target): target is WgSegment =>
          target instanceof WgSegment && target.parentElement === this,
      );
  }
}

export function defineWgSegmentedControl(registry: CustomElementRegistry = customElements): void {
  defineWgSegment(registry);
  defineElement(wgSegmentedControlTagName, WgSegmentedControl, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-segmented-control': WgSegmentedControl;
  }
}
