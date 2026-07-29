import { defineWgTabs } from '@wayglass/elements/tabs';
import type { WgTabChangeDetail, WgTabs } from '@wayglass/elements/tabs';
import { html } from 'lit';

import '../../../examples/shared/function-deck.css';
import {
  getOperationsFunction,
  operationsFunctions,
  renderOperationsFunction,
} from './operations-overview.fixture.js';
import type { OperationsOverviewTheme } from './operations-overview.fixture.js';

defineWgTabs();

function updateSelectionStatus(deck: Element, value: string): void {
  const status = deck.querySelector<HTMLElement>('[data-function-deck-selection]');
  const functionFixture = getOperationsFunction(value);

  if (status) {
    status.textContent = `Selected function: ${functionFixture?.label ?? value}`;
  }
}

function handleFunctionChange(event: CustomEvent<WgTabChangeDetail>): void {
  const deck = (event.currentTarget as HTMLElement).closest('.wg-function-deck');

  if (deck) {
    updateSelectionStatus(deck, event.detail.value);
  }
}

async function handleOpenCriticalResponse(event: Event): Promise<void> {
  const action = event.currentTarget as HTMLElement;
  const deck = action.closest('.wg-function-deck');
  const tabs = deck?.querySelector<WgTabs>('wg-tabs');
  const value = action.dataset.functionValue;

  if (!deck || !tabs || !value) {
    return;
  }

  tabs.value = value;
  await tabs.updateComplete;
  tabs.focusSelected();
  updateSelectionStatus(deck, value);
}

export function renderFunctionDeck(theme: OperationsOverviewTheme = 'wayglass-dark') {
  const criticalFunction = operationsFunctions.find(
    (functionFixture) => functionFixture.criticalResponse !== undefined,
  );
  const criticalResponse = criticalFunction?.criticalResponse;

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
            ${
              criticalFunction && criticalResponse
                ? html`
                    <aside
                      class="wg-function-deck__critical-response"
                      aria-labelledby="function-deck-critical-response-heading"
                    >
                      <wg-panel purpose="control" emphasis="strong">
                        <h2 id="function-deck-critical-response-heading" slot="heading">
                          ${criticalResponse.heading}
                        </h2>
                        <div class="wg-function-deck__critical-state">
                          <wg-status-indicator
                            label=${criticalFunction.label}
                            condition="critical"
                            activity="pending"
                            size="compact"
                          ></wg-status-indicator>
                          <p>
                            <strong>${criticalResponse.stateSummary}</strong>
                            ${criticalResponse.detail}
                          </p>
                        </div>
                        <wg-button
                          slot="actions"
                          appearance="secondary"
                          data-function-value=${criticalFunction.value}
                          @click=${handleOpenCriticalResponse}
                        >
                          ${criticalResponse.actionLabel}
                        </wg-button>
                      </wg-panel>
                    </aside>
                  `
                : ''
            }

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
