import { css, html } from 'lit';
import type { PropertyValues } from 'lit';

import { defineElement } from './registration.js';
import { defineWgTab, WgTab, wgTabTagName } from './tab.js';
import { defineWgTabList, WgTabList, wgTabListTagName } from './tab-list.js';
import { defineWgTabPanel, WgTabPanel, wgTabPanelTagName } from './tab-panel.js';
import { WayglassElement } from './wayglass-element.js';

export const tabActivations = ['automatic', 'manual'] as const;
export const tabOrientations = ['horizontal', 'vertical'] as const;
export type TabActivation = (typeof tabActivations)[number];
export type TabOrientation = (typeof tabOrientations)[number];
export type TabChangeTrigger = 'keyboard' | 'pointer';

export interface WgTabChangeDetail {
  readonly value: string;
  readonly previousValue: string;
  readonly trigger: TabChangeTrigger;
}

interface TabPair {
  readonly tab: WgTab;
  readonly panel: WgTabPanel;
  readonly value: string;
  readonly sourceIndex: number;
}

interface SynchronizeOptions {
  readonly restoreFocus?: boolean;
}

export const wgTabsTagName = 'wg-tabs';

let tabsInstanceSequence = 0;

export function isTabActivation(value: unknown): value is TabActivation {
  return typeof value === 'string' && tabActivations.some((activation) => activation === value);
}

export function isTabOrientation(value: unknown): value is TabOrientation {
  return typeof value === 'string' && tabOrientations.some((orientation) => orientation === value);
}

export class WgTabs extends WayglassElement {
  static override properties = {
    value: {
      type: String,
      reflect: true,
    },
    activation: {
      type: String,
      reflect: true,
      noAccessor: true,
    },
    orientation: {
      type: String,
      reflect: true,
      noAccessor: true,
    },
  };

  static override styles = css`
    :host {
      display: block;
      min-inline-size: 0;
    }
  `;

  declare value: string;

  #activation: TabActivation = 'automatic';
  #orientation: TabOrientation = 'horizontal';
  readonly #instanceId = ++tabsInstanceSequence;
  #selectedIndex = -1;
  #selectedValue = '';
  #diagnosticSignature = '';
  #lastFocusedElement: HTMLElement | undefined;
  #synchronizing = false;
  #observer: MutationObserver | undefined;

  constructor() {
    super();
    this.value = '';
  }

  get activation(): TabActivation {
    return this.#activation;
  }

  set activation(value: TabActivation) {
    const previous = this.#activation;
    this.#activation = isTabActivation(value) ? value : 'automatic';
    this.requestUpdate('activation', previous);
  }

  get orientation(): TabOrientation {
    return this.#orientation;
  }

  set orientation(value: TabOrientation) {
    const previous = this.#orientation;
    this.#orientation = isTabOrientation(value) ? value : 'horizontal';
    this.requestUpdate('orientation', previous);
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'activation' && !isTabActivation(value)) {
      if (value !== 'automatic') {
        this.setAttribute('activation', 'automatic');
      }
      return;
    }

    if (name === 'orientation' && !isTabOrientation(value)) {
      if (value !== 'horizontal') {
        this.setAttribute('orientation', 'horizontal');
      }
      return;
    }

