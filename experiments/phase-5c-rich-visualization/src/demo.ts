import '../../../packages/tokens/dist/tokens.css';
import '../../../packages/themes/dist/themes.css';
import './native-adapter.css';

import { mountD3Baseline } from './d3-adapter.js';
import { mountApplicationEquivalence } from './equivalence.js';
import { queueInvestigationAdaptationFixture, queueInvestigationFixture } from './fixture.js';
import { mountNativeBaseline } from './native-adapter.js';
import { mountUPlotBaseline } from './uplot-adapter.js';

const proof = document.querySelector<HTMLElement>('[data-p5c-proof]');
if (!proof) throw new Error('P5C_DEMO_ROOT: the proof root is missing.');

const parameters = new URLSearchParams(window.location.search);
const theme = parameters.get('theme');
const density = parameters.get('density');
const direction = parameters.get('dir');
if (theme === 'wayglass-dark' || theme === 'wayglass-light') {
  document.body.dataset.wgTheme = theme;
}
if (density === 'compact' || density === 'comfortable') {
  document.body.dataset.wgDensity = density;
}
if (direction === 'ltr' || direction === 'rtl') document.documentElement.dir = direction;
if (parameters.get('grayscale') === 'true') proof.style.filter = 'grayscale(1)';

const fixture =
  parameters.get('longLabels') === 'true'
    ? queueInvestigationAdaptationFixture
    : queueInvestigationFixture;
mountNativeBaseline(proof, fixture);
mountUPlotBaseline(proof, fixture);
mountD3Baseline(proof, fixture);
mountApplicationEquivalence(proof, fixture);
