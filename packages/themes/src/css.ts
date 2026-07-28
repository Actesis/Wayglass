import { tokenNameToCssCustomProperty, tokens } from '@wayglass/tokens';

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

function contextualAliases(): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(tokens).flatMap(([target, definition]) => {
      if (typeof definition.value !== 'string') {
        return [];
      }

      const reference = /^\{([^}]+)\}$/.exec(definition.value)?.[1];
      return reference ? [[target, reference]] : [];
    }),
  );
}

function themeRule(themeName: (typeof phase1ThemeNames)[number]): string {
  const rootSelector = themeName === 'wayglass-dark' ? ':root,\n  ' : '';
  const colorScheme = themeName === 'wayglass-dark' ? 'dark' : 'light';
  const contextualThemeTokens = {
    ...contextualAliases(),
    ...themeTokenOverrides[themeName],
  };

  return `${rootSelector}:where([data-wg-theme='${themeName}']) {\n    color-scheme: ${colorScheme};\n${declarations(contextualThemeTokens)}\n  }`;
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
