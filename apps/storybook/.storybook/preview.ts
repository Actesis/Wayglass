import '@wayglass/tokens/tokens.css';
import '@wayglass/themes/themes.css';

import type { Preview } from '@storybook/web-components-vite';

import '../stories/foundations.css';

const preview: Preview = {
  parameters: {
    a11y: {
      test: 'error',
    },
    controls: {
      expanded: true,
    },
    options: {
      storySort: {
        order: ['Foundations', 'Components'],
      },
    },
  },
};

export default preview;
