import { css, html, LitElement, nothing, svg } from 'lit';

export const iconNames = ['close', 'menu', 'more', 'refresh'] as const;
export type IconName = (typeof iconNames)[number];

export const wgIconTagName = 'wg-icon';

export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && iconNames.some((name) => name === value);
}

export class WgIcon extends LitElement {
  static override properties = {
    name: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      display: inline-flex;
      inline-size: 1em;
      block-size: 1em;
      color: inherit;
      vertical-align: -0.125em;
    }

    svg {
      inline-size: 100%;
      block-size: 100%;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `;

  declare name: IconName;

  constructor() {
    super();
    this.name = 'more';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
  }

  protected override render() {
    const path = {
      close: svg`<path d="M6 6l12 12M18 6L6 18" />`,
      menu: svg`<path d="M4 7h16M4 12h16M4 17h16" />`,
      more: svg`<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />`,
      refresh: svg`<path d="M20 6v5h-5M4 18v-5h5M18.5 9A7 7 0 006.4 6.4L4 9M5.5 15A7 7 0 0017.6 17.6L20 15" />`,
    }[this.name];

    return isIconName(this.name)
      ? html`<svg viewBox="0 0 24 24" focusable="false">${path}</svg>`
      : nothing;
  }
}

export function defineWgIcon(registry: CustomElementRegistry = customElements): void {
  const existing = registry.get(wgIconTagName);
  if (!existing) registry.define(wgIconTagName, WgIcon);
  else if (existing !== WgIcon) throw new Error('wg-icon is already registered.');
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-icon': WgIcon;
  }
}
