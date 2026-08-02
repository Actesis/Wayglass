import '@wayglass/elements/forms.css';

import {
  defineWgFieldLabel,
  defineWgFieldMessage,
  defineWgFormGroup,
  defineWgGrid,
  defineWgPanel,
  defineWgStack,
  defineWgThemeProvider,
} from '@wayglass/elements';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

defineWgThemeProvider();
defineWgStack();
defineWgGrid();
defineWgPanel();
defineWgFieldLabel();
defineWgFieldMessage();
defineWgFormGroup();

const meta = {
  title: 'Forms/Form foundation',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const nativeControlStyle = [
  'min-height:var(--wg-component-form-size-control-minimum)',
  'box-sizing:border-box',
  'inline-size:100%',
  'padding:var(--wg-space-reference-2) var(--wg-space-reference-3)',
  'border:var(--wg-border-width-standard) solid var(--wg-component-form-color-control-border)',
  'border-radius:var(--wg-component-form-radius-control)',
  'color:var(--wg-component-form-color-control-text)',
  'background:var(--wg-component-form-color-control-background)',
  'font:inherit',
].join(';');

function renderFoundation(theme: 'wayglass-dark' | 'wayglass-light') {
  return html`<wg-theme-provider theme=${theme} density="comfortable">
    <main
      style="min-height:100vh;box-sizing:border-box;padding:var(--wg-space-reference-6);color:var(--wg-color-semantic-text-primary);background:var(--wg-color-semantic-surface-canvas);font-family:var(--wg-typography-family-body)"
    >
      <wg-stack space="function">
        <header style="max-width:65ch">
          <p style="margin:0;color:var(--wg-color-semantic-text-secondary)">Phase 2D-D</p>
          <h1 style="margin:var(--wg-space-reference-1) 0 0">
            Native forms, explicit relationships
          </h1>
          <p>
            These primitives establish label, message, grouping, and native-action hierarchy.
            Specific native-control presentations arrive in Phase 2D-E.
          </p>
        </header>

        <form style="max-width:64rem" @submit=${(event: SubmitEvent) => event.preventDefault()}>
          <wg-grid minimum="standard" space="function">
            <wg-panel purpose="control">
              <span slot="eyebrow">Persistent help</span>
              <h2 slot="heading">Account identity</h2>
              <wg-form-group>
                <label for="story-email">
                  <wg-field-label>
                    Email address
                    <span slot="requirement">Required</span>
                    <span slot="detail">Used to identify the account owner</span>
                  </wg-field-label>
                </label>
                <input
                  id="story-email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  aria-describedby="story-email-help"
                  style=${nativeControlStyle}
                />
                <wg-field-message id="story-email-help">
                  Account notices use this address. It is not published.
                </wg-field-message>
              </wg-form-group>
            </wg-panel>

            <wg-panel purpose="control">
              <span slot="eyebrow">Current input error</span>
              <h2 slot="heading">Recovery contact</h2>
              <wg-form-group>
                <label for="story-recovery">
                  <wg-field-label>
                    Recovery email
                    <span slot="requirement">Required</span>
                  </wg-field-label>
                </label>
                <input
                  id="story-recovery"
                  name="recovery"
                  type="email"
                  value="matt@example"
                  required
                  aria-invalid="true"
                  aria-describedby="story-recovery-error"
                  style="${nativeControlStyle};border-color:var(--wg-component-form-color-control-border-invalid)"
                />
                <wg-field-message id="story-recovery-error" kind="error">
                  Enter a complete email address, such as name@example.com.
                </wg-field-message>
              </wg-form-group>
            </wg-panel>

            <wg-panel purpose="control">
              <span slot="eyebrow">Native semantic group</span>
              <h2 slot="heading">Contact route</h2>
              <wg-form-group>
                <fieldset
                  aria-describedby="story-contact-help"
                  style="min-inline-size:0;margin:0;padding:var(--wg-space-reference-3);border:var(--wg-border-width-standard) solid var(--wg-color-semantic-border-strong);border-radius:var(--wg-component-form-radius-control)"
                >
                  <legend>
                    <wg-field-label>
                      Preferred contact method
                      <span slot="requirement">Required</span>
                    </wg-field-label>
                  </legend>
                  <wg-stack space="related">
                    <label
                      ><input type="radio" name="contact" value="email" required /> Email</label
                    >
                    <label><input type="radio" name="contact" value="phone" /> Phone</label>
                  </wg-stack>
                </fieldset>
                <wg-field-message id="story-contact-help">
                  Choose the route you check most often.
                </wg-field-message>
              </wg-form-group>
            </wg-panel>
          </wg-grid>

          <div
            style="display:flex;flex-wrap:wrap;gap:var(--wg-space-reference-3);margin-block-start:var(--wg-space-reference-6)"
          >
            <button class="wg-form-action" type="submit" name="intent" value="save">
              Save account profile
            </button>
            <button class="wg-form-action wg-form-action--quiet" type="reset">Reset changes</button>
          </div>
        </form>
      </wg-stack>
    </main>
  </wg-theme-provider>`;
}

export const Dark: Story = { render: () => renderFoundation('wayglass-dark') };
export const Light: Story = { render: () => renderFoundation('wayglass-light') };
