import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import type { DensityName, Phase1ThemeName } from '@wayglass/themes';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

defineWgThemeProvider();

const meta = {
  title: 'Components/Theme Provider',
  component: 'wg-theme-provider',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function preview(theme: Phase1ThemeName, density: DensityName) {
  return html`
    <div class="wg-theme-preview-cell">
      <wg-theme-provider theme=${theme} density=${density}>
        <article class="wg-theme-preview" aria-labelledby="${theme}-${density}">
          <header>
            <p class="wg-theme-preview__eyebrow">${density} density</p>
            <h2 id="${theme}-${density}">${theme}</h2>
            <p>
              Theme context preserves value, condition, knowledge, activity, and action meaning.
            </p>
          </header>
          <dl class="wg-theme-preview__states">
            <div>
              <dt>Condition</dt>
              <dd><span class="wg-theme-swatch wg-theme-swatch--positive"></span> Normal</dd>
            </div>
            <div>
              <dt>Knowledge</dt>
              <dd><span class="wg-theme-swatch wg-theme-swatch--stale"></span> Stale</dd>
            </div>
            <div>
              <dt>Boolean value</dt>
              <dd><span class="wg-theme-swatch wg-theme-swatch--asserted"></span> Asserted</dd>
            </div>
          </dl>
          <button class="wg-theme-preview__action" type="button">Example action</button>
        </article>
      </wg-theme-provider>
    </div>
  `;
}

export const DarkAndLight: Story = {
  render: () => html`
    <main class="wg-theme-preview-grid">
      ${preview('wayglass-dark', 'compact')} ${preview('wayglass-light', 'compact')}
    </main>
  `,
};

export const Density: Story = {
  render: () => html`
    <main class="wg-theme-preview-grid">
      ${preview('wayglass-dark', 'compact')} ${preview('wayglass-dark', 'comfortable')}
    </main>
  `,
};

export const NestedContext: Story = {
  render: () => html`
    <wg-theme-provider theme="wayglass-dark" density="comfortable">
      <main class="wg-theme-preview-grid wg-theme-preview-grid--outer">
        <article class="wg-theme-preview" aria-labelledby="outer-theme">
          <h2 id="outer-theme">Dark outer context</h2>
          <p>The nested provider intentionally changes only its descendants.</p>
          <wg-theme-provider theme="wayglass-light" density="compact">
            <section
              class="wg-theme-preview wg-theme-preview--nested"
              aria-labelledby="nested-theme"
            >
              <h3 id="nested-theme">Light nested context</h3>
              <p>Theme and density variables inherit from the nearest provider.</p>
            </section>
          </wg-theme-provider>
        </article>
      </main>
    </wg-theme-provider>
  `,
};

export const SystemSelection: Story = {
  render: () => html`
    <wg-theme-provider theme="system" density="compact">
      <main class="wg-theme-preview-grid wg-theme-preview-grid--outer">
        <article class="wg-theme-preview" aria-labelledby="system-theme">
          <p class="wg-theme-preview__eyebrow">System preference</p>
          <h2 id="system-theme">Resolved synchronously</h2>
          <p>Change your browser color preference to exercise the live theme context.</p>
        </article>
      </main>
    </wg-theme-provider>
  `,
};
