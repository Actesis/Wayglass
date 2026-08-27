import { createD3Geometry, d3X, d3Y } from './d3-geometry.js';
import type { RichVisualizationInput } from './model.js';
import { mountSvgBaseline, type SvgBaselineHandle } from './svg-adapter.js';

export type D3BaselineHandle = SvgBaselineHandle;

export function mountD3Baseline(
  container: HTMLElement,
  input: RichVisualizationInput,
): D3BaselineHandle {
  return mountSvgBaseline(container, input, {
    className: 'p5c-d3',
    heading: 'D3-assisted SVG baseline',
    headingSuffix: 'd3',
    geometry: createD3Geometry,
    x: d3X,
    y: d3Y,
  });
}
