export const tokenTypes = [
  'color',
  'cubicBezier',
  'dimension',
  'duration',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'number',
  'shadow',
] as const;

export type TokenType = (typeof tokenTypes)[number];
export type TokenPrimitive = string | number | readonly [number, number, number, number];

export interface TokenDefinition {
  readonly value: TokenPrimitive;
  readonly type: TokenType;
  readonly description: string;
}

export const tokens = {
  'color.reference.ink.950': {
    value: '#090d14',
    type: 'color',
    description: 'Deepest operational neutral.',
  },
  'color.reference.ink.900': {
    value: '#101722',
    type: 'color',
    description: 'Dark canvas neutral.',
  },
  'color.reference.ink.800': {
    value: '#182231',
    type: 'color',
    description: 'Dark contained-surface neutral.',
  },
  'color.reference.ink.700': {
    value: '#273548',
    type: 'color',
    description: 'Dark strong-boundary neutral.',
  },
  'color.reference.ink.500': {
    value: '#6f7c8f',
    type: 'color',
    description: 'Inactive and secondary neutral.',
  },
  'color.reference.ink.300': {
    value: '#aeb8c6',
    type: 'color',
    description: 'Muted text neutral on dark surfaces.',
  },
  'color.reference.paper.50': {
    value: '#f7f9fc',
    type: 'color',
    description: 'Light canvas and high-contrast text neutral.',
  },
  'color.reference.paper.100': {
    value: '#edf1f6',
    type: 'color',
    description: 'Light contained-surface neutral.',
  },
  'color.reference.paper.200': {
    value: '#d8dee8',
    type: 'color',
    description: 'Light strong-boundary neutral.',
  },
  'color.reference.blue.400': {
    value: '#73a5ff',
    type: 'color',
    description: 'Bright action, informational, pending, and asserted-value reference.',
  },
  'color.reference.blue.500': {
    value: '#4f8cff',
    type: 'color',
    description: 'Primary action, informational, pending, and asserted-value reference.',
  },
  'color.reference.blue.600': {
    value: '#326fdd',
    type: 'color',
    description: 'Pressed or high-contrast action reference.',
  },
  'color.reference.green.500': {
    value: '#3fcf8e',
    type: 'color',
    description: 'Positive condition reference.',
  },
  'color.reference.green.700': {
    value: '#147a50',
    type: 'color',
    description: 'Positive condition reference on light surfaces.',
  },
  'color.reference.amber.500': {
    value: '#f4b942',
    type: 'color',
    description: 'Caution and attention reference.',
  },
  'color.reference.amber.700': {
    value: '#925c00',
    type: 'color',
    description: 'Caution and attention reference on light surfaces.',
  },
  'color.reference.red.500': {
    value: '#ff5d6c',
    type: 'color',
    description: 'Critical condition reference.',
  },
  'color.reference.red.700': {
    value: '#b42335',
    type: 'color',
    description: 'Critical condition reference on light surfaces.',
  },
  'color.semantic.surface.canvas': {
    value: '{color.reference.ink.950}',
    type: 'color',
    description: 'Primary application canvas in the default dark theme.',
  },
  'color.semantic.surface.panel': {
    value: '{color.reference.ink.800}',
    type: 'color',
    description: 'Primary contained surface in the default dark theme.',
  },
  'color.semantic.surface.inset': {
    value: '{color.reference.ink.900}',
    type: 'color',
    description: 'Recessed content surface in the default dark theme.',
  },
  'color.semantic.surface.raised': {
    value: '{color.reference.ink.700}',
    type: 'color',
    description: 'Raised or strongly separated surface in the default dark theme.',
  },
  'color.semantic.modal.backdrop': {
    value: 'rgb(9 13 20 / 72%)',
    type: 'color',
    description: 'Backdrop separating native modal content from the inert document.',
  },
  'color.semantic.text.primary': {
    value: '{color.reference.paper.50}',
    type: 'color',
    description: 'Primary text in the default dark theme.',
  },
  'color.semantic.text.secondary': {
    value: '{color.reference.ink.300}',
    type: 'color',
    description: 'Supporting text in the default dark theme.',
  },
  'color.semantic.text.inverse': {
    value: '{color.reference.ink.950}',
    type: 'color',
    description: 'Text on bright filled controls and signals.',
  },
  'color.semantic.border.subtle': {
    value: '{color.reference.ink.700}',
    type: 'color',
    description: 'Routine internal boundary.',
  },
  'color.semantic.border.strong': {
    value: '{color.reference.ink.500}',
    type: 'color',
    description: 'Strong functional or interactive boundary.',
  },
  'color.semantic.structure.band': {
    value: '{color.reference.ink.500}',
    type: 'color',
    description: 'Neutral structural rail and elbow color.',
  },
  'color.semantic.section.information': {
    value: '{color.semantic.border.subtle}',
    type: 'color',
    description: 'Neutral informational-section boundary.',
  },
  'color.semantic.section.monitor': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Monitor-section boundary without implied condition.',
  },
  'color.semantic.section.control': {
    value: '{color.semantic.action.primary}',
    type: 'color',
    description: 'Control-section action association without implied condition.',
  },
  'color.semantic.action.primary': {
    value: '{color.reference.blue.500}',
    type: 'color',
    description: 'Primary interactive emphasis.',
  },
  'color.semantic.action.hover': {
    value: '{color.reference.blue.400}',
    type: 'color',
    description: 'Primary interactive hover emphasis.',
  },
  'color.semantic.action.active': {
    value: '{color.reference.blue.600}',
    type: 'color',
    description: 'Primary interactive active emphasis.',
  },
  'color.semantic.action.critical': {
    value: '{color.reference.red.500}',
    type: 'color',
    description: 'Destructive or high-impact action emphasis.',
  },
  'color.semantic.selection.indicator': {
    value: '{color.reference.blue.500}',
    type: 'color',
    description: 'Selected-view reinforcement without domain-state meaning.',
  },
  'color.semantic.selection.surface': {
    value: '{color.semantic.surface.panel}',
    type: 'color',
    description: 'Surface visually joined to a selected peer view.',
  },
  'color.semantic.selection.text': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Text for a selected peer view.',
  },
  'color.semantic.condition.neutral': {
    value: '{color.reference.ink.500}',
    type: 'color',
    description: 'Condition with no positive or negative interpretation.',
  },
  'color.semantic.condition.informational': {
    value: '{color.reference.blue.500}',
    type: 'color',
    description: 'Informational condition reinforcement.',
  },
  'color.semantic.condition.positive': {
    value: '{color.reference.green.500}',
    type: 'color',
    description: 'Normal, healthy, or positive condition reinforcement.',
  },
  'color.semantic.condition.caution': {
    value: '{color.reference.amber.500}',
    type: 'color',
    description: 'Caution condition reinforcement.',
  },
  'color.semantic.condition.critical': {
    value: '{color.reference.red.500}',
    type: 'color',
    description: 'Critical condition reinforcement.',
  },
  'color.semantic.knowledge.confirmed': {
    value: '{color.reference.ink.300}',
    type: 'color',
    description: 'Confirmed knowledge metadata.',
  },
  'color.semantic.knowledge.inferred': {
    value: '{color.reference.blue.400}',
    type: 'color',
    description: 'Inferred knowledge metadata without confirmed meaning.',
  },
  'color.semantic.knowledge.stale': {
    value: '{color.reference.amber.500}',
    type: 'color',
    description: 'Stale knowledge reinforcement when freshness needs attention.',
  },
  'color.semantic.knowledge.unknown': {
    value: '{color.reference.ink.500}',
    type: 'color',
    description: 'Unknown knowledge-state reinforcement.',
  },
  'color.semantic.knowledge.conflicting': {
    value: '{color.reference.amber.500}',
    type: 'color',
    description: 'Conflicting knowledge reinforcement.',
  },
  'color.semantic.knowledge.unavailable': {
    value: '{color.reference.ink.500}',
    type: 'color',
    description: 'Unavailable knowledge reinforcement.',
  },
  'color.semantic.activity.idle': {
    value: '{color.reference.ink.500}',
    type: 'color',
    description: 'Quiet idle activity metadata.',
  },
  'color.semantic.activity.pending': {
    value: '{color.reference.blue.500}',
    type: 'color',
    description: 'Pending activity reinforcement without implying a problem.',
  },
  'color.semantic.availability.offline': {
    value: '{color.reference.ink.500}',
    type: 'color',
    description: 'Offline availability reinforcement without condition meaning.',
  },
  'color.semantic.value.asserted': {
    value: '{color.reference.blue.500}',
    type: 'color',
    description: 'Lit or filled Boolean value without health meaning.',
  },
  'color.semantic.value.not-asserted': {
    value: '{color.reference.ink.500}',
    type: 'color',
    description: 'Unlit or outlined Boolean value without health meaning.',
  },
  'color.semantic.focus.ring': {
    value: '{color.reference.blue.400}',
    type: 'color',
    description: 'Visible keyboard focus indicator.',
  },
  'color.semantic.data.series.1': {
    value: '{color.reference.blue.500}',
    type: 'color',
    description: 'First operational data-series role.',
  },
  'color.semantic.data.series.2': {
    value: '{color.reference.green.500}',
    type: 'color',
    description: 'Second operational data-series role.',
  },
  'typography.family.body': {
    value: 'ui-rounded, "Avenir Next", Avenir, Inter, system-ui, sans-serif',
    type: 'fontFamily',
    description: 'Humanist body and interface type stack.',
  },
  'typography.family.display': {
    value: 'ui-rounded, "Avenir Next", Avenir, Inter, system-ui, sans-serif',
    type: 'fontFamily',
    description: 'Humanist display type stack.',
  },
  'typography.family.numeric': {
    value: 'ui-monospace, "SFMono-Regular", "Roboto Mono", monospace',
    type: 'fontFamily',
    description: 'Numeric and identifier type stack.',
  },
  'typography.size.metadata': {
    value: '0.75rem',
    type: 'fontSize',
    description: 'Supporting metadata text size.',
  },
  'typography.size.label': {
    value: '0.875rem',
    type: 'fontSize',
    description: 'Control and compact field label size.',
  },
  'typography.size.body': {
    value: '1rem',
    type: 'fontSize',
    description: 'Default body text size.',
  },
  'typography.size.section': {
    value: '1.125rem',
    type: 'fontSize',
    description: 'Section heading size.',
  },
  'typography.size.title': {
    value: '1.5rem',
    type: 'fontSize',
    description: 'Page and function title size.',
  },
  'typography.size.value.compact': {
    value: '1.25rem',
    type: 'fontSize',
    description: 'Compact primary value size.',
  },
  'typography.size.value.prominent': {
    value: '2rem',
    type: 'fontSize',
    description: 'Prominent wall-panel value size.',
  },
  'typography.line-height.compact': {
    value: 1.2,
    type: 'number',
    description: 'Compact heading and value line height.',
  },
  'typography.line-height.body': {
    value: 1.5,
    type: 'number',
    description: 'Readable body line height.',
  },
  'typography.weight.regular': {
    value: 400,
    type: 'fontWeight',
    description: 'Regular text weight.',
  },
  'typography.weight.medium': {
    value: 550,
    type: 'fontWeight',
    description: 'Label and control text weight.',
  },
  'typography.weight.emphasis': {
    value: 650,
    type: 'fontWeight',
    description: 'Emphasized heading and value weight.',
  },
  'space.reference.1': {
    value: '0.25rem',
    type: 'dimension',
    description: 'Smallest spacing step.',
  },
  'space.reference.2': {
    value: '0.5rem',
    type: 'dimension',
    description: 'Compact spacing step.',
  },
  'space.reference.3': {
    value: '0.75rem',
    type: 'dimension',
    description: 'Intermediate spacing step.',
  },
  'space.reference.4': {
    value: '1rem',
    type: 'dimension',
    description: 'Base spacing step.',
  },
  'space.reference.6': {
    value: '1.5rem',
    type: 'dimension',
    description: 'Large spacing step.',
  },
  'space.reference.8': {
    value: '2rem',
    type: 'dimension',
    description: 'Extra-large spacing step.',
  },
  'space.semantic.control.block': {
    value: '{space.reference.3}',
    type: 'dimension',
    description: 'Block spacing inside controls.',
  },
  'space.semantic.control.inline': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Inline spacing inside controls.',
  },
  'space.semantic.section.compact': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Compact internal section rhythm.',
  },
  'space.semantic.section.comfortable': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Comfortable internal section rhythm.',
  },
  'space.semantic.function.gutter': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Visible separation between independent functional zones.',
  },
  'space.semantic.layout.related.compact': {
    value: '{space.reference.1}',
    type: 'dimension',
    description: 'Compact gap between closely related layout items.',
  },
  'space.semantic.layout.related.comfortable': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Comfortable gap between closely related layout items.',
  },
  'space.semantic.layout.section.compact': {
    value: '{space.reference.3}',
    type: 'dimension',
    description: 'Compact gap between distinct sections inside one function.',
  },
  'space.semantic.layout.section.comfortable': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Comfortable gap between distinct sections inside one function.',
  },
  'space.semantic.layout.function.compact': {
    value: '{space.reference.6}',
    type: 'dimension',
    description: 'Compact gap between independent functional zones.',
  },
  'space.semantic.layout.function.comfortable': {
    value: '{space.reference.8}',
    type: 'dimension',
    description: 'Comfortable gap between independent functional zones.',
  },
  'space.semantic.page.compact': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Phone and compact page edge spacing.',
  },
  'space.semantic.page.comfortable': {
    value: '{space.reference.6}',
    type: 'dimension',
    description: 'Desktop and comfortable page edge spacing.',
  },
  'size.touch.minimum': {
    value: '2.75rem',
    type: 'dimension',
    description: 'Minimum preferred interactive target size.',
  },
  'size.content.measure': {
    value: '72rem',
    type: 'dimension',
    description: 'Standard contained application and documentation measure.',
  },
  'size.signal.compact': {
    value: '0.625rem',
    type: 'dimension',
    description: 'Compact status-light or value-signal size.',
  },
  'size.signal.prominent': {
    value: '3.5rem',
    type: 'dimension',
    description: 'Prominent glanceable value-field signal size.',
  },
  'size.metric.value-minimum': {
    value: '4ch',
    type: 'dimension',
    description: 'Reserved compact metric value width.',
  },
  'size.icon.compact': {
    value: '1rem',
    type: 'dimension',
    description: 'Compact inline icon size.',
  },
  'size.icon.standard': {
    value: '1.25rem',
    type: 'dimension',
    description: 'Standard interface icon size.',
  },
  'size.icon.prominent': {
    value: '2rem',
    type: 'dimension',
    description: 'Prominent reinforcing icon size.',
  },
  'density.comfortable.scale': {
    value: 1,
    type: 'number',
    description: 'Comfortable density multiplier.',
  },
  'density.compact.scale': {
    value: 0.875,
    type: 'number',
    description: 'Compact density multiplier without reducing touch targets.',
  },
  'shape.radius.control': {
    value: '0.5rem',
    type: 'dimension',
    description: 'Rounded-square control radius.',
  },
  'shape.radius.panel': {
    value: '0.75rem',
    type: 'dimension',
    description: 'Contained panel radius.',
  },
  'shape.radius.signal': {
    value: '0.375rem',
    type: 'dimension',
    description: 'Rounded-square value and condition signal radius.',
  },
  'shape.radius.band': {
    value: '0.5rem',
    type: 'dimension',
    description: 'Structural band and elbow radius.',
  },
  'border.width.standard': {
    value: '0.0625rem',
    type: 'dimension',
    description: 'Standard visible boundary width.',
  },
  'border.width.strong': {
    value: '0.125rem',
    type: 'dimension',
    description: 'Strong visible boundary width.',
  },
  'border.width.band': {
    value: '0.1875rem',
    type: 'dimension',
    description: 'Banded structural boundary for function identity.',
  },
  'border.width.value-rail': {
    value: '0.25rem',
    type: 'dimension',
    description: 'Compact asserted or not-asserted value rail.',
  },
  'border.semantic.function': {
    value: '{border.width.strong}',
    type: 'dimension',
    description: 'Independent functional-zone boundary width.',
  },
  'border.semantic.section': {
    value: '{border.width.standard}',
    type: 'dimension',
    description: 'Internal section boundary width.',
  },
  'elevation.panel': {
    value: '0 0.5rem 1.5rem rgb(0 0 0 / 20%)',
    type: 'shadow',
    description: 'Contained panel elevation in themes that use depth.',
  },
  'motion.duration.instant': {
    value: '0ms',
    type: 'duration',
    description: 'Immediate state update.',
  },
  'motion.duration.fast': {
    value: '120ms',
    type: 'duration',
    description: 'Fast explanatory transition.',
  },
  'motion.duration.standard': {
    value: '220ms',
    type: 'duration',
    description: 'Standard explanatory transition.',
  },
  'motion.easing.standard': {
    value: [0.2, 0, 0, 1],
    type: 'cubicBezier',
    description: 'Standard transition easing function.',
  },
  'opacity.disabled': {
    value: 0.48,
    type: 'number',
    description: 'Supporting disabled-state opacity.',
  },
  'z-index.overlay': {
    value: 100,
    type: 'number',
    description: 'Overlay stacking reference.',
  },
  'breakpoint.phone.wide': {
    value: '40rem',
    type: 'dimension',
    description: 'Wide-phone container threshold.',
  },
  'breakpoint.desktop': {
    value: '64rem',
    type: 'dimension',
    description: 'Desktop container threshold.',
  },
  'breakpoint.wall': {
    value: '96rem',
    type: 'dimension',
    description: 'Wall-panel container threshold.',
  },
  'focus.width': {
    value: '0.1875rem',
    type: 'dimension',
    description: 'Visible focus indicator width.',
  },
  'focus.offset': {
    value: '0.125rem',
    type: 'dimension',
    description: 'Visible focus indicator offset.',
  },
  'component.focus-ring.color': {
    value: '{color.semantic.focus.ring}',
    type: 'color',
    description: 'Shared consumer-authored focus-ring color.',
  },
  'component.focus-ring.width': {
    value: '{focus.width}',
    type: 'dimension',
    description: 'Shared consumer-authored focus-ring width.',
  },
  'component.focus-ring.offset': {
    value: '{focus.offset}',
    type: 'dimension',
    description: 'Shared consumer-authored focus-ring offset.',
  },
  'component.icon.size.compact': {
    value: '{size.icon.compact}',
    type: 'dimension',
    description: 'Compact icon component size.',
  },
  'component.icon.size.standard': {
    value: '{size.icon.standard}',
    type: 'dimension',
    description: 'Standard icon component size.',
  },
  'component.icon.size.prominent': {
    value: '{size.icon.prominent}',
    type: 'dimension',
    description: 'Prominent icon component size.',
  },
  'component.surface.color.panel': {
    value: '{color.semantic.surface.panel}',
    type: 'color',
    description: 'Neutral panel-tone surface background.',
  },
  'component.surface.color.inset': {
    value: '{color.semantic.surface.inset}',
    type: 'color',
    description: 'Neutral inset-tone surface background.',
  },
  'component.surface.color.raised': {
    value: '{color.semantic.surface.raised}',
    type: 'color',
    description: 'Neutral raised-tone surface background.',
  },
  'component.surface.color.border': {
    value: '{color.semantic.border.subtle}',
    type: 'color',
    description: 'Routine neutral surface boundary.',
  },
  'component.surface.color.border-strong': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Strong neutral surface boundary.',
  },
  'component.surface.radius': {
    value: '{shape.radius.panel}',
    type: 'dimension',
    description: 'Neutral surface radius.',
  },
  'component.surface.space.compact': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Compact neutral surface edge padding.',
  },
  'component.surface.space.comfortable': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Comfortable neutral surface edge padding.',
  },
  'component.surface.elevation': {
    value: '{elevation.panel}',
    type: 'shadow',
    description: 'Raised neutral surface elevation.',
  },
  'component.divider.color': {
    value: '{color.semantic.border.subtle}',
    type: 'color',
    description: 'Internal separator color.',
  },
  'component.divider.size.standard': {
    value: '{border.width.standard}',
    type: 'dimension',
    description: 'Standard internal separator thickness.',
  },
  'component.divider.size.strong': {
    value: '{border.width.strong}',
    type: 'dimension',
    description: 'Strong internal separator thickness.',
  },
  'component.layout.space.related': {
    value: '{space.semantic.layout.related.comfortable}',
    type: 'dimension',
    description: 'Density-aware gap between closely related layout items.',
  },
  'component.layout.space.section': {
    value: '{space.semantic.layout.section.comfortable}',
    type: 'dimension',
    description: 'Density-aware gap between sections inside one function.',
  },
  'component.layout.space.function': {
    value: '{space.semantic.layout.function.comfortable}',
    type: 'dimension',
    description: 'Density-aware gap between independent functional zones.',
  },
  'component.frame.color.background': {
    value: '{color.semantic.surface.panel}',
    type: 'color',
    description: 'Neutral functional-frame background.',
  },
  'component.frame.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Neutral functional-frame boundary.',
  },
  'component.frame.border-size.standard': {
    value: '{border.semantic.function}',
    type: 'dimension',
    description: 'Standard functional-frame boundary width.',
  },
  'component.frame.border-size.strong': {
    value: '{border.width.band}',
    type: 'dimension',
    description: 'Strong functional-frame boundary width.',
  },
  'component.frame.radius': {
    value: '{shape.radius.panel}',
    type: 'dimension',
    description: 'Functional-frame radius.',
  },
  'component.frame.space.compact': {
    value: '{space.reference.3}',
    type: 'dimension',
    description: 'Compact functional-frame padding.',
  },
  'component.frame.space.comfortable': {
    value: '{space.reference.6}',
    type: 'dimension',
    description: 'Comfortable functional-frame padding.',
  },
  'component.grid.item-minimum.compact': {
    value: '12rem',
    type: 'dimension',
    description: 'Minimum grid item measure for compact peer content.',
  },
  'component.grid.item-minimum.standard': {
    value: '18rem',
    type: 'dimension',
    description: 'Minimum grid item measure for standard peer content.',
  },
  'component.grid.item-minimum.wide': {
    value: '24rem',
    type: 'dimension',
    description: 'Minimum grid item measure for wide peer content.',
  },
  'component.split.region-minimum.compact': {
    value: '12rem',
    type: 'dimension',
    description: 'Minimum usable split-region measure for compact content.',
  },
  'component.split.region-minimum.standard': {
    value: '18rem',
    type: 'dimension',
    description: 'Minimum usable split-region measure for standard content.',
  },
  'component.split.region-minimum.wide': {
    value: '24rem',
    type: 'dimension',
    description: 'Minimum usable split-region measure for wide content.',
  },
  'component.split.ratio.equal': {
    value: '1fr',
    type: 'dimension',
    description: 'Balanced split-region ratio.',
  },
  'component.split.ratio.emphasized': {
    value: '1.5fr',
    type: 'dimension',
    description: 'Emphasized split-region ratio.',
  },
  'component.split.breakpoint.compact': {
    value: '26rem',
    type: 'dimension',
    description: 'Inline size at which two compact split regions can coexist.',
  },
  'component.split.breakpoint.standard': {
    value: '38rem',
    type: 'dimension',
    description: 'Inline size at which two standard split regions can coexist.',
  },
  'component.split.breakpoint.wide': {
    value: '50rem',
    type: 'dimension',
    description: 'Inline size at which two wide split regions can coexist.',
  },
  'component.scroll-region.max-block-size': {
    value: '24rem',
    type: 'dimension',
    description: 'Default maximum block size for intentionally scrollable content.',
  },
  'component.scroll-region.max-inline-size': {
    value: '{size.content.measure}',
    type: 'dimension',
    description: 'Default maximum inline size for intentionally scrollable content.',
  },
  'component.scroll-region.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Discoverable scroll-region boundary.',
  },
  'component.scroll-region.focus-ring-color': {
    value: '{color.semantic.focus.ring}',
    type: 'color',
    description: 'Keyboard focus indicator for an overflowing scroll region.',
  },
  'component.media.color.background': {
    value: '{color.semantic.surface.inset}',
    type: 'color',
    description: 'Neutral media viewport and state background.',
  },
  'component.media.color.border': {
    value: '{color.semantic.border.subtle}',
    type: 'color',
    description: 'Routine neutral media boundary.',
  },
  'component.media.color.border-strong': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Strong neutral media boundary.',
  },
  'component.media.border-size.subtle': {
    value: '{border.width.standard}',
    type: 'dimension',
    description: 'Subtle media boundary width.',
  },
  'component.media.border-size.strong': {
    value: '{border.width.strong}',
    type: 'dimension',
    description: 'Strong media boundary width.',
  },
  'component.media.radius': {
    value: '{shape.radius.panel}',
    type: 'dimension',
    description: 'Media viewport radius.',
  },
  'component.media.min-block-size': {
    value: '10rem',
    type: 'dimension',
    description: 'Minimum reserved media state height when no ratio is available.',
  },
  'component.media.state-space': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Media loading and unavailable presentation spacing.',
  },
  'component.canvas.color.background': {
    value: '{color.semantic.surface.canvas}',
    type: 'color',
    description: 'Canvas background.',
  },
  'component.canvas.size.content': {
    value: '{size.content.measure}',
    type: 'dimension',
    description: 'Contained canvas content measure.',
  },
  'component.canvas.space.block': {
    value: '{space.semantic.page.comfortable}',
    type: 'dimension',
    description: 'Default canvas block padding.',
  },
  'component.canvas.space.inline': {
    value: '{space.semantic.page.comfortable}',
    type: 'dimension',
    description: 'Default canvas inline padding.',
  },
  'component.rail.color': {
    value: '{color.semantic.structure.band}',
    type: 'color',
    description: 'Neutral structural rail fill.',
  },
  'component.rail.size.standard': {
    value: '{border.width.band}',
    type: 'dimension',
    description: 'Standard structural rail thickness.',
  },
  'component.rail.size.strong': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Strong structural rail thickness.',
  },
  'component.rail.radius': {
    value: '{shape.radius.band}',
    type: 'dimension',
    description: 'Structural rail radius.',
  },
  'component.elbow.color.background': {
    value: '{color.semantic.surface.raised}',
    type: 'color',
    description: 'Function-heading elbow background.',
  },
  'component.elbow.color.text': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Function-heading elbow text.',
  },
  'component.elbow.size.band': {
    value: '{component.rail.size.strong}',
    type: 'dimension',
    description: 'Function-heading elbow joining-band thickness.',
  },
  'component.elbow.radius': {
    value: '{shape.radius.band}',
    type: 'dimension',
    description: 'Function-heading elbow radius.',
  },
  'component.elbow.space.inline': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Function-heading elbow inline padding.',
  },
  'component.panel.color.background': {
    value: '{color.semantic.surface.panel}',
    type: 'color',
    description: 'Panel background.',
  },
  'component.panel.color.border': {
    value: '{color.semantic.border.subtle}',
    type: 'color',
    description: 'Panel boundary.',
  },
  'component.panel.color.information': {
    value: '{color.semantic.section.information}',
    type: 'color',
    description: 'Informational panel purpose accent.',
  },
  'component.panel.color.monitor': {
    value: '{color.semantic.section.monitor}',
    type: 'color',
    description: 'Monitor panel purpose accent.',
  },
  'component.panel.color.control': {
    value: '{color.semantic.section.control}',
    type: 'color',
    description: 'Control panel purpose accent.',
  },
  'component.panel.color.text': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Panel primary text.',
  },
  'component.panel.radius': {
    value: '{shape.radius.panel}',
    type: 'dimension',
    description: 'Panel radius.',
  },
  'component.panel.space': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Panel edge padding.',
  },
  'component.panel.space.section': {
    value: '{space.semantic.section.compact}',
    type: 'dimension',
    description: 'Panel internal section spacing.',
  },
  'component.button.color.background': {
    value: '{color.semantic.action.primary}',
    type: 'color',
    description: 'Primary button background.',
  },
  'component.button.color.background-hover': {
    value: '{color.semantic.action.hover}',
    type: 'color',
    description: 'Primary button hover background.',
  },
  'component.button.color.text': {
    value: '{color.semantic.text.inverse}',
    type: 'color',
    description: 'Filled button text.',
  },
  'component.button.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Secondary button boundary.',
  },
  'component.button.color.critical': {
    value: '{color.semantic.action.critical}',
    type: 'color',
    description: 'Filled critical-action background with accessible inverse-text contrast.',
  },
  'component.button.radius': {
    value: '{shape.radius.control}',
    type: 'dimension',
    description: 'Button radius.',
  },
  'component.button.space.block': {
    value: '{space.semantic.control.block}',
    type: 'dimension',
    description: 'Button block padding.',
  },
  'component.button.space.inline': {
    value: '{space.semantic.control.inline}',
    type: 'dimension',
    description: 'Button inline padding.',
  },
  'component.button.size.minimum': {
    value: '{size.touch.minimum}',
    type: 'dimension',
    description: 'Button minimum target size.',
  },
  'component.tab-list.space': {
    value: '{space.reference.1}',
    type: 'dimension',
    description: 'Gap between peer tab selectors.',
  },
  'component.tab.color.background': {
    value: '{color.semantic.surface.raised}',
    type: 'color',
    description: 'Unselected tab background.',
  },
  'component.tab.color.background-selected': {
    value: '{color.semantic.selection.surface}',
    type: 'color',
    description: 'Selected tab background joined to its panel.',
  },
  'component.tab.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Tab boundary.',
  },
  'component.tab.color.text': {
    value: '{color.semantic.text.secondary}',
    type: 'color',
    description: 'Unselected tab text.',
  },
  'component.tab.color.text-selected': {
    value: '{color.semantic.selection.text}',
    type: 'color',
    description: 'Selected tab text.',
  },
  'component.tab.color.selection': {
    value: '{color.semantic.selection.indicator}',
    type: 'color',
    description: 'Redundant selected-tab indicator.',
  },
  'component.tab.radius': {
    value: '{shape.radius.band}',
    type: 'dimension',
    description: 'Tab selector radius.',
  },
  'component.tab.space.block': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Tab block padding.',
  },
  'component.tab.space.inline': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Tab inline padding.',
  },
  'component.tab.size.minimum': {
    value: '{size.touch.minimum}',
    type: 'dimension',
    description: 'Tab minimum target size.',
  },
  'component.tab.size.selection': {
    value: '{border.width.band}',
    type: 'dimension',
    description: 'Selected-tab indicator thickness.',
  },
  'component.tab-panel.color.background': {
    value: '{color.semantic.selection.surface}',
    type: 'color',
    description: 'Active tab-panel background.',
  },
  'component.tab-panel.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Active tab-panel boundary.',
  },
  'component.tab-panel.radius': {
    value: '{shape.radius.panel}',
    type: 'dimension',
    description: 'Active tab-panel radius.',
  },
  'component.tab-panel.space': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Active tab-panel edge padding.',
  },
  'component.icon-button.color.background': {
    value: '{color.semantic.surface.inset}',
    type: 'color',
    description: 'Quiet icon-button background.',
  },
  'component.icon-button.color.background-hover': {
    value: '{color.semantic.surface.raised}',
    type: 'color',
    description: 'Icon-button hover background.',
  },
  'component.icon-button.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Secondary icon-button boundary.',
  },
  'component.icon-button.color.text': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Icon-button foreground.',
  },
  'component.icon-button.radius': {
    value: '{shape.radius.control}',
    type: 'dimension',
    description: 'Icon-button radius.',
  },
  'component.icon-button.size': {
    value: '{size.touch.minimum}',
    type: 'dimension',
    description: 'Icon-button target size.',
  },
  'component.toggle.color.background': {
    value: '{color.semantic.surface.inset}',
    type: 'color',
    description: 'Operational toggle background.',
  },
  'component.toggle.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Operational toggle boundary.',
  },
  'component.toggle.color.text': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Operational toggle text.',
  },
  'component.toggle.color.asserted': {
    value: '{color.semantic.value.asserted}',
    type: 'color',
    description: 'Asserted operational value signal.',
  },
  'component.toggle.color.not-asserted': {
    value: '{color.semantic.value.not-asserted}',
    type: 'color',
    description: 'Not-asserted operational value signal.',
  },
  'component.toggle.radius': {
    value: '{shape.radius.control}',
    type: 'dimension',
    description: 'Operational toggle radius.',
  },
  'component.toggle.size.signal': {
    value: '{size.signal.prominent}',
    type: 'dimension',
    description: 'Operational toggle signal size.',
  },
  'component.toggle.space': {
    value: '{space.reference.3}',
    type: 'dimension',
    description: 'Operational toggle internal spacing.',
  },
  'component.segmented.color.background': {
    value: '{color.semantic.surface.inset}',
    type: 'color',
    description: 'Segmented-control background.',
  },
  'component.segmented.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Segmented-control boundary.',
  },
  'component.segmented.color.selected': {
    value: '{color.semantic.selection.indicator}',
    type: 'color',
    description: 'Selected segment reinforcement.',
  },
  'component.segmented.color.text': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Segment text.',
  },
  'component.segmented.radius': {
    value: '{shape.radius.control}',
    type: 'dimension',
    description: 'Segmented-control radius.',
  },
  'component.segmented.space': {
    value: '{space.reference.3}',
    type: 'dimension',
    description: 'Segment internal spacing.',
  },
  'component.segmented.size.minimum': {
    value: '{size.touch.minimum}',
    type: 'dimension',
    description: 'Segment minimum target size.',
  },
  'component.navigation-rail.color.background': {
    value: '{color.semantic.surface.inset}',
    type: 'color',
    description: 'Navigation-rail background.',
  },
  'component.navigation-rail.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Navigation-rail boundary.',
  },
  'component.navigation-rail.color.current': {
    value: '{color.semantic.selection.indicator}',
    type: 'color',
    description: 'Current-destination reinforcement.',
  },
  'component.navigation-rail.color.text': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Navigation-rail link text.',
  },
  'component.navigation-rail.radius': {
    value: '{shape.radius.band}',
    type: 'dimension',
    description: 'Navigation-rail radius.',
  },
  'component.navigation-rail.space': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Navigation-rail internal spacing.',
  },
  'component.navigation-rail.link-size.minimum': {
    value: '{size.touch.minimum}',
    type: 'dimension',
    description: 'Navigation link minimum target size.',
  },
  'component.menu.color.trigger-background': {
    value: '{color.semantic.surface.inset}',
    type: 'color',
    description: 'Command-menu trigger background.',
  },
  'component.menu.color.trigger-background-hover': {
    value: '{color.semantic.surface.raised}',
    type: 'color',
    description: 'Command-menu trigger hover background.',
  },
  'component.menu.color.popup-background': {
    value: '{color.semantic.surface.raised}',
    type: 'color',
    description: 'Command-menu popup surface.',
  },
  'component.menu.color.item-background-hover': {
    value: '{color.semantic.selection.surface}',
    type: 'color',
    description: 'Command-item hover and focused surface.',
  },
  'component.menu.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Command-menu trigger and popup boundary.',
  },
  'component.menu.color.text': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Command-menu trigger and item text.',
  },
  'component.menu.color.detail': {
    value: '{color.semantic.text.secondary}',
    type: 'color',
    description: 'Command-item supporting detail text.',
  },
  'component.menu.radius.trigger': {
    value: '{shape.radius.control}',
    type: 'dimension',
    description: 'Command-menu trigger radius.',
  },
  'component.menu.radius.popup': {
    value: '{shape.radius.panel}',
    type: 'dimension',
    description: 'Command-menu popup radius.',
  },
  'component.menu.elevation': {
    value: '{elevation.panel}',
    type: 'shadow',
    description: 'Command-menu popup elevation.',
  },
  'component.menu.space': {
    value: '{space.reference.3}',
    type: 'dimension',
    description: 'Density-aware command-item internal spacing.',
  },
  'component.menu.space.popup': {
    value: '{space.reference.1}',
    type: 'dimension',
    description: 'Command-menu popup edge spacing.',
  },
  'component.menu.space.offset': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Command-menu distance from its trigger.',
  },
  'component.menu.space.viewport': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Minimum command-menu inset from the visual viewport.',
  },
  'component.menu.size.trigger-minimum': {
    value: '{size.touch.minimum}',
    type: 'dimension',
    description: 'Command-menu trigger minimum target size.',
  },
  'component.menu.size.item-minimum': {
    value: '{size.touch.minimum}',
    type: 'dimension',
    description: 'Command-item minimum target size.',
  },
  'component.menu.size.inline-minimum': {
    value: '12rem',
    type: 'dimension',
    description: 'Command-menu minimum usable inline size.',
  },
  'component.menu.size.inline-maximum': {
    value: '24rem',
    type: 'dimension',
    description: 'Command-menu maximum readable inline size.',
  },
  'component.menu.size.block-maximum': {
    value: '24rem',
    type: 'dimension',
    description: 'Command-menu maximum block size before internal scrolling.',
  },
  'component.form.color.label': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Native field label and legend text.',
  },
  'component.form.color.requirement': {
    value: '{color.semantic.text.secondary}',
    type: 'color',
    description: 'Visible required or optional qualifier without condition meaning.',
  },
  'component.form.color.help': {
    value: '{color.semantic.text.secondary}',
    type: 'color',
    description: 'Persistent field help and supporting detail text.',
  },
  'component.form.color.error': {
    value: '{color.semantic.condition.critical}',
    type: 'color',
    description: 'Current textual field-error signal.',
  },
  'component.form.color.control-background': {
    value: '{color.semantic.surface.inset}',
    type: 'color',
    description: 'Native form-control surface reserved for Phase 2D-E presentations.',
  },
  'component.form.color.control-background-readonly': {
    value: '{color.semantic.surface.panel}',
    type: 'color',
    description: 'Read-only native form-control surface distinct from disabled state.',
  },
  'component.form.color.control-text': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Native form-control text reserved for Phase 2D-E presentations.',
  },
  'component.form.color.control-placeholder': {
    value: '{color.semantic.text.secondary}',
    type: 'color',
    description: 'Supplemental placeholder text that does not replace a persistent label.',
  },
  'component.form.color.control-accent': {
    value: '{color.semantic.action.primary}',
    type: 'color',
    description: 'Native checkbox, radio, and range accent without condition meaning.',
  },
  'component.form.color.control-border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Native form-control boundary reserved for Phase 2D-E presentations.',
  },
  'component.form.color.control-border-invalid': {
    value: '{color.semantic.condition.critical}',
    type: 'color',
    description: 'Current invalid native form-control boundary.',
  },
  'component.form.radius.control': {
    value: '{shape.radius.control}',
    type: 'dimension',
    description: 'Native form-control radius reserved for Phase 2D-E presentations.',
  },
  'component.form.space.group': {
    value: '{space.reference.3}',
    type: 'dimension',
    description: 'Density-aware spacing among label, control, help, and error content.',
  },
  'component.form.space.label': {
    value: '{space.reference.1}',
    type: 'dimension',
    description: 'Spacing among field label, requirement, and detail content.',
  },
  'component.form.space.message': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Spacing between a field-message signal and its text.',
  },
  'component.form.space.control-block': {
    value: '{space.semantic.control.block}',
    type: 'dimension',
    description: 'Native text, number, and select control block padding.',
  },
  'component.form.space.control-inline': {
    value: '{space.semantic.control.inline}',
    type: 'dimension',
    description: 'Density-aware native text, number, and select control inline padding.',
  },
  'component.form.space.choice': {
    value: '{space.reference.3}',
    type: 'dimension',
    description: 'Density-aware spacing between a native choice control and its label.',
  },
  'component.form.size.control-minimum': {
    value: '{size.touch.minimum}',
    type: 'dimension',
    description: 'Native form-control minimum target size.',
  },
  'component.form.size.choice': {
    value: '1.25rem',
    type: 'dimension',
    description: 'Visual checkbox and radio size within the larger labeled interaction target.',
  },
  'component.form.size.error-signal': {
    value: '{border.width.band}',
    type: 'dimension',
    description: 'Redundant field-error signal thickness.',
  },
  'component.form-action.color.background': {
    value: '{color.semantic.action.primary}',
    type: 'color',
    description: 'Native submit and reset action background.',
  },
  'component.form-action.color.background-hover': {
    value: '{color.semantic.action.hover}',
    type: 'color',
    description: 'Native submit and reset action hover background.',
  },
  'component.form-action.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Native submit and reset action boundary.',
  },
  'component.form-action.color.text': {
    value: '{color.semantic.text.inverse}',
    type: 'color',
    description: 'Native filled form-action text.',
  },
  'component.form-action.radius': {
    value: '{shape.radius.control}',
    type: 'dimension',
    description: 'Native submit and reset action radius.',
  },
  'component.form-action.space.block': {
    value: '{space.semantic.control.block}',
    type: 'dimension',
    description: 'Native form-action block padding.',
  },
  'component.form-action.space.inline': {
    value: '{space.semantic.control.inline}',
    type: 'dimension',
    description: 'Density-aware native form-action inline padding.',
  },
  'component.form-action.size.minimum': {
    value: '{size.touch.minimum}',
    type: 'dimension',
    description: 'Native form-action minimum target size.',
  },
  'component.status-indicator.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Status signal redundant boundary.',
  },
  'component.status-indicator.color.condition': {
    value: '{color.semantic.condition.neutral}',
    type: 'color',
    description: 'Status signal condition fill before the selected condition override.',
  },
  'component.status-indicator.size.compact': {
    value: '{size.signal.compact}',
    type: 'dimension',
    description: 'Compact status signal size.',
  },
  'component.status-indicator.size.prominent': {
    value: '{size.signal.prominent}',
    type: 'dimension',
    description: 'Prominent status signal size.',
  },
  'component.status-indicator.radius': {
    value: '{shape.radius.signal}',
    type: 'dimension',
    description: 'Status signal radius.',
  },
  'component.status-indicator.space': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Status indicator internal spacing.',
  },
  'component.boolean-value.color.asserted': {
    value: '{color.semantic.value.asserted}',
    type: 'color',
    description: 'Asserted Boolean signal fill.',
  },
  'component.boolean-value.color.not-asserted': {
    value: '{color.semantic.value.not-asserted}',
    type: 'color',
    description: 'Not-asserted Boolean signal fill or outline.',
  },
  'component.boolean-value.color.text': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Boolean value text.',
  },
  'component.boolean-value.size.rail': {
    value: '{border.width.value-rail}',
    type: 'dimension',
    description: 'Boolean value rail thickness.',
  },
  'component.boolean-value.size.field': {
    value: '{size.signal.prominent}',
    type: 'dimension',
    description: 'Boolean value field minimum size.',
  },
  'component.boolean-value.radius': {
    value: '{shape.radius.signal}',
    type: 'dimension',
    description: 'Boolean signal radius.',
  },
  'component.boolean-value.space': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Boolean value internal spacing.',
  },
  'component.metric.color.value': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Metric primary value text.',
  },
  'component.metric.color.label': {
    value: '{color.semantic.text.secondary}',
    type: 'color',
    description: 'Metric label text.',
  },
  'component.metric.font-size.compact': {
    value: '{typography.size.value.compact}',
    type: 'fontSize',
    description: 'Compact metric value size.',
  },
  'component.metric.font-size.prominent': {
    value: '{typography.size.value.prominent}',
    type: 'fontSize',
    description: 'Prominent metric value size.',
  },
  'component.metric.space': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Metric internal spacing.',
  },
  'component.metric.size.value-minimum': {
    value: '{size.metric.value-minimum}',
    type: 'dimension',
    description: 'Reserved metric value width.',
  },
  'component.value-tile.color.background': {
    value: '{color.semantic.surface.panel}',
    type: 'color',
    description: 'Value tile background.',
  },
  'component.value-tile.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Value tile boundary.',
  },
  'component.value-tile.radius': {
    value: '{shape.radius.panel}',
    type: 'dimension',
    description: 'Value tile radius.',
  },
  'component.value-tile.space': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Value tile edge padding.',
  },
  'component.value-tile.space.section': {
    value: '{space.semantic.section.compact}',
    type: 'dimension',
    description: 'Value tile internal section spacing.',
  },
  'component.feedback.color.background': {
    value: '{color.semantic.surface.panel}',
    type: 'color',
    description: 'Persistent feedback and state surface.',
  },
  'component.feedback.color.border': {
    value: '{color.semantic.border.subtle}',
    type: 'color',
    description: 'Persistent feedback and state boundary.',
  },
  'component.feedback.color.text': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Persistent feedback primary text.',
  },
  'component.feedback.color.detail': {
    value: '{color.semantic.text.secondary}',
    type: 'color',
    description: 'Persistent feedback supporting text.',
  },
  'component.feedback.color.offline': {
    value: '{color.semantic.availability.offline}',
    type: 'color',
    description: 'Offline availability marker independent from condition.',
  },
  'component.feedback.color.stale': {
    value: '{color.semantic.knowledge.confirmed}',
    type: 'color',
    description: 'Neutral stale-knowledge marker independent from caution condition.',
  },
  'component.feedback.color.progress': {
    value: '{color.semantic.activity.pending}',
    type: 'color',
    description: 'Native progress accent without outcome meaning.',
  },
  'component.feedback.color.skeleton': {
    value: '{color.semantic.surface.raised}',
    type: 'color',
    description: 'Nonsemantic skeleton placeholder surface.',
  },
  'component.feedback.radius': {
    value: '{shape.radius.panel}',
    type: 'dimension',
    description: 'Persistent feedback and state surface radius.',
  },
  'component.feedback.radius.compact': {
    value: '{shape.radius.signal}',
    type: 'dimension',
    description: 'Compact badge and freshness-marker radius.',
  },
  'component.feedback.space': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Density-aware persistent feedback edge spacing.',
  },
  'component.feedback.space.related': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Spacing between closely related feedback anatomy.',
  },
  'component.feedback.size.marker': {
    value: '{border.width.band}',
    type: 'dimension',
    description: 'Redundant feedback condition or availability marker thickness.',
  },
  'component.feedback.size.progress': {
    value: '0.625rem',
    type: 'dimension',
    description: 'Native progress visual track block size.',
  },
  'component.feedback.size.skeleton-line': {
    value: '0.875rem',
    type: 'dimension',
    description: 'Text skeleton line block size.',
  },
  'component.feedback.motion.skeleton': {
    value: '1200ms',
    type: 'duration',
    description: 'Optional non-semantic skeleton pulse duration.',
  },
  'component.toast.color.background': {
    value: '{color.semantic.surface.raised}',
    type: 'color',
    description: 'Raised temporary-feedback surface.',
  },
  'component.toast.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Temporary-feedback surface boundary.',
  },
  'component.toast.color.text': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Temporary-feedback primary text.',
  },
  'component.toast.color.detail': {
    value: '{color.semantic.text.secondary}',
    type: 'color',
    description: 'Temporary-feedback supporting text.',
  },
  'component.toast.radius': {
    value: '{shape.radius.panel}',
    type: 'dimension',
    description: 'Temporary-feedback surface radius.',
  },
  'component.toast.space': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Density-aware temporary-feedback edge spacing.',
  },
  'component.toast.space.related': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Spacing between closely related toast anatomy.',
  },
  'component.toast.space.viewport': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Viewport-safe toast-region inset and stack spacing.',
  },
  'component.toast.size.inline-maximum': {
    value: '24rem',
    type: 'dimension',
    description: 'Maximum readable toast inline size.',
  },
  'component.toast.size.marker': {
    value: '{border.width.band}',
    type: 'dimension',
    description: 'Redundant toast condition marker thickness.',
  },
  'component.toast.size.control-minimum': {
    value: '{component.button.size.minimum}',
    type: 'dimension',
    description: 'Minimum component-owned toast close target.',
  },
  'component.toast.elevation': {
    value: '{elevation.panel}',
    type: 'shadow',
    description: 'Temporary-feedback elevation above document content.',
  },
  'component.toast.motion': {
    value: '{motion.duration.fast}',
    type: 'duration',
    description: 'Optional short toast entry and exit transition.',
  },
  'component.confirmation.color.backdrop': {
    value: '{color.semantic.modal.backdrop}',
    type: 'color',
    description: 'Modal backdrop separating a confirmation decision from inert page content.',
  },
  'component.confirmation.color.background': {
    value: '{color.semantic.surface.panel}',
    type: 'color',
    description: 'Confirmation decision surface.',
  },
  'component.confirmation.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Confirmation surface and secondary-action boundary.',
  },
  'component.confirmation.color.marker': {
    value: '{color.semantic.structure.band}',
    type: 'color',
    description: 'Neutral structural marker separating the modal decision surface.',
  },
  'component.confirmation.color.text': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Confirmation heading and primary text.',
  },
  'component.confirmation.color.detail': {
    value: '{color.semantic.text.secondary}',
    type: 'color',
    description: 'Confirmation consequence description.',
  },
  'component.confirmation.color.cancel-background': {
    value: '{color.semantic.surface.inset}',
    type: 'color',
    description: 'Safe cancellation control background.',
  },
  'component.confirmation.color.cancel-background-hover': {
    value: '{color.semantic.surface.raised}',
    type: 'color',
    description: 'Safe cancellation control hover background.',
  },
  'component.confirmation.color.action': {
    value: '{color.semantic.action.primary}',
    type: 'color',
    description: 'Ordinary confirmed-action background.',
  },
  'component.confirmation.color.action-hover': {
    value: '{color.semantic.action.hover}',
    type: 'color',
    description: 'Ordinary confirmed-action hover background.',
  },
  'component.confirmation.color.action-critical': {
    value: '{color.semantic.action.critical}',
    type: 'color',
    description: 'Genuinely harmful confirmed-action background.',
  },
  'component.confirmation.color.action-critical-hover': {
    value: '{color.semantic.action.critical}',
    type: 'color',
    description: 'Genuinely harmful confirmed-action hover background.',
  },
  'component.confirmation.color.action-critical-text': {
    value: '{color.semantic.text.inverse}',
    type: 'color',
    description: 'High-contrast text on filled critical confirmation actions.',
  },
  'component.confirmation.color.action-text': {
    value: '{color.semantic.text.inverse}',
    type: 'color',
    description: 'Filled confirmation action text.',
  },
  'component.confirmation.radius': {
    value: '{shape.radius.panel}',
    type: 'dimension',
    description: 'Confirmation decision surface radius.',
  },
  'component.confirmation.space': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Density-aware confirmation edge spacing.',
  },
  'component.confirmation.space.related': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Spacing between closely related confirmation anatomy.',
  },
  'component.confirmation.space.viewport': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Viewport-safe confirmation inset.',
  },
  'component.confirmation.size.inline-maximum': {
    value: '32rem',
    type: 'dimension',
    description: 'Maximum readable confirmation inline size.',
  },
  'component.confirmation.size.marker': {
    value: '{border.width.band}',
    type: 'dimension',
    description: 'Neutral confirmation structure marker thickness.',
  },
  'component.confirmation.size.control-minimum': {
    value: '{component.button.size.minimum}',
    type: 'dimension',
    description: 'Minimum component-owned confirmation control target.',
  },
  'component.confirmation.elevation': {
    value: '{elevation.panel}',
    type: 'shadow',
    description: 'Confirmation elevation above inert document content.',
  },
  'component.confirmation.motion': {
    value: '{motion.duration.fast}',
    type: 'duration',
    description: 'Optional short confirmation entry transition.',
  },
  'component.confirmation.motion-distance': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Optional short confirmation entry translation.',
  },
  'component.dialog.color.backdrop': {
    value: '{color.semantic.modal.backdrop}',
    type: 'color',
    description: 'Native content-dialog backdrop.',
  },
  'component.dialog.color.background': {
    value: '{color.semantic.surface.panel}',
    type: 'color',
    description: 'General modal content surface.',
  },
  'component.dialog.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'General modal surface and close-control boundary.',
  },
  'component.dialog.color.text': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'General modal heading and primary text.',
  },
  'component.dialog.color.detail': {
    value: '{color.semantic.text.secondary}',
    type: 'color',
    description: 'General modal supporting text.',
  },
  'component.dialog.color.close-background': {
    value: '{color.semantic.surface.inset}',
    type: 'color',
    description: 'General modal close-control background.',
  },
  'component.dialog.color.close-background-hover': {
    value: '{color.semantic.surface.raised}',
    type: 'color',
    description: 'General modal close-control hover background.',
  },
  'component.dialog.radius': {
    value: '{shape.radius.panel}',
    type: 'dimension',
    description: 'General modal surface radius.',
  },
  'component.dialog.space': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Density-aware general modal edge spacing.',
  },
  'component.dialog.space.related': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Spacing between related general modal anatomy.',
  },
  'component.dialog.space.viewport': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Viewport-safe general modal inset.',
  },
  'component.dialog.size.inline-maximum.compact': {
    value: '28rem',
    type: 'dimension',
    description: 'Maximum inline size for short bounded modal content.',
  },
  'component.dialog.size.inline-maximum.standard': {
    value: '42rem',
    type: 'dimension',
    description: 'Maximum inline size for ordinary modal content.',
  },
  'component.dialog.size.inline-maximum.wide': {
    value: '64rem',
    type: 'dimension',
    description: 'Maximum inline size for deliberately wide modal content.',
  },
  'component.dialog.size.control-minimum': {
    value: '{component.button.size.minimum}',
    type: 'dimension',
    description: 'Minimum component-owned content-dialog close target.',
  },
  'component.dialog.elevation': {
    value: '{elevation.panel}',
    type: 'shadow',
    description: 'General modal elevation above inert document content.',
  },
  'component.dialog.motion': {
    value: '{motion.duration.fast}',
    type: 'duration',
    description: 'Optional short content-dialog entry transition.',
  },
  'component.dialog.motion-distance': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Optional short content-dialog entry translation.',
  },
  'component.media-viewer.color.backdrop': {
    value: '{color.semantic.modal.backdrop}',
    type: 'color',
    description: 'Native media-viewer backdrop.',
  },
  'component.media-viewer.color.background': {
    value: '{color.semantic.surface.panel}',
    type: 'color',
    description: 'Media-viewer modal surface.',
  },
  'component.media-viewer.color.viewport': {
    value: '{color.semantic.surface.canvas}',
    type: 'color',
    description: 'Neutral media inspection viewport.',
  },
  'component.media-viewer.color.border': {
    value: '{color.semantic.border.strong}',
    type: 'color',
    description: 'Media-viewer surface, viewport, and control boundary.',
  },
  'component.media-viewer.color.text': {
    value: '{color.semantic.text.primary}',
    type: 'color',
    description: 'Media-viewer heading and primary text.',
  },
  'component.media-viewer.color.detail': {
    value: '{color.semantic.text.secondary}',
    type: 'color',
    description: 'Media-viewer context, caption, and scale text.',
  },
  'component.media-viewer.color.control-background': {
    value: '{color.semantic.surface.inset}',
    type: 'color',
    description: 'Media-viewer control background.',
  },
  'component.media-viewer.color.control-background-hover': {
    value: '{color.semantic.surface.raised}',
    type: 'color',
    description: 'Media-viewer control hover background.',
  },
  'component.media-viewer.color.control-selected': {
    value: '{color.semantic.selection.indicator}',
    type: 'color',
    description: 'Selected fit or actual-size view reinforcement.',
  },
  'component.media-viewer.radius': {
    value: '{shape.radius.panel}',
    type: 'dimension',
    description: 'Media-viewer surface and viewport radius.',
  },
  'component.media-viewer.space': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Density-aware media-viewer edge spacing.',
  },
  'component.media-viewer.space.related': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Spacing between related media-viewer anatomy.',
  },
  'component.media-viewer.space.viewport': {
    value: '{space.reference.4}',
    type: 'dimension',
    description: 'Viewport-safe media-viewer inset.',
  },
  'component.media-viewer.size.inline-maximum': {
    value: '80rem',
    type: 'dimension',
    description: 'Maximum media-viewer inline size on large displays.',
  },
  'component.media-viewer.size.viewport-minimum': {
    value: '12rem',
    type: 'dimension',
    description: 'Preferred minimum media viewport block size when space permits.',
  },
  'component.media-viewer.size.control-minimum': {
    value: '{component.button.size.minimum}',
    type: 'dimension',
    description: 'Minimum component-owned media-viewer control target.',
  },
  'component.media-viewer.elevation': {
    value: '{elevation.panel}',
    type: 'shadow',
    description: 'Media-viewer elevation above inert document content.',
  },
  'component.media-viewer.motion': {
    value: '{motion.duration.fast}',
    type: 'duration',
    description: 'Optional short media-viewer entry and scale transition.',
  },
  'component.media-viewer.motion-distance': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Optional short media-viewer entry translation.',
  },
} as const satisfies Record<string, TokenDefinition>;

export type TokenName = keyof typeof tokens;
