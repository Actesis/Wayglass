import { defineWgButton } from '@wayglass/elements/button';
import { defineWgCanvas } from '@wayglass/elements/canvas';
import { defineWgFrame } from '@wayglass/elements/frame';
import { defineWgGrid } from '@wayglass/elements/grid';
import { defineWgMedia } from '@wayglass/elements/media';
import '@wayglass/elements/media.css';
import { defineWgSplit } from '@wayglass/elements/split';
import { defineWgStack } from '@wayglass/elements/stack';
import { defineWgSurface } from '@wayglass/elements/surface';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import ambientBandsUrl from './assets/ambient-bands.svg?url';
import hvacPhotoUrl from './assets/hvac-air-handler.jpg?url';
import filterDiagramUrl from './assets/hvac-filter-diagram.svg?url';
import './media-content.css';

defineWgThemeProvider();
defineWgCanvas();
defineWgFrame();
defineWgStack();
defineWgGrid();
defineWgSplit();
defineWgSurface();
defineWgMedia();
defineWgButton();

const meta = {
  title: 'Media/Media Content',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AssetIdentification: Story = {
  render: () => html`
    <wg-theme-provider theme="wayglass-light" density="comfortable">
      <wg-canvas>
        <main>
          <wg-frame boundary="strong">
            <wg-stack space="section">
              <header>
                <p class="wg-type-label wg-media-kicker">Asset record</p>
                <h1 class="wg-type-title">North utility closet HVAC</h1>
                <p>
                  The image supplements identification and instructions. Maintenance state and
                  actions remain ordinary interface content.
                </p>
              </header>
              <wg-split ratio="primary" minimum="standard">
                <figure slot="primary" class="wg-media-figure">
                  <wg-media aspect="landscape" fit="contain" boundary="strong">
                    <picture>
                      <source srcset=${hvacPhotoUrl} type="image/jpeg" />
                      <img
                        class="wg-media-asset"
                        src=${hvacPhotoUrl}
                        width="1200"
                        height="900"
                        alt="Gray HVAC air handler in a utility closet with the filter visible in the lower front access panel"
                        decoding="async"
                      />
                    </picture>
                    <a
                      class="wg-media-inspection wg-focus-ring"
                      slot="inspection"
                      href=${hvacPhotoUrl}
                      target="_blank"
                      rel="noopener"
                    >
                      View full-size HVAC image
                    </a>
                    <p slot="loading">Loading HVAC identification image…</p>
                    <p slot="unavailable">
                      Image unavailable. The filter is in the lower front panel of the gray air
                      handler.
                    </p>
                  </wg-media>
                  <figcaption>Air handler and return duct in the north utility closet.</figcaption>
                </figure>
                <wg-stack slot="secondary" space="section">
                  <section aria-labelledby="filter-heading">
                    <h2 id="filter-heading" class="wg-type-section">Filter location</h2>
                    <p>
                      Open the lower front access panel. The filter sits behind the gray diamond
                      grille, below the two black fasteners.
                    </p>
                  </section>
                  <section aria-labelledby="schedule-heading">
                    <h2 id="schedule-heading" class="wg-type-section">Maintenance</h2>
                    <p>
                      Replacement is scheduled for August 15. The current filter is 20 × 25 × 1.
                    </p>
                    <wg-button appearance="secondary">Review HVAC maintenance</wg-button>
                  </section>
                </wg-stack>
              </wg-split>
            </wg-stack>
          </wg-frame>
        </main>
      </wg-canvas>
    </wg-theme-provider>
  `,
};

export const FitsAndResourceStates: Story = {
  render: () => html`
    <wg-theme-provider theme="wayglass-dark" density="compact">
      <wg-canvas>
        <main>
          <wg-stack space="function">
            <header>
              <p class="wg-type-label wg-media-kicker">Native content, stable presentation</p>
              <h1 class="wg-type-title">Media fits and resource states</h1>
              <p>Every card retains a text identity and useful context outside the image.</p>
            </header>
            <wg-grid minimum="compact" space="section">
              <wg-surface>
                <wg-stack space="related">
                  <h2 class="wg-type-section">Complete diagram</h2>
                  <wg-media aspect="square" fit="contain">
                    <img
                      src=${filterDiagramUrl}
                      width="1200"
                      height="900"
                      alt="Diagram pointing to the filter access area on the lower front of an air handler"
                    />
                    <p slot="loading">Loading filter diagram…</p>
                    <p slot="unavailable">
                      Diagram unavailable. Use the lower front panel below the fasteners.
                    </p>
                  </wg-media>
                  <p>Contain preserves labels and the full directional annotation.</p>
                </wg-stack>
              </wg-surface>
              <wg-surface>
                <wg-stack space="related">
                  <h2 class="wg-type-section">Retained during refresh</h2>
                  <wg-media aspect="square" fit="cover" state="loading">
                    <img
                      src=${hvacPhotoUrl}
                      width="1200"
                      height="900"
                      alt="Previously loaded view of the utility closet HVAC air handler"
                    />
                    <p slot="loading">Refreshing image; previous view retained.</p>
                    <p slot="unavailable">
                      Image unavailable. The equipment is the gray air handler in the north utility
                      closet.
                    </p>
                  </wg-media>
                  <p>Last captured July 30 at 05:42. Refresh is still pending.</p>
                </wg-stack>
              </wg-surface>
              <wg-surface>
                <wg-stack space="related">
                  <h2 class="wg-type-section">Unavailable image</h2>
                  <wg-media aspect="square" state="unavailable">
                    <img
                      src="/fixtures/intentionally-missing-asset.jpg"
                      width="1200"
                      height="900"
                      alt="Account identity document"
                    />
                    <p slot="loading">Loading account identity image…</p>
                    <p slot="unavailable">
                      Identity image unavailable. Verification status remains listed below.
                    </p>
                  </wg-media>
                  <p>Email verification is confirmed. The image is not required to continue.</p>
                </wg-stack>
              </wg-surface>
              <wg-surface>
                <wg-stack space="related">
                  <h2 class="wg-type-section">Decorative atmosphere</h2>
                  <wg-media aspect="square" fit="cover" boundary="none">
                    <img src=${ambientBandsUrl} width="1200" height="900" alt="" />
                    <p slot="loading">Loading decorative image…</p>
                    <p slot="unavailable">Decorative image unavailable.</p>
                  </wg-media>
                  <p>No meaning or function identity depends on the decorative image.</p>
                </wg-stack>
              </wg-surface>
            </wg-grid>
          </wg-stack>
        </main>
      </wg-canvas>
    </wg-theme-provider>
  `,
};
