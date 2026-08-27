import type { Knowledge } from '../../../packages/core/src/state.js';

// These normalized coordinates are private rendering mechanics. Exposing them as theme tokens would
// create meaningless API surface and allow themes to break the fixed proof geometry.
export const svgViewBox = { width: 1_000, height: 400 } as const;
export const svgPlot = {
  inlineStart: 80,
  inlineEnd: 976,
  blockStart: 24,
  blockEnd: 352,
} as const;

export interface SvgKnowledgePath {
  readonly knowledge: Knowledge;
  readonly data: string;
}

export interface SvgKnowledgeMark {
  readonly pointId: string;
  readonly knowledge: Knowledge;
  readonly x: number;
  readonly y: number | null;
}

export interface SvgSeriesGeometry {
  readonly seriesId: string;
  readonly seriesIndex: number;
  readonly paths: readonly SvgKnowledgePath[];
  readonly marks: readonly SvgKnowledgeMark[];
}

export interface SvgGeometry {
  readonly thresholdY: number;
  readonly annotationX: number;
  readonly series: readonly SvgSeriesGeometry[];
}
