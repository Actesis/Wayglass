import { describe, expect, it } from 'vitest';

import {
  createCss,
  createJson,
  tokenNameToCssCustomProperty,
  validateTokens,
} from '../src/compiler.js';
import { tokens } from '../src/definitions.js';

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

function referenceColor(name: keyof typeof tokens): string {
  const value = tokens[name].value;

  if (typeof value !== 'string' || !value.startsWith('#')) {
    throw new Error(`Token "${name}" is not a reference color.`);
  }

  return value;
}

describe('token compiler', () => {
  it('converts token paths to public CSS custom-property names', () => {
    expect(tokenNameToCssCustomProperty('color.semantic.condition.critical')).toBe(
      '--wg-color-semantic-condition-critical',
    );
  });

  it('produces deterministic, prefixed CSS custom properties', () => {
    const firstBuild = createCss(tokens);
    const secondBuild = createCss(tokens);

    expect(firstBuild).toBe(secondBuild);
    expect(firstBuild).toContain('--wg-color-semantic-condition-critical');
    expect(firstBuild).toContain('--wg-color-semantic-value-asserted');
    expect(firstBuild).toContain('--wg-color-semantic-selection-indicator');
    expect(firstBuild).toContain('--wg-component-button-size-minimum');
    expect(firstBuild).toContain('--wg-component-tab-size-minimum');
    expect(firstBuild).toContain('--wg-component-tab-panel-color-background');
    expect(firstBuild).toContain('--wg-component-value-tile-space-section');
    expect(firstBuild).toContain('--wg-component-focus-ring-color');
    expect(firstBuild).toContain('--wg-component-surface-color-panel');
    expect(firstBuild).toContain('--wg-component-divider-size-strong');
    expect(firstBuild).toContain('--wg-component-icon-size-standard');
    expect(firstBuild).toContain('var(--wg-color-reference-red-500)');
  });

  it('produces DTCG-shaped JSON metadata', () => {
    const output = JSON.parse(createJson(tokens)) as Record<
      string,
      { $description: string; $type: string; $value: string | number | readonly number[] }
    >;

    expect(output['color.semantic.surface.canvas']).toEqual({
      $description: 'Primary application canvas in the default dark theme.',
      $type: 'color',
      $value: '{color.reference.ink.950}',
    });
  });

  it('rejects missing token references', () => {
    expect(() =>
      validateTokens({
        'color.semantic.invalid': {
          value: '{color.reference.missing}',
          type: 'color',
          description: 'Invalid test token.',
        },
      }),
    ).toThrow(/missing token/);
  });

  it('contains the locked Phase 1 token layers without provisional metadata', () => {
    const names = Object.keys(tokens);
    const descriptions = Object.values(tokens).map(({ description }) => description);

    expect(names.some((name) => name.startsWith('color.reference.'))).toBe(true);
    expect(names.some((name) => name.startsWith('color.semantic.'))).toBe(true);
    expect(names.some((name) => name.startsWith('component.'))).toBe(true);
    expect(names).toEqual(
      expect.arrayContaining([
        'color.semantic.condition.positive',
        'color.semantic.knowledge.stale',
        'color.semantic.activity.pending',
        'color.semantic.value.asserted',
        'color.semantic.section.information',
        'border.semantic.function',
        'component.rail.color',
        'component.status-indicator.color.condition',
        'component.boolean-value.size.rail',
      ]),
    );
    expect(descriptions.some((description) => /provisional/i.test(description))).toBe(false);
  });

  it('contains the locked Phase 2A selection and tabs token layers', () => {
    const names = Object.keys(tokens);

    expect(names).toEqual(
      expect.arrayContaining([
        'color.semantic.selection.indicator',
        'color.semantic.selection.surface',
        'color.semantic.selection.text',
        'component.tab-list.space',
        'component.tab.color.background',
        'component.tab.color.background-selected',
        'component.tab.color.selection',
        'component.tab.size.minimum',
        'component.tab.size.selection',
        'component.tab-panel.color.background',
        'component.tab-panel.space',
      ]),
    );
  });

  it('contains the locked Phase 2C foundation token roles', () => {
    const names = Object.keys(tokens);

    expect(names).toEqual(
      expect.arrayContaining([
        'size.icon.compact',
        'size.icon.standard',
        'size.icon.prominent',
        'component.focus-ring.color',
        'component.focus-ring.width',
        'component.focus-ring.offset',
        'component.surface.color.panel',
        'component.surface.color.inset',
        'component.surface.color.raised',
        'component.surface.color.border',
        'component.surface.color.border-strong',
        'component.surface.space.compact',
        'component.surface.space.comfortable',
        'component.divider.color',
        'component.divider.size.standard',
        'component.divider.size.strong',
      ]),
    );
  });

  it('contains the locked Phase 2D-C menu token roles', () => {
    const names = Object.keys(tokens);

    expect(names).toEqual(
      expect.arrayContaining([
        'component.menu.color.trigger-background',
        'component.menu.color.popup-background',
        'component.menu.color.item-background-hover',
        'component.menu.color.border',
        'component.menu.color.text',
        'component.menu.color.detail',
        'component.menu.radius.trigger',
        'component.menu.radius.popup',
        'component.menu.elevation',
        'component.menu.space',
        'component.menu.space.popup',
        'component.menu.space.offset',
        'component.menu.space.viewport',
        'component.menu.size.trigger-minimum',
        'component.menu.size.item-minimum',
        'component.menu.size.inline-minimum',
        'component.menu.size.inline-maximum',
        'component.menu.size.block-maximum',
      ]),
    );
  });

  it('contains the locked Phase 2D-D form-foundation token roles', () => {
    const names = Object.keys(tokens);

    expect(names).toEqual(
      expect.arrayContaining([
        'component.form.color.label',
        'component.form.color.requirement',
        'component.form.color.help',
        'component.form.color.error',
        'component.form.color.control-background',
        'component.form.color.control-background-readonly',
        'component.form.color.control-text',
        'component.form.color.control-placeholder',
        'component.form.color.control-accent',
        'component.form.color.control-border',
        'component.form.color.control-border-invalid',
        'component.form.radius.control',
        'component.form.space.group',
        'component.form.space.label',
        'component.form.space.message',
        'component.form.space.control-block',
        'component.form.space.control-inline',
        'component.form.space.choice',
        'component.form.size.control-minimum',
        'component.form.size.choice',
        'component.form.size.error-signal',
        'component.form-action.color.background',
        'component.form-action.color.background-hover',
        'component.form-action.color.border',
        'component.form-action.color.text',
        'component.form-action.radius',
        'component.form-action.space.block',
        'component.form-action.space.inline',
        'component.form-action.size.minimum',
      ]),
    );
  });

  it('contains the locked Phase 2E-B persistent-feedback token roles', () => {
    const names = Object.keys(tokens);

    expect(names).toEqual(
      expect.arrayContaining([
        'color.semantic.availability.offline',
        'component.feedback.color.background',
        'component.feedback.color.offline',
        'component.feedback.color.stale',
        'component.feedback.color.progress',
        'component.feedback.color.skeleton',
        'component.feedback.radius',
        'component.feedback.radius.compact',
        'component.feedback.space',
        'component.feedback.space.related',
        'component.feedback.size.marker',
        'component.feedback.size.progress',
        'component.feedback.size.skeleton-line',
        'component.feedback.motion.skeleton',
      ]),
    );
  });

  it('contains the locked Phase 2E-C transient-feedback token roles', () => {
    const names = Object.keys(tokens);

    expect(names).toEqual(
      expect.arrayContaining([
        'component.toast.color.background',
        'component.toast.color.border',
        'component.toast.color.text',
        'component.toast.color.detail',
        'component.toast.radius',
        'component.toast.space',
        'component.toast.space.related',
        'component.toast.space.viewport',
        'component.toast.size.inline-maximum',
        'component.toast.size.marker',
        'component.toast.size.control-minimum',
        'component.toast.elevation',
        'component.toast.motion',
      ]),
    );
  });

  it('contains the locked Phase 2C layout token roles and mirrored split thresholds', () => {
    const names = Object.keys(tokens);

    expect(names).toEqual(
      expect.arrayContaining([
        'component.layout.space.related',
        'component.layout.space.section',
        'component.layout.space.function',
        'component.frame.color.background',
        'component.frame.color.border',
        'component.frame.border-size.standard',
        'component.frame.border-size.strong',
        'component.frame.space.compact',
        'component.frame.space.comfortable',
        'component.grid.item-minimum.compact',
        'component.grid.item-minimum.standard',
        'component.grid.item-minimum.wide',
        'component.split.region-minimum.compact',
        'component.split.region-minimum.standard',
        'component.split.region-minimum.wide',
        'component.split.ratio.equal',
        'component.split.ratio.emphasized',
        'component.split.breakpoint.compact',
        'component.split.breakpoint.standard',
        'component.split.breakpoint.wide',
        'component.scroll-region.max-block-size',
        'component.scroll-region.max-inline-size',
        'component.scroll-region.color.border',
        'component.scroll-region.focus-ring-color',
      ]),
    );
    expect(tokens['component.split.breakpoint.compact'].value).toBe('26rem');
    expect(tokens['component.split.breakpoint.standard'].value).toBe('38rem');
    expect(tokens['component.split.breakpoint.wide'].value).toBe('50rem');
  });

  it('contains the locked Phase 2C media token roles', () => {
    expect(Object.keys(tokens)).toEqual(
      expect.arrayContaining([
        'component.media.color.background',
        'component.media.color.border',
        'component.media.color.border-strong',
        'component.media.border-size.subtle',
        'component.media.border-size.strong',
        'component.media.radius',
        'component.media.min-block-size',
        'component.media.state-space',
      ]),
    );
  });

  it('contains the locked Phase 2F modal-content and media-viewer token roles', () => {
    expect(Object.keys(tokens)).toEqual(
      expect.arrayContaining([
        'color.semantic.modal.backdrop',
        'component.dialog.color.backdrop',
        'component.dialog.color.background',
        'component.dialog.color.border',
        'component.dialog.color.text',
        'component.dialog.color.detail',
        'component.dialog.color.close-background',
        'component.dialog.color.close-background-hover',
        'component.dialog.radius',
        'component.dialog.space',
        'component.dialog.space.related',
        'component.dialog.space.viewport',
        'component.dialog.size.inline-maximum.compact',
        'component.dialog.size.inline-maximum.standard',
        'component.dialog.size.inline-maximum.wide',
        'component.dialog.size.control-minimum',
        'component.dialog.elevation',
        'component.dialog.motion',
        'component.dialog.motion-distance',
        'component.media-viewer.color.backdrop',
        'component.media-viewer.color.background',
        'component.media-viewer.color.viewport',
        'component.media-viewer.color.border',
        'component.media-viewer.color.text',
        'component.media-viewer.color.detail',
        'component.media-viewer.color.control-background',
        'component.media-viewer.color.control-background-hover',
        'component.media-viewer.color.control-selected',
        'component.media-viewer.radius',
        'component.media-viewer.space',
        'component.media-viewer.space.related',
        'component.media-viewer.space.viewport',
        'component.media-viewer.size.inline-maximum',
        'component.media-viewer.size.viewport-minimum',
        'component.media-viewer.size.control-minimum',
        'component.media-viewer.elevation',
        'component.media-viewer.motion',
        'component.media-viewer.motion-distance',
      ]),
    );
    expect(tokens['component.dialog.size.inline-maximum.standard'].value).toBe('42rem');
    expect(tokens['component.media-viewer.size.inline-maximum'].value).toBe('80rem');
  });

  it('contains the locked Phase 3B scalar-data token roles', () => {
    expect(Object.keys(tokens)).toEqual(
      expect.arrayContaining([
        'color.semantic.data.change',
        'component.metric-group.color.background',
        'component.metric-group.color.border',
        'component.metric-group.color.heading',
        'component.metric-group.color.description',
        'component.metric-group.radius',
        'component.metric-group.space',
        'component.metric-group.space.item',
        'component.metric-group.size.item-minimum',
        'component.trend-indicator.color.signal',
        'component.trend-indicator.color.text',
        'component.trend-indicator.color.state',
        'component.trend-indicator.size.signal',
        'component.trend-indicator.width.signal',
        'component.trend-indicator.space',
        'component.key-value.color.label',
        'component.key-value.color.value',
        'component.key-value.color.state',
        'component.key-value.space',
        'component.key-value.size.label-minimum',
      ]),
    );
    expect(tokens['component.metric-group.size.item-minimum'].value).toBe('12rem');
    expect(tokens['component.key-value.size.label-minimum'].value).toBe('8rem');
  });

  it('contains the locked Phase 3C telemetry token roles', () => {
    expect(Object.keys(tokens)).toEqual(
      expect.arrayContaining([
        'component.telemetry-strip.color.background',
        'component.telemetry-strip.color.graphic-background',
        'component.telemetry-strip.color.border',
        'component.telemetry-strip.color.heading',
        'component.telemetry-strip.color.current',
        'component.telemetry-strip.color.series',
        'component.telemetry-strip.color.context',
        'component.telemetry-strip.color.state',
        'component.telemetry-strip.radius',
        'component.telemetry-strip.space',
        'component.telemetry-strip.space.related',
        'component.telemetry-strip.size.graphic-block',
        'component.telemetry-strip.width.series',
      ]),
    );
    expect(tokens['component.telemetry-strip.size.graphic-block'].value).toBe('7rem');
    expect(tokens['component.telemetry-strip.width.series'].value).toBe('{border.width.strong}');
  });

  it('contains the locked Phase 3D status-list token roles', () => {
    expect(Object.keys(tokens)).toEqual(
      expect.arrayContaining([
        'component.status-list.color.background',
        'component.status-list.color.border',
        'component.status-list.color.heading',
        'component.status-list.color.context',
        'component.status-list.radius',
        'component.status-list.space',
        'component.status-list.space.entry',
        'component.status-entry.color.background',
        'component.status-entry.color.border',
        'component.status-entry.color.heading',
        'component.status-entry.color.detail',
        'component.status-entry.color.state',
        'component.status-entry.color.condition',
        'component.status-entry.color.signal-border',
        'component.status-entry.radius',
        'component.status-entry.radius.signal',
        'component.status-entry.space',
        'component.status-entry.space.related',
        'component.status-entry.size.signal',
      ]),
    );
    expect(tokens['component.status-list.color.background'].value).toBe(
      '{color.semantic.surface.panel}',
    );
    expect(tokens['component.status-entry.color.condition'].value).toBe(
      '{color.semantic.condition.neutral}',
    );
    expect(tokens['component.status-entry.color.state'].value).toBe(
      '{color.semantic.text.primary}',
    );
    expect(tokens['component.status-entry.size.signal'].value).toBe('{size.signal.compact}');
  });

  it('contains the locked Phase 3E temporal-collection token roles', () => {
    expect(Object.keys(tokens)).toEqual(
      expect.arrayContaining([
        'component.timeline.color.background',
        'component.timeline.color.border',
        'component.timeline.color.heading',
        'component.timeline.color.context',
        'component.timeline.radius',
        'component.timeline.space',
        'component.timeline.space.item',
        'component.timeline-item.color.heading',
        'component.timeline-item.color.detail',
        'component.timeline-item.color.state',
        'component.timeline-item.color.condition',
        'component.timeline-item.color.sequence',
        'component.timeline-item.color.signal-border',
        'component.timeline-item.radius.signal',
        'component.timeline-item.space',
        'component.timeline-item.space.related',
        'component.timeline-item.size.signal',
        'component.timeline-item.width.sequence',
        'component.event-log.color.background',
        'component.event-log.color.border',
        'component.event-log.color.heading',
        'component.event-log.color.context',
        'component.event-log.radius',
        'component.event-log.space',
        'component.event-log.space.record',
        'component.event-record.color.background',
        'component.event-record.color.border',
        'component.event-record.color.summary',
        'component.event-record.color.detail',
        'component.event-record.color.state',
        'component.event-record.color.condition',
        'component.event-record.color.signal-border',
        'component.event-record.radius',
        'component.event-record.radius.signal',
        'component.event-record.space',
        'component.event-record.space.related',
        'component.event-record.size.signal',
      ]),
    );
    expect(tokens['component.timeline-item.color.sequence'].value).toBe(
      '{color.semantic.border.strong}',
    );
    expect(tokens['component.timeline-item.width.sequence'].value).toBe('{border.width.standard}');
    expect(tokens['component.event-record.color.condition'].value).toBe(
      '{color.semantic.condition.neutral}',
    );
    expect(tokens['component.event-record.size.signal'].value).toBe('{size.signal.compact}');
  });

  it('contains the locked Phase 3F filter and command composition token roles', () => {
    expect(Object.keys(tokens)).toEqual(
      expect.arrayContaining([
        'component.filter-bar.color.background',
        'component.filter-bar.color.border',
        'component.filter-bar.color.heading',
        'component.filter-bar.color.context',
        'component.filter-bar.radius',
        'component.filter-bar.space',
        'component.filter-bar.space.group',
        'component.command-bar.color.background',
        'component.command-bar.color.border',
        'component.command-bar.color.heading',
        'component.command-bar.color.context',
        'component.command-bar.radius',
        'component.command-bar.space',
        'component.command-bar.space.group',
      ]),
    );
    expect(tokens['component.filter-bar.color.background'].value).toBe(
      '{color.semantic.surface.panel}',
    );
    expect(tokens['component.filter-bar.color.border'].value).toBe(
      '{color.semantic.border.subtle}',
    );
    expect(tokens['component.command-bar.color.background'].value).toBe(
      '{color.semantic.surface.panel}',
    );
    expect(tokens['component.command-bar.color.context'].value).toBe(
      '{color.semantic.text.secondary}',
    );
  });

  it('contains the locked Phase 3G data-table token roles', () => {
    expect(Object.keys(tokens)).toEqual(
      expect.arrayContaining([
        'component.data-table.color.background',
        'component.data-table.color.table-background',
        'component.data-table.color.border',
        'component.data-table.color.row-separator',
        'component.data-table.color.caption',
        'component.data-table.color.header',
        'component.data-table.color.text',
        'component.data-table.color.context',
        'component.data-table.radius',
        'component.data-table.space',
        'component.data-table.space.group',
        'component.data-table.space.cell-block',
        'component.data-table.space.cell-inline',
      ]),
    );
    expect(tokens['component.data-table.color.background'].value).toBe(
      '{color.semantic.surface.panel}',
    );
    expect(tokens['component.data-table.color.table-background'].value).toBe(
      '{color.semantic.surface.inset}',
    );
    expect(tokens['component.data-table.color.row-separator'].value).toBe(
      '{color.semantic.border.subtle}',
    );
    expect(tokens['component.data-table.color.context'].value).toBe(
      '{color.semantic.text.secondary}',
    );
  });

  it('provides accessible contrast for the default dark-theme foundations', () => {
    const paper = referenceColor('color.reference.paper.50');
    const canvas = referenceColor('color.reference.ink.950');
    const panel = referenceColor('color.reference.ink.800');
    const supportingText = referenceColor('color.reference.ink.300');
    const strongBoundary = referenceColor('color.reference.ink.500');
    const action = referenceColor('color.reference.blue.500');

    expect(contrastRatio(paper, canvas)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(supportingText, panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(canvas, action)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(strongBoundary, panel)).toBeGreaterThanOrEqual(3);
  });
});
