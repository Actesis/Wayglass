import '../../../packages/tokens/dist/tokens.css';
import '../../../packages/themes/dist/themes.css';
import './native-adapter.css';
import { queueInvestigationFixture, queueInvestigationReplacementFixture } from './fixture.js';
import { mountNativeBaseline } from './native-adapter.js';

// This private hook exists only on the benchmark page. It gives Playwright a stable entry point
// into the production bundle without making benchmark plumbing part of any adapter contract.
Object.defineProperty(window, '__p5cBenchmark', {
  value: Object.freeze({
    fixture: queueInvestigationFixture,
    replacement: queueInvestigationReplacementFixture,
    mounts: Object.freeze({
      native: mountNativeBaseline,
    }),
  }),
});
