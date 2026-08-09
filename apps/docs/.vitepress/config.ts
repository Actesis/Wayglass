import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Wayglass',
  description: 'A design language for operational awareness.',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: 'Phase 3', link: '/phase-3' },
      { text: 'Phase 2', link: '/phase-2' },
      { text: 'Foundations', link: '/foundations/' },
      { text: 'Components', link: '/components/' },
      { text: 'Patterns', link: '/patterns/function-deck' },
      { text: 'Examples', link: '/examples/operations-overview' },
      { text: 'Repository', link: 'https://github.com/Actesis/Wayglass' },
    ],
    sidebar: [
      {
        text: 'System',
        items: [
          { text: 'Phase 3 delivery plan', link: '/phase-3' },
          { text: 'Phase 2 delivery map', link: '/phase-2' },
          { text: 'Phase 2 roadmap disposition', link: '/phase-2-roadmap-disposition' },
        ],
      },
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
        text: 'Phase 3 data',
        items: [
          {
            text: 'Operational-data ownership',
            link: '/data/operational-data',
          },
          {
            text: 'Metrics and key-values',
            link: '/data/metrics-and-key-values',
          },
          {
            text: 'Telemetry strip',
            link: '/data/telemetry-strip',
          },
        ],
      },
      {
        text: 'Phase 2 layout',
        items: [{ text: 'Layout contracts', link: '/layout/layout-contracts' }],
      },
      {
        text: 'Phase 2 media',
        items: [
          { text: 'Media-content contract', link: '/media/media-content' },
          { text: 'Media-viewer contract', link: '/media/media-viewer' },
        ],
      },
      {
        text: 'Phase 2 controls and forms',
        items: [
          { text: 'Control-state contract', link: '/controls/control-state' },
          { text: 'Core-control contracts', link: '/controls/core-controls' },
          { text: 'Menu and command contract', link: '/controls/menus-and-commands' },
          { text: 'Form-foundation contract', link: '/forms/form-foundation' },
          { text: 'Form-control contract', link: '/forms/form-controls' },
        ],
      },
      {
        text: 'Phase 2 feedback',
        items: [
          { text: 'Feedback-state contract', link: '/feedback/feedback-state' },
          {
            text: 'Persistent feedback contract',
            link: '/feedback/persistent-feedback-and-loading',
          },
          {
            text: 'Transient feedback contract',
            link: '/feedback/transient-feedback',
          },
          {
            text: 'Confirmation-dialog contract',
            link: '/feedback/confirmation-dialog',
          },
          {
            text: 'Content-dialog contract',
            link: '/feedback/content-dialog',
          },
        ],
      },
      {
        text: 'Architecture',
        items: [
          {
            text: 'ADR 0005: Known-state model',
            link: '/architecture/adr/0005-known-state-model',
          },
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
          {
            text: 'ADR 0013: Native media ownership',
            link: '/architecture/adr/0013-native-media-ownership',
          },
          {
            text: 'ADR 0014: Controlled requests',
            link: '/architecture/adr/0014-controlled-operational-requests',
          },
          {
            text: 'ADR 0015: Native form controls',
            link: '/architecture/adr/0015-native-form-control-ownership',
          },
          {
            text: 'ADR 0016: Core-control semantics',
            link: '/architecture/adr/0016-core-control-semantics',
          },
          {
            text: 'ADR 0017: Menu and command architecture',
            link: '/architecture/adr/0017-menu-command-architecture',
          },
          {
            text: 'ADR 0018: Form relationships and validation',
            link: '/architecture/adr/0018-explicit-form-relationships-and-validation',
          },
          {
            text: 'ADR 0019: Styled-native form controls',
            link: '/architecture/adr/0019-styled-native-form-controls',
          },
          {
            text: 'ADR 0020: Feedback delivery and lifetime',
            link: '/architecture/adr/0020-feedback-delivery-and-lifetime',
          },
          {
            text: 'ADR 0021: Native confirmation',
            link: '/architecture/adr/0021-native-confirmation-and-proportional-friction',
          },
          {
            text: 'ADR 0022: Project identity and license',
            link: '/architecture/adr/0022-project-identity-and-license',
          },
          {
            text: 'ADR 0023: Modal content and media inspection',
            link: '/architecture/adr/0023-native-modal-content-and-media-inspection',
          },
          {
            text: 'ADR 0024: Operational data and updates',
            link: '/architecture/adr/0024-operational-data-ownership-and-updates',
          },
          {
            text: 'ADR 0025: Telemetry rendering',
            link: '/architecture/adr/0025-telemetry-rendering-and-accessible-equivalence',
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
            text: 'Phase 3 validation plan',
            link: '/accessibility/phase-3-validation-plan',
          },
          {
            text: 'Phase 3B scalar-data validation',
            link: '/accessibility/phase-3b-scalar-data-validation',
          },
          {
            text: 'Phase 3C telemetry architecture proof',
            link: '/accessibility/phase-3c-telemetry-architecture-proof',
          },
          {
            text: 'Phase 2 assistive-technology gates',
            link: '/accessibility/phase-2-assistive-technology-gates',
          },
          {
            text: 'Phase 2 validation matrix',
            link: '/accessibility/phase-2-validation-matrix',
          },
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
          {
            text: 'Phase 2C layout validation',
            link: '/accessibility/phase-2c-layout-validation',
          },
          {
            text: 'Phase 2C media validation',
            link: '/accessibility/phase-2c-media-validation',
          },
          {
            text: 'Phase 2D-B core-controls validation',
            link: '/accessibility/phase-2d-core-controls-validation',
          },
          {
            text: 'Phase 2D-C menu validation',
            link: '/accessibility/phase-2d-menu-command-validation',
          },
          {
            text: 'Phase 2D-D form-foundation validation',
            link: '/accessibility/phase-2d-form-foundation-validation',
          },
          {
            text: 'Phase 2D-E form-controls validation',
            link: '/accessibility/phase-2d-form-controls-validation',
          },
          {
            text: 'Phase 2E-B persistent-feedback validation',
            link: '/accessibility/phase-2e-persistent-feedback-validation',
          },
          {
            text: 'Phase 2E-C transient-feedback validation',
            link: '/accessibility/phase-2e-transient-feedback-validation',
          },
          {
            text: 'Phase 2E-D confirmation-dialog validation',
            link: '/accessibility/phase-2e-confirmation-dialog-validation',
          },
          {
            text: 'Phase 2F modal-content validation',
            link: '/accessibility/phase-2f-modal-content-media-validation',
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
