import '@wayglass/tokens/tokens.css';
import '@wayglass/themes/themes.css';
import './styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { CedarHouseApp } from './app.js';
import { createCedarRouter } from './router.js';

const root = document.querySelector('#root');
if (!root) throw new Error('Cedar House root was not found.');

createRoot(root).render(
  <StrictMode>
    <CedarHouseApp router={createCedarRouter(window)} />
  </StrictMode>,
);
