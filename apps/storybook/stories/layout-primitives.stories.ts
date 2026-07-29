import { defineWgBooleanValue } from '@wayglass/elements/boolean-value';
import { defineWgButton } from '@wayglass/elements/button';
import { defineWgCanvas } from '@wayglass/elements/canvas';
import { defineWgCluster } from '@wayglass/elements/cluster';
import { defineWgFrame } from '@wayglass/elements/frame';
import { defineWgGrid } from '@wayglass/elements/grid';
import { defineWgScrollRegion } from '@wayglass/elements/scroll-region';
import { defineWgSplit } from '@wayglass/elements/split';
import { defineWgStack } from '@wayglass/elements/stack';
import { defineWgStatusIndicator } from '@wayglass/elements/status-indicator';
import { defineWgSurface } from '@wayglass/elements/surface';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import './layout-primitives.css';

defineWgThemeProvider();
defineWgCanvas();
defineWgFrame();
defineWgStack();
defineWgCluster();
defineWgGrid();
defineWgSplit();
defineWgScrollRegion();
defineWgSurface();
defineWgButton();
defineWgStatusIndicator();
defineWgBooleanValue();

const meta = {
  title: 'Layout/Layout Primitives',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const events = [
  'Primary source verified',
  'Routing policy refreshed',
  'Secondary source delayed',
  'Operator note attached',
  'Background reconciliation complete',
  'Maintenance window scheduled',
  'Filter specification confirmed',
  'Service contact reviewed',
];

function functionFrame(
  id: string,
  title: string,
  summary: string,
  condition: 'positive' | 'caution' | 'neutral',
) {
  return html`
    <section aria-labelledby=${`${id}-heading`}>
      <wg-frame>
        <wg-stack space="section">
          <wg-cluster justify="between" align="baseline">
            <div>
              <p class="wg-type-label wg-layout-kicker">Function</p>
              <h2 id=${`${id}-heading`} class="wg-type-section">${title}</h2>
            </div>
            <wg-status-indicator
              label=${`${title} condition`}
              condition=${condition}
            ></wg-status-indicator>
          </wg-cluster>
          <p>${summary}</p>
          <wg-cluster>
            <wg-button appearance="secondary">Review ${title}</wg-button>
            <span class="wg-type-metadata">Updated moments ago</span>
          </wg-cluster>
        </wg-stack>
      </wg-frame>
    </section>
  `;
}

export const MultiFunctionOverview: Story = {
  render: () => html`
    <wg-theme-provider theme="wayglass-dark" density="compact">
      <wg-canvas width="full">
        <main class="wg-layout-catalog">
          <wg-stack space="function">
            <header>
              <p class="wg-type-label wg-layout-kicker">Container-owned composition</p>
              <h1 class="wg-type-title">Multiple functions, unmistakable boundaries</h1>
              <p>Each function remains named, local, neutral, and readable in source order.</p>
            </header>
            <wg-grid minimum="standard" space="function">
              ${functionFrame(
                'identity',
                'Identity',
                'Account verification and access context remain visible together.',
                'positive',
              )}
              ${functionFrame(
                'communications',
                'Communications',
                'Delivery state is separate from account and inventory functions.',
                'caution',
              )}
              ${functionFrame(
                'inventory',
                'Inventory',
                'Asset records provide information without implying an operational problem.',
                'neutral',
              )}
            </wg-grid>
          </wg-stack>
        </main>
      </wg-canvas>
    </wg-theme-provider>
  `,
};

export const WorkingRegionAndHistory: Story = {
  render: () => html`
    <wg-theme-provider theme="wayglass-light" density="comfortable">
      <wg-canvas>
        <main class="wg-layout-catalog">
          <wg-frame boundary="strong">
            <wg-stack space="section">
              <header>
                <p class="wg-type-label wg-layout-kicker">Asset records</p>
                <h1 class="wg-type-title">Service context</h1>
              </header>
              <wg-split ratio="primary" minimum="standard">
                <wg-surface slot="primary" tone="panel">
                  <wg-stack space="section">
                    <h2 class="wg-type-section">HVAC system</h2>
                    <p>
                      The primary region can later contain the accepted media primitive alongside
                      identification and maintenance details.
                    </p>
                    <wg-cluster>
                      <wg-boolean-value
                        label="Maintenance plan"
                        asserted
                        asserted-label="Verified"
                        not-asserted-label="Unverified"
                      ></wg-boolean-value>
                      <wg-button>Review maintenance</wg-button>
                    </wg-cluster>
                  </wg-stack>
                </wg-surface>
                <aside slot="secondary" aria-labelledby="history-heading">
                  <wg-stack space="related">
                    <h2 id="history-heading" class="wg-type-section">Recent history</h2>
                    <wg-scroll-region
                      label="Recent HVAC history"
                      style="--wg-scroll-region-max-block-size: 12rem"
                    >
                      <ol class="wg-layout-history">
                        ${events.map((event) => html`<li>${event}</li>`)}
                      </ol>
                    </wg-scroll-region>
                  </wg-stack>
                </aside>
              </wg-split>
            </wg-stack>
          </wg-frame>
        </main>
      </wg-canvas>
    </wg-theme-provider>
  `,
};
