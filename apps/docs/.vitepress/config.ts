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
          { text: 'Phase 2C foundation contracts', link: '/foundations/foundation-contracts' },
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
        text: 'Phase 2 selection',
        items: [{ text: 'Tabs', link: '/components/tabs' }],
      },
      {
        text: 'Phase 2 layout',
        items: [{ text: 'Layout contracts', link: '/layout/' }],
      },
      {
        text: 'Architecture',
        items: [
          {
            text: 'ADR 0009: Tabs architecture',
            link: '/architecture/adr/0009-tabs-architecture',
          },
          {
            text: 'ADR 0010: Function Deck composition',
            link: '/architecture/adr/0010-function-deck-composition',
          },
          {
            text: 'ADR 0011: Foundation delivery',
            link: '/architecture/adr/0011-foundation-delivery-model',
          },
          {
            text: 'ADR 0012: Responsive layout',
            link: '/architecture/adr/0012-layout-primitives-and-container-responsiveness',
          },
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
        text: 'Accessibility',
        items: [
          {
            text: 'Phase 1 validation',
            link: '/accessibility/phase-1-validation',
          },
          {
            text: 'Phase 2A tabs validation',
            link: '/accessibility/phase-2a-tabs-validation',
          },
          {
            text: 'Phase 2B Function Deck validation',
            link: '/accessibility/phase-2b-function-deck-validation',
          },
          {
            text: 'Phase 2C foundation validation',
            link: '/accessibility/phase-2c-foundations-validation',
          },
        ],
      },
      {
        text: 'Examples',
        items: [
          {
            text: 'Operations Overview',
            link: '/examples/operations-overview',
          },
          {
            text: 'Framework examples',
            link: '/examples/framework-examples',
          },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/Actesis/Wayglass' }],
  },
});
