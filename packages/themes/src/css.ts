import { tokenNameToCssCustomProperty, tokens } from '@wayglass/tokens';

import {
  densityNames,
  densityTokenOverrides,
  themeNames,
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

function themeRule(themeName: (typeof themeNames)[number]): string {
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

const forcedColorOverrides = {
  'color.semantic.action.active': 'Highlight',
  'color.semantic.action.critical': 'Highlight',
  'color.semantic.action.hover': 'Highlight',
  'color.semantic.action.primary': 'Highlight',
  'color.semantic.activity.idle': 'CanvasText',
  'color.semantic.activity.pending': 'Highlight',
  'color.semantic.border.strong': 'CanvasText',
  'color.semantic.border.subtle': 'CanvasText',
  'color.semantic.condition.caution': 'CanvasText',
  'color.semantic.condition.critical': 'CanvasText',
  'color.semantic.condition.informational': 'CanvasText',
  'color.semantic.condition.neutral': 'CanvasText',
  'color.semantic.condition.positive': 'CanvasText',
  'color.semantic.data.series.1': 'CanvasText',
  'color.semantic.data.series.2': 'CanvasText',
  'color.semantic.data.change': 'CanvasText',
  'color.semantic.focus.ring': 'Highlight',
  'color.semantic.knowledge.confirmed': 'CanvasText',
  'color.semantic.knowledge.conflicting': 'CanvasText',
  'color.semantic.knowledge.inferred': 'CanvasText',
  'color.semantic.knowledge.stale': 'CanvasText',
  'color.semantic.knowledge.unavailable': 'CanvasText',
  'color.semantic.knowledge.unknown': 'CanvasText',
  'color.semantic.selection.indicator': 'Highlight',
  'color.semantic.selection.surface': 'Canvas',
  'color.semantic.selection.text': 'CanvasText',
  'color.semantic.section.control': 'Highlight',
  'color.semantic.section.information': 'CanvasText',
  'color.semantic.section.monitor': 'CanvasText',
  'color.semantic.structure.band': 'CanvasText',
  'color.semantic.surface.canvas': 'Canvas',
  'color.semantic.surface.inset': 'Canvas',
  'color.semantic.surface.panel': 'Canvas',
  'color.semantic.surface.raised': 'Canvas',
  'color.semantic.text.inverse': 'HighlightText',
  'color.semantic.text.primary': 'CanvasText',
  'color.semantic.text.secondary': 'CanvasText',
  'color.semantic.value.asserted': 'Highlight',
  'color.semantic.value.not-asserted': 'CanvasText',
} as const;

function forcedColorsRule(): string {
  const selectors = [
    ':root',
    ...themeNames.map((themeName) => `:where([data-wg-theme='${themeName}'])`),
  ].join(',\n    ');
  const overrides = Object.entries(forcedColorOverrides)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([target, value]) => `      ${tokenNameToCssCustomProperty(target)}: ${value};`)
    .join('\n');

  return `@media (forced-colors: active) {\n    ${selectors} {\n${overrides}\n    }\n  }`;
}

export function createThemeCss(): string {
  const themes = themeNames.map(themeRule).join('\n\n  ');
  const densities = densityNames.map(densityRule).join('\n\n  ');

  return `@layer wayglass.themes {\n  ${themes}\n\n  ${densities}\n\n  ${forcedColorsRule()}\n}\n`;
}
