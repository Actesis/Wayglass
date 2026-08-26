import type { Knowledge } from '../../../packages/core/src/state.js';

import type { RichVisualizationInput, RichVisualizationPoint } from './model.js';
import {
  svgPlot,
  svgViewBox,
  type SvgGeometry,
  type SvgKnowledgeMark,
  type SvgKnowledgePath,
  type SvgSeriesGeometry,
} from './svg-geometry.js';

export const nativePlot = svgPlot;
export const nativeViewBox = svgViewBox;

export type NativeKnowledgePath = SvgKnowledgePath;
export type NativeKnowledgeMark = SvgKnowledgeMark;
export type NativeSeriesGeometry = SvgSeriesGeometry;
export type NativeGeometry = SvgGeometry;

function round(value: number): number {
  return Number(value.toFixed(3));
}

export function nativeX(input: RichVisualizationInput, observedAt: number): number {
  return round(
    svgPlot.inlineStart +
      ((observedAt - input.windowStart) / (input.windowEnd - input.windowStart)) *
        (svgPlot.inlineEnd - svgPlot.inlineStart),
  );
}

export function nativeY(input: RichVisualizationInput, value: number): number {
  return round(
    svgPlot.blockEnd -
      ((value - input.scaleMinimum) / (input.scaleMaximum - input.scaleMinimum)) *
        (svgPlot.blockEnd - svgPlot.blockStart),
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
