import '@wayglass/tokens/tokens.css';
import '@wayglass/themes/themes.css';
import '@wayglass/elements/data-table.css';
import '@wayglass/elements/forms.css';
import './styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { NorthlineApp } from './app.js';
import { createDeterministicDispatchAdapter } from './ports.js';
import { createNorthlineRouter } from './router.js';

const root = document.querySelector('#root');
if (!root) throw new Error('Northline Cold Storage root was not found.');

const router = createNorthlineRouter(window);
const scenario = router.current().scenario;
const clock = () => '2026-08-12T16:49:00-07:00';
const controls = createDeterministicDispatchAdapter({
  clock,
  scheduler: (work) =>
    new Promise((resolve) => {
      window.setTimeout(() => resolve(work()), 350);
    }),
  outcome:
    scenario === 'hold-denied' || scenario === 'permission-denied'
      ? 'denied'
      : scenario === 'hold-failed' || scenario === 'request-failed'
        ? 'failed'
        : 'succeeded',
});

createRoot(root).render(
  <StrictMode>
    <NorthlineApp router={router} controls={controls} clock={clock} />
  </StrictMode>,
);
