import { mkdir, writeFile } from 'node:fs/promises';

import { createCss, createJson } from '../dist/compiler.js';
import { tokens } from '../dist/definitions.js';

const outputDirectory = new URL('../dist/', import.meta.url);

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(new URL('tokens.css', outputDirectory), createCss(tokens)),
  writeFile(new URL('tokens.json', outputDirectory), createJson(tokens)),
]);