    super.attributeChangedCallback(name, previous, value);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.#handleClick);
    this.addEventListener('keydown', this.#handleKeydown);
    this.addEventListener('focusin', this.#handleFocusIn);
    this.addEventListener('focusout', this.#handleFocusOut);

    this.#observer = new MutationObserver(this.#handleMutations);
    this.#observer.observe(this, {
      attributeFilter: ['disabled', 'value'],
      attributes: true,
      childList: true,
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
    this.#observer = undefined;
    super.disconnectedCallback();
  }

  focusSelected(options?: FocusOptions): void {
    this.#collectPairs()
      .pairs.find(({ value }) => value === this.#selectedValue)
      ?.tab.focus(options);
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (
      changedProperties.has('value') ||
      changedProperties.has('activation') ||
      changedProperties.has('orientation')
    ) {
      this.#synchronize();
    }
  }

  protected override render() {
    return html`<slot @slotchange=${this.#handleSlotChange}></slot>`;
  }

  readonly #handleSlotChange = (): void => {
    this.#synchronize();
  };

  readonly #handleFocusIn = (event: FocusEvent): void => {
    this.#lastFocusedElement = event
      .composedPath()
      .find(
        (target): target is WgTab | WgTabPanel =>
          target instanceof WgTab || target instanceof WgTabPanel,
      );
  };

  readonly #handleFocusOut = (event: FocusEvent): void => {
    if (event.relatedTarget instanceof Node && !this.contains(event.relatedTarget)) {
      this.#lastFocusedElement = undefined;
      return;
    }

    setTimeout(() => {
      if (!this.matches(':focus-within')) {
        this.#lastFocusedElement = undefined;
      }
    }, 0);
  };

  readonly #handleMutations = (records: readonly MutationRecord[]): void => {
    const list = this.#tabList();
    const structuralRecords = records.filter(
      (record) =>
        record.type === 'attributes' ||
        record.target === this ||
        record.target === list ||
        record.target instanceof WgTab ||
        record.target instanceof WgTabPanel,
    );

    if (structuralRecords.length === 0) {
      return;
    }

    const lastFocused = this.#lastFocusedElement;
    const restoreFocus =
      lastFocused !== undefined &&
      structuralRecords.some((record) => {
        if (record.type === 'attributes') {
          return (
            record.attributeName === 'disabled' &&
            (record.target === lastFocused ||
              (record.target instanceof WgTab &&
                lastFocused instanceof WgTabPanel &&
                record.target.value.trim() === lastFocused.value.trim()))
          );
        }

        return [...Array.from(record.removedNodes), ...Array.from(record.addedNodes)].some(
          (node) => node === lastFocused || (node instanceof Element && node.contains(lastFocused)),
        );
      });

