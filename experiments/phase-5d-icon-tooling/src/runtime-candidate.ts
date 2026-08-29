import { generatedIconCatalog } from '../generated/runtime-catalog.js';

export type RuntimeIconName = (typeof generatedIconCatalog)[number]['name'];
export type RuntimeTextDirection = 'ltr' | 'rtl';

interface RuntimePathCommand {
  readonly command: 'move-to' | 'line-to' | 'arc-to' | 'close-path';
  readonly x?: number;
  readonly y?: number;
  readonly radiusX?: number;
  readonly radiusY?: number;
  readonly rotation?: number;
  readonly largeArc?: boolean;
  readonly sweep?: boolean;
}

interface RuntimePathPrimitive {
  readonly type: 'path';
  readonly commands: readonly RuntimePathCommand[];
  readonly fill: 'none' | 'currentColor';
  readonly stroke: 'none' | 'currentColor';
}

interface RuntimeCirclePrimitive {
  readonly type: 'circle';
  readonly centerX: number;
  readonly centerY: number;
  readonly radius: number;
  readonly fill: 'none' | 'currentColor';
  readonly stroke: 'none' | 'currentColor';
}

type RuntimePrimitive = RuntimePathPrimitive | RuntimeCirclePrimitive;

export interface RuntimeSvgPrimitive {
  readonly element: 'circle' | 'path';
  readonly attributes: Readonly<Record<string, number | string>>;
}

export interface RuntimeSvgDescriptor {
  readonly attributes: Readonly<{
    'aria-hidden': 'true';
    focusable: 'false';
    transform?: 'scale(-1 1) translate(-24 0)';
    viewBox: '0 0 24 24';
  }>;
  readonly name: RuntimeIconName;
  readonly primitives: readonly RuntimeSvgPrimitive[];
}

const runtimeCatalog = generatedIconCatalog as readonly {
  readonly name: RuntimeIconName;
  readonly direction: 'neutral' | 'mirrors-in-rtl';
  readonly primitives: readonly RuntimePrimitive[];
}[];

export const runtimeIconNames = Object.freeze(
  runtimeCatalog.map(({ name }) => name),
) as readonly RuntimeIconName[];

export function isRuntimeIconName(value: unknown): value is RuntimeIconName {
  return typeof value === 'string' && runtimeIconNames.some((name) => name === value);
}

function pathData(commands: readonly RuntimePathCommand[]): string {
  return commands
    .map((command) => {
      switch (command.command) {
        case 'move-to':
          return `M ${command.x} ${command.y}`;
        case 'line-to':
          return `L ${command.x} ${command.y}`;
        case 'arc-to':
          return `A ${command.radiusX} ${command.radiusY} ${command.rotation} ${command.largeArc ? 1 : 0} ${command.sweep ? 1 : 0} ${command.x} ${command.y}`;
        case 'close-path':
          return 'Z';
      }
    })
    .join(' ');
}

function renderPrimitive(primitive: RuntimePrimitive): RuntimeSvgPrimitive {
  const attributes =
    primitive.type === 'path'
      ? {
          d: pathData(primitive.commands),
          fill: primitive.fill,
          stroke: primitive.stroke,
        }
      : {
          cx: primitive.centerX,
          cy: primitive.centerY,
          fill: primitive.fill,
          r: primitive.radius,
          stroke: primitive.stroke,
        };

  return Object.freeze({
    attributes: Object.freeze(attributes),
    element: primitive.type,
  });
}

export function renderRuntimeIcon(
  name: RuntimeIconName,
  direction: RuntimeTextDirection,
): RuntimeSvgDescriptor {
  const icon = runtimeCatalog.find((candidate) => candidate.name === name);
  if (!icon) throw new Error(`Unknown generated icon: ${name}`);

  const attributes = Object.freeze({
    'aria-hidden': 'true' as const,
    focusable: 'false' as const,
    ...(icon.direction === 'mirrors-in-rtl' && direction === 'rtl'
      ? { transform: 'scale(-1 1) translate(-24 0)' as const }
      : {}),
    viewBox: '0 0 24 24' as const,
  });

  return Object.freeze({
    attributes,
    name,
    primitives: Object.freeze(icon.primitives.map(renderPrimitive)),
  });
}
