import {
  defineWgAlert,
  defineWgBadge,
  defineWgButton,
  defineWgEmptyState,
  defineWgGrid,
  defineWgOfflineState,
  defineWgPanel,
  defineWgProgress,
  defineWgSkeleton,
  defineWgStack,
  defineWgStaleDataMarker,
  defineWgThemeProvider,
} from '@wayglass/elements';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

defineWgThemeProvider();
defineWgStack();
defineWgGrid();
defineWgPanel();
defineWgButton();
defineWgBadge();
defineWgAlert();
defineWgProgress();
defineWgSkeleton();
defineWgEmptyState();
defineWgOfflineState();
defineWgStaleDataMarker();

const meta = {
  title: 'Feedback/Persistent and loading',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function renderFeedback(theme: 'wayglass-dark' | 'wayglass-light') {
  return html`<wg-theme-provider theme=${theme} density="compact">
    <main
      style="min-height:100vh;box-sizing:border-box;padding:var(--wg-space-reference-6);color:var(--wg-color-semantic-text-primary);background:var(--wg-color-semantic-surface-canvas);font-family:var(--wg-typography-family-body)"
    >
      <wg-stack space="function">
        <header style="max-width:68ch">
          <p style="margin:0;color:var(--wg-color-semantic-text-secondary)">Phase 2E-B</p>
          <h1 style="margin:var(--wg-space-reference-1) 0 0">Persistent feedback and loading</h1>
          <p>Condition, activity, knowledge, and availability remain visibly independent.</p>
        </header>

        <wg-grid minimum="standard" space="function">
          <wg-panel purpose="information">
            <span slot="eyebrow">Account review</span>
            <h2 slot="heading">Persistent outcomes</h2>
            <wg-stack space="section">
              <p style="margin:0">
                Supplier verification <wg-badge condition="caution">Requires review</wg-badge>
              </p>
              <wg-alert condition="positive" label="Import result">
                <h3 slot="heading">124 records imported</h3>
                <p>Three records remain available for review.</p>
                <wg-button slot="actions" appearance="secondary">Review records</wg-button>
              </wg-alert>
            </wg-stack>
          </wg-panel>

          <wg-panel purpose="monitor">
            <span slot="eyebrow">Catalog source</span>
            <h2 slot="heading">Activity and freshness</h2>
            <wg-stack space="section">
              <wg-progress>
                <label for="feedback-import">Importing catalog</label>
                <progress id="feedback-import" value="64" max="100">64%</progress>
                <output for="feedback-import">64%</output>
              </wg-progress>
              <p style="margin:0">
                Queue latency: 184 ms
                <wg-stale-data-marker>Stale · observed 18 minutes ago</wg-stale-data-marker>
              </p>
              <section aria-busy="true" aria-labelledby="summary-loading">
                <p id="summary-loading">Loading supporting summary</p>
                <wg-skeleton shape="text" lines="3" motion="pulse"></wg-skeleton>
              </section>
            </wg-stack>
          </wg-panel>

          <wg-panel purpose="information">
            <span slot="eyebrow">Records</span>
            <h2 slot="heading">Bounded absence</h2>
            <wg-empty-state label="No matching maintenance records">
              <h3 slot="heading">No records match these filters</h3>
              <p>Clear one or more filters to include completed and scheduled work.</p>
              <wg-button slot="actions" appearance="secondary">Clear filters</wg-button>
            </wg-empty-state>
          </wg-panel>

          <wg-panel purpose="control">
            <span slot="eyebrow">Inventory function</span>
            <h2 slot="heading">Scoped availability</h2>
            <wg-offline-state label="Inventory source offline">
              <h3 slot="heading">Inventory source is offline</h3>
              <p>New counts and transfers are unavailable.</p>
              <p slot="last-known">Last successful update: 14:42 UTC</p>
              <wg-button slot="actions" appearance="secondary">Retry source</wg-button>
            </wg-offline-state>
          </wg-panel>
        </wg-grid>
      </wg-stack>
    </main>
  </wg-theme-provider>`;
}

export const Dark: Story = { render: () => renderFeedback('wayglass-dark') };
export const Light: Story = { render: () => renderFeedback('wayglass-light') };