    this.#synchronize({ restoreFocus });
  };

  readonly #handleClick = (event: MouseEvent): void => {
    const tab = this.#eventTab(event);

    if (!tab || tab.disabled || !this.#isManagedTab(tab)) {
      return;
    }

    tab.focus();
    this.#select(tab.value.trim(), 'pointer');
  };

  readonly #handleKeydown = (event: KeyboardEvent): void => {
    const tab = this.#eventTab(event);

    if (!tab || tab.disabled || !this.#isManagedTab(tab)) {
      return;
    }

    const { pairs } = this.#collectPairs();
    const enabledPairs = pairs.filter((pair) => !pair.tab.disabled);
    const currentIndex = enabledPairs.findIndex((pair) => pair.tab === tab);

    if (currentIndex < 0) {
      return;
    }

    let nextIndex: number | undefined;

    if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = enabledPairs.length - 1;
    } else if (this.orientation === 'vertical') {
      if (event.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % enabledPairs.length;
      } else if (event.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + enabledPairs.length) % enabledPairs.length;
      }
    } else {
      const direction = getComputedStyle(this.#tabList() ?? this).direction;
      const nextKey = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      const previousKey = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';

      if (event.key === nextKey) {
        nextIndex = (currentIndex + 1) % enabledPairs.length;
      } else if (event.key === previousKey) {
        nextIndex = (currentIndex - 1 + enabledPairs.length) % enabledPairs.length;
      }
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      const nextPair = enabledPairs[nextIndex];

      if (!nextPair) {
        return;
      }

      nextPair.tab.focus();

      if (this.activation === 'automatic') {
        this.#select(nextPair.value, 'keyboard');
      }
      return;
    }

    if (
      this.activation === 'manual' &&
      (event.key === 'Enter' || event.key === ' ') &&
      tab.getAttribute('aria-selected') !== 'true'
    ) {
      event.preventDefault();
      this.#select(tab.value.trim(), 'keyboard');
    }
  };

  #eventTab(event: Event): WgTab | undefined {
    return event.composedPath().find((target): target is WgTab => target instanceof WgTab);
  }

  #isManagedTab(tab: WgTab): boolean {
    return tab.parentElement === this.#tabList();
  }

  #tabList(): WgTabList | undefined {
    const list = Array.from(this.children).find(
      (element): element is WgTabList => element instanceof WgTabList,
    );
    return list;
  }

  #collectPairs(): { pairs: TabPair[]; diagnostics: string[] } {
    const list = this.#tabList();
    const tabs = list
      ? Array.from(list.children).filter((element): element is WgTab => element instanceof WgTab)
      : [];
    const panels = Array.from(this.children).filter(
      (element): element is WgTabPanel => element instanceof WgTabPanel,
    );
    const diagnostics: string[] = [];
    const tabCounts = new Map<string, number>();
    const panelCounts = new Map<string, number>();

    for (const tab of tabs) {
      const value = tab.value.trim();
      tabCounts.set(value, (tabCounts.get(value) ?? 0) + 1);
    }

    for (const panel of panels) {
      const value = panel.value.trim();
      panelCounts.set(value, (panelCounts.get(value) ?? 0) + 1);
    }

    const pairs = tabs.flatMap((tab, sourceIndex): TabPair[] => {
      const value = tab.value.trim();

      if (!value) {
        diagnostics.push('Tabs require a non-empty value.');
        return [];
      }

      if (tabCounts.get(value) !== 1 || panelCounts.get(value) !== 1) {
        diagnostics.push(`Tab value "${value}" must identify exactly one tab and one panel.`);
        return [];
      }

      const panel = panels.find((candidate) => candidate.value.trim() === value);
      return panel ? [{ tab, panel, value, sourceIndex }] : [];
    });

    if (!list) {
      diagnostics.push('Tabs require one direct wg-tab-list child.');
    } else if (!list.hasAttribute('aria-label') && !list.hasAttribute('aria-labelledby')) {
      diagnostics.push('wg-tab-list requires aria-label or aria-labelledby.');
    }

    if (pairs.length === 0) {
      diagnostics.push('Tabs require at least one valid tab-panel pair.');
    }

    return { pairs, diagnostics };
  }

  #select(value: string, trigger: TabChangeTrigger): void {
    const previousValue = this.#selectedValue;

    if (!value || value === previousValue) {
      return;
    }

    this.value = value;
    this.#synchronize();

    if (this.#selectedValue === value) {
      this.dispatchEvent(
        new CustomEvent<WgTabChangeDetail>('wg-tab-change', {
          bubbles: true,
          composed: true,
          detail: {
            value,
            previousValue,
            trigger,
          },
        }),
      );
    }
  }

  #synchronize(options: SynchronizeOptions = {}): void {
    if (this.#synchronizing || !this.isConnected) {
      return;
    }

    const focusedTab = document.activeElement instanceof WgTab ? document.activeElement : undefined;
    this.#synchronizing = true;

    try {
      const { pairs, diagnostics } = this.#collectPairs();
      const list = this.#tabList();
      const enabledPairs = pairs.filter(({ tab }) => !tab.disabled);
      const requestedValue = this.value.trim();
      let selected = enabledPairs.find(({ value }) => value === requestedValue);

      if (!selected && enabledPairs.length > 0) {
        const previousPosition =
          this.#selectedIndex < 0
            ? 0
            : Math.min(this.#selectedIndex, Math.max(pairs.length - 1, 0));
        selected =
          pairs.slice(previousPosition).find(({ tab }) => !tab.disabled) ??
          pairs
            .slice(0, previousPosition)
            .reverse()
            .find(({ tab }) => !tab.disabled) ??
          enabledPairs[0];
      }

      const selectedValue = selected?.value ?? '';
      const selectedIndex = selected?.sourceIndex ?? -1;

      if (this.value !== selectedValue) {
        this.value = selectedValue;
      }

      this.#selectedValue = selectedValue;
      this.#selectedIndex = selectedIndex;

      if (list) {
        list.setAttribute('role', 'tablist');
        list.setAttribute('aria-orientation', this.orientation);
      }

      for (const pair of pairs) {
        this.#ensureRelationshipIds(pair);
        const isSelected = pair === selected;

        pair.tab.hidden = false;
        pair.tab.setAttribute('role', 'tab');
        pair.tab.setAttribute('aria-selected', String(isSelected));
        pair.tab.tabIndex = isSelected ? 0 : -1;

        if (pair.tab.disabled) {
          pair.tab.setAttribute('aria-disabled', 'true');
        } else {
          pair.tab.removeAttribute('aria-disabled');
        }

        pair.panel.setAttribute('role', 'tabpanel');
        pair.panel.tabIndex = 0;
        pair.panel.hidden = !isSelected;
        pair.tab.setAttribute('aria-controls', pair.panel.id);
        pair.panel.setAttribute('aria-labelledby', pair.tab.id);
      }

      const validTabs = new Set(pairs.map(({ tab }) => tab));
      const validPanels = new Set(pairs.map(({ panel }) => panel));

      for (const tab of list
        ? Array.from(list.children).filter((element): element is WgTab => element instanceof WgTab)
        : []) {
        if (!validTabs.has(tab)) {
          tab.hidden = true;
          tab.setAttribute('role', 'tab');
          tab.setAttribute('aria-selected', 'false');
          tab.tabIndex = -1;
          tab.removeAttribute('aria-controls');
        }
      }

      for (const panel of Array.from(this.children).filter(
        (element): element is WgTabPanel => element instanceof WgTabPanel,
      )) {
        if (!validPanels.has(panel)) {
          panel.hidden = true;
          panel.removeAttribute('aria-labelledby');
        }
      }

      if (options.restoreFocus && selected) {
        const selectedTab = selected.tab;
        queueMicrotask(() => {
          if (
            selectedTab.isConnected &&
            !selectedTab.disabled &&
            this.#selectedValue === selectedTab.value.trim()
          ) {
            selectedTab.focus();
          }
        });
      } else if (focusedTab?.isConnected && !focusedTab.disabled) {
        focusedTab.focus();
      }

      this.#reportDiagnostics(diagnostics);
    } finally {
      this.#synchronizing = false;
    }
  }

  #ensureRelationshipIds(pair: TabPair): void {
    if (!pair.tab.id) {
      pair.tab.id = this.#availableId(
        `${wgTabTagName}-${this.#instanceId}-${pair.sourceIndex + 1}`,
      );
    }

    if (!pair.panel.id) {
      pair.panel.id = this.#availableId(
        `${wgTabPanelTagName}-${this.#instanceId}-${pair.sourceIndex + 1}`,
      );
    }
  }

  #availableId(base: string): string {
    let candidate = base;
    let suffix = 1;

    while (document.getElementById(candidate)) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }

    return candidate;
  }

  #reportDiagnostics(diagnostics: readonly string[]): void {
    const signature = [...new Set(diagnostics)].sort().join('\n');

    if (signature && signature !== this.#diagnosticSignature) {
      console.warn(`[${wgTabsTagName}] Invalid authoring:\n${signature}`);
    }

    this.#diagnosticSignature = signature;
  }
}

export function defineWgTabs(registry: CustomElementRegistry = customElements): void {
  defineWgTab(registry);
  defineWgTabList(registry);
  defineWgTabPanel(registry);
  defineElement(wgTabsTagName, WgTabs, registry);
}

export {
  defineWgTab,
  defineWgTabList,
  defineWgTabPanel,
  WgTab,
  WgTabList,
  WgTabPanel,
  wgTabListTagName,
  wgTabPanelTagName,
  wgTabTagName,
};

declare global {
  interface HTMLElementTagNameMap {
    'wg-tabs': WgTabs;
  }

  interface HTMLElementEventMap {
    'wg-tab-change': CustomEvent<WgTabChangeDetail>;
  }
}
