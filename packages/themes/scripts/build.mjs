import { mkdir, writeFile } from 'node:fs/promises';

import { createThemeCss } from '../dist/index.js';

await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/themes.css', import.meta.url), createThemeCss());
