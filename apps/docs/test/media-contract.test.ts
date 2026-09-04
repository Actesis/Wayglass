import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');

const mediaDocument = read('docs/media/media-content.md');
const viewerDocument = read('docs/media/media-viewer.md');
const media = read('packages/elements/src/media.ts');
const mediaCss = read('packages/elements/src/media.css');
const viewer = read('packages/elements/src/media-viewer.ts');
const viewerCss = read('packages/elements/src/media-viewer.css');
const mediaReact = read('packages/react/src/media.tsx');
const viewerReact = read('packages/react/src/media-viewer.tsx');
const manifest = JSON.parse(read('packages/elements/package.json')) as {
  readonly exports: Readonly<Record<string, unknown>>;
};

function sourceReactiveProperties(source: string): string[] {
  const block = source.match(/static override properties = \{([\s\S]*?)\n {2}\};/);
  if (!block) return [];
  return [...block[1]!.matchAll(/^ {4}([a-z][A-Za-z0-9]*):/gm)].map((match) => match[1]!).sort();
}

function sourceSlots(source: string): string[] {
  return [
    ...new Set(
      [...source.matchAll(/<slot(?:\s+name="([^"]+)")?/g)].map((match) => match[1] ?? 'default'),
    ),
  ].sort();
}

function renderedParts(source: string): string[] {
  const render =
    source.match(/protected override render\(\) \{([\s\S]*?)\n {2}\}\n(?:\n {2})?show?\(/)?.[1] ??
    source.match(/protected override render\(\) \{([\s\S]*?)\n {2}\}\n\}/)?.[1] ??
    '';
  return [
    ...new Set([...render.matchAll(/part="([^"]+)"/g)].flatMap((match) => match[1]!.split(/\s+/))),
  ].sort();
}

describe('media field-level contracts', () => {
  it('freezes in-page media fields, defaults, slots, parts, and styling hooks', () => {
    expect(sourceReactiveProperties(media)).toEqual(['aspect', 'boundary', 'fit', 'state']);
    expect(sourceSlots(media)).toEqual(['default', 'inspection', 'loading', 'unavailable']);
    expect(renderedParts(media)).toEqual([
      'asset',
      'base',
      'inspection',
      'state',
      'state-loading',
      'state-unavailable',
      'viewport',
    ]);
    for (const value of [
      "this.aspect = 'auto';",
      "this.fit = 'contain';",
      "this.state = 'ready';",
      "this.boundary = 'subtle';",
    ]) {
      expect(media).toContain(value);
    }
    const properties = [...new Set(media.match(/--wg-media-[a-z0-9-]+/g) ?? [])].sort();
    expect(properties).toEqual([
      '--wg-media-aspect-ratio',
      '--wg-media-border-size',
      '--wg-media-color-background',
      '--wg-media-color-border',
      '--wg-media-min-block-size',
      '--wg-media-object-fit',
      '--wg-media-object-position',
      '--wg-media-radius',
      '--wg-media-state-space',
    ]);
    for (const property of properties) expect(mediaDocument).toContain(`\`${property}\``);
  });

  it('freezes viewer fields, defaults, slots, and complete anatomy', () => {
    expect(sourceReactiveProperties(viewer)).toEqual([
      'actualSizeLabel',
      'closeLabel',
      'fitLabel',
      'initialView',
      'open',
      'state',
      'viewerId',
      'zoomInLabel',
      'zoomOutLabel',
    ]);
    expect(sourceSlots(viewer)).toEqual([
      'caption',
      'context',
      'default',
      'heading',
      'loading',
      'unavailable',
    ]);
    expect(renderedParts(viewer)).toEqual([
      'actual-size-button',
      'caption',
      'close-button',
      'context',
      'controls',
      'dialog',
      'fit-button',
      'header',
      'heading',
      'media',
      'scale-readout',
      'state',
      'state-loading',
      'state-unavailable',
      'surface',
      'viewport',
      'zoom-in-button',
      'zoom-out-button',
    ]);
    for (const value of [
      "this.viewerId = '';",
      'this.open = false;',
      "this.state = 'ready';",
      "this.initialView = 'fit';",
      "this.closeLabel = '';",
      "this.zoomInLabel = '';",
      "this.zoomOutLabel = '';",
      "this.fitLabel = '';",
      "this.actualSizeLabel = '';",
    ]) {
      expect(viewer).toContain(value);
    }
    for (const part of renderedParts(viewer)) expect(viewerDocument).toContain(`\`${part}\``);
  });

  it('freezes closed vocabularies, scale methods, and typed event details', () => {
    expect(media).toContain("['auto', 'square', 'landscape', 'portrait', 'wide']");
    expect(media).toContain("['contain', 'cover']");
    expect(media).toContain("['ready', 'loading', 'unavailable']");
    expect(media).toContain("['none', 'subtle', 'strong']");
    expect(media).not.toContain('new CustomEvent');

    expect(viewer).toContain("['ready', 'loading', 'unavailable']");
    expect(viewer).toContain("['fit', 'actual-size']");
    expect(viewer).toContain("['fit', 'actual-size', 'zoomed']");
    expect(viewer).toContain("['close-control', 'escape', 'programmatic']");
    for (const method of ['fit', 'actualSize', 'zoomIn', 'zoomOut']) {
      expect(viewer).toContain(`${method}(): boolean`);
    }
    expect(viewer).toContain("new CustomEvent<WgMediaViewerDetail>('wg-media-viewer-open'");
    expect(viewer).toContain("new CustomEvent<WgMediaViewerCloseDetail>('wg-media-viewer-close'");
    expect(viewer).toContain("new CustomEvent<WgMediaViewChangeDetail>('wg-media-view-change'");
  });

  it('keeps native media and progressive enhancement consumer-owned', () => {
    expect(media).not.toMatch(/\bsrc\s*:/);
    expect(viewer).not.toMatch(/\bsrc\s*:/);
    expect(media).not.toContain('fetch(');
    expect(viewer).not.toContain('fetch(');
    expect(mediaCss).toContain("wg-media:not([state='loading']) > [slot='loading']");
    expect(mediaCss).toContain('wg-media > picture > .wg-media-asset');
    expect(viewerCss).toContain('wg-media-viewer:not(:defined)');
    expect(viewerCss).toContain('wg-media-viewer > picture > .wg-media-viewer-asset');
    expect(manifest.exports).toHaveProperty('./media.css');
    expect(manifest.exports).toHaveProperty('./media-viewer.css');
  });

  it('keeps measured viewer geometry private', () => {
    expect(viewer).not.toMatch(/--wg-media-viewer-[a-z0-9-]+/);
    expect(viewer).toContain('--_wg-media-viewer-rendered-inline');
    expect(viewer).toContain('--_wg-media-viewer-rendered-block');
    expect(viewerDocument).toContain('exposes no element-specific CSS custom properties in v1');
  });

  it('freezes explicit registration and typed React adaptation', () => {
    expect(media).toContain('defineElement(wgMediaTagName, WgMedia, registry);');
    expect(viewer).toContain('defineElement(wgMediaViewerTagName, WgMediaViewer, registry);');
    expect(mediaReact).toContain('registerElement(defineWgMedia);');
    expect(mediaReact).not.toContain('events:');
    expect(viewerReact).toContain('registerElement(defineWgMediaViewer);');
    expect(viewerReact).toContain("onWgMediaViewerOpen: 'wg-media-viewer-open'");
    expect(viewerReact).toContain("onWgMediaViewerClose: 'wg-media-viewer-close'");
    expect(viewerReact).toContain("onWgMediaViewChange: 'wg-media-view-change'");
  });

  it('records implemented inspection and current evidence', () => {
    expect(mediaDocument).toContain('official `wg-media-viewer`');
    expect(mediaDocument).toContain('## Validation coverage');
    expect(mediaDocument).toContain('## Continuing boundaries');
    expect(mediaDocument).not.toContain('## Validation requirements');
    expect(mediaDocument).not.toContain('## Deferred decisions');
    expect(mediaDocument).not.toContain('package-owned full-size viewer is deferred');
    expect(viewerDocument).toContain('## Validation coverage');
    expect(viewerDocument).toContain('explicit public-release evidence gates');
  });
});
