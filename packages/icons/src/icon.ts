import { css, html, LitElement, nothing, svg } from 'lit';

import {
  getIconRecord,
  iconPathData,
  isIconDirection,
  isIconSize,
  resolveIconHostSemantics,
  type IconDirection,
  type IconName,
  type IconPrimitive,
  type IconSize,
} from './runtime.js';

export {
  iconDirections,
  iconNames,
  iconSizes,
  isIconDirection,
  isIconName,
  isIconSize,
  type IconDirection,
  type IconName,
  type IconSize,
} from './runtime.js';

export const wgIconTagName = 'wg-icon';

function renderPrimitive(primitive: IconPrimitive) {
  return primitive.type === 'path'
    ? svg`<path
        d=${iconPathData(primitive)}
        fill=${primitive.fill}
        stroke=${primitive.stroke}
      ></path>`
    : svg`<circle
        cx=${primitive.centerX}
        cy=${primitive.centerY}
        r=${primitive.radius}
        fill=${primitive.fill}
        stroke=${primitive.stroke}
      ></circle>`;
}

export class WgIcon extends LitElement {
  static override properties = {
    name: { type: String, reflect: true },
    label: { type: String, reflect: true },
    size: { type: String, reflect: true },
    direction: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-icon-color: currentColor;
      --wg-icon-size: var(--wg-component-icon-size-standard);

      display: inline-flex;
      inline-size: var(--wg-icon-size);
      block-size: var(--wg-icon-size);
      color: var(--wg-icon-color);
      vertical-align: middle;
    }

    :host([size='compact']) {
      --wg-icon-size: var(--wg-component-icon-size-compact);
    }

    :host([size='prominent']) {
      --wg-icon-size: var(--wg-component-icon-size-prominent);
    }

    [part='svg'] {
      display: block;
      inline-size: 100%;
      block-size: 100%;
      overflow: visible;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      transform-box: fill-box;
      transform-origin: center;
    }

    :host([direction='rtl']) [part='svg'][data-direction='mirrors-in-rtl'],
    :host([direction='auto']:dir(rtl)) [part='svg'][data-direction='mirrors-in-rtl'] {
      transform: scaleX(-1);
    }

    @media (forced-colors: active) {
      [part='svg'] {
        color: CanvasText;
        forced-color-adjust: auto;
      }
    }
  `;

  declare name: IconName | undefined;
  declare label: string | undefined;
  declare size: IconSize;
  declare direction: IconDirection;

  constructor() {
    super();
    this.name = undefined;
    this.label = undefined;
    this.size = 'standard';
    this.direction = 'auto';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#syncSemantics();
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'size' && !isIconSize(value)) {
      if (value !== 'standard') this.setAttribute('size', 'standard');
      return;
    }
    if (name === 'direction' && !isIconDirection(value)) {
      if (value !== 'auto') this.setAttribute('direction', 'auto');
      return;
    }

    super.attributeChangedCallback(name, previous, value);
    if (this.isConnected && (name === 'name' || name === 'label')) this.#syncSemantics();
  }

  #syncSemantics(): void {
    const semantics = resolveIconHostSemantics(
      this.getAttribute('name'),
      this.getAttribute('label'),
    );
    if (!semantics.hidden) {
      this.removeAttribute('aria-hidden');
      this.setAttribute('role', semantics.role);
      this.setAttribute('aria-label', semantics.label);
      return;
    }

    this.removeAttribute('role');
    this.removeAttribute('aria-label');
    this.setAttribute('aria-hidden', 'true');
  }

  protected override render() {
    const record = getIconRecord(this.name);
    if (!record) return nothing;

    // The 24-unit view box and stroke width are catalog mechanics shared by every reviewed glyph;
    // exposing them as theme tokens would create visual API without semantic meaning.
    return html`<svg
      part="svg"
      viewBox="0 0 24 24"
      data-direction=${record.direction}
      aria-hidden="true"
      focusable="false"
    >
      ${record.primitives.map(renderPrimitive)}
    </svg>`;
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
