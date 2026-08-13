import '@wayglass/tokens/tokens.css';
import '@wayglass/themes/themes.css';
import './styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { HarborApp } from './app.js';
import { createHarborRouter } from './router.js';

const root = document.querySelector('#root');
if (!root) throw new Error('Harbor Lab root was not found.');

createRoot(root).render(
  <StrictMode>
    <HarborApp router={createHarborRouter(window)} />
  </StrictMode>,
);
