import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import { defineWgIcon, iconNames } from '@wayglass/icons/icon';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import './icons.css';

defineWgThemeProvider();
defineWgIcon();

const meta = {
  title: 'Foundations/Icons',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function renderCatalog(theme: 'wayglass-dark' | 'wayglass-light') {
  return html`<wg-theme-provider theme=${theme} density="compact">
    <main class="wg-icon-story">
      <div class="wg-icon-story__stack">
        <header>
          <p>Optional reinforcement</p>
          <h1>Generated icon catalog</h1>
          <p>Names, actions, values, and state remain understandable without these glyphs.</p>
        </header>

        <section aria-labelledby="icon-catalog-heading">
          <h2 id="icon-catalog-heading">Semantic sizes</h2>
          <div class="wg-icon-story__catalog">
            ${iconNames.map(
              (name) =>
                html`<figure>
                  <figcaption>${name}</figcaption>
                  <div class="wg-icon-story__row">
                    <wg-icon name=${name} size="compact"></wg-icon>
                    <wg-icon name=${name} size="standard"></wg-icon>
                    <wg-icon name=${name} size="prominent"></wg-icon>
                  </div>
                </figure>`,
            )}
          </div>
        </section>

        <section aria-labelledby="icon-semantics-heading">
          <h2 id="icon-semantics-heading">Accessible-use examples</h2>
          <div class="wg-icon-story__examples">
            <div class="wg-icon-story__example">
              <p><wg-icon name="refresh"></wg-icon> Refresh records</p>
              <p>The adjacent text owns meaning, so the icon is decorative.</p>
            </div>
            <div class="wg-icon-story__example">
              <wg-icon name="menu" label="Navigation menu reference"></wg-icon>
              <p>A named standalone reference exposes one non-focusable image.</p>
            </div>
            <div class="wg-icon-story__example">
              <wg-icon label="Missing icon"></wg-icon>
              <wg-icon name="not-in-catalog" label="Unknown icon"></wg-icon>
              <p>Missing and unknown names render no misleading fallback.</p>
            </div>
            <div class="wg-icon-story__example">
              <button type="button">
                <wg-icon name="close"></wg-icon>
                <span>Close review</span>
              </button>
              <p>The owning native control keeps its visible and accessible name.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  </wg-theme-provider>`;
}

export const Dark: Story = { render: () => renderCatalog('wayglass-dark') };
export const Light: Story = { render: () => renderCatalog('wayglass-light') };
