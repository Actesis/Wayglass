import '@wayglass/elements/forms.css';

import {
  defineWgCheckbox,
  defineWgFieldLabel,
  defineWgFieldMessage,
  defineWgFormGroup,
  defineWgGrid,
  defineWgNumberField,
  defineWgPanel,
  defineWgRadio,
  defineWgSelect,
  defineWgSlider,
  defineWgStack,
  defineWgTextField,
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
defineWgTextField();
defineWgNumberField();
defineWgSelect();
defineWgCheckbox();
defineWgRadio();
defineWgSlider();

const meta = {
  title: 'Forms/Native controls',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function renderControls(theme: 'wayglass-dark' | 'wayglass-light') {
  return html`<wg-theme-provider theme=${theme} density="comfortable">
    <main
      style="min-height:100vh;box-sizing:border-box;padding:var(--wg-space-reference-6);color:var(--wg-color-semantic-text-primary);background:var(--wg-color-semantic-surface-canvas);font-family:var(--wg-typography-family-body)"
    >
      <wg-stack space="function">
        <header style="max-width:68ch">
          <p style="margin:0;color:var(--wg-color-semantic-text-secondary)">Phase 2D-E</p>
          <h1 style="margin:var(--wg-space-reference-1) 0 0">Styled native form controls</h1>
          <p>
            Wayglass supplies the visual shell. Native controls retain values, focus, events,
            validation, autofill, and platform interaction.
          </p>
        </header>

        <form @submit=${(event: SubmitEvent) => event.preventDefault()}>
          <wg-grid minimum="standard" space="function">
            <wg-panel purpose="control">
              <span slot="eyebrow">Identity</span>
              <h2 slot="heading">Account details</h2>
              <wg-stack space="section">
                <wg-form-group>
                  <label for="control-email"><wg-field-label>Email address</wg-field-label></label>
                  <wg-text-field>
                    <input
                      id="control-email"
                      name="email"
                      type="email"
                      autocomplete="email"
                      placeholder="name@example.com"
                    />
                  </wg-text-field>
                  <wg-field-message>Used for account recovery.</wg-field-message>
                </wg-form-group>
                <wg-form-group>
                  <label for="control-count"><wg-field-label>Team size</wg-field-label></label>
                  <wg-number-field>
                    <input
                      id="control-count"
                      name="count"
                      type="number"
                      min="1"
                      max="50"
                      value="8"
                    />
                  </wg-number-field>
                </wg-form-group>
                <wg-form-group>
                  <label for="control-region"><wg-field-label>Region</wg-field-label></label>
                  <wg-select>
                    <select id="control-region" name="region">
                      <option>North America</option>
                      <option>Europe</option>
                      <option>Asia Pacific</option>
                    </select>
                  </wg-select>
                </wg-form-group>
              </wg-stack>
            </wg-panel>

            <wg-panel purpose="control">
              <span slot="eyebrow">Preferences</span>
              <h2 slot="heading">Notifications</h2>
              <wg-stack space="section">
                <wg-checkbox>
                  <input id="control-updates" name="updates" type="checkbox" checked />
                  <label for="control-updates">Send service updates</label>
                </wg-checkbox>
                <fieldset style="min-inline-size:0;margin:0">
                  <legend><wg-field-label>Delivery schedule</wg-field-label></legend>
                  <wg-radio>
                    <input id="schedule-daily" name="schedule" type="radio" value="daily" checked />
                    <label for="schedule-daily">Daily digest</label>
                  </wg-radio>
                  <wg-radio>
                    <input id="schedule-weekly" name="schedule" type="radio" value="weekly" />
                    <label for="schedule-weekly">Weekly digest</label>
                  </wg-radio>
                </fieldset>
                <wg-form-group>
                  <label for="control-threshold">
                    <wg-field-label>Alert threshold: 70 percent</wg-field-label>
                  </label>
                  <wg-slider>
                    <input
                      id="control-threshold"
                      name="threshold"
                      type="range"
                      min="0"
                      max="100"
                      value="70"
                    />
                  </wg-slider>
                </wg-form-group>
              </wg-stack>
            </wg-panel>

            <wg-panel purpose="control">
              <span slot="eyebrow">State distinctions</span>
              <h2 slot="heading">Review states</h2>
              <wg-stack space="section">
                <wg-form-group>
                  <label for="control-readonly"><wg-field-label>Account ID</wg-field-label></label>
                  <wg-text-field>
                    <input id="control-readonly" value="AC-2048" readonly />
                  </wg-text-field>
                </wg-form-group>
                <wg-form-group>
                  <label for="control-invalid"
                    ><wg-field-label>Recovery email</wg-field-label></label
                  >
                  <wg-text-field>
                    <input id="control-invalid" value="name@example" aria-invalid="true" />
                  </wg-text-field>
                  <wg-field-message kind="error">Enter a complete email address.</wg-field-message>
                </wg-form-group>
                <wg-checkbox>
                  <input id="control-disabled" type="checkbox" disabled />
                  <label for="control-disabled">Unavailable choice</label>
                </wg-checkbox>
              </wg-stack>
            </wg-panel>
          </wg-grid>

          <div
            style="display:flex;flex-wrap:wrap;gap:var(--wg-space-reference-3);margin-block-start:var(--wg-space-reference-6)"
          >
            <button class="wg-form-action" type="submit">Save profile</button>
            <button class="wg-form-action wg-form-action--quiet" type="reset">Reset</button>
          </div>
        </form>
      </wg-stack>
    </main>
  </wg-theme-provider>`;
}

export const Dark: Story = { render: () => renderControls('wayglass-dark') };
export const Light: Story = { render: () => renderControls('wayglass-light') };
