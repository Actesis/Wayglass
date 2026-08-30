import type { IconPaint, IconPathCommand, IconPrimitive, IconRecord } from './types.ts';

export class IconSourceError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(`${code}: ${message}`);
    this.code = code;
    this.name = 'IconSourceError';
  }
}

function fail(code: string, message: string): never {
  throw new IconSourceError(code, message);
}

function record(value: unknown, code: string, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(code, `${path} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function exactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
  code: string,
  path: string,
): void {
  const expected = new Set(keys);
  const extras = Object.keys(value).filter((key) => !expected.has(key));
  const missing = keys.filter((key) => !Object.hasOwn(value, key));
  if (extras.length > 0 || missing.length > 0) {
    fail(
      code,
      `${path} keys must be exactly ${keys.join(', ')}; missing ${missing.join(', ') || 'none'}; unexpected ${extras.join(', ') || 'none'}.`,
    );
  }
}

function coordinate(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail('WG_ICON_SOURCE_NUMBER', `${path} must be a finite number.`);
  }
  if (value < 0 || value > 24) {
    fail('WG_ICON_SOURCE_BOUNDS', `${path} must remain inside the 0–24 authored view box.`);
  }
  return value;
}

function positiveDimension(value: unknown, path: string): number {
  const result = coordinate(value, path);
  if (result <= 0) fail('WG_ICON_SOURCE_DIMENSION', `${path} must be greater than zero.`);
  return result;
}

function paint(value: unknown, path: string): IconPaint {
  if (value !== 'none' && value !== 'currentColor') {
    fail('WG_ICON_SOURCE_PAINT', `${path} must be "none" or "currentColor".`);
  }
  return value;
}

function pathCommand(value: unknown, path: string): IconPathCommand {
  const input = record(value, 'WG_ICON_SOURCE_COMMAND', path);
  switch (input.command) {
    case 'move-to':
    case 'line-to':
      exactKeys(input, ['command', 'x', 'y'], 'WG_ICON_SOURCE_COMMAND_KEYS', path);
      return {
        command: input.command,
        x: coordinate(input.x, `${path}.x`),
        y: coordinate(input.y, `${path}.y`),
      };
    case 'arc-to': {
      exactKeys(
        input,
        ['command', 'radiusX', 'radiusY', 'rotation', 'largeArc', 'sweep', 'x', 'y'],
        'WG_ICON_SOURCE_COMMAND_KEYS',
        path,
      );
      if (typeof input.rotation !== 'number' || !Number.isFinite(input.rotation)) {
        fail('WG_ICON_SOURCE_NUMBER', `${path}.rotation must be a finite number.`);
      }
      if (typeof input.largeArc !== 'boolean' || typeof input.sweep !== 'boolean') {
        fail('WG_ICON_SOURCE_ARC_FLAG', `${path} arc flags must be Boolean.`);
      }
      return {
        command: 'arc-to',
        radiusX: positiveDimension(input.radiusX, `${path}.radiusX`),
        radiusY: positiveDimension(input.radiusY, `${path}.radiusY`),
        rotation: input.rotation,
        largeArc: input.largeArc,
        sweep: input.sweep,
        x: coordinate(input.x, `${path}.x`),
        y: coordinate(input.y, `${path}.y`),
      };
    }
    case 'close-path':
      exactKeys(input, ['command'], 'WG_ICON_SOURCE_COMMAND_KEYS', path);
      return { command: 'close-path' };
    default:
      return fail('WG_ICON_SOURCE_COMMAND_KIND', `${path}.command is not supported.`);
  }
}

function primitive(value: unknown, path: string): IconPrimitive {
  const input = record(value, 'WG_ICON_SOURCE_PRIMITIVE', path);
  if (input.type === 'path') {
    exactKeys(input, ['type', 'commands', 'fill', 'stroke'], 'WG_ICON_SOURCE_PRIMITIVE_KEYS', path);
    if (!Array.isArray(input.commands) || input.commands.length < 2 || input.commands.length > 64) {
      fail('WG_ICON_SOURCE_COMMAND_COUNT', `${path}.commands must contain 2–64 commands.`);
    }
    const commands = input.commands.map((command, index) =>
      pathCommand(command, `${path}.commands[${index}]`),
    );
    if (commands[0]?.command !== 'move-to') {
      fail('WG_ICON_SOURCE_PATH_START', `${path} must begin with move-to.`);
    }
    const fill = paint(input.fill, `${path}.fill`);
    const stroke = paint(input.stroke, `${path}.stroke`);
    if (fill === 'none' && stroke === 'none') {
      fail('WG_ICON_SOURCE_INVISIBLE', `${path} cannot disable both fill and stroke.`);
    }
    return { type: 'path', commands, fill, stroke };
  }

  if (input.type === 'circle') {
    exactKeys(
      input,
      ['type', 'centerX', 'centerY', 'radius', 'fill', 'stroke'],
      'WG_ICON_SOURCE_PRIMITIVE_KEYS',
      path,
    );
    const fill = paint(input.fill, `${path}.fill`);
    const stroke = paint(input.stroke, `${path}.stroke`);
    if (fill === 'none' && stroke === 'none') {
      fail('WG_ICON_SOURCE_INVISIBLE', `${path} cannot disable both fill and stroke.`);
    }
    return {
      type: 'circle',
      centerX: coordinate(input.centerX, `${path}.centerX`),
      centerY: coordinate(input.centerY, `${path}.centerY`),
      radius: positiveDimension(input.radius, `${path}.radius`),
      fill,
      stroke,
    };
  }

  return fail('WG_ICON_SOURCE_PRIMITIVE_KIND', `${path}.type is not supported.`);
}

function iconRecord(value: unknown, index: number): IconRecord {
  const path = `catalog[${index}]`;
  const input = record(value, 'WG_ICON_SOURCE_RECORD', path);
  exactKeys(
    input,
    ['schemaVersion', 'id', 'category', 'direction', 'accessibleUse', 'provenance', 'primitives'],
    'WG_ICON_SOURCE_RECORD_KEYS',
    path,
  );
  if (input.schemaVersion !== 1) {
    fail('WG_ICON_SOURCE_SCHEMA', `${path}.schemaVersion must be 1.`);
  }
  if (typeof input.id !== 'string' || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(input.id)) {
    fail('WG_ICON_SOURCE_ID', `${path}.id must be a stable lower-kebab-case identifier.`);
  }
  if (input.id.length > 64) {
    fail('WG_ICON_SOURCE_ID', `${path}.id must not exceed 64 characters.`);
  }
  if (input.category !== 'control') {
    fail('WG_ICON_SOURCE_CATEGORY', `${path}.category must be control.`);
  }
  if (input.direction !== 'neutral' && input.direction !== 'mirrors-in-rtl') {
    fail('WG_ICON_SOURCE_DIRECTION', `${path}.direction is not supported.`);
  }
  if (input.accessibleUse !== 'reinforcement-only') {
    fail(
      'WG_ICON_SOURCE_ACCESSIBLE_USE',
      `${path}.accessibleUse must preserve icon-optional meaning.`,
    );
  }

  const provenance = record(input.provenance, 'WG_ICON_SOURCE_PROVENANCE', `${path}.provenance`);
  exactKeys(
    provenance,
    ['author', 'license'],
    'WG_ICON_SOURCE_PROVENANCE_KEYS',
    `${path}.provenance`,
  );
  if (provenance.author !== 'Wayglass' || provenance.license !== 'Apache-2.0') {
    fail('WG_ICON_SOURCE_PROVENANCE', `${path}.provenance must name Wayglass and Apache-2.0.`);
  }
  if (
    !Array.isArray(input.primitives) ||
    input.primitives.length < 1 ||
    input.primitives.length > 16
  ) {
    fail('WG_ICON_SOURCE_PRIMITIVE_COUNT', `${path}.primitives must contain 1–16 entries.`);
  }

  return {
    schemaVersion: 1,
    id: input.id,
    category: 'control',
    direction: input.direction,
    accessibleUse: 'reinforcement-only',
    provenance: { author: 'Wayglass', license: 'Apache-2.0' },
    primitives: input.primitives.map((entry, primitiveIndex) =>
      primitive(entry, `${path}.primitives[${primitiveIndex}]`),
    ),
  };
}

function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

export function validateIconCatalog(input: unknown): readonly IconRecord[] {
  if (!Array.isArray(input) || input.length < 1 || input.length > 500) {
    fail('WG_ICON_SOURCE_CATALOG_COUNT', 'Catalog must contain 1–500 icon records.');
  }
  const result = input.map((value, index) => iconRecord(value, index));
  const identifiers = new Set<string>();
  for (const icon of result) {
    if (identifiers.has(icon.id)) {
      fail('WG_ICON_SOURCE_ID_DUPLICATE', `Duplicate icon id "${icon.id}".`);
    }
    identifiers.add(icon.id);
  }
  return deepFreeze(result);
}
