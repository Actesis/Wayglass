/**
 * Release units under docs/governance/release-governance.md. The foundation family shares one
 * version; icons and React version independently. Packages are listed in dependency order, which
 * is also the order they are staged in.
 */
export const releaseUnits = {
  foundation: ['tokens', 'core', 'themes', 'elements'],
  icons: ['icons'],
  react: ['react'],
} as const;

export type ReleaseUnit = keyof typeof releaseUnits;

export function isReleaseUnit(value: string): value is ReleaseUnit {
  return Object.hasOwn(releaseUnits, value);
}

/** The Git tag that records a released unit, such as `foundation-v0.1.1`. */
export function releaseTag(unit: ReleaseUnit, version: string): string {
  return `${unit}-v${version}`;
}
