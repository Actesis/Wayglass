import {
  densityTokenOverrides,
  themeTokenOverrides,
} from '../../../packages/themes/src/definitions.js';
import { tokens } from '../../../packages/tokens/src/definitions.js';

import { createNormalizedTokenGraph } from './normalize.js';

export function createWayglassTokenGraph() {
  return createNormalizedTokenGraph({
    tokens,
    themes: themeTokenOverrides,
    densities: densityTokenOverrides,
  });
}
