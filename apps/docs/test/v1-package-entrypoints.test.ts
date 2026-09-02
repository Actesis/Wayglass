import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

interface PackageManifest {
  readonly exports: Readonly<Record<string, unknown>>;
}

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');

function exportKeys(packageName: string): readonly string[] {
  const manifest = JSON.parse(
    readFileSync(resolve(repositoryRoot, `packages/${packageName}/package.json`), 'utf8'),
  ) as PackageManifest;
  return Object.keys(manifest.exports).sort();
}

const elementEntryPoints = [
  '.',
  './alert',
  './badge',
  './empty-state',
  './event-log',
  './event-record',
  './offline-state',
  './progress',
  './skeleton',
  './stale-data-marker',
  './toast',
  './toast-region',
  './checkbox',
  './confirmation-dialog',
  './dialog',
  './number-field',
  './radio',
  './select',
  './slider',
  './text-field',
  './button',
  './boolean-value',
  './canvas',
  './cluster',
  './command-item',
  './command-bar',
  './data-table',
  './data-table.css',
  './divider',
  './elbow',
  './field-label',
  './field-message',
  './filter-bar',
  './foundations.css',
  './form-group',
  './forms.css',
  './frame',
  './grid',
  './icon-button',
  './metric',
  './metric-group',
  './key-value',
  './telemetry-strip',
  './trend-indicator',
  './media',
  './media.css',
  './media-viewer',
  './media-viewer.css',
  './menu',
  './navigation-rail',
  './panel',
  './rail',
  './scroll-region',
  './segment',
  './segmented-control',
  './split',
  './stack',
  './status-indicator',
  './status-entry',
  './status-list',
  './timeline',
  './timeline-item',
  './surface',
  './tab',
  './tab-list',
  './tab-panel',
  './tabs',
  './theme-provider',
  './toggle',
  './value-tile',
] as const;

const cssEntryPoints = new Set([
  './data-table.css',
  './foundations.css',
  './forms.css',
  './media.css',
  './media-viewer.css',
]);

describe('accepted v1 package entry points', () => {
  it.each([
    ['core', ['.']],
    ['tokens', ['.', './tokens.css', './tokens.json']],
    ['themes', ['.', './themes.css']],
    ['icons', ['.', './icon']],
  ] as const)('keeps @wayglass/%s entry points frozen', (packageName, expected) => {
    expect(exportKeys(packageName)).toEqual([...expected].sort());
  });

  it('keeps @wayglass/elements entry points frozen', () => {
    expect(exportKeys('elements')).toEqual([...elementEntryPoints].sort());
  });

  it('keeps React entry points paired with every element module and no CSS entries', () => {
    expect(exportKeys('react')).toEqual(
      elementEntryPoints.filter((entryPoint) => !cssEntryPoints.has(entryPoint)).sort(),
    );
  });

  it('keeps excluded repository packages out of the accepted v1 entry-point baseline', () => {
    expect(exportKeys('testing')).toEqual(['.']);
    expect(exportKeys('eslint-config')).toEqual(['.']);
  });
});
