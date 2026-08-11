import type { Meta, StoryObj } from '@storybook/web-components-vite';

import { mountOperationalActivity } from './operational-activity.fixture.js';

const meta = {
  title: 'Examples/Operational Activity',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const OverviewDesktopDark: Story = {
  render: () => mountOperationalActivity(),
};

export const FocusedDesktopLight: Story = {
  render: () =>
    mountOperationalActivity({
      composition: 'focused',
      theme: 'wayglass-light',
      density: 'comfortable',
      selectedFunction: 'processing',
    }),
};

export const OverviewPhone: Story = {
  render: () => mountOperationalActivity({ width: 'phone' }),
};

export const OverviewWall: Story = {
  render: () => mountOperationalActivity({ width: 'wall', density: 'comfortable' }),
};

export const InitialLoading: Story = {
  render: () => mountOperationalActivity({ scenario: 'initial-loading' }),
};

export const RetainedRefresh: Story = {
  render: () => mountOperationalActivity({ scenario: 'retained-refresh' }),
};

export const StalePartial: Story = {
  render: () => mountOperationalActivity({ scenario: 'stale-partial' }),
};

export const Unavailable: Story = {
  render: () => mountOperationalActivity({ scenario: 'unavailable' }),
};

export const FilteredEmpty: Story = {
  render: () => mountOperationalActivity({ scenario: 'filtered-empty' }),
};

export const FailedRequest: Story = {
  render: () =>
    mountOperationalActivity({
      composition: 'focused',
      scenario: 'failed-request',
      selectedFunction: 'processing',
    }),
};

export const Recovered: Story = {
  render: () => mountOperationalActivity({ scenario: 'recovered' }),
};

export const LiveUpdate: Story = {
  render: () => mountOperationalActivity({ scenario: 'live-update' }),
};
