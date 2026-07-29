import { css, html } from 'lit';

import { isLayoutSpace, type LayoutSpace } from './layout-values.js';
import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export { isLayoutSpace, layoutSpaces } from './layout-values.js';
export type { LayoutSpace } from './layout-values.js';

export const clusterAlignments = ['start', 'center', 'end', 'stretch', 'baseline'] as const;
export type ClusterAlignment = (typeof clusterAlignments)[number];

export const clusterJustifications = ['start', 'center', 'end', 'between'] as const;
export type ClusterJustification = (typeof clusterJustifications)[number];

export const wgClusterTagName = 'wg-cluster';

export function isClusterAlignment(value: unknown): value is ClusterAlignment {
  return typeof value === 'string' && clusterAlignments.some((alignment) => alignment === value);
}

export function isClusterJustification(value: unknown): value is ClusterJustification {
  return (
    typeof value === 'string' &&
    clusterJustifications.some((justification) => justification === value)
  );
}

export class WgCluster extends WayglassElement {
  static override properties = {
    space: { type: String, reflect: true },
    align: { type: String, reflect: true },
    justify: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-cluster-space: var(--wg-component-layout-space-related);

      display: block;
      min-inline-size: 0;
    }

    :host([space='none']) {
      --wg-cluster-space: 0;
    }

    :host([space='section']) {
      --wg-cluster-space: var(--wg-component-layout-space-section);
    }

    :host([space='function']) {
      --wg-cluster-space: var(--wg-component-layout-space-function);
    }

    [part='base'] {
      display: flex;
      min-inline-size: 0;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-start;
      gap: var(--wg-cluster-space);
    }

    :host([align='start']) [part='base'] {
      align-items: flex-start;
    }

    :host([align='end']) [part='base'] {
      align-items: flex-end;
    }

    :host([align='stretch']) [part='base'] {
      align-items: stretch;
    }

    :host([align='baseline']) [part='base'] {
      align-items: baseline;
    }

    :host([justify='center']) [part='base'] {
      justify-content: center;
    }

    :host([justify='end']) [part='base'] {
      justify-content: flex-end;
    }

    :host([justify='between']) [part='base'] {
      justify-content: space-between;
    }

    slot {
      display: contents;
    }
  `;

  declare space: LayoutSpace;
  declare align: ClusterAlignment;
  declare justify: ClusterJustification;

  constructor() {
    super();
    this.space = 'related';
    this.align = 'center';
    this.justify = 'start';
  }

  override attributeChangedCallback(
    name: string,
    previous: string | null,
    value: string | null,
  ): void {
    if (name === 'space' && !isLayoutSpace(value)) {
      if (value !== 'related') this.setAttribute('space', 'related');
      return;
    }
    if (name === 'align' && !isClusterAlignment(value)) {
      if (value !== 'center') this.setAttribute('align', 'center');
      return;
    }
    if (name === 'justify' && !isClusterJustification(value)) {
      if (value !== 'start') this.setAttribute('justify', 'start');
      return;
    }
    super.attributeChangedCallback(name, previous, value);
  }

  protected override render() {
    return html`<div part="base"><slot></slot></div>`;
  }
}

export function defineWgCluster(registry: CustomElementRegistry = customElements): void {
  defineElement(wgClusterTagName, WgCluster, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-cluster': WgCluster;
  }
}
