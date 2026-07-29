import { defineWgButton } from '@wayglass/elements/button';
import { defineWgCanvas } from '@wayglass/elements/canvas';
import { defineWgDivider } from '@wayglass/elements/divider';
import '@wayglass/elements/foundations.css';
import { defineWgSurface } from '@wayglass/elements/surface';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import './foundation-primitives.css';

defineWgThemeProvider();
defineWgCanvas();
defineWgSurface();
defineWgDivider();
defineWgButton();

const meta = {
  title: 'Foundations/Foundation Primitives',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypographyAndUtilities: Story = {
  render: () => html`
    <wg-theme-provider theme="wayglass-dark" density="compact">
      <a class="wg-visually-hidden-until-focus wg-focus-ring" href="#foundation-content">
        Skip to foundation examples
      </a>
      <wg-canvas>
        <main id="foundation-content" class="wg-foundation-catalog">
          <header>
            <p class="wg-type-label wg-foundation-kicker">Native semantics, shared treatment</p>
            <h1 class="wg-type-title">Foundation typography</h1>
            <p class="wg-type-body">
              Classes style the native element without choosing its heading level, role, color, or
              spacing.
            </p>
          </header>
          <section aria-labelledby="type-heading">
            <h2 id="type-heading" class="wg-type-section">Scanning hierarchy</h2>
            <dl class="wg-foundation-type-samples">
              <div>
                <dt class="wg-type-label">Primary value</dt>
                <dd class="wg-type-value-prominent">184 ms</dd>
              </div>
              <div>
                <dt class="wg-type-label">Reserved value width</dt>
                <dd class="wg-type-value">0072</dd>
              </div>
              <div>
                <dt class="wg-type-label">Freshness</dt>
                <dd class="wg-type-metadata">Updated 12 seconds ago</dd>
              </div>
            </dl>
          </section>
          <section aria-labelledby="utility-heading">
            <h2 id="utility-heading" class="wg-type-section">Accessible utilities</h2>
            <p class="wg-type-body">
              The next native button uses the shared focus ring.
              <span class="wg-visually-hidden"
                >Its helper text remains available to assistive technology.</span
              >
            </p>
            <button class="wg-native-action wg-focus-ring" type="button">
              Review native action
            </button>
          </section>
        </main>
      </wg-canvas>
    </wg-theme-provider>
  `,
};

export const SurfacesAndDividers: Story = {
  render: () => html`
    <wg-theme-provider theme="wayglass-light" density="comfortable">
      <wg-canvas>
        <main class="wg-foundation-catalog">
          <header>
            <p class="wg-type-label wg-foundation-kicker">Neutral containment</p>
            <h1 class="wg-type-title">Surfaces and dividers</h1>
            <p class="wg-type-body">
              Tone communicates containment and depth only. It never communicates operational
              condition.
            </p>
          </header>
          <section class="wg-foundation-surfaces" aria-label="Surface tones">
            <wg-surface tone="panel">
              <h2 class="wg-type-section">Panel tone</h2>
              <p>Routine contained context.</p>
            </wg-surface>
            <wg-surface tone="inset" padding="compact">
              <h2 class="wg-type-section">Inset tone</h2>
              <p>Recessed supporting context.</p>
            </wg-surface>
            <wg-surface tone="raised" boundary="strong">
              <h2 class="wg-type-section">Raised tone</h2>
              <p>Strong neutral containment without condition meaning.</p>
            </wg-surface>
          </section>
          <wg-surface tone="panel">
            <section aria-labelledby="divider-heading">
              <h2 id="divider-heading" class="wg-type-section">One information function</h2>
              <p>Dividers organize related groups inside a function.</p>
              <wg-divider></wg-divider>
              <p>They remain weaker than a labeled function boundary.</p>
            </section>
          </wg-surface>
        </main>
      </wg-canvas>
    </wg-theme-provider>
  `,
};
