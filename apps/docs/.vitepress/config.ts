import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Wayglass',
  description: 'A design language for operational awareness.',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: 'Foundations', link: '/foundations/' },
      { text: 'Components', link: '/components/' },
      { text: 'Patterns', link: '/patterns/function-deck' },
      { text: 'Examples', link: '/examples/operations-overview' },
      { text: 'Repository', link: 'https://github.com/Actesis/Wayglass' },
    ],
    sidebar: [
      {
        text: 'Foundations',
        items: [
          { text: 'Introduction', link: '/foundations/' },
          { text: 'Semantic model', link: '/foundations/state-model' },
          { text: 'Visual foundations', link: '/foundations/visual-language' },
          { text: 'Design tokens', link: '/foundations/tokens' },
        ],
      },
      {
        text: 'Phase 1 components',
        items: [
          { text: 'Overview', link: '/components/' },
          { text: 'Theme provider', link: '/components/theme-provider' },
          { text: 'Canvas', link: '/components/canvas' },
          { text: 'Rail', link: '/components/rail' },
          { text: 'Elbow', link: '/components/elbow' },
          { text: 'Panel', link: '/components/panel' },
          { text: 'Button', link: '/components/button' },
          { text: 'Status indicator', link: '/components/status-indicator' },
          { text: 'Boolean value', link: '/components/boolean-value' },
          { text: 'Metric', link: '/components/metric' },
          { text: 'Value tile', link: '/components/value-tile' },
        ],
      },
      {
        text: 'Patterns',
        items: [{ text: 'Function Deck', link: '/patterns/function-deck' }],
      },
      {
        text: 'Frameworks',
        items: [{ text: 'React', link: '/frameworks/react' }],
      },
      {
        text: 'Examples',
        items: [
          {
            text: 'Operations Overview',
            link: '/examples/operations-overview',
          },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/Actesis/Wayglass' }],
  },
});
