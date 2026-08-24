import type { TokenPrimitive } from '../../../packages/tokens/src/definitions.js';

import type {
  ModeAxis,
  NormalizedMode,
  NormalizedToken,
  NormalizedTokenGraph,
} from './normalize.js';

export interface WebTransformPolicy {
  readonly defaultTheme: string;
  readonly themeOrder: readonly string[];
  readonly densityOrder: readonly string[];
  readonly colorSchemes: Readonly<Record<string, 'dark' | 'light'>>;
  readonly forcedColors: Readonly<Record<string, string>>;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function tokenNameToWebCustomProperty(name: string): `--wg-${string}` {
  return `--wg-${name.replaceAll('.', '-')}`;
}

function cssValue(token: NormalizedToken): string {
  if (token.alias) {
    return `var(${tokenNameToWebCustomProperty(token.alias.source)})`;
  }

  const value: TokenPrimitive = token.value;
  if (typeof value === 'object') {
    return `cubic-bezier(${value.join(', ')})`;
  }

  return String(value);
}

function declarations(
  entries: readonly (readonly [string, string])[],
  indentation: number,
): string {
  const prefix = ' '.repeat(indentation);
  return [...entries]
    .sort(([left], [right]) => compareText(left, right))
    .map(([target, value]) => `${prefix}${tokenNameToWebCustomProperty(target)}: ${value};`)
    .join('\n');
}

function modeIndex(
  graph: NormalizedTokenGraph,
  axis: ModeAxis,
): ReadonlyMap<string, NormalizedMode> {
  return new Map(graph.modes.filter((mode) => mode.axis === axis).map((mode) => [mode.name, mode]));
}

function assertExactOrder(
  axis: ModeAxis,
  order: readonly string[],
  modes: ReadonlyMap<string, NormalizedMode>,
): void {
  const seen = new Set<string>();
  for (const name of order) {
    if (seen.has(name)) {
      throw new Error(`Web ${axis} order contains duplicate mode "${name}".`);
    }
    if (!modes.has(name)) {
      throw new Error(`Web ${axis} order contains unknown mode "${name}".`);
    }
    seen.add(name);
  }

  const missing = [...modes.keys()].filter((name) => !seen.has(name)).sort(compareText);
  if (missing.length > 0) {
    throw new Error(`Web ${axis} order omits modes: ${missing.join(', ')}.`);
  }
}

function validateWebPolicy(
  graph: NormalizedTokenGraph,
  policy: WebTransformPolicy,
): {
  readonly themes: ReadonlyMap<string, NormalizedMode>;
  readonly densities: ReadonlyMap<string, NormalizedMode>;
} {
  const themes = modeIndex(graph, 'theme');
  const densities = modeIndex(graph, 'density');
  assertExactOrder('theme', policy.themeOrder, themes);
  assertExactOrder('density', policy.densityOrder, densities);

  if (!themes.has(policy.defaultTheme)) {
    throw new Error(`Web default theme "${policy.defaultTheme}" is not a normalized theme.`);
  }

  for (const name of policy.themeOrder) {
    if (!policy.colorSchemes[name]) {
      throw new Error(`Web theme "${name}" is missing an explicit color scheme.`);
    }
  }

  const tokens = new Map(graph.tokens.map((token) => [token.source, token]));
  for (const [target, value] of Object.entries(policy.forcedColors)) {
    const token = tokens.get(target);
    if (!token) {
      throw new Error(`Forced-colors policy targets missing token "${target}".`);
    }
    if (token.type !== 'color') {
      throw new Error(`Forced-colors policy target "${target}" is not a color token.`);
    }
    if (!value.trim()) {
      throw new Error(`Forced-colors policy target "${target}" has an empty value.`);
    }
  }

  return { themes, densities };
}

export function createWebTokenCss(graph: NormalizedTokenGraph): string {
  const tokenDeclarations = declarations(
    graph.tokens.map((token) => [token.source, cssValue(token)]),
    4,
  );

  return `@layer wayglass.tokens {\n  :root {\n${tokenDeclarations}\n  }\n}\n`;
}

export function createLegacyTokenJson(graph: NormalizedTokenGraph): string {
  const document = Object.fromEntries(
    [...graph.tokens]
      .sort((left, right) => compareText(left.source, right.source))
      .map((token) => [
        token.source,
        {
          $type: token.type,
          $value: token.value,
          $description: token.description,
        },
      ]),
  );

  return `${JSON.stringify(document, null, 2)}\n`;
}

function aliasEntries(graph: NormalizedTokenGraph): readonly (readonly [string, string])[] {
  return graph.tokens.flatMap((token) =>
    token.alias
      ? [[token.source, `var(${tokenNameToWebCustomProperty(token.alias.source)})`] as const]
      : [],
  );
}

function modeEntries(mode: NormalizedMode): readonly (readonly [string, string])[] {
  return mode.overrides.map(({ target, source }) => [
    target.source,
    `var(${tokenNameToWebCustomProperty(source.source)})`,
  ]);
}

function themeRule(
  graph: NormalizedTokenGraph,
  mode: NormalizedMode,
  policy: WebTransformPolicy,
): string {
  const rootSelector = mode.name === policy.defaultTheme ? ':root,\n  ' : '';
  const contextual = new Map(aliasEntries(graph));
  for (const [target, value] of modeEntries(mode)) {
    contextual.set(target, value);
  }

  return `${rootSelector}:where([data-wg-theme='${mode.name}']) {\n    color-scheme: ${policy.colorSchemes[mode.name]};\n${declarations([...contextual], 4)}\n  }`;
}

function densityRule(mode: NormalizedMode): string {
  return `:where([data-wg-density='${mode.name}']) {\n${declarations(modeEntries(mode), 4)}\n  }`;
}

function forcedColorsRule(policy: WebTransformPolicy): string {
  const selectors = [
    ':root',
    ...policy.themeOrder.map((name) => `:where([data-wg-theme='${name}'])`),
  ].join(',\n    ');
  const forcedDeclarations = declarations(
    Object.entries(policy.forcedColors).map(([target, value]) => [target, value]),
    6,
  );

  return `@media (forced-colors: active) {\n    ${selectors} {\n${forcedDeclarations}\n    }\n  }`;
}

export function createWebThemeCss(graph: NormalizedTokenGraph, policy: WebTransformPolicy): string {
  const { themes, densities } = validateWebPolicy(graph, policy);
  const themeRules = policy.themeOrder
    .map((name) => themeRule(graph, themes.get(name)!, policy))
    .join('\n\n  ');
  const densityRules = policy.densityOrder
    .map((name) => densityRule(densities.get(name)!))
    .join('\n\n  ');

  return `@layer wayglass.themes {\n  ${themeRules}\n\n  ${densityRules}\n\n  ${forcedColorsRule(policy)}\n}\n`;
}
