import {
  defineWgAlert,
  defineWgButton,
  defineWgConfirmationDialog,
  defineWgGrid,
  defineWgPanel,
  defineWgStack,
  defineWgThemeProvider,
  type WgConfirmationDialog,
} from '@wayglass/elements';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

defineWgThemeProvider();
defineWgStack();
defineWgGrid();
defineWgPanel();
defineWgButton();
defineWgAlert();
defineWgConfirmationDialog();

const meta = {
  title: 'Feedback/Confirmation and friction',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function showDialog(event: Event, selector: string, fallbackSelector?: string): void {
  const invoker = event.currentTarget as HTMLElement;
  const provider = invoker.closest('wg-theme-provider');
  const dialog = provider?.querySelector<WgConfirmationDialog>(selector);
  const fallbackFocus = fallbackSelector
    ? provider?.querySelector<HTMLElement>(fallbackSelector)
    : undefined;
  dialog?.show(fallbackFocus ? { invoker, fallbackFocus } : { invoker });
}

function showOutcome(event: Event, selector: string, message: string): void {
  const provider = (event.currentTarget as Element).closest('wg-theme-provider');
  const outcome = provider?.querySelector<HTMLElement>(selector);
  if (!outcome) return;
  outcome.hidden = false;
  const messageNode = outcome.querySelector('[data-outcome-message]');
  if (messageNode) messageNode.textContent = message;
}

function applyDirectPreference(event: Event): void {
  const button = event.currentTarget as HTMLElement;
  const provider = button.closest('wg-theme-provider');
  const outcome = provider?.querySelector<HTMLElement>('#direct-outcome');
  if (!outcome) return;
  outcome.textContent = 'Compact summaries enabled. This reversible preference needed no dialog.';
}

function renderConfirmation(theme: 'wayglass-dark' | 'wayglass-light') {
  return html`<wg-theme-provider theme=${theme} density="compact">
    <main
      style="min-height:100vh;box-sizing:border-box;padding:var(--wg-space-reference-6);color:var(--wg-color-semantic-text-primary);background:var(--wg-color-semantic-surface-canvas);font-family:var(--wg-typography-family-body)"
    >
      <wg-stack space="function">
        <header style="max-width:70ch">
          <p style="margin:0;color:var(--wg-color-semantic-text-secondary)">Phase 2E-D</p>
          <h1 style="margin:var(--wg-space-reference-1) 0 0">
            Confirmation and proportional friction
          </h1>
          <p>
            The consequence and recovery model choose the interaction. Critical color and
            interruptive semantics remain independent decisions.
          </p>
        </header>

        <wg-grid minimum="standard" space="function">
          <wg-panel purpose="information">
            <span slot="eyebrow">Direct action</span>
            <h2 slot="heading">Display preferences</h2>
            <wg-stack space="section">
              <p style="margin:0">
                Reversible, bounded changes happen immediately and leave their result visible.
              </p>
              <wg-button appearance="secondary" @click=${applyDirectPreference}>
                Use compact summaries
              </wg-button>
              <p id="direct-outcome" style="margin:0;color:var(--wg-color-semantic-text-secondary)">
                Comfortable summaries currently enabled.
              </p>
            </wg-stack>
          </wg-panel>

          <wg-panel purpose="control">
            <span slot="eyebrow">Modal confirmation</span>
            <h2 slot="heading">Shared record source</h2>
            <wg-stack space="section">
              <p style="margin:0">
                Northwind records are connected. Disconnecting stops current updates for every
                operator while preserving stored records.
              </p>
              <wg-button
                appearance="critical"
                @click=${(event: Event) =>
                  showDialog(event, '#disconnect-confirmation', '[data-source-fallback]')}
              >
                Disconnect source
              </wg-button>
              <wg-button appearance="secondary" data-source-fallback>Manage sources</wg-button>
              <div id="disconnect-outcome" hidden>
                <wg-alert condition="caution" label="Connection outcome">
                  <p data-outcome-message></p>
                </wg-alert>
              </div>
            </wg-stack>
          </wg-panel>

          <wg-panel purpose="control">
            <span slot="eyebrow">Interruptive decision</span>
            <h2 slot="heading">Delivery route conflict</h2>
            <wg-stack space="section">
              <p style="margin:0">
                A newly detected route conflict requires a decision before the current delivery can
                continue. Ending neither route is inherently destructive.
              </p>
              <wg-button
                appearance="primary"
                @click=${(event: Event) => showDialog(event, '#route-confirmation')}
              >
                Review route conflict
              </wg-button>
              <div id="route-outcome" hidden>
                <wg-alert condition="neutral" label="Route outcome">
                  <p data-outcome-message></p>
                </wg-alert>
              </div>
            </wg-stack>
          </wg-panel>

          <wg-panel purpose="information">
            <span slot="eyebrow">Stronger verification</span>
            <h2 slot="heading">Credential rotation</h2>
            <p>
              High-impact identity and authorization work uses an application-owned verification
              flow. A generic confirmation dialog alone would not provide sufficient evidence.
            </p>
          </wg-panel>
        </wg-grid>
      </wg-stack>
    </main>

    <wg-confirmation-dialog
      id="disconnect-confirmation"
      dialog-id="disconnect-northwind"
      action-label="Disconnect Northwind records"
      cancel-label="Keep connected"
      action-appearance="critical"
      initial-focus="cancel"
      @wg-confirmation-action=${(event: Event) =>
        showOutcome(
          event,
          '#disconnect-outcome',
          'Disconnect request accepted. Pending and recovery now belong to this function.',
        )}
    >
      <h2 slot="heading">Disconnect Northwind records?</h2>
      <p>Current updates will stop for every operator. Stored records will remain available.</p>
    </wg-confirmation-dialog>

    <wg-confirmation-dialog
      id="route-confirmation"
      dialog-id="choose-delivery-route"
      action-label="Use verified backup route"
      cancel-label="Pause delivery"
      action-appearance="primary"
      attention="interruptive"
      initial-focus="heading"
      @wg-confirmation-action=${(event: Event) =>
        showOutcome(
          event,
          '#route-outcome',
          'The verified backup route is now the application-owned selection.',
        )}
    >
      <h2 slot="heading">Use the verified backup route?</h2>
      <p>
        The primary route stopped responding. Delivery remains paused until a route is selected.
      </p>
    </wg-confirmation-dialog>
  </wg-theme-provider>`;
}

export const Dark: Story = { render: () => renderConfirmation('wayglass-dark') };
export const Light: Story = { render: () => renderConfirmation('wayglass-light') };
