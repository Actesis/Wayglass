import '../../../packages/tokens/dist/tokens.css';
import '../../../packages/themes/dist/themes.css';
import './native-adapter.css';

import { mountApplicationEquivalence } from './equivalence.js';
import { queueInvestigationFixture } from './fixture.js';
import { mountNativeBaseline } from './native-adapter.js';

const proof = document.querySelector<HTMLElement>('[data-p5c-proof]');
if (!proof) throw new Error('P5C_DEMO_ROOT: the proof root is missing.');

mountNativeBaseline(proof, queueInvestigationFixture);
mountApplicationEquivalence(proof, queueInvestigationFixture);
