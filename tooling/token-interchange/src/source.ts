import {
  densityTokenOverrides,
  themeTokenOverrides,
} from '../../../packages/themes/src/definitions.ts';
import { tokens } from '../../../packages/tokens/src/definitions.ts';

import { createNormalizedTokenGraph } from './normalize.ts';

export function createWayglassTokenGraph() {
  return createNormalizedTokenGraph({
    tokens,
    themes: themeTokenOverrides,
    densities: densityTokenOverrides,
  });
}
