import type { TokenDefinition, TokenPrimitive } from './definitions.js';

const referencePattern = /^\{([^}]+)\}$/;

export function tokenNameToCssCustomProperty(name: string): `--wg-${string}` {
  return `--wg-${name.replaceAll('.', '-')}`;
}

function cssValue(value: TokenPrimitive): string {
  if (typeof value === 'object') {
    return `cubic-bezier(${value.join(', ')})`;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  const reference = referencePattern.exec(value);
  return reference ? `var(${tokenNameToCssCustomProperty(reference[1] ?? '')})` : value;
}

export function validateTokens(definitions: Readonly<Record<string, TokenDefinition>>): void {
  const names = new Set(Object.keys(definitions));

  for (const [name, definition] of Object.entries(definitions)) {
    if (!name.includes('.')) {
      throw new Error(`Token "${name}" must use a namespaced path.`);
    }

    if (!definition.description.trim()) {
      throw new Error(`Token "${name}" must include a description.`);
    }

    if (typeof definition.value === 'string') {
      const reference = referencePattern.exec(definition.value);
      const referencedName = reference?.[1];
      if (referencedName && !names.has(referencedName)) {
        throw new Error(`Token "${name}" references missing token "${referencedName}".`);
      }
    }
  }
}

export function createCss(definitions: Readonly<Record<string, TokenDefinition>>): string {
  validateTokens(definitions);

  const declarations = Object.entries(definitions)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([name, definition]) =>
        `    ${tokenNameToCssCustomProperty(name)}: ${cssValue(definition.value)};`,
    )
    .join('\n');

  return `@layer wayglass.tokens {\n  :root {\n${declarations}\n  }\n}\n`;
}

export function createJson(definitions: Readonly<Record<string, TokenDefinition>>): string {
  validateTokens(definitions);

  const serializable = Object.fromEntries(
    Object.entries(definitions)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, definition]) => [
        name,
        {
          $type: definition.type,
          $value: definition.value,
          $description: definition.description,
        },
      ]),
  );

  return `${JSON.stringify(serializable, null, 2)}\n`;
}
