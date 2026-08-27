import { pairs } from 'd3-array';
import { scaleLinear, type ScaleLinear } from 'd3-scale';
import { line } from 'd3-shape';

import type { Knowledge } from '../../../packages/core/src/state.js';

import type { RichVisualizationInput, RichVisualizationPoint } from './model.js';
import { svgPlot, type SvgGeometry, type SvgKnowledgeMark } from './svg-geometry.js';

export interface D3Geometry extends SvgGeometry {
  readonly xScale: ScaleLinear<number, number>;
  readonly yScale: ScaleLinear<number, number>;
}

function round(value: number): number {
  return Number(value.toFixed(3));
}

function createD3Scales(input: RichVisualizationInput) {
  const xScale = scaleLinear<number, number>()
    .domain([input.windowStart, input.windowEnd])
    .range([svgPlot.inlineStart, svgPlot.inlineEnd]);
  const yScale = scaleLinear<number, number>()
    .domain([input.scaleMinimum, input.scaleMaximum])
    .range([svgPlot.blockEnd, svgPlot.blockStart]);
  return { xScale, yScale };
}

export function d3X(input: RichVisualizationInput, observedAt: number): number {
  return round(createD3Scales(input).xScale(observedAt));
}

export function d3Y(input: RichVisualizationInput, value: number): number {
  return round(createD3Scales(input).yScale(value));
}

export function createD3Geometry(input: RichVisualizationInput): D3Geometry {
  const { xScale, yScale } = createD3Scales(input);
  const segmentLine = line<RichVisualizationPoint>()
    .x(({ observedAt }) => round(xScale(observedAt)))
    .y(({ value }) => round(yScale(value!)));

  return {
    thresholdY: round(yScale(input.threshold.value)),
    annotationX: round(xScale(input.annotation.observedAt)),
    xScale,
    yScale,
    series: input.series.map((series, seriesIndex) => {
      const paths = new Map<Knowledge, string[]>();
      const hitPaths: string[] = [];
      const marks: SvgKnowledgeMark[] = [];

      for (const point of series.points) {
        if (point.value === null || point.knowledge !== 'confirmed') {
          marks.push({
            pointId: point.id,
            knowledge: point.knowledge,
            x: round(xScale(point.observedAt)),
            y: point.value === null ? null : round(yScale(point.value)),
          });
        }
      }

      for (const [previous, current] of pairs(series.points)) {
        if (previous.value === null || current.value === null) continue;
        const path = segmentLine([previous, current]);
        if (!path) continue;
        const knowledgePaths = paths.get(current.knowledge) ?? [];
        knowledgePaths.push(path);
        paths.set(current.knowledge, knowledgePaths);
        hitPaths.push(path);
      }

      return {
        seriesId: series.id,
        seriesIndex,
        paths: Array.from(paths, ([knowledge, data]) => ({ knowledge, data: data.join(' ') })),
        hitPath: hitPaths.join(' '),
        marks,
      };
    }),
  };
}
