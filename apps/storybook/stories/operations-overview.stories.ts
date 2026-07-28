import type { Meta, StoryObj } from '@storybook/web-components-vite';

import {
  renderOperationsOverview,
  renderOperationsStateCoverage,
} from './operations-overview.fixture.js';

const meta = {
  title: 'Examples/Operations Overview',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopDark: Story = {
  render: () => renderOperationsOverview({ width: 'desktop', theme: 'wayglass-dark' }),
};

export const DesktopLight: Story = {
  render: () => renderOperationsOverview({ width: 'desktop', theme: 'wayglass-light' }),
};

export const Phone: Story = {
  render: () => renderOperationsOverview({ width: 'phone', theme: 'wayglass-dark' }),
};

export const WallPanel: Story = {
  render: () => renderOperationsOverview({ width: 'wall', theme: 'wayglass-dark' }),
};

export const RequiredEdgeStates: Story = {
  render: () => renderOperationsStateCoverage('wayglass-light'),
};
