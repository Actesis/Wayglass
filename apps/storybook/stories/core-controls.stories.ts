import {
  defineWgIconButton,
  defineWgGrid,
  defineWgNavigationRail,
  defineWgPanel,
  defineWgSegmentedControl,
  defineWgStack,
  defineWgThemeProvider,
  defineWgToggle,
} from '@wayglass/elements';
import { defineWgIcon } from '@wayglass/icons';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

defineWgIcon();
defineWgThemeProvider();
defineWgStack();
defineWgGrid();
defineWgPanel();
defineWgIconButton();
defineWgToggle();
defineWgSegmentedControl();
defineWgNavigationRail();

const meta = {
  title: 'Controls/Core controls',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function renderControls(theme: 'wayglass-dark' | 'wayglass-light') {
  return html`<wg-theme-provider theme=${theme} density="compact">
    <main
      style="min-height:100vh;box-sizing:border-box;padding:var(--wg-space-reference-6);color:var(--wg-color-semantic-text-primary);background:var(--wg-color-semantic-surface-canvas);font-family:var(--wg-typography-family-body)"
    >
      <wg-stack space="function">
        <header>
          <p style="margin:0;color:var(--wg-color-semantic-text-secondary)">Phase 2D-B</p>
          <h1 style="margin:.25rem 0 0">Core control semantics</h1>
        </header>

        <wg-grid minimum="standard" space="section">
          <wg-panel purpose="control">
            <span slot="eyebrow">Operational value</span>
            <h2 slot="heading">Account communications</h2>
            <wg-toggle
              label="Email notifications"
              asserted
              asserted-label="On"
              not-asserted-label="Off"
            >
              <span slot="detail">Confirmed setting</span>
            </wg-toggle>
            <wg-toggle
              label="Activity summaries"
              asserted-label="Enabled"
              not-asserted-label="Disabled"
              requested="asserted"
              request-state="pending"
            >
              <span slot="feedback" role="status">Enabling; confirmed value remains Disabled.</span>
            </wg-toggle>
          </wg-panel>

          <wg-panel purpose="information">
            <span slot="eyebrow">Local view</span>
            <h2 slot="heading">Display density</h2>
            <wg-segmented-control value="compact" aria-label="Display density">
              <wg-segment value="compact">Compact</wg-segment>
              <wg-segment value="comfortable">Comfortable</wg-segment>
              <wg-segment value="spacious" disabled>Spacious</wg-segment>
            </wg-segmented-control>
            <div style="margin-top:var(--wg-space-reference-4)">
              <wg-icon-button label="Refresh display preview" appearance="secondary">
                <wg-icon name="refresh"></wg-icon>
              </wg-icon-button>
              <wg-icon-button label="More display actions">
                <wg-icon name="more"></wg-icon>
              </wg-icon-button>
            </div>
          </wg-panel>

          <wg-panel purpose="information">
            <span slot="eyebrow">Destinations</span>
            <h2 slot="heading">Account</h2>
            <nav aria-label="Account">
              <wg-navigation-rail>
                <a href="#overview" aria-current="page">Overview</a>
                <a href="#activity">Activity</a>
                <a href="#preferences">Preferences</a>
              </wg-navigation-rail>
            </nav>
          </wg-panel>
        </wg-grid>
      </wg-stack>
    </main>
  </wg-theme-provider>`;
}

export const Dark: Story = { render: () => renderControls('wayglass-dark') };
export const Light: Story = { render: () => renderControls('wayglass-light') };
