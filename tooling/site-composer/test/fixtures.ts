import type {
  CreateSiteManifestInput,
  InspectedSiteFile,
  InventoryEntry,
  SiteManifest,
  SurfaceInventory,
} from '../src/types.ts';
import { createSiteManifest } from '../src/manifest.ts';

const encoder = new TextEncoder();

export function bytes(value: string): Uint8Array {
  return encoder.encode(value);
}

export function documentationEntries(): readonly InventoryEntry[] {
  return [
    { path: '404.html', kind: 'file', links: 1, bytes: bytes('<h1>Not found</h1>') },
    { path: 'assets', kind: 'directory' },
    { path: 'assets/app-A1.js', kind: 'file', links: 1, bytes: bytes('export {};') },
    { path: 'index.html', kind: 'file', links: 1, bytes: bytes('<h1>Wayglass</h1>') },
  ];
}

export function storybookEntries(): readonly InventoryEntry[] {
  return [
    { path: 'assets', kind: 'directory' },
    { path: 'assets/manager-B2.js', kind: 'file', links: 1, bytes: bytes('export {};') },
    { path: 'iframe.html', kind: 'file', links: 1, bytes: bytes('<main>Preview</main>') },
    { path: 'index.html', kind: 'file', links: 1, bytes: bytes('<main>Stories</main>') },
  ];
}

export const sourceIdentity = {
  commit: '1'.repeat(40),
  tree: '2'.repeat(40),
  lockfileSha256: '3'.repeat(64),
} as const;

export const toolingIdentity = {
  commit: '4'.repeat(40),
  tree: '5'.repeat(40),
} as const;

export const buildEnvironment = {
  node: '24.18.0',
  pnpm: '11.9.0',
  platform: 'linux',
  architecture: 'x64',
} as const;

export function manifestInput(files: readonly InspectedSiteFile[]): CreateSiteManifestInput {
  return {
    source: sourceIdentity,
    tooling: toolingIdentity,
    environment: buildEnvironment,
    versions: { documentation: '0.0.0', storybook: '0.0.0' },
    files,
  };
}

export function cloneManifest(manifest: SiteManifest): Record<string, unknown> {
  return JSON.parse(JSON.stringify(manifest)) as Record<string, unknown>;
}

export function manifestFromInventories(
  documentation: SurfaceInventory,
  storybook: SurfaceInventory,
): SiteManifest {
  return createSiteManifest(
    manifestInput(
      [...documentation.files, ...storybook.files].sort((a, b) =>
        a.path < b.path ? -1 : a.path > b.path ? 1 : 0,
      ),
    ),
  );
}
