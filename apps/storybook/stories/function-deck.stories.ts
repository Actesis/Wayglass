import type { Meta, StoryObj } from '@storybook/web-components-vite';

import { renderFunctionDeck } from './function-deck.fixture.js';

const meta = {
  title: 'Examples/Function Deck',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopDark: Story = {
  render: () => renderFunctionDeck({ width: 'desktop', theme: 'wayglass-dark' }),
};

export const DesktopLight: Story = {
  render: () => renderFunctionDeck({ width: 'desktop', theme: 'wayglass-light' }),
};

export const Phone: Story = {
  render: () => renderFunctionDeck({ width: 'phone', theme: 'wayglass-dark' }),
};

export const WallDisplay: Story = {
  render: () => renderFunctionDeck({ width: 'wall', theme: 'wayglass-dark' }),
};
