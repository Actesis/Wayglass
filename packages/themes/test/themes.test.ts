import { describe, expect, it } from 'vitest';

import { tokens } from '@wayglass/tokens';
import type { TokenName } from '@wayglass/tokens';
import {
  createThemeCss,
  densityNames,
  isDensityName,
  isPhase1ThemeName,
  isThemeSelectionName,
  phase1ThemeNames,
  plannedThemeNames,
  resolveSystemTheme,
  themeTokenOverrides,
} from '../src/index.js';
import type { Phase1ThemeName } from '../src/index.js';

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255,
  );
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function themeColor(theme: Phase1ThemeName, target: TokenName): string {
  const source = themeTokenOverrides[theme][target];
  const value = source ? tokens[source].value : undefined;

  if (typeof value !== 'string' || !value.startsWith('#')) {
    throw new Error(`Theme "${theme}" does not map "${target}" to a reference color.`);
  }

  return value;
}

describe('Phase 1 themes', () => {
  it('distinguishes implemented themes from planned themes', () => {
    expect(phase1ThemeNames).toEqual(['wayglass-dark', 'wayglass-light']);
    expect(plannedThemeNames).toEqual(['wayglass-high-contrast', 'wayglass-dim']);
    expect(densityNames).toEqual(['compact', 'comfortable']);
  });

  it('validates public theme and density names', () => {
    expect(isPhase1ThemeName('wayglass-dark')).toBe(true);
    expect(isPhase1ThemeName('wayglass-dim')).toBe(false);
    expect(isThemeSelectionName('system')).toBe(true);
    expect(isThemeSelectionName('unknown')).toBe(false);
    expect(isDensityName('comfortable')).toBe(true);
    expect(isDensityName('dense')).toBe(false);
  });

  it('resolves the synchronous system preference', () => {
    expect(resolveSystemTheme(true)).toBe('wayglass-dark');
    expect(resolveSystemTheme(false)).toBe('wayglass-light');
  });

  it.each(phase1ThemeNames)('%s meets foundational contrast thresholds', (theme) => {
    const canvas = themeColor(theme, 'color.semantic.surface.canvas');
    const panel = themeColor(theme, 'color.semantic.surface.panel');
    const inset = themeColor(theme, 'color.semantic.surface.inset');
    const primaryText = themeColor(theme, 'color.semantic.text.primary');
    const secondaryText = themeColor(theme, 'color.semantic.text.secondary');
    const inverseText = themeColor(theme, 'color.semantic.text.inverse');
    const action = themeColor(theme, 'color.semantic.action.primary');
    const criticalAction = themeColor(theme, 'component.button.color.critical');
    const strongBoundary = themeColor(theme, 'color.semantic.border.strong');
    const selectionIndicator = themeColor(theme, 'color.semantic.selection.indicator');
    const dataChange = themeColor(theme, 'color.semantic.data.change');
    const dataSeries = themeColor(theme, 'color.semantic.data.series.1');

    expect(contrastRatio(primaryText, canvas)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(secondaryText, panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(inverseText, action)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(inverseText, criticalAction)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(strongBoundary, panel)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(selectionIndicator, panel)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(dataChange, panel)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(dataSeries, inset)).toBeGreaterThanOrEqual(3);
  });

  it('generates deterministic theme and density selectors from token aliases', () => {
    const first = createThemeCss();
    const second = createThemeCss();

    expect(first).toBe(second);
    expect(first).toContain("[data-wg-theme='wayglass-dark']");
    expect(first).toContain("[data-wg-theme='wayglass-light']");
    expect(first).toContain("[data-wg-density='compact']");
    expect(first).toContain("[data-wg-density='comfortable']");
    expect(first).toContain(
      '--wg-color-semantic-condition-critical: var(--wg-color-reference-red-700)',
    );
    expect(first).toContain(
      '--wg-component-canvas-color-background: var(--wg-color-semantic-surface-canvas)',
    );
    expect(first).toContain(
      '--wg-component-panel-color-text: var(--wg-color-semantic-text-primary)',
    );
    expect(first).toContain('@media (forced-colors: active)');
    expect(first).toContain('--wg-color-semantic-surface-canvas: Canvas');
    expect(first).toContain('--wg-color-semantic-text-primary: CanvasText');
    expect(first).toContain('--wg-color-semantic-focus-ring: Highlight');
    expect(first).toContain('--wg-color-semantic-selection-indicator: Highlight');
    expect(first).toContain('--wg-color-semantic-data-change: CanvasText');
    expect(first).toContain('--wg-color-semantic-selection-surface: Canvas');
    expect(first).toContain('--wg-component-tab-space-inline: var(--wg-space-reference-6)');
    expect(first).toContain(
      '--wg-component-surface-space-comfortable: var(--wg-space-reference-6)',
    );
    expect(first).toContain(
      '--wg-component-layout-space-function: var(--wg-space-semantic-layout-function-comfortable)',
    );
    expect(first).toContain('--wg-component-frame-space-compact: var(--wg-space-reference-3)');
    expect(first).toContain('--wg-component-media-state-space: var(--wg-space-reference-4)');
    expect(first).toContain('--wg-component-menu-space: var(--wg-space-reference-3)');
    expect(first).toContain('--wg-component-form-space-group: var(--wg-space-reference-3)');
    expect(first).toContain(
      '--wg-component-form-space-control-inline: var(--wg-space-reference-6)',
    );
    expect(first).toContain('--wg-component-form-space-choice: var(--wg-space-reference-3)');
    expect(first).toContain('--wg-component-form-action-space-inline: var(--wg-space-reference-6)');
    expect(first).toContain('--wg-component-feedback-space: var(--wg-space-reference-6)');
    expect(first).toContain('--wg-component-toast-space: var(--wg-space-reference-6)');
    expect(first).toContain('--wg-component-dialog-space: var(--wg-space-reference-6)');
    expect(first).toContain('--wg-component-media-viewer-space: var(--wg-space-reference-6)');
    expect(first).toContain('--wg-component-metric-group-space: var(--wg-space-reference-6)');
    expect(first).toContain('--wg-component-metric-group-space-item: var(--wg-space-reference-3)');
    expect(first).toContain('--wg-component-trend-indicator-space: var(--wg-space-reference-2)');
    expect(first).toContain('--wg-component-key-value-space: var(--wg-space-reference-3)');
    expect(first).toContain('--wg-component-telemetry-strip-space: var(--wg-space-reference-3)');
    expect(first).toContain(
      '--wg-component-telemetry-strip-space-related: var(--wg-space-reference-1)',
    );
    expect(first).toContain('--wg-component-telemetry-strip-space: var(--wg-space-reference-6)');
    expect(first).toContain(
      '--wg-component-telemetry-strip-space-related: var(--wg-space-reference-2)',
    );
    expect(first).toContain('--wg-component-status-list-space: var(--wg-space-reference-3)');
    expect(first).toContain('--wg-component-status-list-space-entry: var(--wg-space-reference-1)');
    expect(first).toContain('--wg-component-status-entry-space: var(--wg-space-reference-3)');
    expect(first).toContain(
      '--wg-component-status-entry-space-related: var(--wg-space-reference-1)',
    );
    expect(first).toContain('--wg-component-status-list-space: var(--wg-space-reference-6)');
    expect(first).toContain('--wg-component-status-list-space-entry: var(--wg-space-reference-2)');
    expect(first).toContain('--wg-component-status-entry-space: var(--wg-space-reference-4)');
    expect(first).toContain(
      '--wg-component-status-entry-space-related: var(--wg-space-reference-2)',
    );
    expect(first).toContain('--wg-component-timeline-space: var(--wg-space-reference-3)');
    expect(first).toContain('--wg-component-timeline-space-item: var(--wg-space-reference-2)');
    expect(first).toContain('--wg-component-timeline-item-space: var(--wg-space-reference-3)');
    expect(first).toContain(
      '--wg-component-timeline-item-space-related: var(--wg-space-reference-1)',
    );
    expect(first).toContain('--wg-component-event-log-space: var(--wg-space-reference-3)');
    expect(first).toContain('--wg-component-event-log-space-record: var(--wg-space-reference-1)');
    expect(first).toContain('--wg-component-event-record-space: var(--wg-space-reference-2)');
    expect(first).toContain(
      '--wg-component-event-record-space-related: var(--wg-space-reference-1)',
    );
    expect(first).toContain('--wg-component-timeline-space: var(--wg-space-reference-6)');
    expect(first).toContain('--wg-component-timeline-space-item: var(--wg-space-reference-3)');
    expect(first).toContain('--wg-component-timeline-item-space: var(--wg-space-reference-4)');
    expect(first).toContain(
      '--wg-component-timeline-item-space-related: var(--wg-space-reference-2)',
    );
    expect(first).toContain('--wg-component-event-log-space: var(--wg-space-reference-6)');
    expect(first).toContain('--wg-component-event-log-space-record: var(--wg-space-reference-2)');
    expect(first).toContain('--wg-component-event-record-space: var(--wg-space-reference-3)');
    expect(first).toContain(
      '--wg-component-event-record-space-related: var(--wg-space-reference-2)',
    );
    expect(first).toContain('--wg-component-filter-bar-space: var(--wg-space-reference-3)');
    expect(first).toContain('--wg-component-filter-bar-space-group: var(--wg-space-reference-2)');
    expect(first).toContain('--wg-component-command-bar-space: var(--wg-space-reference-3)');
    expect(first).toContain('--wg-component-command-bar-space-group: var(--wg-space-reference-2)');
    expect(first).toContain('--wg-component-filter-bar-space: var(--wg-space-reference-6)');
    expect(first).toContain('--wg-component-filter-bar-space-group: var(--wg-space-reference-3)');
    expect(first).toContain('--wg-component-command-bar-space: var(--wg-space-reference-6)');
    expect(first).toContain('--wg-component-command-bar-space-group: var(--wg-space-reference-3)');
    expect(first).toContain('--wg-component-data-table-space: var(--wg-space-reference-3)');
    expect(first).toContain('--wg-component-data-table-space-group: var(--wg-space-reference-2)');
    expect(first).toContain(
      '--wg-component-data-table-space-cell-block: var(--wg-space-reference-2)',
    );
    expect(first).toContain(
      '--wg-component-data-table-space-cell-inline: var(--wg-space-reference-3)',
    );
    expect(first).toContain('--wg-component-data-table-space: var(--wg-space-reference-6)');
    expect(first).toContain('--wg-component-data-table-space-group: var(--wg-space-reference-3)');
    expect(first).toContain(
      '--wg-component-data-table-space-cell-block: var(--wg-space-reference-3)',
    );
    expect(first).toContain(
      '--wg-component-data-table-space-cell-inline: var(--wg-space-reference-4)',
    );
    expect(first).not.toContain('wayglass-high-contrast');
    expect(first).not.toContain('wayglass-dim');
  });
});
