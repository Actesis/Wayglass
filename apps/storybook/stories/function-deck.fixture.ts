import { defineWgTabs } from '@wayglass/elements/tabs';
import type { WgTabChangeDetail } from '@wayglass/elements/tabs';
import { html } from 'lit';

import '../../../examples/shared/function-deck.css';
import {
  getOperationsFunction,
  operationsFunctions,
  renderOperationsFunction,
} from './operations-overview.fixture.js';
import type { OperationsOverviewTheme } from './operations-overview.fixture.js';

defineWgTabs();

function handleFunctionChange(event: CustomEvent<WgTabChangeDetail>): void {
  const status = (event.currentTarget as HTMLElement)
    .closest('.wg-function-deck')
    ?.querySelector<HTMLElement>('[data-function-deck-selection]');
  const functionFixture = getOperationsFunction(event.detail.value);

  if (status) {
    status.textContent = `Selected function: ${functionFixture?.label ?? event.detail.value}`;
  }
}

export function renderFunctionDeck(theme: OperationsOverviewTheme = 'wayglass-dark') {
  return html`
    <div class="wg-function-deck-viewport" data-function-deck-width="desktop">
      <wg-theme-provider theme=${theme} density="compact">
        <wg-canvas width="full">
          <header slot="header" class="wg-overview-header">
            <p class="wg-overview-eyebrow">Focused operational work</p>
            <h1>Function Deck</h1>
            <p>
              One peer function occupies the shared working surface while consequential hidden state
              remains labeled in its selector.
            </p>
          </header>

          <main class="wg-function-deck" aria-label="Focused operational functions">
            <wg-tabs value="access" activation="automatic" @wg-tab-change=${handleFunctionChange}>
              <wg-tab-list aria-label="Operational functions">
                ${operationsFunctions.map(
                  (functionFixture) => html`
                    <wg-tab value=${functionFixture.value}>
                      ${functionFixture.label}
                      <span slot="summary">${functionFixture.selectorSummary}</span>
                    </wg-tab>
                  `,
                )}
              </wg-tab-list>

              ${operationsFunctions.map(
                (functionFixture) => html`
                  <wg-tab-panel value=${functionFixture.value}>
                    <div class="wg-function-deck__surface">
                      ${renderOperationsFunction(functionFixture, 'desktop', 'focused', 'plain')}
                    </div>
                  </wg-tab-panel>
                `,
              )}
            </wg-tabs>

            <p class="wg-function-deck__selection" data-function-deck-selection aria-live="polite">
              Selected function: Access
            </p>
          </main>

          <footer slot="footer" class="wg-overview-footer">
            <span>Local fixture</span>
            <span>Composition: Focused</span>
          </footer>
        </wg-canvas>
      </wg-theme-provider>
    </div>
  `;
}
