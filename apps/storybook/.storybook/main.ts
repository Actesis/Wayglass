import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  core: {
    // Storybook's project.json embeds a build timestamp, so it cannot belong to a deterministic artifact.
    disableProjectJson: true,
  },
};

export default config;
