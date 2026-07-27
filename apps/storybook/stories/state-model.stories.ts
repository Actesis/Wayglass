import { activities, conditions, knowledgeStates } from '@wayglass/core';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta = {
  title: 'Foundations/Known State',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const StateAxes: Story = {
  render: () => html`
    <main class="wg-foundation-story">
      <h1>Known-state axes</h1>
      <p>Condition, knowledge, and activity remain independent.</p>
      <table>
        <thead>
          <tr>
            <th scope="col">Axis</th>
            <th scope="col">Values</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Condition</th>
            <td>${conditions.join(', ')}</td>
          </tr>
          <tr>
            <th scope="row">Knowledge</th>
            <td>${knowledgeStates.join(', ')}</td>
          </tr>
          <tr>
            <th scope="row">Activity</th>
            <td>${activities.join(', ')}</td>
          </tr>
        </tbody>
      </table>
    </main>
  `,
};
