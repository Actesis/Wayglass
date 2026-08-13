import '@wayglass/tokens/tokens.css';
import '@wayglass/themes/themes.css';
import '@wayglass/elements/data-table.css';
import '@wayglass/elements/forms.css';
import './styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { NorthlineApp } from './app.js';
import { createNorthlineRouter } from './router.js';

const root = document.querySelector('#root');
if (!root) throw new Error('Northline Cold Storage root was not found.');

createRoot(root).render(
  <StrictMode>
    <NorthlineApp router={createNorthlineRouter(window)} />
  </StrictMode>,
);
