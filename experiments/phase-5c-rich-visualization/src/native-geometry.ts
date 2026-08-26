import type { Knowledge } from '../../../packages/core/src/state.js';

import type { RichVisualizationInput, RichVisualizationPoint } from './model.js';

// These normalized coordinates are private rendering mechanics. Exposing them as theme tokens would
// create a meaningless API and allow themes to break the fixed proof geometry.
export const nativeViewBox = { width: 1_000, height: 400 } as const;
export const nativePlot = {
  inlineStart: 80,
  inlineEnd: 976,
  blockStart: 24,
  blockEnd: 352,
} as const;

export interface NativeKnowledgePath {
  readonly knowledge: Knowledge;
  readonly data: string;
}

export interface NativeKnowledgeMark {
  readonly pointId: string;
  readonly knowledge: Knowledge;
  readonly x: number;
  readonly y: number | null;
}

export interface NativeSeriesGeometry {
  readonly seriesId: string;
  readonly seriesIndex: number;
  readonly paths: readonly NativeKnowledgePath[];
  readonly hitPath: string;
  readonly marks: readonly NativeKnowledgeMark[];
}

export interface NativeGeometry {
  readonly thresholdY: number;
  readonly annotationX: number;
  readonly series: readonly NativeSeriesGeometry[];
}

function round(value: number): number {
  return Number(value.toFixed(3));
}

export function nativeX(input: RichVisualizationInput, observedAt: number): number {
  return round(
    nativePlot.inlineStart +
      ((observedAt - input.windowStart) / (input.windowEnd - input.windowStart)) *
        (nativePlot.inlineEnd - nativePlot.inlineStart),
  );
}

export function nativeY(input: RichVisualizationInput, value: number): number {
  return round(
    nativePlot.blockEnd -
      ((value - input.scaleMinimum) / (input.scaleMaximum - input.scaleMinimum)) *
        (nativePlot.blockEnd - nativePlot.blockStart),
  );
}

function segmentCommand(
  input: RichVisualizationInput,
  previous: RichVisualizationPoint,
  current: RichVisualizationPoint,
): string {
  return `M ${nativeX(input, previous.observedAt)} ${nativeY(input, previous.value!)} L ${nativeX(input, current.observedAt)} ${nativeY(input, current.value!)}`;
}

export function createNativeGeometry(input: RichVisualizationInput): NativeGeometry {
  return {
    thresholdY: nativeY(input, input.threshold.value),
    annotationX: nativeX(input, input.annotation.observedAt),
    series: input.series.map((series, seriesIndex) => {
      const paths = new Map<Knowledge, string[]>();
      const hitCommands: string[] = [];
      const marks: NativeKnowledgeMark[] = [];

      for (let pointIndex = 0; pointIndex < series.points.length; pointIndex += 1) {
        const point = series.points[pointIndex]!;
        if (point.value === null || point.knowledge !== 'confirmed') {
          marks.push({
            pointId: point.id,
            knowledge: point.knowledge,
            x: nativeX(input, point.observedAt),
            y: point.value === null ? null : nativeY(input, point.value),
          });
        }

        if (pointIndex === 0) continue;
        const previous = series.points[pointIndex - 1]!;
        if (previous.value === null || point.value === null) continue;

        const command = segmentCommand(input, previous, point);
        const knowledgeCommands = paths.get(point.knowledge) ?? [];
        knowledgeCommands.push(command);
        paths.set(point.knowledge, knowledgeCommands);
        hitCommands.push(command);
      }

      return {
        seriesId: series.id,
        seriesIndex,
        paths: Array.from(paths, ([knowledge, commands]) => ({
          knowledge,
          data: commands.join(' '),
        })),
        hitPath: hitCommands.join(' '),
        marks,
      };
    }),
  };
}
