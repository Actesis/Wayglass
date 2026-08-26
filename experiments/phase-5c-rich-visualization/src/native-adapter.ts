import type { RichVisualizationInput } from './model.js';
import { createNativeGeometry, nativeX, nativeY } from './native-geometry.js';
import { mountSvgBaseline, type SvgBaselineHandle } from './svg-adapter.js';

export type NativeBaselineHandle = SvgBaselineHandle;

export function mountNativeBaseline(
  container: HTMLElement,
  input: RichVisualizationInput,
): NativeBaselineHandle {
  return mountSvgBaseline(container, input, {
    className: 'p5c-native',
    heading: 'Native SVG and HTML baseline',
    headingSuffix: 'native',
    geometry: createNativeGeometry(input),
    x: (observedAt) => nativeX(input, observedAt),
    y: (value) => nativeY(input, value),
  });
}
