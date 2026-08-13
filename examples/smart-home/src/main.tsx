import '@wayglass/tokens/tokens.css';
import '@wayglass/themes/themes.css';
import './styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { CedarHouseApp } from './app.js';
import { createDeterministicHouseholdAdapter } from './ports.js';
import { createCedarRouter } from './router.js';

const root = document.querySelector('#root');
if (!root) throw new Error('Cedar House root was not found.');

const router = createCedarRouter(window);
const scenario = router.current().scenario;
const clock = () => '2026-08-12T18:35:00-07:00';
const controls = createDeterministicHouseholdAdapter({
  clock,
  scheduler: (work) =>
    new Promise((resolve) => {
      window.setTimeout(() => resolve(work()), 350);
    }),
  porchLightOutcome: scenario === 'request-failed' ? 'failed' : 'succeeded',
  secureHouseOutcome:
    scenario === 'permission-denied'
      ? 'denied'
      : scenario === 'secure-partial'
        ? 'partial'
        : scenario === 'unavailable'
          ? 'failed'
          : 'succeeded',
});

createRoot(root).render(
  <StrictMode>
    <CedarHouseApp router={router} controls={controls} clock={clock} />
  </StrictMode>,
);
