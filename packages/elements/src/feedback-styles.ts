import { css } from 'lit';

export const feedbackHostStyles = css`
  :host {
    --wg-feedback-color-background: var(--wg-component-feedback-color-background);
    --wg-feedback-color-border: var(--wg-component-feedback-color-border);
    --wg-feedback-color-text: var(--wg-component-feedback-color-text);
    --wg-feedback-color-detail: var(--wg-component-feedback-color-detail);
    --wg-feedback-radius: var(--wg-component-feedback-radius);
    --wg-feedback-space: var(--wg-component-feedback-space);
    --wg-feedback-space-related: var(--wg-component-feedback-space-related);
    --wg-feedback-size-marker: var(--wg-component-feedback-size-marker);

    display: block;
    min-inline-size: 0;
    color: var(--wg-feedback-color-text);
    font-family: var(--wg-typography-family-body);
    line-height: var(--wg-typography-line-height-body);
  }

  :host([hidden]) {
    display: none !important;
  }
`;

export const feedbackCompositionStyles = css`
  [part='base'] {
    display: grid;
    min-inline-size: 0;
    grid-template-columns: var(--wg-feedback-size-marker) minmax(0, 1fr);
    gap: var(--wg-feedback-space-related) var(--wg-feedback-space);
    box-sizing: border-box;
    border: var(--wg-border-width-standard) solid var(--wg-feedback-color-border);
    border-radius: var(--wg-feedback-radius);
    background: var(--wg-feedback-color-background);
    padding: var(--wg-feedback-space);
  }

  [part='marker'] {
    grid-row: 1 / -1;
    border-radius: var(--wg-shape-radius-signal);
    background: var(--_wg-feedback-marker-color, var(--wg-color-semantic-condition-neutral));
  }

  [part='message'],
  [part='heading'],
  [part='content'],
  [part='last-known'],
  [part='actions'],
  [part='media'] {
    grid-column: 2;
    min-inline-size: 0;
  }

  [part='message'] {
    display: grid;
    gap: var(--wg-feedback-space-related);
  }

  [part='heading'] {
    font-size: var(--wg-typography-size-section);
    font-weight: var(--wg-typography-weight-emphasis);
    line-height: var(--wg-typography-line-height-compact);
    overflow-wrap: anywhere;
  }

  [part='content'],
  [part='last-known'] {
    color: var(--wg-feedback-color-detail);
    overflow-wrap: anywhere;
  }

  [part='actions'] {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--wg-feedback-space-related);
  }

  slot[name='heading']::slotted(*),
  slot[name='last-known']::slotted(*),
  slot[name='actions']::slotted(*),
  slot[name='media']::slotted(*) {
    margin-block: 0;
  }

  @media (forced-colors: active) {
    [part='base'] {
      border-color: CanvasText;
      background: Canvas;
      color: CanvasText;
    }

    [part='marker'] {
      border: var(--wg-border-width-strong) solid CanvasText;
      background: CanvasText;
    }

    [part='content'],
    [part='last-known'] {
      color: CanvasText;
    }
  }
`;
