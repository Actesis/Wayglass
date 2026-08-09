import type { Meta, StoryObj } from '@storybook/web-components-vite';

import { renderTelemetryEnvelope, renderTelemetryWorkspace } from './telemetry-data.fixture.js';

const meta = {
  title: 'Operational Data/Telemetry',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopDarkCompact: Story = {
  render: () =>
    renderTelemetryWorkspace({
      width: 'desktop',
      theme: 'wayglass-dark',
      density: 'compact',
    }),
};

export const DesktopLightComfortable: Story = {
  render: () =>
    renderTelemetryWorkspace({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'comfortable',
    }),
};

export const Phone: Story = {
  render: () =>
    renderTelemetryWorkspace({
      width: 'phone',
      theme: 'wayglass-dark',
      density: 'compact',
    }),
};

export const WallPanel: Story = {
  render: () =>
    renderTelemetryWorkspace({
      width: 'wall',
      theme: 'wayglass-dark',
      density: 'comfortable',
    }),
};

export const ReferenceEnvelope: Story = {
  render: () =>
    renderTelemetryEnvelope({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'compact',
    }),
};
