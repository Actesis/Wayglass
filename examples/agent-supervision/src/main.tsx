import '@wayglass/tokens/tokens.css';
import '@wayglass/themes/themes.css';
import './styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { HarborApp } from './app.js';
import { createDeterministicMergeApprovalAdapter } from './ports.js';
import { createHarborRouter } from './router.js';

const root = document.querySelector('#root');
if (!root) throw new Error('Harbor Lab root was not found.');

const router = createHarborRouter(window);
const scenario = router.current().scenario;
const clock = () => '2026-08-13T14:31:00-07:00';
const constructionStartedAt = performance.now();
const controls = createDeterministicMergeApprovalAdapter({
  clock,
  scheduler: (work) =>
    new Promise((resolve) => {
      window.setTimeout(() => resolve(work()), 350);
    }),
  outcome:
    scenario === 'approval-denied' || scenario === 'permission-denied'
      ? 'denied'
      : scenario === 'approval-timeout'
        ? 'timed-out'
        : scenario === 'merge-failed' || scenario === 'request-failed'
          ? 'merge-failed'
          : 'merged',
});

createRoot(root).render(
  <StrictMode>
    <HarborApp
      router={router}
      controls={controls}
      clock={clock}
      constructionStartedAt={constructionStartedAt}
    />
  </StrictMode>,
);
