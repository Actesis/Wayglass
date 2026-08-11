import type { Meta, StoryObj } from '@storybook/web-components-vite';

import {
  renderDataTableEnvelope,
  renderDataTableStates,
  renderDataTableWorkspace,
} from './data-table.fixture.js';

const meta = {
  title: 'Operational Data/Data Table',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopDarkCompact: Story = {
  render: () =>
    renderDataTableWorkspace({
      width: 'desktop',
      theme: 'wayglass-dark',
      density: 'compact',
    }),
};

export const DesktopLightComfortable: Story = {
  render: () =>
    renderDataTableWorkspace({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'comfortable',
    }),
};

export const Phone: Story = {
  render: () =>
    renderDataTableWorkspace({
      width: 'phone',
      theme: 'wayglass-dark',
      density: 'compact',
    }),
};

export const WallPanel: Story = {
  render: () =>
    renderDataTableWorkspace({
      width: 'wall',
      theme: 'wayglass-dark',
      density: 'comfortable',
    }),
};

export const DataStates: Story = {
  render: () =>
    renderDataTableStates({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'comfortable',
    }),
};

export const ReferenceEnvelope: Story = {
  render: () =>
    renderDataTableEnvelope({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'compact',
    }),
};
