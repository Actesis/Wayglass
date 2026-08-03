import { defineWgButton } from '@wayglass/elements/button';
import { defineWgDialog, type WgDialog } from '@wayglass/elements/dialog';
import { defineWgGrid } from '@wayglass/elements/grid';
import { defineWgMedia } from '@wayglass/elements/media';
import '@wayglass/elements/media.css';
import { defineWgMediaViewer, type WgMediaViewer } from '@wayglass/elements/media-viewer';
import '@wayglass/elements/media-viewer.css';
import { defineWgPanel } from '@wayglass/elements/panel';
import { defineWgStack } from '@wayglass/elements/stack';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import hvacPhotoUrl from './assets/hvac-air-handler.jpg?url';
import './modal-content.css';

defineWgThemeProvider();
defineWgStack();
defineWgGrid();
defineWgPanel();
defineWgButton();
defineWgMedia();
defineWgDialog();
defineWgMediaViewer();

const meta = {
  title: 'Feedback/Modal content and media inspection',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function showDialog(event: Event, selector: string): void {
  const invoker = event.currentTarget as HTMLElement;
  const provider = invoker.closest('wg-theme-provider');
  provider?.querySelector<WgDialog>(selector)?.show({ invoker });
}

function showViewer(event: Event, selector: string): void {
  const invoker = event.currentTarget as HTMLElement;
  const provider = invoker.closest('wg-theme-provider');
  provider?.querySelector<WgMediaViewer>(selector)?.show({ invoker });
}

function closeDialog(event: Event): void {
  (event.currentTarget as HTMLElement).closest<WgDialog>('wg-dialog')?.close();
}

function renderModalContent(theme: 'wayglass-dark' | 'wayglass-light') {
  return html`<wg-theme-provider theme=${theme} density="compact">
    <main class="wg-modal-example">
      <wg-stack space="function">
        <header class="wg-modal-example-header">
          <p class="wg-type-label">Phase 2F</p>
          <h1 class="wg-type-title">Focused content without losing operational context</h1>
          <p>
            A content dialog handles bounded application detail. A separate media viewer inspects
            one consumer-owned image. Neither surface becomes navigation or hidden workflow state.
          </p>
        </header>

        <wg-grid minimum="standard" space="function">
          <wg-panel class="wg-modal-example-card" purpose="information">
            <span slot="eyebrow">Information function</span>
            <h2 slot="heading">Access review</h2>
            <wg-stack space="section">
              <p>
                Twelve accounts are included in the current review. The summary remains visible
                while detailed scope opens in a focused modal surface.
              </p>
              <wg-button
                appearance="secondary"
                @click=${(event: Event) => showDialog(event, '#access-review-dialog')}
              >
                Review access scope
              </wg-button>
            </wg-stack>
          </wg-panel>

          <wg-panel class="wg-modal-example-card" purpose="control">
            <span slot="eyebrow">Inspection function</span>
            <h2 slot="heading">Asset identification</h2>
            <wg-stack space="section">
              <figure class="wg-modal-example-figure">
                <wg-media aspect="landscape" fit="contain" boundary="strong">
                  <img
                    src=${hvacPhotoUrl}
                    width="1200"
                    height="900"
                    alt="Gray air handler with a filter in its lower front access panel"
                  />
                  <wg-button
                    slot="inspection"
                    appearance="secondary"
                    @click=${(event: Event) => showViewer(event, '#asset-image-viewer')}
                  >
                    Inspect air handler image
                  </wg-button>
                  <p slot="loading">Loading asset image…</p>
                  <p slot="unavailable">
                    Image unavailable. The filter is behind the lower front access panel.
                  </p>
                </wg-media>
                <figcaption>North utility closet asset record, captured July 30.</figcaption>
              </figure>
              <p>
                The maintenance identity and instructions remain in the page even when the image is
                unavailable or the viewer is closed.
              </p>
            </wg-stack>
          </wg-panel>
        </wg-grid>
      </wg-stack>
    </main>

    <wg-dialog
      id="access-review-dialog"
      class="wg-modal-example-dialog"
      dialog-id="access-review-scope"
      close-label="Close access review"
      size="standard"
      initial-focus="heading"
    >
      <h2 slot="heading">Access review scope</h2>
      <wg-stack space="section">
        <p>
          This modal presents application-authored detail. The surrounding review workflow and its
          durable state remain owned by the application.
        </p>
        <dl>
          <dt>Accounts</dt>
          <dd>12 active operator accounts</dd>
          <dt>Evidence through</dt>
          <dd>August 1, 2026</dd>
          <dt>Review owner</dt>
          <dd>Identity operations</dd>
        </dl>
      </wg-stack>
      <wg-button slot="actions" appearance="primary" @click=${closeDialog}>
        Return to summary
      </wg-button>
    </wg-dialog>

    <wg-media-viewer
      id="asset-image-viewer"
      viewer-id="north-utility-air-handler"
      close-label="Close image"
      zoom-in-label="Zoom in"
      zoom-out-label="Zoom out"
      fit-label="Fit image"
      actual-size-label="Actual size"
    >
      <h2 slot="heading">North utility closet air handler</h2>
      <p slot="context">Use the lower front panel to identify the filter access point.</p>
      <picture>
        <source srcset=${hvacPhotoUrl} type="image/jpeg" />
        <img
          class="wg-media-viewer-asset"
          src=${hvacPhotoUrl}
          width="1200"
          height="900"
          alt="Gray air handler with a filter in its lower front access panel"
        />
      </picture>
      <p slot="caption">Air handler and return duct photographed July 30.</p>
      <p slot="loading">Loading the air handler image…</p>
      <p slot="unavailable">
        Image unavailable. The filter is behind the lower front panel below the return duct.
      </p>
    </wg-media-viewer>
  </wg-theme-provider>`;
}

export const Dark: Story = { render: () => renderModalContent('wayglass-dark') };
export const Light: Story = { render: () => renderModalContent('wayglass-light') };
