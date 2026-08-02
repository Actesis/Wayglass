import {
  defineWgButton,
  defineWgGrid,
  defineWgPanel,
  defineWgStack,
  defineWgThemeProvider,
  defineWgToastRegion,
  type FeedbackCondition,
} from '@wayglass/elements';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

defineWgThemeProvider();
defineWgStack();
defineWgGrid();
defineWgPanel();
defineWgButton();
defineWgToastRegion();

const meta = {
  title: 'Feedback/Transient',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

let toastSequence = 0;

function addToast(
  event: Event,
  options: {
    condition: FeedbackCondition;
    message: string;
    detail: string;
    dedupeKey: string;
  },
): void {
  const provider = (event.currentTarget as Element).closest('wg-theme-provider');
  const region = provider?.querySelector('wg-toast-region');
  if (!region) return;

  const toast = document.createElement('wg-toast');
  const id = `storybook-toast-${++toastSequence}`;
  toast.setAttribute('toast-id', id);
  toast.setAttribute('dedupe-key', options.dedupeKey);
  toast.setAttribute('condition', options.condition);
  toast.setAttribute('announcement', 'polite');
  toast.setAttribute('duration', '0');
  toast.setAttribute('close-label', `Dismiss ${options.dedupeKey} notification`);
  toast.setAttribute('open', '');
  toast.append(options.message);
  const detail = document.createElement('span');
  detail.slot = 'detail';
  detail.textContent = options.detail;
  toast.append(detail);
  region.append(toast);
}

function renderTransientFeedback(theme: 'wayglass-dark' | 'wayglass-light') {
  return html`<wg-theme-provider theme=${theme} density="compact">
    <main
      style="min-height:100vh;box-sizing:border-box;padding:var(--wg-space-reference-6);color:var(--wg-color-semantic-text-primary);background:var(--wg-color-semantic-surface-canvas);font-family:var(--wg-typography-family-body)"
    >
      <wg-stack space="function">
        <header style="max-width:68ch">
          <p style="margin:0;color:var(--wg-color-semantic-text-secondary)">Phase 2E-C</p>
          <h1 style="margin:var(--wg-space-reference-1) 0 0">Transient acknowledgements</h1>
          <p>
            Brief outcomes stay subordinate to the function that owns their durable result or
            recovery path.
          </p>
        </header>

        <wg-grid minimum="standard" space="function">
          <wg-panel purpose="control">
            <span slot="eyebrow">Account function</span>
            <h2 slot="heading">Preferences</h2>
            <p>The current contact preferences remain visible and editable in this function.</p>
            <wg-button
              appearance="primary"
              @click=${(event: Event) =>
                addToast(event, {
                  condition: 'positive',
                  message: 'Contact preferences saved.',
                  detail: 'The durable values remain available in Preferences.',
                  dedupeKey: 'preferences-saved',
                })}
            >
              Save preferences
            </wg-button>
          </wg-panel>

          <wg-panel purpose="information">
            <span slot="eyebrow">Records function</span>
            <h2 slot="heading">Export history</h2>
            <p>
              Completed exports and skipped-row reports remain available here after a toast ends.
            </p>
            <wg-button
              appearance="secondary"
              @click=${(event: Event) =>
                addToast(event, {
                  condition: 'caution',
                  message: 'Export completed with three skipped rows.',
                  detail: 'The durable report identifies each row and its correction path.',
                  dedupeKey: 'export-result',
                })}
            >
              Simulate export result
            </wg-button>
          </wg-panel>
        </wg-grid>
      </wg-stack>
    </main>

    <wg-toast-region placement="block-end-end" max-visible="3" paused>
      <wg-toast
        toast-id="fixture-saved"
        dedupe-key="preferences-saved"
        condition="positive"
        announcement="polite"
        duration="0"
        close-label="Dismiss saved-preferences notification"
        open
      >
        Contact preferences saved.
        <span slot="detail">The durable values remain available in Preferences.</span>
        <wg-button slot="actions" appearance="secondary">View preferences</wg-button>
      </wg-toast>
    </wg-toast-region>
  </wg-theme-provider>`;
}

export const Dark: Story = { render: () => renderTransientFeedback('wayglass-dark') };
export const Light: Story = { render: () => renderTransientFeedback('wayglass-light') };
