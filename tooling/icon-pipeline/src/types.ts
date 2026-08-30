export const iconViewBox = Object.freeze({ minX: 0, minY: 0, width: 24, height: 24 });

export type IconDirection = 'neutral' | 'mirrors-in-rtl';
export type IconPaint = 'none' | 'currentColor';

export interface MoveToCommand {
  readonly command: 'move-to';
  readonly x: number;
  readonly y: number;
}

export interface LineToCommand {
  readonly command: 'line-to';
  readonly x: number;
  readonly y: number;
}

export interface ArcToCommand {
  readonly command: 'arc-to';
  readonly radiusX: number;
  readonly radiusY: number;
  readonly rotation: number;
  readonly largeArc: boolean;
  readonly sweep: boolean;
  readonly x: number;
  readonly y: number;
}

export interface ClosePathCommand {
  readonly command: 'close-path';
}

export type IconPathCommand = MoveToCommand | LineToCommand | ArcToCommand | ClosePathCommand;

export interface IconPathPrimitive {
  readonly type: 'path';
  readonly commands: readonly IconPathCommand[];
  readonly fill: IconPaint;
  readonly stroke: IconPaint;
}

export interface IconCirclePrimitive {
  readonly type: 'circle';
  readonly centerX: number;
  readonly centerY: number;
  readonly radius: number;
  readonly fill: IconPaint;
  readonly stroke: IconPaint;
}

export type IconPrimitive = IconPathPrimitive | IconCirclePrimitive;

export interface IconRecord {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly category: 'control';
  readonly direction: IconDirection;
  readonly accessibleUse: 'reinforcement-only';
  readonly provenance: {
    readonly author: 'Wayglass';
    readonly license: 'Apache-2.0';
  };
  readonly primitives: readonly IconPrimitive[];
}
