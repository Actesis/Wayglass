import type { Meta, StoryObj } from '@storybook/web-components-vite';

import {
  renderEventLogEnvelope,
  renderTemporalFeedback,
  renderTemporalWorkspace,
  renderTimelineEnvelope,
} from './temporal-data.fixture.js';

const meta = {
  title: 'Operational Data/Temporal Collections',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopDarkCompact: Story = {
  render: () =>
    renderTemporalWorkspace({
      width: 'desktop',
      theme: 'wayglass-dark',
      density: 'compact',
    }),
};

export const DesktopLightComfortable: Story = {
  render: () =>
    renderTemporalWorkspace({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'comfortable',
    }),
};

export const Phone: Story = {
  render: () =>
    renderTemporalWorkspace({
      width: 'phone',
      theme: 'wayglass-dark',
      density: 'compact',
    }),
};

export const WallPanel: Story = {
  render: () =>
    renderTemporalWorkspace({
      width: 'wall',
      theme: 'wayglass-dark',
      density: 'comfortable',
    }),
};

export const FeedbackStates: Story = {
  render: () =>
    renderTemporalFeedback({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'comfortable',
    }),
};

export const TimelineReferenceEnvelope: Story = {
  render: () =>
    renderTimelineEnvelope({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'compact',
    }),
};

export const EventLogReferenceEnvelope: Story = {
  render: () =>
    renderEventLogEnvelope({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'compact',
    }),
};
