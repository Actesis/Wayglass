import { isDensityName, isThemeSelectionName, resolveSystemTheme } from '@wayglass/themes';
import type { DensityName, Phase1ThemeName, ThemeSelectionName } from '@wayglass/themes';
import { css, html } from 'lit';
import type { PropertyValues } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgThemeProviderTagName = 'wg-theme-provider';

export type ThemeChangeSource = 'attribute' | 'system';

export interface WgThemeChangeDetail {
  readonly theme: ThemeSelectionName;
  readonly resolvedTheme: Phase1ThemeName;
  readonly source: ThemeChangeSource;
}

export class WgThemeProvider extends WayglassElement {
  static override properties = {
    theme: {
      type: String,
      reflect: true,
      noAccessor: true,
    },
    density: {
      type: String,
      reflect: true,
      noAccessor: true,
    },
  };

  static override styles = css`
    :host {
      display: contents;
    }
  `;

  #theme: ThemeSelectionName = 'system';
  #density: DensityName = 'compact';
  #prefersDark = true;
  #resolvedTheme: Phase1ThemeName = 'wayglass-dark';
  #systemPreference: MediaQueryList | undefined;

  get theme(): ThemeSelectionName {
    return this.#theme;
  }

  set theme(value: ThemeSelectionName) {
    const previous = this.#theme;
    this.#theme = isThemeSelectionName(value) ? value : 'system';
    this.requestUpdate('theme', previous);
  }

  get density(): DensityName {
    return this.#density;
  }

  set density(value: DensityName) {
    const previous = this.#density;
    this.#density = isDensityName(value) ? value : 'compact';
    this.requestUpdate('density', previous);
  }

  get resolvedTheme(): Phase1ThemeName {
    return this.#resolvedTheme;
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'theme' && !isThemeSelectionName(value)) {
      if (value !== 'system') {
        this.setAttribute('theme', 'system');
      }
      return;
    }

    if (name === 'density' && !isDensityName(value)) {
      if (value !== 'compact') {
        this.setAttribute('density', 'compact');
      }
      return;
    }

    super.attributeChangedCallback(name, previous, value);
  }

  override connectedCallback(): void {
    this.#connectSystemPreference();
    super.connectedCallback();
    this.#synchronizeContext('system', false);
  }

  override disconnectedCallback(): void {
    this.#systemPreference?.removeEventListener('change', this.#handleSystemPreferenceChange);
    this.#systemPreference = undefined;
    super.disconnectedCallback();
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('theme')) {
      this.#synchronizeContext('attribute', true);
    }

    if (changedProperties.has('density')) {
      this.dataset.wgDensity = this.density;
    }
  }

  protected override render() {
    return html`<slot></slot>`;
  }

  #connectSystemPreference(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      this.#prefersDark = true;
      return;
    }

    this.#systemPreference?.removeEventListener('change', this.#handleSystemPreferenceChange);
    this.#systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
    this.#prefersDark = this.#systemPreference.matches;
    this.#systemPreference.addEventListener('change', this.#handleSystemPreferenceChange);
  }

  readonly #handleSystemPreferenceChange = (event: MediaQueryListEvent): void => {
    this.#prefersDark = event.matches;

    if (this.theme === 'system') {
      this.#synchronizeContext('system', true);
    }
  };

  #synchronizeContext(source: ThemeChangeSource, notify: boolean): void {
    const nextResolvedTheme =
      this.theme === 'system' ? resolveSystemTheme(this.#prefersDark) : this.theme;
    const previousResolvedTheme = this.#resolvedTheme;

    this.#resolvedTheme = nextResolvedTheme;
    this.dataset.wgTheme = nextResolvedTheme;
    this.dataset.wgDensity = this.density;

    if (notify && previousResolvedTheme !== nextResolvedTheme) {
      this.dispatchEvent(
        new CustomEvent<WgThemeChangeDetail>('wg-theme-change', {
          bubbles: true,
          composed: true,
          detail: {
            theme: this.theme,
            resolvedTheme: nextResolvedTheme,
            source,
          },
        }),
      );
    }
  }
}

export function defineWgThemeProvider(registry: CustomElementRegistry = customElements): void {
  defineElement(wgThemeProviderTagName, WgThemeProvider, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-theme-provider': WgThemeProvider;
  }
}
