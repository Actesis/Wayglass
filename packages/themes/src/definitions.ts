import type { TokenName } from '@wayglass/tokens';

export const phase1ThemeNames = ['wayglass-dark', 'wayglass-light'] as const;
export const plannedThemeNames = ['wayglass-high-contrast', 'wayglass-dim'] as const;
export const densityNames = ['compact', 'comfortable'] as const;
export const themeSelectionNames = ['system', ...phase1ThemeNames] as const;

export type Phase1ThemeName = (typeof phase1ThemeNames)[number];
export type PlannedThemeName = (typeof plannedThemeNames)[number];
export type DensityName = (typeof densityNames)[number];
export type ThemeSelectionName = (typeof themeSelectionNames)[number];

export interface ThemeSelection {
  readonly name: ThemeSelectionName;
  readonly density: DensityName;
}

type TokenOverrides = Readonly<Partial<Record<TokenName, TokenName>>>;

export const themeTokenOverrides = {
  'wayglass-dark': {
    'color.semantic.surface.canvas': 'color.reference.ink.950',
    'color.semantic.surface.panel': 'color.reference.ink.800',
    'color.semantic.surface.inset': 'color.reference.ink.900',
    'color.semantic.surface.raised': 'color.reference.ink.700',
    'color.semantic.text.primary': 'color.reference.paper.50',
    'color.semantic.text.secondary': 'color.reference.ink.300',
    'color.semantic.text.inverse': 'color.reference.ink.950',
    'color.semantic.border.subtle': 'color.reference.ink.700',
    'color.semantic.border.strong': 'color.reference.ink.500',
    'color.semantic.structure.band': 'color.reference.ink.500',
    'color.semantic.action.primary': 'color.reference.blue.500',
    'color.semantic.action.hover': 'color.reference.blue.400',
    'color.semantic.action.active': 'color.reference.blue.600',
    'color.semantic.action.critical': 'color.reference.red.500',
    'color.semantic.selection.indicator': 'color.reference.blue.500',
    'color.semantic.condition.neutral': 'color.reference.ink.500',
    'color.semantic.condition.informational': 'color.reference.blue.500',
    'color.semantic.condition.positive': 'color.reference.green.500',
    'color.semantic.condition.caution': 'color.reference.amber.500',
    'color.semantic.condition.critical': 'color.reference.red.500',
    'color.semantic.knowledge.confirmed': 'color.reference.ink.300',
    'color.semantic.knowledge.inferred': 'color.reference.blue.400',
    'color.semantic.knowledge.stale': 'color.reference.amber.500',
    'color.semantic.knowledge.unknown': 'color.reference.ink.500',
    'color.semantic.knowledge.conflicting': 'color.reference.amber.500',
    'color.semantic.knowledge.unavailable': 'color.reference.ink.500',
    'color.semantic.activity.idle': 'color.reference.ink.500',
    'color.semantic.activity.pending': 'color.reference.blue.500',
    'color.semantic.availability.offline': 'color.reference.ink.500',
    'color.semantic.value.asserted': 'color.reference.blue.500',
    'color.semantic.value.not-asserted': 'color.reference.ink.500',
    'color.semantic.focus.ring': 'color.reference.blue.400',
    'color.semantic.data.series.1': 'color.reference.blue.500',
    'color.semantic.data.series.2': 'color.reference.green.500',
    'component.button.color.critical': 'color.reference.red.500',
  },
  'wayglass-light': {
    'color.semantic.surface.canvas': 'color.reference.paper.50',
    'color.semantic.surface.panel': 'color.reference.paper.100',
    'color.semantic.surface.inset': 'color.reference.paper.50',
    'color.semantic.surface.raised': 'color.reference.paper.200',
    'color.semantic.text.primary': 'color.reference.ink.950',
    'color.semantic.text.secondary': 'color.reference.ink.700',
    'color.semantic.text.inverse': 'color.reference.ink.950',
    'color.semantic.border.subtle': 'color.reference.paper.200',
    'color.semantic.border.strong': 'color.reference.ink.500',
    'color.semantic.structure.band': 'color.reference.ink.500',
    'color.semantic.action.primary': 'color.reference.blue.500',
    'color.semantic.action.hover': 'color.reference.blue.400',
    'color.semantic.action.active': 'color.reference.blue.600',
    'color.semantic.action.critical': 'color.reference.red.700',
    'color.semantic.selection.indicator': 'color.reference.blue.600',
    'color.semantic.condition.neutral': 'color.reference.ink.500',
    'color.semantic.condition.informational': 'color.reference.blue.600',
    'color.semantic.condition.positive': 'color.reference.green.700',
    'color.semantic.condition.caution': 'color.reference.amber.700',
    'color.semantic.condition.critical': 'color.reference.red.700',
    'color.semantic.knowledge.confirmed': 'color.reference.ink.700',
    'color.semantic.knowledge.inferred': 'color.reference.blue.600',
    'color.semantic.knowledge.stale': 'color.reference.amber.700',
    'color.semantic.knowledge.unknown': 'color.reference.ink.500',
    'color.semantic.knowledge.conflicting': 'color.reference.amber.700',
    'color.semantic.knowledge.unavailable': 'color.reference.ink.500',
    'color.semantic.activity.idle': 'color.reference.ink.500',
    'color.semantic.activity.pending': 'color.reference.blue.600',
    'color.semantic.availability.offline': 'color.reference.ink.500',
    'color.semantic.value.asserted': 'color.reference.blue.600',
    'color.semantic.value.not-asserted': 'color.reference.ink.500',
    'color.semantic.focus.ring': 'color.reference.blue.600',
    'color.semantic.data.series.1': 'color.reference.blue.600',
    'color.semantic.data.series.2': 'color.reference.green.700',
    'component.button.color.critical': 'color.reference.red.500',
  },
} as const satisfies Readonly<Record<Phase1ThemeName, TokenOverrides>>;

