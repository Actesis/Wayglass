import { tokenNameToCssCustomProperty } from '@wayglass/tokens';

import {
  densityNames,
  densityTokenOverrides,
  phase1ThemeNames,
  themeTokenOverrides,
} from './definitions.js';

function declarations(overrides: Readonly<Record<string, string>>): string {
  return Object.entries(overrides)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([target, source]) =>
        `    ${tokenNameToCssCustomProperty(target)}: var(${tokenNameToCssCustomProperty(source)});`,
    )
    .join('\n');
}

function themeRule(themeName: (typeof phase1ThemeNames)[number]): string {
  const rootSelector = themeName === 'wayglass-dark' ? ':root,\n  ' : '';
  const colorScheme = themeName === 'wayglass-dark' ? 'dark' : 'light';

  return `${rootSelector}:where([data-wg-theme='${themeName}']) {\n    color-scheme: ${colorScheme};\n${declarations(
    themeTokenOverrides[themeName],
  )}\n  }`;
}

function densityRule(densityName: (typeof densityNames)[number]): string {
  return `:where([data-wg-density='${densityName}']) {\n${declarations(
    densityTokenOverrides[densityName],
  )}\n  }`;
}

export function createThemeCss(): string {
  const themes = phase1ThemeNames.map(themeRule).join('\n\n  ');
  const densities = densityNames.map(densityRule).join('\n\n  ');

  return `@layer wayglass.themes {\n  ${themes}\n\n  ${densities}\n}\n`;
}
