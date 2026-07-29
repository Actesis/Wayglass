import { defineWgCanvas } from '@wayglass/elements/canvas';
import { defineWgTabs } from '@wayglass/elements/tabs';
import type { TabActivation, TabOrientation, WgTabChangeDetail } from '@wayglass/elements/tabs';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import { html } from 'lit';

import { tabsExampleViews } from '../../../examples/shared/tabs-example.js';
import '../../../examples/shared/tabs-example.css';

defineWgThemeProvider();
defineWgCanvas();
defineWgTabs();

export interface TabsFixtureOptions {
  readonly activation: TabActivation;
  readonly disabledValue?: string;
  readonly narrow?: boolean;
  readonly orientation: TabOrientation;
  readonly theme: 'wayglass-dark' | 'wayglass-light';
}

function selectionLabel(value: string): string {
  return tabsExampleViews.find((view) => view.value === value)?.label ?? value;
}

function handleTabChange(event: CustomEvent<WgTabChangeDetail>): void {
  const status = (event.currentTarget as HTMLElement)
    .closest('.wg-tabs-example')
    ?.querySelector<HTMLElement>('[data-tabs-selection]');

  if (status) {
    status.textContent = `Selected view: ${selectionLabel(event.detail.value)}`;
  }
}

export function renderTabsFixture({
  activation,
  disabledValue,
  narrow = false,
  orientation,
  theme,
}: TabsFixtureOptions) {
  const classes = [
    'wg-tabs-example',
    'wg-tabs-example--standalone',
    orientation === 'vertical' ? 'wg-tabs-example--vertical' : '',
    narrow ? 'wg-tabs-example--narrow' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return html`
    <wg-theme-provider theme=${theme} density="compact">
      <wg-canvas width="full">
        <header slot="header" class="wg-tabs-example__header">
          <p class="wg-tabs-example__eyebrow">Production compound elements</p>
          <h1>Workspace views</h1>
          <p>
            Selection changes the visible peer view while summaries preserve useful hidden context.
          </p>
        </header>
        <main class=${classes}>
          <wg-tabs
            value="overview"
            activation=${activation}
            orientation=${orientation}
            @wg-tab-change=${handleTabChange}
          >
            <wg-tab-list aria-label="Workspace views">
              ${tabsExampleViews.map(
                (view) => html`
                  <wg-tab value=${view.value} ?disabled=${view.value === disabledValue}>
                    ${view.label}
                    <span slot="summary">${view.summary}</span>
                  </wg-tab>
                `,
              )}
            </wg-tab-list>
            ${tabsExampleViews.map(
              (view) => html`
                <wg-tab-panel value=${view.value}>
                  <section
                    class="wg-tabs-example__panel"
                    aria-labelledby=${`${view.value}-heading`}
                  >
                    <h2 id=${`${view.value}-heading`}>${view.heading}</h2>
                    <p>${view.description}</p>
                    <dl class="wg-tabs-example__facts">
                      ${view.facts.map(
                        (fact) => html`
                          <div>
                            <dt>${fact.label}</dt>
                            <dd>${fact.value}</dd>
                          </div>
                        `,
                      )}
                    </dl>
                  </section>
                </wg-tab-panel>
              `,
            )}
          </wg-tabs>
          <p class="wg-tabs-example__selection" data-tabs-selection aria-live="polite">
            Selected view: Overview
          </p>
        </main>
      </wg-canvas>
    </wg-theme-provider>
  `;
}