export const densityTokenOverrides = {
  compact: {
    'component.canvas.space.block': 'space.semantic.page.compact',
    'component.canvas.space.inline': 'space.semantic.page.compact',
    'component.panel.space': 'space.reference.3',
    'component.panel.space.section': 'space.semantic.section.compact',
    'component.button.space.block': 'space.reference.3',
    'component.button.space.inline': 'space.reference.4',
    'component.tab-list.space': 'space.reference.1',
    'component.tab.space.block': 'space.reference.2',
    'component.tab.space.inline': 'space.reference.4',
    'component.tab-panel.space': 'space.reference.4',
    'component.toggle.space': 'space.reference.2',
    'component.segmented.space': 'space.reference.2',
    'component.navigation-rail.space': 'space.reference.1',
    'component.menu.space': 'space.reference.2',
    'component.form.space.group': 'space.reference.2',
    'component.form.space.control-inline': 'space.reference.4',
    'component.form.space.choice': 'space.reference.2',
    'component.form-action.space.inline': 'space.reference.4',
    'component.surface.space.compact': 'space.reference.2',
    'component.surface.space.comfortable': 'space.reference.4',
    'component.layout.space.related': 'space.semantic.layout.related.compact',
    'component.layout.space.section': 'space.semantic.layout.section.compact',
    'component.layout.space.function': 'space.semantic.layout.function.compact',
    'component.frame.space.compact': 'space.reference.2',
    'component.frame.space.comfortable': 'space.reference.4',
    'component.media.state-space': 'space.reference.3',
    'component.status-indicator.space': 'space.reference.2',
    'component.boolean-value.space': 'space.reference.2',
    'component.metric.space': 'space.reference.2',
    'component.value-tile.space': 'space.reference.4',
    'component.value-tile.space.section': 'space.semantic.section.compact',
    'component.feedback.space': 'space.reference.3',
  },
  comfortable: {
    'component.canvas.space.block': 'space.semantic.page.comfortable',
    'component.canvas.space.inline': 'space.semantic.page.comfortable',
    'component.panel.space': 'space.reference.6',
    'component.panel.space.section': 'space.semantic.section.comfortable',
    'component.button.space.block': 'space.reference.3',
    'component.button.space.inline': 'space.reference.6',
    'component.tab-list.space': 'space.reference.2',
    'component.tab.space.block': 'space.reference.3',
    'component.tab.space.inline': 'space.reference.6',
    'component.tab-panel.space': 'space.reference.6',
    'component.toggle.space': 'space.reference.3',
    'component.segmented.space': 'space.reference.3',
    'component.navigation-rail.space': 'space.reference.2',
    'component.menu.space': 'space.reference.3',
    'component.form.space.group': 'space.reference.3',
    'component.form.space.control-inline': 'space.reference.6',
    'component.form.space.choice': 'space.reference.3',
    'component.form-action.space.inline': 'space.reference.6',
    'component.surface.space.compact': 'space.reference.3',
    'component.surface.space.comfortable': 'space.reference.6',
    'component.layout.space.related': 'space.semantic.layout.related.comfortable',
    'component.layout.space.section': 'space.semantic.layout.section.comfortable',
    'component.layout.space.function': 'space.semantic.layout.function.comfortable',
    'component.frame.space.compact': 'space.reference.3',
    'component.frame.space.comfortable': 'space.reference.6',
    'component.media.state-space': 'space.reference.4',
    'component.status-indicator.space': 'space.reference.3',
    'component.boolean-value.space': 'space.reference.3',
    'component.metric.space': 'space.reference.3',
    'component.value-tile.space': 'space.reference.6',
    'component.value-tile.space.section': 'space.semantic.section.comfortable',
    'component.feedback.space': 'space.reference.6',
  },
} as const satisfies Readonly<Record<DensityName, TokenOverrides>>;

export function isPhase1ThemeName(value: unknown): value is Phase1ThemeName {
  return typeof value === 'string' && phase1ThemeNames.some((name) => name === value);
}

export function isDensityName(value: unknown): value is DensityName {
  return typeof value === 'string' && densityNames.some((name) => name === value);
}

export function isThemeSelectionName(value: unknown): value is ThemeSelectionName {
  return value === 'system' || isPhase1ThemeName(value);
}

export function resolveSystemTheme(prefersDark: boolean): Phase1ThemeName {
  return prefersDark ? 'wayglass-dark' : 'wayglass-light';
}
