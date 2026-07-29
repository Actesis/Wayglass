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
  render: () => renderFunctionDeck('wayglass-dark'),
};
