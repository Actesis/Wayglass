import type { Meta, StoryObj } from '@storybook/web-components-vite';

import {
  renderCompositionFeedback,
  renderCompositionNoMatches,
  renderCompositionWorkspace,
} from './composition-bars.fixture.js';

const meta = {
  title: 'Operational Data/Filter and Command Bars',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopDarkCompact: Story = {
  render: () =>
    renderCompositionWorkspace({
      width: 'desktop',
      theme: 'wayglass-dark',
      density: 'compact',
    }),
};

export const DesktopLightComfortable: Story = {
  render: () =>
    renderCompositionWorkspace({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'comfortable',
    }),
};

export const Phone: Story = {
  render: () =>
    renderCompositionWorkspace({
      width: 'phone',
      theme: 'wayglass-dark',
      density: 'compact',
    }),
};

export const WallPanel: Story = {
  render: () =>
    renderCompositionWorkspace({
      width: 'wall',
      theme: 'wayglass-dark',
      density: 'comfortable',
    }),
};

export const PendingFailureAndRecovery: Story = {
  render: () =>
    renderCompositionFeedback({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'comfortable',
    }),
};

export const NoMatchingResults: Story = {
  render: () =>
    renderCompositionNoMatches({
      width: 'desktop',
      theme: 'wayglass-dark',
      density: 'compact',
    }),
};
