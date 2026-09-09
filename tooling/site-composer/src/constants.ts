import type { SiteSurfaceDefinition, SiteSurfaceId } from './types.ts';

export const SITE_ARTIFACT = 'wayglass-site-bundle' as const;
export const SITE_SCHEMA_VERSION = 1 as const;
export const SITE_MANIFEST_PATH = 'wayglass-site-manifest.json';

export const SITE_SURFACES = [
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
] as const satisfies readonly SiteSurfaceDefinition[];

export function surfaceDefinition(id: SiteSurfaceId): SiteSurfaceDefinition {
  const definition = SITE_SURFACES.find((candidate) => candidate.id === id);
  if (definition === undefined) throw new Error(`Unknown internal surface: ${id}`);
  return definition;
}
