export type SiteSurfaceId = 'documentation' | 'storybook';
export type SiteSurfaceClassification = 'normative' | 'inspection';

export interface SiteSurfaceDefinition {
  readonly id: SiteSurfaceId;
  readonly classification: SiteSurfaceClassification;
  readonly packageName: string;
  readonly packageManifest: string;
  readonly sourcePath: string;
  readonly destinationPrefix: string;
  readonly publicPath: '/' | '/storybook/';
  readonly requiredEntries: readonly string[];
}

export type InventoryEntryKind =
  'directory' | 'file' | 'symlink' | 'socket' | 'device' | 'fifo' | 'other';

export interface InventoryEntry {
  readonly path: string;
  readonly kind: InventoryEntryKind;
  readonly bytes?: Uint8Array;
  readonly links?: number;
  readonly mode?: number;
}

export interface SiteRepositoryContext {
  readonly root: string;
  readonly source: SiteSourceIdentity;
  readonly tooling: SiteToolingIdentity;
  readonly environment: SiteBuildEnvironment;
  readonly versions: Readonly<Record<SiteSurfaceId, string>>;
}

export interface ComposedSiteResult {
  readonly output: string;
  readonly manifest: SiteManifest;
  readonly manifestSha256: string;
}

export interface VerifiedSiteResult {
  readonly input: string;
  readonly manifest: SiteManifest;
  readonly manifestSha256: string;
}

export interface InspectedSiteFile {
  readonly surface: SiteSurfaceId;
  readonly path: string;
  readonly bytes: number;
  readonly sha256: string;
}

export interface SurfaceInventory {
  readonly surface: SiteSurfaceId;
  readonly files: readonly InspectedSiteFile[];
}

export interface SiteSourceIdentity {
  readonly commit: string;
  readonly tree: string;
  readonly lockfileSha256: string;
}

export interface SiteToolingIdentity {
  readonly commit: string;
  readonly tree: string;
}

export interface SiteBuildEnvironment {
  readonly node: string;
  readonly pnpm: string;
  readonly platform: string;
  readonly architecture: string;
}

export interface SiteSurfaceManifestRecord {
  readonly id: SiteSurfaceId;
  readonly classification: SiteSurfaceClassification;
  readonly package: string;
  readonly version: string;
  readonly sourcePath: string;
  readonly publicPath: '/' | '/storybook/';
  readonly requiredEntries: readonly string[];
  readonly fileCount: number;
  readonly bytes: number;
  readonly contentSha256: string;
}

export type SiteFileManifestRecord = InspectedSiteFile;

export interface SiteManifestProjection {
  readonly artifact: 'wayglass-site-bundle';
  readonly schemaVersion: 1;
  readonly source: SiteSourceIdentity;
  readonly tooling: SiteToolingIdentity;
  readonly environment: SiteBuildEnvironment;
  readonly surfaces: readonly SiteSurfaceManifestRecord[];
  readonly files: readonly SiteFileManifestRecord[];
}

export interface SiteManifest extends SiteManifestProjection {
  readonly bundleSha256: string;
}

export interface CreateSiteManifestInput {
  readonly source: SiteSourceIdentity;
  readonly tooling: SiteToolingIdentity;
  readonly environment: SiteBuildEnvironment;
  readonly versions: Readonly<Record<SiteSurfaceId, string>>;
  readonly files: readonly InspectedSiteFile[];
}
