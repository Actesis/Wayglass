import { createD3Geometry } from './d3-geometry.js';
import type { RichVisualizationInput } from './model.js';
import { mountSvgBaseline, type SvgBaselineHandle } from './svg-adapter.js';

export type D3BaselineHandle = SvgBaselineHandle;

export function mountD3Baseline(
  container: HTMLElement,
  input: RichVisualizationInput,
): D3BaselineHandle {
  const geometry = createD3Geometry(input);
  return mountSvgBaseline(container, input, {
    className: 'p5c-d3',
    heading: 'D3-assisted SVG baseline',
    headingSuffix: 'd3',
    geometry,
    x: (observedAt) => Number(geometry.xScale(observedAt).toFixed(3)),
    y: (value) => Number(geometry.yScale(value).toFixed(3)),
  });
}
