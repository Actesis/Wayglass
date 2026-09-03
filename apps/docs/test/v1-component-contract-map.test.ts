import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

interface PackageManifest {
  readonly exports: Readonly<Record<string, unknown>>;
}

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');

const contractGroups = [
  ['docs/components/button.md', ['button']],
  ['docs/components/boolean-value.md', ['boolean-value']],
  ['docs/components/canvas.md', ['canvas']],
  ['docs/components/elbow.md', ['elbow']],
  ['docs/components/metric.md', ['metric']],
  ['docs/components/panel.md', ['panel']],
  ['docs/components/rail.md', ['rail']],
  ['docs/components/status-indicator.md', ['status-indicator']],
  ['docs/components/tabs.md', ['tab', 'tab-list', 'tab-panel', 'tabs']],
  ['docs/components/theme-provider.md', ['theme-provider']],
  ['docs/components/value-tile.md', ['value-tile']],
  ['docs/foundations/foundation-contracts.md', ['divider', 'surface']],
  [
    'docs/layout/layout-contracts.md',
    ['cluster', 'frame', 'grid', 'scroll-region', 'split', 'stack'],
  ],
  [
    'docs/controls/core-controls.md',
    ['icon-button', 'navigation-rail', 'segment', 'segmented-control', 'toggle'],
  ],
  ['docs/controls/menus-and-commands.md', ['command-item', 'menu']],
  ['docs/forms/form-foundation.md', ['field-label', 'field-message', 'form-group']],
  [
    'docs/forms/form-controls.md',
    ['checkbox', 'number-field', 'radio', 'select', 'slider', 'text-field'],
  ],
  [
    'docs/feedback/persistent-feedback-and-loading.md',
    ['alert', 'badge', 'empty-state', 'offline-state', 'progress', 'skeleton', 'stale-data-marker'],
  ],
  ['docs/feedback/transient-feedback.md', ['toast', 'toast-region']],
  ['docs/feedback/confirmation-dialog.md', ['confirmation-dialog']],
  ['docs/feedback/content-dialog.md', ['dialog']],
  ['docs/media/media-content.md', ['media']],
  ['docs/media/media-viewer.md', ['media-viewer']],
  ['docs/data/metrics-and-key-values.md', ['key-value', 'metric-group', 'trend-indicator']],
  ['docs/data/telemetry-strip.md', ['telemetry-strip']],
  ['docs/data/status-list.md', ['status-entry', 'status-list']],
  ['docs/data/temporal-collections.md', ['event-log', 'event-record', 'timeline', 'timeline-item']],
  ['docs/data/filter-and-command-patterns.md', ['command-bar', 'filter-bar']],
  ['docs/data/data-table.md', ['data-table']],
] as const;

const contractByModule = new Map(
  contractGroups.flatMap(([file, modules]) =>
    modules.map((moduleName) => [moduleName, file] as const),
  ),
);

describe('v1 component contract ownership', () => {
  const manifest = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'packages/elements/package.json'), 'utf8'),
  ) as PackageManifest;
  const componentModules = Object.keys(manifest.exports)
    .filter((entry) => entry.startsWith('./') && !entry.endsWith('.css'))
    .map((entry) => entry.slice(2))
    .sort();

  it('maps every element module to exactly one authoritative contract', () => {
    expect([...contractByModule.keys()].sort()).toEqual(componentModules);
    expect(contractByModule.size).toBe(componentModules.length);
  });

  it.each(contractGroups)('%s owns every mapped element contract', (file, modules) => {
    const contract = readFileSync(resolve(repositoryRoot, file), 'utf8');
    for (const moduleName of modules) expect(contract).toContain(`wg-${moduleName}`);
  });

  it('keeps React adaptation subordinate to the element contracts', () => {
    const reactContract = readFileSync(resolve(repositoryRoot, 'docs/frameworks/react.md'), 'utf8');
    expect(reactContract).toContain('@wayglass/react');
    expect(reactContract).toContain('without duplicating component behavior');
    expect(reactContract).toContain('Custom Elements');
  });
});
