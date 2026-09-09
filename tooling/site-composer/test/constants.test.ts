import { describe, expect, it } from 'vitest';

import { SITE_MANIFEST_PATH, SITE_SURFACES, surfaceDefinition } from '../src/constants.ts';

describe('closed site surface definitions', () => {
  it('declares only the two accepted ordered surfaces', () => {
    expect(SITE_SURFACES).toEqual([
      {
        id: 'documentation',
        classification: 'normative',
        packageName: '@wayglass/docs',
        packageManifest: 'apps/docs/package.json',
        sourcePath: 'apps/docs/.vitepress/dist',
        destinationPrefix: '',
        publicPath: '/',
        requiredEntries: ['index.html', '404.html'],
      },
      {
        id: 'storybook',
        classification: 'inspection',
        packageName: '@wayglass/storybook',
        packageManifest: 'apps/storybook/package.json',
        sourcePath: 'apps/storybook/storybook-static',
        destinationPrefix: 'storybook',
        publicPath: '/storybook/',
        requiredEntries: ['index.html', 'iframe.html'],
      },
    ]);
    expect(SITE_MANIFEST_PATH).toBe('wayglass-site-manifest.json');
    expect(surfaceDefinition('storybook').destinationPrefix).toBe('storybook');
  });
});
