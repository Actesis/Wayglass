export const officialThemeNames = [
  'wayglass-dark',
  'wayglass-light',
  'wayglass-high-contrast',
  'wayglass-dim',
] as const;

export type OfficialThemeName = (typeof officialThemeNames)[number];

export interface ThemeSelection {
  readonly name: OfficialThemeName | (string & {});
  readonly density: 'comfortable' | 'compact';
}
