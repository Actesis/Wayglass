import type { Meta, StoryObj } from '@storybook/web-components-vite';

import {
  renderStatusListEnvelope,
  renderStatusListFeedback,
  renderStatusListWorkspace,
} from './status-list.fixture.js';

const meta = {
  title: 'Operational Data/Status List',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopDarkCompact: Story = {
  render: () =>
    renderStatusListWorkspace({
      width: 'desktop',
      theme: 'wayglass-dark',
      density: 'compact',
    }),
};

export const DesktopLightComfortable: Story = {
  render: () =>
    renderStatusListWorkspace({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'comfortable',
    }),
};

export const Phone: Story = {
  render: () =>
    renderStatusListWorkspace({
      width: 'phone',
      theme: 'wayglass-dark',
      density: 'compact',
    }),
};

export const WallPanel: Story = {
  render: () =>
    renderStatusListWorkspace({
      width: 'wall',
      theme: 'wayglass-dark',
      density: 'comfortable',
    }),
};

export const FeedbackStates: Story = {
  render: () =>
    renderStatusListFeedback({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'comfortable',
    }),
};

export const ReferenceEnvelope: Story = {
  render: () =>
    renderStatusListEnvelope({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'compact',
    }),
};
