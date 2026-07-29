import type { Meta, StoryObj } from '@storybook/web-components-vite';

import { renderTabsFixture } from './tabs.fixture.js';

const meta = {
  title: 'Components/Tabs',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AutomaticDark: Story = {
  render: () =>
    renderTabsFixture({
      activation: 'automatic',
      orientation: 'horizontal',
      theme: 'wayglass-dark',
    }),
};

export const AutomaticLight: Story = {
  render: () =>
    renderTabsFixture({
      activation: 'automatic',
      orientation: 'horizontal',
      theme: 'wayglass-light',
    }),
};

export const ManualVertical: Story = {
  render: () =>
    renderTabsFixture({
      activation: 'manual',
      orientation: 'vertical',
      theme: 'wayglass-dark',
    }),
};

export const Narrow: Story = {
  render: () =>
    renderTabsFixture({
      activation: 'automatic',
      narrow: true,
      orientation: 'horizontal',
      theme: 'wayglass-dark',
    }),
};

export const DisabledSelector: Story = {
  render: () =>
    renderTabsFixture({
      activation: 'automatic',
      disabledValue: 'activity',
      orientation: 'horizontal',
      theme: 'wayglass-light',
    }),
};
