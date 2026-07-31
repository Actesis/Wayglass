import {
  defineWgButton,
  defineWgDivider,
  defineWgGrid,
  defineWgMenu,
  defineWgPanel,
  defineWgStack,
  defineWgThemeProvider,
} from '@wayglass/elements';
import { defineWgIcon } from '@wayglass/icons';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

defineWgIcon();
defineWgThemeProvider();
defineWgStack();
defineWgGrid();
defineWgPanel();
defineWgButton();
defineWgDivider();
defineWgMenu();

const meta = {
  title: 'Controls/Menus and commands',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function reportCommand(event: CustomEvent<{ value: string }>) {
  const output = document.querySelector<HTMLElement>('[data-command-output]');
  if (output) output.textContent = `Requested command: ${event.detail.value}`;
}

function renderMenus(theme: 'wayglass-dark' | 'wayglass-light') {
  return html`<wg-theme-provider theme=${theme} density="compact">
    <main
      style="min-height:100vh;box-sizing:border-box;padding:var(--wg-space-reference-6);color:var(--wg-color-semantic-text-primary);background:var(--wg-color-semantic-surface-canvas);font-family:var(--wg-typography-family-body)"
      @wg-command=${reportCommand}
    >
      <wg-stack space="function">
        <header>
          <p style="margin:0;color:var(--wg-color-semantic-text-secondary)">Phase 2D-C</p>
          <h1 style="margin:var(--wg-space-reference-1) 0 0">Menus preserve command context</h1>
          <p data-command-output role="status">No secondary command requested.</p>
        </header>

        <wg-grid minimum="standard" space="function">
          <wg-panel purpose="control">
            <span slot="eyebrow">Primary response remains visible</span>
            <h2 slot="heading">Intake report</h2>
            <p>Updated 4 minutes ago. The current report remains available.</p>
            <wg-button>Refresh intake data</wg-button>
            <wg-menu placement="block-end-start">
              <span slot="trigger">More report actions</span>
              <wg-command-item value="copy-report-id">Copy report identifier</wg-command-item>
              <wg-command-item value="export-report">
                Export report
                <span slot="detail">Download the confirmed values</span>
              </wg-command-item>
              <wg-divider></wg-divider>
              <wg-command-item value="archive-report" disabled>
                Archive report
                <span slot="detail">Unavailable while review is open</span>
              </wg-command-item>
            </wg-menu>
          </wg-panel>

          <wg-panel purpose="information">
            <span slot="eyebrow">Compact contextual trigger</span>
            <h2 slot="heading">Account record</h2>
            <p>The visible heading supplies context for the compact overflow trigger.</p>
            <wg-menu label="Account record actions" placement="block-end-end">
              <wg-icon slot="trigger" name="more"></wg-icon>
              <wg-command-item value="copy-account-id">Copy account identifier</wg-command-item>
              <wg-command-item value="download-account">Download account record</wg-command-item>
            </wg-menu>
          </wg-panel>

          <wg-panel purpose="monitor">
            <span slot="eyebrow">Command outcome stays outside</span>
            <h2 slot="heading">Directory synchronization</h2>
            <p>Last completed successfully at 14:06. No synchronization is pending.</p>
            <wg-menu placement="block-start-end">
              <span slot="trigger">Synchronization actions</span>
              <wg-command-item value="run-synchronization">Run synchronization</wg-command-item>
              <wg-command-item value="copy-last-run">Copy last-run time</wg-command-item>
            </wg-menu>
          </wg-panel>
        </wg-grid>
      </wg-stack>
    </main>
  </wg-theme-provider>`;
}

export const Dark: Story = { render: () => renderMenus('wayglass-dark') };
export const Light: Story = { render: () => renderMenus('wayglass-light') };
