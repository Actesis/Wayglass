import type { Meta, StoryObj } from '@storybook/web-components-vite';

import { renderScalarDataEnvelope, renderScalarDataWorkspace } from './scalar-data.fixture.js';

const meta = {
  title: 'Operational Data/Scalar Data',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopDarkCompact: Story = {
  render: () =>
    renderScalarDataWorkspace({
      width: 'desktop',
      theme: 'wayglass-dark',
      density: 'compact',
    }),
};

export const DesktopLightComfortable: Story = {
  render: () =>
    renderScalarDataWorkspace({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'comfortable',
    }),
};

export const Phone: Story = {
  render: () =>
    renderScalarDataWorkspace({
      width: 'phone',
      theme: 'wayglass-dark',
      density: 'compact',
    }),
};

export const WallPanel: Story = {
  render: () =>
    renderScalarDataWorkspace({
      width: 'wall',
      theme: 'wayglass-dark',
      density: 'comfortable',
    }),
};

export const ReferenceEnvelope: Story = {
  render: () =>
    renderScalarDataEnvelope({
      width: 'desktop',
      theme: 'wayglass-light',
      density: 'compact',
    }),
};
