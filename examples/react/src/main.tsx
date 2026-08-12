import '@wayglass/tokens/tokens.css';
import '@wayglass/themes/themes.css';
import '@wayglass/elements/data-table.css';
import '@wayglass/elements/forms.css';
import '../../shared/operational-activity.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { OperationalActivity } from './operational-activity.js';

const root = document.querySelector('#root');

if (!root) {
  throw new Error('React example root was not found.');
}

createRoot(root).render(
  <StrictMode>
    <OperationalActivity />
  </StrictMode>,
);
