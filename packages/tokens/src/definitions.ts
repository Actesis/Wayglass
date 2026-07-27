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
    description: 'Provisional deepest neutral reference.',
  },
  'color.reference.ink.800': {
    value: '#182231',
    type: 'color',
    description: 'Provisional elevated neutral reference.',
  },
  'color.reference.white': {
    value: '#f7f9fc',
    type: 'color',
    description: 'Provisional light neutral reference.',
  },
  'color.reference.blue.500': {
    value: '#4f8cff',
    type: 'color',
    description: 'Provisional informational reference.',
  },
  'color.reference.green.500': {
    value: '#3fcf8e',
    type: 'color',
    description: 'Provisional positive reference.',
  },
  'color.reference.amber.500': {
    value: '#f4b942',
    type: 'color',
    description: 'Provisional caution reference.',
  },
  'color.reference.red.500': {
    value: '#ff5d6c',
    type: 'color',
    description: 'Provisional critical reference.',
  },
  'color.semantic.surface.canvas': {
    value: '{color.reference.ink.950}',
    type: 'color',
    description: 'Primary application canvas.',
  },
  'color.semantic.surface.panel': {
    value: '{color.reference.ink.800}',
    type: 'color',
    description: 'Primary contained surface.',
  },
  'color.semantic.text.primary': {
    value: '{color.reference.white}',
    type: 'color',
    description: 'Primary text on dark operational surfaces.',
  },
  'color.semantic.action.primary': {
    value: '{color.reference.blue.500}',
    type: 'color',
    description: 'Primary interactive emphasis.',
  },
  'color.semantic.state.informational': {
    value: '{color.reference.blue.500}',
    type: 'color',
    description: 'Informational condition reinforcement.',
  },
  'color.semantic.state.positive': {
    value: '{color.reference.green.500}',
    type: 'color',
    description: 'Positive condition reinforcement.',
  },
  'color.semantic.state.caution': {
    value: '{color.reference.amber.500}',
    type: 'color',
    description: 'Caution condition reinforcement.',
  },
  'color.semantic.state.critical': {
    value: '{color.reference.red.500}',
    type: 'color',
    description: 'Critical condition reinforcement.',
  },
  'color.semantic.state.unknown': {
    value: '{color.reference.white}',
    type: 'color',
    description: 'Unknown knowledge-state reinforcement.',
  },
  'typography.family.body': {
    value: 'Inter, system-ui, sans-serif',
    type: 'fontFamily',
    description: 'Provisional body type stack.',
  },
  'typography.family.numeric': {
    value: 'ui-monospace, SFMono-Regular, monospace',
    type: 'fontFamily',
    description: 'Provisional numeric and identifier type stack.',
  },
  'typography.size.body': {
    value: '1rem',
    type: 'fontSize',
    description: 'Default body text size.',
  },
  'typography.weight.regular': {
    value: 400,
    type: 'fontWeight',
    description: 'Regular text weight.',
  },
  'typography.weight.emphasis': {
    value: 650,
    type: 'fontWeight',
    description: 'Emphasized text weight.',
  },
  'space.reference.1': {
    value: '0.25rem',
    type: 'dimension',
    description: 'Smallest provisional spacing step.',
  },
  'space.reference.2': {
    value: '0.5rem',
    type: 'dimension',
    description: 'Compact provisional spacing step.',
  },
  'space.reference.4': {
    value: '1rem',
    type: 'dimension',
    description: 'Base provisional spacing step.',
  },
  'space.reference.6': {
    value: '1.5rem',
    type: 'dimension',
    description: 'Large provisional spacing step.',
  },
  'space.semantic.control.inline': {
    value: '{space.reference.2}',
    type: 'dimension',
    description: 'Inline spacing inside controls.',
  },
  'size.touch.minimum': {
    value: '2.75rem',
    type: 'dimension',
    description: 'Minimum preferred interactive target size.',
  },
  'size.content.measure': {
    value: '72rem',
    type: 'dimension',
    description: 'Maximum readable documentation measure.',
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
    description: 'Provisional control radius.',
  },
  'shape.radius.panel': {
    value: '0.75rem',
    type: 'dimension',
    description: 'Provisional panel radius.',
  },
  'border.width.standard': {
    value: '0.0625rem',
    type: 'dimension',
    description: 'Standard visible boundary width.',
  },
  'elevation.panel': {
    value: '0 0.5rem 1.5rem rgb(0 0 0 / 20%)',
    type: 'shadow',
    description: 'Provisional panel elevation.',
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
    description: 'Provisional wide-phone container threshold.',
  },
  'breakpoint.desktop': {
    value: '64rem',
    type: 'dimension',
    description: 'Provisional desktop container threshold.',
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
  'color.data.series.1': {
    value: '{color.reference.blue.500}',
    type: 'color',
    description: 'First operational data-series role.',
  },
  'color.data.series.2': {
    value: '{color.reference.green.500}',
    type: 'color',
    description: 'Second operational data-series role.',
  },
} as const satisfies Record<string, TokenDefinition>;

export type TokenName = keyof typeof tokens;
