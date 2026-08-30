import { generatedIconCatalog } from './generated/catalog.js';

export const iconNames = Object.freeze(generatedIconCatalog.map(({ name }) => name));
export type IconName = (typeof generatedIconCatalog)[number]['name'];

export const iconSizes = ['compact', 'standard', 'prominent'] as const;
export type IconSize = (typeof iconSizes)[number];

export const iconDirections = ['auto', 'ltr', 'rtl'] as const;
export type IconDirection = (typeof iconDirections)[number];
export type CatalogIconDirection = 'neutral' | 'mirrors-in-rtl';

export type IconRecord = (typeof generatedIconCatalog)[number];
export type IconPrimitive = IconRecord['primitives'][number];

type RuntimePathCommand =
  | { readonly command: 'move-to' | 'line-to'; readonly x: number; readonly y: number }
  | {
      readonly command: 'arc-to';
      readonly radiusX: number;
      readonly radiusY: number;
      readonly rotation: number;
      readonly largeArc: boolean;
      readonly sweep: boolean;
      readonly x: number;
      readonly y: number;
    }
  | { readonly command: 'close-path' };

export type IconHostSemantics =
  | { readonly hidden: true }
  | { readonly hidden: false; readonly role: 'img'; readonly label: string };

export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && iconNames.some((name) => name === value);
}

export function isIconSize(value: unknown): value is IconSize {
  return typeof value === 'string' && iconSizes.some((size) => size === value);
}

export function isIconDirection(value: unknown): value is IconDirection {
  return typeof value === 'string' && iconDirections.some((direction) => direction === value);
}

export function getIconRecord(name: unknown): IconRecord | undefined {
  return generatedIconCatalog.find((record) => record.name === name);
}

export function resolveIconHostSemantics(name: unknown, label: unknown): IconHostSemantics {
  const accessibleName = typeof label === 'string' ? label.trim() : '';
  return isIconName(name) && accessibleName
    ? { hidden: false, role: 'img', label: accessibleName }
    : { hidden: true };
}

export function shouldMirrorIcon(
  catalogDirection: CatalogIconDirection,
  requestedDirection: IconDirection,
  computedDirection: 'ltr' | 'rtl',
): boolean {
  const resolvedDirection = requestedDirection === 'auto' ? computedDirection : requestedDirection;
  return catalogDirection === 'mirrors-in-rtl' && resolvedDirection === 'rtl';
}

export function iconPathData(primitive: Extract<IconPrimitive, { type: 'path' }>): string {
  return (primitive.commands as readonly RuntimePathCommand[])
    .map((command) => {
      switch (command.command) {
        case 'move-to':
          return `M${command.x} ${command.y}`;
        case 'line-to':
          return `L${command.x} ${command.y}`;
        case 'arc-to':
          return `A${command.radiusX} ${command.radiusY} ${command.rotation} ${command.largeArc ? 1 : 0} ${command.sweep ? 1 : 0} ${command.x} ${command.y}`;
        case 'close-path':
          return 'Z';
      }
    })
    .join('');
}
